import React, { useEffect, useState } from 'react';
import { getProjects } from '../api/projects';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getProjects()
      .then(res => setProjects(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <h3 className="mb-4">Liste des Projets</h3>
        <div className="row">
          {projects.map((project) => (
            <div key={project.id} className="col-md-4 mb-3">
              <div
                className="card shadow"
                onClick={() => navigate(`/projects/${project.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-body">
                  <h5 className="card-title">{project.nom}</h5>
                  <p className="card-text">{project.description}</p>
                  <p className="text-muted">Chef : {project.chefProjet?.email}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
