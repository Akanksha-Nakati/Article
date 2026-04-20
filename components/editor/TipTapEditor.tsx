"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Placeholder from "@tiptap/extension-placeholder";
import { common, createLowlight } from "lowlight";
import { EditorToolbar } from "./EditorToolbar";
import { useEffect } from "react";

const lowlight = createLowlight(common);

interface TipTapEditorProps {
  content?: string;
  contentJson?: object;
  onChange: (html: string, json: object) => void;
  articleId?: string;
  placeholder?: string;
}

export function TipTapEditor({
  content,
  contentJson,
  onChange,
  articleId,
  placeholder = "Start writing your story…",
}: TipTapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Image.configure({ allowBase64: false, inline: false }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } }),
      CodeBlockLowlight.configure({ lowlight }),
      Placeholder.configure({ placeholder }),
    ],
    content: contentJson ?? content ?? "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML(), editor.getJSON());
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[400px] px-6 py-6 focus:outline-none prose prose-lg max-w-none " +
          "prose-headings:font-display prose-headings:text-ink " +
          "prose-p:text-ink/80 prose-a:text-accent " +
          "prose-blockquote:border-l-accent prose-blockquote:italic " +
          "prose-code:text-accent prose-code:bg-ink/5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const incoming = content ?? "";
    if (incoming && incoming !== current) {
      editor.commands.setContent(contentJson ?? content ?? "");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!editor) return null;

  return (
    <div className="border border-ink/10 rounded-lg bg-paper overflow-hidden">
      <EditorToolbar editor={editor} articleId={articleId} />
      <EditorContent editor={editor} />
    </div>
  );
}
