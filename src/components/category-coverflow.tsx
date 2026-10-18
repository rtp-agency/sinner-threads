"use client";
import Image from "next/image";
import Link from "./loc-link";
import { useT } from "@/i18n/context";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";

export type CoverItem = { id: number; title: string; count: number; image: string };

/**
 * Coverflow для категорій: активна картка по центру, сусідні відходять у глибину.
 * Клік по сусідній виводить її в центр, клік по центральній відкриває категорію.
 * Керування: стрілки, клавіші вліво/вправо, свайп. Рух показує, що категорій більше, ніж видно.
 */
export function CategoryCoverFlow({ items }: { items: CoverItem[] }) {
  // Починаємо із центральної категорії: з обох боків є сусіди, композиція симетрична
  const t = useT();
  const [active, setActive] = useState(Math.floor((items.length - 1) / 2));
  const reduce = useReducedMotion();
  const go = (i: number) => setActive(Math.max(0, Math.min(items.length - 1, i)));

  return (
    <div
      role="group"
      aria-roledescription={t.carousel.role}
      aria-label={t.carousel.label}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(active - 1);
        if (e.key === "ArrowRight") go(active + 1);
      }}
      className="select-none"
    >
      <motion.div
        className="relative mx-auto h-[400px] w-full max-w-5xl touch-pan-y sm:h-[460px] [perspective:1400px]"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDragEnd={(_, info) => {
          if (info.offset.x < -50) go(active + 1);
          else if (info.offset.x > 50) go(active - 1);
        }}
      >
        {items.map((c, i) => {
          const off = i - active;
          const abs = Math.abs(off);
          const isActive = off === 0;
          const body = (
            <>
              <Image src={c.image} alt="" fill sizes="(min-width:640px) 260px, 200px" draggable={false} className={`object-cover transition duration-500 ${isActive ? "" : "grayscale"}`} />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-paper px-4 py-3">
                <span className="font-display text-2xl">{c.title}</span>
                <span className="num text-xs text-mute">{c.count}</span>
              </div>
            </>
          );
          const cls = "absolute left-1/2 top-4 block h-[340px] w-[200px] -ml-[100px] overflow-hidden border border-ink bg-soft sm:h-[400px] sm:w-[260px] sm:-ml-[130px]";
          return (
            <motion.div
              key={c.id}
              initial={false}
              animate={{
                x: `${off * 62}%`,
                rotateY: isActive ? 0 : off < 0 ? 42 : -42,
                z: isActive ? 60 : -abs * 90,
                scale: isActive ? 1 : 1 - abs * 0.06,
                // Без прозорості: напівпрозорі картки просвічували одна крізь одну. Глибину дає затемнення.
                opacity: abs > 2 ? 0 : 1,
                filter: `brightness(${isActive ? 1 : Math.max(0.35, 1 - abs * 0.28)})`,
              }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 190, damping: 26 }}
              style={{ zIndex: 20 - abs, pointerEvents: abs > 2 ? "none" : "auto" }}
              className={cls}
              aria-hidden={abs > 2 ? true : undefined}
            >
              {isActive ? (
                <Link href={`/catalog?cat=${c.id}`} className="absolute inset-0 block" aria-label={t.carousel.open(c.title, c.count)}>{body}</Link>
              ) : (
                <button type="button" onClick={() => go(i)} className="absolute inset-0 block text-left" aria-label={t.carousel.show(c.title)} tabIndex={abs > 2 ? -1 : 0}>{body}</button>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      <div className="mt-6 flex items-center justify-center gap-5">
        <button type="button" onClick={() => go(active - 1)} disabled={active === 0} aria-label={t.carousel.prev} className="grid size-11 place-items-center border border-ink hover:bg-ink hover:text-paper disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink"><ArrowLeft size={18} /></button>
        <div className="flex items-center gap-1.5" aria-hidden>
          {items.map((_, i) => (<button key={i} tabIndex={-1} onClick={() => go(i)} className={`h-[3px] transition-all ${i === active ? "w-8 bg-ink" : "w-3 bg-ink/30 hover:bg-ink/60"}`} />))}
        </div>
        <button type="button" onClick={() => go(active + 1)} disabled={active === items.length - 1} aria-label={t.carousel.next} className="grid size-11 place-items-center border border-ink hover:bg-ink hover:text-paper disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink"><ArrowRight size={18} /></button>
      </div>
    </div>
  );
}
