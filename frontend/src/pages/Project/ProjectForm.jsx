// src/pages/Project/ProjectForm.jsx
import React, { useEffect, useState } from 'react';
import { createProject, getProject, updateProject } from '../../api/projects';
import { useNavigate, useParams } from 'react-router-dom';
import { getUsers } from '../../api/users';
import ChatbotWidget from '../../components/chatbot/ChatbotWidget';


export default function ProjectForm() {
  const [form, setForm] = useState({
    nom: '',
    description: '',
    adresse: '',
    dateDebut: '',
    dateFin: '',
    budget: '',
    chefProjet: ''
  });

  const [chefs, setChefs] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();

  const currentUser = JSON.parse(localStorage.getItem('user'));
  const currentUserId = currentUser?.id;
  const currentRole = localStorage.getItem('role');

  // Redirection si non connecté
  useEffect(() => {
    if (!currentUserId) {
      alert('❌ Vous devez être connecté.');
      navigate('/login');
    }
  }, [currentUserId, navigate]);

  // Charger les chefs de projet si ADMIN
  useEffect(() => {
    if (currentRole === 'ADMIN') {
      getUsers()
        .then(res => {
          const chefs = res.data.filter(u => u.role === 'CHEF_PROJET');
          setChefs(chefs);
        })
        .catch(() => alert("Erreur chargement chefs de projet"));
    }
  }, [currentRole]);

  // Charger le projet si en édition
  useEffect(() => {
    if (id) {
      getProject(id)
        .then(res => {
          if (res?.data) {
            setForm({
              ...res.data,
              chefProjet: res.data.chefProjet?.id || ''
            });
          }
        })
        .catch(err => {
          console.error(err);
          alert("❌ Erreur lors du chargement du projet");
        });
    }
  }, [id]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const data = {
        ...form,
        chefProjet:
          currentRole === 'ADMIN' ? form.chefProjet : currentUserId
      };

      if (id) {
        await updateProject(id, data);
        navigate('/projects');
      } else {
        const res = await createProject(data);
        const projectId = res?.data?.id;
        if (projectId) {
          navigate(`/projects/${projectId}/tasks`);
        } else {
          alert("Projet créé sans ID retourné.");
        }
      }
    } catch (err) {
      console.error(err);
      alert('❌ Erreur lors de l’enregistrement du projet');
    }
  };

  return (
    
    <div className="container mt-4" style={{ maxWidth: '600px' }}>
      <h3>{id ? '✏️ Modifier le projet' : '➕ Créer un projet'}</h3>
            <ChatbotWidget />

      <form onSubmit={handleSubmit}>
        {['nom', 'description', 'adresse'].map(field => (
          <div className="mb-3" key={field}>
            <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
            <input
              type="text"
              name={field}
              value={form[field]}
              className="form-control"
              onChange={handleChange}
              required
            />
          </div>
        ))}

        <div className="mb-3">
          <label>Date de début</label>
          <input
            type="date"
            name="dateDebut"
            className="form-control"
            value={form.dateDebut?.substring(0, 10)}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>Date de fin</label>
          <input
            type="date"
            name="dateFin"
            className="form-control"
            value={form.dateFin?.substring(0, 10)}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>Budget</label>
          <input
            type="number"
            name="budget"
            className="form-control"
            value={form.budget}
            onChange={handleChange}
            required
          />
        </div>

        {/* ✅ Sélection du chef de projet (pour admin seulement) */}
        {currentRole === 'ADMIN' && (
          <div className="mb-3">
            <label>Chef de Projet</label>
            <select
              name="chefProjet"
              className="form-select"
              value={form.chefProjet}
              onChange={handleChange}
              required
            >
              <option value="">-- Sélectionner un chef de projet --</option>
              {chefs.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nom && c.prenom ? `${c.nom} ${c.prenom}` : c.email}
                </option>
              ))}
            </select>
          </div>
        )}

        <button type="submit" className="btn btn-success w-100">
          {id ? '💾 Enregistrer les modifications' : '✅ Créer et ajouter des tâches'}
        </button>
      </form>
    </div>
  );
}
