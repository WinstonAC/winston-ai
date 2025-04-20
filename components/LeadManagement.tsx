import React, { useState } from 'react';
import { 
  UserGroupIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  title: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  lastContact: string;
  interactions: Interaction[];
}

interface Interaction {
  id: string;
  type: 'email' | 'call' | 'meeting' | 'note';
  date: string;
  content: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface LeadManagementProps {
  leads: Lead[];
  onAddLead: (lead: Omit<Lead, 'id' | 'interactions'>) => void;
  onUpdateLead: (leadId: string, updates: Partial<Lead>) => void;
  onDeleteLead: (leadId: string) => void;
  onAddInteraction: (leadId: string, interaction: Omit<Interaction, 'id'>) => void;
}

const LeadManagement: React.FC<LeadManagementProps> = ({
  leads,
  onAddLead,
  onUpdateLead,
  onDeleteLead,
  onAddInteraction
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddLead, setShowAddLead] = useState(false);
  const [showAddInteraction, setShowAddInteraction] = useState<string | null>(null);
  const [newLead, setNewLead] = useState<Omit<Lead, 'id' | 'interactions'>>({
    name: '',
    email: '',
    company: '',
    title: '',
    status: 'new',
    lastContact: new Date().toISOString()
  });
  const [newInteraction, setNewInteraction] = useState<Omit<Interaction, 'id'>>({
    type: 'email',
    date: new Date().toISOString(),
    content: '',
    status: 'scheduled'
  });

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddLead = () => {
    onAddLead(newLead);
    setNewLead({
      name: '',
      email: '',
      company: '',
      title: '',
      status: 'new',
      lastContact: new Date().toISOString()
    });
    setShowAddLead(false);
  };

  const handleAddInteraction = (leadId: string) => {
    onAddInteraction(leadId, newInteraction);
    setNewInteraction({
      type: 'email',
      date: new Date().toISOString(),
      content: '',
      status: 'scheduled'
    });
    setShowAddInteraction(null);
  };

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'new': return 'bg-gray-500';
      case 'contacted': return 'bg-blue-500';
      case 'qualified': return 'bg-green-500';
      case 'converted': return 'bg-purple-500';
      case 'lost': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <UserGroupIcon className="h-6 w-6 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-white">Lead Management</h3>
        </div>
        <button
          onClick={() => setShowAddLead(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Add Lead
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search leads..."
            className="w-full pl-10 pr-4 py-2 rounded-md bg-gray-800 border-gray-700 text-white"
          />
        </div>
        <div className="flex items-center space-x-2">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md bg-gray-800 border-gray-700 text-white"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>
        </div>
      </div>

      {/* Leads List */}
      <div className="space-y-4">
        {filteredLeads.map((lead) => (
          <div key={lead.id} className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-white font-medium">{lead.name}</h4>
                <p className="text-sm text-gray-400">{lead.title} at {lead.company}</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-2 py-1 rounded text-xs ${getStatusColor(lead.status)}`}>
                  {lead.status}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowAddInteraction(lead.id)}
                    className="text-gray-400 hover:text-white"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDeleteLead(lead.id)}
                    className="text-gray-400 hover:text-red-400"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
              <div className="flex items-center">
                <EnvelopeIcon className="h-4 w-4 mr-1" />
                {lead.email}
              </div>
              {lead.phone && (
                <div className="flex items-center">
                  <PhoneIcon className="h-4 w-4 mr-1" />
                  {lead.phone}
                </div>
              )}
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                Last contact: {new Date(lead.lastContact).toLocaleDateString()}
              </div>
            </div>

            {/* Interactions */}
            <div className="space-y-2">
              {lead.interactions.map((interaction) => (
                <div key={interaction.id} className="flex items-start space-x-2 p-2 bg-gray-700 rounded">
                  {interaction.type === 'email' && <EnvelopeIcon className="h-4 w-4 text-gray-400 mt-1" />}
                  {interaction.type === 'call' && <PhoneIcon className="h-4 w-4 text-gray-400 mt-1" />}
                  {interaction.type === 'meeting' && <CalendarIcon className="h-4 w-4 text-gray-400 mt-1" />}
                  {interaction.type === 'note' && <ChatBubbleLeftIcon className="h-4 w-4 text-gray-400 mt-1" />}
                  <div>
                    <p className="text-sm text-white">{interaction.content}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(interaction.date).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Interaction Form */}
            {showAddInteraction === lead.id && (
              <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Type</label>
                    <select
                      value={newInteraction.type}
                      onChange={(e) => setNewInteraction({ ...newInteraction, type: e.target.value as any })}
                      className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white"
                    >
                      <option value="email">Email</option>
                      <option value="call">Call</option>
                      <option value="meeting">Meeting</option>
                      <option value="note">Note</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Content</label>
                    <textarea
                      value={newInteraction.content}
                      onChange={(e) => setNewInteraction({ ...newInteraction, content: e.target.value })}
                      className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setShowAddInteraction(null)}
                      className="px-4 py-2 text-gray-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleAddInteraction(lead.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add Interaction
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Lead Modal */}
      {showAddLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-white mb-4">Add New Lead</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400">Name</label>
                <input
                  type="text"
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Email</label>
                <input
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Company</label>
                <input
                  type="text"
                  value={newLead.company}
                  onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Title</label>
                <input
                  type="text"
                  value={newLead.title}
                  onChange={(e) => setNewLead({ ...newLead, title: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowAddLead(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddLead}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Lead
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadManagement; 