/** Одна довга нитка, що малюється при завантаженні. Суто декор, прихована від скрінрідерів. */
export function Thread({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 1200 600" preserveAspectRatio="none" className={className} fill="none">
      <path
        className="thread-draw"
        d="M-20 520 C 180 520, 220 80, 420 120 S 640 560, 800 300 S 980 40, 1220 140"
        stroke="currentColor"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M-20 548 C 200 548, 240 110, 440 150 S 660 590, 820 330 S 1000 70, 1220 170"
        stroke="currentColor"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
        className="flow"
        opacity=".6"
      />
    </svg>
  );
}
