// public/githubStorage.js
const DB_URL = 'https://adriloza240.github.io/Kumi-project/db.json';
const originalLS = window.localStorage;

window.localStorage = {
  getItem: async (key) => {
    if (['empleos', 'cvs', 'users'].includes(key)) {
      try {
        const response = await fetch(`${DB_URL}?t=${Date.now()}`);
        if (!response.ok) throw new Error('Error en la respuesta');
        const data = await response.json();
        console.log('Datos cargados desde GitHub:', data[key]);
        return JSON.stringify(data[key] || null);
      } catch (error) {
        console.log('Error al cargar de GitHub, usando localStorage:', error);
        return originalLS.getItem(key);
      }
    }
    return originalLS.getItem(key);
  },
  
  setItem: async (key, value) => {
    try {
      if (['empleos', 'cvs', 'users'].includes(key)) {
        const response = await fetch(DB_URL);
        const data = await response.json();
        data[key] = JSON.parse(value);
        
        console.log('=== COPIA ESTO EN db.json ===');
        console.log(JSON.stringify(data, null, 2));
        console.log('============================');
        
        // Guarda también localmente como respaldo
        originalLS.setItem('last_github_update', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error al preparar datos para GitHub:', error);
    }
    
    originalLS.setItem(key, value);
  },
  
  removeItem: (key) => originalLS.removeItem(key),
  clear: () => originalLS.clear(),
  key: (index) => originalLS.key(index),
  get length() { return originalLS.length; }
};
