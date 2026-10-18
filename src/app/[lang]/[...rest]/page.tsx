import { notFound } from "next/navigation";

// Невідомі адреси потрапляють сюди, щоб 404 малювався всередині [lang]: з шапкою, підвалом і потрібною мовою.
export default function CatchAll() {
  notFound();
}
