// public/githubStorage.js
const DB_URL = 'https://adriloza240.github.io/tu-repositorio/db.json';
const originalLS = window.localStorage;

window.localStorage = {
  getItem: async (key) => {
    if (['empleos', 'cvs', 'users'].includes(key)) {
      try {
        const response = await fetch(`${DB_URL}?t=${Date.now()}`);
        const data = await response.json();
        console.log('Datos cargados desde GitHub:', data[key]);
        return JSON.stringify(data[key]);
      } catch (error) {
        console.log('Usando localStorage como fallback');
        return originalLS.getItem(key);
      }
    }
    return originalLS.getItem(key);
  },
  
  setItem: (key, value) => {
    if (['empleos', 'cvs', 'users'].includes(key)) {
      fetch(DB_URL)
        .then(res => res.json())
        .then(data => {
          data[key] = JSON.parse(value);
          console.log('Actualiza MANUALMENTE public/db.json con:');
          console.log(JSON.stringify(data, null, 2));
        });
    }
    originalLS.setItem(key, value);
  },
  
  // Mantén los otros métodos igual
  removeItem: (key) => originalLS.removeItem(key),
  clear: () => originalLS.clear(),
  key: (index) => originalLS.key(index),
  length: originalLS.length
};
