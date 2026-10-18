import Link from "next/link";
import { Logo } from "./logo";
import { SITE } from "@/lib/site";

const DOCS = [
  { href: "/legal/offer", label: "Публічна оферта" },
  { href: "/legal/privacy", label: "Політика конфіденційності" },
  { href: "/legal/returns", label: "Обмін і повернення" },
  { href: "/legal/delivery", label: "Доставка і оплата" },
];

export function Footer() {
  return (
    <footer className="solid-t mt-24 bg-paper">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-12 md:grid-cols-[2fr_1fr_1fr] md:px-8">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-sm text-sm text-mute">{SITE.tagline}</p>
        </div>
        <div>
          <h2 className="mb-3 font-mono text-xs uppercase tracking-widest">Покупцям</h2>
          <ul className="space-y-2 text-sm">
            {DOCS.map((d) => (
              <li key={d.href}><Link className="hover:underline" href={d.href}>{d.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 font-mono text-xs uppercase tracking-widest">Реквізити</h2>
          <address className="space-y-1 text-sm not-italic text-mute">
            <p>{SITE.legal.entity}</p>
            <p>{SITE.legal.code}</p>
            <p>{SITE.legal.address}</p>
            <p>{SITE.legal.email}</p>
          </address>
        </div>
      </div>
      <div className="stitch-t">
        <p className="pb-safe mx-auto max-w-[1400px] px-4 py-4 font-mono text-[11px] uppercase tracking-widest text-mute md:px-8">
          © {new Date().getFullYear()} {SITE.name}
        </p>
      </div>
    </footer>
  );
}
