import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Prevent caching of the ping status

export async function GET() {
  const espUrl = process.env.ESP32_URL;
  const username = process.env.ESP32_USER;
  const password = process.env.ESP32_PASS;

  if (!espUrl) {
    return NextResponse.json({ message: 'Server configuration error: ESP32_URL missing' }, { status: 500 });
  }

  try {
    const authHeader = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
    
    const response = await fetch(`${espUrl}/ping`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
      },
      // Short timeout so the UI doesn't hang
      signal: AbortSignal.timeout(5000), 
      cache: 'no-store'
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data, { status: 200 });
    } else {
      return NextResponse.json({ status: "error", message: `ESP32 returned error: ${response.status}` }, { status: response.status });
    }
  } catch (error) {
    console.error('Ping API Error:', error);
    return NextResponse.json({ status: "error", message: 'Failed to communicate with home router/ESP32' }, { status: 502 });
  }
}
