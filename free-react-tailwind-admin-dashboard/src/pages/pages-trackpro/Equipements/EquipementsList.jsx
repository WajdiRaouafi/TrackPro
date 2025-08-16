import { useEffect, useMemo, useState,useRef  } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import {
  getEquipements,
  updateEquipement,
  deleteEquipement,
  getEquipementsAlertes,
  getEquipementsCouts,
  getEquipementsNotifications,
} from "../../../api/equipements";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";

/* ---------- Helpers UI ---------- */
const statutLabel = {
  DISPONIBLE: "Disponible",
  EN_UTILISATION: "En utilisation",
  EN_PANNE: "En panne",
  MAINTENANCE: "Maintenance",
};

const load = async () => {
  try {
    setLoading(true);
    const [listRes, alertsRes, totalRes, notifRes] = await Promise.all([
      getEquipements(),
      getEquipementsAlertes().catch(() => ({ data: [] })),
      getEquipementsCouts().catch(() => ({ data: { total: 0 } })),
      getEquipementsNotifications().catch(() => ({
        data: { alertesStock: [], approvisionnementProche: [] },
      })),
    ]);

    const list = listRes.data || [];
    setEquipements(list);

    const stockCnt = (alertsRes.data || []).length;
    const approCnt = (notifRes.data?.approvisionnementProche || []).length;

    // MAJ des stats
    setAlertsCount(stockCnt);
    setCostTotal(totalRes?.data?.total || 0);
    setApproProche(approCnt);

    // TOASTS si augmentation
    if (stockCnt > prevCounts.current.stock) {
      toast.warn(`Nouvelles alertes de stock: +${stockCnt - prevCounts.current.stock}`, {
        icon: "⚠️",
      });
    }
    if (approCnt > prevCounts.current.appro) {
      toast.info(
        `Nouveaux approvisionnements bientôt: +${
          approCnt - prevCounts.current.appro
        }`,
        { icon: "📦" }
      );
    }

    prevCounts.current = { stock: stockCnt, appro: approCnt };
  } catch {
    toast.error("Erreur lors du chargement des équipements");
  } finally {
    setLoading(false);
  }
};




const statutClass = {
  DISPONIBLE:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  EN_UTILISATION:
    "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
  EN_PANNE:
    "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
  MAINTENANCE:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
};

const formatDate = (d) => (d ? new Date(d).toLocaleDateString("fr-FR") : "—");
const relativeInDays = (d) => {
  if (!d) return "—";
  try {
    const target = new Date(d);
    const today = new Date();
    target.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((target - today) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "aujourd’hui";
    if (diff > 0) return `dans ${diff} j`;
    return `il y a ${Math.abs(diff)} j`;
  } catch {
    return "—";
  }
};
const money = (n) => {
  const v = Number(n);
  if (Number.isNaN(v)) return "—";
  try {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "TND" }).format(v);
  } catch {
    return `${v.toFixed(2)} TND`;
  }
};

const Magnifier = () => (
  <svg viewBox="0 0 24 24" className="size-4 text-gray-400">
    <path
      fill="currentColor"
      d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5m-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14Z"
    />
  </svg>
);

