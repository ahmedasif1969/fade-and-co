import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/auth';
import { getAllServices, createService } from '@/lib/db';

export async function GET() {
  if (!(await isAuthenticatedAdmin())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const services = await getAllServices();
    return NextResponse.json({ success: true, services });
  } catch (error) {
    console.error('Error fetching admin services:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticatedAdmin())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, duration_minutes, price_gbp, description, active = true } = body;

    if (!name?.trim() || !duration_minutes || price_gbp === undefined) {
      return NextResponse.json(
        { success: false, error: 'Name, duration (mins), and price are required' },
        { status: 400 }
      );
    }

    const newService = await createService({
      name: name.trim(),
      duration_minutes: parseInt(duration_minutes, 10),
      price_gbp: parseFloat(price_gbp),
      description: description?.trim() || null,
      active: Boolean(active),
    });

    return NextResponse.json({ success: true, service: newService });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ success: false, error: 'Failed to create service' }, { status: 500 });
  }
}
