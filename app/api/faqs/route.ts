import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const entries = await prisma.faqEntry.findMany({
    where: { isVisible: true },
    orderBy: { order: 'asc' }
  });

  const parsed = entries.map((entry) => ({
    ...entry,
    blocks: safeParseBlocks(entry.blocks)
  }));

  return NextResponse.json({ faqs: parsed });
}

function safeParseBlocks(raw: string) {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch (error) {
    return [];
  }
}
