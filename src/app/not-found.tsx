import Link from "next/link";
export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="num text-sm text-mute">404</p>
      <h1 className="mt-2 font-display text-5xl">Нитка обірвалась</h1>
      <p className="mt-4 text-mute">Такої сторінки немає або товар уже розібрали.</p>
      <Link href="/catalog" className="btn mt-8">До каталогу</Link>
    </div>
  );
}
