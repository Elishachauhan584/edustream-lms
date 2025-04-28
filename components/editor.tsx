"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useState } from "react";

interface EditorProps {
  value: string;
  onChange: (content: string) => void;
  editable?: boolean;
}

export const Editor = ({ value, onChange, editable = true }: EditorProps) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html); // ✅ Use the onChange prop passed from the parent
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!isClient) {
    return null;
  }

  return (
    <div className="editor-container">
      <EditorContent editor={editor} />
    </div>
  );
};
