import React, { useState } from 'react';
import { EmailTemplate, defaultTemplates, validateTemplate } from '@/lib/templates';

interface EmailTemplatesProps {
  onSelectTemplate: (template: EmailTemplate) => void;
  onSaveTemplate: (template: EmailTemplate) => void;
}

export default function EmailTemplates({ onSelectTemplate, onSaveTemplate }: EmailTemplatesProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsEditing(false);
    onSelectTemplate(template);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    if (!selectedTemplate) return;

    const validationErrors = validateTemplate(selectedTemplate);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    setIsEditing(false);
    onSaveTemplate(selectedTemplate);

    // Update templates list
    setTemplates(templates.map(t => 
      t.id === selectedTemplate.id ? selectedTemplate : t
    ));
  };

  const handleInputChange = (field: keyof EmailTemplate, value: string) => {
    if (!selectedTemplate) return;

    setSelectedTemplate({
      ...selectedTemplate,
      [field]: value,
      variables: field === 'body' || field === 'subject' 
        ? extractVariables(value)
        : selectedTemplate.variables
    });
  };

  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{\{(\w+)\}\}/g) || [];
    return [...new Set(matches.map(m => m.slice(2, -2)))];
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Email Templates</h2>
        {selectedTemplate && !isEditing && (
          <button
            onClick={handleEditClick}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit Template
          </button>
        )}
      </div>

      {/* Template List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(template => (
          <div
            key={template.id}
            onClick={() => handleTemplateSelect(template)}
            className={`p-4 border rounded cursor-pointer hover:border-blue-500 ${
              selectedTemplate?.id === template.id ? 'border-blue-500 bg-blue-50' : ''
            }`}
          >
            <h3 className="font-medium">{template.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{template.subject}</p>
          </div>
        ))}
      </div>

      {/* Template Editor */}
      {selectedTemplate && isEditing && (
        <div className="mt-6 space-y-4">
          <input
            type="text"
            value={selectedTemplate.name}
            onChange={e => handleInputChange('name', e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Template Name"
          />
          <input
            type="text"
            value={selectedTemplate.subject}
            onChange={e => handleInputChange('subject', e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Subject Line"
          />
          <textarea
            value={selectedTemplate.body}
            onChange={e => handleInputChange('body', e.target.value)}
            className="w-full h-48 p-2 border rounded"
            placeholder="Email Body"
          />
          
          {errors.length > 0 && (
            <div className="text-red-500">
              {errors.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveClick}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Template
            </button>
          </div>
        </div>
      )}

      {/* Template Preview */}
      {selectedTemplate && !isEditing && (
        <div className="mt-6 space-y-4">
          <div className="p-4 border rounded bg-gray-50">
            <h3 className="font-medium">Preview</h3>
            <p className="text-sm text-gray-600 mt-2">Subject: {selectedTemplate.subject}</p>
            <pre className="mt-2 whitespace-pre-wrap">{selectedTemplate.body}</pre>
          </div>
          <div>
            <h4 className="font-medium">Available Variables:</h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedTemplate.variables.map(variable => (
                <span
                  key={variable}
                  className="px-2 py-1 bg-gray-100 rounded text-sm"
                >
                  {`{{${variable}}}`}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 