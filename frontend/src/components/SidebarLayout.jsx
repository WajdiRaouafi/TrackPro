import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Sidenav, Nav, Avatar, Divider } from "rsuite";
import DashboardIcon from "@rsuite/icons/legacy/Dashboard";
import GroupIcon from "@rsuite/icons/legacy/Group";
import MagicIcon from "@rsuite/icons/legacy/Magic";
import GearCircleIcon from "@rsuite/icons/legacy/GearCircle";
import SignOutIcon from "@rsuite/icons/legacy/SignOut";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3000";

export default function SidebarLayout() {
  const [expanded, setExpanded] = useState(true);
  const [activeKey, setActiveKey] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleSelect = (eventKey) => {
    setActiveKey(eventKey);
    navigate(eventKey);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem('chatbot_messages'); // ✅ supprime l’historique du chatbot
    navigate("/login");
  };

  const formatRole = (role) => {
    switch (role) {
      case "ADMIN":
        return "Administrateur";
      case "CHEF_PROJET":
        return "Chef de projet";
      case "MEMBRE_EQUIPE":
        return "Membre de l’équipe";
      case "GESTIONNAIRE_RESSOURCES":
        return "Gestionnaire de ressources";
      default:
        return role;
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <div
        style={{
          width: expanded ? 240 : 56,
          minHeight: "100vh",
          background: "#f8f9fa",
        }}
      >
        <Sidenav
          expanded={expanded}
          appearance="subtle"
          defaultOpenKeys={["projects", "settings"]}
        >
          <Sidenav.Body>
            {/* ✅ Section utilisateur */}
            <div style={{ padding: 16, textAlign: "center" }}>
              {user && (
                <>
                  <Avatar
                    src={
                      user.photoUrl
                        ? `${BACKEND_URL}${user.photoUrl}`
                        : "https://mdbootstrap.com/img/new/avatars/2.jpg"
                    }
                    alt={`${user.nom || ""} ${user.prenom || ""}`}
                  />
                  {expanded && (
                    <>
                      <p
                        style={{
                          marginTop: 10,
                          marginBottom: 0,
                          fontWeight: "bold",
                        }}
                      >
                        {user.prenom} {user.nom}
                      </p>
                      <small style={{ color: "#888" }}>
                        {formatRole(user.role)}
                      </small>
                    </>
                  )}
                </>
              )}
            </div>

            <Divider />

            <Nav activeKey={activeKey} onSelect={handleSelect}>
              <Nav.Item eventKey="/dashboard" icon={<DashboardIcon />}>
                Dashboard
              </Nav.Item>

              <Nav.Menu
                eventKey="Utilisateurs"
                title="Utilisateurs"
                icon={<GroupIcon />}
              >
                <Nav.Item eventKey="/admin/users">
                  Tous les utilisateurs
                </Nav.Item>
                <Nav.Item eventKey="/users/new">Nouveau utilisateur</Nav.Item>
              </Nav.Menu>

              <Nav.Menu
                eventKey="projects"
                title="Projets"
                icon={<MagicIcon />}
              >
                <Nav.Item eventKey="/projects">Tous les projets</Nav.Item>
                <Nav.Item eventKey="/projects/new">Nouveau projet</Nav.Item>
              </Nav.Menu>

              <Nav.Menu
                eventKey="settings"
                title="Paramètres"
                icon={<GearCircleIcon />}
              >
                <Nav.Item eventKey="/profile">Mon profil</Nav.Item>
              </Nav.Menu>

              <Divider />
              <Nav.Item icon={<SignOutIcon />} onClick={handleLogout}>
                Se déconnecter
              </Nav.Item>
            </Nav>
          </Sidenav.Body>
          <Sidenav.Toggle onToggle={setExpanded} />
        </Sidenav>
      </div>

      {/* ✅ Contenu principal */}
      <div style={{ flex: 1, padding: "2rem" }}>
        <Outlet />
      </div>
    </div>
  );
}
