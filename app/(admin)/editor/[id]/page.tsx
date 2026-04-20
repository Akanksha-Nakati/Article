import { db } from "@/lib/db";
import { ArticleEditor } from "@/components/editor/ArticleEditor";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface PageProps {
  params: { id: string };
}

export const metadata: Metadata = { title: "Edit Article" };

export default async function EditArticlePage({ params }: PageProps) {
  const article = await db.article.findUnique({
    where: { id: params.id },
    include: {
      tags: { include: { tag: true } },
    },
  });

  if (!article) notFound();

  return (
    <ArticleEditor
      initialData={{
        id: article.id,
        title: article.title,
        subtitle: article.subtitle,
        bodyHtml: article.bodyHtml,
        bodyJson: article.bodyJson as object | null,
        tags: article.tags,
        status: article.status,
        coverImageUrl: article.coverImageUrl,
      }}
    />
  );
}
