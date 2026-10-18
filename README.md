# sinnerThreads

Інтернет-магазин ресейлу брендового одягу для України. Next.js 16, Tailwind 4, товари з МійДроп.

## Запуск

```bash
cp .env.example .env.local   # вписати MYDROP_API_KEY
npm install
npm run dev
```

## Як працює каталог

Ключ у МійДроп дропшиперський. Каталог береться одним запитом
`GET /dropshipper/api/export/dropshipper_vendors/<id>/products/json`
([src/lib/mydrop.ts](src/lib/mydrop.ts)): категорії, фото (`full_url`), розміри, залишки
(`real_count_dropshipper`), ціни. Кеш 15 хвилин, так само як у самого МійДроп.
Залишки не миттєві: фактичну наявність підтверджує постачальник при отриманні замовлення.
Фото віддаються з `backend.mydrop.com.ua` через `next/image`, окремо качати їх не потрібно.

Ціна для покупця: рекомендована ціна постачальника (`price`), якщо її немає, то `drop_price * RETAIL_MARKUP`.
У вітрину не потрапляють товари без фото, комплекти і "Пакування".

## Режими для розробки (без ключів)

`.env.local` за замовчуванням: `ORDER_MODE=demo`, `PAYMENT_PROVIDER=demo`.
- Замовлення і кошики зберігаються в `.data/db.json`, в МійДроп нічого не йде.
- Оплата карткою веде на тестову сторінку `/pay/demo/<id>` з кнопками «успіх / помилка».
- `/dev/orders` показує всі локальні замовлення. Усе demo вимикається в production.
- Бойовий режим: `ORDER_MODE=live` (замовлення летять у CRM МійДроп) і реальний `PAYMENT_PROVIDER`.

## Supabase і Vercel

Кошики й замовлення зберігаються в Supabase (Postgres), якщо задано `NEXT_PUBLIC_SUPABASE_URL` і `SUPABASE_SECRET_KEY`;
без них локально працює файл `.data/db.json`. Схема: [supabase/migrations/0001_init.sql](supabase/migrations/0001_init.sql)
(RLS увімкнено без політик, до таблиць має доступ лише сервер із secret-ключем).

Деплой на Vercel: імпортувати репозиторій і задати змінні `MYDROP_API_KEY`, `MYDROP_VENDOR_LINK_ID`, `SITE_URL`,
`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `ORDER_MODE`, `PAYMENT_PROVIDER` та ключі платіжки.
Для комерційного магазину потрібен тариф Pro. `SUPABASE_SECRET_KEY` ніколи не називати з `NEXT_PUBLIC_`.

## API кошика

Кошик живе на сервері (cookie `st_cart`), ціни й залишки перевіряються по каталогу при кожній зміні.
`GET /api/cart`, `POST /api/cart {productId, variantId, qty}`, `PATCH /api/cart {variantId, qty}`,
`DELETE /api/cart?variantId=` (без параметра очищає). `POST /api/checkout` бере склад із кошика,
повертає `{orderId}` для накладеного платежу або `{orderId, pay}` (форма редіректа) для картки.

## Замовлення

1. Чекаут ([src/app/api/checkout/route.ts](src/app/api/checkout/route.ts)) заново перевіряє ціни й залишки з каталогу.
2. В МійДроп створюється чернетка замовлення (`POST /dropshipper/api/orders`).
3. Накладений платіж: чернетка одразу подається постачальнику (`/orders/<id>/submit`).
4. Оплата карткою: редірект на LiqPay або WayForPay, подача постачальнику після callback
   ([src/app/api/payments/callback/route.ts](src/app/api/payments/callback/route.ts)).
   МійДроп є єдиним сховищем замовлень, своєї БД немає.

## Оплата карткою (заглушка)

Без ключів на чекауті доступний лише накладений платіж. Щоб увімкнути оплату:
`PAYMENT_PROVIDER=liqpay|wayforpay` і ключі в `.env.local`. Для LiqPay тест: `LIQPAY_SANDBOX=1`.
Потрібні ФОП і договір з платіжною системою.

## Юридична частина (заглушка)

`/legal/offer|privacy|returns|delivery` ([src/app/legal/[slug]/page.tsx](src/app/legal/%5Bslug%5D/page.tsx))
містять тільки структуру розділів. Реквізити продавця: `SITE.legal` у [src/lib/site.ts](src/lib/site.ts).

## Не перевірено в бойовому режимі

Створення і подача замовлення в МійДроп та платіжні callback-и написані за документацією,
але не запускалися, щоб не засмічувати CRM тестовими замовленнями.
Перший тест: одне замовлення з накладеним платежем і перевірка його в кабінеті МійДроп.
