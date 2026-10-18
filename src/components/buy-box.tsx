"use client";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "./cart";
import { AddToCartMorph } from "./add-to-cart-morph";
import type { Product } from "@/lib/types";

export function BuyBox({ p }: { p: Product }) {
  const { add } = useCart();
  const firstFree = p.variants.find((v) => v.stock > 0)?.id ?? null;
  const [sel, setSel] = useState<number | null>(p.variants.length === 1 ? firstFree : null);
  const [err, setErr] = useState(false);
  const v = p.variants.find((x) => x.id === sel);

  if (!p.inStock) {
    return (
      <div className="stitch p-5">
        <p className="text-sm font-semibold">Немає в наявності</p>
        <p className="mt-1 text-sm text-mute">Зазирніть пізніше або оберіть схожий товар у каталозі.</p>
      </div>
    );
  }

  return (
    <div>
      <fieldset>
        <legend className="mb-3 font-mono text-xs uppercase tracking-widest">Розмір</legend>
        <div className="flex flex-wrap gap-2">
          {p.variants.map((x) => {
            const out = x.stock <= 0;
            const active = sel === x.id;
            return (
              <button
                key={x.id}
                type="button"
                disabled={out}
                aria-pressed={active}
                onClick={() => { setSel(x.id); setErr(false); }}
                className={`num relative min-h-11 min-w-12 border px-3 text-sm ${active ? "border-ink bg-ink text-paper" : "border-ink hover:bg-soft"} ${out ? "cursor-not-allowed border-dashed text-mute line-through opacity-50 hover:bg-transparent" : ""}`}
              >
                {x.title}
              </button>
            );
          })}
        </div>
        <p role="status" className={`mt-3 text-sm ${err ? "text-danger" : "text-mute"}`}>
          {err ? "Оберіть розмір" : v ? (v.stock <= 2 ? `Залишилось ${v.stock} шт.` : "В наявності") : " "}
        </p>
      </fieldset>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-start">
        <AddToCartMorph
          className="flex-1"
          onAdd={async () => {
            if (!v) { setErr(true); return { ok: false, message: "" }; }
            return add(p.id, v.id, 1);
          }}
          label="Додати в кошик"
        />
        <Link href="/cart" className="btn btn-ghost">Кошик</Link>
      </div>
    </div>
  );
}
