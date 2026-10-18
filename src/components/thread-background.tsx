/**
 * Фон сайту: кілька дуже блідих ниток, що повільно дрейфують і "біжать" пунктиром.
 * Чистий SVG + CSS (transform і stroke-dashoffset), без JS. Під prefers-reduced-motion стоїть нерухомо.
 */
export function ThreadBackground() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      className="bg-threads pointer-events-none fixed inset-0 -z-10 h-full w-full opacity-[.14]"
      fill="none"
    >
      <g className="drift">
        <path className="flow" d="M-40 760 C 240 760, 300 160, 640 220 S 980 820, 1240 480 S 1500 120, 1660 240" strokeWidth="1.4" />
        <path d="M-40 790 C 260 790, 330 190, 660 250 S 1000 850, 1260 510 S 1520 150, 1660 270" strokeWidth="1" />
      </g>
      <g className="drift drift-b">
        <path className="flow flow-b" d="M-40 140 C 300 40, 520 420, 820 330 S 1240 -20, 1660 380" strokeWidth="1.2" />
        <path d="M-40 168 C 320 70, 540 450, 840 360 S 1260 10, 1660 410" strokeWidth="0.9" />
      </g>
      <g className="drift drift-c">
        <path className="flow" d="M-40 520 C 360 640, 700 380, 1000 560 S 1480 700, 1660 560" strokeWidth="1" />
      </g>
    </svg>
  );
}
