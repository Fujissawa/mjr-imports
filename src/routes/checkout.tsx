import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { createOrder, type OrderResponse } from "@/lib/api";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout sem login | MJR Imports" },
      { name: "description", content: "Finalize sua compra de camisas importadas sem criar conta. Pedido identificado por e-mail e numero." },
      { property: "og:title", content: "Checkout sem login | MJR Imports" },
      { property: "og:description", content: "Compre camisas de time importadas sem cadastro: informe entrega e pague em poucos passos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

const field =
  "w-full rounded-xl border border-white/10 bg-surface px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-brand";

function Checkout() {
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", cep: "", address: "", city: "", state: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderResponse | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await createOrder({
        customer: { name: form.name, email: form.email, phone: form.phone },
        shipping: { cep: form.cep, address: form.address, city: form.city, state: form.state },
        items: items.map(({ sku, name, size, price, qty }) => ({ sku, name, size, price, qty })),
        total,
      });
      setOrder(res);
      clear();
      if (res.paymentUrl) window.location.href = res.paymentUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel criar o pedido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pitch text-white">
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-brand"
        >
          <ArrowLeft className="size-3" />
          Continuar comprando
        </Link>

        <h1 className="font-display text-5xl font-black italic uppercase tracking-tighter">Checkout</h1>
        <p className="mt-2 text-sm text-white/40">Sem cadastro. Seu pedido e identificado por e-mail + numero do pedido.</p>

        {order ? (
          <div className="mt-10 rounded-2xl border border-brand/30 bg-brand/5 p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand">Pedido criado</p>
            <p className="mt-3 font-display text-3xl font-black italic">{order.orderId}</p>
            <p className="mt-2 text-sm text-white/50">
              Status: {order.status}. Guarde este numero para acompanhar seu pedido.
            </p>
            <button
              onClick={() => navigate({ to: "/" })}
              className="mt-6 rounded-xl bg-brand px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-pitch"
            >
              Voltar ao catalogo
            </button>
          </div>
        ) : items.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-white/5 bg-surface p-8 text-sm text-white/50">
            Sua sacola esta vazia. Escolha uma peca no catalogo para continuar.
          </p>
        ) : (
          <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
            <form onSubmit={submit} className="space-y-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Seus dados</h2>
              <input required value={form.name} onChange={set("name")} placeholder="Nome completo" className={field} />
              <div className="grid gap-4 sm:grid-cols-2">
                <input required type="email" value={form.email} onChange={set("email")} placeholder="E-mail" className={field} />
                <input required value={form.phone} onChange={set("phone")} placeholder="Telefone / WhatsApp" className={field} />
              </div>
              <h2 className="pt-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Entrega</h2>
              <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
                <input required value={form.cep} onChange={set("cep")} placeholder="CEP" className={field} />
                <input required value={form.address} onChange={set("address")} placeholder="Endereco e numero" className={field} />
              </div>
              <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
                <input required value={form.city} onChange={set("city")} placeholder="Cidade" className={field} />
                <input required value={form.state} onChange={set("state")} placeholder="UF" className={field} />
              </div>

              {error && (
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-4 text-[10px] font-black uppercase tracking-[0.2em] text-pitch transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                {loading && <Loader2 className="size-3 animate-spin" />}
                {loading ? "Enviando pedido" : `Pagar R$ ${total}`}
              </button>
            </form>

            <aside className="h-fit rounded-2xl border border-white/5 bg-surface p-6">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Resumo</h2>
              <ul className="mt-4 space-y-3">
                {items.map((i) => (
                  <li key={`${i.id}-${i.size}`} className="flex justify-between gap-4 text-xs">
                    <span className="text-white/70">
                      {i.qty}x {i.name} <span className="text-white/30">({i.size})</span>
                    </span>
                    <span className="font-bold text-white">R$ {i.price * i.qty}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Total</span>
                <span className="font-display text-2xl font-black italic text-brand">R$ {total}</span>
              </div>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
