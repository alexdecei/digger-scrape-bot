const BASE_URL = '/api';

export const apiService = {
  getBotState: async () => {
    const res = await fetch(`${BASE_URL}/botState`);
    return res.json();
  },

  setBotState: async (running: boolean, oktaCode?: string) => {
    const res = await fetch(`${BASE_URL}/botState`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: running ? 'start' : 'stop',
        oktaCode,
      }),
    });
    return res.json();
  },

  search: async (filters: any, signal?: AbortSignal) => {
    const res = await fetch(`${BASE_URL}/search`, {
      method: 'POST',
      body: JSON.stringify(filters),
      signal, // 👈 ici on l’ajoute en option
    });
    return res.json();
  },

  getResults: async () => {
    const res = await fetch(`${BASE_URL}/results`);
    if (!res.ok) throw new Error('Failed to fetch results');
    return res.json();
  },
};

