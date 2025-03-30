import { NextRequest, NextResponse } from 'next/server';
import { startBot, stopBot, isBotRunning } from '@/lib/playwright';

export async function GET() {
  const status = await isBotRunning();
  return NextResponse.json({ 
    running: status,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log('[BOT STATE] body =', body);

  const action = body.action;

  if (action === 'start') {
    await startBot();
    return NextResponse.json({ success: true });
  }

  if (action === 'stop') {
    await stopBot();
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

