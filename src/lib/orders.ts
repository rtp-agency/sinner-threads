import "server-only";
import { createDraftOrder, markOrder, MyDropError, submitOrder } from "./mydrop";
import { getOrderRec, insertOrder, listOrderRecs, saveOrder, type OrderRec } from "./store";

export const orderMode = (): "demo" | "live" => (process.env.ORDER_MODE === "live" ? "live" : "demo");

export type NewOrder = Pick<OrderRec, "payment" | "provider" | "customer" | "lines" | "total">;

const log = (o: OrderRec, event: string) => o.history.push({ at: Date.now(), event });

/** Створює замовлення. У live-режимі спочатку чернетка в МійДроп (її id стає номером замовлення). */
export async function createOrder(n: NewOrder): Promise<OrderRec> {
  const mode = orderMode();
  let liveId: number | null = null;
  if (mode === "live") {
    const d = await createDraftOrder({
      ...n.customer,
      prepaid: n.payment === "card",
      lines: n.lines.map((l) => ({ productId: l.productId, variantId: l.variantId, qty: l.qty, price: l.price })),
    });
    liveId = d.id;
  }
  {
    const o: Omit<OrderRec, "id" | "createdAt"> & { id?: number } = {
      id: liveId ?? undefined,
      mode,
      status: n.payment === "card" ? "awaiting_payment" : "placed",
      payment: n.payment,
      provider: n.provider,
      total: n.total,
      customer: n.customer,
      lines: n.lines,
      history: [],
    };
    o.history.push({ at: Date.now(), event: mode === "live" ? "Чернетку створено в МійДроп" : "Замовлення створено (demo)" });
    return insertOrder(o);
  }
}

/** Накладений платіж: одразу в роботу. */
export async function placeCod(id: number) {
  const o = await getOrder(id);
  if (!o) throw new Error("order not found");
  if (o.mode === "live") await submitOrder(id);
  log(o, o.mode === "live" ? "Подано постачальнику" : "Прийнято в роботу (demo)");
  await saveOrder(o);
}

/**
 * Єдина точка для результату оплати: її викликають callback LiqPay/WayForPay і demo-сторінка.
 * Ідемпотентна: повторний callback нічого не ламає.
 */
export async function settlePayment(id: number, paid: boolean): Promise<OrderRec | null> {
  const o = await getOrder(id);
  if (!o) return null;
  if (o.status === "paid" || o.status === "placed") return o;

  if (paid && o.mode === "live") {
    try {
      await markOrder(id, { private_description: "Оплачено карткою на сайті" });
      await submitOrder(id);
    } catch (e) {
      if (!(e instanceof MyDropError && e.code === "order_already_submitted")) throw e;
    }
  }
  o.status = paid ? "paid" : "payment_failed";
  log(o, paid ? "Оплату отримано" : "Оплата не пройшла");
  await saveOrder(o);
  return o;
}

export const getOrder = getOrderRec;
export const listOrders = listOrderRecs;
