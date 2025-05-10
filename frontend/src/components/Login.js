import React, { useState } from 'react';
import { useAuth } from './AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
      setMessage('Connexion réussie !');
    } catch (error) {
      setMessage(error.detail || 'Erreur de connexion.');
    }
  };

  return (
    <div>
      <h2>Connexion</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
        <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Mot de passe" required />
        <button type="submit">Se connecter</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default Login;