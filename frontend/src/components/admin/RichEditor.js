'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { Placeholder } from '@tiptap/extension-placeholder';
import { TextAlign } from '@tiptap/extension-text-align';
import { Highlight } from '@tiptap/extension-highlight';
import { Youtube } from '@tiptap/extension-youtube';
import { useEffect, useRef, useState } from 'react';
import {
  AlignCenter, AlignLeft, Bold, Heading2, Heading3, Highlighter, ImagePlus, Italic, Link2, List, ListOrdered,
  Minus, Quote, Redo2, Strikethrough, Underline as UnderlineIcon, Undo2, Video,
} from 'lucide-react';
import { uploadImage } from '@/lib/api';

function Btn({ on, label, onClick, children, disabled }) {
  return (
    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={onClick} disabled={disabled}
      aria-label={label} title={label} aria-pressed={on}
      className={`grid h-9 w-9 place-items-center rounded-lg ${on ? 'bg-indigo text-on-indigo' : 'text-ink-2 hover:bg-sunken'} disabled:opacity-30`}>
      {children}
    </button>
  );
}

export default function RichEditor({ value, onChange, onError }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const insertImages = async (files, editorRef) => {
    const ed = editorRef || editor;
    setUploading(true);
    try {
      for (const f of files) {
        if (!f.type.startsWith('image/')) continue;
        const url = await uploadImage(f);
        ed.chain().focus().setImage({ src: url, alt: f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ') }).run();
      }
    } catch (e) { onError?.(e.message); }
    setUploading(false);
  };

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] }, link: { openOnClick: false, autolink: true } }),
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder: 'Start with the line that made you want to write this…' }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight,
      Youtube.configure({ nocookie: true, width: 640, height: 360 }),
    ],
    content: value,
    editorProps: {
      attributes: { class: 'tiptap story', 'aria-label': 'Story text' },
      handleDrop: (view, event) => {
        const files = [...(event.dataTransfer?.files || [])].filter((f) => f.type.startsWith('image/'));
        if (!files.length) return false;
        event.preventDefault();
        insertImages(files);
        return true;
      },
      handlePaste: (view, event) => {
        const files = [...(event.clipboardData?.files || [])].filter((f) => f.type.startsWith('image/'));
        if (!files.length) return false;
        insertImages(files);
        return true;
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML(), editor.getText()),
  });

  // Pick up outside changes (e.g. restoring a saved draft) without fighting the cursor
  useEffect(() => {
    if (editor && !editor.isFocused && value !== editor.getHTML()) editor.commands.setContent(value || '', { emitUpdate: false });
  }, [value, editor]);

  if (!editor) return <div className="min-h-[480px] rounded-2xl border border-line bg-surface" />;

  const setLink = () => {
    const prev = editor.getAttributes('link').href;
    const url = window.prompt('Paste the link (leave empty to remove it)', prev || 'https://');
    if (url === null) return;
    if (!url || url === 'https://') return editor.chain().focus().extendMarkRange('link').unsetLink().run();
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };
  const addVideo = () => {
    const url = window.prompt('Paste a YouTube link');
    if (url) editor.commands.setYoutubeVideo({ src: url });
  };

  const words = editor.getText().split(/\s+/).filter(Boolean).length;

  return (
    <div className="rounded-2xl border border-line bg-surface">
      <div className="sticky top-16 z-20 flex flex-wrap items-center gap-0.5 rounded-t-2xl border-b border-line bg-surface/95 p-2 backdrop-blur" role="toolbar" aria-label="Formatting">
        <Btn label="Heading" on={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={18} /></Btn>
        <Btn label="Subheading" on={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 size={18} /></Btn>
        <span className="mx-1 h-6 w-px bg-line" />
        <Btn label="Bold" on={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={17} /></Btn>
        <Btn label="Italic" on={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={17} /></Btn>
        <Btn label="Underline" on={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon size={17} /></Btn>
        <Btn label="Strikethrough" on={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough size={17} /></Btn>
        <Btn label="Highlight" on={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()}><Highlighter size={17} /></Btn>
        <Btn label="Link" on={editor.isActive('link')} onClick={setLink}><Link2 size={17} /></Btn>
        <span className="mx-1 h-6 w-px bg-line" />
        <Btn label="Quote" on={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={17} /></Btn>
        <Btn label="Bulleted list" on={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={18} /></Btn>
        <Btn label="Numbered list" on={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={18} /></Btn>
        <Btn label="Section break" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus size={18} /></Btn>
        <Btn label="Align left" on={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}><AlignLeft size={17} /></Btn>
        <Btn label="Centre" on={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}><AlignCenter size={17} /></Btn>
        <span className="mx-1 h-6 w-px bg-line" />
        <Btn label={uploading ? 'Uploading image…' : 'Add image'} disabled={uploading} onClick={() => fileRef.current?.click()}><ImagePlus size={18} /></Btn>
        <Btn label="Add YouTube video" onClick={addVideo}><Video size={18} /></Btn>
        <span className="mx-1 h-6 w-px bg-line" />
        <Btn label="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}><Undo2 size={17} /></Btn>
        <Btn label="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}><Redo2 size={17} /></Btn>
        <span className="ml-auto pr-2 text-xs text-muted">{uploading ? 'Uploading image…' : `${words} words`}</span>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { insertImages([...e.target.files]); e.target.value = ''; }} />
      </div>
      <div className="px-5 py-8 sm:px-10 [&_.story]:mx-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
