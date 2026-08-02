import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { Footer } from "@/components/Footer";
import { Filters, defaultFilters, type FilterState } from "@/components/Filters";
import { products } from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MJR Imports | Catálogo de Roupas de Times" },
      {
        name: "description",
        content:
          "Catálogo premium de camisas, jaquetas e acessórios de times. Filtre por liga, temporada, tamanho e versão.",
      },
      { property: "og:title", content: "MJR Imports | Catálogo de Roupas de Times" },
      {
        property: "og:description",
        content:
          "Catálogo premium de camisas, jaquetas e acessórios de times. Filtre por liga, temporada, tamanho e versão.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (filters.league !== "All" && p.league !== filters.league) return false;
      if (filters.season !== "All Seasons" && p.season !== filters.season) return false;
      if (filters.size && !p.size.includes(filters.size)) return false;
      if (filters.version !== "All" && p.version !== filters.version) return false;
      if (p.price < filters.priceRange[0] || p.price > filters.priceRange[1]) return false;
      return true;
    });
  }, [filters]);

  const activeTags = [
    filters.league !== "All" ? filters.league : null,
    filters.season !== "All Seasons" ? filters.season : null,
    filters.size ? `Size ${filters.size}` : null,
    filters.version !== "All" ? filters.version : null,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-pitch text-white">
      <Navbar />
      <Hero />

      <main className="flex flex-col gap-12 px-6 py-12 lg:flex-row">
        <Filters filters={filters} onChange={setFilters} />

        <section className="flex-1">
          <div className="mb-8 flex flex-wrap items-center gap-2">
            {activeTags.map((tag) => (
              <div
                key={tag}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-surface px-3 py-1.5"
              >
                <span className="text-[10px] font-black uppercase tracking-tighter">{tag}</span>
                <span
                  className="cursor-pointer text-white/40 hover:text-brand"
                  onClick={() => {
                    if (tag === filters.league) setFilters({ ...filters, league: "All" });
                    else if (tag === filters.season) setFilters({ ...filters, season: "All Seasons" });
                    else if (tag === `Size ${filters.size}`) setFilters({ ...filters, size: "" });
                    else if (tag === filters.version) setFilters({ ...filters, version: "All" });
                  }}
                >
                  &times;
                </span>
              </div>
            ))}
            <span className="ml-2 text-[10px] font-black uppercase text-white/30">
              {filtered.length} Results Found
            </span>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-white/10 bg-surface">
              <p className="text-sm font-bold uppercase tracking-widest text-white/40">No products found</p>
              <p className="mt-2 text-xs text-white/30">Try adjusting your filters</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
