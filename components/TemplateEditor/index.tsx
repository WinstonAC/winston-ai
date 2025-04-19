import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { useTemplateEditor } from '@/lib/stores/templateEditor';
import Toolbar from './Toolbar';
import VariablesSidebar from './VariablesSidebar';
import AssetLibrary from './AssetLibrary';

interface TemplateEditorProps {
  onSave: () => Promise<void>;
}

interface Variable {
  name: string;
  defaultValue: string;
  order?: number;
}

interface Asset {
  type: string;
  url: string;
}

export default function TemplateEditor({ onSave }: TemplateEditorProps) {
  const {
    template,
    updateTemplate,
    isDirty,
    setIsDirty,
    variables,
    addVariable,
    selectedVariable,
    setSelectedVariable,
  } = useTemplateEditor();

  const [showAssetLibrary, setShowAssetLibrary] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: 'Start writing your template...',
      }),
      Typography,
    ],
    content: template?.content as string || '',
    onUpdate: ({ editor }: { editor: Editor }) => {
      updateTemplate({ content: editor.getHTML() });
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'video/*': ['.mp4', '.webm'],
    },
    onDrop: async (files) => {
      try {
        const file = files[0];
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            if (file.type.startsWith('image/')) {
              editor?.chain().focus().setImage({ src: reader.result }).run();
            }
          }
        };
        reader.readAsDataURL(file);
      } catch (error) {
        toast.error('Failed to upload file');
      }
    },
  });

  const insertVariable = (variable: string) => {
    editor?.chain().focus().insertContent(`{{${variable}}}`).run();
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const variable = variables[result.source.index];
    insertVariable(variable.name);
  };

  const dropzoneProps = getRootProps({
    className: 'dropzone',
    onClick: (e: React.MouseEvent) => e.stopPropagation(),
  });

  return (
    <div className="flex h-full bg-black text-white">
      {/* Main Editor */}
      <div className="flex-1 flex flex-col min-h-0 border-4 border-white">
        <Toolbar editor={editor} onOpenAssetLibrary={() => setShowAssetLibrary(true)} />
        
        <div className="flex-1 overflow-auto p-8 bg-black">
          <div
            className="prose prose-invert max-w-none"
            {...dropzoneProps}
          >
            <input {...getInputProps()} />
            <EditorContent editor={editor} />
          </div>
        </div>

        <div className="border-t-4 border-white p-4 flex justify-between items-center bg-black">
          <div className="text-sm font-bold">
            {isDirty ? 'UNSAVED CHANGES' : 'ALL CHANGES SAVED'}
          </div>
          <button
            onClick={onSave}
            disabled={!isDirty}
            className="px-6 py-3 bg-white text-black font-bold border-4 border-white hover:bg-black hover:text-white transition-colors disabled:opacity-50"
          >
            SAVE TEMPLATE
          </button>
        </div>
      </div>

      {/* Variables Sidebar */}
      <div className="w-80 border-l-4 border-white bg-black">
        <div className="p-4">
          <h3 className="text-xl font-bold mb-4">VARIABLES</h3>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="variables">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {variables.map((variable: Variable, index: number) => (
                    <Draggable
                      key={variable.name}
                      draggableId={variable.name}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="p-4 bg-white text-black border-4 border-white hover:bg-black hover:text-white transition-colors cursor-pointer"
                          onClick={() => insertVariable(variable.name)}
                        >
                          {variable.name}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>

      {/* Asset Library Modal */}
      {showAssetLibrary && (
        <AssetLibrary
          onClose={() => setShowAssetLibrary(false)}
          onSelect={(asset: Asset) => {
            if (asset.type === 'image') {
              editor?.chain().focus().setImage({ src: asset.url }).run();
            }
            setShowAssetLibrary(false);
          }}
        />
      )}
    </div>
  );
} 