// Simula una API usando localStorage + datos iniciales
const DB_PATH = '/db.json';

export const loadInitialData = async () => {
  const response = await fetch(DB_PATH);
  return await response.json();
};

export const saveData = (key, data) => {
  const existing = JSON.parse(localStorage.getItem(key) || '[]');
  localStorage.setItem(key, JSON.stringify([...existing, ...data]));
};

export const getLocalData = (key) => {
  return JSON.parse(localStorage.getItem(key) || '[]');
};
