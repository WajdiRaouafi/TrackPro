import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectById } from '../api/projects';

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getProjectById(id)
      .then(res => setProject(res.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!project) return <p className="text-center mt-5">Chargement...</p>;

  return (
    <div className="container mt-4">
      <button className="btn btn-outline-secondary mb-3" onClick={() => navigate('/dashboard')}>
        ⬅ Retour au Dashboard
      </button>

      <h3>{project.nom}</h3>
      <p>{project.description}</p>
      <p><strong>Adresse :</strong> {project.adresse}</p>
      <p><strong>Chef de projet :</strong> {project.chefProjet?.email}</p>

      <h5 className="mt-4">Tâches :</h5>
      <ul className="list-group">
        {project.tasks?.map((task) => (
          <li key={task.id} className="list-group-item">
            <strong>{task.description}</strong><br />
            📅 {new Date(task.dateDebut).toLocaleDateString()} → {new Date(task.dateFin).toLocaleDateString()}<br />
            👤 Membre : {task.membre?.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
