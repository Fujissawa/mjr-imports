import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { products } from "@/lib/data";

export const Route = createFileRoute("/produto/$id")({
  loader: ({ params }) => {
    const product = products.find((p) => p.id === params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Produto não encontrado | MJR Imports" }, { name: "robots", content: "noindex" }] };
    }
    const { product } = loaderData;
    const title = `${product.name} | MJR Imports`;
    const description = `${product.name} — ${product.description}. ${product.league}, temporada ${product.season}. R$ ${product.price}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductDetail,
});

function ProductDetail() {
  const { product } = Route.useLoaderData();
  const gallery = product.images.length ? product.images : [product.image];
  const [active, setActive] = useState(0);
  const [size, setSize] = useState(product.size[0]);

  return (
    <div className="min-h-screen bg-pitch text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 transition-colors hover:text-brand"
        >
          <ArrowLeft className="size-3" />
          Voltar ao catálogo
        </Link>

        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-white/5 bg-surface">
              <img
                src={gallery[active]}
                alt={`${product.name} — imagem ${active + 1}`}
                width={1000}
                height={1250}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="mt-4 flex gap-3">
              {gallery.map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => setActive(i)}
                  aria-label={`Ver imagem ${i + 1}`}
                  className={`aspect-square w-20 overflow-hidden rounded-xl border transition-colors ${
                    i === active ? "border-brand" : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand">{product.league}</p>
            <h1 className="mt-3 font-display text-5xl font-black italic uppercase tracking-tighter">{product.name}</h1>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-white/40">{product.description}</p>
            <p className="mt-6 text-4xl font-black italic text-brand">R$ {product.price}</p>

            <div className="mt-8">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Tamanho</p>
              <div className="flex flex-wrap gap-2">
                {product.size.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`rounded-xl px-4 py-2 text-xs font-black uppercase transition-colors ${
                      s === size ? "bg-brand text-pitch" : "bg-white/5 text-white hover:bg-white/10"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <dl className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border border-white/5 bg-surface p-5 text-xs">
              <div>
                <dt className="text-white/40 uppercase tracking-widest text-[10px]">SKU</dt>
                <dd className="mt-1 font-mono">{product.sku}</dd>
              </div>
              <div>
                <dt className="text-white/40 uppercase tracking-widest text-[10px]">Temporada</dt>
                <dd className="mt-1">{product.season}</dd>
              </div>
              <div>
                <dt className="text-white/40 uppercase tracking-widest text-[10px]">Versão</dt>
                <dd className="mt-1">{product.version}</dd>
              </div>
              <div>
                <dt className="text-white/40 uppercase tracking-widest text-[10px]">Estoque</dt>
                <dd className="mt-1">{product.stock} un.</dd>
              </div>
            </dl>

            <button className="mt-8 w-full rounded-xl bg-brand py-4 text-[10px] font-black uppercase tracking-[0.2em] text-pitch transition-opacity hover:opacity-90">
              Add to Cart
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
