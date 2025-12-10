export default function ContactPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="chip">Support</p>
        <h1 className="text-3xl font-bold">Contact us</h1>
        <p className="text-slate-600 dark:text-slate-300">Need help with an order or catalogue update? Reach our team below.</p>
      </header>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card-surface p-5 space-y-2">
          <p className="font-semibold">Email</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">support@remoof.example</p>
          <p className="text-xs text-slate-500">Replies within one business day.</p>
        </div>
        <div className="card-surface p-5 space-y-2">
          <p className="font-semibold">Phone</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">+1 (555) 014-2255</p>
          <p className="text-xs text-slate-500">Mon–Fri, 9am–5pm PST.</p>
        </div>
        <div className="card-surface p-5 space-y-2">
          <p className="font-semibold">Showroom</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">128 Rim Street, Portland, OR</p>
          <p className="text-xs text-slate-500">Book fittings or pick-ups by appointment.</p>
        </div>
      </div>
    </div>
  );
}
