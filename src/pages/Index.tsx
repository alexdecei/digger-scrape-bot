
import { useState } from 'react';
import Layout from '../components/Layout';
import PasswordGate from '../components/PasswordGate';
import BotConfigPanel from '../components/BotConfigPanel';
import ResultsPanel from '../components/ResultsPanel';
import { useFilters } from '../hooks/useFilters';
import { useBotState } from '../hooks/useBotState';

// The password gate should connect to an API in a real application
// For demonstration purposes, we're using a hardcoded password
const DEMO_PASSWORD = "digger";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { filters, updateMode, addPostalCode, removePostalCode, addName, removeName, addCode, removeCode, updateDateRange, resetFilters, addNamesFromText } = useFilters();
  const { botState, toggleBot, toggleResultSelection, selectAllResults, clearResults, copySelectedResults, exportSelectedResults } = useBotState();

  const handleAuthenticate = () => {
    setIsAuthenticated(true);
  };

  return (
    <>
      {!isAuthenticated && (
        <PasswordGate 
          onAuthenticate={handleAuthenticate} 
          correctPassword={DEMO_PASSWORD} 
        />
      )}
      
      <Layout>
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
              />
            </div>
            
            <div className="section-fade-in" style={{ '--delay': '200ms' } as React.CSSProperties}>
              <ResultsPanel
                results={botState.results}
                filteredResults={botState.results} // Pass the full results list
                toggleResultSelection={toggleResultSelection}
                selectAllResults={selectAllResults}
                copySelectedResults={copySelectedResults}
                exportSelectedResults={exportSelectedResults}
                isRunning={botState.isRunning}
              />
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Index;
