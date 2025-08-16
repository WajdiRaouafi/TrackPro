import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import { getProjectById, updateProject, deleteProject } from "../../../api/projects";
import { toast } from "react-toastify";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const etatLabel = {
  EN_ATTENTE: "En attente",
  EN_COURS: "En cours",
  TERMINE: "Terminé",
};
const etatClass = {
  EN_ATTENTE: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  EN_COURS: "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
  TERMINE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
};

const formatDate = (d) => (d ? new Date(d).toLocaleDateString("fr-FR") : "—");
const formatMoney = (n) => {
  const v = Number(n);
  if (Number.isNaN(v)) return "—";
  try {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "TND" }).format(v);
  } catch {
    return `${v.toFixed(2)} TND`;
  }
};
const fullName = (u) => [u?.prenom, u?.nom].filter(Boolean).join(" ").trim() || "—";
const initials = (u) =>
  [u?.prenom?.[0], u?.nom?.[0]].filter(Boolean).join("").toUpperCase() || "P";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState(null);

  const counts = useMemo(() => {
    return {
      tasks: Array.isArray(project?.tasks) ? project.tasks.length : 0,
      equipements: Array.isArray(project?.equipements) ? project.equipements.length : 0,
      materiaux: Array.isArray(project?.materiaux) ? project.materiaux.length : 0,
    };
  }, [project]);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await getProjectById(id);
      setProject(data);
    } catch {
      toast.error("Projet introuvable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const changeEtat = async (newEtat) => {
    if (!project) return;
    if (newEtat === project.etat) return;
    try {
      setSaving(true);
      await updateProject(project.id, { etat: newEtat });
      setProject((p) => ({ ...p, etat: newEtat }));
      toast.success(`État mis à jour → ${etatLabel[newEtat]} ✅`);
    } catch {
      toast.error("Impossible de changer l’état");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!project) return;
    if (!confirm(`Supprimer le projet "${project.nom}" ?`)) return;
    try {
      await deleteProject(project.id);
      toast.success("Projet supprimé ✅");
      navigate("/admin/projects");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  if (loading || !project) {
    return (
      <>
        <PageMeta title="Détail projet — TrackPro" />
        <div className="space-y-6">
          <div className="h-8 w-64 animate-pulse rounded-lg bg-gray-100 dark:bg-white/5" />
          <div className="h-40 w-full animate-pulse rounded-2xl bg-gray-100 dark:bg-white/5" />
          <div className="h-72 w-full animate-pulse rounded-2xl bg-gray-100 dark:bg.white/5" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta title={`${project.nom} — TrackPro`} />

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/projects"
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 dark:border-gray-800 dark:text-white/80 dark:hover:bg.white/5"
          >
            ← Retour
          </Link>
          <div>
            <h2 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
              {project.nom}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {project.adresse || "—"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            disabled={saving}
            value={project.etat}
            onChange={(e) => changeEtat(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 dark:text-white/90"
          >
            <option value="EN_ATTENTE">En attente</option>
            <option value="EN_COURS">En cours</option>
            <option value="TERMINE">Terminé</option>
          </select>
          <button
            onClick={remove}
            className="rounded-lg bg-rose-500 px-4 py-2 text-sm text-white hover:bg-rose-600"
          >
            Supprimer
          </button>
        </div>
      </div>

      {/* Résumé */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Carte A : Info principales */}
        <div className="xl:col-span-2 rounded-2xl border border-gray-200 p-6 shadow-theme-xs dark:border-gray-800">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-lg px-2.5 py-1 text-xs ${
                  etatClass[project.etat] ||
                  "bg-gray-100 text-gray-700 dark:bg.white/10 dark:text-white/80"
                }`}
              >
                {etatLabel[project.etat] || project.etat}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Créé le {formatDate(project.createdAt)}
              </span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Budget : <span className="font-medium">{formatMoney(project.budget)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-gray-50 p-4 dark:bg-white/5">
              <p className="text-xs text-gray-500 dark:text-gray-400">Date début</p>
              <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">
                {formatDate(project.dateDebut)}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4 dark:bg.white/5">
              <p className="text-xs text-gray-500 dark:text-gray-400">Date fin</p>
              <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">
                {formatDate(project.dateFin)}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4 dark:bg.white/5">
              <p className="text-xs text-gray-500 dark:text-gray-400">Tâches</p>
              <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">
                {counts.tasks}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
              Description
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {project.description || "—"}
            </p>
          </div>
        </div>

        {/* Carte B : Chef de projet */}
        <div className="xl:col-span-1 rounded-2xl border border-gray-200 p-6 shadow-theme-xs dark:border-gray-800">
          <h4 className="mb-4 text-sm font-semibold text-gray-800 dark:text-white/90">
            Chef de projet
          </h4>
          <div className="flex items-center gap-4">
            {project?.chefProjet?.photoUrl ? (
              <img
                src={`${BACKEND_URL}${project.chefProjet.photoUrl.startsWith("/") ? project.chefProjet.photoUrl : "/" + project.chefProjet.photoUrl}`}
                alt="chef"
                className="size-16 rounded-full object-cover ring-1 ring-gray-200 dark:ring-gray-800"
              />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600 ring-1 ring-gray-200 dark:bg.white/10 dark:text-white/70 dark:ring-gray-800">
                {initials(project.chefProjet)}
              </div>
            )}
            <div>
              <div className="font-medium text-gray-800 dark:text-white/90">
                {fullName(project.chefProjet)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 break-all">
                {project?.chefProjet?.email || "—"}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-gray-50 p-3 text-center dark:bg.white/5">
              <div className="text-xs text-gray-500 dark:text-gray-400">Équipements</div>
              <div className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">
                {counts.equipements}
              </div>
            </div>
            <div className="rounded-xl bg-gray-50 p-3 text-center dark:bg.white/5">
              <div className="text-xs text-gray-500 dark:text-gray-400">Matériaux</div>
              <div className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">
                {counts.materiaux}
              </div>
            </div>
            <div className="rounded-xl bg-gray-50 p-3 text-center dark:bg.white/5">
              <div className="text-xs text-gray-500 dark:text-gray-400">Tâches</div>
              <div className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">
                {counts.tasks}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Tâches (simple) */}
      <div className="mt-6 rounded-2xl border border-gray-200 p-6 shadow-theme-xs dark:border-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
            Tâches ({counts.tasks})
          </h4>
        </div>

        {counts.tasks === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Aucune tâche.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="text-xs uppercase text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Titre</th>
                  <th className="px-4 py-2">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {project.tasks.map((t, i) => (
                  <tr key={t.id || i} className="hover:bg-gray-50/60 dark:hover:bg.white/5">
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                      {t.id ?? i + 1}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800 dark:text-white/90">
                      {t.titre || t.nom || t.name || "—"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                      {t.statut || t.status || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
