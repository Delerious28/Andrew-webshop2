import { Order, OrderItem, Product } from '@prisma/client';

interface OrderHistoryProps {
  orders: (Order & { items: (OrderItem & { product: Pick<Product, 'title'> })[] })[];
}

export function OrderHistory({ orders }: OrderHistoryProps) {
  if (!orders.length) {
    return <p className="text-sm text-slate-500 dark:text-slate-300">No orders yet. Your future rides start here.</p>;
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold">Order #{order.id.slice(-6)}</p>
              <p className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="rounded-full bg-slate-100 dark:bg-slate-900 px-3 py-1 font-semibold">{order.status}</span>
              <span className="font-semibold">${(order.total / 100).toFixed(2)}</span>
            </div>
          </div>
          <ul className="mt-3 text-sm text-slate-600 dark:text-slate-300 space-y-1">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between">
                <span>{item.product.title} × {item.quantity}</span>
                <span>${(item.price / 100).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
