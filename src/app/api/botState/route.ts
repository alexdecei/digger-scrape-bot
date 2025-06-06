import { NextRequest, NextResponse } from 'next/server';
import { startBot, stopBot, getRealBotStatus } from '@/lib/playwright';
export const runtime = 'nodejs';

export async function GET() {
  const status = await getRealBotStatus()
  return NextResponse.json({status});
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const action = body.action;

  if (action === 'start') {
    const oktaCode = body.oktaCode;
    const authUser = body.authUser;
    await startBot(oktaCode); 
  }

  if (action === 'stop') {
    await stopBot();
  }

  const status = await getRealBotStatus()
  return NextResponse.json({status});

}

