const PROXY_URL = 'https://project-work-navy.vercel.app/api/proxy';

window.originalLS = window.localStorage;

window.localStorage = {
  getItem: async (key) => {
    const localData = window.originalLS.getItem(key);
    if (localData) return localData;
    
    try {
      const res = await fetch(`${PROXY_URL}?key=${key}`);
      return await res.text();
    } catch {
      return null;
    }
  },
  
  setItem: (key, value) => {
    window.originalLS.setItem(key, value);
    fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value })
    }).catch(console.error);
  }
};
