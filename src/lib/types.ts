export type Category = { id: number; title: string; parentId: number | null; count: number };

export type Variant = {
  id: number;
  title: string;
  stock: number;
  note: string | null;
  params: { title: string; value: string }[];
  images: string[];
};

export type Product = {
  id: number;
  title: string;
  sku: string | null;
  categoryId: number | null;
  description: string | null;
  price: number; // роздрібна ціна для покупця
  dropPrice: number; // що платимо постачальнику
  images: string[];
  variants: Variant[];
  inStock: boolean;
  params: { title: string; value: string }[];
  sizeChart: string | null;
  isSet: boolean;
};
