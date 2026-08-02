export type Product = {
  id: string;
  sku: string;
  name: string;
  team: string;
  league: string;
  season: string;
  version: "Player" | "Fan" | "Limited" | "Retro";
  size: string[];
  price: number;
  image: string;
  badge: "In Stock" | "New Drop" | "Retro Archive" | "Restock" | "Limited";
  description: string;
  stock: number;
};

export const products: Product[] = [
  {
    id: "1",
    sku: "ARS-24-HOME",
    name: "Arsenal 24/25 Home",
    team: "Arsenal FC",
    league: "Premier League",
    season: "2024 / 2025",
    version: "Player",
    size: ["S", "M", "L", "XL"],
    price: 349,
    image: "/src/assets/arsenal.jpg",
    badge: "In Stock",
    description: "Player Edition / Slim Fit",
    stock: 24,
  },
  {
    id: "2",
    sku: "BRA-98-HOME",
    name: "Brazil 1998 Final",
    team: "Brazil National Team",
    league: "National Teams",
    season: "Retro Archives",
    version: "Fan",
    size: ["M", "L", "XL", "2XL"],
    price: 299,
    image: "/src/assets/brazil98.jpg",
    badge: "Retro Archive",
    description: "Classic Fan Jersey",
    stock: 12,
  },
  {
    id: "3",
    sku: "MAD-24-THIRD",
    name: "Madrid 24/25 Third",
    team: "Real Madrid CF",
    league: "La Liga",
    season: "2024 / 2025",
    version: "Limited",
    size: ["S", "M", "L"],
    price: 389,
    image: "/src/assets/madrid.jpg",
    badge: "New Drop",
    description: "Authentic Player Version",
    stock: 8,
  },
];

export const leagues = ["All", "Premier League", "La Liga", "National Teams", "Serie A", "Bundesliga"];
export const seasons = ["All Seasons", "2024 / 2025", "2023 / 2024", "Retro Archives"];
export const sizes = ["S", "M", "L", "XL", "2XL"];
export const versions = ["All", "Player", "Fan", "Limited", "Retro"];
