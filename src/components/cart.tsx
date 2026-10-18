"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLang } from "@/i18n/context";
import { useT } from "@/i18n/context";

export type CartLine = {
  productId: number;
  variantId: number;
  title: string;
  size: string;
  price: number;
  image: string;
  max: number;
  qty: number;
};
type CartView = { lines: CartLine[]; count: number; total: number; notices: string[] };
type Result = { ok: boolean; message?: string };

type Ctx = CartView & {
  ready: boolean;
  add: (productId: number, variantId: number, qty?: number) => Promise<Result>;
  setQty: (variantId: number, qty: number) => Promise<void>;
  remove: (variantId: number) => Promise<void>;
  refresh: () => Promise<void>;
  dismissNotices: () => void;
};

const EMPTY: CartView = { lines: [], count: 0, total: 0, notices: [] };
const CartCtx = createContext<Ctx | null>(null);

const totals = (lines: CartLine[]) => ({
  lines,
  count: lines.reduce((s, l) => s + l.qty, 0),
  total: lines.reduce((s, l) => s + l.qty * l.price, 0),
});

/** Кошик живе на сервері (cookie st_cart, /api/cart). Тут лише дзеркало з оптимістичними оновленнями. */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const lang = useLang();
  const t = useT();
  const [cart, setCart] = useState<CartView>(EMPTY);
  const [ready, setReady] = useState(false);

  const call = useCallback(async (init?: RequestInit, qs = ""): Promise<Result & { cart?: CartView }> => {
    try {
      const res = await fetch(`/api/cart${qs}`, { cache: "no-store", ...init, headers: { "Content-Type": "application/json", "x-lang": lang, ...init?.headers } });
      const data = await res.json();
      if (!res.ok) return { ok: false, message: data.message ?? t.checkout.err };
      return { ok: true, cart: data as CartView };
    } catch {
      return { ok: false, message: t.checkout.noNet };
    }
  }, [lang, t]);

  const refresh = useCallback(async () => {
    const r = await call();
    if (r.cart) setCart(r.cart);
    setReady(true);
  }, [call]);

  useEffect(() => {
    let alive = true;
    call().then((r) => {
      if (!alive) return;
      if (r.cart) setCart(r.cart);
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, [call]);

  const add = useCallback<Ctx["add"]>(
    async (productId, variantId, qty = 1) => {
      const r = await call({ method: "POST", body: JSON.stringify({ productId, variantId, qty }) });
      if (r.cart) setCart(r.cart);
      return { ok: r.ok, message: r.message ?? r.cart?.notices[0] };
    },
    [call],
  );

  const setQty = useCallback<Ctx["setQty"]>(
    async (variantId, qty) => {
      setCart((c) => ({ ...c, ...totals(c.lines.map((l) => (l.variantId === variantId ? { ...l, qty: Math.max(1, Math.min(l.max, qty)) } : l))) }));
      const r = await call({ method: "PATCH", body: JSON.stringify({ variantId, qty }) });
      if (r.cart) setCart(r.cart);
    },
    [call],
  );

  const remove = useCallback<Ctx["remove"]>(
    async (variantId) => {
      setCart((c) => ({ ...c, ...totals(c.lines.filter((l) => l.variantId !== variantId)) }));
      const r = await call({ method: "DELETE" }, `?variantId=${variantId}`);
      if (r.cart) setCart(r.cart);
    },
    [call],
  );

  const dismissNotices = useCallback(() => setCart((c) => ({ ...c, notices: [] })), []);

  const value = useMemo<Ctx>(() => ({ ...cart, ready, add, setQty, remove, refresh, dismissNotices }), [cart, ready, add, setQty, remove, refresh, dismissNotices]);
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const c = useContext(CartCtx);
  if (!c) throw new Error("useCart поза CartProvider");
  return c;
}
