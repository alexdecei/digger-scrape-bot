import { NextRequest, NextResponse } from 'next/server';
import { performSearch, stopSearch } from '@/lib/playwright';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const params = await req.json(); // { mode, names, codes, postalCodes, date }

  try {
    const success = await performSearch(params); // Implémentation dans playwright.ts
    return NextResponse.json({ success });
  } catch (err) {
    console.log("❌ Echec de la recherche",err);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  stopSearch(); // La fonction du point 1
  return NextResponse.json({ success: true });
}