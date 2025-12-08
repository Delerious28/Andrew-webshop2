'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Search, Edit2, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Address, Order, User } from '@prisma/client';
import { useRouter } from 'next/navigation';

interface AdminUsersProps {
  users: (User & { addresses: Address[]; orders: Order[] })[];
}

export function AdminUsers({ users: initialUsers }: AdminUsersProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState(initialUsers);
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase();
    if (!normalized) return users;
    return users.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const email = user.email.toLowerCase();
      return (
        fullName.includes(normalized) ||
        email.includes(normalized)
      );
    });
  }, [query, users]);

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
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete user');
      }
    } catch (error) {
      alert('Failed to delete user');
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (userId: string) => {
    router.push(`/admin/users/${userId}`);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email"
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent pl-9 pr-3 py-2 focus:ring-2 focus:ring-brand/60 transition"
        />
      </div>
      <AnimatePresence mode="popLayout">
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
      </AnimatePresence>
    </div>
  );
}
