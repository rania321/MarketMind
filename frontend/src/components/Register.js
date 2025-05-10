import React, { useState } from 'react';
import { useAuth } from './AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({ email: '', password1: '', password2: '', name: '' });
  const [message, setMessage] = useState('');
  const { register, resendEmail } = useAuth(); // Extraire register et resendEmail

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData); // Ligne 16 : registerUser devrait être une fonction
      setMessage('Inscription réussie ! Vérifiez votre email.');
    } catch (error) {
      setMessage(error.detail || 'Erreur lors de l\'inscription.');
      console.error('Erreur détaillée :', error); // Ligne 20 : affichage de l'erreur
    }
  };

  const handleResend = async () => {
    try {
      await resendEmail(formData.email);
      setMessage('Email de vérification renvoyé.');
    } catch (error) {
      setMessage('Erreur lors de l\'envoi.');
      console.error('Erreur renvoi email :', error);
    }
  };

  return (
    <div>
      <h2>Inscription</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Nom"
          required
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        <input
          type="password"
          name="password1"
          value={formData.password1}
          onChange={handleChange}
          placeholder="Mot de passe"
          required
        />
        <input
          type="password"
          name="password2"
          value={formData.password2}
          onChange={handleChange}
          placeholder="Confirmer mot de passe"
          required
        />
        <button type="submit">S'inscrire</button>
      </form>
      <button onClick={handleResend}>Renvoyer l'email</button>
      <p>{message}</p>
    </div>
  );
};

export default Register;