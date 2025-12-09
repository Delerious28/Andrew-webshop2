'use client';
import { useEffect, useMemo, useState } from 'react';
import { Product, ProductImage } from '@prisma/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { MediaGallery } from './MediaGallery';
import { useNotifications } from './NotificationCenter';

interface ProductManagerProps {
  products: (Product & { images: ProductImage[] })[];
}

type EditableProduct = {
  title: string;
  description: string;
  price: number | string;
  category: string;
  stock: number | string;
};

const defaultPayload: EditableProduct = {
  title: '',
  description: '',
  price: 0,
  category: '',
  stock: 0
};

type MediaItem = {
  id: string;
  url: string;
  type: 'image' | 'video';
  order: number;
};

export function ProductManager({ products }: ProductManagerProps) {
  const { notify } = useNotifications();
  const [list, setList] = useState(products);
  const [newProduct, setNewProduct] = useState(defaultPayload);
  const [newProductMedia, setNewProductMedia] = useState<MediaItem[]>([]);
  const [editingMedia, setEditingMedia] = useState<Record<string, MediaItem[]>>({});
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(products[0]?.id ?? null);
  const [editing, setEditing] = useState<Record<string, EditableProduct>>({});

  useEffect(() => {
    const map: Record<string, EditableProduct> = {};
    const mediaMap: Record<string, MediaItem[]> = {};
    products.forEach((p) => {
      map[p.id] = {
        title: p.title,
        description: p.description,
        price: p.price,
        category: p.category,
        stock: p.stock
      };
      mediaMap[p.id] = p.images
        .sort((a, b) => a.order - b.order)
        .map((img) => ({
          id: img.id,
          url: img.url,
          type: img.type as 'image' | 'video',
          order: img.order
        }));
    });
    setEditing(map);
    setEditingMedia(mediaMap);
    setActiveId(products[0]?.id ?? null);
    setList(products);
  }, [products]);

  const statusList = useMemo(() => ['title', 'description', 'price', 'category', 'stock'], []);

  const bufferFiles = async (files: File[]) => {
    const readers = files.map(
      (file) =>
        new Promise<{ data: string; type: 'image' | 'video' }>((resolve, reject) => {
          const reader = new FileReader();
          const type = file.type.startsWith('video') ? 'video' : 'image';
          reader.onload = () => resolve({ data: reader.result as string, type });
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        })
    );
    const results = await Promise.all(readers);
    return results.map((r, i) => ({
      id: `temp-${Date.now()}-${i}`,
      url: r.data,
      type: r.type,
      order: 0
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newProduct,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        modelUrl: newProduct.modelUrl || undefined,
        media: newProductMedia
      })
    });
    if (res.ok) {
      const created = await res.json();
      setList((prev) => [...prev, { ...created, images: [] }]);
      setNewProduct(defaultPayload);
      setNewProductMedia([]);
      notify({ title: 'Product published', message: `${created.title} is now live.`, tone: 'success' });
    } else {
      const data = await res.json();
      notify({ title: 'Unable to create product', message: data.message || 'Please try again.', tone: 'warning' });
    }
  };

  const handleUpdate = async (id: string) => {
    const payload = editing[id];
    const media = editingMedia[id] || [];
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        price: Number(payload.price),
        stock: Number(payload.stock),
        modelUrl: payload.modelUrl || undefined,
        media: media
      })
    });
    if (res.ok) {
      const updated = await res.json();
      setList((prev) => prev.map((p) => (p.id === id ? { ...updated, images: p.images } : p)));
      notify({ title: 'Product updated', message: `${updated.title} saved successfully.`, tone: 'success' });
    } else {
      const data = await res.json();
      notify({ title: 'Unable to update product', message: data.message || 'Please try again.', tone: 'warning' });
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setList((prev) => prev.filter((p) => p.id !== id));
      setEditing((prev) => {
        const clone = { ...prev };
        delete clone[id];
        return clone;
      });
      notify({ title: 'Product deleted', message: 'Removed from catalogue.', tone: 'warning' });
    } else {
      const data = await res.json();
      notify({ title: 'Unable to delete product', message: data.message || 'Please try again.', tone: 'warning' });
    }
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return list;
    return list.filter((item) =>
      [item.title, item.description, item.category].some((field) => field.toLowerCase().includes(q))
    );
  }, [list, query]);

  const activeProduct = filtered.find((p) => p.id === activeId) ?? filtered[0] ?? list[0];

  // Fields to show in text input form (excluding media/image fields)
  const inputFields = ['title', 'description', 'price', 'category', 'stock'] as const;

  return (
    <div className="space-y-6">
      {/* CREATE PRODUCT SECTION */}
      <div className="space-y-3 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white/50 dark:bg-slate-900/50">
        <h3 className="text-lg font-semibold">➕ Create product</h3>
        <p className="text-sm text-slate-500 dark:text-slate-300">Add a new component to your catalogue</p>
        <form onSubmit={handleCreate} className="space-y-4">
          {/* Text input fields */}
          <div className="grid gap-4 md:grid-cols-2">
            {inputFields.map((key) => (
              <label key={key} className="space-y-2 text-sm">
                <span className="capitalize font-medium block text-slate-700 dark:text-slate-200">{key.replace('Url', ' URL')}</span>
                <input
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-brand/60 focus:border-transparent transition"
                  placeholder={key === 'price' ? '10000' : key === 'stock' ? '25' : key === 'category' ? 'e.g. Wheels' : ''}
                  value={(newProduct as any)[key]}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, [key]: e.target.value }))}
                  required={['title', 'description', 'price', 'category', 'stock'].includes(key)}
                />
                {key === 'price' && <span className="text-xs text-slate-500 dark:text-slate-400">Price in cents (e.g. 10000 = $100.00)</span>}
              </label>
            ))}
          </div>

          {/* Media Gallery */}
          <div className="space-y-2">
            <label className="text-sm font-medium block text-slate-700 dark:text-slate-200">Product Media (Images & Videos)</label>
            <MediaGallery
              media={newProductMedia}
              onMediaChange={setNewProductMedia}
              onUpload={bufferFiles}
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-full bg-brand text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition"
          >
            ✨ Publish product
          </button>
        </form>
      </div>

      {/* EXISTING INVENTORY SECTION */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">🔍 Existing inventory</h3>
            <p className="text-sm text-slate-500 dark:text-slate-300">Search, select, and edit products</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-9 pr-3 py-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-brand/60 focus:border-transparent transition"
            />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr,1fr]">
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map((product) => (
                <motion.button
                  type="button"
                  key={product.id}
                  layout
                  onClick={() => setActiveId(product.id)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  className={`w-full text-left rounded-2xl border p-4 transition shadow-sm ${
                    activeProduct?.id === product.id
                      ? 'border-brand/50 bg-brand/5 dark:bg-brand/10'
                      : 'border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{product.title}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">${(product.price / 100).toFixed(2)} · {product.stock} in stock</p>
                    </div>
                    <span className="text-xs rounded-full border border-slate-200 dark:border-slate-700 px-2 py-1 text-slate-600 dark:text-slate-300 font-semibold">{product.category}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2">{product.description}</p>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          {/* EDIT PRODUCT SECTION */}
          {activeProduct && (
            <motion.div
              key={activeProduct.id}
              layout
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 bg-white/70 dark:bg-slate-900/70 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
                <div>
                  <p className="font-bold text-lg text-slate-900 dark:text-white">✏️ Editing</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{activeProduct.title}</p>
                </div>
                <button
                  onClick={() => handleDelete(activeProduct.id)}
                  className="text-sm px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold hover:bg-red-100 dark:hover:bg-red-900/50 transition"
                >
                  Delete
                </button>
              </div>

              {/* Text input fields */}
              <div className="grid gap-3 md:grid-cols-2">
                {inputFields.map((key) => (
                  <label key={key} className="space-y-2 text-sm">
                    <span className="capitalize font-medium block text-slate-700 dark:text-slate-200">{key.replace('Url', ' URL')}</span>
                    <input
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-brand/60 focus:border-transparent transition"
                      value={(editing[activeProduct.id] as any)?.[key] ?? ''}
                      onChange={(e) =>
                        setEditing((prev) => ({
                          ...prev,
                          [activeProduct.id]: { ...prev[activeProduct.id], [key]: e.target.value }
                        }))
                      }
                    />
                  </label>
                ))}
              </div>

              {/* Media Gallery */}
              <div className="space-y-2">
                <label className="text-sm font-medium block text-slate-700 dark:text-slate-200">Product Media (Images & Videos)</label>
                <MediaGallery
                  media={editingMedia[activeProduct.id] || []}
                  onMediaChange={(newMedia) => {
                    setEditingMedia(prev => ({
                      ...prev,
                      [activeProduct.id]: newMedia
                    }));
                  }}
                  onUpload={bufferFiles}
                />
              </div>

              <button
                onClick={() => handleUpdate(activeProduct.id)}
                className="w-full px-4 py-2.5 rounded-xl bg-brand text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition"
              >
                💾 Save changes
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
