import { Link } from "@tanstack/react-router";
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

  return (
    <div className="group rounded-2xl border border-white/5 bg-surface p-4 transition-all hover:border-brand/50">
      <Link
        to="/produto/$id"
        params={{ id: product.id }}
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
      </Link>

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
