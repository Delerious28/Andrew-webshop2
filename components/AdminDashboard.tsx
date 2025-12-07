'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Users, ShoppingCart } from 'lucide-react';
import { ProductManager } from './ProductManager';
import { AdminOrders } from './AdminOrders';
import { AdminUsers } from './AdminUsers';

interface AdminDashboardProps {
  products: any[];
  users: any[];
  orders: any[];
}

export function AdminDashboard({ products, users, orders }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'users' | null>(null);

  const tiles = [
    {
      id: 'products',
      label: 'Catalogue',
      icon: Package,
      count: products.length,
      color: 'from-blue-500 to-cyan-500',
      description: 'Create, edit, or delete bicycle components'
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingCart,
      count: orders.length,
      color: 'from-purple-500 to-pink-500',
      description: 'Update statuses and inspect line items'
    },
    {
      id: 'users',
      label: 'Customers',
      icon: Users,
      count: users.length,
      color: 'from-green-500 to-emerald-500',
      description: 'Search and review user shipping details'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stat Tiles Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          const isActive = activeTab === tile.id;
          
          return (
            <motion.button
              key={tile.id}
              onClick={() => setActiveTab(isActive ? null : (tile.id as any))}
              className={`relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 ${
                isActive 
                  ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-950 ring-brand shadow-xl'
                  : 'shadow-md hover:shadow-lg'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${tile.color} opacity-10 dark:opacity-20`} />
              
              {/* Content */}
              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                  <Icon className={`h-8 w-8 bg-gradient-to-br ${tile.color} bg-clip-text text-transparent`} />
                  {isActive && <span className="text-lg">▼</span>}
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{tile.description}</p>
                  <p className="text-3xl font-bold mt-1">{tile.count}</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-2">{tile.label}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Expandable Container */}
      <AnimatePresence mode="wait">
        {activeTab === 'products' && (
          <motion.div
            key="products"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">📦 Catalogue</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-300">Create, edit, and delete bicycle components</p>
                </div>
              </div>
              <ProductManager products={products} />
            </div>
          </motion.div>
        )}

        {activeTab === 'orders' && (
          <motion.div
            key="orders"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">🛒 Orders</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-300">Update order statuses and inspect line items</p>
                </div>
              </div>
              <AdminOrders orders={orders} />
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">👥 Customers</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-300">Search and review user shipping details</p>
                </div>
              </div>
              <AdminUsers users={users} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!activeTab && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 text-slate-500 dark:text-slate-400"
        >
          <p className="text-lg">👆 Click a tile above to get started</p>
        </motion.div>
      )}
    </div>
  );
}
