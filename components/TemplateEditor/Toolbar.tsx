import React from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link,
  Image,
  Video,
  Undo,
  Redo,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';
import Image from 'next/image';

interface ToolbarProps {
  editor: Editor | null;
  onOpenAssetLibrary: () => void;
}

export default function Toolbar({ editor, onOpenAssetLibrary }: ToolbarProps) {
  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const buttonClass = (isActive: boolean) => `
    p-3 border-4 border-white
    ${isActive ? 'bg-white text-black' : 'bg-black text-white hover:bg-white hover:text-black'}
    transition-colors font-bold
  `;

  return (
    <div className="border-b-4 border-white p-2 flex items-center space-x-2 bg-black">
      {/* Text Formatting */}
      <div className="flex items-center space-x-2 border-r-4 border-white pr-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={buttonClass(editor.isActive('bold'))}
          title="BOLD"
        >
          <Bold size={20} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={buttonClass(editor.isActive('italic'))}
          title="ITALIC"
        >
          <Italic size={20} />
        </button>
      </div>

      {/* Lists */}
      <div className="flex items-center space-x-2 border-r-4 border-white pr-2">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={buttonClass(editor.isActive('bulletList'))}
          title="BULLET LIST"
        >
          <List size={20} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={buttonClass(editor.isActive('orderedList'))}
          title="NUMBERED LIST"
        >
          <ListOrdered size={20} />
        </button>
      </div>

      {/* Alignment */}
      <div className="flex items-center space-x-2 border-r-4 border-white pr-2">
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={buttonClass(editor.isActive({ textAlign: 'left' }))}
          title="ALIGN LEFT"
        >
          <AlignLeft size={20} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={buttonClass(editor.isActive({ textAlign: 'center' }))}
          title="CENTER"
        >
          <AlignCenter size={20} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={buttonClass(editor.isActive({ textAlign: 'right' }))}
          title="ALIGN RIGHT"
        >
          <AlignRight size={20} />
        </button>
      </div>

      {/* Media */}
      <div className="flex items-center space-x-2 border-r-4 border-white pr-2">
        <button
          onClick={addLink}
          className={buttonClass(editor.isActive('link'))}
          title="ADD LINK"
        >
          <Link size={20} />
        </button>
        <button
          onClick={onOpenAssetLibrary}
          className={buttonClass(false)}
          title="INSERT MEDIA"
        >
          <Image
            src={icon}
            alt=""
            width={16}
            height={16}
            className="w-4 h-4"
          />
        </button>
        <button
          onClick={onOpenAssetLibrary}
          className={buttonClass(false)}
          title="INSERT VIDEO"
        >
          <Video size={20} />
        </button>
      </div>

      {/* History */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className={`${buttonClass(false)} disabled:opacity-50`}
          title="UNDO"
        >
          <Undo size={20} />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className={`${buttonClass(false)} disabled:opacity-50`}
          title="REDO"
        >
          <Redo size={20} />
        </button>
      </div>
    </div>
  );
} 