
import React, { useEffect, useState } from 'react';
import { getProjects, deleteProject } from '../../api/projects';
import { useNavigate } from 'react-router-dom';
// import Navbar from '../../components/Navbar';

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getProjects().then(res => setProjects(res.data));
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      await deleteProject(id);
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  return (
    <>
      {/* <Navbar /> */}
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>🗂️ Projects</h3>
          <button className="btn btn-primary" onClick={() => navigate('/projects/new')}>
            ➕ Add Project
          </button>
        </div>
        {projects.length === 0 ? (
          <p>No projects found.</p>
        ) : (
          <ul className="list-group">
            {projects.map(project => (
              <li key={project.id} className="list-group-item d-flex justify-content-between">
                <div>
                  <strong>{project.nom}</strong> <br />
                  {project.chefProjet?.email}
                </div>
                <div>
                  <button className="btn btn-info btn-sm me-2" onClick={() => navigate(`/projects/${project.id}`)}>Details</button>
                  <button className="btn btn-warning btn-sm me-2" onClick={() => navigate(`/projects/edit/${project.id}`)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(project.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
