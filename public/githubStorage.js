const DB_URL = 'https://adriloza240.github.io/Kumi-project/public/db.json';
const originalLS = window.localStorage;

window.localStorage = {
  getItem: (key) => {
    // Siempre usa primero el localStorage local
    return originalLS.getItem(key);
  },
  setItem: (key, value) => {
    // Guarda localmente siempre
    originalLS.setItem(key, value);
    
    // Muestra en consola lo que debes copiar manualmente
    if (['empleos', 'cvs', 'users'].includes(key)) {
      console.log('=== COPIA ESTO EN db.json ===');
      console.log(JSON.stringify({
        ...JSON.parse(originalLS.getItem('empleos') || [],
        ...JSON.parse(originalLS.getItem('cvs') || [],
        ...JSON.parse(originalLS.getItem('users') || []
      }, null, 2));
    }
  }
};
