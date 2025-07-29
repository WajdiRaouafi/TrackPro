import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserById, updateUser } from '../api/users';
import { toast } from 'react-toastify';

export default function UserEditForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState({
    nom: '',
    prenom: '',
    email: '',
    role: '',
    isActive: true
  });

  useEffect(() => {
    getUserById(id)
      .then(res => setUser(res.data))
      .catch(() => toast.error("Erreur lors du chargement de l'utilisateur"));
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser(id, user);
      toast.success("Utilisateur mis à jour ✅");
      navigate('/admin/users');
    } catch (err) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '600px' }}>
      <h3 className="mb-4">Modifier l'utilisateur</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Nom</label>
          <input
            type="text"
            className="form-control"
            name="nom"
            value={user.nom}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Prénom</label>
          <input
            type="text"
            className="form-control"
            name="prenom"
            value={user.prenom}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={user.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Rôle</label>
          <select
            className="form-select"
            name="role"
            value={user.role}
            onChange={handleChange}
            required
          >
            <option value="">-- Sélectionner un rôle --</option>
            <option value="ADMIN">Administrateur</option>
            <option value="CHEF_PROJET">Chef de projet</option>
            <option value="MEMBRE_EQUIPE">Membre de l’équipe</option>
            <option value="GESTIONNAIRE_RESSOURCES">Gestionnaire de ressources</option>
          </select>
        </div>
        <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={user.isActive}
            onChange={handleChange}
          />
          <label className="form-check-label" htmlFor="isActive">
            Actif
          </label>
        </div>
        <button type="submit" className="btn btn-primary">
          Enregistrer
        </button>
      </form>
    </div>
  );
}