/* ---------- Page ---------- */
export default function EquipementsList() {
  const navigate = useNavigate();

  const [equipements, setEquipements] = useState([]);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [loading, setLoading] = useState(true);

  // stats header
  const [alertsCount, setAlertsCount] = useState(0);
  const [costTotal, setCostTotal] = useState(0);
  const [approProche, setApproProche] = useState(0);

  // filters
  const [statutFilter, setStatutFilter] = useState("ALL");

  // pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // actions
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [eqToDelete, setEqToDelete] = useState(null);

  const prevCounts = useRef({ stock: 0, appro: 0 });


  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim().toLowerCase()), 200);
    return () => clearTimeout(t);
  }, [query]);

  const load = async () => {
    try {
      setLoading(true);
      const [listRes, alertsRes, totalRes, notifRes] = await Promise.all([
        getEquipements(),
        getEquipementsAlertes().catch(() => ({ data: [] })),
        getEquipementsCouts().catch(() => ({ data: { total: 0 } })),
        getEquipementsNotifications().catch(() => ({ data: { alertesStock: [], approvisionnementProche: [] } })),
      ]);

      const list = listRes.data || [];
      setEquipements(list);

      setAlertsCount((alertsRes.data || []).length);
      setCostTotal(totalRes?.data?.total || 0);
      setApproProche((notifRes.data?.approvisionnementProche || []).length);
    } catch {
      toast.error("Erreur lors du chargement des équipements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = debounced;
    return equipements.filter((e) => {
      const base = `${e.nom || ""} ${e.type || ""} ${e.numeroSerie || ""} ${e?.projet?.nom || ""}`.toLowerCase();
      const statutOk = statutFilter === "ALL" || e.statut === statutFilter;
      return statutOk && (!q || base.includes(q));
    });
  }, [debounced, equipements, statutFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const changeStatut = async (eq, newStatut) => {
    if (newStatut === eq.statut) return;
    try {
      await updateEquipement(eq.id, { statut: newStatut });
      setEquipements((prev) =>
        prev.map((x) => (x.id === eq.id ? { ...x, statut: newStatut } : x))
      );
      toast.success(`« ${eq.nom} » → ${statutLabel[newStatut]} ✅`);
    } catch {
      toast.error("Impossible de mettre à jour le statut");
    } finally {
      setMenuOpenId(null);
    }
  };

  const askDelete = (e) => {
    setEqToDelete(e);
    setConfirmOpen(true);
    setMenuOpenId(null);
  };

  const confirmDelete = async () => {
    if (!eqToDelete) return;
    try {
      await deleteEquipement(eqToDelete.id);
      setEquipements((prev) => prev.filter((x) => x.id !== eqToDelete.id));
      toast.success("Équipement supprimé ✅");
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setConfirmOpen(false);
      setEqToDelete(null);
    }
  };

  const exportToExcel = () => {
    const data = filtered.map((e) => ({
      Équipement: e.nom,
      Type: e.type,
      "N° Série": e.numeroSerie,
      Projet: e?.projet?.nom || "—",
      Statut: statutLabel[e.statut] || e.statut,
      Stock: e.stock ?? 0,
      Seuil: e.seuil ?? 0,
      "Prochain appro.": formatDate(e.dateProchainApprovisionnement),
      "Coût / jour": Number(e.coutParJour) || 0,
      "Jours d’utilisation": Number(e.joursUtilisation) || 0,
      "Coût total (estimé)": Number(e.coutParJour) * Number(e.joursUtilisation) || 0,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Équipements");
    XLSX.writeFile(wb, "equipements.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Équipement", "Type", "N° Série", "Projet", "Statut", "Stock/Seuil", "Appro.", "Coût/j"]],
      body: filtered.map((e) => [
        e.nom,
        e.type,
        e.numeroSerie,
        e?.projet?.nom || "—",
        statutLabel[e.statut] || e.statut,
        `${e.stock ?? 0}/${e.seuil ?? 0}`,
        formatDate(e.dateProchainApprovisionnement),
        money(e.coutParJour),
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [67, 97, 238] },
    });
    doc.save("equipements.pdf");
  };

  return (
    <div className="space-y-6">
      <PageMeta title="Équipements — TrackPro" description="Gestion des équipements et stocks" />

      {/* Header + Stat cards */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">🔧 Équipements</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Suivez l’état, le stock et les coûts d’utilisation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportToExcel}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/5"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16v4H4zM4 10h16v10H4z" /></svg>
              Excel
            </button>
            <button
              onClick={exportToPDF}
              className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 text-sm text-white hover:bg-rose-600"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="currentColor"><path d="M6 2h9l5 5v15H6zM15 2v5h5" /></svg>
              PDF
            </button>
            <button
              onClick={() => navigate("/equipements/new")}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm text-white shadow-theme-xs hover:bg-brand-600"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="currentColor"><path d="M11 11V6h2v5h5v2h-5v5h-2v-5H6v-2z" /></svg>
              Nouvel équipement
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total équipements" value={equipements.length} />
          <StatCard title="Alertes stock" value={alertsCount} tone="warning" />
          <StatCard title="Appro. proche (≤7j)" value={approProche} tone="info" />
          <StatCard title="Coût total estimé" value={money(costTotal)} tone="success" />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Rechercher nom, type, N° série, projet…"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 pl-10 text-sm outline-none shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2">
            <Magnifier />
          </span>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            {filtered.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500 dark:text-gray-400">Filtrer statut</label>
          <select
            value={statutFilter}
            onChange={(e) => {
              setStatutFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 dark:text-white/90"
          >
            <option value="ALL">Tous</option>
            <option value="DISPONIBLE">{statutLabel.DISPONIBLE}</option>
            <option value="EN_UTILISATION">{statutLabel.EN_UTILISATION}</option>
            <option value="EN_PANNE">{statutLabel.EN_PANNE}</option>
            <option value="MAINTENANCE">{statutLabel.MAINTENANCE}</option>
          </select>

          <label className="ml-3 text-sm text-gray-500 dark:text-gray-400">Lignes / page</label>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(1);
            }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 dark:text-white/90"
          >
            {[5, 10, 25].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="sticky top-0 z-10 bg-gray-50/80 text-xs uppercase text-gray-500 backdrop-blur dark:bg-white/5 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3 font-medium">Équipement</th>
                <th className="px-6 py-3 font-medium">Projet</th>
                <th className="px-6 py-3 font-medium">Stock</th>
                <th className="px-6 py-3 font-medium">Approvisionnement</th>
                <th className="px-6 py-3 font-medium">Coûts</th>
                <th className="px-6 py-3 font-medium">Statut</th>
                <th className="px-6 py-3 text-center font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-4 w-48 animate-pulse rounded bg-gray-100 dark:bg-white/5" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-32 animate-pulse rounded bg-gray-100 dark:bg-white/5" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-28 animate-pulse rounded bg-gray-100 dark:bg-white/5" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 animate-pulse rounded bg-gray-100 dark:bg-white/5" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 animate-pulse rounded bg-gray-100 dark:bg-white/5" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-20 animate-pulse rounded bg-gray-100 dark:bg-white/5" /></td>
                    <td className="px-6 py-4"><div className="mx-auto h-8 w-28 animate-pulse rounded bg-gray-100 dark:bg-white/5" /></td>
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12">
                    <div className="flex flex-col items-center justify-center gap-3 text-center">
                      <div className="size-12 rounded-full bg-gray-100 dark:bg-white/5" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">Aucun équipement trouvé.</p>
                      <button
                        onClick={() => navigate("/equipements/new")}
                        className="rounded-lg bg-brand-500 px-4 py-2 text-sm text-white hover:bg-brand-600"
                      >
                        Créer un équipement
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((e) => {
                  const below = Number(e.stock) < Number(e.seuil);
                  const ratio = (() => {
                    const s = Number(e.stock) || 0;
                    const th = Number(e.seuil) || 0;
                    if (s <= 0 && th <= 0) return 0;
                    if (th <= 0) return 1;
                    return Math.min(1, s / th);
                  })();
                  const coutTotal = (Number(e.coutParJour) || 0) * (Number(e.joursUtilisation) || 0);

                  return (
                    <tr key={e.id} className="transition-colors hover:bg-gray-50/60 dark:hover:bg-white/5">
                      {/* Équipement */}
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800 dark:text-white/90">{e.nom}</div>
                        <div className="text-xs text-gray-400">
                          {e.type || "—"} • N° {e.numeroSerie}
                        </div>
                      </td>

                      {/* Projet */}
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                        <button
                          className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                          onClick={() => e?.projet?.id && navigate(`/projects/${e.projet.id}`)}
                          disabled={!e?.projet?.id}
                        >
                          {e?.projet?.nom || "—"}
                        </button>
                      </td>

                      {/* Stock */}
                      <td className="px-6 py-4">
                        <div className="mb-1 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <span className={`${below ? "text-rose-600 dark:text-rose-400" : ""}`}>
                            {e.stock ?? 0}
                          </span>
                          <span className="text-gray-400">/ {e.seuil ?? 0}</span>
                          {below && (
                            <span className="ml-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                              Alerte
                            </span>
                          )}
                        </div>
                        <div className="h-2 w-40 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                          <div
                            className={`h-2 rounded-full ${below ? "bg-rose-500" : "bg-emerald-500"}`}
                            style={{ width: `${ratio * 100}%` }}
                          />
                        </div>
                      </td>

                      {/* Approvisionnement */}
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        <div>{formatDate(e.dateProchainApprovisionnement)}</div>
                        <div className="text-xs text-gray-400">{relativeInDays(e.dateProchainApprovisionnement)}</div>
                      </td>

                      {/* Coûts */}
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        <div>{money(e.coutParJour)} / jour</div>
                        <div className="text-xs text-gray-400">
                          {e.joursUtilisation ?? 0} j • {money(coutTotal)}
                        </div>
                      </td>

                      {/* Statut */}
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-lg px-2.5 py-1 text-xs ${
                            statutClass[e.statut] ||
                            "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-white/80"
                          }`}
                        >
                          {statutLabel[e.statut] || e.statut}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="relative flex items-center justify-center">
                          <button
                            onClick={() => setMenuOpenId((id) => (id === e.id ? null : e.id))}
                            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs hover:bg-gray-50 dark:border-gray-800 dark:text-white/90 dark:hover:bg-white/10"
                          >
                            •••
                          </button>

                          {menuOpenId === e.id && (
                            <div
                              className="absolute right-0 top-9 z-20 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-900"
                              onMouseLeave={() => setMenuOpenId(null)}
                            >
                              <button
                                onClick={() => navigate(`/equipements/${e.id}`)}
                                className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-white/5"
                              >
                                Voir détails
                              </button>
                              <button
                                onClick={() => navigate(`/equipements/edit/${e.id}`)}
                                className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-white/5"
                              >
                                Éditer
                              </button>

                              <div className="my-1 h-px bg-gray-100 dark:bg-gray-800" />

                              <button
                                onClick={() => changeStatut(e, "EN_UTILISATION")}
                                className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-white/5"
                              >
                                Marquer « En utilisation »
                              </button>
                              <button
                                onClick={() => changeStatut(e, "MAINTENANCE")}
                                className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-white/5"
                              >
                                Marquer « Maintenance »
                              </button>
                              <button
                                onClick={() => changeStatut(e, "EN_PANNE")}
                                className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-white/5"
                              >
                                Marquer « En panne »
                              </button>

                              <div className="my-1 h-px bg-gray-100 dark:bg-gray-800" />

                              <button
                                onClick={() => askDelete(e)}
                                className="block w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                              >
                                Supprimer
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-sm dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Page {page} / {totalPages} — {filtered.length} équipements
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-gray-200 px-3 py-1 disabled:opacity-50 dark:border-gray-800"
            >
              Précédent
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-gray-200 px-3 py-1 disabled:opacity-50 dark:border-gray-800"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>

      {/* Delete modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
              Confirmer la suppression
            </h3>
            <p className="mb-5 text-sm text-gray-600 dark:text-gray-400">
              Supprimer{" "}
              <span className="font-medium text-gray-900 dark:text-white/90">
                {eqToDelete?.nom}
              </span>{" "}
              ?
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
    </div>
  );
}

/* ---------- Sous-composant ---------- */
function StatCard({ title, value, tone = "default" }) {
  const toneClass =
    tone === "success"
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
      : tone === "warning"
      ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
      : tone === "info"
      ? "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300"
      : "bg-gray-50 text-gray-700 dark:bg-white/5 dark:text-white/80";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <div className="mt-2 inline-flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${toneClass}`}>Live</span>
      </div>
    </div>
  );
}
