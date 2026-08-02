import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Edit, Trash2, Save, X } from "lucide-react";

import { products, type Product } from "@/lib/data";
import { AlbumImporter } from "@/components/AlbumImporter";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "MJR Imports | Admin Panel" },
      { name: "description", content: "Painel administrativo do MJR Imports para gerenciar o catálogo de produtos." },
      { property: "og:title", content: "MJR Imports | Admin Panel" },
      {
        property: "og:description",
        content: "Painel administrativo do MJR Imports para gerenciar o catálogo de produtos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Admin,
});

function Admin() {
  const [items, setItems] = useState<Product[]>(products);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Product>>({});

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setDraft({ ...product });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({});
  };

  const saveEdit = () => {
    if (!editingId) return;
    setItems((prev) =>
      prev.map((p) => (p.id === editingId ? ({ ...p, ...draft, price: Number(draft.price) || p.price } as Product) : p))
    );
    setEditingId(null);
    setDraft({});
  };

  const removeProduct = (id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-pitch text-white">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-pitch/90 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <Link to="/" className="font-display text-2xl font-black italic tracking-tighter text-brand">
            MJR IMPORTS
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/60 transition-colors hover:border-brand hover:text-brand"
          >
            <ArrowLeft className="size-3" />
            Back to Catalog
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h1 className="font-display text-5xl font-black italic tracking-tighter">Inventory Systems</h1>
            <p className="mt-2 text-sm text-white/40">Manage global stock, S3 assets and Lambda-synced catalog.</p>
          </div>
          <button className="flex items-center gap-2 rounded bg-brand px-4 py-2 text-[10px] font-black uppercase text-pitch transition-opacity hover:opacity-90">
            + Register Product
          </button>
        </div>

        <AlbumImporter />

        <div className="overflow-hidden rounded-2xl border border-white/5 bg-surface/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-white/40">SKU</th>
                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-white/40">Team / Item</th>
                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-white/40">Stock Status</th>
                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-white/40">Storage URL</th>
                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-wider text-white/40 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map((product) => {
                  const isEditing = editingId === product.id;
                  return (
                    <tr key={product.id} className={isEditing ? "bg-brand/5" : ""}>
                      <td className="px-6 py-4 font-mono text-xs text-zinc-400">
                        {isEditing ? (
                          <input
                            value={draft.sku || ""}
                            onChange={(e) => setDraft({ ...draft, sku: e.target.value })}
                            className="w-24 rounded border border-white/10 bg-pitch px-2 py-1 text-xs text-white"
                          />
                        ) : (
                          product.sku
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-200">
                        {isEditing ? (
                          <input
                            value={draft.name || ""}
                            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                            className="w-full rounded border border-white/10 bg-pitch px-2 py-1 text-xs text-white"
                          />
                        ) : (
                          product.name
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input
                            type="number"
                            value={draft.stock ?? ""}
                            onChange={(e) => setDraft({ ...draft, stock: Number(e.target.value) })}
                            className="w-20 rounded border border-white/10 bg-pitch px-2 py-1 text-xs text-white"
                          />
                        ) : (
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${product.stock < 10 ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}
                          >
                            {product.stock} in stock
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-500">
                        s3://mjr-catalog/{product.sku.toLowerCase()}.jpg
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isEditing ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={saveEdit}
                              className="rounded p-1.5 text-emerald-400 hover:bg-emerald-500/10"
                            >
                              <Save className="size-4" />
                            </button>
                            <button onClick={cancelEdit} className="rounded p-1.5 text-white/40 hover:bg-white/10">
                              <X className="size-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => startEdit(product)}
                              className="rounded p-1.5 text-zinc-400 hover:text-white hover:bg-white/10"
                            >
                              <Edit className="size-4" />
                            </button>
                            <button
                              onClick={() => removeProduct(product.id)}
                              className="rounded p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
