import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const email = localStorage.getItem('email');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <span className="navbar-brand">TrackPro</span>
      <div className="ms-auto d-flex align-items-center gap-3">
        {email && <span className="text-white">👤 {email}</span>}
        <a href="/profile" className="text-white me-3 text-decoration-none">Profil</a>
        <button className="btn btn-outline-light" onClick={handleLogout}>
          🔒 Déconnexion
        </button>
      </div>
    </nav>
  );
}
