import React from 'react';
import { useAuth } from './AuthContext';

const Logout = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    alert('Déconnexion réussie !');
  };

  return <button onClick={handleLogout}>Se déconnecter</button>;
};

export default Logout;