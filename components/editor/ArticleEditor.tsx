"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TipTapEditor } from "./TipTapEditor";
import { Button } from "@/components/ui/Button";

interface ArticleEditorProps {
  initialData?: {
    id: string;
    title: string;
    subtitle: string | null;
    bodyHtml: string;
    bodyJson: object | null;
    tags: { tag: { name: string } }[];
    status: "DRAFT" | "PUBLISHED";
    coverImageUrl: string | null;
  };
}

export function ArticleEditor({ initialData }: ArticleEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [subtitle, setSubtitle] = useState(initialData?.subtitle ?? "");
  const [tags, setTags] = useState(
    initialData?.tags.map((t) => t.tag.name).join(", ") ?? ""
  );
  const [bodyHtml, setBodyHtml] = useState(initialData?.bodyHtml ?? "");
  const [bodyJson, setBodyJson] = useState<object | null>(initialData?.bodyJson ?? null);
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.coverImageUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [articleId, setArticleId] = useState<string | undefined>(initialData?.id);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tagArray = tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const buildPayload = useCallback(
    (status: "DRAFT" | "PUBLISHED") => ({
      title,
      subtitle: subtitle || null,
      bodyHtml,
      bodyJson,
      tags: tagArray,
      status,
      coverImageUrl: coverImageUrl || null,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [title, subtitle, bodyHtml, bodyJson, tags, coverImageUrl]
  );

  const saveArticle = useCallback(
    async (status: "DRAFT" | "PUBLISHED" = "DRAFT", silent = false) => {
      if (!title.trim()) {
        if (!silent) alert("Please add a title before saving.");
        return;
      }

      if (!silent) setSaving(true);

      try {
        const payload = buildPayload(status);
        const url = articleId ? `/api/articles/${articleId}` : "/api/articles";
        const method = articleId ? "PUT" : "POST";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Save failed");

        const data = await res.json();

        if (!articleId) {
          setArticleId(data.id);
          router.replace(`/admin/editor/${data.id}`);
        }

        setLastSaved(new Date().toLocaleTimeString());
      } catch {
        if (!silent) alert("Failed to save. Please try again.");
      } finally {
        if (!silent) setSaving(false);
      }
    },
    [articleId, buildPayload, router, title]
  );

  const publishArticle = async () => {
    if (!title.trim()) {
      alert("Please add a title before publishing.");
      return;
    }
    setPublishing(true);
    try {
      const payload = buildPayload("PUBLISHED");
      const url = articleId ? `/api/articles/${articleId}` : "/api/articles";
      const method = articleId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Publish failed");

      const data = await res.json();
      router.push(`/articles/${data.slug}`);
    } catch {
      alert("Failed to publish. Please try again.");
    } finally {
      setPublishing(false);
    }
  };

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!title.trim()) return;

    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);

    autoSaveRef.current = setTimeout(() => {
      saveArticle("DRAFT", true);
    }, 30000);

    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    };
  }, [title, subtitle, bodyHtml, tags, coverImageUrl, saveArticle]);

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const subtitleRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/dashboard")}
        >
          ← Dashboard
        </Button>

        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="text-xs text-ink/40 hidden sm:block">
              Saved at {lastSaved}
            </span>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => saveArticle("DRAFT")}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save draft"}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={publishArticle}
            disabled={publishing}
          >
            {publishing ? "Publishing…" : "Publish"}
          </Button>
        </div>
      </div>

      {/* Cover image URL */}
      <div className="mb-4">
        <input
          type="url"
          placeholder="Cover image URL (optional)"
          value={coverImageUrl}
          onChange={(e) => setCoverImageUrl(e.target.value)}
          className="w-full text-sm text-ink/50 bg-transparent border-none outline-none placeholder:text-ink/30"
        />
        {coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverImageUrl}
            alt="Cover preview"
            className="mt-3 w-full max-h-56 object-cover rounded-lg"
          />
        )}
      </div>

      {/* Title */}
      <textarea
        ref={titleRef}
        value={title}
        placeholder="Article title"
        rows={1}
        onChange={(e) => {
          setTitle(e.target.value);
          autoResize(e.target);
        }}
        onInput={(e) => autoResize(e.currentTarget)}
        className="w-full resize-none overflow-hidden border-none outline-none bg-transparent font-display text-4xl sm:text-5xl font-bold text-ink placeholder:text-ink/25 mb-3 leading-tight"
      />

      {/* Subtitle */}
      <textarea
        ref={subtitleRef}
        value={subtitle}
        placeholder="Subtitle (optional)"
        rows={1}
        onChange={(e) => {
          setSubtitle(e.target.value);
          autoResize(e.target);
        }}
        onInput={(e) => autoResize(e.currentTarget)}
        className="w-full resize-none overflow-hidden border-none outline-none bg-transparent text-xl text-ink/60 italic placeholder:text-ink/25 mb-4 leading-snug"
      />

      {/* Tags */}
      <input
        type="text"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Tags — comma separated (e.g. design, tech, writing)"
        className="w-full text-sm text-ink/50 bg-transparent border-none outline-none placeholder:text-ink/30 mb-8"
      />

      <div className="border-t border-ink/10 mb-8" />

      {/* Body editor */}
      <TipTapEditor
        content={initialData?.bodyHtml}
        contentJson={initialData?.bodyJson ?? undefined}
        onChange={(html, json) => {
          setBodyHtml(html);
          setBodyJson(json);
        }}
        articleId={articleId}
      />
    </div>
  );
}
