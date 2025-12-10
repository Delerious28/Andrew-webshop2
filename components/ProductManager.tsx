'use client';

import { useEffect, useMemo, useState } from 'react';
import { Product, ProductImage } from '@prisma/client';
import { AnimatePresence, motion } from 'framer-motion';
import { Filter, Plus, Search, Edit2, Trash2, Layers, ArrowUpDown } from 'lucide-react';
import { MediaGallery } from './MediaGallery';
import { useNotifications } from './NotificationCenter';

interface ProductManagerProps {
  products: (Product & { images: ProductImage[] })[];
}

type EditableProduct = {
  id?: string;
  sku: string;
  title: string;
  description: string;
  price: number | string;
  category: string;
  stock: number | string;
  status: 'LIVE' | 'DRAFT' | 'ARCHIVED';
};

type MediaItem = {
  id: string;
  url: string;
  type: 'image' | 'video';
  order?: number;
};

const defaultPayload: EditableProduct = {
  sku: '',
  title: '',
  description: '',
  price: 0,
  category: '',
  stock: 0,
  status: 'LIVE'
};

const lowStockThreshold = 5;
const statusOrder = ['LIVE', 'DRAFT', 'ARCHIVED'] as const;

export function ProductManager({ products }: ProductManagerProps) {
  const { notify } = useNotifications();
  const [list, setList] = useState(products);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LIVE' | 'DRAFT' | 'ARCHIVED' | 'OUT_OF_STOCK'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sort, setSort] = useState<'NEWEST' | 'PRICE_ASC' | 'PRICE_DESC' | 'STOCK_ASC'>('NEWEST');
  const [modalProduct, setModalProduct] = useState<EditableProduct | null>(null);
  const [modalMedia, setModalMedia] = useState<MediaItem[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setList(products);
  }, [products]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(list.map((item) => item.category).filter(Boolean)));
    return ['ALL', ...unique];
  }, [list]);

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase();
    return list
      .filter((item) => {
        const matchesSearch =
          !normalized ||
          item.title.toLowerCase().includes(normalized) ||
          item.category.toLowerCase().includes(normalized) ||
          (item.sku || '').toLowerCase().includes(normalized);

        const matchesStatus =
          statusFilter === 'ALL'
            ? true
            : statusFilter === 'OUT_OF_STOCK'
              ? item.stock <= 0
              : item.status === statusFilter;

        const matchesCategory = categoryFilter === 'ALL' ? true : item.category === categoryFilter;
        return matchesSearch && matchesStatus && matchesCategory;
      })
      .sort((a, b) => {
        if (sort === 'PRICE_ASC') return a.price - b.price;
        if (sort === 'PRICE_DESC') return b.price - a.price;
        if (sort === 'STOCK_ASC') return a.stock - b.stock;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [categoryFilter, list, query, sort, statusFilter]);

  const openCreate = () => {
    setModalProduct(defaultPayload);
    setModalMedia([]);
  };

  const openEdit = (product: Product & { images: ProductImage[] }) => {
    setModalProduct({
      id: product.id,
      sku: product.sku || '',
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      status: (product.status as EditableProduct['status']) || 'LIVE'
    });
    setModalMedia(
      (product.images || []).map((media) => ({
        id: media.id,
        url: media.url,
        type: media.type as 'image' | 'video',
        order: media.order
      }))
    );
  };

  const bufferFiles = async (files: File[]) => {
    const readers = files.map(
      (file) =>
        new Promise<MediaItem>((resolve, reject) => {
          const reader = new FileReader();
          const type = file.type.startsWith('video') ? 'video' : 'image';
          reader.onload = () => resolve({ id: `temp-${Date.now()}`, url: reader.result as string, type });
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        })
    );
    return Promise.all(readers);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete ${title}? This action cannot be undone.`)) return;
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setList((prev) => prev.filter((p) => p.id !== id));
      notify({ title: 'Product deleted', message: `${title} removed from catalogue.`, tone: 'warning' });
    } else {
      const data = await res.json();
      notify({ title: 'Unable to delete product', message: data.message || 'Please try again.', tone: 'warning' });
    }
  };

  const upsertProduct = async () => {
    if (!modalProduct) return;
    setSaving(true);
    const payload = {
      ...modalProduct,
      price: Number(modalProduct.price),
      stock: Number(modalProduct.stock),
      media: modalMedia
    };

    const isEdit = Boolean(modalProduct.id);
    const endpoint = isEdit ? `/api/products/${modalProduct.id}` : '/api/products';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok) {
      if (isEdit) {
        setList((prev) => prev.map((item) => (item.id === data.id ? { ...item, ...data } : item)));
        notify({ title: 'Saved', message: `${modalProduct.title} updated.`, tone: 'success' });
      } else {
        setList((prev) => [{ ...data }, ...prev]);
        notify({ title: 'Product created', message: `${modalProduct.title} added to catalogue.`, tone: 'success' });
      }
      setModalProduct(null);
      setModalMedia([]);
    } else {
      notify({ title: 'Unable to save product', message: data.message || 'Please try again.', tone: 'warning' });
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-300">Catalogue</p>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Catalogue</h2>
          <p className="text-sm text-slate-500 dark:text-slate-300">Create, edit, and manage bicycle components.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow hover:-translate-y-0.5 transition"
        >
          <Plus className="h-4 w-4" /> Add item
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-[2fr,1fr]">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, SKU or category..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-brand/60"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 justify-start md:justify-end text-xs">
          <span className="chip bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300"><Filter className="h-4 w-4" /> Filters</span>
          <div className="flex gap-2">
            {(['ALL', 'LIVE', 'DRAFT', 'ARCHIVED', 'OUT_OF_STOCK'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition ${
                  statusFilter === status
                    ? 'bg-brand text-white border-brand'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {status === 'ALL' ? 'All' : status === 'OUT_OF_STOCK' ? 'Out of stock' : status}
              </button>
            ))}
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-1.5 text-xs"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'ALL' ? 'All categories' : cat}
              </option>
            ))}
          </select>
          <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-1.5 text-xs">
            <ArrowUpDown className="h-4 w-4 text-slate-400" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="bg-transparent focus:outline-none text-xs"
            >
              <option value="NEWEST">Newest</option>
              <option value="PRICE_ASC">Price: Low to high</option>
              <option value="PRICE_DESC">Price: High to low</option>
              <option value="STOCK_ASC">Stock: Low to high</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        <AnimatePresence>
          {filtered.map((product) => {
            const isLowStock = product.stock > 0 && product.stock <= lowStockThreshold;
            const isOut = product.stock <= 0;
            const statusTone = product.status === 'LIVE' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-800'
              : product.status === 'DRAFT'
                ? 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/50 dark:text-slate-200 dark:border-slate-800'
                : 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-100 dark:border-rose-800';

            return (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex gap-4 items-start">
                    <div className="h-16 w-16 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
                      {product.images?.[0]?.url ? (
                        <img src={product.images[0].url} alt={product.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full grid place-items-center text-slate-400 text-xs">No media</div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900 dark:text-white">{product.title}</p>
                        <span className={`chip text-xs border ${statusTone}`}>{product.status}</span>
                        {isOut && <span className="chip text-xs bg-rose-500 text-white border-rose-500">Out of stock</span>}
                        {isLowStock && !isOut && <span className="chip text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100 border-amber-200 dark:border-amber-800">Low stock</span>}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">SKU: {product.sku || '—'} · {product.category}</p>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-200">
                        <span className="font-semibold">${(product.price / 100).toFixed(2)}</span>
                        <span className="text-xs rounded-full border border-slate-200 dark:border-slate-800 px-2 py-1">{product.stock} in stock</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(product)}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit2 className="h-4 w-4" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id, product.title)}
                      className="inline-flex items-center gap-2 rounded-lg bg-rose-50 dark:bg-rose-900/30 px-3 py-1.5 text-sm font-semibold text-rose-600 dark:text-rose-200 hover:bg-rose-100 dark:hover:bg-rose-900/40"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center text-slate-500 dark:text-slate-400">
            <Layers className="mx-auto h-6 w-6 mb-2 text-slate-400" />
            No products match your filters.
          </div>
        )}
      </div>

      <ProductModal
        open={Boolean(modalProduct)}
        product={modalProduct}
        media={modalMedia}
        onMediaChange={setModalMedia}
        onClose={() => { setModalProduct(null); setModalMedia([]); }}
        onSave={upsertProduct}
        onUpload={bufferFiles}
        saving={saving}
        onChange={(updated) => setModalProduct(updated)}
      />
    </div>
  );
}

interface ProductModalProps {
  open: boolean;
  product: EditableProduct | null;
  media: MediaItem[];
  onMediaChange: (media: MediaItem[]) => void;
  onClose: () => void;
  onSave: () => void;
  onUpload: (files: File[]) => Promise<MediaItem[]>;
  saving: boolean;
  onChange: (product: EditableProduct) => void;
}

function ProductModal({ open, product, media, onMediaChange, onClose, onSave, onUpload, saving, onChange }: ProductModalProps) {
  if (!open || !product) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 grid place-items-center bg-black/50 backdrop-blur"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="w-full max-w-3xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-300">{product.id ? 'Edit item' : 'New item'}</p>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{product.id ? 'Edit product' : 'Add product'}</h3>
              </div>
              <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-800 dark:hover:text-white">Close</button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid gap-4 md:grid-cols-2">
                {['sku', 'title', 'description', 'price', 'category', 'stock'].map((key) => (
                  <label key={key} className="space-y-1 text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-200 capitalize">{key}</span>
                    <input
                      value={(product as any)[key]}
                      onChange={(e) =>
                        onChange({
                          ...product,
                          [key]: key === 'price' || key === 'stock' ? Number(e.target.value) : e.target.value
                        })
                      }
                      placeholder={key === 'price' ? '10000 (in cents)' : ''}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 focus:ring-2 focus:ring-brand/60"
                    />
                  </label>
                ))}
              </div>

              <label className="space-y-1 text-sm block">
                <span className="font-medium text-slate-700 dark:text-slate-200">Status</span>
                <select
                  value={product.status}
                  onChange={(e) => onChange({ ...product, status: e.target.value as EditableProduct['status'] })}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2"
                >
                  {statusOrder.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <div className="space-y-2">
                <span className="block text-sm font-medium text-slate-700 dark:text-slate-200">Product media</span>
                <MediaGallery
                  media={media}
                  onMediaChange={onMediaChange}
                  onUpload={onUpload}
                />
              </div>
            </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold border border-slate-200 dark:border-slate-800">
                  Cancel
                </button>
                <button
                  onClick={onSave}
                  disabled={saving}
                  className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white shadow hover:-translate-y-0.5 transition disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save product'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
