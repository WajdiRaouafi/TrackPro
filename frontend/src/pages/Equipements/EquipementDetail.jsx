import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEquipementById } from "../../api/equipements";
import { toast } from "react-toastify";

export default function EquipementDetail() {
  const [equipement, setEquipement] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEquipement = async () => {
      try {
        const res = await getEquipementById(id);
        setEquipement(res.data);
      } catch (err) {
        console.error(err);
        toast.error("❌ Échec du chargement des détails.");
      }
    };

    fetchEquipement();
  }, [id]);

  if (!equipement) return <div className="container mt-4">Chargement...</div>;

  // Fonction pour retourner une classe de couleur selon le statut
  const getStatutBadgeClass = (statut) => {
    switch (statut) {
      case "Disponible":
        return "bg-success";
      case "En panne":
        return "bg-danger";
      case "En utilisation":
        return "bg-primary";
      case "Maintenance":
        return "bg-warning text-dark";
      default:
        return "bg-secondary";
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: "700px" }}>
      <h3 className="mb-4">🔍 Détail de l'équipement</h3>

      <div className="card p-4 shadow">
        <h5 className="mb-3">{equipement.nom}</h5>

        <ul className="list-group list-group-flush">
          <li className="list-group-item">
            <strong>Type:</strong> {equipement.type}
          </li>
          <li className="list-group-item">
            <strong>Numéro de série:</strong> {equipement.numeroSerie}
          </li>
          <li className="list-group-item">
            <strong>Statut:</strong>{" "}
            <span className={`badge ${getStatutBadgeClass(equipement.statut)}`}>
              {equipement.statut}
            </span>
          </li>
          <li className="list-group-item">
            <strong>Stock:</strong> {equipement.stock}
          </li>
          <li className="list-group-item">
            <strong>Seuil:</strong> {equipement.seuil}
          </li>
          <li className="list-group-item">
            <strong>Coût par jour:</strong> {equipement.coutParJour} $
          </li>
          <li className="list-group-item">
            <strong>Jours d'utilisation:</strong> {equipement.joursUtilisation}
          </li>
          {equipement.dateProchainApprovisionnement && (
            <li className="list-group-item">
              <strong>Prochain approvisionnement:</strong>{" "}
              {equipement.dateProchainApprovisionnement.substring(0, 10)}
            </li>
          )}

          {equipement.projet && (
            <li className="list-group-item">
              <strong>Projet associé:</strong>{" "}
              <a
                href={`/projects/${equipement.projet.id}`}
                className="text-decoration-none"
              >
                {equipement.projet.nom}
              </a>
            </li>
          )}
        </ul>

        <button
          className="btn btn-secondary mt-4"
          onClick={() => navigate("/equipements")}
        >
          🔙 Retour à la liste
        </button>
      </div>
    </div>
  );
}
