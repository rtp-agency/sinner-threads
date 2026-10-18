"use client";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, ShoppingBag, SpinnerGap, WarningCircle } from "@phosphor-icons/react";

type Phase = "idle" | "loading" | "done" | "error";

/**
 * Кнопка "в кошик": прямокутник стискується в квадрат зі спінером, потім розгортається
 * назад із галочкою. Рух несе зворотний зв'язок (запит пішов, готово, помилка), а не декор.
 */
export function AddToCartMorph({
  onAdd,
  label = "В кошик",
  doneLabel = "Додано",
  className = "",
  size = "md",
}: {
  onAdd: () => Promise<{ ok: boolean; message?: string }>;
  label?: string;
  doneLabel?: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [msg, setMsg] = useState<string>("");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const reduce = useReducedMotion();
  const h = size === "sm" ? 40 : 48;

  async function click() {
    if (phase === "loading") return;
    clearTimeout(timer.current);
    setPhase("loading");
    const r = await onAdd();
    setPhase(r.ok ? "done" : "error");
    setMsg(r.ok ? "" : (r.message ?? "Не вдалося додати"));
    timer.current = setTimeout(() => setPhase("idle"), r.ok ? 1800 : 2600);
  }

  const collapsed = phase === "loading";
  return (
    <div className={`relative ${className}`}>
      <motion.button
        type="button"
        onClick={click}
        aria-live="polite"
        aria-label={phase === "loading" ? "Додаємо в кошик" : phase === "done" ? doneLabel : label}
        animate={{ width: collapsed ? h : "100%" }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 32 }}
        style={{ height: h }}
        className={`mx-auto flex items-center justify-center overflow-hidden border border-ink font-mono text-xs uppercase tracking-widest transition-colors ${
          phase === "done" ? "bg-paper text-ink" : phase === "error" ? "border-danger bg-paper text-danger" : "bg-ink text-paper hover:bg-paper hover:text-ink"
        }`}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={phase}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.16 }}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            {phase === "idle" && (<><ShoppingBag size={16} />{label}</>)}
            {phase === "loading" && <SpinnerGap size={18} className="animate-spin motion-reduce:animate-none" />}
            {phase === "done" && (<><Check size={16} weight="bold" />{doneLabel}</>)}
            {phase === "error" && (<><WarningCircle size={16} />Помилка</>)}
          </motion.span>
        </AnimatePresence>
      </motion.button>
      <p role="status" className="mt-1 min-h-4 text-xs text-danger">{phase === "error" ? msg : ""}</p>
    </div>
  );
}
