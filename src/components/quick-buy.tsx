"use client";
import { useState } from "react";
import { useCart } from "./cart";
import { AddToCartMorph } from "./add-to-cart-morph";

export type QuickVariant = { id: number; title: string; stock: number };

/** Вибір розміру і кнопка "в кошик" прямо на картці товару. */
export function QuickBuy({ productId, variants }: { productId: number; variants: QuickVariant[] }) {
  const { add } = useCart();
  const free = variants.filter((v) => v.stock > 0);
  const [sel, setSel] = useState<number | null>(free.length === 1 ? free[0].id : null);
  const [warn, setWarn] = useState(false);
  const [all, setAll] = useState(false);
  const shown = all ? variants : variants.slice(0, 7);

  return (
    <div className="mt-auto pt-3">
      <div role="group" aria-label="Розмір" className="flex flex-wrap gap-1.5">
        {shown.map((v) => {
          const out = v.stock <= 0;
          const active = sel === v.id;
          return (
            <button
              key={v.id}
              type="button"
              disabled={out}
              aria-pressed={active}
              onClick={() => { setSel(v.id); setWarn(false); }}
              className={`num min-h-9 min-w-9 max-w-[8.5rem] truncate border px-2 text-xs ${active ? "border-ink bg-ink text-paper" : "border-ink hover:bg-soft"} ${out ? "cursor-not-allowed border-dashed text-mute line-through opacity-50 hover:bg-transparent" : ""}`}
            >
              {v.title}
            </button>
          );
        })}
        {!all && variants.length > 7 && (
          <button type="button" onClick={() => setAll(true)} className="num min-h-9 px-2 text-xs underline underline-offset-4">+{variants.length - 7}</button>
        )}
      </div>
      <p role="status" className={`mt-1 min-h-4 text-xs ${warn ? "text-danger" : "text-transparent"}`}>{warn ? "Оберіть розмір" : "."}</p>
      <AddToCartMorph
        size="sm"
        onAdd={async () => {
          if (sel === null) { setWarn(true); return { ok: false, message: "" }; }
          return add(productId, sel, 1);
        }}
      />
    </div>
  );
}
