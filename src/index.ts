
export type BotMode = 'Statut' | 'Annulation';

export interface FilterState {
  mode: BotMode;
  postalCodes: string[];
  names: string[];
  codes: string[];
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
}

export interface Result {
  id: string;
  numeroAbo: string;
  prenom: string;
  codePostal: string;
  selected: boolean;
}

export interface BotState {
  isRunning: boolean;
  isConnected: boolean;
  results: Result[];
  oktaCode: string;
}

export interface BotState {
  isRunning: boolean;
  isConnected: boolean;
  results: Result[];
}