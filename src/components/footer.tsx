import Link from "./loc-link";
import { Logo } from "./logo";
import { dict } from "@/i18n/dict";
import type { Lang } from "@/i18n/config";

export function Footer({ lang }: { lang: Lang }) {
  const d = dict(lang);
  const DOCS = [
    { href: "/legal/offer", label: d.footer.docs.offer },
    { href: "/legal/privacy", label: d.footer.docs.privacy },
    { href: "/legal/returns", label: d.footer.docs.returns },
    { href: "/legal/delivery", label: d.footer.docs.delivery },
  ];
  const L = d.footer.legal;
  return (
    <footer className="solid-t mt-24 bg-paper">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-12 md:grid-cols-[2fr_1fr_1fr] md:px-8">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-sm text-sm text-mute">{d.tagline}</p>
        </div>
        <div>
          <h2 className="mb-3 font-mono text-xs uppercase tracking-widest">{d.footer.buyers}</h2>
          <ul className="space-y-2 text-sm">
            {DOCS.map((x) => (<li key={x.href}><Link className="inline-flex min-h-8 items-center hover:underline" href={x.href}>{x.label}</Link></li>))}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 font-mono text-xs uppercase tracking-widest">{d.footer.requisites}</h2>
          <address className="space-y-1 text-sm not-italic text-mute">
            <p>{L.entity}</p>
            <p>{L.code}</p>
            <p>{L.address}</p>
            <p>{L.email}</p>
          </address>
        </div>
      </div>
      <div className="stitch-t">
        <p className="pb-safe mx-auto max-w-[1400px] px-4 py-4 font-mono text-[11px] uppercase tracking-widest text-mute md:px-8">© {new Date().getFullYear()} sinnerThreads</p>
      </div>
    </footer>
  );
}
