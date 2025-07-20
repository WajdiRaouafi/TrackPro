import React, { useEffect, useState } from 'react';
import { getUsers, toggleUserStatus } from '../api/users';
import { toast } from 'react-toastify';

export default function AdminUserPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    getUsers()
      .then(res => setUsers(res.data))
      .catch(() => toast.error("Erreur lors du chargement des utilisateurs"));
  };

  const handleToggle = (user) => {
    toggleUserStatus(user.id, !user.isActive)
      .then(() => {
        toast.success(`Utilisateur ${user.email} ${user.isActive ? 'désactivé' : 'activé'} ✅`);
        loadUsers();
      })
      .catch(() => toast.error("Erreur lors de la mise à jour"));
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Gestion des Utilisateurs</h3>
      <table className="table table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th>Email</th>
            <th>Rôle</th>
            <th>Statut</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <span className={`badge ${user.isActive ? 'bg-success' : 'bg-secondary'}`}>
                  {user.isActive ? 'Actif' : 'Inactif'}
                </span>
              </td>
              <td>
                <button
                  className={`btn btn-sm ${user.isActive ? 'btn-danger' : 'btn-success'}`}
                  onClick={() => handleToggle(user)}
                >
                  {user.isActive ? 'Désactiver' : 'Activer'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
