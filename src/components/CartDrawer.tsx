import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";

import { itemKey, useCart } from "@/lib/cart";

export function CartDrawer() {
  const { items, total, open, setOpen, setQty, remove } = useCart();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <aside className="relative flex h-full w-full max-w-md flex-col border-l border-white/10 bg-pitch">
        <header className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <h2 className="font-display text-xl font-black italic uppercase tracking-tighter text-white">Sacola</h2>
          <button onClick={() => setOpen(false)} aria-label="Fechar sacola" className="text-white/50 hover:text-brand">
            <X className="size-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-white/40">
              <ShoppingBag className="size-8" />
              <p className="text-xs uppercase tracking-widest">Sua sacola esta vazia</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((i) => {
                const key = itemKey(i);
                return (
                  <li key={key} className="flex gap-4 rounded-xl border border-white/5 bg-surface p-3">
                    <img src={i.image} alt={i.name} className="size-20 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">{i.name}</p>
                      <p className="mt-0.5 text-[10px] uppercase tracking-widest text-white/40">
                        Tam. {i.size} · {i.sku}
                      </p>
                      <p className="mt-1 text-sm font-black italic text-brand">R$ {i.price * i.qty}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => setQty(key, i.qty - 1)}
                          aria-label="Diminuir quantidade"
                          className="rounded bg-white/5 p-1 text-white/70 hover:bg-white/10"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-white">{i.qty}</span>
                        <button
                          onClick={() => setQty(key, i.qty + 1)}
                          aria-label="Aumentar quantidade"
                          className="rounded bg-white/5 p-1 text-white/70 hover:bg-white/10"
                        >
                          <Plus className="size-3" />
                        </button>
                        <button
                          onClick={() => remove(key)}
                          className="ml-auto text-[10px] uppercase tracking-widest text-white/30 hover:text-red-400"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <footer className="border-t border-white/10 px-6 py-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Total</span>
            <span className="font-display text-2xl font-black italic text-brand">R$ {total}</span>
          </div>
          <Link
            to="/checkout"
            onClick={() => setOpen(false)}
            className={`mt-4 block rounded-xl bg-brand py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-pitch transition-opacity hover:opacity-90 ${
              items.length === 0 ? "pointer-events-none opacity-40" : ""
            }`}
          >
            Finalizar compra sem login
          </Link>
        </footer>
      </aside>
    </div>
  );
}
