"use client";
import NextLink from "next/link";
import type { ComponentProps } from "react";
import { href as locHref } from "@/i18n/config";
import { useLang } from "@/i18n/context";

/** next/link, який сам додає префікс мови: <Link href="/catalog"> веде на /en/catalog в англійській версії. */
export default function Link({ href, ...rest }: ComponentProps<typeof NextLink>) {
  const lang = useLang();
  return <NextLink href={typeof href === "string" ? locHref(lang, href) : href} {...rest} />;
}
