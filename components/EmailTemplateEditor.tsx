import React, { useState } from 'react';
import { 
  DocumentTextIcon, 
  EyeIcon, 
  CodeBracketIcon,
  ArrowPathIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  lastModified: string;
}

interface EmailTemplateEditorProps {
  template?: EmailTemplate;
  onSave: (template: Omit<EmailTemplate, 'id' | 'lastModified'>) => void;
  onPreview: (template: Omit<EmailTemplate, 'id' | 'lastModified'>) => void;
}

const EmailTemplateEditor: React.FC<EmailTemplateEditorProps> = ({
  template,
  onSave,
  onPreview
}) => {
  const [name, setName] = useState(template?.name || '');
  const [subject, setSubject] = useState(template?.subject || '');
  const [body, setBody] = useState(template?.body || '');
  const [isPreview, setIsPreview] = useState(false);
  const [showVariables, setShowVariables] = useState(false);

  const availableVariables = [
    { name: '{{lead.name}}', description: 'Lead\'s full name' },
    { name: '{{lead.firstName}}', description: 'Lead\'s first name' },
    { name: '{{lead.company}}', description: 'Lead\'s company name' },
    { name: '{{lead.title}}', description: 'Lead\'s job title' },
    { name: '{{user.name}}', description: 'Your name' },
    { name: '{{user.company}}', description: 'Your company name' },
    { name: '{{meeting.link}}', description: 'Meeting scheduling link' }
  ];

  const handleSave = () => {
    onSave({
      name,
      subject,
      body,
      variables: availableVariables.map(v => v.name)
    });
  };

  const handlePreview = () => {
    onPreview({
      name,
      subject,
      body,
      variables: availableVariables.map(v => v.name)
    });
    setIsPreview(true);
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('email-body') as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newBody = body.substring(0, start) + variable + body.substring(end);
    setBody(newBody);
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <DocumentTextIcon className="h-6 w-6 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-white">
            {template ? 'Edit Template' : 'New Template'}
          </h3>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowVariables(!showVariables)}
            className="text-gray-400 hover:text-white flex items-center"
          >
            <CodeBracketIcon className="h-5 w-5 mr-1" />
            Variables
          </button>
          <button
            onClick={handlePreview}
            className="text-gray-400 hover:text-white flex items-center"
          >
            <EyeIcon className="h-5 w-5 mr-1" />
            Preview
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <CheckIcon className="h-5 w-5 mr-1" />
            Save
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Template Name */}
        <div>
          <label className="block text-sm font-medium text-gray-400">Template Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white"
            placeholder="Enter template name"
          />
        </div>

        {/* Subject Line */}
        <div>
          <label className="block text-sm font-medium text-gray-400">Subject Line</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white"
            placeholder="Enter email subject"
          />
        </div>

        {/* Variables Panel */}
        {showVariables && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-white mb-3">Available Variables</h4>
            <div className="grid grid-cols-2 gap-4">
              {availableVariables.map((variable) => (
                <div
                  key={variable.name}
                  className="flex items-center justify-between p-2 bg-gray-700 rounded-md cursor-pointer hover:bg-gray-600"
                  onClick={() => insertVariable(variable.name)}
                >
                  <div>
                    <p className="text-white font-mono">{variable.name}</p>
                    <p className="text-xs text-gray-400">{variable.description}</p>
                  </div>
                  <button className="text-gray-400 hover:text-white">
                    <ArrowPathIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Email Body */}
        <div>
          <label className="block text-sm font-medium text-gray-400">Email Body</label>
          <textarea
            id="email-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white h-96 font-mono"
            placeholder="Enter email body (HTML supported)"
          />
        </div>

        {/* Preview */}
        {isPreview && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-white mb-3">Preview</h4>
            <div className="bg-white rounded-lg p-4 text-gray-900">
              <p className="font-medium mb-2">Subject: {subject}</p>
              <div dangerouslySetInnerHTML={{ __html: body }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailTemplateEditor; 