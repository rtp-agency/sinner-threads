const nf = new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 });
export const money = (n: number) => `${nf.format(n)} ₴`;
