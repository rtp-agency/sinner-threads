import Link from "next/link";
import type { Product } from "@/lib/types";
import { money } from "@/lib/format";
import { ImageSlider } from "./image-slider";
import { QuickBuy } from "./quick-buy";

export function ProductCard({ p, priority = false }: { p: Product; priority?: boolean }) {
  const photos = p.images.slice(0, 5);
  return (
    <article className="flex h-full flex-col">
      <Link href={`/product/${p.id}`} className="group block" aria-label={p.title}>
        <ImageSlider images={photos} alt={p.title} dim={!p.inStock} priority={priority} />
        <div className="stitch-t mt-3 flex items-start justify-between gap-3 pt-3">
          <h3 className="text-sm leading-snug group-hover:underline underline-offset-4">{p.title}</h3>
          <p className="num shrink-0 text-sm">{money(p.price)}</p>
        </div>
      </Link>
      {p.inStock ? (
        <QuickBuy productId={p.id} variants={p.variants.map((v) => ({ id: v.id, title: v.title, stock: v.stock }))} />
      ) : (
        <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-mute">Немає в наявності</p>
      )}
    </article>
  );
}
