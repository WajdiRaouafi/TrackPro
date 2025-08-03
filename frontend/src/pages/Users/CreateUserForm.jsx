import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUser } from "../../api/users";
import { toast } from "react-toastify";

export default function CreateUserForm() {
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    email: "",
    password: "",
    role: "MEMBRE_EQUIPE",
    photo: null,
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      setForm({ ...form, photo: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append("isActive", false);

      await createUser(formData);

      toast.success("✅ Utilisateur créé avec succès !");
      setTimeout(() => {
        navigate("/users");
      }, 1500);
    } catch (err) {
      toast.error(
        "❌ Erreur : " +
          (err.response?.data?.message || "Erreur lors de la création.")
      );
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: "600px" }}>
      <h3>👤 Créer un utilisateur</h3>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {["nom", "prenom", "telephone", "email"].map((field) => (
          <div className="mb-3" key={field}>
            <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
            <input
              type={field === "email" ? "email" : "text"}
              name={field}
              className="form-control"
              value={form[field]}
              onChange={handleChange}
              required
            />
          </div>
        ))}

        <div className="mb-3">
          <label>Mot de passe</label>
          <input
            type="password"
            name="password"
            className="form-control"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>Rôle</label>
          <select
            name="role"
            className="form-select"
            value={form.role}
            onChange={handleChange}
            required
          >
            <option value="ADMIN">ADMIN</option>
            <option value="CHEF_PROJET">CHEF DE PROJET</option>
            <option value="MEMBRE_EQUIPE">MEMBRE D'ÉQUIPE</option>
            <option value="GESTIONNAIRE_RESSOURCES">GESTIONNAIRE DE RESSOURCES</option>
          </select>
        </div>

        <div className="mb-3">
          <label>Photo de profil</label>
          <input
            type="file"
            name="photo"
            className="form-control"
            accept="image/*"
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">
          ✅ Créer l'utilisateur
        </button>
      </form>
    </div>
  );
}
