
import { useState } from 'react';
import { BotState, Result } from '../types';
import { toast } from '@/components/ui/toast';

export const useBotState = () => {
  const [botState, setBotState] = useState<BotState>({
    isRunning: false,
    isConnected: false,
    results: [],
  });

  // Toggle bot running state
  const toggleBot = async () => {
    try {
      if (botState.isRunning) {
        // Stop the bot
        setBotState(prev => ({ ...prev, isRunning: false }));
        toast({
          title: "Bot Stopped",
          description: "The scraping process has been stopped.",
        });
      } else {
        // Start the bot
        // Here we would make the API call to start the bot
        // For now, we'll simulate the connection
        toast({
          title: "Connecting...",
          description: "Initializing the browser session...",
        });
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setBotState(prev => ({ 
          ...prev, 
          isRunning: true, 
          isConnected: true 
        }));
        
        toast({
          title: "Bot Started",
          description: "The scraping process has begun.",
        });
        
        // Simulate receiving results (for demo purposes)
        simulateResults();
      }
    } catch (error) {
      console.error('Error toggling bot:', error);
      toast({
        title: "Error",
        description: "Failed to control the bot. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Select/deselect a result
  const toggleResultSelection = (id: string) => {
    setBotState(prev => ({
      ...prev,
      results: prev.results.map(result => 
        result.id === id ? { ...result, selected: !result.selected } : result
      ),
    }));
  };

  // Select all results
  const selectAllResults = (selected: boolean) => {
    setBotState(prev => ({
      ...prev,
      results: prev.results.map(result => ({ ...result, selected })),
    }));
  };

  // Clear all results
  const clearResults = () => {
    setBotState(prev => ({
      ...prev,
      results: [],
    }));
  };

  // Copy selected results to clipboard
  const copySelectedResults = () => {
    const selectedResults = botState.results.filter(r => r.selected);
    if (selectedResults.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one result to copy.",
      });
      return;
    }

    const text = selectedResults
      .map(r => `${r.numeroAbo}, ${r.prenom}, ${r.codePostal}`)
      .join('\n');

    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to Clipboard",
        description: `${selectedResults.length} result(s) copied successfully.`,
      });
    }).catch(err => {
      console.error('Failed to copy:', err);
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard. Please try again.",
        variant: "destructive",
      });
    });
  };

  // Export selected results as txt file
  const exportSelectedResults = () => {
    const selectedResults = botState.results.filter(r => r.selected);
    if (selectedResults.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one result to export.",
      });
      return;
    }

    const text = selectedResults
      .map(r => `${r.numeroAbo}, ${r.prenom}, ${r.codePostal}`)
      .join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `digger-export-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `${selectedResults.length} result(s) exported successfully.`,
    });
  };

  // Simulated results for demo purposes
  const simulateResults = () => {
    const delay = 2000; // Initial delay
    const postalCodes = ['75001', '75002', '75003', '69001', '69002', '33000', '44000'];
    const firstNames = ['Jean', 'Marie', 'Pierre', 'Sophie', 'Thomas', 'Camille', 'Lucas', 'Emma', 'Louis'];
    
    const generateResult = (index: number): Result => ({
      id: `result-${Date.now()}-${index}`,
      numeroAbo: `A${Math.floor(100000 + Math.random() * 900000)}`,
      prenom: firstNames[Math.floor(Math.random() * firstNames.length)],
      codePostal: postalCodes[Math.floor(Math.random() * postalCodes.length)],
      selected: false,
    });

    // Simulate adding results over time
    const addResult = (index: number) => {
      if (!botState.isRunning) return; // Stop if bot is no longer running
      
      setBotState(prev => ({
        ...prev,
        results: [...prev.results, generateResult(index)]
      }));

      // Continue adding more results with random delays if still running
      if (index < 20 && botState.isRunning) {
        const nextDelay = 1000 + Math.random() * 3000;
        setTimeout(() => addResult(index + 1), nextDelay);
      }
    };

    // Start adding results after initial delay
    setTimeout(() => addResult(0), delay);
  };

  return {
    botState,
    toggleBot,
    toggleResultSelection,
    selectAllResults,
    clearResults,
    copySelectedResults,
    exportSelectedResults,
  };
};
