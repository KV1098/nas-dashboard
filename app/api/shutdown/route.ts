import { NextResponse } from 'next/server';
import { publishCommand } from '@/app/lib/mqtt';

export async function POST() {
  const secret = process.env.ESP32_PASS;

  if (!secret) {
    return NextResponse.json({ message: 'Server configuration error: ESP32_PASS missing' }, { status: 500 });
  }

  try {
    await publishCommand('shutdown', secret);
    return NextResponse.json({ message: 'Shutdown signal sent via MQTT!' }, { status: 200 });
  } catch (error) {
    console.error('Shutdown API Error:', error);
    return NextResponse.json({ message: 'Failed to communicate with MQTT Broker' }, { status: 502 });
  }
}
