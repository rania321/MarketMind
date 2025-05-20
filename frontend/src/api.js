import axios from "axios";

// URL de base pour les appels API (peut être utilisé pour d'autres endpoints comme /api/predict)
const api = axios.create({
  baseURL: "http://192.168.43.47:5001",
});

// URL spécifique pour l'authentiSfication (Django API)
const AUTH_API_URL = "http://172.20.10.11:8000/api/v1/dj-rest-auth/";

// Fonction existante pour la prédiction de stratégie marketing
export const predictStrategy = (data) =>
  api.post("http://192.168.43.47:5001/api/predict", data);

// Fonctions pour l'authentification utilisateur
export const registerUser = async (data) => {
  try {
    const response = await axios.post(`${AUTH_API_URL}registration/`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: "Erreur lors de l'inscription" };
  }
};

export const resendVerificationEmail = async (data) => {
  try {
    const response = await axios.post(
      `${AUTH_API_URL}registration/resend-email/`,
      data
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: "Erreur lors de l'envoi" };
  }
};

export const confirmEmail = async (key) => {
  try {
    const response = await axios.post(
      `${AUTH_API_URL}registration/verify-email/${key}/`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: "Clé invalide" };
  }
};

export const loginUser = async (data) => {
  try {
    const response = await axios.post(`${AUTH_API_URL}login/`, data);
    // Utilisez 'access' au lieu de 'key' pour JWT
    if (response.data.access) {
      console.log("Token reçu :", response.data.access); // Pour débogage
      localStorage.setItem("token", response.data.access);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: "Erreur de connexion" };
  }
};

export const logoutUser = async () => {
  try {
    const response = await axios.post(`${AUTH_API_URL}logout/`);
    localStorage.removeItem("token");
    return response.data;
  } catch (error) {
    throw error.response?.data || { detail: "Erreur de déconnexion" };
  }
};

export const getUser = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Aucun token trouvé");
    const response = await axios.get(`${AUTH_API_URL}user/`, {
      headers: { Authorization: `Bearer ${token}` }, // Utilisez 'Bearer' pour JWT
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        detail: error.message || "Utilisateur non trouvé",
      }
    );
  }
};
