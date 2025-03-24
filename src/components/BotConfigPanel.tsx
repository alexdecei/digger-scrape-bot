
import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  Hash, 
  Users, 
  Code, 
  Calendar, 
  X, 
  Plus, 
  PlayCircle, 
  StopCircle, 
  RefreshCw,
  MoreHorizontal 
} from 'lucide-react';
import { format } from 'date-fns';
import { FilterState, BotMode } from '../types';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ConfigurationItem from './ConfigurationItem';

interface BotConfigPanelProps {
  filters: FilterState;
  updateMode: (mode: BotMode) => void;
  addPostalCode: (code: string) => void;
  removePostalCode: (code: string) => void;
  addName: (name: string) => void;
  removeName: (name: string) => void;
  addCode: (code: string) => void;
  removeCode: (code: string) => void;
  updateDateRange: (from: Date | null, to: Date | null) => void;
  resetFilters: () => void;
  addNamesFromText: (text: string) => void;
  isRunning: boolean;
  toggleBot: () => void;
}

const BotConfigPanel = ({
  filters,
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
  isRunning,
  toggleBot
}: BotConfigPanelProps) => {
  const [postalCode, setPostalCode] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [showNamesTextarea, setShowNamesTextarea] = useState(false);
  const [bulkNames, setBulkNames] = useState('');
  const postalCodeInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handlePostalCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (postalCode.trim()) {
      addPostalCode(postalCode);
      setPostalCode('');
      postalCodeInputRef.current?.focus();
    }
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      addName(name);
      setName('');
    }
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      addCode(code);
      setCode('');
    }
  };

  const handleBulkNamesSubmit = () => {
    if (bulkNames.trim()) {
      addNamesFromText(bulkNames);
      setBulkNames('');
      setShowNamesTextarea(false);
      toast({
        title: "Names Added",
        description: "Multiple names have been added to the filter.",
      });
    }
  };

  return (
    <div className="glass-panel p-5 h-full overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Bot Configuration</h2>
        <button
          onClick={resetFilters}
          className="secondary-button text-xs p-2 h-8 flex items-center gap-1"
          disabled={isRunning}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reset Filters
        </button>
      </div>

      <div className="space-y-6">
        <ConfigurationItem 
          label="Mode" 
          description="Select the scraping mode"
        >
          <Select 
            value={filters.mode} 
            onValueChange={(value) => updateMode(value as BotMode)}
            disabled={isRunning}
          >
            <SelectTrigger className="glass-input">
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent className="pointer-events-auto">
              <SelectItem value="Statut">Statut</SelectItem>
              <SelectItem value="Annulation">Annulation</SelectItem>
            </SelectContent>
          </Select>
        </ConfigurationItem>

        <ConfigurationItem 
          label="Postal Codes" 
          description="Add one or more postal codes to filter results"
        >
          <form onSubmit={handlePostalCodeSubmit} className="flex gap-2 mb-2">
            <div className="relative flex-1">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                ref={postalCodeInputRef}
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="Enter postal code..."
                className="glass-input w-full pl-9 h-9"
                disabled={isRunning}
              />
            </div>
            <button 
              type="submit" 
              className="secondary-button aspect-square p-0 w-9 flex items-center justify-center"
              disabled={isRunning || !postalCode.trim()}
            >
              <Plus className="h-4 w-4" />
            </button>
          </form>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {filters.postalCodes.map((pc) => (
              <div key={pc} className="chip group">
                {pc}
                <button 
                  onClick={() => removePostalCode(pc)} 
                  className="ml-1 text-primary/70 hover:text-primary"
                  disabled={isRunning}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {filters.postalCodes.length === 0 && (
              <p className="text-xs text-muted-foreground italic">No postal codes added yet</p>
            )}
          </div>
        </ConfigurationItem>

        <ConfigurationItem 
          label="Names" 
          description="Add names to filter results"
        >
          <div className="flex items-center gap-2 mb-2">
            <form onSubmit={handleNameSubmit} className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter name..."
                  className="glass-input w-full pl-9 h-9"
                  disabled={isRunning}
                />
              </div>
              <button 
                type="submit" 
                className="secondary-button aspect-square p-0 w-9 flex items-center justify-center"
                disabled={isRunning || !name.trim()}
              >
                <Plus className="h-4 w-4" />
              </button>
            </form>
            <button 
              type="button"
              onClick={() => setShowNamesTextarea(!showNamesTextarea)}
              className="secondary-button aspect-square p-0 w-9 flex items-center justify-center"
              title="Bulk add names"
              disabled={isRunning}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          {showNamesTextarea && (
            <div className="mb-3 animate-slide-down">
              <textarea
                value={bulkNames}
                onChange={(e) => setBulkNames(e.target.value)}
                placeholder="Enter multiple names, one per line..."
                className="glass-input w-full p-3 min-h-[100px]"
                disabled={isRunning}
              />
              <div className="flex justify-end mt-2 gap-2">
                <button 
                  type="button" 
                  onClick={() => {
                    setBulkNames('');
                    setShowNamesTextarea(false);
                  }}
                  className="secondary-button text-xs px-3 h-7"
                  disabled={isRunning}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={handleBulkNamesSubmit}
                  className="primary-button text-xs px-3 h-7"
                  disabled={isRunning || !bulkNames.trim()}
                >
                  Add All Names
                </button>
              </div>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2 mt-2">
            {filters.names.map((n) => (
              <div key={n} className="chip group">
                {n}
                <button 
                  onClick={() => removeName(n)} 
                  className="ml-1 text-primary/70 hover:text-primary"
                  disabled={isRunning}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {filters.names.length === 0 && (
              <p className="text-xs text-muted-foreground italic">No names added yet</p>
            )}
          </div>
        </ConfigurationItem>

        <ConfigurationItem 
          label="Codes" 
          description="Add one or more codes to filter results"
        >
          <form onSubmit={handleCodeSubmit} className="flex gap-2 mb-2">
            <div className="relative flex-1">
              <Code className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter code..."
                className="glass-input w-full pl-9 h-9"
                disabled={isRunning}
              />
            </div>
            <button 
              type="submit" 
              className="secondary-button aspect-square p-0 w-9 flex items-center justify-center"
              disabled={isRunning || !code.trim()}
            >
              <Plus className="h-4 w-4" />
            </button>
          </form>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {filters.codes.map((c) => (
              <div key={c} className="chip group">
                {c}
                <button 
                  onClick={() => removeCode(c)} 
                  className="ml-1 text-primary/70 hover:text-primary"
                  disabled={isRunning}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {filters.codes.length === 0 && (
              <p className="text-xs text-muted-foreground italic">No codes added yet</p>
            )}
          </div>
        </ConfigurationItem>

        <ConfigurationItem 
          label="Date Range" 
          description="Select a date or range to filter results"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className={`glass-input w-full h-9 px-3 flex items-center justify-between ${isRunning ? 'opacity-70 cursor-not-allowed' : ''}`}
                  disabled={isRunning}
                >
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    {filters.dateRange.from ? (
                      format(filters.dateRange.from, 'PPP')
                    ) : (
                      <span className="text-muted-foreground">From date...</span>
                    )}
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white" align="start">
                <CalendarComponent
                  mode="single"
                  selected={filters.dateRange.from || undefined}
                  onSelect={(date) => updateDateRange(date, filters.dateRange.to)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className={`glass-input w-full h-9 px-3 flex items-center justify-between ${isRunning ? 'opacity-70 cursor-not-allowed' : ''}`}
                  disabled={isRunning || !filters.dateRange.from}
                >
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    {filters.dateRange.to ? (
                      format(filters.dateRange.to, 'PPP')
                    ) : (
                      <span className="text-muted-foreground">To date...</span>
                    )}
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white" align="start">
                <CalendarComponent
                  mode="single"
                  selected={filters.dateRange.to || undefined}
                  onSelect={(date) => updateDateRange(filters.dateRange.from, date)}
                  disabled={(date) => !filters.dateRange.from || date < filters.dateRange.from}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </ConfigurationItem>

        <div className="pt-2">
          <button 
            onClick={toggleBot}
            className={`w-full h-12 rounded-lg flex items-center justify-center transition-all font-medium
                      ${isRunning 
                        ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' 
                        : 'primary-button'}`}
          >
            {isRunning ? (
              <>
                <StopCircle className="h-5 w-5 mr-2" />
                Stop Bot
              </>
            ) : (
              <>
                <PlayCircle className="h-5 w-5 mr-2" />
                Start Bot
              </>
            )}
          </button>
          
          <div className={`flex items-center justify-center mt-3 text-xs
                         ${isRunning 
                          ? 'text-green-600' 
                          : 'text-muted-foreground'}`}>
            <div className={`w-2 h-2 rounded-full mr-2 
                          ${isRunning 
                           ? 'bg-green-500 animate-pulse' 
                           : 'bg-muted-foreground'}`} />
            {isRunning ? 'Bot is running' : 'Bot is stopped'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BotConfigPanel;
