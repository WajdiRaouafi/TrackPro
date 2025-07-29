import React, { useEffect, useState } from 'react';
import { getUsers, toggleUserStatus, deleteUser } from '../api/users';
import { toast } from 'react-toastify';
import { MDBBadge } from 'mdb-react-ui-kit';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import '../App.css';

const formatRole = (role) => {
  switch (role) {
    case 'ADMIN': return 'Administrateur';
    case 'CHEF_PROJET': return 'Chef de projet';
    case 'MEMBRE_EQUIPE': return 'Membre de l’équipe';
    case 'GESTIONNAIRE_RESSOURCES': return 'Gestionnaire de ressources';
    default: return role;
  }
};

export default function AdminUserPage() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    getUsers()
      .then(res => setUsers(res.data))
      .catch(() => toast.error("Erreur lors du chargement des utilisateurs"));
  };

  const handleToggle = async (user) => {
    try {
      await toggleUserStatus(user.id, !user.isActive);
      toast.success(`Utilisateur ${user.email} ${user.isActive ? 'désactivé' : 'activé'} ✅`);
      setUsers(prev =>
        prev.map(u =>
          u.id === user.id ? { ...u, isActive: !user.isActive } : u
        )
      );
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/users/edit/${id}`);
  };

  const handleDelete = async (user) => {
    if (window.confirm(`Confirmer la suppression de ${user.prenom} ${user.nom} ?`)) {
      try {
        await deleteUser(user.id);
        toast.success("Utilisateur supprimé ✅");
        loadUsers();
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  return (
    <div className="container py-4">
      <div className="card shadow-lg border-0">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">Gestion des Utilisateurs</h4>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Utilisateur</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <img
                          src="https://mdbootstrap.com/img/new/avatars/2.jpg"
                          alt="avatar"
                          className="rounded-circle"
                          width="45"
                          height="45"
                        />
                        <div className="ms-3">
                          <h6 className="mb-0">
                            {user.nom && user.prenom ? `${user.nom} ${user.prenom}` : 'Nom inconnu'}
                          </h6>
                          <small className="text-muted">{user.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>{formatRole(user.role)}</td>
                    <td>
                      <MDBBadge color={user.isActive ? 'success' : 'secondary'} pill>
                        {user.isActive ? 'Actif' : 'Inactif'}
                      </MDBBadge>
                    </td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-2">
                        <button className="btn btn-warning btn-sm" onClick={() => handleEdit(user.id)}>
                          <FaEdit className="me-1" /> Modifier
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(user)}>
                          <FaTrash className="me-1" /> Supprimer
                        </button>
                        <button
                          className={`btn btn-sm ${user.isActive ? 'btn-secondary' : 'btn-success'}`}
                          onClick={() => handleToggle(user)}
                        >
                          {user.isActive ? <FaToggleOff className="me-1" /> : <FaToggleOn className="me-1" />}
                          {user.isActive ? 'Désactiver' : 'Activer'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-muted">
                      Aucun utilisateur trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
