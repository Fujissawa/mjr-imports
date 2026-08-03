// Lambda opcional: GET /catalog -> lista produtos lendo os prefixos do S3
// Runtime: nodejs20.x | Handler: list-catalog.handler
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const s3 = new S3Client({});
const BUCKET = process.env.CATALOG_BUCKET; // mjrcatalog
const CDN = process.env.CDN_DOMAIN;        // dxxxx.cloudfront.net
const ORIGIN = process.env.ALLOWED_ORIGIN || "https://mjrimports.com";

export const handler = async () => {
  const out = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET, Prefix: "produtos/" }));
  const bySlug = new Map();
  for (const obj of out.Contents ?? []) {
    const [, slug, file] = obj.Key.split("/");
    if (!slug || !file) continue;
    const list = bySlug.get(slug) ?? [];
    list.push(`https://${CDN}/${obj.Key}`);
    bySlug.set(slug, list);
  }
  const products = [...bySlug].map(([slug, images]) => ({ slug, images: images.sort() }));
  return {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin": ORIGIN, "Content-Type": "application/json", "Cache-Control": "max-age=300" },
    body: JSON.stringify({ products }),
  };
};
