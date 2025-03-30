"use client";

import { useState, useEffect } from 'react';
import PasswordGate from './PasswordGate';
import BotConfigPanel from './BotConfigPanel';
import ResultsPanel from './ResultsPanel';
import { useSearch } from '@/hooks/useSearch';
import { useBotState } from '@/hooks/useBotState';


const DEMO_PASSWORD = "aze";

export default function ClientApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
    toggleBot,
    toggleResultSelection,
    selectAllResults,
    clearResults,
    copySelectedResults,
    exportSelectedResults,
    updateOktaCode,
  } = useBotState();

  const handleAuthenticate = () => {
    setIsAuthenticated(true);
  };

  useEffect(() => {
    if (!botState.isRunning) {
      resetSearchState(); // ⬅️ reset la recherche quand le bot s'arrête
    }
  }, [botState.isRunning]);

  const toggleSearch = () => {
    if (!isSearching) {
      startSearch();
    } else {
      stopSearch(); // ✅ interrompt si déjà en cours
    }
  };

  if (!isAuthenticated) {
    return <PasswordGate onAuthenticate={handleAuthenticate} correctPassword={DEMO_PASSWORD} />;
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
            isRunning={botState.isRunning}
            toggleBot={toggleBot}
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
            isRunning={botState.isRunning}
          />
        </div>
      </div>
    </div>
  );
  
}

