import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import { toast } from "react-toastify";
import { getMateriauById, updateMateriau } from "../../../api/materiaux";
import { getProjects } from "../../../api/projects";
import { getFournisseurs } from "../../../api/fournisseurs";

const typeOptions = [
  "Ciment",
  "Acier",
  "Bois",
  "Béton",
  "Peinture",
  "Tuyaux",
  "Câbles",
  "Autre",
];

export default function EditMateriauForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    nom: "",
    type: "",
    typeCustom: "",
    stock: 0,
    seuil: 0,
    coutUnitaire: 0,
    dateProchainApprovisionnement: "",
    projectId: "",
    fournisseurId: "",
    commandeEnvoyee: false,
  });

  const totalStockValue = useMemo(
    () => (Number(form.stock) || 0) * (Number(form.coutUnitaire) || 0),
    [form.stock, form.coutUnitaire]
  );

  useEffect(() => {
    (async () => {
      try {
        const [mRes, prRes, frRes] = await Promise.allSettled([
          getMateriauById(id),
          getProjects(),
          getFournisseurs(),
        ]);

        if (mRes.status === "rejected") throw new Error();
        const m = mRes.value.data;

        if (prRes.status === "fulfilled") {
          setProjects((prRes.value.data || []).map((p) => ({ id: p.id, nom: p.nom })));
        }
        if (frRes.status === "fulfilled") {
          setFournisseurs((frRes.value.data || []).map((f) => ({
            id: f.id,
            label: f.nom || f.contact || `#${f.id}`,
          })));
        }

        const isCustomType = m.type && !typeOptions.includes(m.type);
        setForm({
          nom: m.nom || "",
          type: isCustomType ? "Autre" : (m.type || ""),
          typeCustom: isCustomType ? m.type : "",
          stock: m.stock ?? 0,
          seuil: m.seuil ?? 0,
          coutUnitaire: m.coutUnitaire ?? 0,
          dateProchainApprovisionnement: m.dateProchainApprovisionnement
            ? String(m.dateProchainApprovisionnement).slice(0, 10)
            : "",
          projectId: m.projet?.id || "",
          fournisseurId: m.fournisseur?.id || "",
          commandeEnvoyee: !!m.commandeEnvoyee,
        });
      } catch {
        toast.error("Impossible de charger le matériau");
        navigate("/admin/materiaux");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked :
        type === "number" ? Number(value) :
        (name === "projectId" || name === "fournisseurId") ? (value ? Number(value) : "") :
        value,
    }));
  };

  const setTypeValue = (v) => {
    setForm((prev) => ({ ...prev, type: v, typeCustom: v === "Autre" ? prev.typeCustom : "" }));
  };

  const canSubmit =
    form.nom.trim() &&
    (form.type === "Autre" ? !!form.typeCustom.trim() : !!form.type);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      toast.error("Nom et Type sont obligatoires.");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        nom: form.nom.trim(),
        type: form.type === "Autre" ? form.typeCustom.trim() : form.type,
        stock: Number(form.stock) || 0,
        seuil: Number(form.seuil) || 0,
        coutUnitaire: Number(form.coutUnitaire) || 0,
        commandeEnvoyee: !!form.commandeEnvoyee,
      };
      if (form.dateProchainApprovisionnement) {
        payload.dateProchainApprovisionnement = form.dateProchainApprovisionnement;
      } else {
        payload.dateProchainApprovisionnement = null;
      }
      // lier/déli­er relations
      if (form.projectId !== "") payload.projetId = form.projectId; else payload.projetId = null;
      if (form.fournisseurId !== "") payload.fournisseurId = form.fournisseurId; else payload.fournisseurId = null;

      await updateMateriau(id, payload);
      toast.success("Matériau mis à jour ✅");
      navigate(`/admin/materiaux/${id}`);
    } catch (err) {
      const msg = err?.response?.data?.message || "Mise à jour impossible.";
      toast.error(`❌ ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageMeta title={`Éditer matériau #${id} — TrackPro`} />

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">✏️ Éditer le matériau</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/admin/materiaux/${id}`)}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-800 dark:text-white/90 dark:hover:bg-white/10"
          >
            Annuler
          </button>
          <button
            form="m-edit-form"
            type="submit"
            disabled={saving || !canSubmit}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:opacity-60"
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-48 animate-pulse rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-800/40" />
      ) : (
        <form
          id="m-edit-form"
          onSubmit={handleSubmit}
          className="grid gap-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 lg:grid-cols-3"
        >
          {/* Colonne principale */}
          <div className="grid gap-6 lg:col-span-2">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <Label>Nom *</Label>
                <Input name="nom" value={form.nom} onChange={onChange} placeholder="Ciment CEM II 32,5" required />
              </div>

              <div>
                <Label>Type *</Label>
                <div className="space-y-2">
                  <input
                    name="type"
                    list="mTypeOptions"
                    value={form.type}
                    onChange={onChange}
                    placeholder="Choisir un type…"
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm outline-none dark:border-gray-700 dark:text-white/90"
                  />
                  <datalist id="mTypeOptions">
                    {typeOptions.map((t) => <option key={t} value={t} />)}
                  </datalist>

                  <div className="flex flex-wrap gap-2">
                    {typeOptions.map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setTypeValue(t)}
                        className={`rounded-full border px-3 py-1 text-xs transition ${
                          form.type === t
                            ? "border-brand-500 bg-brand-50 text-brand-600 dark:border-brand-400/40 dark:bg-brand-500/10 dark:text-brand-300"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg.white/5"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  {form.type === "Autre" && (
                    <div className="pt-1">
                      <Label>Préciser le type</Label>
                      <Input
                        name="typeCustom"
                        value={form.typeCustom}
                        onChange={onChange}
                        placeholder="Ex.: Gravier 0/31,5"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label>Stock</Label>
                <Input name="stock" type="number" min="0" value={form.stock} onChange={onChange} />
              </div>

              <div>
                <Label>Seuil</Label>
                <Input name="seuil" type="number" min="0" value={form.seuil} onChange={onChange} />
              </div>

              <div>
                <Label>Coût unitaire (TND)</Label>
                <Input name="coutUnitaire" type="number" min="0" step="0.01" value={form.coutUnitaire} onChange={onChange} />
              </div>

              <div>
                <Label>Prochain appro (date)</Label>
                <Input
                  name="dateProchainApprovisionnement"
                  type="date"
                  value={form.dateProchainApprovisionnement}
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
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
                </select>
              </div>

              <div>
                <Label>Fournisseur (optionnel)</Label>
                <select
                  name="fournisseurId"
                  value={form.fournisseurId}
                  onChange={onChange}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:text-white/90"
                >
                  <option value="">— Aucun —</option>
                  {fournisseurs.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <input
                  id="cmd"
                  name="commandeEnvoyee"
                  type="checkbox"
                  checked={form.commandeEnvoyee}
                  onChange={onChange}
                  className="size-4 rounded border-gray-300 text-brand-600"
                />
                <label htmlFor="cmd" className="text-sm text-gray-700 dark:text-gray-300">
                  Commande envoyée
                </label>
              </div>
            </div>
          </div>

          {/* Colonne résumé */}
          <aside className="lg:col-span-1">
            <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              <h4 className="mb-3 font-medium text-gray-800 dark:text-white/90">Récapitulatif</h4>
              <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
                <li>Nom : <span className="font-medium">{form.nom || "—"}</span></li>
                <li>Type : <span className="font-medium">{form.type === "Autre" ? (form.typeCustom || "—") : (form.type || "—")}</span></li>
                <li>Stock/Seuil : <span className="font-medium">{form.stock}/{form.seuil}</span></li>
                <li>Valeur de stock : <span className="font-medium">{(totalStockValue || 0).toFixed(2)} TND</span></li>
              </ul>
            </div>
          </aside>
        </form>
      )}
    </div>
  );
}
