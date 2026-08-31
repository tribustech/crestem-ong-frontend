"use client";

import { useCallback, useState, type ReactNode } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Unlink,
} from "lucide-react";
import { RICH_TEXT_PROSE } from "./prose";

const btnBase =
  "flex h-8 w-8 items-center justify-center rounded-lg text-[#475569] transition-colors hover:bg-slate-200/70 disabled:opacity-40";
const btnActive = "bg-[#2dbe8f]/15 text-[#162040]";

function ToolbarButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`${btnBase} ${active ? btnActive : ""}`}
    >
      {children}
    </button>
  );
}

/**
 * TipTap rich-text surface for the Rich Text block editor. Emits an HTML string
 * on every change; the document is constrained to the StarterKit schema below
 * (paragraphs, bold, italic, H2/H3, bullet + ordered lists, links), so pasted
 * markup is filtered down to that known set.
 */
export function RichTextField({
  value,
  onChange,
  invalid,
}: {
  value: string;
  onChange: (html: string) => void;
  invalid?: boolean;
}) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false,
        underline: false,
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: {
            rel: "noopener noreferrer nofollow",
            target: "_blank",
          },
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: `min-h-[180px] px-4 py-3 focus:outline-none ${RICH_TEXT_PROSE}`,
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  const openLink = useCallback(() => {
    if (!editor) return;
    setLinkUrl((editor.getAttributes("link").href as string) ?? "");
    setLinkOpen(true);
  }, [editor]);

  const applyLink = useCallback(() => {
    if (!editor) return;
    const href = linkUrl.trim();
    const chain = editor.chain().focus().extendMarkRange("link");
    if (href) chain.setLink({ href }).run();
    else chain.unsetLink().run();
    setLinkOpen(false);
  }, [editor, linkUrl]);

  if (!editor) {
    return (
      <div className="min-h-[232px] rounded-xl border border-border bg-slate-50" />
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-xl border transition-colors focus-within:ring-2 focus-within:ring-[#2dbe8f]/30 ${
        invalid
          ? "border-[#ef4444]"
          : "border-border focus-within:border-[#2dbe8f]"
      }`}
    >
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-slate-50/70 p-1.5">
        <ToolbarButton
          label="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Cursiv"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={16} />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-border" />

        <ToolbarButton
          label="Titlu 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Titlu 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 size={16} />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-border" />

        <ToolbarButton
          label="Listă cu puncte"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Listă numerotată"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={16} />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-border" />

        <ToolbarButton
          label="Link"
          active={editor.isActive("link")}
          onClick={openLink}
        >
          <LinkIcon size={16} />
        </ToolbarButton>
        {editor.isActive("link") ? (
          <ToolbarButton
            label="Elimină link"
            onClick={() => editor.chain().focus().unsetLink().run()}
          >
            <Unlink size={16} />
          </ToolbarButton>
        ) : null}
      </div>

      {linkOpen ? (
        <div className="flex items-center gap-2 border-b border-border bg-white p-2">
          <input
            autoFocus
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyLink();
              }
              if (e.key === "Escape") setLinkOpen(false);
            }}
            placeholder="https://exemplu.ro"
            className="flex-1 rounded-lg border border-border px-3 py-1.5 text-sm focus:border-[#2dbe8f] focus:outline-none"
          />
          <button
            type="button"
            onClick={applyLink}
            className="rounded-lg bg-[#2563eb] px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
          >
            Aplică
          </button>
          <button
            type="button"
            onClick={() => setLinkOpen(false)}
            className="rounded-lg px-2 py-1.5 text-sm text-[#475569] transition-colors hover:bg-slate-100"
          >
            Anulează
          </button>
        </div>
      ) : null}

      <EditorContent editor={editor} />
    </div>
  );
}
