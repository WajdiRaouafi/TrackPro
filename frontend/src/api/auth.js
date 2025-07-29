import api from './axios';

export const register = (userData) => {
  return api.post('/users', userData);
};

export const login = async (email, password) => {
  const res = await api.post('/auth/login', { email, password });

  if (res.data.access_token) {
    const token = res.data.access_token;

    // 🔐 Sauvegarder le token
    localStorage.setItem('token', token);

    // 🧠 Décoder payload du JWT
    const payload = JSON.parse(atob(token.split('.')[1]));
    localStorage.setItem('role', payload.role);
    localStorage.setItem('email', payload.username);

    // ✅ Récupérer l’utilisateur complet
    const userResponse = await api.get('/auth/me');
    localStorage.setItem('user', JSON.stringify(userResponse.data));
  }

  return res.data;
};

export const getToken = () => localStorage.getItem('token');

// ✅ Pour récupérer les infos de l'utilisateur via API
export const getCurrentUserFromAPI = () => {
  return api.get('/auth/me');
};

// ✅ Pour récupérer les infos du token sans appel API
export const getDecodedToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    payload.token = token;
    return payload;
  } catch (e) {
    console.error("Erreur lors du décodage du token :", e);
    return null;
  }
};

// ✅ Déconnexion
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('email');
  localStorage.removeItem('user');
};
