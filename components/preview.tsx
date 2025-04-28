"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface PreviewProps {
  value: string;
}

export const Preview = ({ value }: PreviewProps) => {
  const editor = useEditor({
    editable: false,
    extensions: [StarterKit],
    content: value,
  });

  return (
    <div className="bg-white border rounded-lg p-2 min-h-[150px]">
      <EditorContent editor={editor} />
    </div>
  );
};
