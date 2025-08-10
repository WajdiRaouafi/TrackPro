// ✅ ProjectForm.jsx complet avec association d'équipements et matériaux
import React, { useEffect, useState } from "react";
import { createProject, getProject, updateProject } from "../../api/projects";
import { useNavigate, useParams } from "react-router-dom";
import { getUsers } from "../../api/users";
import { getAllEquipements } from "../../api/equipements";
import { getAllMateriaux } from "../../api/materiau";
import ChatbotWidget from "../../components/chatbot/ChatbotWidget";

export default function ProjectForm() {
  const [form, setForm] = useState({
    nom: "",
    description: "",
    adresse: "",
    dateDebut: "",
    dateFin: "",
    budget: "",
    etat: "EN_ATTENTE",
    chefProjet: "",
  });

  const [chefs, setChefs] = useState([]);
  const [equipements, setEquipements] = useState([]);
  const [materiaux, setMateriaux] = useState([]);
  const [selectedEquipements, setSelectedEquipements] = useState([]);
  const [selectedMateriaux, setSelectedMateriaux] = useState([]);

  const navigate = useNavigate();
  const { id } = useParams();
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = currentUser?.id;
  const currentRole = localStorage.getItem("role");

  const etatsProjet = ["EN_ATTENTE", "EN_COURS", "TERMINE"];

  useEffect(() => {
    if (!currentUserId) {
      alert("❌ Vous devez être connecté.");
      navigate("/login");
    }
  }, [currentUserId, navigate]);

  useEffect(() => {
    if (currentRole === "ADMIN") {
      getUsers()
        .then((res) => {
          const chefs = res.data.filter((u) => u.role === "CHEF_PROJET");
          setChefs(chefs);
        })
        .catch(() => alert("Erreur chargement chefs de projet"));
    }
  }, [currentRole]);

  useEffect(() => {
    getAllEquipements()
      .then((res) => setEquipements(res.data))
      .catch(() => alert("Erreur de chargement des équipements"));

    getAllMateriaux()
      .then((res) => setMateriaux(res.data))
      .catch(() => alert("Erreur de chargement des matériaux"));
  }, []);

  useEffect(() => {
    if (id) {
      getProject(id)
        .then((res) => {
          if (res?.data) {
            setForm({
              ...res.data,
              chefProjet: res.data.chefProjet?.id || "",
              budget: parseFloat(res.data.budget),
            });
          }
        })
        .catch((err) => {
          console.error(err);
          alert("❌ Erreur lors du chargement du projet");
        });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...form,
        budget: parseFloat(form.budget),
        chefProjet: currentRole === "ADMIN" ? form.chefProjet : currentUserId,
        equipementIds: selectedEquipements,
        materiauIds: selectedMateriaux,
      };

      if (id) {
        await updateProject(id, data);
        navigate("/projects");
      } else {
        const res = await createProject(data);
        const projectId = res?.data?.id;
        if (projectId) {
          navigate(`/projects/${projectId}/tasks`);
        } else {
          alert("Projet créé sans ID retourné.");
        }
      }
    } catch (err) {
      console.error(err);
      alert("❌ Erreur lors de l’enregistrement du projet");
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: "600px" }}>
      <h3>{id ? "✏️ Modifier le projet" : "➕ Créer un projet"}</h3>
      <ChatbotWidget />
      <form onSubmit={handleSubmit}>
        {["nom", "description", "adresse"].map((field) => (
          <div className="mb-3" key={field}>
            <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
            <input
              type="text"
              name={field}
              value={form[field]}
              className="form-control"
              onChange={handleChange}
              required
            />
          </div>
        ))}

        <div className="mb-3">
          <label>Date de début</label>
          <input
            type="date"
            name="dateDebut"
            className="form-control"
            value={form.dateDebut?.substring(0, 10)}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>Date de fin</label>
          <input
            type="date"
            name="dateFin"
            className="form-control"
            value={form.dateFin?.substring(0, 10)}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>Budget (en $)</label>
          <input
            type="number"
            name="budget"
            className="form-control"
            step="0.01"
            value={form.budget}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>État du projet</label>
          <select
            name="etat"
            className="form-select"
            value={form.etat}
            onChange={handleChange}
            required
          >
            {etatsProjet.map((etat) => (
              <option key={etat} value={etat}>
                {etat.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>

        {currentRole === "ADMIN" && (
          <div className="mb-3">
            <label>Chef de Projet</label>
            <select
              name="chefProjet"
              className="form-select"
              value={form.chefProjet}
              onChange={handleChange}
              required
            >
              <option value="">-- Sélectionner un chef de projet --</option>
              {chefs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom && c.prenom ? `${c.nom} ${c.prenom}` : c.email}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mb-3">
          <label>
            <strong>Équipements à associer</strong>
          </label>
          <div
            className="form-control"
            style={{ maxHeight: 200, overflowY: "auto" }}
          >
            {equipements.map((e) => (
              <div className="form-check" key={e.id}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`equipement-${e.id}`}
                  value={e.id}
                  checked={selectedEquipements.includes(e.id.toString())}
                  onChange={(event) => {
                    const value = event.target.value;
                    setSelectedEquipements((prev) =>
                      prev.includes(value)
                        ? prev.filter((id) => id !== value)
                        : [...prev, value]
                    );
                  }}
                />
                <label
                  className="form-check-label"
                  htmlFor={`equipement-${e.id}`}
                >
                  {e.nom} - {e.type}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <label>Matériaux à associer</label>
          <select
            multiple
            className="form-select"
            value={selectedMateriaux}
            onChange={(e) => {
              const values = Array.from(
                e.target.selectedOptions,
                (option) => option.value
              );
              setSelectedMateriaux(values);
            }}
          >
            {materiaux.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nom} - Stock: {m.stock}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn btn-success w-100">
          {id
            ? "💾 Enregistrer les modifications"
            : "✅ Créer et ajouter des tâches"}
        </button>
      </form>
    </div>
  );
}
