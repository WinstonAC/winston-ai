import React, { useState } from 'react';
import { 
  UserGroupIcon, 
  UserPlusIcon, 
  Cog6ToothIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  status: 'active' | 'pending';
}

interface TeamSettings {
  name: string;
  emailDomain: string;
  maxMembers: number;
  allowMemberInvites: boolean;
}

interface TeamManagementProps {
  members: TeamMember[];
  settings: TeamSettings;
  onInviteMember: (email: string, role: 'admin' | 'member') => void;
  onUpdateSettings: (settings: Partial<TeamSettings>) => void;
  onRemoveMember: (memberId: string) => void;
  onUpdateMemberRole: (memberId: string, role: 'admin' | 'member') => void;
}

const TeamManagement: React.FC<TeamManagementProps> = ({
  members,
  settings,
  onInviteMember,
  onUpdateSettings,
  onRemoveMember,
  onUpdateMemberRole
}) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [editedSettings, setEditedSettings] = useState(settings);

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteEmail) {
      onInviteMember(inviteEmail, inviteRole);
      setInviteEmail('');
    }
  };

  const handleSettingsUpdate = () => {
    onUpdateSettings(editedSettings);
    setIsEditingSettings(false);
  };

  return (
    <div className="space-y-6">
      {/* Team Settings */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Cog6ToothIcon className="h-6 w-6 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-white">Team Settings</h3>
          </div>
          <button
            onClick={() => setIsEditingSettings(!isEditingSettings)}
            className="text-blue-400 hover:text-blue-300"
          >
            {isEditingSettings ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {isEditingSettings ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">Team Name</label>
              <input
                type="text"
                value={editedSettings.name}
                onChange={(e) => setEditedSettings({ ...editedSettings, name: e.target.value })}
                className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Email Domain</label>
              <input
                type="text"
                value={editedSettings.emailDomain}
                onChange={(e) => setEditedSettings({ ...editedSettings, emailDomain: e.target.value })}
                className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Max Members</label>
              <input
                type="number"
                value={editedSettings.maxMembers}
                onChange={(e) => setEditedSettings({ ...editedSettings, maxMembers: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={editedSettings.allowMemberInvites}
                onChange={(e) => setEditedSettings({ ...editedSettings, allowMemberInvites: e.target.checked })}
                className="h-4 w-4 text-blue-600 rounded border-gray-700"
              />
              <label className="ml-2 block text-sm text-gray-400">Allow Members to Invite Others</label>
            </div>
            <button
              onClick={handleSettingsUpdate}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <span className="text-sm text-gray-400">Team Name</span>
              <p className="text-white">{settings.name}</p>
            </div>
            <div>
              <span className="text-sm text-gray-400">Email Domain</span>
              <p className="text-white">{settings.emailDomain}</p>
            </div>
            <div>
              <span className="text-sm text-gray-400">Max Members</span>
              <p className="text-white">{settings.maxMembers}</p>
            </div>
            <div>
              <span className="text-sm text-gray-400">Member Invites</span>
              <p className="text-white">{settings.allowMemberInvites ? 'Allowed' : 'Restricted'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Team Members */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <UserGroupIcon className="h-6 w-6 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-white">Team Members</h3>
          </div>
          <span className="text-sm text-gray-400">{members.length} members</span>
        </div>

        {/* Invite Form */}
        <form onSubmit={handleInviteSubmit} className="mb-6">
          <div className="flex space-x-4">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 rounded-md bg-gray-800 border-gray-700 text-white"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
              className="rounded-md bg-gray-800 border-gray-700 text-white"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <UserPlusIcon className="h-5 w-5 mr-2" />
              Invite
            </button>
          </div>
        </form>

        {/* Members List */}
        <div className="space-y-4">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div>
                <p className="text-white font-medium">{member.name}</p>
                <p className="text-sm text-gray-400">{member.email}</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-2 py-1 rounded text-xs ${
                  member.role === 'admin' ? 'bg-purple-900 text-purple-300' : 'bg-gray-700 text-gray-300'
                }`}>
                  {member.role}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${
                  member.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
                }`}>
                  {member.status}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onUpdateMemberRole(member.id, member.role === 'admin' ? 'member' : 'admin')}
                    className="text-gray-400 hover:text-white"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onRemoveMember(member.id)}
                    className="text-gray-400 hover:text-red-400"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamManagement; 