import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SITE } from "@/lib/site";

// ЗАГЛУШКИ. Тексти додаються після реєстрації ФОП і погодження з юристом.
const DOCS: Record<string, { title: string; intro: string; sections: string[] }> = {
  offer: {
    title: "Публічна оферта",
    intro: "Договір купівлі-продажу між продавцем і покупцем на умовах цього сайту.",
    sections: ["Предмет договору", "Порядок оформлення і оплати замовлення", "Доставка", "Права та обов'язки сторін", "Відповідальність і форс-мажор", "Реквізити продавця"],
  },
  privacy: {
    title: "Політика конфіденційності",
    intro: "Які дані ми збираємо при оформленні замовлення, навіщо і як довго зберігаємо.",
    sections: ["Які дані збираємо", "Мета обробки", "Передача третім особам (служба доставки, платіжна система)", "Права користувача", "Контакти"],
  },
  returns: {
    title: "Обмін і повернення",
    intro: "Умови повернення і обміну товару належної якості згідно із Законом України «Про захист прав споживачів».",
    sections: ["Строки повернення", "Стан товару", "Порядок звернення", "Повернення коштів"],
  },
  delivery: {
    title: "Доставка і оплата",
    intro: "Відправляємо Новою поштою по всій Україні. Оплата карткою онлайн або накладеним платежем.",
    sections: ["Способи доставки", "Вартість і строки", "Способи оплати", "Отримання і перевірка посилки"],
  },
};

export function generateStaticParams() {
  return Object.keys(DOCS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/legal/[slug]">): Promise<Metadata> {
  const d = DOCS[(await params).slug];
  return d ? { title: d.title } : {};
}

export default async function Legal({ params }: PageProps<"/legal/[slug]">) {
  const d = DOCS[(await params).slug];
  if (!d) notFound();
  return (
    <article className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="font-display text-5xl">{d.title}</h1>
      <p className="mt-4 text-mute">{d.intro}</p>
      <p className="stitch mt-8 p-4 text-sm">Повний текст документа буде додано після завершення юридичної реєстрації. Нижче структура розділів.</p>
      <ol className="mt-8 list-decimal space-y-3 pl-5">
        {d.sections.map((s) => (<li key={s}>{s}</li>))}
      </ol>
      <p className="stitch-t mt-12 pt-6 text-sm text-mute">{SITE.legal.entity}, {SITE.legal.code}, {SITE.legal.address}</p>
    </article>
  );
}
