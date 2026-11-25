import type { CategorySlug } from "@/types";

/** Kategori yang operatornya bisa ditebak dari nomor ponsel (tanpa perlu dipilih manual). */
export const AUTO_OPERATOR_SLUGS: readonly CategorySlug[] = ["pulsa", "paket-data"];

export function isAutoOperatorCategory(slug: CategorySlug): boolean {
  return AUTO_OPERATOR_SLUGS.includes(slug);
}

/**
 * Prefix nomor seluler Indonesia per operator. Nama harus sama persis dengan
 * `providers` di lib/catalog.ts. Axis dan by.U ikut induknya (XL Axiata, Telkomsel).
 */
const OPERATOR_PREFIXES: Record<string, string[]> = {
  Telkomsel: ["0811", "0812", "0813", "0821", "0822", "0823", "0851", "0852", "0853"],
  "Indosat Ooredoo": ["0814", "0815", "0816", "0855", "0856", "0857", "0858"],
  "XL Axiata": ["0817", "0818", "0819", "0859", "0877", "0878", "0831", "0832", "0833", "0838"],
  "Tri (3)": ["0895", "0896", "0897", "0898", "0899"],
  Smartfren: ["0881", "0882", "0883", "0884", "0885", "0886", "0887", "0888", "0889"],
};

/** `+62 812-3456-7890` / `6281234567890` -> `081234567890`. Selain itu dikembalikan apa adanya (tanpa spasi/strip). */
export function toLocalPhone(raw: string): string {
  const clean = raw.trim().replace(/[\s\-().]/g, "");
  if (clean.startsWith("+62")) return "0" + clean.slice(3);
  if (clean.startsWith("62") && clean.length >= 11) return "0" + clean.slice(2);
  return clean;
}

/** Operator dari 4 digit pertama nomor, atau `null` bila belum cukup digit / tidak dikenali. */
export function detectOperator(raw: string, providers?: readonly string[]): string | null {
  const local = toLocalPhone(raw);
  if (local.length < 4) return null;
  const head = local.slice(0, 4);
  for (const [name, prefixes] of Object.entries(OPERATOR_PREFIXES)) {
    if (prefixes.includes(head) && (!providers || providers.includes(name))) return name;
  }
  return null;
}
