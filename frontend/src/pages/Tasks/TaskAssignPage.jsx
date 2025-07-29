import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
// import Navbar from '../../components/Navbar';

export default function TaskAssignPage() {
  const { id } = useParams(); // id du projet
  const [membres, setMembres] = useState([]);
  const [form, setForm] = useState({
    description: '',
    dateDebut: '',
    dateFin: '',
    statut: '',
    priorite: '',
    specialite: '',
    membreId: ''
  });

  useEffect(() => {
    api.get('/users') // 🔁 change si besoin vers un endpoint spécifique
      .then(res => setMembres(res.data.filter(u => u.role === 'MEMBRE_EQUIPE')))
      .catch(console.error);
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const taskData = {
      ...form,
      projet: id,
      membre: form.membreId
    };
    await api.post('/tasks', taskData);
    alert("✅ Tâche assignée !");
    setForm({ ...form, description: '', statut: '', priorite: '', specialite: '' });
  };

  return (
    <>
      {/* <Navbar /> */}
      <div className="container mt-4" style={{ maxWidth: '600px' }}>
        <h3>➕ Assigner une tâche au projet #{id}</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Description</label>
            <input className="form-control" name="description" value={form.description} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label>Date de début</label>
            <input type="date" name="dateDebut" className="form-control" onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label>Date de fin</label>
            <input type="date" name="dateFin" className="form-control" onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label>Statut</label>
            <select name="statut" className="form-select" onChange={handleChange} required>
              <option>En attente</option>
              <option>En cours</option>
              <option>Terminée</option>
            </select>
          </div>
          <div className="mb-3">
            <label>Priorité</label>
            <select name="priorite" className="form-select" onChange={handleChange} required>
              <option>Basse</option>
              <option>Moyenne</option>
              <option>Haute</option>
            </select>
          </div>
          <div className="mb-3">
            <label>Spécialité</label>
            <input name="specialite" className="form-control" onChange={handleChange} />
          </div>
          <div className="mb-3">
            <label>👤 Membre assigné</label>
            <select name="membreId" className="form-select" onChange={handleChange} required>
              <option value="">-- Choisir un membre --</option>
              {membres.map(m => (
                <option key={m.id} value={m.id}>{m.nom} {m.prenom} ({m.email})</option>
              ))}
            </select>
          </div>
          <button className="btn btn-success w-100" type="submit">Assigner</button>
        </form>
      </div>
    </>
  );
}
