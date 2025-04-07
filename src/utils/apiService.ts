const BASE_URL = '/api';

export const apiService = {
  getBotState: async () => {
    const res = await fetch(`${BASE_URL}/botState`);
    return res.json();
  },

  setBotState: async (connect: boolean, oktaCode?: string, authUser?: string) => {
    const res = await fetch(`${BASE_URL}/botState`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: connect ? 'start' : 'stop',
        oktaCode,
        authUser,
      }),
    });
  
    const status = await res.json();
    return status;
  },
  

  search: async (filters: any, signal?: AbortSignal) => {
    const res = await fetch(`${BASE_URL}/search`, {
      method: 'POST',
      body: JSON.stringify(filters),
      signal, // 👈 ici on l’ajoute en option
    });
    return res.json();
  },

  stopSearch: async () => {
    const res = await fetch(`${BASE_URL}/search`, {
      method: 'DELETE',
    });
    return res.json();
  },

  getResults: async () => {
    const res = await fetch(`${BASE_URL}/results`);
    if (!res.ok) throw new Error('Failed to fetch results');
    return res.json();
  },
};

