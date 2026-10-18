export default function Loading() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-12 md:px-8" aria-busy>
      <div className="skeleton h-10 w-64" />
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton aspect-[4/5]" />)}
      </div>
    </div>
  );
}
