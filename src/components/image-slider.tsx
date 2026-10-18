"use client";
import Image from "next/image";
import { useRef, useState } from "react";

/**
 * Фото товару на картці. Мишка: рух по картці перемикає кадри (як на маркетплейсах).
 * Дотик: нативний свайп із scroll-snap. Один кадр: звичайне фото без обв'язки.
 */
export function ImageSlider({ images, alt, dim, priority = false }: { images: string[]; alt: string; dim?: boolean; priority?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const n = images.length;

  function onMove(e: React.MouseEvent) {
    const el = box.current;
    if (!el || n < 2) return;
    const r = el.getBoundingClientRect();
    const i = Math.min(n - 1, Math.max(0, Math.floor(((e.clientX - r.left) / r.width) * n)));
    if (i !== idx) {
      el.scrollTo({ left: i * r.width, behavior: "instant" });
      setIdx(i);
    }
  }
  function onScroll() {
    const el = box.current;
    if (!el || n < 2) return;
    setIdx(Math.round(el.scrollLeft / el.clientWidth));
  }

  return (
    <div className="relative aspect-[4/5] bg-soft" onMouseMove={onMove} onMouseLeave={() => { if (n > 1 && box.current) { box.current.scrollTo({ left: 0, behavior: "instant" }); setIdx(0); } }}>
      <div ref={box} onScroll={onScroll} className="absolute inset-0 flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {images.map((src, i) => (
          <div key={src} className="relative h-full w-full shrink-0 snap-center">
            <Image
              src={src}
              alt={i === 0 ? alt : `${alt}, фото ${i + 1}`}
              fill
              priority={priority && i === 0}
              loading={i === 0 && priority ? undefined : "lazy"}
              sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
              className={`object-cover ${dim ? "grayscale opacity-60" : ""}`}
            />
          </div>
        ))}
      </div>
      {n > 1 && (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center gap-1">
          {images.map((_, i) => (
            <span key={i} className={`h-[3px] transition-all ${i === idx ? "w-5 bg-ink" : "w-2 bg-ink/35"}`} />
          ))}
        </div>
      )}
    </div>
  );
}
