import { ArticleEditor } from "@/components/editor/ArticleEditor";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Article" };

export default function NewArticlePage() {
  return <ArticleEditor />;
}
