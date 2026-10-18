"use client";
import { useState } from "react";
import Link from "./loc-link";
import { useCart } from "./cart";
import { useLang, useT } from "@/i18n/context";
import { tr } from "@/i18n/glossary";
import { AddToCartMorph } from "./add-to-cart-morph";
import type { Product } from "@/lib/types";

export function BuyBox({ p }: { p: Product }) {
  const { add } = useCart();
  const t = useT();
  const lang = useLang();
  const firstFree = p.variants.find((v) => v.stock > 0)?.id ?? null;
  const [sel, setSel] = useState<number | null>(p.variants.length === 1 ? firstFree : null);
  const [err, setErr] = useState(false);
  const v = p.variants.find((x) => x.id === sel);

  if (!p.inStock) {
    return (
      <div className="stitch p-5">
        <p className="text-sm font-semibold">{t.buy.out}</p>
        <p className="mt-1 text-sm text-mute">{t.buy.outHint}</p>
      </div>
    );
  }

  return (
    <div>
      <fieldset>
        <legend className="mb-3 font-mono text-xs uppercase tracking-widest">{t.card.size}</legend>
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
                {tr(x.title, lang)}
              </button>
            );
          })}
        </div>
        <p role="status" className={`mt-3 text-sm ${err ? "text-danger" : "text-mute"}`}>
          {err ? t.card.pickSize : v ? (v.stock <= 2 ? t.buy.left(v.stock) : t.buy.available) : "\u00a0"}
        </p>
      </fieldset>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-start">
        <AddToCartMorph
          className="flex-1"
          onAdd={async () => {
            if (!v) { setErr(true); return { ok: false, message: "" }; }
            return add(p.id, v.id, 1);
          }}
          label={t.buy.add}
        />
        <Link href="/cart" className="btn btn-ghost">{t.buy.cart}</Link>
      </div>
    </div>
  );
}
