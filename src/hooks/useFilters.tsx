
import { useState } from 'react';
import { FilterState, BotMode } from '../types';

export const useFilters = () => {
  const [filters, setFilters] = useState<FilterState>({
    mode: 'Statut',
    postalCodes: [],
    names: [],
    codes: [],
    dateRange: {
      from: null,
      to: null,
    },
  });

  const updateMode = (mode: BotMode) => {
    setFilters(prev => ({ ...prev, mode }));
  };

  const addPostalCode = (postalCode: string) => {
    if (!postalCode.trim() || filters.postalCodes.includes(postalCode.trim())) return;
    setFilters(prev => ({
      ...prev,
      postalCodes: [...prev.postalCodes, postalCode.trim()],
    }));
  };

  const removePostalCode = (postalCode: string) => {
    setFilters(prev => ({
      ...prev,
      postalCodes: prev.postalCodes.filter(pc => pc !== postalCode),
    }));
  };

  const addName = (name: string) => {
    if (!name.trim() || filters.names.includes(name.trim())) return;
    setFilters(prev => ({
      ...prev,
      names: [...prev.names, name.trim()],
    }));
  };

  const removeName = (name: string) => {
    setFilters(prev => ({
      ...prev,
      names: prev.names.filter(n => n !== name),
    }));
  };

  const addCode = (code: string) => {
    if (!code.trim() || filters.codes.includes(code.trim())) return;
    setFilters(prev => ({
      ...prev,
      codes: [...prev.codes, code.trim()],
    }));
  };

  const removeCode = (code: string) => {
    setFilters(prev => ({
      ...prev,
      codes: prev.codes.filter(c => c !== code),
    }));
  };

  const updateDateRange = (from: Date | null, to: Date | null) => {
    setFilters(prev => ({
      ...prev,
      dateRange: { from, to },
    }));
  };

  const resetFilters = () => {
    setFilters({
      mode: 'Statut',
      postalCodes: [],
      names: [],
      codes: [],
      dateRange: {
        from: null,
        to: null,
      },
    });
  };

  // Handle bulk input for names (from textarea)
  const addNamesFromText = (text: string) => {
    if (!text.trim()) return;
    
    const namesArray = text
      .split('\n')
      .map(name => name.trim())
      .filter(name => name && !filters.names.includes(name));
    
    if (namesArray.length === 0) return;
    
    setFilters(prev => ({
      ...prev,
      names: [...prev.names, ...namesArray],
    }));
  };

  return {
    filters,
    updateMode,
    addPostalCode,
    removePostalCode,
    addName,
    removeName,
    addCode,
    removeCode,
    updateDateRange,
    resetFilters,
    addNamesFromText,
  };
};
