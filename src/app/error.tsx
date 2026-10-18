"use client";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-display text-4xl">Каталог тимчасово недоступний</h1>
      <p className="mt-4 text-mute">Не вдалося завантажити товари. Спробуйте ще раз за хвилину.</p>
      <button onClick={reset} className="btn mt-8">Оновити</button>
    </div>
  );
}
