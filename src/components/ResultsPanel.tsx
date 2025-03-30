"use client";

import { useState } from 'react';
import { CheckSquare, Square, Copy, Download } from 'lucide-react';
import { useResults } from '@/hooks/useResults';

interface ResultsPanelProps {
  isRunning: boolean;
}

const ResultsPanel = ({ isRunning }: ResultsPanelProps) => {
  const {
    results,
    toggleResultSelection,
    selectAllResults,
    copySelectedResults,
    exportSelectedResults,
  } = useResults();

  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = () => {
    const newValue = !selectAll;
    setSelectAll(newValue);
    selectAllResults(newValue);
  };

  const selectedCount = results.filter(r => r.selected).length;
  const uniqueResults = Array.from(new Map(
    results.map(r => [r.numeroAbo, r])
  ).values());

  return (
    <div className="glass-panel p-5 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold">Scraping Results</h2>
        <div className="text-sm text-muted-foreground">
          {results.length} result{results.length !== 1 ? 's' : ''} found
        </div>
      </div>
      
      <div className="overflow-hidden flex-1 flex flex-col">
        {results.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <p className="mb-1">No results yet</p>
            <p className="text-sm">
              {isRunning 
                ? "The bot is running. Results will appear here once found." 
                : "Configure and start the bot to begin scraping."
              }
            </p>
          </div>
        ) : (
          <>
            <div className="border-b border-border pb-2 mb-2 flex items-center gap-3">
              <button 
                onClick={handleSelectAll}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {selectAll ? (
                  <CheckSquare className="h-3.5 w-3.5" />
                ) : (
                  <Square className="h-3.5 w-3.5" />
                )}
                {selectAll ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto max-h-[60vh] -mr-2 pr-2">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground">
                  <tr>
                    <th className="w-10 text-left font-normal py-2"></th>
                    <th className="text-left font-normal py-2">Numéro abo</th>
                    <th className="text-left font-normal py-2">Prénom</th>
                    <th className="text-left font-normal py-2">Code postal</th>
                    <th className="w-10 text-left font-normal py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {uniqueResults.map((result) => (
                    <tr 
                      key={result.id} 
                      className="border-b border-border/50 last:border-0 hover:bg-accent/30 transition-colors"
                    >
                      <td className="py-2.5">
                        <button 
                          onClick={() => toggleResultSelection(result.id)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {result.selected ? (
                            <CheckSquare className="h-4 w-4" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                      <td className="py-2.5">{result.numeroAbo}</td>
                      <td className="py-2.5">{result.prenom}</td>
                      <td className="py-2.5">{result.codePostal}</td>
                      <td className="py-2.5 text-right">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `${result.numeroAbo}, ${result.prenom}, ${result.codePostal}`
                            );
                          }}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          title="Copy row"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      
      {results.length > 0 && (
        <div className="pt-4 mt-auto border-t border-border flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {selectedCount === 0 
              ? "No items selected" 
              : `${selectedCount} item${selectedCount !== 1 ? 's' : ''} selected`}
          </div>
          <div className="flex gap-3">
            <button 
              onClick={copySelectedResults}
              disabled={selectedCount === 0}
              className={`secondary-button h-8 px-3 text-xs flex items-center gap-1.5
                        ${selectedCount === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Copy className="h-3.5 w-3.5" />
              Copy Selected
            </button>
            <button 
              onClick={exportSelectedResults}
              disabled={selectedCount === 0}
              className={`primary-button h-8 px-3 text-xs flex items-center gap-1.5
                        ${selectedCount === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Download className="h-3.5 w-3.5" />
              Export Selected
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsPanel;
