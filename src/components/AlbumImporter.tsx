import { useServerFn } from "@tanstack/react-start";
import { Copy, Download, Loader2 } from "lucide-react";
import { useState } from "react";

import { importAlbum } from "@/lib/import.functions";

type Result = { title: string; uploaded: string[]; failed: string[]; sourceCount: number };

export function AlbumImporter() {
  const run = useServerFn(importAlbum);
  const [url, setUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const snippet = result
    ? `{
  id: "${slug}",
  sku: "${slug.toUpperCase()}",
  name: "${result.title.replace(/"/g, "'")}",
  team: "",
  league: "Premier League",
  season: "2024 / 2025",
  version: "Fan",
  size: ["S", "M", "L", "XL"],
  price: 299,
  image: "${result.uploaded[0] ?? ""}",
  images: [
${result.uploaded.map((u) => `    "${u}",`).join("\n")}
  ],
  badge: "New Drop",
  description: "",
  stock: 10,
},`
    : "";

  const handleImport = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = (await run({ data: { url, slug } })) as Result;
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao importar o álbum.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mb-10 rounded-2xl border border-white/5 bg-surface/50 p-6">
      <h2 className="font-display text-2xl font-black italic tracking-tighter">Importar álbum → S3</h2>
      <p className="mt-1 text-sm text-white/40">
        Cole o link do álbum da peça. As fotos são baixadas, enviadas para o bucket e você copia o bloco pronto para{" "}
        <span className="font-mono text-white/60">src/lib/data.ts</span>.
      </p>

      <div className="mt-5 grid gap-3 md:grid-cols-[2fr_1fr_auto]">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://xxx.x.yupoo.com/albums/123456"
          className="rounded border border-white/10 bg-pitch px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-brand"
        />
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="arsenal-24-home"
          className="rounded border border-white/10 bg-pitch px-4 py-3 font-mono text-sm text-white outline-none placeholder:text-white/25 focus:border-brand"
        />
        <button
          onClick={handleImport}
          disabled={loading || !url || !slug}
          className="flex items-center justify-center gap-2 rounded bg-brand px-6 py-3 text-[10px] font-black uppercase tracking-widest text-pitch transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {loading ? <Loader2 className="size-3 animate-spin" /> : <Download className="size-3" />}
          {loading ? "Importando" : "Importar"}
        </button>
      </div>

      {error && <p className="mt-4 rounded border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">{error}</p>}

      {result && (
        <div className="mt-6">
          <p className="text-xs text-white/50">
            {result.uploaded.length} de {result.sourceCount} imagens enviadas para o S3
            {result.failed.length > 0 ? ` · ${result.failed.length} falharam` : ""}
          </p>

          {result.uploaded.length > 0 && (
            <>
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {result.uploaded.map((src) => (
                  <img key={src} src={src} alt="Foto importada" className="size-24 shrink-0 rounded object-cover" />
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Bloco do produto</span>
                <button
                  onClick={() => navigator.clipboard.writeText(snippet)}
                  className="flex items-center gap-2 rounded border border-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/60 hover:border-brand hover:text-brand"
                >
                  <Copy className="size-3" />
                  Copiar
                </button>
              </div>
              <pre className="mt-2 max-h-64 overflow-auto rounded border border-white/10 bg-pitch p-4 font-mono text-[11px] leading-relaxed text-zinc-300">
                {snippet}
              </pre>
            </>
          )}
        </div>
      )}
    </section>
  );
}
