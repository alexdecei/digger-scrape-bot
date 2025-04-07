"use client";

import { useState, useEffect } from 'react';
import PasswordGate from './PasswordGate';
import BotConfigPanel from './BotConfigPanel';
import ResultsPanel from './ResultsPanel';
import { useSearch } from '@/hooks/useSearch';
import { useBotState } from '@/hooks/useBotState';
import { setAuth } from "@/utils/authStore";

type AuthUser = 'MANU' | 'YO' | null;

const PASSWORD_MANU = "aze";
const PASSWORD_YO = "azx";



export default function ClientApp() {
  const [authUser, setAuthUser] = useState<AuthUser>(null); 

  const {
    filters,
    isSearching,
    resetSearchState,
    startSearch,
    stopSearch,
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
  } = useSearch();

  const {
    botState,
    disConnectBot,
    connectBot,
    toggleResultSelection,
    selectAllResults,
    clearResults,
    copySelectedResults,
    exportSelectedResults,
    updateOktaCode,
  } = useBotState();


  useEffect(() => {
    if (!botState.isConnected) {
      resetSearchState(); // ⬅️ reset la recherche quand le bot s'arrête
    }
  }, [botState.isConnected]);

  const toggleSearch = () => {
    console.log("ℹ️ Bot isSearching ? " + isSearching)
    if (!isSearching) {
      startSearch();
    } else {
      stopSearch(); // ✅ interrompt si déjà en cours
    }
  };

  
  const handleAuthenticate = (password: string): boolean => {
    if (password === PASSWORD_MANU) {
      setAuth('MANU');
      setAuthUser('MANU');
      return true;
    } else if (password === PASSWORD_YO) {
      setAuth('YO');
      setAuthUser('YO');
      return true;
    }
    return false;
  };
  if (!authUser) {
    return <PasswordGate onAuthenticate={handleAuthenticate} />;
  }


  return (
    <div className="container py-6">
      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6 min-h-[calc(100vh-110px)]">
        <div className="section-fade-in" style={{ '--delay': '100ms' } as React.CSSProperties}>
          <BotConfigPanel
            filters={filters}
            updateMode={updateMode}
            addPostalCode={addPostalCode}
            removePostalCode={removePostalCode}
            addName={addName}
            removeName={removeName}
            addCode={addCode}
            removeCode={removeCode}
            updateDateRange={updateDateRange}
            resetFilters={resetFilters}
            addNamesFromText={addNamesFromText}
            isConnected={botState.isConnected}
            connectBot={connectBot}
            disConnectBot={disConnectBot}
            isSearching={isSearching}
            toggleSearch={toggleSearch}
            oktaCode={botState.oktaCode}
            updateOktaCode={updateOktaCode}
          />
        </div>

        <div className="section-fade-in" style={{ '--delay': '200ms' } as React.CSSProperties}>
          <ResultsPanel
            results={botState.results}
            filteredResults={botState.results}
            toggleResultSelection={toggleResultSelection}
            selectAllResults={selectAllResults}
            copySelectedResults={copySelectedResults}
            exportSelectedResults={exportSelectedResults}
            isConnected={botState.isConnected}
          />
        </div>
      </div>
    </div>
  );
  
}

