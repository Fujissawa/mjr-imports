import { leagues, seasons, sizes, versions } from "@/lib/data";

export type FilterState = {
  league: string;
  season: string;
  size: string;
  version: string;
  priceRange: [number, number];
};

export const defaultFilters: FilterState = {
  league: "All",
  season: "All Seasons",
  size: "",
  version: "All",
  priceRange: [150, 600],
};

export function Filters({
  filters,
  onChange,
  resultCount,
}: {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}) {
  const update = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch });

  return (
    <aside className="w-full shrink-0 lg:w-72">
      <div className="sticky top-24 space-y-10">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-xs font-black uppercase tracking-widest">Filters</h2>
          <button
            onClick={() => onChange(defaultFilters)}
            className="text-[10px] font-black uppercase text-brand hover:underline"
          >
            Reset All
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-brand">League / Category</h3>
          <div className="space-y-3">
            {leagues.map((league) => {
              const active = filters.league === league;
              return (
                <label
                  key={league}
                  className="group flex cursor-pointer items-center justify-between"
                  onClick={() => update({ league })}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex size-4 items-center justify-center border ${active ? "border-brand bg-brand" : "border-white/20 bg-surface"}`}
                    >
                      {active && <div className="size-1.5 bg-pitch" />}
                    </div>
                    <span
                      className={`text-xs font-medium uppercase tracking-wide ${active ? "text-white" : "text-white/60 group-hover:text-white"}`}
                    >
                      {league}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-white/30 group-hover:text-brand">
                    {league === "All" ? "" : league === "Premier League" ? "12" : league === "La Liga" ? "08" : "24"}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-brand">Season</h3>
          <select
            value={filters.season}
            onChange={(e) => update({ season: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-surface px-3 py-3 text-[10px] font-black uppercase tracking-widest text-white focus:border-brand focus:outline-none"
          >
            {seasons.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-brand">Size Selection</h3>
          <div className="grid grid-cols-4 gap-2">
            {sizes.map((size) => {
              const active = filters.size === size;
              return (
                <button
                  key={size}
                  onClick={() => update({ size: active ? "" : size })}
                  className={`h-10 rounded text-xs font-bold transition-colors ${active ? "border border-brand bg-brand/10 text-brand" : "border border-white/10 hover:border-brand"}`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-brand">Price Range</h3>
            <span className="text-[10px] font-black">
              R$ {filters.priceRange[0]} - R$ {filters.priceRange[1]}
            </span>
          </div>
          <div className="relative h-1 rounded-full bg-white/10">
            <div
              className="absolute h-full rounded-full bg-brand"
              style={{
                left: `${((filters.priceRange[0] - 150) / (600 - 150)) * 100}%`,
                right: `${100 - ((filters.priceRange[1] - 150) / (600 - 150)) * 100}%`,
              }}
            />
            <input
              type="range"
              min={150}
              max={600}
              value={filters.priceRange[0]}
              onChange={(e) =>
                update({
                  priceRange: [Math.min(Number(e.target.value), filters.priceRange[1] - 10), filters.priceRange[1]],
                })
              }
              className="absolute inset-0 w-full cursor-pointer opacity-0"
            />
            <input
              type="range"
              min={150}
              max={600}
              value={filters.priceRange[1]}
              onChange={(e) =>
                update({
                  priceRange: [filters.priceRange[0], Math.max(Number(e.target.value), filters.priceRange[0] + 10)],
                })
              }
              className="absolute inset-0 w-full cursor-pointer opacity-0"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-brand">Kit Version</h3>
          <div className="flex flex-col gap-2">
            {versions.map((version) => {
              const active = filters.version === version;
              return (
                <button
                  key={version}
                  onClick={() => update({ version })}
                  className={`w-full rounded px-3 py-2 text-left text-[10px] font-black uppercase tracking-widest transition-colors ${active ? "border border-brand/50 bg-brand/5 text-brand" : "border border-white/5 bg-white/5 hover:bg-white/10"}`}
                >
                  {version === "All" ? "All Versions" : `${version} Version`}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
