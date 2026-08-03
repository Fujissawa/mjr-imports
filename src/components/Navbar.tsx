import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";

import { useCart } from "@/lib/cart";

export function Navbar() {
  const { count, setOpen } = useCart();
  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-pitch/90 px-6 py-4 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="font-display text-2xl font-black italic tracking-tighter text-brand">
            MJR IMPORTS
          </Link>
          <div className="hidden gap-6 text-xs font-bold uppercase tracking-widest text-white/60 md:flex">
            <Link to="/" className="text-white transition-colors hover:text-brand">
              Shop All
            </Link>
            <span className="cursor-pointer transition-colors hover:text-brand">Retro Drops</span>
            <span className="cursor-pointer transition-colors hover:text-brand">Clubs</span>
            <span className="cursor-pointer transition-colors hover:text-brand">National</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/admin"
            className="rounded-full border border-brand/30 px-4 py-1.5 text-[10px] font-bold uppercase text-brand transition-all hover:bg-brand hover:text-pitch"
          >
            Admin Panel
          </Link>
          <button
            onClick={() => setOpen(true)}
            aria-label="Abrir sacola"
            className="relative flex size-10 items-center justify-center rounded-full border border-white/10 bg-surface font-black italic text-white transition-colors hover:border-brand hover:text-brand"
          >
            <ShoppingBag className="size-4" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-brand text-[10px] font-black not-italic text-pitch">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
