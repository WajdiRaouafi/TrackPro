import React, { useEffect, useState } from "react";
import { getProjects } from "../api/projects";
import { getUsers } from "../api/users";
import { useNavigate } from "react-router-dom";
import { Card, Row, Col, Container } from "react-bootstrap";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [userStats, setUserStats] = useState({ total: 0, actifs: 0 });
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const role = localStorage.getItem("role");
  const isAdmin = role === "ADMIN";
  const isChefProjet = role === "CHEF_PROJET";

  const loadProjects = async () => {
    try {
      const res = await getProjects();
      if (isChefProjet) {
        const filtered = res.data.filter(
          (project) => project.chefProjet?.id === user.id
        );
        setProjects(filtered);
      } else {
        setProjects(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadUserStats = async () => {
    try {
      const res = await getUsers();
      const total = res.data.length;
      const actifs = res.data.filter((u) => u.isActive).length;
      setUserStats({ total, actifs });
    } catch (err) {
      console.error(err);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const init = async () => {
      await loadProjects();
      if (isAdmin) await loadUserStats();
    };
    init();
    // eslint-disable-next-line
  }, [isAdmin]);

  return (
    <Container className="mt-4">
      <h3 className="mb-4">Tableau de bord</h3>

      {isAdmin && (
        <Row className="mb-4">
          <Col md={4}>
            <Card bg="primary" text="white">
              <Card.Body>
                <Card.Title>Utilisateurs totaux</Card.Title>
                <Card.Text style={{ fontSize: "1.5rem" }}>
                  {userStats.total}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card bg="success" text="white">
              <Card.Body>
                <Card.Title>Utilisateurs actifs</Card.Title>
                <Card.Text style={{ fontSize: "1.5rem" }}>
                  {userStats.actifs}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card bg="info" text="white">
              <Card.Body>
                <Card.Title>Projets totaux</Card.Title>
                <Card.Text style={{ fontSize: "1.5rem" }}>
                  {projects.length}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <h4 className="mb-3">Liste des Projets</h4>
      <Row>
        {projects.map((project) => (
          <Col md={4} key={project.id} className="mb-3">
            <Card
              className="shadow"
              onClick={() => navigate(`/projects/${project.id}`)}
              style={{ cursor: "pointer" }}
            >
              <Card.Body>
                <Card.Title>{project.nom}</Card.Title>
                <Card.Text>{project.description}</Card.Text>
                <Card.Text className="text-muted">
                  Chef : {project.chefProjet?.email}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
