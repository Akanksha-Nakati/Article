"use client";

import { useRouter } from "next/navigation";
import { Button } from "./Button";
import { useState } from "react";

export function DeleteArticleButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
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
