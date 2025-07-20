import React, { useEffect, useState } from 'react';
import { getCurrentUser } from '../api/auth';
import { updateOwnProfile } from '../api/users';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ nom: '', prenom: '', telephone: '' });

  useEffect(() => {
    getCurrentUser()
      .then(res => {
        setUser(res.data);
        setForm({
          nom: res.data.nom,
          prenom: res.data.prenom,
          telephone: res.data.telephone,
        });
      })
      .catch(err => console.error(err));
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    updateOwnProfile(form)
      .then(res => {
        toast.success('✅ Profil mis à jour');
        setUser(res.data);
        setEdit(false);
      })
      .catch(() => toast.error('❌ Échec de la mise à jour'));
  };

  if (!user) return <p className="text-center mt-5">Chargement du profil...</p>;

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <h3 className="mb-4">👤 Mon Profil</h3>

        {!edit ? (
          <>
            <table className="table table-bordered w-50 mx-auto">
              <tbody>
                <tr><th>Nom</th><td>{user.nom}</td></tr>
                <tr><th>Prénom</th><td>{user.prenom}</td></tr>
                <tr><th>Téléphone</th><td>{user.telephone}</td></tr>
                <tr><th>Email</th><td>{user.email}</td></tr>
                <tr><th>Rôle</th><td>{user.role}</td></tr>
              </tbody>
            </table>
            {user.role !== 'ADMIN' && (
              <div className="text-center">
                <button className="btn btn-outline-primary" onClick={() => setEdit(true)}>
                  ✏ Modifier
                </button>
              </div>
            )}
          </>
        ) : (
          <form onSubmit={handleSubmit} className="w-50 mx-auto">
            <div className="mb-3">
              <label>Nom</label>
              <input type="text" name="nom" className="form-control" value={form.nom} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label>Prénom</label>
              <input type="text" name="prenom" className="form-control" value={form.prenom} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label>Téléphone</label>
              <input type="text" name="telephone" className="form-control" value={form.telephone} onChange={handleChange} required />
            </div>
            <div className="d-flex justify-content-between">
              <button type="submit" className="btn btn-success">💾 Enregistrer</button>
              <button type="button" className="btn btn-secondary" onClick={() => setEdit(false)}>Annuler</button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
