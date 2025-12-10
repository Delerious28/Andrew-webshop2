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
  variant?: 'default' | 'muted' | 'highlight';
  align?: 'left' | 'center';
  emphasis?: 'normal' | 'semibold';
  linkStyle?: 'link' | 'button' | 'chip';
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

  const applyToActive = (updater: (entry: FaqEntry) => FaqEntry) => {
    if (selectedEntry.id) {
      setEntries((prev) => prev.map((item) => (item.id === selectedEntry.id ? updater(item) : item)));
    } else {
      setDraft((prev) => updater(prev));
    }
  };

  const updateBlock = (idx: number, changes: Partial<FaqBlock>) => {
    applyToActive((entry) => {
      const blocks = entry.blocks ? [...entry.blocks] : [];
      blocks[idx] = { ...blocks[idx], ...changes };
      return { ...entry, blocks };
    });
  };

  const addBlock = (type: FaqBlock['type']) => {
    applyToActive((entry) => ({
      ...entry,
      blocks: [...(entry.blocks || []), { type, content: '', variant: 'default', align: 'left', emphasis: 'normal' }]
    }));
  };

  const removeBlock = (idx: number) => {
    applyToActive((entry) => ({ ...entry, blocks: (entry.blocks || []).filter((_, i) => i !== idx) }));
  };

  const moveBlock = (idx: number, dir: -1 | 1) => {
    applyToActive((entry) => {
      const blocks = [...(entry.blocks || [])];
      const target = blocks[idx + dir];
      if (!target) return entry;
      [blocks[idx], blocks[idx + dir]] = [blocks[idx + dir], blocks[idx]];
      return { ...entry, blocks };
    });
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
    const variant: NonNullable<FaqBlock['variant']> = block.variant || 'default';
    const align = block.align || 'left';
    const emphasis = block.emphasis || 'normal';

    const toneClasses: Record<NonNullable<FaqBlock['variant']>, string> = {
      default: 'bg-slate-900/60 border-slate-800/80 text-slate-100',
      muted: 'bg-slate-800/70 border-slate-700 text-slate-300',
      highlight: 'bg-amber-500/10 border-amber-400/40 text-amber-100'
    };

    const alignment = align === 'center' ? 'text-center items-center justify-center' : 'text-left items-start';
    const weight = emphasis === 'semibold' ? 'font-semibold' : 'font-normal';

    if (block.type === 'image')
      return (
        <div
          className={`rounded-xl border ${toneClasses[variant]} ${alignment} overflow-hidden`}>
          <img
            src={block.imageUrl}
            alt={block.alt || `FAQ media ${idx + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      );

    if (block.type === 'link') {
      if (block.linkStyle === 'button') {
        return (
          <a
            className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold bg-brand text-white hover:-translate-y-0.5 transition ${alignment}`}
            href={block.url}
            target="_blank"
            rel="noreferrer"
          >
            {block.label || block.url || 'Link button'}
          </a>
        );
      }

      if (block.linkStyle === 'chip') {
        return (
          <a
            className={`inline-flex items-center rounded-full bg-slate-900/50 px-3 py-1 text-xs font-semibold text-slate-100 border border-slate-700 ${alignment}`}
            href={block.url}
            target="_blank"
            rel="noreferrer"
          >
            {block.label || block.url || 'Link chip'}
          </a>
        );
      }

      return (
        <a
          className={`text-brand underline underline-offset-4 ${alignment}`}
          href={block.url}
          target="_blank"
          rel="noreferrer"
        >
          {block.label || block.url}
        </a>
      );
    }

    return (
      <p className={`text-sm leading-relaxed ${toneClasses[variant]} ${alignment} ${weight} rounded-xl px-4 py-3`}>
        {block.content || 'Answer copy...'}
      </p>
    );
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

      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className={`card-surface p-4 rounded-2xl border transition cursor-pointer hover:-translate-y-0.5 ${
                selectedId === entry.id ? 'border-brand/50 ring-2 ring-brand/30' : 'border-slate-200 dark:border-slate-800'
              }`}
              onClick={() => setActive(entry)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900 dark:text-white">{entry.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{entry.blocks.length} block(s)</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                      entry.isVisible ? 'bg-emerald-500/15 text-emerald-200' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {entry.isVisible ? 'Live' : 'Hidden'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      reorder(entry.id!, -1);
                    }}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    aria-label="Move up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      reorder(entry.id!, 1);
                    }}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    aria-label="Move down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVisibility(entry);
                    }}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    aria-label="Toggle visibility"
                  >
                    {entry.isVisible ? <Eye className="h-4 w-4 text-emerald-500" /> : <EyeOff className="h-4 w-4 text-slate-400" />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteEntry(entry.id);
                    }}
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

        <div className="grid gap-5 xl:grid-cols-[1.05fr,0.95fr]">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/60 to-slate-950 p-5 shadow-lg">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Preview</p>
                <h3 className="text-2xl font-semibold text-white">{selectedEntry.title || 'FAQ title'}</h3>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  selectedEntry.isVisible ? 'bg-emerald-500/20 text-emerald-100' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {selectedEntry.isVisible ? 'Visible on site' : 'Hidden'}
              </span>
            </div>
            <div className="space-y-3">
              {selectedEntry.blocks.length === 0 && (
                <p className="text-sm text-slate-400">Add blocks on the right to see a live preview.</p>
              )}
              {selectedEntry.blocks.map((block, idx) => (
                <div key={idx} className="border border-slate-800/70 rounded-2xl p-3 bg-slate-900/50">
                  {renderBlockPreview(block, idx)}
                </div>
              ))}
            </div>
          </div>

          <div className="card-surface p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold">{selectedEntry.id ? 'Edit FAQ' : 'Create FAQ'}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Build the blocks that appear on the public FAQ page.</p>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedEntry.isVisible}
                  onChange={(e) =>
                    applyToActive((entry) => ({
                      ...entry,
                      isVisible: e.target.checked
                    }))
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
                  onChange={(e) =>
                    applyToActive((entry) => ({
                      ...entry,
                      title: e.target.value
                    }))
                  }
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2"
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
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2"
                        rows={2}
                        placeholder="Answer text"
                      />
                    )}

                    {block.type === 'image' && (
                      <div className="grid gap-2">
                        <input
                          value={block.imageUrl}
                          onChange={(e) => updateBlock(idx, { imageUrl: e.target.value })}
                          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2"
                          placeholder="Image URL"
                        />
                        <input
                          value={block.alt}
                          onChange={(e) => updateBlock(idx, { alt: e.target.value })}
                          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2"
                          placeholder="Alt text"
                        />
                      </div>
                    )}

                    {block.type === 'link' && (
                      <div className="grid gap-2">
                        <input
                          value={block.label}
                          onChange={(e) => updateBlock(idx, { label: e.target.value })}
                          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2"
                          placeholder="Link label"
                        />
                        <input
                          value={block.url}
                          onChange={(e) => updateBlock(idx, { url: e.target.value })}
                          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2"
                          placeholder="https://..."
                        />
                      </div>
                    )}

                    <div className="grid gap-2 md:grid-cols-3 text-xs">
                      <label className="space-y-1">
                        <span className="text-slate-500 dark:text-slate-300">Tone</span>
                        <select
                          value={block.variant || 'default'}
                          onChange={(e) => updateBlock(idx, { variant: e.target.value as FaqBlock['variant'] })}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-2 py-1"
                        >
                          <option value="default">Default</option>
                          <option value="muted">Muted</option>
                          <option value="highlight">Highlight</option>
                        </select>
                      </label>
                      <label className="space-y-1">
                        <span className="text-slate-500 dark:text-slate-300">Alignment</span>
                        <select
                          value={block.align || 'left'}
                          onChange={(e) => updateBlock(idx, { align: e.target.value as FaqBlock['align'] })}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-2 py-1"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                        </select>
                      </label>
                      <label className="space-y-1">
                        <span className="text-slate-500 dark:text-slate-300">Emphasis</span>
                        <select
                          value={block.emphasis || 'normal'}
                          onChange={(e) => updateBlock(idx, { emphasis: e.target.value as FaqBlock['emphasis'] })}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-2 py-1"
                        >
                          <option value="normal">Normal</option>
                          <option value="semibold">Bold</option>
                        </select>
                      </label>
                    </div>

                    {block.type === 'link' && (
                      <div className="grid gap-2 md:grid-cols-3 text-xs">
                        <label className="space-y-1 md:col-span-2">
                          <span className="text-slate-500 dark:text-slate-300">Display style</span>
                          <select
                            value={block.linkStyle || 'link'}
                            onChange={(e) => updateBlock(idx, { linkStyle: e.target.value as FaqBlock['linkStyle'] })}
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-2 py-1"
                          >
                            <option value="link">Inline link</option>
                            <option value="button">Button</option>
                            <option value="chip">Pill / chip</option>
                          </select>
                        </label>
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
          </div>
        </div>
      </div>
    </div>
  );
}
