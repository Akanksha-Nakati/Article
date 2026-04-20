"use client";

import { useRouter } from "next/navigation";
import { Button } from "./Button";
import { useState } from "react";

export function DeleteArticleButton({
  id,
  title,
  deleted,
}: {
  id: string;
  title: string;
  deleted: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Move "${title}" to trash? It will stay in the database but disappear from the public site.`)) return;
    setLoading(true);
    try {
      await fetch(`/api/articles/${id}`, { method: "DELETE" });
      router.refresh();
    } catch {
      alert("Failed to delete article.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore() {
    setLoading(true);
    try {
      await fetch(`/api/articles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restore: true }),
      });
      router.refresh();
    } catch {
      alert("Failed to restore article.");
    } finally {
      setLoading(false);
    }
  }

  if (deleted) {
    return (
      <Button
        variant="secondary"
        size="sm"
        onClick={handleRestore}
        disabled={loading}
      >
        {loading ? "…" : "Restore"}
      </Button>
    );
  }

  return (
    <Button
      variant="danger"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
    >
      {loading ? "…" : "Delete"}
    </Button>
  );
}
