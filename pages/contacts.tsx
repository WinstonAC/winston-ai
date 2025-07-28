import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Papa from 'papaparse';

interface Contact {
  id: string;
  full_name: string;
  email: string;
  company?: string;
  tags?: string[];
  status?: string;
  created_at: string;
}

interface CSVRow {
  full_name: string;
  email: string;
  company?: string;
  tags?: string;
  status?: string;
}

interface UploadResult {
  success: number;
  errors: string[];
  total: number;
}

export default function Contacts() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newContact, setNewContact] = useState({
    full_name: '',
    email: '',
    company: '',
    tags: '',
    status: 'new'
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contacts:', error);
        return;
      }

      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newContact.email,
          name: newContact.full_name,
          company: newContact.company,
          status: newContact.status || 'new'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add contact');
      }

      const newContactData = await response.json();
      
      const contactToAdd: Contact = {
        id: newContactData.id,
        full_name: newContactData.name || newContact.full_name,
        email: newContactData.email,
        company: newContact.company,
        tags: newContact.tags ? [newContact.tags] : [],
        status: newContactData.status,
        created_at: newContactData.created_at
      };

      setContacts([contactToAdd, ...contacts]);
      setNewContact({ full_name: '', email: '', company: '', tags: '', status: 'new' });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding contact:', error);
      alert('Error adding contact. Please try again.');
    }
  };

  const validateCSVRow = (row: any, index: number): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!row.full_name || row.full_name.trim() === '') {
      errors.push(`Row ${index + 1}: Full name is required`);
    }
    
    if (!row.email || row.email.trim() === '') {
      errors.push(`Row ${index + 1}: Email is required`);
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email.trim())) {
      errors.push(`Row ${index + 1}: Invalid email format`);
    }
    
    return { valid: errors.length === 0, errors };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadResult(null);

    try {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const { data, errors } = results;
          
          if (errors.length > 0) {
            setUploadResult({
              success: 0,
              errors: errors.map(e => `Parse error: ${e.message}`),
              total: 0
            });
            setUploading(false);
            return;
          }

          const validRows: CSVRow[] = [];
          const validationErrors: string[] = [];

          // Validate each row
          data.forEach((row: any, index: number) => {
            const validation = validateCSVRow(row, index);
            if (validation.valid) {
              validRows.push({
                full_name: row.full_name.trim(),
                email: row.email.trim(),
                company: row.company?.trim() || '',
                tags: row.tags?.trim() || '',
                status: row.status?.trim() || 'new'
              });
            } else {
              validationErrors.push(...validation.errors);
            }
          });

          if (validRows.length === 0) {
            setUploadResult({
              success: 0,
              errors: validationErrors,
              total: data.length
            });
            setUploading(false);
            return;
          }

          // Batch insert to Supabase
          try {
            const contactsToInsert = validRows.map(row => ({
              user_id: 'demo-user-123',
              full_name: row.full_name,
              email: row.email,
              company: row.company,
              tags: row.tags ? row.tags.split(',').map((tag: string) => tag.trim()) : [],
              status: row.status
            }));

            const { data: insertedData, error } = await supabase
              .from('leads')
              .insert(contactsToInsert)
              .select();

            if (error) {
              throw error;
            }

            setUploadResult({
              success: insertedData?.length || 0,
              errors: validationErrors,
              total: data.length
            });

            // Refresh contacts list
            await fetchContacts();
          } catch (error) {
            console.error('Error inserting contacts:', error);
            setUploadResult({
              success: 0,
              errors: [...validationErrors, `Database error: ${error}`],
              total: data.length
            });
          }
        },
        error: (error) => {
          setUploadResult({
            success: 0,
            errors: [`File parsing error: ${error.message}`],
            total: 0
          });
        }
      });
    } catch (error) {
      setUploadResult({
        success: 0,
        errors: [`Upload error: ${error}`],
        total: 0
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/templates/contacts-template.csv';
    link.download = 'contacts-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetUpload = () => {
    setShowUploadModal(false);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-[#32CD32] font-mono">Loading contacts...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Contacts - Winston AI</title>
        <meta name="description" content="Manage your contacts and leads" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-mono text-[#32CD32]">CONTACTS</h1>
            <div className="flex gap-3">
              <button
                onClick={downloadTemplate}
                className="border border-[#32CD32] text-[#32CD32] px-4 py-2 font-mono font-bold hover:bg-[#32CD32]/10 transition-colors"
              >
                Download Template
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-gray-700 text-white px-4 py-2 font-mono font-bold hover:bg-gray-600 transition-colors"
              >
                Upload CSV
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-[#32CD32] text-black px-6 py-2 font-mono font-bold hover:bg-green-400 transition-colors"
              >
                ADD CONTACT
              </button>
            </div>
          </div>

          {/* Contacts List */}
          {contacts.length === 0 ? (
            <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-gray-800 text-center">
              <p className="text-gray-400 font-mono">NO CONTACTS FOUND</p>
              <p className="text-gray-500 font-mono text-sm mt-2">Add your first contact or upload a CSV file</p>
            </div>
          ) : (
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-mono font-bold text-[#32CD32] uppercase tracking-wider">NAME</th>
                      <th className="px-6 py-3 text-left text-xs font-mono font-bold text-[#32CD32] uppercase tracking-wider">EMAIL</th>
                      <th className="px-6 py-3 text-left text-xs font-mono font-bold text-[#32CD32] uppercase tracking-wider">COMPANY</th>
                      <th className="px-6 py-3 text-left text-xs font-mono font-bold text-[#32CD32] uppercase tracking-wider">TAGS</th>
                      <th className="px-6 py-3 text-left text-xs font-mono font-bold text-[#32CD32] uppercase tracking-wider">STATUS</th>
                      <th className="px-6 py-3 text-left text-xs font-mono font-bold text-[#32CD32] uppercase tracking-wider">CREATED</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {contacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-gray-800/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-white">{contact.full_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-300">{contact.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-300">{contact.company || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                          {contact.tags && contact.tags.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {contact.tags.map((tag, index) => (
                                <span key={index} className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                          <span className={`px-2 py-1 rounded text-xs ${
                            contact.status === 'qualified' ? 'bg-green-900 text-green-300' :
                            contact.status === 'contacted' ? 'bg-blue-900 text-blue-300' :
                            contact.status === 'converted' ? 'bg-purple-900 text-purple-300' :
                            'bg-gray-700 text-gray-300'
                          }`}>
                            {contact.status || 'new'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-400">
                          {new Date(contact.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-[#32CD32] rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-mono text-[#32CD32] mb-4">ADD NEW CONTACT</h2>
            <form onSubmit={handleAddContact} className="space-y-4">
              <div>
                <label className="block text-sm font-mono text-gray-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newContact.full_name}
                  onChange={(e) => setNewContact({...newContact, full_name: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-600 rounded text-white p-2 font-mono focus:border-[#32CD32]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-mono text-gray-300 mb-1">Email *</label>
                <input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-600 rounded text-white p-2 font-mono focus:border-[#32CD32]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-mono text-gray-300 mb-1">Company</label>
                <input
                  type="text"
                  value={newContact.company}
                  onChange={(e) => setNewContact({...newContact, company: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-600 rounded text-white p-2 font-mono focus:border-[#32CD32]"
                />
              </div>
              <div>
                <label className="block text-sm font-mono text-gray-300 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newContact.tags}
                  onChange={(e) => setNewContact({...newContact, tags: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-600 rounded text-white p-2 font-mono focus:border-[#32CD32]"
                  placeholder="lead, prospect, qualified"
                />
              </div>
              <div>
                <label className="block text-sm font-mono text-gray-300 mb-1">Status</label>
                <select
                  value={newContact.status}
                  onChange={(e) => setNewContact({...newContact, status: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-600 rounded text-white p-2 font-mono focus:border-[#32CD32]"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="converted">Converted</option>
                  <option value="unqualified">Unqualified</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#32CD32] text-black px-4 py-2 font-mono font-bold hover:bg-green-400 transition-colors"
                >
                  ADD CONTACT
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-700 text-white px-4 py-2 font-mono font-bold hover:bg-gray-600 transition-colors"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload CSV Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-[#32CD32] rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-mono text-[#32CD32] mb-4">UPLOAD CSV</h2>
            
            {!uploadResult ? (
              <div className="space-y-4">
                <div className="text-sm font-mono text-gray-300">
                  <p>Upload a CSV file with the following columns:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li><strong>full_name</strong> (required)</li>
                    <li><strong>email</strong> (required)</li>
                    <li><strong>company</strong> (optional)</li>
                    <li><strong>tags</strong> (optional, comma-separated)</li>
                    <li><strong>status</strong> (optional: new, contacted, qualified, converted, unqualified)</li>
                  </ul>
                </div>
                
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="bg-[#32CD32] text-black px-6 py-3 font-mono font-bold hover:bg-green-400 transition-colors disabled:opacity-50"
                  >
                    {uploading ? 'UPLOADING...' : 'CHOOSE CSV FILE'}
                  </button>
                  <p className="text-sm text-gray-400 mt-2">or drag and drop your CSV file here</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${
                  uploadResult.success > 0 ? 'bg-green-900/50 border border-green-500' : 'bg-red-900/50 border border-red-500'
                }`}>
                  <h3 className="font-mono font-bold text-lg mb-2">
                    {uploadResult.success > 0 ? 'Upload Successful!' : 'Upload Failed'}
                  </h3>
                  <p className="font-mono text-sm">
                    Successfully uploaded: <strong>{uploadResult.success}</strong> of <strong>{uploadResult.total}</strong> contacts
                  </p>
                  {uploadResult.errors.length > 0 && (
                    <div className="mt-3">
                      <p className="font-mono text-sm font-bold text-red-300 mb-1">Errors:</p>
                      <ul className="text-xs font-mono text-red-300 space-y-1 max-h-32 overflow-y-auto">
                        {uploadResult.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex gap-3 pt-4">
              {uploadResult ? (
                <button
                  onClick={resetUpload}
                  className="flex-1 bg-[#32CD32] text-black px-4 py-2 font-mono font-bold hover:bg-green-400 transition-colors"
                >
                  UPLOAD ANOTHER
                </button>
              ) : (
                <button
                  onClick={downloadTemplate}
                  className="flex-1 border border-[#32CD32] text-[#32CD32] px-4 py-2 font-mono font-bold hover:bg-[#32CD32]/10 transition-colors"
                >
                  DOWNLOAD TEMPLATE
                </button>
              )}
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 bg-gray-700 text-white px-4 py-2 font-mono font-bold hover:bg-gray-600 transition-colors"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
