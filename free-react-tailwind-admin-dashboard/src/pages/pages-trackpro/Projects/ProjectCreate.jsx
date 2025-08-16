import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import { createProject } from "../../../api/projects";
import { getUsers } from "../../../api/users";
import { toast } from "react-toastify";

/* ---------- Helpers ---------- */
const etatLabel = {
  EN_ATTENTE: "En attente",
  EN_COURS: "En cours",
  TERMINE: "Terminé",
};

const nowLocalDatetime = () => {
  const d = new Date();
  // Ajuster pour que <input type="datetime-local"> affiche l’heure locale
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
};

const todayLocalDate = () => {
  const d = new Date();
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 10); // YYYY-MM-DD
};

const fromDateTimeLocal = (s) => {
  if (!s) return null;
  const dt = new Date(s);
  // renvoie ISO (UTC) propre pour l’API
  return new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString();
};

export default function ProjectCreate() {
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [chefs, setChefs] = useState([]);

  const [form, setForm] = useState({
    nom: "",
    description: "",
    adresse: "",
    dateDebut: nowLocalDatetime(),
    dateFin: todayLocalDate(),
    budget: "",
    etat: "EN_ATTENTE",
    chefProjetId: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getUsers();
        const onlyChefs = data.filter((u) => u.role === "CHEF_PROJET");
        setChefs(onlyChefs.length ? onlyChefs : data);
      } catch {
        toast.error("Erreur lors du chargement des chefs de projet.");
      }
    })();
  }, []);

  const canSave = useMemo(() => {
    if (!form.nom?.trim()) return false;
    if (!form.chefProjetId) return false;
    if (!form.dateDebut || !form.dateFin) return false;
    if (Number(form.budget || 0) < 0) return false;
    return true;
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations simples
    if (!canSave) {
      toast.error("Veuillez remplir les champs requis.");
      return;
    }
    if (new Date(form.dateDebut) > new Date(`${form.dateFin}T23:59`)) {
      toast.error("La date de début doit être ≤ date de fin.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        nom: form.nom.trim(),
        description: form.description?.trim() || "",
        adresse: form.adresse?.trim() || "",
        dateDebut: fromDateTimeLocal(form.dateDebut),
        dateFin: form.dateFin, // format 'YYYY-MM-DD'
        budget: form.budget === "" ? 0 : Number(form.budget),
        etat: form.etat,
        chefProjetId: Number(form.chefProjetId),
      };

      const res = await createProject(payload);
      toast.success("Projet créé ✅");

      // si l’API renvoie l’id du nouveau projet :
      const newId = res?.data?.id;
      if (newId) {
        setTimeout(() => navigate(`/admin/projects/${newId}`), 600);
      } else {
        setTimeout(() => navigate(`/admin/projects`), 600);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Erreur lors de la création du projet.";
      toast.error(`❌ ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageMeta title="Nouveau projet — TrackPro" />
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
            Nouveau projet
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Créez un nouveau projet et assignez un chef de projet.
          </p>
        </div>

        <button
          form="project-new-form"
          type="submit"
          disabled={!canSave || saving}
          className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:opacity-60"
        >
          {saving ? "Création..." : "Enregistrer"}
        </button>
      </div>

      {/* Form */}
      <form
        id="project-new-form"
        onSubmit={handleSubmit}
        className="grid gap-6 rounded-2xl border border-gray-200 p-6 shadow-theme-xs dark:border-gray-800 lg:grid-cols-3"
      >
        {/* Colonne gauche */}
        <div className="lg:col-span-2 grid gap-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-gray-600 dark:text-gray-300">
                Nom <span className="text-error-500">*</span>
              </label>
              <input
                name="nom"
                value={form.nom}
                onChange={handleChange}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:text-white/90"
                placeholder="Nom du projet"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-gray-600 dark:text-gray-300">
                Chef de projet <span className="text-error-500">*</span>
              </label>
              <select
                name="chefProjetId"
                value={form.chefProjetId}
                onChange={handleChange}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:text-white/90"
                required
              >
                <option value="">— Choisir —</option>
                {chefs.map((u) => (
                  <option key={u.id} value={u.id}>
                    {[u.prenom, u.nom].filter(Boolean).join(" ")} — {u.email}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-gray-600 dark:text-gray-300">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm dark:border-gray-700 dark:text-white/90"
              placeholder="Décrivez le projet…"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-gray-600 dark:text-gray-300">
              Adresse
            </label>
            <input
              name="adresse"
              value={form.adresse}
              onChange={handleChange}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:text-white/90"
              placeholder="Adresse du site"
            />
          </div>
        </div>

        {/* Colonne droite */}
        <div className="lg:col-span-1 grid gap-5">
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="mb-1.5 block text-sm text-gray-600 dark:text-gray-300">
                Date de début <span className="text-error-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="dateDebut"
                value={form.dateDebut}
                onChange={handleChange}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:text-white/90"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-gray-600 dark:text-gray-300">
                Date de fin <span className="text-error-500">*</span>
              </label>
              <input
                type="date"
                name="dateFin"
                value={form.dateFin}
                onChange={handleChange}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:text-white/90"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-gray-600 dark:text-gray-300">
                Budget (TND)
              </label>
              <input
                type="number"
                name="budget"
                min="0"
                step="0.01"
                value={form.budget}
                onChange={handleChange}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:text-white/90"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-gray-600 dark:text-gray-300">
                État
              </label>
              <select
                name="etat"
                value={form.etat}
                onChange={handleChange}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:text-white/90"
              >
                <option value="EN_ATTENTE">{etatLabel.EN_ATTENTE}</option>
                <option value="EN_COURS">{etatLabel.EN_COURS}</option>
                <option value="TERMINE">{etatLabel.TERMINE}</option>
              </select>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <Link
              to="/admin/projects"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-center text-sm text-gray-700 transition hover:bg-gray-50 dark:border-gray-800 dark:text-white/90 dark:hover:bg-white/10"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={!canSave || saving}
              className="w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:opacity-60"
            >
              {saving ? "Création..." : "Créer le projet"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
