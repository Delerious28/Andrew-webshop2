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

export default function AdminUsersPage() {
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
      notify({ title: 'Verification failed', message: 'Network error while updating.', tone: 'warning' });
    } finally {
      setVerifying(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    if (!confirm('Delete this user? This cannot be undone.')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
        closePanel();
        notify({ title: 'User removed', message: 'The account was deleted.', tone: 'warning' });
      } else {
        const data = await res.json();
        notify({ title: 'Delete failed', message: data.message || 'Unable to remove account.', tone: 'warning' });
      }
    } catch (error) {
      notify({ title: 'Delete failed', message: 'Network error while deleting.', tone: 'warning' });
    } finally {
      setDeleting(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading user directory…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Admin</p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand/80 to-emerald-400 text-white flex items-center justify-center shadow-lg">
                <UserCog className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">User operations</h1>
                <p className="text-sm text-slate-600 dark:text-slate-300">Curate accounts, permissions, and verification from a single view.</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="rounded-full bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 shadow-sm">
              {stats.admins} admin{stats.admins === 1 ? '' : 's'}
            </div>
            <div className="rounded-full bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 shadow-sm">
              {stats.verified} verified
            </div>
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: 'Total users', value: stats.total, icon: Users },
            { label: 'Verified accounts', value: stats.verified, icon: ShieldCheck },
            { label: 'Administrators', value: stats.admins, icon: Shield }
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 shadow-sm"
            >
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-brand/80 to-emerald-500 text-white flex items-center justify-center">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between border-b border-slate-200 dark:border-slate-800">
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                Active directory
              </div>
              <div className="flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1.5">
                <div className="h-2 w-2 rounded-full bg-brand" />
                Inline editor
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => openUserPanel(user.id)}
                className="w-full text-left px-6 py-4 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition"
              >
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand/90 to-emerald-500 text-white flex items-center justify-center text-lg font-semibold shadow-sm">
                  {user.firstName?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border ${
                      user.role === 'ADMIN'
                        ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-700/50'
                        : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
                    }`}>
                      <Shield className="h-3.5 w-3.5" /> {user.role}
                    </span>
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border ${
                      user.emailVerified
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-700/50'
                        : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700/50'
                    }`}>
                      {user.emailVerified ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                      {user.emailVerified ? 'Verified' : 'Not verified'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </button>
            ))}
            {filteredUsers.length === 0 && (
              <div className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                <p className="font-semibold">No users match that search.</p>
                <p className="text-sm">Try a different name or email.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-50 transition ${panelOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-hidden={!panelOpen}
      >
        <div
          className={`absolute inset-0 bg-slate-950/70 backdrop-blur transition-opacity ${panelOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={closePanel}
        />
        <div
          className={`absolute inset-y-0 right-0 w-full max-w-3xl bg-white dark:bg-slate-950 shadow-2xl border-l border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ${
            panelOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="h-full overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand/90 to-emerald-500 text-white flex items-center justify-center text-lg font-semibold">
                  {selectedUser?.firstName?.charAt(0).toUpperCase() || selectedUser?.email?.charAt(0).toUpperCase() || '·'}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Edit account</p>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : 'Loading user…'}
                  </h3>
                  {selectedUser && (
                    <p className="text-sm text-slate-600 dark:text-slate-300">{selectedUser.email}</p>
                  )}
                </div>
              </div>
              <button
                onClick={closePanel}
                className="rounded-full border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:border-brand"
              >
                Close
              </button>
            </div>

            <div className="p-6 space-y-6">
              {panelLoading && (
                <div className="flex items-center gap-3 text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Loading profile…</span>
                </div>
              )}

              {!panelLoading && selectedUser && (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm text-slate-500">First name</label>
                      <input
                        type="text"
                        value={editFirstName}
                        onChange={(e) => setEditFirstName(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-500">Last name</label>
                      <input
                        type="text"
                        value={editLastName}
                        onChange={(e) => setEditLastName(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-500">Email</label>
                      <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="flex-1 bg-transparent outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-slate-500">Role</label>
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand"
                      >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm text-slate-500">New password</label>
                      <input
                        type="password"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        placeholder="Leave blank to keep current password"
                        className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleUpdate}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow hover:-translate-y-0.5 transition disabled:opacity-60"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <PencilLine className="h-4 w-4" />}
                      {saving ? 'Saving…' : 'Save changes'}
                    </button>
                    {!selectedUser.emailVerified && (
                      <button
                        onClick={handleVerify}
                        disabled={verifying}
                        className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 dark:border-emerald-800 px-4 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-200 hover:border-emerald-400 disabled:opacity-60"
                      >
                        {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                        {verifying ? 'Marking…' : 'Mark verified'}
                      </button>
                    )}
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-800 px-4 py-2 text-sm font-semibold text-red-700 dark:text-red-200 hover:border-red-400 disabled:opacity-60"
                    >
                      {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      {deleting ? 'Deleting…' : 'Delete user'}
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-slate-400" /> Status
                      </p>
                      <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                        <p>
                          Role: <span className="font-semibold text-slate-900 dark:text-white">{selectedUser.role}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          {selectedUser.emailVerified ? (
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-amber-500" />
                          )}
                          {selectedUser.emailVerified ? 'Email verified' : 'Awaiting verification'}
                        </p>
                        <p>Joined {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-400" /> Addresses
                      </p>
                      {selectedUser.addresses && selectedUser.addresses.length > 0 ? (
                        <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                          {selectedUser.addresses.map((address) => (
                            <div key={address.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800/60">
                              <p className="font-semibold text-slate-900 dark:text-white">{address.line1}</p>
                              {address.line2 && <p>{address.line2}</p>}
                              <p>
                                {address.city}, {address.state} {address.postal}
                              </p>
                              <p className="text-slate-500">{address.country}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-slate-500">No saved addresses.</p>
                      )}
                    </div>
                  </div>

                  {selectedUser.orders && selectedUser.orders.length > 0 && (
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                        <UserCog className="h-4 w-4 text-slate-400" /> Recent orders
                      </p>
                      <div className="mt-3 space-y-2">
                        {selectedUser.orders.map((order) => (
                          <div
                            key={order.id}
                            className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm text-slate-700 dark:text-slate-200"
                          >
                            <div>
                              <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                              <p className="text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">${order.total.toFixed(2)}</p>
                              <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800">
                                {order.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
