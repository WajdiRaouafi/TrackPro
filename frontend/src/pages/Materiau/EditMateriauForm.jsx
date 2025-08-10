// src/pages/Materiaux/EditMateriauForm.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMateriauById, updateMateriau } from "../../api/materiaux";
import { getProjects } from "../../api/projects";
import { toast } from "react-toastify";

export default function EditMateriauForm() {
  const [form, setForm] = useState({
    nom: "",
    type: "",
    stock: 0,
    seuil: 0,
    coutUnitaire: 0,
    dateProchainApprovisionnement: "",
    fournisseur: "",
    commandeEnvoyee: false,
    projetId: "",
  });
  const [projects, setProjects] = useState([]);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    (async () => {
      try {
        const [materiauRes, projectRes] = await Promise.all([
          getMateriauById(id),
          getProjects().catch(() => ({ data: [] })),
        ]);
        const m = materiauRes.data;
        setForm({
          nom: m.nom || "",
          type: m.type || "",
          stock: m.stock ?? 0,
          seuil: m.seuil ?? 0,
          coutUnitaire: m.coutUnitaire ?? 0,
          dateProchainApprovisionnement: m.dateProchainApprovisionnement?.substring(0, 10) || "",
          fournisseur: m.fournisseur || "",
          commandeEnvoyee: !!m.commandeEnvoyee,
          projetId: m.projet?.id || "",
        });
        setProjects(projectRes.data || []);
      } catch (e) {
        console.error(e);
        toast.error("❌ Erreur lors du chargement du matériau.");
      }
    })();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateMateriau(id, {
        ...form,
        stock: parseInt(form.stock),
        seuil: parseInt(form.seuil),
        coutUnitaire: parseFloat(form.coutUnitaire),
        projetId: form.projetId || null,
      });
      toast.success("✅ Matériau modifié !");
      navigate("/materiau");
    } catch (e2) {
      console.error(e2);
      toast.error("❌ Échec de la modification.");
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: 600 }}>
      <h3>✏️ Modifier le matériau</h3>
      <form onSubmit={handleSubmit}>
        {["nom", "fournisseur", "type"].map((field) => (
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
              required={field === "nom" || field === "type"}
            />
          </div>
        ))}

        <div className="row">
          <div className="col-6 mb-3">
            <label className="form-label">Stock</label>
            <input type="number" name="stock" className="form-control" value={form.stock} onChange={handleChange} />
          </div>
          <div className="col-6 mb-3">
            <label className="form-label">Seuil</label>
            <input type="number" name="seuil" className="form-control" value={form.seuil} onChange={handleChange} />
          </div>
        </div>

        <div className="row">
          <div className="col-6 mb-3">
            <label className="form-label">Coût unitaire ($)</label>
            <input type="number" step="0.01" name="coutUnitaire" className="form-control" value={form.coutUnitaire} onChange={handleChange} />
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

        <button className="btn btn-success w-100" type="submit">💾 Enregistrer</button>
      </form>
    </div>
  );
}
