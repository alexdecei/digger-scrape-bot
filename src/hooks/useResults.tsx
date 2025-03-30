// src/hooks/useResults.tsx
'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/utils/apiService';

export interface Result {
  id: string;
  numeroAbo: string;
  prenom: string;
  codePostal: string;
  selected: boolean;
}

export const useResults = () => {
  const [rawResults, setRawResults] = useState<Omit<Result, 'selected'>[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const data = await apiService.getResults();
        const received = (data.results || []).map((r: any) => ({
          id: r.numeroAbo,
          numeroAbo: r.numeroAbo,
          prenom: r.prenom,
          codePostal: r.codePostal,
        }));
        setRawResults(received);
      } catch (e) {
        console.error('[Polling Results] Failed:', e);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const results: Result[] = rawResults.map(r => ({
    ...r,
    selected: selectedIds.has(r.numeroAbo),
  }));

  const toggleResultSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAllResults = (selected: boolean) => {
    setSelectedIds(selected ? new Set(rawResults.map(r => r.numeroAbo)) : new Set());
  };

  const clearResults = () => {
    setRawResults([]);
    setSelectedIds(new Set());
  };

  const getSelected = () => results.filter(r => r.selected);

  const copySelectedResults = () => {
    const selected = getSelected();
    if (selected.length === 0) return;
    const text = selected.map(r => `${r.numeroAbo}, ${r.prenom}, ${r.codePostal}`).join('\n');
    navigator.clipboard.writeText(text);
  };

  const exportSelectedResults = () => {
    const selected = getSelected();
    if (selected.length === 0) return;
    const text = selected.map(r => `${r.numeroAbo}, ${r.prenom}, ${r.codePostal}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `digger-export-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    results,
    toggleResultSelection,
    selectAllResults,
    clearResults,
    copySelectedResults,
    exportSelectedResults,
  };
};
