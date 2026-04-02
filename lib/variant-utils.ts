export function buildVariantSubject(
  manufacturerName: string,
  variantFullName: string
) {
  const manufacturer = (manufacturerName || "").trim();
  const full = (variantFullName || "").trim();

  if (!manufacturer) return full;

  const lowerManufacturer = manufacturer.toLowerCase();
  const lowerFull = full.toLowerCase();

  if (lowerFull.startsWith(lowerManufacturer + " ")) {
    return full;
  }

  return `${manufacturer} ${full}`.trim();
}

export function dedupeListings<T extends {
  source?: string;
  price_date?: string;
  price?: number | string;
  title?: string;
}>(rows: T[]) {
  return Array.from(
    new Map(
      (rows || []).map((row) => {
        const key = [
          row.source || "",
          row.price_date || "",
          row.price || "",
          (row.title || "").trim().toLowerCase(),
        ].join("|");

        return [key, row];
      })
    ).values()
  );
}
