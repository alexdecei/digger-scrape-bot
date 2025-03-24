
import { useState, useEffect } from 'react';
import { FilterState, BotMode } from '../types';

export const useFilters = () => {
  // Initialize filters from localStorage if available
  const getInitialState = (): FilterState => {
    if (typeof window !== 'undefined') {
      const savedFilters = localStorage.getItem('digger_filters');
      if (savedFilters) {
        try {
          return JSON.parse(savedFilters);
        } catch (e) {
          console.error('Error parsing saved filters', e);
        }
      }
    }
    
    return {
      mode: 'Statut',
      postalCodes: [],
      names: [],
      codes: [],
      dateRange: {
        from: null,
        to: null,
      },
    };
  };

  const [filters, setFilters] = useState<FilterState>(getInitialState);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('digger_filters', JSON.stringify(filters));
  }, [filters]);

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
    // Handle comma-separated values
    if (!name.trim()) return;
    
    const namesList = name.split(',').map(n => n.trim()).filter(n => n);
    const newNames = namesList.filter(n => !filters.names.includes(n));
    
    if (newNames.length === 0) return;
    
    setFilters(prev => ({
      ...prev,
      names: [...prev.names, ...newNames],
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

  const updateDateRange = (from: Date | null) => {
    setFilters(prev => ({
      ...prev,
      dateRange: { 
        from, 
        to: null // Keep the to field in the structure but it's not used
      },
    }));
  };

  const resetFilters = () => {
    const emptyFilters = {
      mode: 'Statut',
      postalCodes: [],
      names: [],
      codes: [],
      dateRange: {
        from: null,
        to: null,
      },
    };
    
    setFilters(emptyFilters);
    localStorage.removeItem('digger_filters');
  };

  // Handle bulk input for names (from textarea)
  const addNamesFromText = (text: string) => {
    if (!text.trim()) return;
    
    // Handle both newlines and commas
    const namesArray = text
      .split(/[\n,]/)
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
