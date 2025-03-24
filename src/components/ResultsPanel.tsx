
import { useState } from 'react';
import { Search, CheckSquare, Square, Copy, Download, X } from 'lucide-react';
import { Result } from '../types';

interface ResultsPanelProps {
  results: Result[];
  filteredResults: Result[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  toggleResultSelection: (id: string) => void;
  selectAllResults: (selected: boolean) => void;
  copySelectedResults: () => void;
  exportSelectedResults: () => void;
  isRunning: boolean;
}

const ResultsPanel = ({
  results,
  filteredResults,
  searchTerm,
  setSearchTerm,
  toggleResultSelection,
  selectAllResults,
  copySelectedResults,
  exportSelectedResults,
  isRunning,
}: ResultsPanelProps) => {
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    selectAllResults(newSelectAll);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const selectedCount = filteredResults.filter(r => r.selected).length;

  return (
    <div className="glass-panel p-5 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold">Scraping Results</h2>
        <div className="text-sm text-muted-foreground">
          {results.length} result{results.length !== 1 ? 's' : ''} found
        </div>
      </div>
      
      <div className="relative mb-4">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search results..."
          className="glass-input w-full pl-9 pr-9 h-9"
        />
        {searchTerm && (
          <button 
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      <div className="overflow-hidden flex-1 flex flex-col">
        {results.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <div className="mb-3 text-muted-foreground/50">
              <Search className="h-10 w-10" />
            </div>
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
            
            <div className="overflow-y-auto flex-1 -mr-2 pr-2">
              {filteredResults.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <p>No matching results found</p>
                  <p className="text-sm mt-1">Try changing your search criteria</p>
                </div>
              ) : (
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
                    {filteredResults.map((result) => (
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
              )}
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
