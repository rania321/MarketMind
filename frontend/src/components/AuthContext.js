import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, logoutUser, getUser, resendVerificationEmail, confirmEmail, registerUser } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const userData = await getUser();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'utilisateur :', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = async (credentials) => {
    try {
      const loginResponse = await loginUser(credentials);
      console.log('Réponse login :', loginResponse);
      const userData = await getUser();
      console.log('Données utilisateur :', userData);
      setUser(userData);
    } catch (error) {
      console.error('Erreur de connexion :', error);
      throw error;
    }
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  const resendEmail = async (email) => {
    await resendVerificationEmail({ email });
  };

  const confirmEmailAction = async (key) => {
    await confirmEmail(key);
    const userData = await getUser();
    setUser(userData);
  };

  // Ajoutez la fonction register ici
  const register = async (data) => {
    try {
      const response = await registerUser(data);
      console.log('Réponse inscription :', response);
      return response;
    } catch (error) {
      console.error('Erreur inscription :', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, resendEmail, confirmEmailAction, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);