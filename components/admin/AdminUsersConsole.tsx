'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Users,
  Search,
  Shield,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  ChevronRight,
  Loader2,
  PencilLine,
  ShieldCheck,
  Trash2,
  UserCog
} from 'lucide-react';
import { useNotifications } from '@/components/NotificationCenter';

interface UserSummary {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  emailVerified: Date | null;
  createdAt: Date;
}

interface Address {
  id: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postal: string;
  country: string;
}

interface UserDetails extends UserSummary {
  addresses?: Address[];
  orders?: Array<{
    id: string;
    total: number;
    status: string;
    createdAt: Date;
  }>;
}

export function AdminUsersConsole() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { notify } = useNotifications();

  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelLoading, setPanelLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);

  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('USER');
  const [editPassword, setEditPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }

    if (status === 'authenticated' && (session?.user as any)?.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    if (status === 'authenticated') {
      fetchUsers();
    }
  }, [status, session, router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(
    () =>
      users.filter((user) =>
        `${user.firstName} ${user.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [users, searchTerm]
  );

  const stats = useMemo(() => {
    const admins = users.filter((user) => user.role === 'ADMIN').length;
    const verified = users.filter((user) => user.emailVerified).length;
    return { total: users.length, admins, verified };
  }, [users]);

  const openUserPanel = async (userId: string) => {
    setPanelOpen(true);
    setPanelLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      const data = await res.json();
      if (data.user) {
        setSelectedUser(data.user);
        setEditFirstName(data.user.firstName || '');
        setEditLastName(data.user.lastName || '');
        setEditEmail(data.user.email);
        setEditRole(data.user.role);
        setEditPassword('');
      }
    } catch (error) {
      notify({ title: 'Failed to open user', message: 'Could not load that profile.', tone: 'warning' });
    } finally {
      setPanelLoading(false);
    }
  };

  const closePanel = () => {
    setPanelOpen(false);
    setSelectedUser(null);
    setEditPassword('');
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      const updateData: any = {
        firstName: editFirstName,
        lastName: editLastName,
        email: editEmail,
        role: editRole
      };

      if (editPassword) {
        updateData.password = editPassword;
      }

      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedUser((prev) => (prev ? { ...prev, ...data.user } : prev));
        setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? { ...u, ...data.user } : u)));
        setEditPassword('');
        notify({ title: 'Profile updated', message: 'Changes saved successfully.', tone: 'success' });
      } else {
        notify({ title: 'Update failed', message: 'Could not save changes.', tone: 'warning' });
      }
    } catch (error) {
      notify({ title: 'Update failed', message: 'Network error while saving.', tone: 'warning' });
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async () => {
    if (!selectedUser) return;
    setVerifying(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceVerify: true })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setSelectedUser((prev) => (prev ? { ...prev, emailVerified: data.user.emailVerified } : prev));
        setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? { ...u, emailVerified: data.user.emailVerified } : u)));
        notify({ title: 'Marked verified', message: 'User email marked as verified.', tone: 'success' });
      } else {
        notify({ title: 'Verification failed', message: 'Could not update verification.', tone: 'warning' });
      }
    } catch (error) {
      notify({ title: 'Verification failed', message: 'Network error while saving.', tone: 'warning' });
    } finally {
      setVerifying(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
        closePanel();
        notify({ title: 'User deleted', message: 'Profile removed successfully.', tone: 'success' });
      } else {
        notify({ title: 'Delete failed', message: 'Could not delete user.', tone: 'warning' });
      }
    } catch (error) {
      notify({ title: 'Delete failed', message: 'Network error while deleting.', tone: 'warning' });
    } finally {
      setDeleting(false);
    }
  };

  if (status === 'loading') {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm shadow-slate-100 backdrop-blur dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-200">
          <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
          <span className="text-sm font-medium">Verifying admin session…</span>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/70 shadow-sm shadow-slate-100 backdrop-blur dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 p-6 dark:border-slate-800">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-amber-500">
            <UserCog className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wide text-amber-500">User operations</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Directory & Accounts</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Review, verify, and update customer access without leaving your command center.
              </p>
            </div>
            <div className="hidden items-center gap-2 rounded-full bg-gradient-to-r from-amber-500/10 via-amber-400/10 to-amber-300/10 px-3 py-1 text-xs font-medium text-amber-600 ring-1 ring-amber-200/60 dark:text-amber-300 dark:ring-amber-500/40 sm:flex">
              <Shield className="h-3.5 w-3.5" /> Secure area
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 shadow-inner dark:border-slate-800 dark:bg-slate-800/70">
            <div className="flex flex-1 items-center gap-3 rounded-lg bg-white/90 px-3 py-2 shadow-sm ring-1 ring-slate-200/70 backdrop-blur dark:bg-slate-900/80 dark:ring-slate-700">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
              />
            </div>
            <div className="hidden items-center gap-2 rounded-full bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700 md:flex">
              <Users className="h-4 w-4" />
              {filteredUsers.length} match{filteredUsers.length === 1 ? '' : 'es'}
            </div>
          </div>

          <div className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-100 dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
            {loading ? (
              <div className="flex items-center gap-3 px-4 py-6 text-sm text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
                Loading directory…
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-10 text-center text-sm text-slate-500">
                <Mail className="h-6 w-6 text-slate-400" />
                <p>No users match that search.</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => openUserPanel(user.id)}
                  className="group w-full px-4 py-4 text-left transition hover:bg-amber-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 dark:hover:bg-amber-400/5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-1 items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400/70 via-amber-500/60 to-amber-600/60 text-white shadow-inner">
                        <span className="text-sm font-semibold">
                          {user.firstName?.[0]}
                          {user.lastName?.[0]}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {user.firstName} {user.lastName}
                          </p>
                          {user.role === 'ADMIN' && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-200 dark:ring-amber-500/40">
                              <Shield className="h-3 w-3" />
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{user.email}</p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            {user.emailVerified ? (
                              <>
                                <CheckCircle className="h-3 w-3 text-emerald-500" />
                                Verified
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 text-amber-500" />
                                Unverified
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 opacity-0 transition group-hover:opacity-100">
                      Manage
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <aside className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 shadow-inner dark:border-slate-800 dark:bg-slate-800/70">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              At-a-glance health
            </div>
            <span className="rounded-full bg-white/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 ring-1 ring-slate-200 dark:bg-slate-900/60 dark:ring-slate-700">
              Live
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-lg bg-white/80 p-3 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/80 dark:ring-slate-700">
              <p className="text-xs text-slate-500">Total users</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="rounded-lg bg-white/80 p-3 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/80 dark:ring-slate-700">
              <p className="text-xs text-slate-500">Admins</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.admins}</p>
            </div>
            <div className="rounded-lg bg-white/80 p-3 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/80 dark:ring-slate-700">
              <p className="text-xs text-slate-500">Verified</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.verified}</p>
            </div>
          </div>

          <div className="rounded-lg bg-gradient-to-br from-amber-500/15 via-amber-400/10 to-amber-300/10 p-3 ring-1 ring-amber-200/60 dark:ring-amber-500/40">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-200">Policy</p>
            <p className="text-sm text-amber-700 dark:text-amber-100">
              All changes are logged. Please ensure role updates align with least-privilege access.
            </p>
          </div>
        </aside>
      </div>

      <div
        className={`fixed inset-0 z-50 flex items-center justify-end bg-slate-900/30 px-6 py-12 transition ${
          panelOpen ? 'pointer-events-auto backdrop-blur-sm' : 'pointer-events-none backdrop-blur-none'
        } ${panelOpen ? 'opacity-100' : 'opacity-0'}`}
      >
        <div
          className={`flex h-full w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 transition duration-300 dark:border-slate-800 dark:bg-slate-900 ${
            panelOpen ? 'translate-x-0' : 'translate-x-[110%]'
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/70">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 ring-1 ring-amber-200 dark:text-amber-200 dark:ring-amber-500/40">
                <UserCog className="h-5 w-5" />
              </div>
              <div className="leading-tight">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">User profile</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : 'Loading…'}
                </p>
              </div>
            </div>
            <button
              className="rounded-full p-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-200/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 dark:hover:bg-slate-800"
              onClick={closePanel}
            >
              Close
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {panelLoading || !selectedUser ? (
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
                Loading profile…
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4 shadow-inner dark:border-slate-800 dark:bg-slate-800/70">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      First name
                      <input
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:focus:border-amber-500"
                        value={editFirstName}
                        onChange={(e) => setEditFirstName(e.target.value)}
                      />
                    </label>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Last name
                      <input
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:focus:border-amber-500"
                        value={editLastName}
                        onChange={(e) => setEditLastName(e.target.value)}
                      />
                    </label>
                  </div>

                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Email
                    <input
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:focus:border-amber-500"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                    />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Role
                      <select
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:focus:border-amber-500"
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                      >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </label>

                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Reset password
                      <input
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:focus:border-amber-500"
                        type="password"
                        placeholder="Leave blank to keep current"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-100 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    <Mail className="h-4 w-4" />
                    Communication
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-slate-50/70 px-3 py-2 text-sm dark:bg-slate-800/50">
                    <div className="flex flex-col">
                      <p className="font-semibold text-slate-900 dark:text-white">Verification</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {selectedUser.emailVerified ? 'Email is verified.' : 'Email is not verified yet.'}
                      </p>
                    </div>
                    <button
                      className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                      onClick={handleVerify}
                      disabled={verifying || !!selectedUser.emailVerified}
                    >
                      {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                      Mark verified
                    </button>
                  </div>
                </div>

                <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-100 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    <Shield className="h-4 w-4" />
                    Security controls
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      className="flex items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 shadow-sm transition hover:border-amber-300 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200"
                      onClick={handleVerify}
                      disabled={verifying}
                    >
                      {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                      {verifying ? 'Marking…' : 'Verify email'}
                    </button>
                    <button
                      className="flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 shadow-sm transition hover:border-red-300 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      {deleting ? 'Deleting…' : 'Delete user'}
                    </button>
                  </div>
                </div>

                <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-100 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    <PencilLine className="h-4 w-4" />
                    Save changes
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50/70 px-3 py-2 text-xs text-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
                    <p>Apply updates to this account.</p>
                    <button
                      className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 dark:bg-white dark:text-slate-900"
                      onClick={handleUpdate}
                      disabled={saving}
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                      {saving ? 'Saving…' : 'Save changes'}
                    </button>
                  </div>
                </div>

                <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-100 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    <Calendar className="h-4 w-4" />
                    Orders
                  </div>
                  <div className="grid gap-3">
                    {selectedUser.orders && selectedUser.orders.length > 0 ? (
                      selectedUser.orders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between rounded-lg bg-slate-50/70 px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800/50 dark:text-slate-200 dark:ring-slate-700"
                        >
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                              {order.status}
                            </span>
                            <span className="text-sm font-semibold">${order.total}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{order.id}</span>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-lg bg-slate-50/70 px-3 py-2 text-sm text-slate-500 dark:bg-slate-800/50">
                        No orders yet.
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-100 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    <MapPinIcon />
                    Addresses
                  </div>
                  <div className="grid gap-3">
                    {selectedUser.addresses && selectedUser.addresses.length > 0 ? (
                      selectedUser.addresses.map((address) => (
                        <div
                          key={address.id}
                          className="rounded-lg bg-slate-50/70 px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800/50 dark:text-slate-200 dark:ring-slate-700"
                        >
                          <p className="font-semibold">
                            {address.line1}
                            {address.line2 ? `, ${address.line2}` : ''}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {address.city}, {address.state} {address.postal}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{address.country}</p>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-lg bg-slate-50/70 px-3 py-2 text-sm text-slate-500 dark:bg-slate-800/50">
                        No addresses on file.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function MapPinIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-4 w-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21c-4.8-4.2-7.2-7.8-7.2-11.1A7.2 7.2 0 0 1 12 2.7a7.2 7.2 0 0 1 7.2 7.2C19.2 13.2 16.8 16.8 12 21Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z" />
    </svg>
  );
}
