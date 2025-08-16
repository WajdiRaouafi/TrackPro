// src/pages/pages-trackpro/Equipements/EquipementCreate.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import { toast } from "react-toastify";
import { createEquipement } from "../../../api/equipements";
import { getProjects } from "../../../api/projects";

const STATUTS = [
  { value: "Disponible", label: "Disponible" },
  { value: "En utilisation", label: "En utilisation" },
  { value: "Maintenance", label: "Maintenance" },
  { value: "En panne", label: "En panne" },
];

// 👉 Ta liste de types
const typeOptions = [
  "Voiture",
  "Camion",
  "Matériel de soudure",
  "Grue",
  "Compresseur",
  "Générateur",
  "Échafaudage",
  "Autre",
];

export default function EquipementCreate() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]); // {id, nom}
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    nom: "",
    type: "",
    numeroSerie: "",
    statut: "Disponible",
    stock: 0,
    seuil: 0,
    dateProchainApprovisionnement: "",
    coutParJour: 0,
    joursUtilisation: 0,
    projectId: "",
    typeCustom: "", // utilisé quand "Autre" sélectionné
  });

  const todayISO = new Date().toISOString().slice(0, 10);
  const dateInvalid =
    form.dateProchainApprovisionnement &&
    form.dateProchainApprovisionnement < todayISO;

  const canSubmit = useMemo(() => {
    const hasType =
      form.type && form.type !== "Autre"
        ? true
        : form.type === "Autre"
        ? !!form.typeCustom.trim()
        : false;

    return (
      form.nom.trim() &&
      hasType &&
      form.numeroSerie.trim()
    );
  }, [form]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getProjects();
        const list = (res.data || []).map((p) => ({ id: p.id, nom: p.nom }));
        setProjects(list);
      } catch {
        // non bloquant
      }
    })();
  }, []);

  const onChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? Number(value)
          : name === "projectId"
          ? (value ? Number(value) : "")
          : value,
    }));
  };

  const setTypeValue = (value) => {
    // Si on clique sur un pill
    setForm((prev) => ({
      ...prev,
      type: value,
      // reset custom si on quitte "Autre"
      typeCustom: value === "Autre" ? prev.typeCustom : "",
    }));
  };

  const handleSerieBlur = () => {
    if (!form.numeroSerie) return;
    setForm((prev) => ({ ...prev, numeroSerie: prev.numeroSerie.trim().toUpperCase() }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      toast.error("Nom, Type et Numéro de série sont obligatoires.");
      return;
    }
    try {
      setSaving(true);

      const finalType = form.type === "Autre" ? form.typeCustom.trim() : form.type;

      const payload = {
        nom: form.nom.trim(),
        type: finalType,
        numeroSerie: form.numeroSerie.trim().toUpperCase(),
        statut: form.statut,
        stock: Number(form.stock) || 0,
        seuil: Number(form.seuil) || 0,
        coutParJour: Number(form.coutParJour) || 0,
        joursUtilisation: Number(form.joursUtilisation) || 0,
      };
      if (form.dateProchainApprovisionnement) {
        payload.dateProchainApprovisionnement = form.dateProchainApprovisionnement; // "YYYY-MM-DD"
      }
      if (form.projectId) {
        payload.projet = { id: form.projectId };
      }

      await createEquipement(payload);
      toast.success("Équipement créé ✅");
      navigate("/equipements");
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Impossible de créer l’équipement.";
      toast.error(`❌ ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageMeta title="Nouvel équipement — TrackPro" />

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          ➕ Nouvel équipement
        </h2>
        <button
          onClick={() => navigate("/equipements")}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-800 dark:text-white/90 dark:hover:bg-white/10"
        >
          Annuler
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 lg:grid-cols-3"
      >
        {/* Colonne principale */}
        <div className="grid gap-6 lg:col-span-2">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label>Nom *</Label>
              <Input
                name="nom"
                value={form.nom}
                onChange={onChange}
                placeholder="Compresseur XZ-200"
                required
              />
            </div>

            {/* --- TYPE avec auto-complétion + pills --- */}
            <div>
              <Label>Type *</Label>
              <div className="space-y-2">
                {/* Input avec datalist pour suggestions */}
                <input
                  name="type"
                  list="typeOptions"
                  value={form.type}
                  onChange={onChange}
                  placeholder="Choisir un type…"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm outline-none dark:border-gray-700 dark:text-white/90"
                />
                <datalist id="typeOptions">
                  {typeOptions.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>

                {/* Pills rapides */}
                <div className="flex flex-wrap gap-2">
                  {typeOptions.map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setTypeValue(t)}
                      className={`rounded-full border px-3 py-1 text-xs transition ${
                        form.type === t
                          ? "border-brand-500 bg-brand-50 text-brand-600 dark:border-brand-400/40 dark:bg-brand-500/10 dark:text-brand-300"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* Si "Autre", on demande la valeur personnalisée */}
                {form.type === "Autre" && (
                  <div className="pt-1">
                    <Label>Préciser le type</Label>
                    <Input
                      name="typeCustom"
                      value={form.typeCustom}
                      onChange={onChange}
                      placeholder="Ex.: Nacelle ciseaux"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label>Numéro de série *</Label>
              <Input
                name="numeroSerie"
                value={form.numeroSerie}
                onChange={onChange}
                onBlur={handleSerieBlur}
                placeholder="SN-123456"
                required
              />
            </div>

            <div>
              <Label>Statut</Label>
              <select
                name="statut"
                value={form.statut}
                onChange={onChange}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:text-white/90"
              >
                {STATUTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div>
              <Label>Stock</Label>
              <Input
                name="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={onChange}
              />
            </div>
            <div>
              <Label>Seuil</Label>
              <Input
                name="seuil"
                type="number"
                min="0"
                value={form.seuil}
                onChange={onChange}
              />
            </div>
            <div>
              <Label>Réappro (date)</Label>
              <Input
                name="dateProchainApprovisionnement"
                type="date"
                value={form.dateProchainApprovisionnement}
                onChange={onChange}
                className={dateInvalid ? "ring-2 ring-error-500" : ""}
              />
              {dateInvalid && (
                <p className="mt-1 text-xs text-error-500">
                  Date passée — à vérifier.
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div>
              <Label>Coût / jour (TND)</Label>
              <Input
                name="coutParJour"
                type="number"
                step="0.01"
                min="0"
                value={form.coutParJour}
                onChange={onChange}
              />
            </div>
            <div>
              <Label>Jours d’utilisation</Label>
              <Input
                name="joursUtilisation"
                type="number"
                min="0"
                value={form.joursUtilisation}
                onChange={onChange}
              />
            </div>
            <div>
              <Label>Projet (optionnel)</Label>
              <select
                name="projectId"
                value={form.projectId}
                onChange={onChange}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:text-white/90"
              >
                <option value="">— Aucun —</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Colonne résumé + action */}
        <aside className="lg:col-span-1">
          <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
            <h4 className="mb-3 font-medium text-gray-800 dark:text-white/90">
              Récapitulatif
            </h4>
            <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
              <li>
                Nom : <span className="font-medium">{form.nom || "—"}</span>
              </li>
              <li>
                Type :{" "}
                <span className="font-medium">
                  {form.type === "Autre"
                    ? form.typeCustom || "—"
                    : form.type || "—"}
                </span>
              </li>
              <li>
                Statut : <span className="font-medium">{form.statut}</span>
              </li>
              <li>
                Stock/Seuil :{" "}
                <span className="font-medium">
                  {form.stock}/{form.seuil}
                </span>
              </li>
              <li>
                Coût total estimé :{" "}
                <span className="font-medium">
                  {(
                    (Number(form.coutParJour) || 0) *
                    (Number(form.joursUtilisation) || 0)
                  ).toFixed(2)}{" "}
                  TND
                </span>
              </li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={saving || !canSubmit}
            className="mt-4 w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:opacity-60"
          >
            {saving ? "Enregistrement…" : "Créer l’équipement"}
          </button>
        </aside>
      </form>
    </div>
  );
}
