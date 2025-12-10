'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Search, Edit2, Trash2, Plus, CheckCircle2, ShieldQuestion, Filter } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Address, Order, User } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useNotifications } from './NotificationCenter';

interface AdminUsersProps {
  users: (User & { addresses: Address[]; orders: Order[] })[];
}

export function AdminUsers({ users: initialUsers }: AdminUsersProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState(initialUsers);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'USER'>('ALL');
  const [verificationFilter, setVerificationFilter] = useState<'ALL' | 'VERIFIED' | 'UNVERIFIED'>('ALL');
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'USER', verifyNow: true });
  const { notify } = useNotifications();

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase();
    return users.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const email = user.email.toLowerCase();
      const matchesQuery = !normalized || fullName.includes(normalized) || email.includes(normalized);
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
      const verified = Boolean(user.emailVerified);
      const matchesVerification =
        verificationFilter === 'ALL' ||
        (verificationFilter === 'VERIFIED' && verified) ||
        (verificationFilter === 'UNVERIFIED' && !verified);
      return matchesQuery && matchesRole && matchesVerification;
    });
  }, [query, users, roleFilter, verificationFilter]);

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return;
    }

    setDeleting(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId));
        notify({ title: 'Account deleted', message: `${userName} has been removed.`, tone: 'warning' });
      } else {
        const data = await res.json();
        notify({ title: 'Unable to delete user', message: data.message || 'Please try again.', tone: 'warning' });
      }
    } catch (error) {
      notify({ title: 'Failed to delete user', message: 'Network error. Try again.', tone: 'warning' });
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (userId: string) => {
    router.push(`/admin/users/${userId}`);
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUsers([data.user, ...users]);
        setNewUser({ firstName: '', lastName: '', email: '', password: '', role: 'USER', verifyNow: true });
        setShowNewUserForm(false);
        notify({ title: 'User added', message: 'New account created successfully.', tone: 'success' });
      } else {
        notify({ title: 'Could not add user', message: data.message || 'Check the details and try again.', tone: 'warning' });
      }
    } catch (error) {
      notify({ title: 'Network error', message: 'Unable to create user. Try again.', tone: 'warning' });
    } finally {
      setCreating(false);
    }
  };

  const handleVerifyNow = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceVerify: true })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUsers(users.map((u) => (u.id === userId ? { ...u, emailVerified: data.user.emailVerified, verificationToken: null } : u)));
        notify({ title: 'Marked verified', message: 'Email verification bypassed for this user.', tone: 'success' });
      } else {
        notify({ title: 'Could not update verification', message: data.message || 'Try again.', tone: 'warning' });
      }
    } catch (error) {
      notify({ title: 'Network error', message: 'Unable to update verification status.', tone: 'warning' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="chip bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300"><Filter className="h-4 w-4" /> Filters</span>
          <div className="flex gap-2">
            {['ALL', 'ADMIN', 'USER'].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role as any)}
                className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition ${roleFilter === role ? 'bg-brand text-white border-brand' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                {role === 'ALL' ? 'All roles' : role}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {[
              { id: 'ALL', label: 'All status' },
              { id: 'VERIFIED', label: 'Verified' },
              { id: 'UNVERIFIED', label: 'Needs verification' }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setVerificationFilter(filter.id as any)}
                className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition ${verificationFilter === filter.id ? 'bg-emerald-500 text-white border-emerald-500' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => setShowNewUserForm(!showNewUserForm)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white font-semibold shadow hover:-translate-y-0.5 transition"
        >
          <Plus className="h-4 w-4" /> Add user
        </button>
      </div>

      <div className="relative">
        <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email"
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent pl-9 pr-3 py-2 focus:ring-2 focus:ring-brand/60 transition"
        />
      </div>

      <AnimatePresence>
        {showNewUserForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-white/70 dark:bg-slate-900/60"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Create account</p>
                <p className="text-xs text-slate-500">Bypass verification for admins or trusted users.</p>
              </div>
              <button onClick={() => setShowNewUserForm(false)} className="text-sm text-slate-500 hover:text-slate-800">Close</button>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <input
                value={newUser.firstName}
                onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                placeholder="First name"
                className="rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2"
              />
              <input
                value={newUser.lastName}
                onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                placeholder="Last name"
                className="rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2"
              />
              <input
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="Email"
                className="rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 md:col-span-2"
              />
              <input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Temporary password"
                className="rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 md:col-span-2"
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2"
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={newUser.verifyNow}
                  onChange={(e) => setNewUser({ ...newUser, verifyNow: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
                />
                Allow sign-in without email verification
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={handleCreate}
                disabled={creating}
                className="px-4 py-2 bg-brand text-white rounded-lg font-semibold disabled:opacity-60"
              >
                {creating ? 'Saving...' : 'Save user'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center bg-white/50 dark:bg-slate-900/50">
            <p className="text-slate-500 dark:text-slate-400 mb-2">No customers found</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {users.length === 0 ? 'No customers in the system yet.' : 'Try adjusting your search or filters.'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((user) => (
            <motion.div
              key={user.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-sm bg-white/70 dark:bg-slate-900/60 backdrop-blur"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{user.firstName} {user.lastName}</p>
                  <p className="text-sm text-slate-500 truncate">{user.email}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full border border-slate-200 dark:border-slate-800 uppercase tracking-wide flex-shrink-0">
                  {user.role}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {user.emailVerified ? (
                  <span className="chip bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200 border-emerald-200/60">
                    <CheckCircle2 className="h-3 w-3" /> Verified
                  </span>
                ) : (
                  <span className="chip bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200 border-amber-200/60">
                    <ShieldQuestion className="h-3 w-3" /> Awaiting email check
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">Orders: {user.orders.length}</p>
              {user.addresses[0] ? (
                <p className="text-xs text-slate-500">
                  {user.addresses[0].line1}, {user.addresses[0].city}
                </p>
              ) : (
                <p className="text-xs text-slate-500">No address on file.</p>
              )}
              
              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => handleEdit(user.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit
                </button>
                {!user.emailVerified && (
                  <button
                    onClick={() => handleVerifyNow(user.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-medium"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Verify now
                  </button>
                )}
                <button
                  onClick={() => handleDelete(user.id, `${user.firstName} ${user.lastName}`)}
                  disabled={deleting === user.id}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {deleting === user.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
