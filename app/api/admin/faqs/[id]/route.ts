import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

const isAdmin = async () => {
  const session = await getServerSession(authOptions);
  return session?.user && (session.user as any).role === 'ADMIN';
};

const serializeBlocks = (blocks: any[]) => JSON.stringify(blocks ?? []);

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  const body = await req.json();
  const { title, blocks, isVisible, order } = body;

  const updated = await prisma.faqEntry.update({
    where: { id: params.id },
    data: {
      ...(title ? { title } : {}),
      ...(blocks ? { blocks: serializeBlocks(blocks) } : {}),
      ...(typeof isVisible === 'boolean' ? { isVisible } : {}),
      ...(typeof order === 'number' ? { order } : {})
    }
  });

  return NextResponse.json({ faq: { ...updated, blocks: blocks ?? safeParse(updated.blocks) } });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  await prisma.faqEntry.delete({ where: { id: params.id } });
  return NextResponse.json({ message: 'Deleted' });
}

function safeParse(raw: string) {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch (error) {
    return [];
  }
}
