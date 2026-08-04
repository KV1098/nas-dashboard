import { NextResponse } from 'next/server';

export async function POST() {
  const espUrl = process.env.ESP32_URL;
  const username = process.env.ESP32_USER;
  const password = process.env.ESP32_PASS;

  if (!espUrl) {
    return NextResponse.json({ message: 'Server configuration error: ESP32_URL missing' }, { status: 500 });
  }

  try {
    const authHeader = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
    
    const response = await fetch(`${espUrl}/shutdown`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
      },
      // Short timeout to not hang the Vercel function
      signal: AbortSignal.timeout(5000), 
    });

    if (response.ok) {
      return NextResponse.json({ message: 'Shutdown signal sent successfully!' }, { status: 200 });
    } else {
      return NextResponse.json({ message: `ESP32 returned error: ${response.status}` }, { status: response.status });
    }
  } catch (error) {
    console.error('Shutdown API Error:', error);
    return NextResponse.json({ message: 'Failed to communicate with home router/ESP32' }, { status: 502 });
  }
}
