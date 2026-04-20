"use client";

import { Editor } from "@tiptap/react";
import { useCallback, useRef } from "react";
import { cn } from "@/lib/cn";

interface ToolbarProps {
  editor: Editor;
  articleId?: string;
  onImageUploaded?: (url: string) => void;
}

function ToolBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      className={cn(
        "p-1.5 rounded text-sm font-medium transition-colors",
        active
          ? "bg-accent text-white"
          : "text-ink/60 hover:text-ink hover:bg-ink/8"
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="w-px h-5 bg-ink/15 mx-0.5" />;
}

export function EditorToolbar({ editor, articleId, onImageUploaded }: ToolbarProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const setLink = useCallback(() => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    if (articleId) formData.append("articleId", articleId);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        editor.chain().focus().setImage({ src: data.url }).run();
        onImageUploaded?.(data.url);
      }
    } catch {
      alert("Image upload failed. Check your storage configuration.");
    }
  };

  return (
    <>
      <input
        type="file"
        accept="image/*"
        ref={fileRef}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageUpload(file);
          e.target.value = "";
        }}
      />

      <div className="sticky top-0 z-20 flex flex-wrap items-center gap-0.5 px-4 py-2 bg-paper border-b border-ink/10 rounded-t-lg shadow-sm">
        {/* Text style */}
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <strong>B</strong>
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <em>I</em>
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline"
        >
          <span className="underline">U</span>
        </ToolBtn>

        <Divider />

        {/* Headings */}
        <ToolBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          H1
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          H2
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          H3
        </ToolBtn>

        <Divider />

        {/* Lists */}
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet List"
        >
          • List
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Ordered List"
        >
          1. List
        </ToolBtn>

        <Divider />

        {/* Blocks */}
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Blockquote"
        >
          ❝
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title="Inline Code"
        >
          {"</>"}
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          title="Code Block"
        >
          {"{ }"}
        </ToolBtn>

        <Divider />

        {/* Link & Image */}
        <ToolBtn
          onClick={setLink}
          active={editor.isActive("link")}
          title="Insert Link"
        >
          🔗
        </ToolBtn>
        <ToolBtn
          onClick={() => fileRef.current?.click()}
          title="Upload Image"
        >
          🖼
        </ToolBtn>

        <Divider />

        {/* Clear */}
        <ToolBtn
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          title="Clear formatting"
        >
          ✕ Clear
        </ToolBtn>
      </div>
    </>
  );
}
