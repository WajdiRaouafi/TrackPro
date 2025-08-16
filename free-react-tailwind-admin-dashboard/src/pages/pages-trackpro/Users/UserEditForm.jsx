// src/pages/pages-trackpro/Users/UserEdit.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import { getUserById, updateUser } from "../../../api/users";
import { toast } from "react-toastify";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const roleLabel = (r) =>
  r === "ADMIN"
    ? "Administrateur"
    : r === "CHEF_PROJET"
    ? "Chef de projet"
    : r === "GESTIONNAIRE_RESSOURCES"
    ? "Gestionnaire de ressources"
    : "Membre d’équipe";

// ✅ Normalise n'importe quelle valeur de photoUrl tournée par l'API
function resolvePhotoUrl(raw) {
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw; // déjà absolue
  const base = BACKEND_URL.replace(/\/$/, ""); // retire slash fin
  const path = raw.startsWith("/") ? raw : `/${raw}`; // ajoute slash début
  return `${base}${path}`;
}

export default function UserEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    role: "MEMBRE_EQUIPE",
    isActive: true,
    salaireJournalier: "",
    photo: null, // File
    photoUrl: "", // string (serveur)
  });

  // ✅ Preview image fiable : File > URL normalisée > fallback
  const previewUrl = useMemo(() => {
    if (form.photo instanceof File) return URL.createObjectURL(form.photo);
    if (form.photoUrl) return resolvePhotoUrl(form.photoUrl);
    return "/images/user/user-01.png";
  }, [form.photo, form.photoUrl]);

  // libère l'URL blob quand elle change ou au démontage
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getUserById(id);
        setForm((f) => ({
          ...f,
          nom: data.nom ?? "",
          prenom: data.prenom ?? "",
          email: data.email ?? "",
          telephone: data.telephone ?? "",
          role: data.role ?? "MEMBRE_EQUIPE",
          isActive: !!data.isActive,
          salaireJournalier:
            data.salaireJournalier != null ? String(data.salaireJournalier) : "",
          photoUrl: data.photoUrl ?? "",
          photo: null,
        }));
      } catch (e) {
        toast.error("Impossible de charger l’utilisateur.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleChange = (e) => {
    const target = e.target;
    const { name, type } = target;

    if (type === "file") {
      setForm((prev) => ({ ...prev, photo: target.files?.[0] || null }));
      return;
    }
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: target.checked }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations simples
    if (!form.nom || !form.prenom) {
      toast.error("Nom et prénom sont requis.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      toast.error("Email invalide.");
      return;
    }
    if (
      form.role === "MEMBRE_EQUIPE" &&
      (!form.salaireJournalier || Number(form.salaireJournalier) <= 0)
    ) {
      toast.error("Salaire journalier requis pour Membre d’équipe.");
      return;
    }

    try {
      setSaving(true);
      const fd = new FormData();
      fd.append("nom", form.nom);
      fd.append("prenom", form.prenom);
      fd.append("email", form.email);
      fd.append("telephone", form.telephone);
      fd.append("role", form.role);
      fd.append("isActive", String(form.isActive));

      // ❗ ne pas envoyer une chaîne vide pour un DECIMAL (Postgres)
      if (form.role === "MEMBRE_EQUIPE" && form.salaireJournalier !== "") {
        fd.append("salaireJournalier", form.salaireJournalier);
      }

      if (form.photo) {
        fd.append("photo", form.photo);
      }

      await updateUser(id, fd);
      toast.success("Utilisateur mis à jour ✅");
      setTimeout(() => navigate("/admin/users"), 800);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Erreur lors de la mise à jour de l’utilisateur.";
      toast.error(`❌ ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded-lg dark:bg-gray-800" />
        <div className="h-40 w-full bg-gray-200 rounded-2xl dark:bg-gray-800" />
      </div>
    );
  }

  return (
    <>
      <PageMeta title={`Modifier utilisateur | TrackPro`} />

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-title-md font-semibold text-gray-800 dark:text-white/90">
            Modifier l’utilisateur
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {form.nom} {form.prenom} – {roleLabel(form.role)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/users"
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-100 dark:border-gray-800 dark:text-white/90 dark:hover:bg-white/5"
          >
            Annuler
          </Link>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:opacity-60"
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Col gauche : carte profil */}
        <div className="xl:col-span-1">
          <div className="rounded-2xl border border-gray-200 p-6 shadow-theme-xs dark:border-gray-800">
            <div className="flex flex-col items-center">
              <img
                src={previewUrl}
                alt="Avatar"
                className="mb-4 size-24 rounded-full object-cover ring-4 ring-gray-100 dark:ring-gray-800"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/images/user/user-01.png";
                }}
              />
              <label
                htmlFor="photo"
                className="cursor-pointer rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-700 transition hover:bg-gray-100 dark:border-gray-800 dark:text-white/90 dark:hover:bg-white/10"
              >
                Changer la photo
                <input
                  id="photo"
                  name="photo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleChange}
                />
              </label>

              <div className="mt-6 grid w-full grid-cols-2 gap-3 text-center">
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-white/5">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Statut
                  </p>
                  <p className="mt-1 font-medium text-gray-800 dark:text-white/90">
                    {form.isActive ? "Actif" : "Inactif"}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-white/5">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Rôle
                  </p>
                  <p className="mt-1 font-medium text-gray-800 dark:text-white/90">
                    {roleLabel(form.role)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Col droite : formulaire */}
        <div className="xl:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-gray-200 p-6 shadow-theme-xs dark:border-gray-800"
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm text-gray-600 dark:text-gray-300">
                  Nom<span className="text-error-500">*</span>
                </label>
                <input
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:text-white/90"
                  placeholder="Nom"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-gray-600 dark:text-gray-300">
                  Prénom<span className="text-error-500">*</span>
                </label>
                <input
                  name="prenom"
                  value={form.prenom}
                  onChange={handleChange}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:text-white/90"
                  placeholder="Prénom"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-gray-600 dark:text-gray-300">
                  Email<span className="text-error-500">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:text-white/90"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-gray-600 dark:text-gray-300">
                  Téléphone
                </label>
                <input
                  name="telephone"
                  type="tel"
                  value={form.telephone}
                  onChange={handleChange}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:text-white/90"
                  placeholder="(+216) 99 999 999"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-gray-600 dark:text-gray-300">
                  Rôle
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      role: val,
                      // reset salaire si ce n'est plus un membre d’équipe
                      salaireJournalier:
                        val === "MEMBRE_EQUIPE" ? prev.salaireJournalier : "",
                    }));
                  }}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:text-white/90"
                >
                  <option value="CHEF_PROJET">Chef de projet</option>
                  <option value="MEMBRE_EQUIPE">Membre d’équipe</option>
                  <option value="GESTIONNAIRE_RESSOURCES">
                    Gestionnaire de ressources
                  </option>
                  <option value="ADMIN">Administrateur</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="peer h-5 w-10 cursor-pointer appearance-none rounded-full bg-gray-300 transition checked:bg-brand-500"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  Compte actif
                </label>
              </div>

              {form.role === "MEMBRE_EQUIPE" && (
                <div>
                  <label className="mb-1.5 block text-sm text-gray-600 dark:text-gray-300">
                    Salaire journalier (TND)
                  </label>
                  <input
                    name="salaireJournalier"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.salaireJournalier}
                    onChange={handleChange}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:text-white/90"
                    placeholder="0.00"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Link
                to="/admin/users"
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-100 dark:border-gray-800 dark:text-white/90 dark:hover:bg-white/5"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:opacity-60"
              >
                {saving ? "Enregistrement..." : "Enregistrer les modifications"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
