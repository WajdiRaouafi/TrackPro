// src/pages/pages-trackpro/Equipements/EquipementDetail.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import { getEquipementById, updateEquipement, deleteEquipement } from "../../../api/equipements";
import { toast } from "react-toastify";

const STATUTS = [
  { value: "Disponible", label: "Disponible" },
  { value: "En utilisation", label: "En utilisation" },
  { value: "Maintenance", label: "Maintenance" },
  { value: "En panne", label: "En panne" },
];

const statutClass = {
  "Disponible": "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  "En utilisation": "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
  "Maintenance": "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  "En panne": "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
};

const formatDate = (d) => (d ? new Date(d).toLocaleDateString("fr-FR") : "—");
const money = (n) => {
  const v = Number(n || 0);
  try {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "TND" }).format(v);
  } catch {
    return `${v.toFixed(2)} TND`;
  }
};

export default function EquipementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [eq, setEq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const totalCost = useMemo(
    () => (Number(eq?.coutParJour) || 0) * (Number(eq?.joursUtilisation) || 0),
    [eq]
  );

  const todayISO = new Date().toISOString().slice(0, 10);
  const dateInvalid = eq?.dateProchainApprovisionnement && eq.dateProchainApprovisionnement < todayISO;
  const lowStock = (eq?.stock ?? 0) < (eq?.seuil ?? 0);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getEquipementById(id);
      setEq(res.data);
    } catch {
      toast.error("Équipement introuvable");
      navigate("/equipements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const changeStatut = async (newStatut) => {
    if (!eq || newStatut === eq.statut) return;
    try {
      await updateEquipement(eq.id, { statut: newStatut });
      setEq((prev) => ({ ...prev, statut: newStatut }));
      toast.success(`Statut mis à jour → ${newStatut} ✅`);
    } catch {
      toast.error("Impossible de mettre à jour le statut");
    } finally {
      setMenuOpen(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteEquipement(eq.id);
      toast.success("Équipement supprimé ✅");
      navigate("/equipements");
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageMeta title={`Équipement #${id} — TrackPro`} />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            🧰 Détail équipement
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Visualisez l’état, les coûts et l’affectation au projet.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/equipements")}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-800 dark:text-white/90 dark:hover:bg-white/10"
          >
            Retour
          </button>
          {eq && (
            <button
              onClick={() => navigate(`/equipements/edit/${eq.id}`)}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm text-white shadow-theme-xs hover:bg-brand-600"
            >
              Éditer
            </button>
          )}
          {eq && (
            <button
              onClick={() => setConfirmOpen(true)}
              className="rounded-lg bg-rose-500 px-4 py-2 text-sm text-white hover:bg-rose-600"
            >
              Supprimer
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="h-48 animate-pulse rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-800/40" />
      ) : !eq ? (
        <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-500 dark:border-gray-800">
          Introuvable.
        </div>
      ) : (
        <>
          {/* Header card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {eq.nom}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  N° de série : <span className="font-medium text-gray-700 dark:text-white/90">{eq.numeroSerie}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`rounded-lg px-2.5 py-1 text-xs ${statutClass[eq.statut] || "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-white/80"}`}>
                  {eq.statut}
                </span>

                {/* sélecteur statut rapide */}
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs hover:bg-gray-50 dark:border-gray-800 dark:text-white/90 dark:hover:bg-white/10"
                  >
                    Changer
                  </button>
                  {menuOpen && (
                    <div
                      className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-900"
                      onMouseLeave={() => setMenuOpen(false)}
                    >
                      {STATUTS.map((s) => (
                        <button
                          key={s.value}
                          onClick={() => changeStatut(s.value)}
                          className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-white/5"
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Alerte rapides */}
            <div className="mt-4 flex flex-wrap gap-3">
              {lowStock && (
                <span className="inline-flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-1.5 text-xs text-rose-700 ring-1 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20">
                  <span className="size-1.5 rounded-full bg-rose-500" />
                  Stock sous seuil
                </span>
              )}
              {dateInvalid && (
                <span className="inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5 text-xs text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20">
                  <span className="size-1.5 rounded-full bg-amber-500" />
                  Réapprovisionnement passé
                </span>
              )}
            </div>
          </div>

          {/* Detail grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Informations générales</h4>
              <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Type</dt>
                  <dd className="font-medium text-gray-800 dark:text-white/90">{eq.type || "—"}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Statut</dt>
                  <dd className="font-medium text-gray-800 dark:text-white/90">{eq.statut}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Projet lié</dt>
                  <dd className="font-medium">
                    {eq.projet ? (
                      <Link
                        to={`/projects/${eq.projet.id}`}
                        className="text-brand-600 hover:underline dark:text-brand-400"
                      >
                        #{eq.projet.id} — {eq.projet.nom}
                      </Link>
                    ) : (
                      <span className="text-gray-800 dark:text-white/90">—</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Prochain réappro</dt>
                  <dd className={`font-medium ${dateInvalid ? "text-amber-600 dark:text-amber-400" : "text-gray-800 dark:text-white/90"}`}>
                    {formatDate(eq.dateProchainApprovisionnement)}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Stock & coûts</h4>
              <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Stock</dt>
                  <dd className={`font-medium ${lowStock ? "text-rose-600 dark:text-rose-400" : "text-gray-800 dark:text-white/90"}`}>
                    {eq.stock} <span className="text-gray-400">/ seuil {eq.seuil}</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Coût / jour</dt>
                  <dd className="font-medium text-gray-800 dark:text-white/90">{money(eq.coutParJour)}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Jours d’utilisation</dt>
                  <dd className="font-medium text-gray-800 dark:text-white/90">{eq.joursUtilisation || 0}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Coût total estimé</dt>
                  <dd className="font-semibold text-gray-900 dark:text-white">{money(totalCost)}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Modal suppression */}
          {confirmOpen && (
            <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4">
              <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900">
                <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                  Confirmer la suppression
                </h3>
                <p className="mb-5 text-sm text-gray-600 dark:text-gray-400">
                  Supprimer <span className="font-medium text-gray-900 dark:text-white/90">{eq.nom}</span> ?
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setConfirmOpen(false)}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-800 dark:text-white/90 dark:hover:bg-white/10"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="rounded-lg bg-rose-500 px-4 py-2 text-sm text-white hover:bg-rose-600"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
