export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function calculateReadTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const wordCount = text ? text.split(" ").length : 0;
  return Math.max(1, Math.ceil(wordCount / 200));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function extractExcerpt(html: string, maxLength = 160): string {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, "") + "…";
}

export async function uniqueSlug(
  base: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  let slug = slugify(base);
  let attempt = 1;

  while (await checkExists(slug)) {
    attempt++;
    slug = `${slugify(base)}-${attempt}`;
  }

  return slug;
}
