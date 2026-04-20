interface ArticleBodyProps {
  html: string;
}

export function ArticleBody({ html }: ArticleBodyProps) {
  return (
    <div
      className="prose prose-lg max-w-none
        prose-headings:font-display prose-headings:text-ink
        prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl
        prose-p:text-ink/80 prose-p:leading-relaxed
        prose-a:text-accent prose-a:no-underline hover:prose-a:underline
        prose-blockquote:border-l-accent prose-blockquote:text-ink/60 prose-blockquote:italic
        prose-code:text-accent prose-code:bg-ink/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-ink/5 prose-pre:rounded-lg
        prose-img:rounded-lg prose-img:shadow-sm
        prose-strong:text-ink
        prose-li:text-ink/80"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
