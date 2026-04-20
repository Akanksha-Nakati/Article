import { MetadataRoute } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  let articleRoutes: MetadataRoute.Sitemap = [];

  try {
    const articles = await db.article.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    });

    articleRoutes = articles.map((a: { slug: string; updatedAt: Date }) => ({
      url: `${base}/articles/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // No DB available at build time — sitemap will be generated at runtime
  }

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...articleRoutes,
  ];
}
