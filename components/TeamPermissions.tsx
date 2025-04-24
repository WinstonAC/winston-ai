import React, { useState, useEffect, useRef } from 'react';
import { usePermissions } from '../contexts/PermissionsContext';
import { UserRole, TeamPermission } from '../types/auth';
import { CheckIcon, XMarkIcon, ExclamationCircleIcon, TrashIcon, PencilIcon, PlusIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { UserGroupIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: TeamPermission[];
  joinedAt: string;
}

interface Team {
  id: string;
  name: string;
  members: TeamMember[];
}

interface FormErrors {
  name?: string;
  email?: string;
  role?: string;
}

export const TeamPermissions: React.FC = () => {
  const { state, dispatch } = usePermissions();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { data: session } = useSession();
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState<Partial<TeamMember>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchTeam = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/team/members');
        if (!response.ok) {
          throw new Error('Failed to fetch team members');
        }
        const data = await response.json();
        if (isMounted) {
          setTeam({
            id: '',
            name: '',
            members: data,
          });
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch team members');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (session?.user) {
      fetchTeam();
    }

    return () => {
      isMounted = false;
    };
  }, [session, setLoading, setTeam, setError]);

  useEffect(() => {
    if (showEditModal && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [showEditModal]);

  const updateMemberRole = async (memberId: string, newRole: TeamMember['role']) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/team/members/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) throw new Error('Failed to update member role');

      setTeam(prev => {
        if (!prev) return null;
        return {
          ...prev,
          members: prev.members.map(member => 
            member.id === memberId ? { ...member, role: newRole } : member
          ),
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update member role');
    } finally {
      setIsUpdating(false);
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const response = await fetch(`/api/team/members/${memberId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove member');

      setTeam(prev => {
        if (!prev) return null;
        return {
          ...prev,
          members: prev.members.filter(member => member.id !== memberId),
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    }
  };

  const inviteMember = async (email: string, role: TeamMember['role']) => {
    try {
      const response = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });

      if (!response.ok) throw new Error('Failed to invite member');

      await fetchTeam(); // Refresh the team data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite member');
    }
  };

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
        setTeam(prev => {
          if (!prev) return null;
          return {
            ...prev,
            members: prev.members.map(m => m.id === savedMember.id ? savedMember : m),
          };
        });
        toast.success('Team member updated successfully');
      } else {
        setTeam(prev => {
          if (!prev) return null;
          return {
            ...prev,
            members: [...prev.members, savedMember],
          };
        });
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
      setIsUpdating(true);
      await removeMember(memberId);
    } catch (error) {
      toast.error('Failed to delete team member');
      console.error('Failed to delete team member:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowEditModal(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse" role="status">
        Loading team...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500" role="alert">
        {error}
      </div>
    );
  }

  if (!team) {
    return (
      <div>
        No team found
      </div>
    );
  }

  const members = team.members || [];
  const isAdmin = members.find(m => m.id === session?.user?.id)?.role === 'admin';

  const handleRoleChange = (memberId: string, newRole: UserRole) => {
    updateMemberRole(memberId, newRole as TeamMember['role']);
  };

  const handlePermissionToggle = (memberId: string, permission: TeamPermission) => {
    setTeam(prev => {
      if (!prev) return null;
      return {
        ...prev,
        members: prev.members.map(member => {
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
        }),
      };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Team Members</h2>
        {isAdmin && (
          <button
            onClick={() => {
              setFormData({});
              setSelectedMember(null);
              setShowEditModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Member
          </button>
        )}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {members.map((member) => (
            <li key={member.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">{member.name.charAt(0)}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{member.name}</div>
                    <div className="text-sm text-gray-500">{member.email}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.id, e.target.value as UserRole)}
                    disabled={!isAdmin || isUpdating}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  {isAdmin && member.id !== session?.user?.id && (
                    <button
                      onClick={() => handleDelete(member.id)}
                      disabled={isUpdating}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
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
                  autoComplete="name"
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
                  autoComplete="email"
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
                  autoComplete="off"
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