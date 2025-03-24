
import { useState } from 'react';
import { Result } from '../types';

export const useResults = (results: Result[]) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredResults = searchTerm.trim() === '' 
    ? results
    : results.filter(result => 
        result.numeroAbo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.codePostal.toLowerCase().includes(searchTerm.toLowerCase())
      );

  return {
    searchTerm,
    setSearchTerm,
    filteredResults,
  };
};
