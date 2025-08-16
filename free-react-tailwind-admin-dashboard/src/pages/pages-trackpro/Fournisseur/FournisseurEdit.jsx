import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import { getFournisseurById, updateFournisseur, deleteFournisseur } from "../../../api/fournisseurs";
import { toast } from "react-toastify";

export default function FournisseurEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [nom, setNom] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [siteWeb, setSiteWeb] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getFournisseurById(id);
      const f = res.data;
      setNom(f?.nom || "");
      setContact(f?.contact || "");
      setEmail(f?.email || "");
      setTelephone(f?.telephone || "");
      setAdresse(f?.adresse || "");
      setSiteWeb(f?.siteWeb || "");
    } catch {
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const validate = () => {
    if (!nom.trim()) {
      toast.error("Le nom du fournisseur est requis.");
      return false;
    }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Email invalide.");
      return false;
    }
    if (siteWeb && !/^https?:\/\/.+/i.test(siteWeb)) {
      toast.error("Le site web doit commencer par http:// ou https://");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      nom: nom.trim(),
      contact: contact.trim() || undefined,
      email: email.trim() || undefined,
      telephone: telephone.trim() || undefined,
      adresse: adresse.trim() || undefined,
      siteWeb: siteWeb.trim() || undefined,
    };

    try {
      setSaving(true);
      await updateFournisseur(id, payload);
      toast.success("✅ Modifications enregistrées");
      navigate(`/fournisseur/${id}`);
    } catch (err) {
      const msg = err?.response?.data?.message || "Erreur lors de la mise à jour.";
      toast.error(`❌ ${msg}`);
    } finally {
      setSaving(false);
    }
  };

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
      <PageMeta title={`Éditer fournisseur #${id} — TrackPro`} description="Modifier un fournisseur" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">✏️ Éditer fournisseur</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Mettez à jour les informations du fournisseur.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/fournisseurs/${id}`}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-800 dark:text-white/90 dark:hover:bg-white/10"
          >
            Voir détails
          </Link>
          <button
            onClick={() => setConfirmOpen(true)}
            className="rounded-lg bg-rose-500 px-4 py-2 text-sm text-white hover:bg-rose-600"
          >
            Supprimer
          </button>
        </div>
      </div>

      {/* Card */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900"
      >
        {loading ? (
          <div className="space-y-3">
            <div className="h-6 w-44 animate-pulse rounded bg-gray-100 dark:bg-white/5" />
            <div className="h-4 w-64 animate-pulse rounded bg-gray-100 dark:bg-white/5" />
            <div className="h-4 w-72 animate-pulse rounded bg-gray-100 dark:bg-white/5" />
            <div className="h-4 w-64 animate-pulse rounded bg-gray-100 dark:bg-white/5" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="lg:col-span-1">
                <Label>
                  Nom <span className="text-error-500">*</span>
                </Label>
                <Input value={nom} onChange={(e) => setNom(e.target.value)} required />
              </div>

              <div className="lg:col-span-1">
                <Label>Contact</Label>
                <Input value={contact} onChange={(e) => setContact(e.target.value)} />
              </div>

              <div className="lg:col-span-1">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div className="lg:col-span-1">
                <Label>Téléphone</Label>
                <Input value={telephone} onChange={(e) => setTelephone(e.target.value)} />
              </div>

              <div className="lg:col-span-1">
                <Label>Adresse</Label>
                <Input value={adresse} onChange={(e) => setAdresse(e.target.value)} />
              </div>

              <div className="lg:col-span-1">
                <Label>Site web</Label>
                <Input value={siteWeb} onChange={(e) => setSiteWeb(e.target.value)} placeholder="https://exemple.com" />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 lg:justify-end">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-800 dark:text-white/90 dark:hover:bg-white/10"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm text-white shadow-theme-xs hover:bg-brand-600 disabled:opacity-50"
              >
                {saving ? "Enregistrement..." : "Enregistrer les modifications"}
              </button>
            </div>
          </>
        )}
      </form>

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
