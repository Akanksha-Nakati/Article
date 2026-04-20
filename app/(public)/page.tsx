import { db } from "@/lib/db";
import { ArticleCard } from "@/components/reader/ArticleCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Articles",
  description: "Long-form writing and ideas.",
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let articles: Awaited<ReturnType<typeof db.article.findMany>> = [];

  try {
    articles = await db.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      include: {
        tags: { include: { tag: true } },
      },
    });
  } catch {
    // DB not yet configured — render empty state
  }

  return (
    <div>
      <div className="mb-12">
        <h1 className="font-display text-5xl font-bold text-ink mb-3">
          Articles
        </h1>
        <p className="text-ink/50 text-lg">
          Long-form writing, ideas, and notes.
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-24 text-ink/30">
          <p className="text-2xl font-display">Nothing here yet.</p>
          <p className="mt-2 text-sm">Check back soon.</p>
        </div>
      ) : (
        <div>
          {articles.map((article: typeof articles[0]) => (
            <ArticleCard
              key={article.id}
              title={article.title}
              subtitle={article.subtitle}
              slug={article.slug}
              bodyHtml={article.bodyHtml}
              tags={article.tags}
              readTimeMins={article.readTimeMins}
              publishedAt={article.publishedAt}
              coverImageUrl={article.coverImageUrl}
            />
          ))}
        </div>
      )}
    </div>
  );
}
