import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  id: string;
  sku: string;
  name: string;
  size: string;
  price: number;
  image: string;
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
};

const STORAGE_KEY = "mjr-cart-v1";
const CartContext = createContext<CartContextValue | null>(null);

export const itemKey = (i: Pick<CartItem, "id" | "size">) => `${i.id}::${i.size}`;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* carrinho corrompido */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage indisponivel */
    }
  }, [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((sum, i) => sum + i.qty, 0),
      total: items.reduce((sum, i) => sum + i.qty * i.price, 0),
      open,
      setOpen,
      add: (item, qty = 1) =>
        setItems((prev) => {
          const key = itemKey(item);
          const found = prev.find((i) => itemKey(i) === key);
          if (found) return prev.map((i) => (itemKey(i) === key ? { ...i, qty: i.qty + qty } : i));
          return [...prev, { ...item, qty }];
        }),
      remove: (key) => setItems((prev) => prev.filter((i) => itemKey(i) !== key)),
      setQty: (key, qty) =>
        setItems((prev) =>
          qty <= 0
            ? prev.filter((i) => itemKey(i) !== key)
            : prev.map((i) => (itemKey(i) === key ? { ...i, qty } : i)),
        ),
      clear: () => setItems([]),
    }),
    [items, open],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de <CartProvider>");
  return ctx;
}
