import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';

export default function CampaignImport() {
  const router = typeof window !== "undefined" ? useRouter() : null;
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv') {
      setError('Please upload a CSV file');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const fileContent = await file.text();
      const response = await fetch('/api/campaigns/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/csv',
        },
        body: fileContent,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import campaigns');
      }

      // Redirect to campaigns page after successful import
      if (router) {
        router.push('/campaigns');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import campaigns');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    window.open('/templates/campaign-import-template.csv', '_blank');
  };

  return (
    <div className="p-6 bg-gray-900 rounded-lg">
      <div className="flex flex-col items-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Import Campaigns</h2>
        
        <button
          onClick={() => window.open('/templates/campaign-import-template.csv')}
          className="text-sm text-gray-400 hover:text-gray-300 underline mb-4"
        >
          Download CSV Template
        </button>

        <div className="w-full max-w-md">
          <label
            className={`
              flex flex-col items-center justify-center w-full h-32
              border-2 border-dashed rounded-lg cursor-pointer
              ${isUploading ? 'border-gray-600 bg-gray-800' : 'border-gray-700 hover:border-gray-500'}
            `}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <ArrowUpTrayIcon className="w-8 h-8 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">CSV file only</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        </div>

        {isUploading && (
          <div className="text-gray-400">Uploading...</div>
        )}

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
      </div>
    </div>
  );
} 