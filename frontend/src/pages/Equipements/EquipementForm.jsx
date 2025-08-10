// src/pages/Materiaux/CreateMateriauForm.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet";
import { createMateriau } from "../../api/materiaux";
import { getProjects } from "../../api/projects";

export default function CreateMateriauForm() {
  const [form, setForm] = useState({
    nom: "",
    type: "",
    stock: 0,
    seuil: 0,
    coutUnitaire: 0,
    dateProchainApprovisionnement: "",
    fournisseur: "",
    commandeEnvoyee: false,
    projetId: "", // optionnel
  });
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  const typeOptions = [
    "Ciment",
    "Sable",
    "Gravier",
    "Acier",
    "Bois",
    "Peinture",
    "Béton prêt",
    "Tuyaux",
    "Électricité",
    "Autre",
  ];

  useEffect(() => {
    // Projet optionnel : on charge pour la liste, mais pas obligatoire
    getProjects()
      .then((res) => setProjects(res.data || []))
      .catch(() => setProjects([]));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      stock: parseInt(form.stock),
      seuil: parseInt(form.seuil),
      coutUnitaire: parseFloat(form.coutUnitaire),
      projetId: form.projetId || null, // null si non choisi
    };

    try {
      await createMateriau(payload);
      toast.success("✅ Matériau ajouté !");
      setTimeout(() => navigate("/materiaux"), 800);
    } catch (err) {
      console.error(err);
      toast.error("❌ Erreur lors de l’ajout.");
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: 600 }}>
      <Helmet><title>Ajouter un Matériau - TrackPro</title></Helmet>
      <h3>📦 Ajouter un matériau</h3>

      <form onSubmit={handleSubmit}>
        {["nom", "fournisseur"].map((field) => (
          <div className="mb-3" key={field}>
            <label className="form-label">
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            <input
              type="text"
              name={field}
              className="form-control"
              value={form[field]}
              onChange={handleChange}
              required={field === "nom"}
            />
          </div>
        ))}

        <div className="mb-3">
          <label className="form-label">Type</label>
          <select
            name="type"
            className="form-select"
            value={form.type}
            onChange={handleChange}
            required
          >
            <option value="">-- Choisir un type --</option>
            {typeOptions.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="row">
          <div className="col-6 mb-3">
            <label className="form-label">Stock</label>
            <input type="number" name="stock" className="form-control" value={form.stock} onChange={handleChange} min="0" />
          </div>
          <div className="col-6 mb-3">
            <label className="form-label">Seuil</label>
            <input type="number" name="seuil" className="form-control" value={form.seuil} onChange={handleChange} min="0" />
          </div>
        </div>

        <div className="row">
          <div className="col-6 mb-3">
            <label className="form-label">Coût unitaire ($)</label>
            <input type="number" name="coutUnitaire" step="0.01" className="form-control" value={form.coutUnitaire} onChange={handleChange} min="0" />
          </div>
          <div className="col-6 mb-3">
            <label className="form-label">Prochain approvisionnement</label>
            <input type="date" name="dateProchainApprovisionnement" className="form-control" value={form.dateProchainApprovisionnement} onChange={handleChange} />
          </div>
        </div>

        <div className="mb-3 form-check">
          <input className="form-check-input" type="checkbox" id="commandeEnvoyee" name="commandeEnvoyee" checked={form.commandeEnvoyee} onChange={handleChange} />
          <label className="form-check-label" htmlFor="commandeEnvoyee">Commande déjà envoyée</label>
        </div>

        <div className="mb-3">
          <label className="form-label">Projet (optionnel)</label>
          <select name="projetId" className="form-select" value={form.projetId} onChange={handleChange}>
            <option value="">-- Aucun projet --</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.nom}</option>
            ))}
          </select>
        </div>

        <button className="btn btn-primary w-100" type="submit">✅ Ajouter le matériau</button>
      </form>
    </div>
  );
}
