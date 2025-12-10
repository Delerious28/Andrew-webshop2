import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

const isAdmin = async () => {
  const session = await getServerSession(authOptions);
  return session?.user && (session.user as any).role === 'ADMIN';
};

const serializeBlocks = (blocks: any[]) => JSON.stringify(blocks ?? []);

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });

  const faqs = await prisma.faqEntry.findMany({ orderBy: { order: 'asc' } });
  const parsed = faqs.map((entry) => ({ ...entry, blocks: parseBlocks(entry.blocks) }));
  return NextResponse.json({ faqs: parsed });
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });

  const body = await req.json();
  const { title, blocks = [], isVisible = true, order = 0 } = body;
  if (!title) return NextResponse.json({ message: 'Title is required' }, { status: 400 });

  const created = await prisma.faqEntry.create({
    data: {
      title,
      blocks: serializeBlocks(blocks),
      isVisible,
      order
    }
  });

  return NextResponse.json({ faq: { ...created, blocks } }, { status: 201 });
}

function parseBlocks(raw: string) {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch (error) {
    return [];
  }
}
