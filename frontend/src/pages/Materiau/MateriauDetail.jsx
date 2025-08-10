// src/pages/Materiaux/MateriauDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMateriauById } from "../../api/materiaux";
import { toast } from "react-toastify";

export default function MateriauDetail() {
  const [m, setM] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await getMateriauById(id);
        setM(res.data);
      } catch (e) {
        console.error(e);
        toast.error("❌ Échec du chargement des détails.");
      }
    })();
  }, [id]);

  if (!m) return <div className="container mt-4">Chargement...</div>;

  const etatBadge = () => {
    if (m.stock <= 0) return "badge bg-danger";
    if (m.stock < m.seuil) return "badge bg-warning text-dark";
    return "badge bg-success";
  };

  const valeurStock = (Number(m.coutUnitaire || 0) * Number(m.stock || 0)).toFixed(2);

  return (
    <div className="container mt-4" style={{ maxWidth: 720 }}>
      <h3 className="mb-4">🔍 Détail du matériau</h3>

      <div className="card p-4 shadow-sm">
        <h5 className="mb-3">{m.nom}</h5>

        <ul className="list-group list-group-flush">
          <li className="list-group-item"><strong>Type:</strong> {m.type}</li>
          <li className="list-group-item"><strong>Stock:</strong> {m.stock} <span className={etatBadge()} style={{ marginLeft: 8 }}>{m.stock <= 0 ? "Rupture" : m.stock < m.seuil ? "Sous seuil" : "OK"}</span></li>
          <li className="list-group-item"><strong>Seuil:</strong> {m.seuil}</li>
          <li className="list-group-item"><strong>Coût unitaire:</strong> {m.coutUnitaire} $</li>
          <li className="list-group-item"><strong>Valeur du stock:</strong> {valeurStock} $</li>
          {m.dateProchainApprovisionnement && (
            <li className="list-group-item"><strong>Prochain approvisionnement:</strong> {m.dateProchainApprovisionnement.substring(0, 10)}</li>
          )}
          <li className="list-group-item"><strong>Fournisseur:</strong> {m.fournisseur || "-"}</li>
          <li className="list-group-item">
            <strong>Commande envoyée:</strong>{" "}
            <span className={`badge ${m.commandeEnvoyee ? "bg-info" : "bg-secondary"}`}>
              {m.commandeEnvoyee ? "Oui" : "Non"}
            </span>
          </li>

          {m.projet && (
            <li className="list-group-item">
              <strong>Projet associé:</strong>{" "}
              <a href={`/projects/${m.projet.id}`} className="text-decoration-none">{m.projet.nom}</a>
            </li>
          )}
        </ul>

        <div className="d-flex gap-2 mt-4">
          <button className="btn btn-secondary" onClick={() => navigate("/materiau")}>🔙 Retour à la liste</button>
          <button className="btn btn-warning" onClick={() => navigate(`/materiau/edit/${m.id}`)}>✏️ Modifier</button>
        </div>
      </div>
    </div>
  );
}
