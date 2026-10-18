/**
 * Фон секції каруселі: два ряди величезних літер логотипа їдуть у протилежні боки.
 * Верхній ряд контуром, нижній ледь помітною заливкою. Єдиний марк'ю на сторінці.
 * Рух тільки через transform; під prefers-reduced-motion стоїть на місці.
 */
function Row({ outline, reverse }: { outline?: boolean; reverse?: boolean }) {
  return (
    <div className="flex w-max select-none whitespace-nowrap">
      {[0, 1].map((k) => (
        <span
          key={k}
          aria-hidden
          className={`logo-run ${reverse ? "logo-run-rev" : ""} font-display shrink-0 pr-[0.5em] text-[clamp(7rem,22vw,19rem)] leading-[.82] ${
            outline ? "text-transparent [-webkit-text-stroke:1.5px_var(--ink)] opacity-[.2]" : "text-ink opacity-[.05]"
          }`}
        >
          SINNER THREADS SINNER THREADS
        </span>
      ))}
    </div>
  );
}

export function LogoMarquee() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-0 flex flex-col justify-center gap-2 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]">
      <Row outline />
      <Row reverse />
    </div>
  );
}
