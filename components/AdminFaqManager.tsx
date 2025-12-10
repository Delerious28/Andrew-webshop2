'use client';
import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';

export type FaqBlock = {
  id?: string;
  type: 'text' | 'image' | 'link';
  content?: string;
  imageUrl?: string;
  alt?: string;
  label?: string;
  url?: string;
};

export type FaqEntry = {
  id?: string;
  title: string;
  blocks: FaqBlock[];
  isVisible: boolean;
  order: number;
};

const defaultEntry: FaqEntry = {
  title: '',
  blocks: [],
  isVisible: true,
  order: 0
};

export function AdminFaqManager() {
  const [entries, setEntries] = useState<FaqEntry[]>([]);
  const [draft, setDraft] = useState<FaqEntry>({ ...defaultEntry });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedEntry = useMemo(
    () => entries.find((item) => item.id === selectedId) || draft,
    [entries, selectedId, draft]
  );

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await fetch('/api/admin/faqs');
      if (res.ok) {
        const data = await res.json();
        setEntries(data.faqs || []);
        if (data.faqs?.length && !selectedId) setSelectedId(data.faqs[0].id);
      }
    } catch (error) {
      console.error('Failed to load FAQ entries', error);
    }
  };

  const saveEntry = async () => {
    setLoading(true);
    try {
      if (selectedEntry.id) {
        const res = await fetch(`/api/admin/faqs/${selectedEntry.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(selectedEntry)
        });
        if (res.ok) {
          const data = await res.json();
          setEntries((prev) => prev.map((item) => (item.id === selectedEntry.id ? data.faq : item)));
        }
      } else {
        const res = await fetch('/api/admin/faqs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...selectedEntry, order: entries.length })
        });
        if (res.ok) {
          const data = await res.json();
          setEntries((prev) => [...prev, data.faq]);
          setSelectedId(data.faq.id);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteEntry = async (id?: string) => {
    if (!id) return;
    if (!confirm('Delete this FAQ?')) return;
    await fetch(`/api/admin/faqs/${id}`, { method: 'DELETE' });
    setEntries((prev) => prev.filter((item) => item.id !== id));
    if (selectedId === id) {
      setSelectedId(entries[0]?.id ?? null);
      setDraft({ ...defaultEntry });
    }
  };

  const toggleVisibility = async (entry: FaqEntry) => {
    if (!entry.id) return;
    const nextVisible = !entry.isVisible;
    setEntries((prev) => prev.map((item) => (item.id === entry.id ? { ...item, isVisible: nextVisible } : item)));
    await fetch(`/api/admin/faqs/${entry.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isVisible: nextVisible })
    });
  };

  const reorder = async (id: string, direction: -1 | 1) => {
    const sorted = [...entries].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex((item) => item.id === id);
    if (index === -1) return;
    const target = sorted[index + direction];
    if (!target) return;
    const currentOrder = sorted[index].order;

    const updated = sorted.map((item, idx) => {
      if (idx === index) return { ...item, order: target.order };
      if (idx === index + direction) return { ...item, order: currentOrder };
      return item;
    });
    setEntries(updated.sort((a, b) => a.order - b.order));

    await Promise.all([
      fetch(`/api/admin/faqs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: target.order })
      }),
      fetch(`/api/admin/faqs/${target.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: currentOrder })
      })
    ]);
  };

  const updateBlock = (idx: number, changes: Partial<FaqBlock>) => {
    const nextBlocks = [...selectedEntry.blocks];
    nextBlocks[idx] = { ...nextBlocks[idx], ...changes };
    setEntries((prev) =>
      prev.map((item) => (item.id === selectedEntry.id ? { ...item, blocks: nextBlocks } : item))
    );
    if (!selectedEntry.id) setDraft((prev) => ({ ...prev, blocks: nextBlocks }));
  };

  const addBlock = (type: FaqBlock['type']) => {
    const nextBlocks = [...selectedEntry.blocks, { type, content: '' }];
    setEntries((prev) =>
      prev.map((item) => (item.id === selectedEntry.id ? { ...item, blocks: nextBlocks } : item))
    );
    if (!selectedEntry.id) setDraft((prev) => ({ ...prev, blocks: nextBlocks }));
  };

  const removeBlock = (idx: number) => {
    const nextBlocks = selectedEntry.blocks.filter((_, i) => i !== idx);
    setEntries((prev) =>
      prev.map((item) => (item.id === selectedEntry.id ? { ...item, blocks: nextBlocks } : item))
    );
    if (!selectedEntry.id) setDraft((prev) => ({ ...prev, blocks: nextBlocks }));
  };

  const moveBlock = (idx: number, dir: -1 | 1) => {
    const nextBlocks = [...selectedEntry.blocks];
    const target = nextBlocks[idx + dir];
    if (!target) return;
    [nextBlocks[idx], nextBlocks[idx + dir]] = [nextBlocks[idx + dir], nextBlocks[idx]];
    setEntries((prev) =>
      prev.map((item) => (item.id === selectedEntry.id ? { ...item, blocks: nextBlocks } : item))
    );
    if (!selectedEntry.id) setDraft((prev) => ({ ...prev, blocks: nextBlocks }));
  };

  const setActive = (entry?: FaqEntry) => {
    if (entry?.id) {
      setSelectedId(entry.id);
    } else {
      setSelectedId(null);
      setDraft({ ...defaultEntry, order: entries.length });
    }
  };

  const renderBlockPreview = (block: FaqBlock, idx: number) => {
    if (block.type === 'image') return <img src={block.imageUrl} alt={block.alt || `FAQ media ${idx + 1}`} className="rounded-xl border border-slate-200 dark:border-slate-800" />;
    if (block.type === 'link') return <a className="text-brand underline" href={block.url} target="_blank" rel="noreferrer">{block.label || block.url}</a>;
    return <p className="text-sm text-slate-300">{block.content}</p>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold">FAQ management</h2>
          <p className="text-sm text-slate-500 dark:text-slate-300">Create, reorder, and publish FAQ entries.</p>
        </div>
        <button
          onClick={() => setActive()}
          className="inline-flex items-center gap-2 rounded-xl bg-brand/10 px-4 py-2 text-brand font-semibold hover:bg-brand/20"
        >
          <Plus className="h-4 w-4" /> New FAQ
        </button>
      </div>

      <div className="grid lg:grid-cols-[1.1fr,1.3fr] gap-5">
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className={`card-surface p-4 rounded-2xl border transition ${
                selectedId === entry.id ? 'border-brand/50 ring-2 ring-brand/30' : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <p className="font-semibold text-slate-900 dark:text-white">{entry.title}</p>
                  <div className="space-y-2">
                    {entry.blocks.map((block, idx) => (
                      <div key={idx} className="text-xs">
                        {block.type === 'image' && block.imageUrl && (
                          <img src={block.imageUrl} alt={block.alt || ''} className="max-w-full h-16 object-cover rounded border border-slate-200 dark:border-slate-700" />
                        )}
                        {block.type === 'text' && idx < 2 && (
                          <p className="text-slate-600 dark:text-slate-400 line-clamp-2">{block.content}</p>
                        )}
                        {block.type === 'link' && idx < 2 && (
                          <p className="text-brand">{block.label || block.url}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => reorder(entry.id!, -1)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Move up">
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button onClick={() => reorder(entry.id!, 1)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Move down">
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toggleVisibility(entry)}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    aria-label="Toggle visibility"
                  >
                    {entry.isVisible ? <Eye className="h-4 w-4 text-emerald-500" /> : <EyeOff className="h-4 w-4 text-slate-400" />}
                  </button>
                  <button
                    onClick={() => setActive(entry)}
                    className="px-3 py-2 rounded-lg bg-brand/10 text-brand font-semibold hover:bg-brand/20"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card-surface p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">{selectedEntry.id ? 'Edit FAQ' : 'Create FAQ'}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Build the blocks that appear on the public FAQ page.</p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedEntry.isVisible}
                onChange={(e) =>
                  setEntries((prev) =>
                    prev.map((item) =>
                      item.id === selectedEntry.id
                        ? { ...item, isVisible: e.target.checked }
                        : item
                    )
                  )
                }
                className="accent-brand"
              />
              Visible
            </label>
          </div>

          <div className="space-y-3">
            <label className="space-y-1 text-sm font-medium text-slate-700 dark:text-slate-200 block">
              Title
              <input
                value={selectedEntry.title}
                onChange={(e) => {
                  if (selectedEntry.id) {
                    setEntries((prev) =>
                      prev.map((item) => (item.id === selectedEntry.id ? { ...item, title: e.target.value } : item))
                    );
                  } else {
                    setDraft((prev) => ({ ...prev, title: e.target.value }));
                  }
                }}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2"
                placeholder="Shipping speeds"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              {(['text', 'image', 'link'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => addBlock(type)}
                  className="chip bg-slate-100 dark:bg-slate-900/60 text-xs"
                >
                  Add {type}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {selectedEntry.blocks.map((block, idx) => (
                <div key={idx} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 bg-white/60 dark:bg-slate-900/60">
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span className="capitalize">{block.type} block</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => moveBlock(idx, -1)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Move up">
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button onClick={() => moveBlock(idx, 1)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Move down">
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button onClick={() => removeBlock(idx)} className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600" aria-label="Delete block">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {block.type === 'text' && (
                    <textarea
                      value={block.content}
                      onChange={(e) => updateBlock(idx, { content: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2"
                      rows={2}
                      placeholder="Answer text"
                    />
                  )}

                  {block.type === 'image' && (
                    <div className="grid gap-2">
                      <div className="flex gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                updateBlock(idx, { imageUrl: reader.result as string });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-brand/10 file:text-brand hover:file:bg-brand/20"
                        />
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 text-center">or</div>
                      <input
                        value={block.imageUrl || ''}
                        onChange={(e) => updateBlock(idx, { imageUrl: e.target.value })}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2"
                        placeholder="Image URL"
                      />
                      <input
                        value={block.alt || ''}
                        onChange={(e) => updateBlock(idx, { alt: e.target.value })}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2"
                        placeholder="Alt text"
                      />
                      {block.imageUrl && (
                        <img src={block.imageUrl} alt="Preview" className="max-w-full h-32 object-cover rounded border border-slate-200 dark:border-slate-700" />
                      )}
                    </div>
                  )}

                  {block.type === 'link' && (
                    <div className="grid gap-2">
                      <input
                        value={block.label}
                        onChange={(e) => updateBlock(idx, { label: e.target.value })}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2"
                        placeholder="Link label"
                      />
                      <input
                        value={block.url}
                        onChange={(e) => updateBlock(idx, { url: e.target.value })}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2"
                        placeholder="https://..."
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={saveEntry}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-white font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-60"
              disabled={loading}
            >
              {loading ? 'Saving…' : 'Save entry'}
            </button>
            <button
              onClick={() => setDraft({ ...defaultEntry })}
              className="text-sm text-slate-500 hover:underline"
            >
              Reset
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 bg-slate-50/70 dark:bg-slate-900/60">
            <p className="text-sm font-semibold">Live preview</p>
            <div className="space-y-3">
              <p className="text-lg font-bold">{selectedEntry.title || 'FAQ title'}</p>
              {selectedEntry.blocks.map((block, idx) => (
                <div key={idx} className="rounded-xl bg-slate-900/40 px-4 py-3 border border-slate-800">
                  {renderBlockPreview(block, idx)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
