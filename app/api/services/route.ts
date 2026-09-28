import { NextResponse } from 'next/server';
import { getActiveServices } from '@/lib/db';

export async function GET() {
  try {
    const services = await getActiveServices();
    return NextResponse.json({ success: true, services });
  } catch (error) {
    console.error('Error fetching active services:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch services' }, { status: 500 });
  }
}
