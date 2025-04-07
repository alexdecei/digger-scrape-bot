import { useState, useEffect, useRef } from 'react';
import { FilterState, BotMode } from '..';
import { toast } from '@/hooks/use-toast';
import { apiService } from '@/utils/apiService';



export const useSearch = () => {
  const abortRef = useRef<AbortController | null>(null);
  const getInitialState = (): FilterState => {
    if (typeof window !== 'undefined') {
      const savedFilters = localStorage.getItem('digger_filters');
      if (savedFilters) {
        try {
          return JSON.parse(savedFilters);
        } catch (e) {
          console.log('❌ Error parsing saved filters', e);
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
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    localStorage.setItem('digger_filters', JSON.stringify(filters));
    if (!filters || !filters.dateRange.from) {
      resetSearchState();
    }
  }, [filters]);

  const resetSearchState = () => {
    setIsSearching(false);
  };

  const startSearch = async () => {
    //console.log(filters)
    // Normalisation de la date
    const rawDate = filters.dateRange.from;
    const parsedDate = typeof rawDate === 'string' ? new Date(rawDate) : rawDate;

   //console.log("ℹ️ lancement useSearch")

    if (!parsedDate || isNaN(parsedDate.getTime())) {
      toast({
        title: "Date invalide",
        description: "La date de début est absente ou invalide.",
        variant: "destructive",
      });
      setIsSearching(false); // ✅ corrige le blocage du bouton
      return;
    }

    abortRef.current?.abort(); // Stop any previous search
    const controller = new AbortController();
    abortRef.current = controller;
    

    try {
      setIsSearching(true);
      console.log("ℹ️ lancement api search")
      const response = await apiService.search({
        mode: filters.mode,
        postalCodes: filters.postalCodes,
        names: filters.names,
        codes: filters.codes,
        date: parsedDate.toISOString(),
      }, controller.signal); // 👈 signal ici

      if (!response.success) {
        throw new Error(response.error || 'Unknown error');
      }

      toast({
        title: "Search Started",
        description: "The scraping process was triggered successfully.",
      });
    } catch (error) {
      
      /*console.error('Error triggering search:', error);
      toast({
        title: "Search Error",
        description: (error as Error).message || "Something went wrong.",
        variant: "destructive",
      });*/
    } finally {
      setIsSearching(false);
    }
  };

  const stopSearch = async () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const response = await apiService.stopSearch();
    setIsSearching(false);
    toast({
      title: "Recherche annulée",
      description: "La recherche a été interrompue.",
    });
  };

  // Toutes tes méthodes de gestion des filtres inchangées
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
      dateRange: { from, to: null },
    }));
  };

  const resetFilters = () => {
    const emptyFilters = {
      mode: 'Statut' as const,
      postalCodes: [],
      names: [],
      codes: [],
      dateRange: { from: null, to: null },
    };

    setFilters(emptyFilters);
    localStorage.removeItem('digger_filters');
  };

  const addNamesFromText = (text: string) => {
    if (!text.trim()) return;

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
    isSearching,
    resetSearchState,
    stopSearch,
    startSearch,
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
