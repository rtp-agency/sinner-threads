import type { Lang } from "./config";

/**
 * Назви товарів і категорій приходять від постачальника українською. Для англійської версії
 * перекладаємо відомі слова зі словника, бренди та невідомі слова лишаються як є.
 */
const WORDS: Record<string, string> = {
  зіпка: "Zip hoodie", худі: "Hoodie", пуховик: "Puffer jacket", штани: "Pants", джинси: "Jeans", шорти: "Shorts",
  футболка: "T-shirt", футболки: "T-shirts", лонгслів: "Longsleeve", лонгсліви: "Longsleeves", светр: "Sweater", светри: "Sweaters",
  кардиган: "Cardigan", сумка: "Bag", сумки: "Bags", шарф: "Scarf", шапка: "Beanie", кепка: "Cap", куртка: "Jacket", вітрівка: "Windbreaker",
  жилетка: "Vest", тапки: "Slides", кофти: "Sweatshirts", аксесуари: "Accessories", пуховики: "Puffer jackets", комплекти: "Sets", літні: "Summer",
  чорний: "Black", чорна: "Black", чорні: "Black", сірий: "Grey", сіра: "Grey", сірі: "Grey", білий: "White", біла: "White", білі: "White",
  світлий: "Light", світла: "Light", темний: "Dark", темна: "Dark", синій: "Blue", синя: "Blue", червоний: "Red", червона: "Red",
  зелений: "Green", зелена: "Green", бежевий: "Beige", бежева: "Beige", коричневий: "Brown", нові: "New", нові_: "New", мат: "Matte", "мат.": "Matte",
  куртки: "Jackets", вітрівки: "Windbreakers", жилетки: "Vests", кросівки: "Sneakers", взуття: "Footwear", см: "cm", комплект: "Set", пакування: "Packaging",
  з: "with", тисненнями: "embossed", в: "in", клітинку: "check", та: "and", і: "and",
};

function translateWord(w: string): string {
  const m = /^([^\p{L}]*)([\p{L}.]+)([^\p{L}]*)$/u.exec(w);
  if (!m) return w;
  const hit = WORDS[m[2].toLowerCase()];
  return hit ? `${m[1]}${hit}${m[3]}` : w;
}

export function tr(text: string, lang: Lang): string {
  if (lang === "uk" || !text) return text;
  return text.split(/(\s+|\/)/).map((p) => (/^\s+$|^\/$/.test(p) ? p : translateWord(p))).join("").replace(/\s+/g, " ").trim();
}
