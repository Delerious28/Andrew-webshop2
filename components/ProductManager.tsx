'use client';
import { useMemo, useState } from 'react';
import { Product, ProductImage } from '@prisma/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UploadCloud } from 'lucide-react';

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
  const [newUploads, setNewUploads] = useState<string[]>([]);
  const [mediaUploads, setMediaUploads] = useState<Record<string, string[]>>({});
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(products[0]?.id ?? null);
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

  const bufferFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return [] as string[];
    const readers = Array.from(files).map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        })
    );
    return Promise.all(readers);
  };

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
        images: [...parseImageArray(newProduct.images), ...newUploads]
      })
    });
    if (res.ok) {
      const created = await res.json();
      setList((prev) => [...prev, { ...created, images: [] }]);
      setNewProduct(defaultPayload);
      setNewUploads([]);
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
        images: [...parseImageArray(payload.images), ...(mediaUploads[id] || [])]
      })
    });
    if (res.ok) {
      const updated = await res.json();
      setList((prev) => prev.map((p) => (p.id === id ? { ...updated, images: p.images } : p)));
      setMediaUploads((prev) => ({ ...prev, [id]: [] }));
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

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return list;
    return list.filter((item) =>
      [item.title, item.description, item.category].some((field) => field.toLowerCase().includes(q))
    );
  }, [list, query]);

  const activeProduct = filtered.find((p) => p.id === activeId) ?? filtered[0] ?? list[0];

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
              {key === 'images' && <span className="text-xs text-slate-500">Comma separate gallery image or video URLs.</span>}
            </label>
          ))}
          <label className="flex flex-col gap-2 text-sm border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3">
            <span className="font-medium flex items-center gap-2"><UploadCloud className="h-4 w-4" /> Upload media</span>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={async (e) => {
                const buffered = await bufferFiles(e.target.files);
                setNewUploads(buffered);
              }}
            />
            <span className="text-xs text-slate-500">Images and short videos are encoded for quick previews.</span>
          </label>
          <button
            type="submit"
            className="md:col-span-2 justify-self-start px-4 py-2 rounded-full bg-brand text-white font-semibold shadow hover:-translate-y-0.5 transition"
          >
            Publish product
          </button>
        </form>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Existing inventory</h3>
            <p className="text-sm text-slate-500">Search, select, and edit with rich media uploads.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent pl-9 pr-3 py-2 focus:ring-2 focus:ring-brand/60 transition"
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
                      ? 'border-brand/50 bg-brand/5'
                      : 'border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{product.title}</p>
                      <p className="text-sm text-slate-500">${(product.price / 100).toFixed(2)} · Stock {product.stock}</p>
                    </div>
                    <span className="text-xs rounded-full border px-2 py-1 border-slate-200 dark:border-slate-800">{product.category}</span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-2">{product.description}</p>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          {activeProduct && (
            <motion.div
              key={activeProduct.id}
              layout
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 bg-white/70 dark:bg-slate-900/60 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Editing {activeProduct.title}</p>
                  <p className="text-xs text-slate-500">ID: {activeProduct.id}</p>
                </div>
                <button
                  onClick={() => handleDelete(activeProduct.id)}
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
              <label className="flex flex-col gap-2 text-sm border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3">
                <span className="font-medium flex items-center gap-2"><UploadCloud className="h-4 w-4" /> Upload images or videos</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={async (e) => {
                    const buffered = await bufferFiles(e.target.files);
                    setMediaUploads((prev) => ({
                      ...prev,
                      [activeProduct.id]: [...(prev[activeProduct.id] || []), ...buffered]
                    }));
                  }}
                />
                <span className="text-xs text-slate-500">New uploads append to the gallery when you save.</span>
              </label>
              <button
                onClick={() => handleUpdate(activeProduct.id)}
                className="px-4 py-2 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold"
              >
                Save changes
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {message && <p className="text-sm text-slate-500">{message}</p>}
    </div>
  );
}
