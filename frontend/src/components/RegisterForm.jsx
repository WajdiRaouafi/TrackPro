import React, { useState } from 'react';
import { register } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function RegisterForm() {
const [form, setForm] = useState({
  nom: '',
  prenom: '',
  telephone: '',
  email: '',
  password: '',
  role: 'CHEF_PROJET'
});



  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await register(form);
      toast.success('✅ Inscription réussie !');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      toast.error('❌ Erreur : ' + (err.response?.data?.message || 'Erreur inconnue'));
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '500px' }}>
      <h3 className="text-center mb-4">Créer un compte</h3>
      <form onSubmit={handleSubmit} className="shadow p-4 rounded bg-light">
         <div className="mb-3">
          <label>Nom</label>
        <input type="text" name="nom" className="form-control" placeholder="Nom" onChange={handleChange} required />
         </div>
         <div className="mb-3">
          <label>Prenom</label>
        <input type="text" name="prenom" className="form-control" placeholder="Prénom" onChange={handleChange} required />
        </div>
                 <div className="mb-3">
        <label>Téléphone</label>
        <input type="tel" name="telephone" className="form-control" placeholder="Téléphone" onChange={handleChange} required />
        </div>

        <div className="mb-3">
          <label>Email</label>
          <input
            type="email"
            name="email"
            className="form-control"
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>Mot de passe</label>
          <input
            type="password"
            name="password"
            className="form-control"
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>Rôle</label>
          <select name="role" className="form-select" onChange={handleChange}>
            <option value="CHEF_PROJET">Chef de Projet</option>
            <option value="MEMBRE_EQUIPE">Membre d'Équipe</option>
            <option value="GESTIONNAIRE_RESSOURCES">Gestionnaire de Ressources</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary w-100">S'inscrire</button>
      </form>
    </div>
  );
}
