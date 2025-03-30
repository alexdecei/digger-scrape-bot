import { useState, useEffect } from 'react';
import { BotState, Result } from '..';
import { toast } from '@/hooks/use-toast';
import { apiService } from '@/utils/apiService';


const getInitialState = (): BotState => {
  if (typeof window !== 'undefined') {
    const savedState = localStorage.getItem('digger_bot_state');
    if (savedState) {
      try {
        return JSON.parse(savedState);
      } catch (e) {
        console.error('Error parsing saved bot state', e);
      }
    }
  }

  return {
    isRunning: false,
    isConnected: false,
    results: [],
    oktaCode: '',
  };
};


export const useBotState = () => {
  const [botState, setBotState] = useState<BotState>(getInitialState);

  const updateOktaCode = (code: string) => {
    setBotState(prev => ({ ...prev, oktaCode: code }));
  };

  useEffect(() => {
    localStorage.setItem('digger_bot_state', JSON.stringify(botState));
  }, [botState]);

  useEffect(() => {
    apiService.getBotState()
      .then(({ running }) => {
        setBotState(prev => ({ ...prev, isRunning: running }));
      })
      .catch(err => console.error('[Bot Sync] Failed:', err));
  }, []);



  const toggleBot = async () => {
    try {
      if (botState.isRunning) {
        await apiService.setBotState(false);
        setBotState(prev => ({ ...prev, isRunning: false }));
        toast({ title: "Bot Stopped", description: "The scraping process has been stopped." });
      } else {
        toast({ title: "Connecting...", description: "Initializing the browser session..." });

  
        await apiService.setBotState(true, botState.oktaCode);
        setBotState(prev => ({ ...prev, isRunning: true, isConnected: true }));
  
        toast({ title: "Bot Started", description: "The scraping process has begun." });
      }
    } catch (error) {
      console.error('Error toggling bot:', error);
      toast({
        title: "Error",
        description: "Failed to control the bot. Please try again.",
        variant: "destructive",
      });    
      
      // 👇 Important : on vérifie le vrai état backend si une erreur survient
      const res = await apiService.getBotState();
      setBotState(prev => ({ ...prev, isRunning: res.running }));
      
    }
  };

  const toggleResultSelection = (id: string) => {
    setBotState(prev => ({
      ...prev,
      results: prev.results.map(result =>
        result.id === id ? { ...result, selected: !result.selected } : result
      ),
    }));
  };

  const selectAllResults = (selected: boolean) => {
    setBotState(prev => ({
      ...prev,
      results: prev.results.map(result => ({ ...result, selected })),
    }));
  };

  const clearResults = () => {
    setBotState(prev => ({
      ...prev,
      results: [],
    }));
  };

  const copySelectedResults = () => {
    const selectedResults = botState.results.filter(r => r.selected);
    if (selectedResults.length === 0) {
      toast({ title: "No Selection", description: "Please select at least one result to copy." });
      return;
    }

    const text = selectedResults
      .map(r => `${r.numeroAbo}, ${r.prenom}, ${r.codePostal}`)
      .join('\n');

    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: "Copied to Clipboard",
          description: `${selectedResults.length} result(s) copied successfully.`,
        });
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        toast({
          title: "Copy Failed",
          description: "Could not copy to clipboard. Please try again.",
          variant: "destructive",
        });
      });
  };

  const exportSelectedResults = () => {
    const selectedResults = botState.results.filter(r => r.selected);
    if (selectedResults.length === 0) {
      toast({ title: "No Selection", description: "Please select at least one result to export." });
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

  return {
    botState,
    toggleBot,
    toggleResultSelection,
    selectAllResults,
    clearResults,
    copySelectedResults,
    exportSelectedResults,
    updateOktaCode,
  };
};

