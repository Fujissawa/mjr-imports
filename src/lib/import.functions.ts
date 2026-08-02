import { createServerFn } from "@tanstack/react-start";

const GATEWAY = "https://connector-gateway.lovable.dev";
const BUCKET = "mjrcatalog";
const REGION = "us-east-1";

type ImportInput = { url: string; slug: string; limit?: number };

function extractImageUrls(html: string, links: string[]): string[] {
  const found = new Set<string>();
  const rx = /https?:\/\/[^\s"'<>\\)]+?\.(?:jpg|jpeg|png|webp)/gi;
  for (const m of html.match(rx) ?? []) found.add(m);
  for (const l of links) if (/\.(jpg|jpeg|png|webp)$/i.test(l)) found.add(l);

  return [...found]
    .map((u) => u.replace(/\/(small|thumb|square)\.(jpg|jpeg|png|webp)$/i, "/big.$2"))
    .filter((u) => !/logo|avatar|icon|placeholder|blank/i.test(u))
    .filter((v, i, a) => a.indexOf(v) === i);
}

export const importAlbum = createServerFn({ method: "POST" })
  .inputValidator((data: ImportInput) => data)
  .handler(async ({ data }) => {
    const lovableKey = process.env["LOVABLE_API_KEY"];
    const firecrawlKey = process.env["FIRECRAWL_API_KEY"];
    const s3Key = process.env["AWS_S3_API_KEY"];
    if (!lovableKey || !firecrawlKey || !s3Key) {
      throw new Error("Conectores nao configurados (Firecrawl / AWS S3).");
    }

    const slug = data.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "");
    if (!slug) throw new Error("Informe um identificador (slug) para o produto.");

    const scrapeRes = await fetch(`${GATEWAY}/firecrawl/v2/scrape`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": firecrawlKey,
      },
      body: JSON.stringify({ url: data.url, formats: ["html", "links"], onlyMainContent: false, waitFor: 2500 }),
    });
    if (!scrapeRes.ok) {
      throw new Error(`Firecrawl falhou [${scrapeRes.status}]: ${await scrapeRes.text()}`);
    }
    const scraped = (await scrapeRes.json()) as {
      html?: string;
      links?: string[];
      metadata?: { title?: string };
      data?: { html?: string; links?: string[]; metadata?: { title?: string } };
    };
    const html = scraped.html ?? scraped.data?.html ?? "";
    const links = scraped.links ?? scraped.data?.links ?? [];
    const title = scraped.metadata?.title ?? scraped.data?.metadata?.title ?? slug;

    const imageUrls = extractImageUrls(html, links).slice(0, data.limit ?? 12);
    const uploaded: string[] = [];
    const failed: string[] = [];

    for (const [index, imageUrl] of imageUrls.entries()) {
      try {
        const imgRes = await fetch(imageUrl, {
          headers: {
            Referer: data.url,
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
          },
        });
        if (!imgRes.ok) {
          failed.push(imageUrl);
          continue;
        }
        const bytes = await imgRes.arrayBuffer();
        const contentType = imgRes.headers.get("Content-Type") ?? "image/jpeg";
        const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
        const objectKey = `produtos/${slug}/${index + 1}.${ext}`;

        const signRes = await fetch(`${GATEWAY}/api/v1/sign_storage_url?provider=aws_s3&mode=write`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${lovableKey}`,
            "X-Connection-Api-Key": s3Key,
          },
          body: JSON.stringify({ object_path: objectKey }),
        });
        if (!signRes.ok) {
          failed.push(imageUrl);
          continue;
        }
        const { url: uploadUrl } = (await signRes.json()) as { url: string };

        const putRes = await fetch(uploadUrl, { method: "PUT", body: bytes, headers: { "Content-Type": contentType } });
        if (!putRes.ok) {
          failed.push(imageUrl);
          continue;
        }

        uploaded.push(`https://${BUCKET}.s3.${REGION}.amazonaws.com/${objectKey}`);
      } catch {
        failed.push(imageUrl);
      }
    }

    return { title, uploaded, failed, sourceCount: imageUrls.length };
  });
