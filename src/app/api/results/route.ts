// src/app/api/results/route.ts
import { NextResponse } from 'next/server';
import { getResults } from '@/lib/playwright';

export async function GET() {
  const results = await getResults();
  return NextResponse.json({ results });
}