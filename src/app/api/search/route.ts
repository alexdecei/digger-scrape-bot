import { NextRequest, NextResponse } from 'next/server';
import { performSearch } from '@/lib/playwright';

export async function POST(req: NextRequest) {
  const params = await req.json(); // { mode, names, codes, postalCodes, date }

  try {
    const success = await performSearch(params); // Implémentation dans playwright.ts
    return NextResponse.json({ success });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
