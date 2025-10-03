export function formatCurrency(
  value?: number | null,
  options?: { locale?: string; currency?: string },
) {
  if (typeof value !== "number") return "—";
  const locale = options?.locale ?? "pt-BR";
  const currency = options?.currency ?? "BRL";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value / 100);
}

export function formatDate(
  value?: Date | string | null,
  options?: { locale?: string; format?: Intl.DateTimeFormatOptions },
) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const locale = options?.locale ?? "pt-BR";
  const format: Intl.DateTimeFormatOptions =
    options?.format ?? {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };

  return new Intl.DateTimeFormat(locale, format).format(date);
}
