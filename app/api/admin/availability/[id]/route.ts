import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/auth';
import { deleteBlockedSlot } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticatedAdmin())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const deleted = await deleteBlockedSlot(id);

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Blocked slot not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting blocked slot:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete blocked slot' }, { status: 500 });
  }
}
