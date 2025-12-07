'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Trash2, GripVertical, Play } from 'lucide-react';

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  order: number;
}

interface MediaGalleryProps {
  media: MediaItem[];
  onMediaChange: (media: MediaItem[]) => void;
  onUpload: (files: File[]) => Promise<MediaItem[]>;
  maxFiles?: number;
}

export function MediaGallery({ media, onMediaChange, onUpload, maxFiles = 20 }: MediaGalleryProps) {
  const [loading, setLoading] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleFileInput = async (files: FileList | null) => {
    if (!files) return;
    
    setLoading(true);
    try {
      const uploadedMedia = await onUpload(Array.from(files));
      const sorted = [...media, ...uploadedMedia].sort((a, b) => a.order - b.order);
      onMediaChange(sorted);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: string) => {
    if (!draggedItem || draggedItem === targetId) return;

    const draggedIndex = media.findIndex((m) => m.id === draggedItem);
    const targetIndex = media.findIndex((m) => m.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newMedia = [...media];
    const [draggedItem_] = newMedia.splice(draggedIndex, 1);
    newMedia.splice(targetIndex, 0, draggedItem_);

    // Recalculate order
    const sorted = newMedia.map((m, i) => ({ ...m, order: i }));
    onMediaChange(sorted);
    setDraggedItem(null);
  };

  const handleDelete = (id: string) => {
    const filtered = media.filter((m) => m.id !== id);
    const sorted = filtered.map((m, i) => ({ ...m, order: i }));
    onMediaChange(sorted);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <label className="flex flex-col gap-3 text-sm border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 hover:border-brand/50 transition cursor-pointer bg-slate-50 dark:bg-slate-900/30">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium">
          <Upload className="h-5 w-5" />
          {loading ? 'Uploading...' : 'Upload images or videos'}
        </div>
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          disabled={loading || media.length >= maxFiles}
          className="text-xs cursor-pointer"
          onChange={(e) => handleFileInput(e.target.files)}
        />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Drag files here or click to select. Supports images and videos. ({media.length}/{maxFiles})
        </p>
      </label>

      {/* Gallery Grid */}
      {media.length > 0 && (
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-3">📁 Gallery ({media.length})</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <AnimatePresence>
              {media.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  draggable
                  onDragStart={() => handleDragStart(item.id)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(item.id)}
                  className={`relative group rounded-xl overflow-hidden bg-slate-900 aspect-square cursor-grab active:cursor-grabbing transition ${
                    draggedItem === item.id ? 'opacity-50' : ''
                  }`}
                >
                  {/* Media Preview */}
                  {item.type === 'image' ? (
                    <img
                      src={item.url}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <video
                        src={item.url}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition">
                        <Play className="h-8 w-8 text-white" fill="white" />
                      </div>
                    </>
                  )}

                  {/* Order Badge */}
                  <div className="absolute top-2 left-2 bg-brand text-white px-2 py-1 rounded-lg text-xs font-bold">
                    #{item.order + 1}
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-3">
                    <GripVertical className="h-5 w-5 text-white" />
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-lg bg-red-500/80 hover:bg-red-600 text-white transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Type Badge */}
                  <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white px-2 py-1 rounded text-xs font-medium">
                    {item.type === 'image' ? '🖼️ Image' : '🎬 Video'}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
