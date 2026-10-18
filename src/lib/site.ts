export const SITE = {
  name: "sinnerThreads",
  display: "SINNER THREADS",
  tagline: "Брендовий одяг та аксесуари. Доставка по Україні.",
  url: process.env.SITE_URL ?? "http://localhost:3000",
  currency: "₴",
  // Заглушка реквізитів: заповнити після реєстрації ФОП, див. /legal/*
  legal: {
    entity: "ФОП [ПІБ]",
    code: "РНОКПП [буде додано]",
    address: "[адреса буде додана]",
    email: "[email буде додано]",
    phone: "[телефон буде додано]",
  },
} as const;
