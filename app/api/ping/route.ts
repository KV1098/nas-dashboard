import { NextResponse } from 'next/server';
import { getStatus } from '@/app/lib/mqtt';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getStatus();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Ping API Error:', error);
    return NextResponse.json({ status: "error", message: 'Failed to communicate with MQTT Broker' }, { status: 502 });
  }
}
