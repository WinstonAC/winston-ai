import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';

interface Lead {
  name: string;
  email: string;
  [key: string]: string; // For any additional fields
}

const CsvUploader: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploading(true);
      setError(null);

      try {
        const results = await new Promise((resolve, reject) => {
          Papa.parse(file, {
            complete: resolve,
            error: reject,
            header: true,
          });
        });

        const parsedLeads = (results as any).data
          .filter((row: any) => row.name && row.email)
          .map((row: any) => ({
            name: row.name,
            email: row.email,
            status: 'Pending',
            classification: null,
          }));

        // Upload leads to the API
        const response = await fetch('/api/leads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(parsedLeads),
        });

        if (!response.ok) {
          throw new Error('Failed to upload leads');
        }

        setLeads(parsedLeads);
      } catch (err) {
        console.error('Error processing CSV:', err);
        setError('Failed to process CSV file. Please check the format and try again.');
      } finally {
        setUploading(false);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: false,
  });

  return (
    <div className="font-mono max-w-6xl mx-auto px-4 py-12">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-black p-12 text-center cursor-pointer bg-[#e5e5e5]
          ${isDragActive ? 'bg-gray-200' : ''}`}
      >
        <input {...getInputProps()} />
        <p className="text-xl">
          {isDragActive
            ? 'Drop your CSV file here'
            : 'Drag and drop your CSV file here, or click to select'}
        </p>
        <p className="mt-2 text-sm">
          File should contain columns for name and email
        </p>
      </div>

      {/* Preview Table */}
      {leads.length > 0 && (
        <div className="mt-8 border-2 border-black">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-black bg-[#e5e5e5]">
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Email</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead, index) => (
                <tr key={index} className="border-b border-black">
                  <td className="p-4">{lead.name}</td>
                  <td className="p-4">{lead.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CsvUploader; 