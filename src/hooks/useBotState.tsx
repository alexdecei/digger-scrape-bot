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
    isConnected: false,
    isSearching: false,
    results: [],
    oktaCode: '',
  };
};

export const useBotState = () => {
  const [botState, updateLocalBotState] = useState<BotState>(getInitialState);

  const updateOktaCode = (code: string) => {
    updateLocalBotState(prev => ({ ...prev, oktaCode: code }));
  };

  useEffect(() => {
    localStorage.setItem('digger_bot_state', JSON.stringify(botState));
  }, [botState]);

  // Polling de l’état réel du bot depuis le backend toutes les secondes
  useEffect(() => {
    const poll = async () => {
      try {
        const { status } = await apiService.getBotState();
        updateLocalBotState(prev => {
          if (
            prev.isConnected !== status.isConnected ||
            prev.isSearching !== status.isSearching
          ) {
            return { ...prev, ...status };
          }
          return prev; // Pas de changement, on évite le re-rending inutule
        });
      } catch (err) {
        console.error('[Polling] Failed:', err);
      }
    };
  
    const interval = setInterval(poll, 1000);
    return () => clearInterval(interval);
  }, []);

  const connectBot = async () => {
    try {
      const status = await apiService.setBotState(true, botState.oktaCode);
      console.log("🟢 Bot connected: " + status.status.isConnected);
      console.log("🟢 Bot searching: " + status.status.isSearching);
      updateLocalBotState(prev => ({
        ...prev,
        isConnected: status.status.isConnected,
        isSearching: status.status.isSearching,
      }));
    } catch (error) {
      console.log("🔴 End of Bot connexion: ", error);
    }
  };

  const disconnectBot = async () => {
    try {
      const status = await apiService.setBotState(false);
      console.log("🔴 Bot connected: " + status.status.isConnected);
      console.log("🔴 Bot searching: " + status.status.isSearching);
      updateLocalBotState(prev => ({
        ...prev,
        isConnected: status.status.isConnected,
        isSearching: status.status.isSearching,
      }));
    } catch (error) {
      console.log('🔴 End of Bot connexion: ', error);
    }
  };


  const toggleResultSelection = (id: string) => {
    updateLocalBotState(prev => ({
      ...prev,
      results: prev.results.map(result =>
        result.id === id ? { ...result, selected: !result.selected } : result
      ),
    }));
  };

  const selectAllResults = (selected: boolean) => {
    updateLocalBotState(prev => ({
      ...prev,
      results: prev.results.map(result => ({ ...result, selected })),
    }));
  };

  const clearResults = () => {
    updateLocalBotState(prev => ({
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
    disConnectBot: disconnectBot,
    connectBot,
    toggleResultSelection,
    selectAllResults,
    clearResults,
    copySelectedResults,
    exportSelectedResults,
    updateOktaCode,
  };
};

