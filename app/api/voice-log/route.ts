import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { message, level, type = 'info' } = await request.json();
    
    const timestamp = new Date().toISOString();
    const logPrefix = `[${timestamp}] [VOICE]`;

    // Visual logging in server console based on log type
    if (type === 'voice-input') {
      // Input log
    } else if (type === 'system') {
      // System log
    } else if (type === 'audio-level') {
      // Audio level log
    } else if (type === 'error') {
      console.error(`${logPrefix} ❌ Error: ${message}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
