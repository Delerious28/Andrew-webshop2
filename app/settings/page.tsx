'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [newsletter, setNewsletter] = useState(true);
  const [alerts, setAlerts] = useState(true);
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="chip">Preferences</p>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-slate-600 dark:text-slate-300">Control notifications and account preferences.</p>
      </header>
      <div className="space-y-4">
        <div className="card-surface p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Product alerts</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Get notified about restocks and new drops.</p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={alerts} onChange={(e) => setAlerts(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand" />
              {alerts ? 'Enabled' : 'Disabled'}
            </label>
          </div>
        </div>
        <div className="card-surface p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Newsletter</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Monthly insights and ride-ready tips.</p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand" />
              {newsletter ? 'Subscribed' : 'Unsubscribed'}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
