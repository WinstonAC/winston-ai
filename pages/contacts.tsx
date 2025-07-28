import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface Contact {
  id: string;
  full_name: string;
  email: string;
  company?: string;
  tags?: string[];
  status?: string;
  created_at: string;
}

export default function Contacts() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
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
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Convert tags string to array
      const contactData = {
        ...newContact,
        tags: newContact.tags ? [newContact.tags] : [],
        user_id: 'demo-user-123' // Demo user ID for bypassed auth
      };

      const { data, error } = await supabase
        .from('leads')
        .insert([contactData])
        .select();

      if (error) {
        console.error('Error adding contact:', error);
        alert('Error adding contact. Please try again.');
        return;
      }

      setContacts([data[0], ...contacts]);
      setNewContact({ full_name: '', email: '', company: '', tags: '', status: 'new' });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error:', error);
      alert('Error adding contact. Please try again.');
    }
  };

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
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#32CD32] text-black px-6 py-2 font-mono font-bold hover:bg-green-400 transition-colors"
            >
              ADD CONTACT
            </button>
          </div>

          {/* Contacts Table */}
          <div className="bg-black border-2 border-[#32CD32] overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <span className="text-[#32CD32] font-mono">LOADING CONTACTS...</span>
              </div>
            ) : contacts.length === 0 ? (
              <div className="p-8 text-center">
                <span className="text-gray-400 font-mono">NO CONTACTS FOUND</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#32CD32]">
                      <th className="px-6 py-4 text-left font-mono text-[#32CD32]">NAME</th>
                      <th className="px-6 py-4 text-left font-mono text-[#32CD32]">EMAIL</th>
                      <th className="px-6 py-4 text-left font-mono text-[#32CD32]">COMPANY</th>
                      <th className="px-6 py-4 text-left font-mono text-[#32CD32]">TAGS</th>
                      <th className="px-6 py-4 text-left font-mono text-[#32CD32]">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((contact) => (
                      <tr key={contact.id} className="border-b border-gray-800 hover:bg-gray-900">
                        <td className="px-6 py-4 font-mono text-white">{contact.full_name}</td>
                        <td className="px-6 py-4 font-mono text-gray-300">{contact.email}</td>
                        <td className="px-6 py-4 font-mono text-gray-300">{contact.company || '-'}</td>
                        <td className="px-6 py-4 font-mono text-gray-300">{contact.tags ? contact.tags.join(', ') : '-'}</td>
                        <td className="px-6 py-4 font-mono text-gray-300">{contact.status || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Add Contact Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-black border-2 border-[#32CD32] p-8 max-w-md w-full mx-4">
              <h2 className="text-xl font-mono text-[#32CD32] mb-6">ADD NEW CONTACT</h2>
              
              <form onSubmit={handleAddContact} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="FULL NAME"
                    value={newContact.full_name}
                    onChange={(e) => setNewContact({ ...newContact, full_name: e.target.value })}
                    className="w-full p-3 bg-black border border-gray-600 text-white font-mono focus:border-[#32CD32] focus:outline-none"
                    required
                  />
                </div>
                
                <div>
                  <input
                    type="email"
                    placeholder="EMAIL"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    className="w-full p-3 bg-black border border-gray-600 text-white font-mono focus:border-[#32CD32] focus:outline-none"
                    required
                  />
                </div>
                
                <div>
                  <input
                    type="text"
                    placeholder="COMPANY"
                    value={newContact.company}
                    onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                    className="w-full p-3 bg-black border border-gray-600 text-white font-mono focus:border-[#32CD32] focus:outline-none"
                  />
                </div>
                
                <div>
                  <input
                    type="text"
                    placeholder="TAGS"
                    value={newContact.tags}
                    onChange={(e) => setNewContact({ ...newContact, tags: e.target.value })}
                    className="w-full p-3 bg-black border border-gray-600 text-white font-mono focus:border-[#32CD32] focus:outline-none"
                  />
                </div>
                
                <div>
                  <select
                    value={newContact.status}
                    onChange={(e) => setNewContact({ ...newContact, status: e.target.value })}
                    className="w-full p-3 bg-black border border-gray-600 text-white font-mono focus:border-[#32CD32] focus:outline-none"
                  >
                    <option value="new">NEW</option>
                    <option value="contacted">CONTACTED</option>
                    <option value="qualified">QUALIFIED</option>
                    <option value="unqualified">UNQUALIFIED</option>
                    <option value="converted">CONVERTED</option>
                  </select>
                </div>

                <div className="flex space-x-4 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-[#32CD32] text-black py-3 font-mono font-bold hover:bg-green-400 transition-colors"
                  >
                    ADD CONTACT
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 border border-gray-600 text-gray-300 py-3 font-mono hover:bg-gray-800 transition-colors"
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 