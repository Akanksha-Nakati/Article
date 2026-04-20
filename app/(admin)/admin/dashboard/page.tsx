import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { DeleteArticleButton } from "@/components/ui/DeleteArticleButton";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const articles = await db.article.findMany({
    orderBy: { updatedAt: "desc" },
    include: { tags: { include: { tag: true } } },
  });

  const live = articles.filter((a: typeof articles[0]) => !a.deletedAt);
  const deleted = articles.filter((a: typeof articles[0]) => !!a.deletedAt);

  function StatusBadge({ article }: { article: typeof articles[0] }) {
    if (article.deletedAt) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
          Deleted
        </span>
      );
    }
    if (article.status === "PUBLISHED") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Published
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
        Draft
      </span>
    );
  }

  function ArticleRow({ article }: { article: typeof articles[0] }) {
    const isDeleted = !!article.deletedAt;
    return (
      <tr
        key={article.id}
        className={`border-b border-ink/8 last:border-0 transition-colors ${
          isDeleted ? "opacity-50 bg-red-50/40" : "hover:bg-ink/2"
        }`}
      >
        <td className="px-4 py-4">
          <div>
            <p className={`font-medium leading-snug ${isDeleted ? "line-through text-ink/50" : "text-ink"}`}>
              {article.title}
            </p>
            <p className="text-xs text-ink/40 mt-0.5">/{article.slug}</p>
            {isDeleted && article.deletedAt && (
              <p className="text-xs text-red-500 mt-0.5">
                Deleted {formatDate(article.deletedAt)}
              </p>
            )}
          </div>
        </td>
        <td className="px-4 py-4 hidden sm:table-cell">
          <StatusBadge article={article} />
        </td>
        <td className="px-4 py-4 text-ink/50 hidden md:table-cell">
          {article.publishedAt ? formatDate(article.publishedAt) : "—"}
        </td>
        <td className="px-4 py-4 text-ink/40 text-xs hidden lg:table-cell">
          {formatDate(article.updatedAt)}
        </td>
        <td className="px-4 py-4">
          <div className="flex items-center justify-end gap-2">
            {!isDeleted && article.status === "PUBLISHED" && (
              <Link href={`/articles/${article.slug}`}>
                <Button variant="ghost" size="sm">View</Button>
              </Link>
            )}
            {!isDeleted && (
              <Link href={`/admin/editor/${article.id}`}>
                <Button variant="secondary" size="sm">Edit</Button>
              </Link>
            )}
            <DeleteArticleButton
              id={article.id}
              title={article.title}
              deleted={isDeleted}
            />
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Dashboard</h1>
          <p className="text-ink/50 text-sm mt-1">
            {live.length} article{live.length !== 1 ? "s" : ""}
            {deleted.length > 0 && (
              <span className="text-red-400 ml-2">· {deleted.length} deleted</span>
            )}
          </p>
        </div>
        <Link href="/admin/editor">
          <Button variant="primary">+ New Article</Button>
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-24 text-ink/30 border border-dashed border-ink/15 rounded-xl">
          <p className="text-xl font-display mb-2">No articles yet</p>
          <p className="text-sm mb-6">Create your first article to get started.</p>
          <Link href="/admin/editor">
            <Button variant="primary">Write your first article</Button>
          </Link>
        </div>
      ) : (
        <div className="border border-ink/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/10 bg-ink/3">
                <th className="text-left px-4 py-3 font-medium text-ink/50">Title</th>
                <th className="text-left px-4 py-3 font-medium text-ink/50 hidden sm:table-cell">Status</th>
                <th className="text-left px-4 py-3 font-medium text-ink/50 hidden md:table-cell">Published</th>
                <th className="text-left px-4 py-3 font-medium text-ink/50 hidden lg:table-cell">Updated</th>
                <th className="text-right px-4 py-3 font-medium text-ink/50">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article: typeof articles[0]) => (
                <ArticleRow key={article.id} article={article} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
