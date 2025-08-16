import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import { getProjectById, updateProject } from "../../../api/projects";
import { getUsers } from "../../../api/users";
import { toast } from "react-toastify";

/* ---------- Helpers ---------- */
const etatLabel = {
  EN_ATTENTE: "En attente",
  EN_COURS: "En cours",
  TERMINE: "Terminé",
};

const toDateInput = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  const off = dt.getTimezoneOffset();
  const local = new Date(dt.getTime() - off * 60000);
  return local.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
};
const toOnlyDate = (d) => {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10); // YYYY-MM-DD
};
const fromDateTimeLocal = (s) => {
  // s = "YYYY-MM-DDTHH:mm" (local). On renvoie ISO Z
  if (!s) return null;
  const dt = new Date(s);
  return new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString();
};

export default function ProjectEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [chefs, setChefs] = useState([]);

  const [form, setForm] = useState({
    nom: "",
    description: "",
    adresse: "",
    dateDebut: "",
    dateFin: "",
    budget: "",
    etat: "EN_ATTENTE",
    chefProjetId: "",
  });

  const canSave = useMemo(() => {
    if (!form.nom?.trim()) return false;
    if (!form.chefProjetId) return false;
    if (!form.dateDebut || !form.dateFin) return false;
    if (Number(form.budget) < 0) return false;
    return true;
  }, [form]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [{ data: p }, { data: users }] = await Promise.all([
          getProjectById(id),
          getUsers(),
        ]);

        // garder surtout les CHEF_PROJET, fallback tous users si aucun trouvé
        const onlyChefs = users.filter((u) => u.role === "CHEF_PROJET");
        setChefs(onlyChefs.length ? onlyChefs : users);

        setForm({
          nom: p.nom ?? "",
          description: p.description ?? "",
          adresse: p.adresse ?? "",
          dateDebut: toDateInput(p.dateDebut), // datetime-local
          dateFin: toOnlyDate(p.dateFin), // date
          budget: p.budget != null ? String(p.budget) : "",
          etat: p.etat ?? "EN_ATTENTE",
          chefProjetId: p?.chefProjet?.id ? String(p.chefProjet.id) : "",
        });
      } catch {
        toast.error("Impossible de charger le projet.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // validations simples
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
        dateFin: form.dateFin, // 'YYYY-MM-DD' – votre backend l'accepte en date
        budget: Number(form.budget),
        etat: form.etat,
        // La plupart des APIs Nest attendent `chefProjetId`
        chefProjetId: Number(form.chefProjetId),
      };

      await updateProject(id, payload);
      toast.success("Projet mis à jour ✅");
      setTimeout(() => navigate(`/admin/projects/${id}`), 600);
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Erreur lors de la mise à jour du projet.";
      toast.error(`❌ ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <PageMeta title="Éditer projet — TrackPro" />
        <div className="space-y-6">
          <div className="h-8 w-64 animate-pulse rounded-lg bg-gray-100 dark:bg-white/5" />
          <div className="h-64 w-full animate-pulse rounded-2xl bg-gray-100 dark:bg-white/5" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta title={`Éditer ${form.nom || "projet"} — TrackPro`} />

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to={`/admin/projects/${id}`}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 dark:border-gray-800 dark:text-white/80 dark:hover:bg-white/5"
          >
            ← Retour
          </Link>
          <h2 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
            Éditer le projet
          </h2>
        </div>

        <button
          form="project-edit-form"
          type="submit"
          disabled={!canSave || saving}
          className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:opacity-60"
        >
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>

      {/* Form */}
      <form
        id="project-edit-form"
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
              to={`/admin/projects/${id}`}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-center text-sm text-gray-700 transition hover:bg-gray-50 dark:border-gray-800 dark:text-white/90 dark:hover:bg-white/10"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={!canSave || saving}
              className="w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:opacity-60"
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
