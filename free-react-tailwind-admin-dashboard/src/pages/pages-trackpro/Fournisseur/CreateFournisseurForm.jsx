// src/pages/pages-trackpro/Fournisseurs/FournisseurCreate.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import { createFournisseur } from "../../../api/fournisseurs";
import { toast } from "react-toastify";

export default function CreateFournisseurForm() {
  const navigate = useNavigate();

  const [nom, setNom] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [siteWeb, setSiteWeb] = useState("");
  const [saving, setSaving] = useState(false);

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
      await createFournisseur(payload);
      toast.success("✅ Fournisseur créé avec succès");
      navigate("/fournisseurs"); // ajuste si ta route diffère
    } catch (err) {
      const msg = err?.response?.data?.message || "Erreur lors de la création du fournisseur.";
      toast.error(`❌ ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageMeta title="Nouveau fournisseur — TrackPro" description="Créer un nouveau fournisseur" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">➕ Nouveau fournisseur</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Renseignez les informations du fournisseur.
          </p>
        </div>
        <Link
          to="/fournisseurs"
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-800 dark:text-white/90 dark:hover:bg-white/10"
        >
          Retour à la liste
        </Link>
      </div>

      {/* Card */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="lg:col-span-1">
            <Label>
              Nom <span className="text-error-500">*</span>
            </Label>
            <Input placeholder="Ex : Alpha Matériaux" value={nom} onChange={(e) => setNom(e.target.value)} required />
          </div>

          <div className="lg:col-span-1">
            <Label>Contact</Label>
            <Input placeholder="Ex : Mme. Ben Ali" value={contact} onChange={(e) => setContact(e.target.value)} />
          </div>

          <div className="lg:col-span-1">
            <Label>Email</Label>
            <Input type="email" placeholder="contact@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="lg:col-span-1">
            <Label>Téléphone</Label>
            <Input placeholder="+216 12 345 678" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
          </div>

          <div className="lg:col-span-1">
            <Label>Adresse</Label>
            <Input placeholder="Rue, ville, pays" value={adresse} onChange={(e) => setAdresse(e.target.value)} />
          </div>

          <div className="lg:col-span-1">
            <Label>Site web</Label>
            <Input placeholder="https://exemple.com" value={siteWeb} onChange={(e) => setSiteWeb(e.target.value)} />
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
            {saving ? "Enregistrement..." : "Créer le fournisseur"}
          </button>
        </div>
      </form>
    </div>
  );
}
