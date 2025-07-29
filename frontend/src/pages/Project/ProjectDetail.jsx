import React, { useEffect, useState } from 'react';
import { getProject } from '../../api/projects';
import { useParams } from 'react-router-dom';
// import Navbar from '../../components/Navbar';

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);

  useEffect(() => {
    getProject(id).then(res => setProject(res.data));
  }, [id]);

  if (!project) return <p className="text-center mt-5">Loading...</p>;

  return (
    <>
      {/* <Navbar /> */}
      <div className="container mt-4">
        <h3>{project.nom}</h3>
        <p><strong>Description:</strong> {project.description}</p>
        <p><strong>Address:</strong> {project.adresse}</p>
        <p><strong>Chef de projet:</strong> {project.chefProjet?.email}</p>
        <p><strong>Budget:</strong> ${project.budget}</p>
        <hr />
        <h5>📋 Tasks</h5>
        {project.tasks?.length > 0 ? (
          <ul>
            {project.tasks.map(task => (
              <li key={task.id}>
                {task.description} ({task.statut}) – {task.membre?.email}
              </li>
            ))}
          </ul>
        ) : (
          <p>No tasks assigned.</p>
        )}
      </div>
    </>
  );
}
