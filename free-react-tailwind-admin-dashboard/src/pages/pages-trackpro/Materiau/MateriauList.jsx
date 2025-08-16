// src/pages/pages-trackpro/Materiau/MateriauList.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import {
  getMateriaux,
  deleteMateriau,
} from "../../../api/materiaux";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";

/* ---------- Helpers ---------- */
const formatDate = (d) => (d ? new Date(d).toLocaleDateString("fr-FR") : "—");
const formatMoney = (n) => {
  const v = Number(n);
  if (Number.isNaN(v)) return "—";
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "TND",
      maximumFractionDigits: 2,
    }).format(v);
  } catch {
    return `${v.toFixed(2)} TND`;
  }
};

const stockBadge = (m) => {
  if ((m?.stock ?? 0) <= 0)
    return { label: "Rupture", cls: "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300" };
  if ((m?.stock ?? 0) < (m?.seuil ?? 0))
    return { label: "Sous seuil", cls: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300" };
  return { label: "OK", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" };
};

const Magnifier = () => (
  <svg viewBox="0 0 24 24" className="size-4 text-gray-400">
    <path
      fill="currentColor"
      d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5m-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14Z"
    />
  </svg>
);

export default function MateriauList() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [loading, setLoading] = useState(true);

  // pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // actions
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim().toLowerCase()), 200);
    return () => clearTimeout(t);
  }, [query]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getMateriaux();
      setItems(res.data || []);
    } catch {
      toast.error("Erreur lors du chargement des matériaux");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!debounced) return items;
    return items.filter((m) => {
      const base = `${m.nom || ""} ${m.type || ""}`.toLowerCase();
      const proj = (m.projet?.nom || "").toLowerCase();
      // const four =
        (m.fournisseur?.nom || m.fournisseur?.contact || "").toLowerCase();
      const status = stockBadge(m).label.toLowerCase();
      return (
        base.includes(debounced) ||
        proj.includes(debounced) ||
        four.includes(debounced) ||
        status.includes(debounced)
      );
    });
  }, [debounced, items]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const askDelete = (m) => {
    setToDelete(m);
    setConfirmOpen(true);
    setMenuOpenId(null);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteMateriau(toDelete.id);
      setItems((prev) => prev.filter((x) => x.id !== toDelete.id));
      toast.success("Matériau supprimé ✅");
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setConfirmOpen(false);
      setToDelete(null);
    }
  };

  const exportToExcel = () => {
    const data = filtered.map((m) => ({
      ID: m.id,
      Matériau: m.nom,
      Type: m.type,
      Stock: m.stock ?? 0,
      Seuil: m.seuil ?? 0,
      "Coût unitaire": Number(m.coutUnitaire) || 0,
      Projet: m.projet?.nom || "—",
      Fournisseur: m.fournisseur?.nom || m.fournisseur?.contact || "—",
      "Prochain appro.": formatDate(m.dateProchainApprovisionnement),
      "Commande envoyée": m.commandeEnvoyee ? "Oui" : "Non",
      Statut: stockBadge(m).label,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Matériaux");
    XLSX.writeFile(wb, "materiaux.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        [
          "Matériau",
          "Type",
          "Stock/Seuil",
          "Coût",
          "Projet",
          "Fournisseur",
          "Appro.",
          "Statut",
        ],
      ],
      body: filtered.map((m) => [
        m.nom,
        m.type,
        `${m.stock ?? 0}/${m.seuil ?? 0}`,
        formatMoney(m.coutUnitaire),
        m.projet?.nom || "—",
        m.fournisseur?.nom || m.fournisseur?.contact || "—",
        formatDate(m.dateProchainApprovisionnement),
        stockBadge(m).label,
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [67, 97, 238] },
    });
    doc.save("materiaux.pdf");
  };

  return (
    <div className="space-y-6">
      <PageMeta
        title="Matériaux — TrackPro"
        description="Liste des matériaux"
      />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            🧱 Matériaux
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Suivez les stocks, seuils et fournisseurs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToExcel}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/5"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4h16v4H4zM4 10h16v10H4z" />
            </svg>
            Excel
          </button>
          <button
            onClick={exportToPDF}
            className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 text-sm text-white hover:bg-rose-600"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 2h9l5 5v15H6zM15 2v5h5" />
            </svg>
            PDF
          </button>
          <button
            onClick={() => navigate("/materiau/new")}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm text-white shadow-theme-xs hover:bg-brand-600"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11 11V6h2v5h5v2h-5v5h-2v-5H6v-2z" />
            </svg>
            Nouveau matériau
          </button>
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
            placeholder="Rechercher nom, type, projet, fournisseur…"
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
          <label className="text-sm text-gray-500 dark:text-gray-400">
            Lignes / page
          </label>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(1);
            }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 dark:text-white/90"
          >
            {[5, 10, 25].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
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
                <th className="px-6 py-3 font-medium">Matériau</th>
                <th className="px-6 py-3 font-medium">Projet</th>
                <th className="px-6 py-3 font-medium">Fournisseur</th>
                <th className="px-6 py-3 font-medium">Stock / Seuil</th>
                <th className="px-6 py-3 font-medium">Coût unitaire</th>
                <th className="px-6 py-3 font-medium">Prochain appro.</th>
                <th className="px-6 py-3 text-center font-medium">Actions</th>
              </tr>
            </thead>

            {/* 👇 Un SEUL tbody, avec les 3 états possibles */}
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <div className="h-4 w-40 animate-pulse rounded bg-gray-100 dark:bg-white/5" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-28 animate-pulse rounded bg-gray-100 dark:bg-white/5" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-32 animate-pulse rounded bg-gray-100 dark:bg-white/5" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-20 animate-pulse rounded bg-gray-100 dark:bg-white/5" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-20 animate-pulse rounded bg-gray-100 dark:bg-white/5" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-100 dark:bg-white/5" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="mx-auto h-8 w-28 animate-pulse rounded bg-gray-100 dark:bg-white/5" />
                    </td>
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12">
                    <div className="flex flex-col items-center justify-center gap-3 text-center">
                      <div className="size-12 rounded-full bg-gray-100 dark:bg-white/5" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Aucun matériau trouvé.
                      </p>
                      <button
                        onClick={() => navigate("/materiau/new")}
                        className="rounded-lg bg-brand-500 px-4 py-2 text-sm text-white hover:bg-brand-600"
                      >
                        Créer un matériau
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((m) => {
                  const s = stockBadge(m);
                  const approSoon =
                    m.dateProchainApprovisionnement &&
                    (new Date(m.dateProchainApprovisionnement) - new Date()) /
                      (1000 * 60 * 60 * 24) <=
                      7;

                  return (
                    <tr
                      key={m.id}
                      className="transition-colors hover:bg-gray-50/60 dark:hover:bg-white/5"
                    >
                      {/* Matériau */}
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800 dark:text-white/90">
                          {m.nom}
                        </div>
                        <div className="text-xs text-gray-400">
                          {m.type || "—"} • ID: {m.id}
                        </div>
                      </td>

                      {/* Projet */}
                      <td className="px-6 py-4">
                        {m.projet?.nom ? (
                          <span className="rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-white/10 dark:text-white/80">
                            {m.projet.nom}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>

                      {/* Fournisseur */}
                      <td className="px-6 py-4">
                        {m.fournisseur?.nom || m.fournisseur?.contact ? (
                          <div className="text-sm text-gray-800 dark:text-white/90">
                            {m.fournisseur?.nom || m.fournisseur?.contact}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>

                      {/* Stock / Seuil */}
                      <td className="px-6 py-4">
                        <div className="mb-1 text-sm text-gray-800 dark:text-white/90">
                          {m.stock ?? 0} / {m.seuil ?? 0}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-lg px-2.5 py-1 text-xs ${s.cls}`}
                          >
                            {s.label}
                          </span>
                          {m.commandeEnvoyee && (
                            <span className="rounded-lg bg-indigo-100 px-2.5 py-1 text-xs text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                              Cmd envoyée
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Coût unitaire */}
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                        {formatMoney(m.coutUnitaire)}
                      </td>

                      {/* Prochain approvisionnement */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-800 dark:text-white/90">
                          {formatDate(m.dateProchainApprovisionnement)}
                        </div>
                        {approSoon && (
                          <div className="mt-1 text-xs text-sky-500">
                            Approvisionnement proche
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="relative flex items-center justify-center">
                          <button
                            onClick={() =>
                              setMenuOpenId((id) => (id === m.id ? null : m.id))
                            }
                            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs hover:bg-gray-50 dark:border-gray-800 dark:text-white/90 dark:hover:bg-white/10"
                          >
                            •••
                          </button>

                          {menuOpenId === m.id && (
                            <div
                              className="absolute right-0 top-9 z-20 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-900"
                              onMouseLeave={() => setMenuOpenId(null)}
                            >
                              <button
                                onClick={() =>
                                  navigate(`/materiau/${m.id}`)
                                }
                                className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-white/5"
                              >
                                Voir détails
                              </button>
                              <button
                                onClick={() =>
                                  navigate(`/materiau/edit/${m.id}`)
                                }
                                className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-white/5"
                              >
                                Éditer
                              </button>
                              <button
                                onClick={() => askDelete(m)}
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
            Page {page} / {totalPages} — {filtered.length} matériaux
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
                {toDelete?.nom}
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
