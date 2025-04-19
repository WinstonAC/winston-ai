import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import { prisma } from '@/lib/prisma';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  teamRole: string;
}

interface PendingInvite {
  id: string;
  email: string;
  expiresAt: Date;
}

interface TeamPageProps {
  members: TeamMember[];
  pendingInvites: PendingInvite[];
  isAdmin: boolean;
}

export default function TeamPage({ members, pendingInvites, isAdmin }: TeamPageProps) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/team/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: inviteEmail }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send invite');
      }

      setSuccess('Invitation sent successfully!');
      setInviteEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invite');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch('/api/team/update-role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to update role');
      }

      // Refresh the page to show updated roles
      window.location.reload();
    } catch (err) {
      setError('Failed to update role');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Team Management - Winston AI</title>
      </Head>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Team Management</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage your team members and invitations
            </p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-green-50 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* Invite Form */}
          {isAdmin && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Invite New Member</h2>
              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm text-gray-700 mb-1">
                    Email address
                  </label>
                  <div className="flex gap-4">
                    <input
                      type="email"
                      id="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter email address..."
                      required
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                    >
                      {loading ? 'Sending...' : 'Send Invite'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Team Members List */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Team Members</h2>
            </div>
            <ul className="divide-y divide-gray-200">
              {members.map((member) => (
                <li key={member.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                    {isAdmin && (
                      <select
                        value={member.teamRole}
                        onChange={(e) => handleRoleChange(member.id, e.target.value)}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5"
                      >
                        <option value="MEMBER">Member</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Pending Invites */}
          {pendingInvites.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Pending Invites</h2>
              </div>
              <ul className="divide-y divide-gray-200">
                {pendingInvites.map((invite) => (
                  <li key={invite.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-900">{invite.email}</p>
                        <p className="text-xs text-gray-500">
                          Expires: {new Date(invite.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => {/* Add resend invite logic */}}
                          className="text-sm text-purple-600 hover:text-purple-700"
                        >
                          Resend
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session?.user) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      team: {
        include: {
          users: true,
          invites: true,
        },
      },
    },
  });

  if (!user?.team) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }

  const isAdmin = user.teamRole === 'ADMIN' || user.teamRole === 'OWNER';

  return {
    props: {
      members: user.team.users.map((member) => ({
        id: member.id,
        name: member.name,
        email: member.email,
        teamRole: member.teamRole,
      })),
      pendingInvites: user.team.invites.map((invite) => ({
        id: invite.id,
        email: invite.email,
        expiresAt: invite.expiresAt.toISOString(),
      })),
      isAdmin,
    },
  };
}; 