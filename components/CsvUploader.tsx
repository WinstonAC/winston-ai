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

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      Papa.parse(file, {
        complete: (results) => {
          // Assuming the CSV has headers 'name' and 'email'
          const parsedLeads = results.data.slice(1).map((row: any) => ({
            name: row[0],
            email: row[1],
          }));
          setLeads(parsedLeads);
        },
        header: false,
      });
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