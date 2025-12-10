const faqs = [
  { question: 'How fast do you ship?', answer: 'Most orders leave the warehouse in 1–2 business days with tracking updates sent to your inbox.' },
  { question: 'Do you support returns?', answer: 'Unused items can be returned within 30 days. Initiate a request from your profile or contact support.' },
  { question: 'Can I edit my order after placing it?', answer: 'Yes—contact support within 12 hours and we will adjust items or addresses before fulfillment.' },
  { question: 'Do you install parts?', answer: 'We partner with trusted local mechanics. Add a note at checkout and we will coordinate installation.' }
];

export default function FAQPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="chip">Answers</p>
        <h1 className="text-3xl font-bold">Frequently asked questions</h1>
        <p className="text-slate-600 dark:text-slate-300">Quick answers about shipping, returns, and order updates.</p>
      </header>
      <div className="grid md:grid-cols-2 gap-4">
        {faqs.map((faq) => (
          <div key={faq.question} className="card-surface p-5 space-y-2">
            <p className="font-semibold">{faq.question}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
