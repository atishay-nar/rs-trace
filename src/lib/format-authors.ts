export function formatAuthors(authorsJson: string | null, maxDisplay = 5): string {
  if (!authorsJson) return "";
  try {
    const arr = JSON.parse(authorsJson) as string[];
    if (!arr?.length) return authorsJson;
    const names = arr.filter((n) => n?.trim());
    if (names.length === 0) return "";
    if (names.length === 1) return names[0]!;
    if (names.length === 2) return `${names[0]} and ${names[1]}`;
    const truncate = names.length > maxDisplay;
    const show = truncate ? names.slice(0, maxDisplay) : names;
    const and = truncate ? ", " : ", and ";
    const formatted = show.slice(0, -1).join(", ") + and + show[show.length - 1];
    return truncate ? `${formatted} et al.` : formatted;
  } catch {
    return authorsJson;
  }
}
