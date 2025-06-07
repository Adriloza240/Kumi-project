// Simula una API usando fetch al db.json público + localStorage
const DB_URL = '/db.json';

export const getInitialData = async () => {
  try {
    const response = await fetch(DB_URL);
    if (!response.ok) throw new Error("Error cargando datos iniciales");
    return await response.json();
  } catch (error) {
    console.error("Error:", error);
    return { empleos: [], usuarios: [], cvs: [] };
  }
};

// Operaciones para empleos
export const getEmpleos = async () => {
  const initialData = await getInitialData();
  const localEmpleos = JSON.parse(localStorage.getItem('empleos')) || [];
  return [...initialData.empleos, ...localEmpleos];
};

export const saveEmpleo = async (nuevoEmpleo) => {
  const empleos = JSON.parse(localStorage.getItem('empleos')) || [];
  const user = JSON.parse(localStorage.getItem('user'));
  
  const empleoCompleto = {
    ...nuevoEmpleo,
    id: Date.now(),
    empresa: user.nombre,
    postulantes: []
  };
  
  localStorage.setItem('empleos', JSON.stringify([...empleos, empleoCompleto]));
  return empleoCompleto;
};

// Operaciones para usuarios
export const registerUser = (userData) => {
  const users = JSON.parse(localStorage.getItem('usuarios')) || [];
  localStorage.setItem('usuarios', JSON.stringify([...users, userData]));
  return userData;
};

export const loginUser = async (email, password) => {
  const initialData = await getInitialData();
  const localUsers = JSON.parse(localStorage.getItem('usuarios')) || [];
  const allUsers = [...initialData.usuarios, ...localUsers];
  return allUsers.find(u => u.correo === email && u.password === password);
};

// Operaciones para CVs
export const saveCV = (cvData) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) throw new Error("Usuario no autenticado");
  
  const cvKey = `cv_${user.correo}`;
  localStorage.setItem(cvKey, JSON.stringify(cvData));
  
  // Guardar también en lista general
  const allCVs = JSON.parse(localStorage.getItem('cvs')) || [];
  const existingIndex = allCVs.findIndex(cv => cv.userId === user.correo);
  
  if (existingIndex >= 0) {
    allCVs[existingIndex] = { ...cvData, userId: user.correo };
  } else {
    allCVs.push({ ...cvData, userId: user.correo });
  }
  
  localStorage.setItem('cvs', JSON.stringify(allCVs));
  return cvData;
};

export const getCV = async (userId) => {
  const initialData = await getInitialData();
  const localCVs = JSON.parse(localStorage.getItem('cvs')) || [];
  const allCVs = [...initialData.cvs, ...localCVs];
  return allCVs.find(cv => cv.userId === userId);
};
