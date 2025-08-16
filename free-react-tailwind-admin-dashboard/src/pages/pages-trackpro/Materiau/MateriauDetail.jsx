import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import { getMateriauById, updateMateriau, deleteMateriau } from "../../../api/materiaux";
import { toast } from "react-toastify";

const money = (n) => {
  const v = Number(n || 0);
  try { return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "TND" }).format(v); }
  catch { return `${v.toFixed(2)} TND`; }
};
const formatDate = (d) => (d ? new Date(d).toLocaleDateString("fr-FR") : "—");

export default function MateriauDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [m, setM] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const low = (m?.stock ?? 0) < (m?.seuil ?? 0);
  const totalStockValue = useMemo(
    () => (Number(m?.stock) || 0) * (Number(m?.coutUnitaire) || 0),
    [m]
  );
  const soon =
    m?.dateProchainApprovisionnement &&
    new Date(m.dateProchainApprovisionnement) < new Date(Date.now() + 7 * 864e5);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getMateriauById(id);
      setM(res.data);
    } catch {
      toast.error("Matériau introuvable");
      navigate("/admin/materiaux");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const toggleCommande = async () => {
    if (!m) return;
    try {
      const value = !m.commandeEnvoyee;
      await updateMateriau(m.id, { commandeEnvoyee: value });
      setM((prev) => ({ ...prev, commandeEnvoyee: value }));
      toast.success(value ? "Commande marquée envoyée ✅" : "Commande réinitialisée ✅");
    } catch {
      toast.error("Impossible de mettre à jour la commande");
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteMateriau(m.id);
      toast.success("Matériau supprimé ✅");
      navigate("/admin/materiaux");
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageMeta title={`Matériau #${id} — TrackPro`} />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">🧱 Détail matériau</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Stock, approvisionnements et valeur de stock.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/admin/materiaux")}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-800 dark:text-white/90 dark:hover:bg-white/10"
          >
            Retour
          </button>
          {m && (
            <button
              onClick={() => navigate(`/admin/materiaux/edit/${m.id}`)}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm text-white shadow-theme-xs hover:bg-brand-600"
            >
              Éditer
            </button>
          )}
          {m && (
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
      ) : !m ? (
        <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-500 dark:border-gray-800">
          Introuvable.
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{m.nom}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Type : <span className="font-medium">{m.type || "—"}</span></p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`rounded-lg px-2.5 py-1 text-xs ${
                  m.commandeEnvoyee
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                    : "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-white/80"
                }`}>
                  {m.commandeEnvoyee ? "Commande envoyée" : "Commande non envoyée"}
                </span>
                <button
                  onClick={toggleCommande}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs hover:bg-gray-50 dark:border-gray-800 dark:text-white/90 dark:hover:bg-white/10"
                >
                  {m.commandeEnvoyee ? "Réinitialiser" : "Marquer envoyée"}
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              {low && (
                <span className="inline-flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-1.5 text-xs text-rose-700 ring-1 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20">
                  <span className="size-1.5 rounded-full bg-rose-500" />
                  Stock sous seuil
                </span>
              )}
              {soon && (
                <span className="inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5 text-xs text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20">
                  <span className="size-1.5 rounded-full bg-amber-500" />
                  Approvisionnement imminent
                </span>
              )}
            </div>
          </div>

          {/* Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Informations générales</h4>
              <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Projet</dt>
                  <dd className="font-medium">
                    {m.projet ? (
                      <Link to={`/admin/projects/${m.projet.id}`} className="text-brand-600 hover:underline dark:text-brand-400">
                        #{m.projet.id} — {m.projet.nom}
                      </Link>
                    ) : ("—")}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Fournisseur</dt>
                  <dd className="font-medium text-gray-800 dark:text-white/90">
                    {m.fournisseur?.nom || m.fournisseur?.contact || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Prochain appro</dt>
                  <dd className={`font-medium ${soon ? "text-amber-600 dark:text-amber-400" : "text-gray-800 dark:text-white/90"}`}>
                    {formatDate(m.dateProchainApprovisionnement)}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Dernière MAJ</dt>
                  <dd className="font-medium text-gray-800 dark:text-white/90">{formatDate(m.updatedAt)}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Stock & coûts</h4>
              <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Stock</dt>
                  <dd className={`font-medium ${low ? "text-rose-600 dark:text-rose-400" : "text-gray-800 dark:text-white/90"}`}>
                    {m.stock} <span className="text-gray-400">/ seuil {m.seuil}</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Coût unitaire</dt>
                  <dd className="font-medium text-gray-800 dark:text-white/90">{money(m.coutUnitaire)}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Valeur de stock</dt>
                  <dd className="font-semibold text-gray-900 dark:text-white">{money(totalStockValue)}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Créé le</dt>
                  <dd className="font-medium text-gray-800 dark:text-white/90">{formatDate(m.createdAt)}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Delete modal */}
          {confirmOpen && (
            <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4">
              <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900">
                <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">Confirmer la suppression</h3>
                <p className="mb-5 text-sm text-gray-600 dark:text-gray-400">
                  Supprimer <span className="font-medium text-gray-900 dark:text-white/90">{m.nom}</span> ?
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
