"use client";

import { useRouter } from "next/navigation";
import { Button } from "./Button";
import { useState } from "react";

export function RestoreArticleButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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

  return (
    <Button variant="secondary" size="sm" onClick={handleRestore} disabled={loading}>
      {loading ? "…" : "Restore"}
    </Button>
  );
}
