import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserById, updateUser } from "../../api/users";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet";

export default function UserEditForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState({
    nom: "",
    prenom: "",
    email: "",
    role: "",
    isActive: true,
    photo: null,
    photoUrl: null, // <-- champ pour l'image existante
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getUserById(id);
        const userData = res.data;

        setUser({
          nom: userData.nom || "",
          prenom: userData.prenom || "",
          email: userData.email || "",
          role: userData.role || "",
          isActive: userData.isActive ?? true,
          photo: null,
          photoUrl: userData.photo || null, // <-- conserver la photo existante
        });
      } catch (err) {
        toast.error("Erreur lors du chargement de l'utilisateur");
      }
    };

    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (name === "photo") {
      setUser((prev) => ({
        ...prev,
        photo: files[0],
      }));
    } else {
      setUser((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("nom", user.nom);
      formData.append("prenom", user.prenom);
      formData.append("email", user.email);
      formData.append("role", user.role);
      formData.append("isActive", user.isActive ? "true" : "false");

      if (user.photo) {
        formData.append("photo", user.photo); // nouvelle photo
      } else if (user.photoUrl) {
        formData.append("photoUrl", user.photoUrl); // conserver ancienne photo
      }

      await updateUser(id, formData);
      toast.success("Utilisateur mis à jour ✅");
      navigate("/dashboard");
    } catch (err) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "600px" }}>
      <Helmet>
        <title>Modifier l'utilisateur - TrackPro</title>
      </Helmet>
      <h3 className="mb-4">Modifier l'utilisateur</h3>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-3">
          <label className="form-label">Nom</label>
          <input
            type="text"
            className="form-control"
            name="nom"
            value={user.nom}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Prénom</label>
          <input
            type="text"
            className="form-control"
            name="prenom"
            value={user.prenom}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={user.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Rôle</label>
          <select
            className="form-select"
            name="role"
            value={user.role}
            onChange={handleChange}
            required
          >
            <option value="">-- Sélectionner un rôle --</option>
            <option value="ADMIN">Administrateur</option>
            <option value="CHEF_PROJET">Chef de projet</option>
            <option value="MEMBRE_EQUIPE">Membre de l’équipe</option>
            <option value="GESTIONNAIRE_RESSOURCES">
              Gestionnaire de ressources
            </option>
          </select>
        </div>

        <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={user.isActive}
            onChange={handleChange}
          />
          <label className="form-check-label" htmlFor="isActive">
            Actif
          </label>
        </div>

        {user.photoUrl && (
          <div className="mb-3 text-center">
            <label>Photo actuelle :</label>
            <br />
            <img
              src={`http://localhost:3000${user.photoUrl}`}
              alt={`Profil de ${user.prenom} ${user.nom}`}
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "1px solid #ccc",
              }}
            />
          </div>
        )}

        <div className="mb-3">
          <label>Changer la photo</label>
          <input
            type="file"
            name="photo"
            className="form-control"
            accept="image/*"
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Enregistrer
        </button>
      </form>
    </div>
  );
}
