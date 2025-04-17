import { useState } from 'react';
import Head from 'next/head';
import CsvUploader from '@/components/CsvUploader';

export default function Upload() {
  const [outreachTemplate, setOutreachTemplate] = useState('');
  const [followUpTemplate, setFollowUpTemplate] = useState('');

  const handleSaveTemplates = () => {
    console.log('Templates saved:', { outreachTemplate, followUpTemplate });
    alert('Saved!');
  };

  return (
    <>
      <Head>
        <title>Upload Leads – Winston AI</title>
        <meta name="description" content="Upload your leads and customize email templates" />
      </Head>

      <div className="max-w-screen-md mx-auto px-6 py-12 bg-brutalist-gray font-mono">
        <h1 className="text-3xl font-bold mb-8">
          Upload Your Leads
        </h1>

        {/* CSV Uploader */}
        <div className="mb-12">
          <CsvUploader />
        </div>

        {/* Email Templates */}
        <div className="space-y-8">
          <div>
            <label className="block font-bold mb-2">
              Outreach Template
            </label>
            <textarea
              value={outreachTemplate}
              onChange={(e) => setOutreachTemplate(e.target.value)}
              className="font-mono border-thicc border-black p-2 w-full h-40 
                       bg-white focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Hi {{name}},

I noticed your company and wanted to reach out..."
            />
          </div>

          <div>
            <label className="block font-bold mb-2">
              Follow
            </label>
            <textarea
              value={followUpTemplate}
              onChange={(e) => setFollowUpTemplate(e.target.value)}
              className="font-mono border-thicc border-black p-2 w-full h-40 
                       bg-white focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Hi {{name}},

I noticed your company and wanted to reach out..."
            />
          </div>
        </div>
      </div>
    </>
  );
} 