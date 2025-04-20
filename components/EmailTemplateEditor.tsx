import React, { useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import { 
  DocumentTextIcon, 
  PhotoIcon, 
  LinkIcon, 
  TrashIcon,
  PlusIcon,
  SaveIcon 
} from '@heroicons/react/24/outline';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables: string[];
}

interface EmailTemplateEditorProps {
  template?: EmailTemplate;
  onSave: (template: Omit<EmailTemplate, 'id'>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

const EmailTemplateEditor: React.FC<EmailTemplateEditorProps> = ({ 
  template, 
  onSave, 
  onDelete 
}) => {
  const [name, setName] = useState(template?.name || '');
  const [subject, setSubject] = useState(template?.subject || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: 'Write your email template here...',
      }),
      Typography,
    ],
    content: template?.content || '',
  });

  const handleSave = useCallback(async () => {
    if (!editor || !name || !subject) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave({
        name,
        subject,
        content: editor.getHTML(),
        variables: extractVariables(editor.getHTML()),
      });
    } catch (err) {
      setError('Failed to save template. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [editor, name, subject, onSave]);

  const extractVariables = (content: string): string[] => {
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const matches = content.match(variableRegex);
    return matches ? [...new Set(matches.map(match => match.slice(2, -2)))] : [];
  };

  const insertVariable = (variable: string) => {
    if (editor) {
      editor.commands.insertContent(`{{${variable}}}`);
    }
  };

  const availableVariables = [
    'firstName',
    'lastName',
    'company',
    'position',
    'email',
    'phone',
    'customField1',
    'customField2',
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {template ? 'Edit Template' : 'New Template'}
        </h2>
        <div className="flex space-x-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <SaveIcon className="h-5 w-5 mr-2" />
            {isSaving ? 'Saving...' : 'Save Template'}
          </button>
          {template && onDelete && (
            <button
              onClick={() => onDelete(template.id)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <TrashIcon className="h-5 w-5 mr-2" />
              Delete Template
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="template-name" className="block text-sm font-medium text-gray-700">
            Template Name
          </label>
          <input
            type="text"
            id="template-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter template name"
          />
        </div>

        <div>
          <label htmlFor="template-subject" className="block text-sm font-medium text-gray-700">
            Email Subject
          </label>
          <input
            type="text"
            id="template-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter email subject"
          />
        </div>

        <div className="border rounded-lg">
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={`p-1 rounded ${
                  editor?.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-100'
                }`}
              >
                <span className="font-bold">B</span>
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className={`p-1 rounded ${
                  editor?.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-100'
                }`}
              >
                <span className="italic">I</span>
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className={`p-1 rounded ${
                  editor?.isActive('bulletList') ? 'bg-gray-200' : 'hover:bg-gray-100'
                }`}
              >
                <DocumentTextIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => {
                  const url = window.prompt('Enter URL');
                  if (url) {
                    editor?.chain().focus().setLink({ href: url }).run();
                  }
                }}
                className={`p-1 rounded ${
                  editor?.isActive('link') ? 'bg-gray-200' : 'hover:bg-gray-100'
                }`}
              >
                <LinkIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => {
                  const url = window.prompt('Enter image URL');
                  if (url) {
                    editor?.chain().focus().setImage({ src: url }).run();
                  }
                }}
                className="p-1 rounded hover:bg-gray-100"
              >
                <PhotoIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="p-4">
            <EditorContent editor={editor} className="prose max-w-none" />
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Available Variables</h3>
          <div className="grid grid-cols-2 gap-2">
            {availableVariables.map((variable) => (
              <button
                key={variable}
                onClick={() => insertVariable(variable)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                {variable}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplateEditor; 
export default EmailTemplateEditor; 