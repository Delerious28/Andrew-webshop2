'use client';
import { useState } from 'react';
import { Order, OrderItem, Address, Product } from '@prisma/client';

interface AdminOrdersProps {
  orders: (Order & { address: Address; user: { name: string | null; email: string | null }; items: (OrderItem & { product: Product })[] })[];
}

const statuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export function AdminOrders({ orders }: AdminOrdersProps) {
  const [rows, setRows] = useState(orders);
  const [message, setMessage] = useState<string | null>(null);

  const updateStatus = async (id: string, status: string) => {
    setMessage(null);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      setRows((prev) => prev.map((order) => (order.id === id ? { ...order, status } : order)));
      setMessage('Order status updated.');
    } else {
      const data = await res.json();
      setMessage(data.message || 'Unable to update status');
    }
  };

  return (
    <div className="space-y-4">
      {rows.map((order) => (
        <div key={order.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold">Order #{order.id.slice(-6)}</p>
              <p className="text-sm text-slate-500">{order.user.name} · {order.user.email}</p>
              <p className="text-xs text-slate-500">Ship to: {order.address.line1}, {order.address.city}</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                className="rounded-full border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 text-sm"
                value={order.status}
                onChange={(e) => updateStatus(order.id, e.target.value)}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <span className="font-semibold">${(order.total / 100).toFixed(2)}</span>
            </div>
          </div>
          <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between">
                <span>{item.product.title} × {item.quantity}</span>
                <span>${(item.price / 100).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {message && <p className="text-sm text-slate-500">{message}</p>}
    </div>
  );
}
