"use client";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "@phosphor-icons/react";
import { useCart } from "@/components/cart";
import { money } from "@/lib/format";

export default function CartPage() {
  const { lines, total, ready, setQty, remove } = useCart();

  if (!ready) return <div className="mx-auto max-w-5xl px-4 py-12"><div className="skeleton h-40" aria-busy /></div>;

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-5xl">Кошик порожній</h1>
        <p className="mt-4 text-mute">Додайте щось із каталогу, і воно з’явиться тут.</p>
        <Link href="/catalog" className="btn mt-8">До каталогу</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-[1400px] gap-12 px-4 py-10 md:px-8 lg:grid-cols-[1.6fr_1fr]">
      <div>
        <h1 className="font-display text-5xl">Кошик</h1>
        <ul className="mt-8">
          {lines.map((l) => (
            <li key={l.variantId} className="stitch-t grid grid-cols-[88px_1fr_auto] gap-4 py-5 sm:grid-cols-[112px_1fr_auto]">
              <Link href={`/product/${l.productId}`} className="relative aspect-[4/5] bg-soft">
                <Image src={l.image} alt={l.title} fill sizes="112px" className="object-cover" />
              </Link>
              <div className="flex flex-col justify-between">
                <div>
                  <Link href={`/product/${l.productId}`} className="text-sm hover:underline">{l.title}</Link>
                  <p className="mt-1 font-mono text-xs uppercase tracking-widest text-mute">Розмір {l.size}</p>
                </div>
                <div className="inline-flex w-fit items-center border border-ink">
                  <button aria-label="Менше" className="grid size-10 place-items-center hover:bg-soft" onClick={() => setQty(l.variantId, l.qty - 1)} disabled={l.qty <= 1}><Minus size={14} /></button>
                  <span className="num min-w-8 text-center text-sm" aria-live="polite">{l.qty}</span>
                  <button aria-label="Більше" className="grid size-10 place-items-center hover:bg-soft disabled:opacity-30" onClick={() => setQty(l.variantId, l.qty + 1)} disabled={l.qty >= l.max}><Plus size={14} /></button>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button aria-label={`Прибрати ${l.title}`} onClick={() => remove(l.variantId)} className="grid size-10 place-items-center hover:bg-soft"><X size={16} /></button>
                <p className="num text-sm">{money(l.price * l.qty)}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <aside className="stitch h-fit p-6 lg:sticky lg:top-24">
        <h2 className="font-mono text-xs uppercase tracking-widest">Разом</h2>
        <p className="num mt-3 text-3xl">{money(total)}</p>
        <p className="mt-2 text-sm text-mute">Доставка за тарифами Нової пошти, оплачується при отриманні.</p>
        <Link href="/checkout" className="btn mt-6 w-full">Оформити замовлення</Link>
        <Link href="/catalog" className="mt-4 block text-center font-mono text-xs uppercase tracking-widest underline underline-offset-8">Продовжити покупки</Link>
      </aside>
    </div>
  );
}
