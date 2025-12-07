'use client';
import { useMemo, useState } from 'react';
import { Product, ProductImage } from '@prisma/client';

interface ProductManagerProps {
  products: (Product & { images: ProductImage[] })[];
}

type EditableProduct = {
  title: string;
  description: string;
  price: number | string;
  category: string;
  stock: number | string;
  heroImage: string;
  modelUrl: string;
  images: string;
};

const defaultPayload: EditableProduct = {
  title: '',
  description: '',
  price: 0,
  category: '',
  stock: 0,
  heroImage: '',
  modelUrl: '',
  images: ''
};

export function ProductManager({ products }: ProductManagerProps) {
  const [list, setList] = useState(products);
  const [newProduct, setNewProduct] = useState(defaultPayload);
  const [message, setMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState<Record<string, EditableProduct>>(() => {
    const map: Record<string, EditableProduct> = {};
    products.forEach((p) => {
      map[p.id] = {
        title: p.title,
        description: p.description,
        price: p.price,
        category: p.category,
        stock: p.stock,
        heroImage: p.heroImage,
        modelUrl: p.modelUrl || '',
        images: p.images?.map((img) => img.url).join(',') || ''
      };
    });
    return map;
  });

  const statusList = useMemo(() => ['title', 'description', 'price', 'category', 'stock', 'heroImage', 'modelUrl', 'images'], []);

  const parseImageArray = (value: string) => value.split(',').map((v) => v.trim()).filter(Boolean);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newProduct,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        modelUrl: newProduct.modelUrl || undefined,
        images: parseImageArray(newProduct.images)
      })
    });
    if (res.ok) {
      const created = await res.json();
      setList((prev) => [...prev, { ...created, images: [] }]);
      setNewProduct(defaultPayload);
      setMessage('Product created.');
    } else {
      const data = await res.json();
      setMessage(data.message || 'Unable to create product');
    }
  };

  const handleUpdate = async (id: string) => {
    setMessage(null);
    const payload = editing[id];
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        price: Number(payload.price),
        stock: Number(payload.stock),
        modelUrl: payload.modelUrl || undefined,
        images: parseImageArray(payload.images)
      })
    });
    if (res.ok) {
      const updated = await res.json();
      setList((prev) => prev.map((p) => (p.id === id ? { ...updated, images: p.images } : p)));
      setMessage('Product updated.');
    } else {
      const data = await res.json();
      setMessage(data.message || 'Unable to update product');
    }
  };

  const handleDelete = async (id: string) => {
    setMessage(null);
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setList((prev) => prev.filter((p) => p.id !== id));
      setEditing((prev) => {
        const clone = { ...prev };
        delete clone[id];
        return clone;
      });
      setMessage('Product deleted.');
    } else {
      const data = await res.json();
      setMessage(data.message || 'Unable to delete product');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Create product</h3>
        <form onSubmit={handleCreate} className="grid gap-3 md:grid-cols-2">
          {statusList.map((key) => (
            <label key={key} className="space-y-1 text-sm">
              <span className="capitalize font-medium">{key.replace('Url', ' URL')}</span>
              <input
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2"
                value={(newProduct as any)[key]}
                onChange={(e) => setNewProduct((prev) => ({ ...prev, [key]: e.target.value }))}
                required={['title', 'description', 'price', 'category', 'stock', 'heroImage'].includes(key)}
              />
              {key === 'images' && <span className="text-xs text-slate-500">Comma separate optional gallery image URLs.</span>}
            </label>
          ))}
          <button
            type="submit"
            className="md:col-span-2 justify-self-start px-4 py-2 rounded-full bg-brand text-white font-semibold shadow hover:-translate-y-0.5 transition"
          >
            Publish product
          </button>
        </form>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Existing inventory</h3>
        <div className="space-y-4">
          {list.map((product) => (
            <div key={product.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{product.title}</p>
                  <p className="text-sm text-slate-500">${(product.price / 100).toFixed(2)} · Stock {product.stock}</p>
                </div>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="text-sm text-red-500 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {statusList.map((key) => (
                  <label key={key} className="space-y-1 text-sm">
                    <span className="capitalize font-medium">{key.replace('Url', ' URL')}</span>
                    <input
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2"
                      value={(editing[product.id] as any)?.[key] ?? ''}
                      onChange={(e) =>
                        setEditing((prev) => ({
                          ...prev,
                          [product.id]: { ...prev[product.id], [key]: e.target.value }
                        }))
                      }
                    />
                  </label>
                ))}
              </div>
              <button
                onClick={() => handleUpdate(product.id)}
                className="px-4 py-2 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold"
              >
                Save changes
              </button>
            </div>
          ))}
        </div>
      </div>

      {message && <p className="text-sm text-slate-500">{message}</p>}
    </div>
  );
}
