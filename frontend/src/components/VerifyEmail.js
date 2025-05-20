import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const VerifyEmail = () => {
  const { key } = useParams();
  const navigate = useNavigate();
  const { confirmEmailAction } = useAuth();
  const [message, setMessage] = useState('Vérification en cours...');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        console.log('Tentative de vérification avec clé :', key); // Débogage
        await confirmEmailAction(key);
        setMessage('Email vérifié avec succès ! Vous allez être redirigé vers la page de connexion...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } catch (error) {
        console.error('Erreur de vérification :', error);
        setMessage('Erreur lors de la vérification de l\'email : ' + (error.detail || 'Erreur inconnue'));
      }
    };

    if (key) {
      verifyEmail();
    } else {
      setMessage('Clé de vérification manquante.');
    }
  }, [key, confirmEmailAction, navigate]);

  return (
    <div>
      <h2>Vérification de l'email</h2>
      <p>{message}</p>
      {message.includes('Erreur') && (
        <button onClick={() => navigate('/login')}>
          Retourner à la connexion
        </button>
      )}
    </div>
  );
};

export default VerifyEmail;