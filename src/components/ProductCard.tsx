import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/lib/data";

const badgeStyles: Record<Product["badge"], string> = {
  "In Stock": "bg-brand text-pitch",
  "New Drop": "bg-brand text-pitch",
  Restock: "bg-primary text-primary-foreground",
  Limited: "bg-white/10 text-white",
  "Retro Archive": "bg-white/10 text-white",
};

export function ProductCard({ product }: { product: Product }) {
  const gallery = product.images.length ? product.images : [product.image];
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const go = (dir: number) => setActive((i) => (i + dir + gallery.length) % gallery.length);

  return (
    <div className="group rounded-2xl border border-white/5 bg-surface p-4 transition-all hover:border-brand/50">
      <button
        type="button"
        onClick={() => {
          setActive(0);
          setOpen(true);
        }}
        aria-label={`Ver fotos de ${product.name}`}
        className="relative mb-4 block w-full aspect-[4/5] overflow-hidden rounded-xl"
      >
        <img
          src={product.image}
          alt={product.name}
          width={800}
          height={1000}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-tighter ${badgeStyles[product.badge]}`}
        >
          {product.badge}
        </div>
        {gallery.length > 1 && (
          <div className="absolute bottom-3 right-3 rounded-full bg-pitch/80 px-2 py-1 text-[10px] font-black text-white">
            +{gallery.length - 1}
          </div>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-pitch/95 p-4"
          onClick={() => setOpen(false)}
        >
          <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-lg font-black italic uppercase tracking-tight text-white">
                {product.name}
              </p>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fechar"
                className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="relative aspect-[4/5] max-h-[65vh] overflow-hidden rounded-2xl border border-white/10 bg-surface">
              <img
                src={gallery[active]}
                alt={`${product.name} — foto ${active + 1}`}
                className="h-full w-full object-contain"
              />
              {gallery.length > 1 && (
                <>
                  <button
                    onClick={() => go(-1)}
                    aria-label="Foto anterior"
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-pitch/70 p-2 text-white hover:bg-brand hover:text-pitch"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button
                    onClick={() => go(1)}
                    aria-label="Próxima foto"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-pitch/70 p-2 text-white hover:bg-brand hover:text-pitch"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                </>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {gallery.map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => setActive(i)}
                  aria-label={`Ver foto ${i + 1}`}
                  className={`aspect-square w-16 overflow-hidden rounded-lg border transition-colors ${
                    i === active ? "border-brand" : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>

            <Link
              to="/produto/$id"
              params={{ id: product.id }}
              className="mt-4 block rounded-xl bg-brand py-3 text-center text-[10px] font-black uppercase tracking-[0.2em] text-pitch"
            >
              Ver página do produto
            </Link>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-display text-xl font-black italic uppercase tracking-tight">
            <Link to="/produto/$id" params={{ id: product.id }} className="hover:text-brand">
              {product.name}
            </Link>
          </h4>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
            {product.description}
          </p>
        </div>
        <span className="text-lg font-black italic text-brand">R$ {product.price}</span>
      </div>
      <button className="mt-6 w-full rounded-xl bg-white/5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-brand hover:text-pitch">
        Add to Cart
      </button>
    </div>
  );
}
