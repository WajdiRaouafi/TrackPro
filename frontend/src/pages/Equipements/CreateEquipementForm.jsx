import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet";
import { createEquipement } from "../../api/equipements";

export default function CreateEquipementForm() {
  const [form, setForm] = useState({
    nom: "",
    type: "",
    numeroSerie: "",
    statut: "Disponible", // 🟢 Valeur conforme au backend
    stock: 0,
    seuil: 0,
    dateProchainApprovisionnement: "",
    coutParJour: 0,
    joursUtilisation: 0,
  });

  const navigate = useNavigate();

  const typeOptions = [
    "Voiture",
    "Camion",
    "Matériel de soudure",
    "Grue",
    "Compresseur",
    "Générateur",
    "Échafaudage",
    "Autre",
  ];

  const statutOptions = [
    { label: "Disponible", value: "Disponible" },
    { label: "En panne", value: "En panne" },
    { label: "En utilisation", value: "En utilisation" },
    { label: "Maintenance", value: "Maintenance" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      stock: parseInt(form.stock),
      seuil: parseInt(form.seuil),
      coutParJour: parseFloat(form.coutParJour),
      joursUtilisation: parseInt(form.joursUtilisation),
    };

    try {
      await createEquipement(payload);
      toast.success("✅ Équipement ajouté avec succès !");
      setTimeout(() => {
        navigate("/equipements");
      }, 1500);
    } catch (err) {
      toast.error(
        "❌ Erreur : " +
          (err.response?.data?.message || "Erreur lors de l’ajout.")
      );
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: "600px" }}>
      <Helmet>
        <title>Ajouter un Équipement - TrackPro</title>
      </Helmet>
      <h3>🛠️ Ajouter un équipement</h3>
      <form onSubmit={handleSubmit}>
        {["nom", "numeroSerie"].map((field) => (
          <div className="mb-3" key={field}>
            <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
            <input
              type="text"
              name={field}
              className="form-control"
              value={form[field]}
              onChange={handleChange}
              required
            />
          </div>
        ))}

        <div className="mb-3">
          <label>Type</label>
          <select
            name="type"
            className="form-select"
            value={form.type}
            onChange={handleChange}
            required
          >
            <option value="">-- Choisir un type --</option>
            {typeOptions.map((type, idx) => (
              <option key={idx} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label>Statut</label>
          <select
            name="statut"
            className="form-select"
            value={form.statut}
            onChange={handleChange}
          >
            {statutOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {["stock", "seuil", "coutParJour", "joursUtilisation"].map((field) => (
          <div className="mb-3" key={field}>
            <label>{field}</label>
            <input
              type="number"
              name={field}
              className="form-control"
              value={form[field]}
              onChange={handleChange}
              min="0"
            />
          </div>
        ))}

        <div className="mb-3">
          <label>Date de prochain approvisionnement</label>
          <input
            type="date"
            name="dateProchainApprovisionnement"
            className="form-control"
            value={form.dateProchainApprovisionnement}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">
          ✅ Ajouter l’équipement
        </button>
      </form>
    </div>
  );
}
