import Link from 'next/link';

export default function CartPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Your Cart</h1>
        <p className="text-muted-foreground">Cart is coming soon. In the meantime, browse products and add items you like.</p>
      </div>
      <Link
        href="/products"
        className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-white shadow hover:opacity-90"
      >
        Continue shopping
      </Link>
    </main>
  );
}
