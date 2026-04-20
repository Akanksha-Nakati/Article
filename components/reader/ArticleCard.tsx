import Link from "next/link";
import { TagPill } from "@/components/ui/TagPill";
import { formatDate, extractExcerpt } from "@/lib/utils";

interface Tag {
  tag: { name: string; slug: string };
}

interface ArticleCardProps {
  title: string;
  subtitle?: string | null;
  slug: string;
  bodyHtml: string;
  tags: Tag[];
  readTimeMins: number;
  publishedAt: Date | string | null;
  coverImageUrl?: string | null;
}

export function ArticleCard({
  title,
  subtitle,
  slug,
  bodyHtml,
  tags,
  readTimeMins,
  publishedAt,
  coverImageUrl,
}: ArticleCardProps) {
  const excerpt = extractExcerpt(bodyHtml);

  return (
    <Link href={`/articles/${slug}`} className="group block">
      <article className="flex gap-6 py-8 border-b border-ink/10 group-hover:opacity-80 transition-opacity">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.map(({ tag }) => (
              <TagPill key={tag.slug} name={tag.name} />
            ))}
          </div>

          <h2 className="font-display text-2xl font-bold text-ink leading-tight mb-1 group-hover:text-accent transition-colors">
            {title}
          </h2>

          {subtitle && (
            <p className="text-ink/60 text-base italic mb-2">{subtitle}</p>
          )}

          <p className="text-ink/70 text-sm leading-relaxed line-clamp-3">
            {excerpt}
          </p>

          <div className="mt-3 flex items-center gap-2 text-xs text-ink/40">
            {publishedAt && <span>{formatDate(publishedAt)}</span>}
            <span>·</span>
            <span>{readTimeMins} min read</span>
          </div>
        </div>

        {coverImageUrl && (
          <div className="hidden sm:block flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImageUrl}
              alt={title}
              className="w-32 h-24 object-cover rounded"
            />
          </div>
        )}
      </article>
    </Link>
  );
}
