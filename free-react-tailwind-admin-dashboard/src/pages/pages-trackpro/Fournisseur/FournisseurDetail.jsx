import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import { getFournisseurById, deleteFournisseur } from "../../../api/fournisseurs";
import { toast } from "react-toastify";

export default function FournisseurDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getFournisseurById(id);
      setItem(res.data || null);
    } catch {
      toast.error("Erreur lors du chargement du fournisseur");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() =>   {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDelete = async () => {
    try {
      await deleteFournisseur(id);
      toast.success("Fournisseur supprimé ✅");
      navigate("/fournisseurs");
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageMeta title={`Fournisseur #${id} — TrackPro`} description="Détails du fournisseur" />

      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">Détails du fournisseur</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Visualisez les informations et actions disponibles.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/fournisseurs"
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-800 dark:text-white/90 dark:hover:bg-white/10"
          >
            Retour
          </Link>
          <button
            onClick={() => navigate(`/fournisseur/edit/${id}`)}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-800 dark:text-white/90 dark:hover:bg-white/10"
          >
            Éditer
          </button>
          <button
            onClick={() => setConfirmOpen(true)}
            className="rounded-lg bg-rose-500 px-4 py-2 text-sm text-white hover:bg-rose-600"
          >
            Supprimer
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
        {loading ? (
          <div className="space-y-3">
            <div className="h-6 w-44 animate-pulse rounded bg-gray-100 dark:bg-white/5" />
            <div className="h-4 w-64 animate-pulse rounded bg-gray-100 dark:bg-white/5" />
            <div className="h-4 w-72 animate-pulse rounded bg-gray-100 dark:bg-white/5" />
            <div className="h-4 w-64 animate-pulse rounded bg-gray-100 dark:bg-white/5" />
          </div>
        ) : !item ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">Fournisseur introuvable.</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Field label="Nom" value={item.nom} />
            <Field label="Contact" value={item.contact || "—"} />
            <Field
              label="Email"
              value={
                item.email ? (
                  <a className="text-brand-500 hover:text-brand-600 dark:text-brand-400" href={`mailto:${item.email}`}>
                    {item.email}
                  </a>
                ) : (
                  "—"
                )
              }
            />
            <Field label="Téléphone" value={item.telephone || "—"} />
            <Field
              label="Site web"
              value={
                item.siteWeb ? (
                  <a
                    className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                    href={/^https?:\/\//i.test(item.siteWeb) ? item.siteWeb : `https://${item.siteWeb}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {item.siteWeb}
                  </a>
                ) : (
                  "—"
                )
              }
            />
            <div className="md:col-span-2">
              <Field label="Adresse" value={item.adresse || "—"} />
            </div>
          </div>
        )}
      </div>

      {/* Delete modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
              Confirmer la suppression
            </h3>
            <p className="mb-5 text-sm text-gray-600 dark:text-gray-400">
              Supprimer ce fournisseur ?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmOpen(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-800 dark:text-white/90 dark:hover:bg-white/10"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="rounded-lg bg-rose-500 px-4 py-2 text-sm text-white hover:bg-rose-600"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-gray-400">{label}</div>
      <div className="mt-1 text-sm text-gray-800 dark:text-white/90">{value}</div>
    </div>
  );
}
