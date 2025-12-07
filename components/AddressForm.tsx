'use client';
import { useState } from 'react';

interface AddressFormProps {
  initialAddress?: {
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    postal: string;
    country: string;
  };
}

export function AddressForm({ initialAddress }: AddressFormProps) {
  const [form, setForm] = useState({
    line1: initialAddress?.line1 || '',
    line2: initialAddress?.line2 || '',
    city: initialAddress?.city || '',
    state: initialAddress?.state || '',
    postal: initialAddress?.postal || '',
    country: initialAddress?.country || ''
  });
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const res = await fetch('/api/address', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form })
    });
    setLoading(false);
    if (res.ok) {
      setStatus('Saved your shipping address.');
    } else {
      const data = await res.json();
      setStatus(data.message || 'Unable to save address.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <label className="space-y-2 text-sm">
          <span className="font-medium">Address line 1</span>
          <input
            className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2"
            value={form.line1}
            onChange={(e) => handleChange('line1', e.target.value)}
            required
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium">Address line 2</span>
          <input
            className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2"
            value={form.line2}
            onChange={(e) => handleChange('line2', e.target.value)}
          />
        </label>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <label className="space-y-2 text-sm">
          <span className="font-medium">City</span>
          <input
            className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2"
            value={form.city}
            onChange={(e) => handleChange('city', e.target.value)}
            required
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium">State / Province</span>
          <input
            className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2"
            value={form.state}
            onChange={(e) => handleChange('state', e.target.value)}
            required
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium">Postal code</span>
          <input
            className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2"
            value={form.postal}
            onChange={(e) => handleChange('postal', e.target.value)}
            required
          />
        </label>
      </div>
      <label className="space-y-2 text-sm block">
        <span className="font-medium">Country</span>
        <input
          className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2"
          value={form.country}
          onChange={(e) => handleChange('country', e.target.value)}
          required
        />
      </label>
      <button
        type="submit"
        className="px-4 py-2 rounded-full bg-brand text-white font-semibold shadow hover:-translate-y-0.5 transition"
        disabled={loading}
      >
        {loading ? 'Saving...' : 'Save address'}
      </button>
      {status && <p className="text-sm text-slate-500 dark:text-slate-300">{status}</p>}
    </form>
  );
}
