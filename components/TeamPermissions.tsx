import React, { useState, useEffect, useRef } from 'react';
import { usePermissions } from '../contexts/PermissionsContext';
import { UserRole, TeamPermission } from '../types/auth';
import { CheckIcon, XMarkIcon, ExclamationCircleIcon, TrashIcon, PencilIcon, PlusIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: TeamPermission[];
}

interface FormErrors {
  name?: string;
  email?: string;
  role?: string;
}

export const TeamPermissions: React.FC = () => {
  const { state, dispatch } = usePermissions();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState<Partial<TeamMember>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/team-members');
        if (!response.ok) throw new Error('Failed to fetch team members');
        const data = await response.json();
        setMembers(data);
      } catch (error) {
        toast.error('Failed to load team members');
        console.error('Failed to fetch team members:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, []);

  useEffect(() => {
    if (showEditModal && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [showEditModal]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const url = selectedMember 
        ? `/api/team-members/${selectedMember.id}`
        : '/api/team-members';
      
      const method = selectedMember ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save member');

      const savedMember = await response.json();
      
      if (selectedMember) {
        setMembers(members.map(m => m.id === savedMember.id ? savedMember : m));
        toast.success('Team member updated successfully');
      } else {
        setMembers([...members, savedMember]);
        toast.success('Team member added successfully');
      }

      setShowEditModal(false);
      setFormData({});
      setSelectedMember(null);
    } catch (error) {
      toast.error('Failed to save team member');
      console.error('Failed to save team member:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (memberId: string) => {
    if (!window.confirm('Are you sure you want to delete this team member?')) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/team-members/${memberId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete member');

      setMembers(members.filter(m => m.id !== memberId));
      toast.success('Team member deleted successfully');
    } catch (error) {
      toast.error('Failed to delete team member');
      console.error('Failed to delete team member:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowEditModal(false);
    }
  };

  if (!state.permissions) return null;

  const { teamPermissions } = state.permissions;

  const handleRoleChange = (memberId: string, newRole: UserRole) => {
    setMembers(members.map(member => 
      member.id === memberId ? { ...member, role: newRole } : member
    ));
  };

  const handlePermissionToggle = (memberId: string, permission: TeamPermission) => {
    setMembers(members.map(member => {
      if (member.id === memberId) {
        const hasPermission = member.permissions.includes(permission);
        return {
          ...member,
          permissions: hasPermission
            ? member.permissions.filter(p => p !== permission)
            : [...member.permissions, permission]
        };
      }
      return member;
    }));
  };

  return (
    <div className="p-4 border-2 border-black bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Team Permissions</h3>
        <button
          className="px-4 py-2 border-2 border-black bg-black text-white hover:bg-white hover:text-black flex items-center gap-2"
          onClick={() => {
            setFormData({});
            setSelectedMember(null);
            setShowEditModal(true);
          }}
          aria-label="Add new team member"
        >
          <PlusIcon className="w-5 h-5" />
          Add Member
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-2 border-black">
          <thead>
            <tr className="bg-black text-white">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Role</th>
              <th className="p-2 text-left">Permissions</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map(member => (
              <tr key={member.id} className="border-b border-black">
                <td className="p-2">{member.name}</td>
                <td className="p-2">{member.email}</td>
                <td className="p-2">
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.id, e.target.value as UserRole)}
                    className="border-2 border-black p-1"
                    aria-label={`Change role for ${member.name}`}
                  >
                    {Object.values(UserRole).map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </td>
                <td className="p-2">
                  <div className="flex flex-wrap gap-2">
                    {Object.values(TeamPermission).map(permission => (
                      <button
                        key={permission}
                        onClick={() => handlePermissionToggle(member.id, permission)}
                        className={`px-2 py-1 border-2 ${
                          member.permissions.includes(permission)
                            ? 'border-black bg-black text-white'
                            : 'border-black'
                        }`}
                        aria-label={`Toggle ${permission} permission for ${member.name}`}
                      >
                        {permission}
                      </button>
                    ))}
                  </div>
                </td>
                <td className="p-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedMember(member);
                        setFormData(member);
                        setShowEditModal(true);
                      }}
                      className="p-2 border-2 border-black hover:bg-black hover:text-white"
                      aria-label={`Edit ${member.name}`}
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="p-2 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                      aria-label={`Delete ${member.name}`}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showEditModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditModal(false);
            }
          }}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div 
            ref={modalRef}
            className="bg-white p-6 border-2 border-black w-full max-w-md"
          >
            <h4 id="modal-title" className="text-lg font-bold mb-4">
              {selectedMember ? 'Edit Member' : 'Add Member'}
            </h4>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Name
                </label>
                <input
                  ref={firstInputRef}
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className={`w-full p-2 border-2 ${errors.name ? 'border-red-500' : 'border-black'}`}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
                {errors.name && (
                  <p id="name-error" className="text-red-500 text-sm mt-1 flex items-center">
                    <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  className={`w-full p-2 border-2 ${errors.email ? 'border-red-500' : 'border-black'}`}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="text-red-500 text-sm mt-1 flex items-center">
                    <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium mb-1">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role || ''}
                  onChange={handleInputChange}
                  className={`w-full p-2 border-2 ${errors.role ? 'border-red-500' : 'border-black'}`}
                  aria-invalid={!!errors.role}
                  aria-describedby={errors.role ? 'role-error' : undefined}
                >
                  <option value="">Select a role</option>
                  {Object.values(UserRole).map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                {errors.role && (
                  <p id="role-error" className="text-red-500 text-sm mt-1 flex items-center">
                    <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                    {errors.role}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setFormData({});
                  setSelectedMember(null);
                  setErrors({});
                }}
                className="px-4 py-2 border-2 border-black"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 border-2 border-black bg-black text-white disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-5 h-5" />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 