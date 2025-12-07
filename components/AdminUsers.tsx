'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Address, Order, User } from '@prisma/client';

interface AdminUsersProps {
  users: (User & { addresses: Address[]; orders: Order[] })[];
}

export function AdminUsers({ users }: AdminUsersProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase();
    if (!normalized) return users;
    return users.filter((user) => {
      const nameParts = user.name?.toLowerCase() || '';
      const email = user.email.toLowerCase();
      return (
        nameParts.includes(normalized) ||
        email.includes(normalized)
      );
    });
  }, [query, users]);

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
              className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 shadow-sm bg-white/70 dark:bg-slate-900/60 backdrop-blur"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full border border-slate-200 dark:border-slate-800 uppercase tracking-wide">
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
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}
