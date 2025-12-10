import { prisma } from '@/lib/prisma';
import { PageShell } from '@/components/PageShell';
import { FaqAccordion } from '@/components/FaqAccordion';

function parseBlocks(raw: string) {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch (error) {
    return [];
  }
}

export default async function FAQPage() {
  const faqs = await prisma.faqEntry.findMany({ where: { isVisible: true }, orderBy: { order: 'asc' } });
  const items = faqs.map((faq) => ({ id: faq.id, title: faq.title, blocks: parseBlocks(faq.blocks), anchor: faq.id.slice(0, 6) }));

  return (
    <PageShell>
      <div className="space-y-6">
        <header className="space-y-2">
          <p className="chip">Answers</p>
          <h1 className="text-3xl font-bold">Frequently asked questions</h1>
          <p className="text-slate-600 dark:text-slate-300">Quick answers about shipping, returns, and order updates.</p>
        </header>
        <FaqAccordion faqs={items} />
      </div>
    </PageShell>
  );
}
