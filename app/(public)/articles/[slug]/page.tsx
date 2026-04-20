import { db } from "@/lib/db";
import { ArticleBody } from "@/components/reader/ArticleBody";
import { TagPill } from "@/components/ui/TagPill";
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import type { Metadata } from "next";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = await db.article.findUnique({
    where: { slug: params.slug },
    include: { author: true },
  });

  if (!article) return { title: "Not Found" };

  const description = article.subtitle ?? article.bodyHtml.replace(/<[^>]+>/g, "").slice(0, 160);

  return {
    title: article.title,
    description,
    openGraph: {
      title: article.title,
      description,
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      authors: [article.author?.name ?? "Author"],
      ...(article.coverImageUrl && {
        images: [{ url: article.coverImageUrl, width: 1200, height: 630 }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      ...(article.coverImageUrl && { images: [article.coverImageUrl] }),
    },
  };
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ArticlePage({ params }: PageProps) {
  const [article, session] = await Promise.all([
    db.article.findUnique({
      where: { slug: params.slug },
      include: {
        tags: { include: { tag: true } },
        author: true,
      },
    }),
    getServerSession(authOptions),
  ]);

  if (!article || article.status !== "PUBLISHED" || article.deletedAt !== null) {
    notFound();
  }

  const isAdmin = !!session?.user;

  return (
    <article>
      {/* Admin edit bar */}
      {isAdmin && (
        <div className="mb-6 flex items-center justify-between px-4 py-2.5 bg-ink/5 border border-ink/10 rounded-lg text-sm">
          <span className="text-ink/50">You are viewing as admin</span>
          <Link
            href={`/admin/editor/${article.id}`}
            className="text-accent font-medium hover:underline"
          >
            ✏️ Edit this article →
          </Link>
        </div>
      )}

      {/* Tags */}
      {article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {article.tags.map(({ tag }: { tag: { name: string; slug: string } }) => (
            <TagPill key={tag.slug} name={tag.name} />
          ))}
        </div>
      )}

      {/* Title */}
      <h1 className="font-display text-4xl sm:text-5xl font-bold text-ink leading-tight mb-4">
        {article.title}
      </h1>

      {/* Subtitle */}
      {article.subtitle && (
        <p className="text-xl text-ink/60 italic mb-8">{article.subtitle}</p>
      )}

      {/* Byline */}
      <div className="flex items-center gap-3 mb-10 pb-8 border-b border-ink/10">
        {article.author?.avatarUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.author.avatarUrl}
            alt={article.author.name ?? "Author"}
            className="w-9 h-9 rounded-full object-cover"
          />
        )}
        <div>
          <p className="text-sm font-medium text-ink">
            {article.author?.name ?? "Author"}
          </p>
          <p className="text-xs text-ink/40">
            {article.publishedAt ? formatDate(article.publishedAt) : ""} ·{" "}
            {article.readTimeMins} min read
          </p>
        </div>
      </div>

      {/* Cover image */}
      {article.coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.coverImageUrl}
          alt={article.title}
          className="w-full rounded-xl object-cover max-h-[460px] mb-10"
        />
      )}

      {/* Body */}
      <ArticleBody html={article.bodyHtml} />
    </article>
  );
}
