import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../../components/common/PageMeta";
import { getUsers, toggleUserStatus, deleteUser } from "../../../api/users";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";

/* ---------- Helpers UI ---------- */
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const roleLabel = {
  ADMIN: "Administrateur",
  CHEF_PROJET: "Chef de projet",
  MEMBRE_EQUIPE: "Membre de l’équipe",
  GESTIONNAIRE_RESSOURCES: "Gestionnaire de ressources",
};

const roleClass = {
  ADMIN:
    "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/10 dark:text-fuchsia-300",
  CHEF_PROJET:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  MEMBRE_EQUIPE:
    "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
  GESTIONNAIRE_RESSOURCES:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
};

const initials = (nom, prenom) =>
  [prenom?.[0], nom?.[0]].filter(Boolean).join("").toUpperCase() || "U";

const Magnifier = () => (
  <svg viewBox="0 0 24 24" className="size-4 text-gray-400">
    <path
      fill="currentColor"
      d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5m-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14Z"
    />
  </svg>
);

export default function UsersList() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [loading, setLoading] = useState(true);

  // pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // actions
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim().toLowerCase()), 200);
    return () => clearTimeout(t);
  }, [query]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getUsers();
      setUsers(res.data || []);
    } catch {
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!debounced) return users;
    return users.filter((u) => {
      const full = `${u.nom || ""} ${u.prenom || ""}`.toLowerCase();
      return (
        full.includes(debounced) ||
        (u.email || "").toLowerCase().includes(debounced) ||
        (roleLabel[u.role] || u.role || "").toLowerCase().includes(debounced)
      );
    });
  }, [debounced, users]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const handleToggle = async (user) => {
    try {
      await toggleUserStatus(user.id, !user.isActive);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, isActive: !user.isActive } : u
        )
      );
      toast.success(
        `Utilisateur ${user.email} ${user.isActive ? "désactivé" : "activé"} ✅`
      );
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const askDelete = (u) => {
    setUserToDelete(u);
    setConfirmOpen(true);
    setMenuOpenId(null);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete.id);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      toast.success("Utilisateur supprimé ✅");
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setConfirmOpen(false);
      setUserToDelete(null);
    }
  };

  const exportToExcel = () => {
    const data = filtered.map((u) => ({
      Nom: u.nom,
      Prénom: u.prenom,
      Email: u.email,
      Rôle: roleLabel[u.role] || u.role,
      Statut: u.isActive ? "Actif" : "Inactif",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Utilisateurs");
    XLSX.writeFile(wb, "utilisateurs.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Nom", "Prénom", "Email", "Rôle", "Statut"]],
      body: filtered.map((u) => [
        u.nom,
        u.prenom,
        u.email,
        (roleLabel[u.role] || u.role || "").toString(),
        u.isActive ? "Actif" : "Inactif",
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [67, 97, 238] },
    });
    doc.save("utilisateurs.pdf");
  };

  return (
    <div className="space-y-6">
      <PageMeta title="Utilisateurs — TrackPro" description="Liste des utilisateurs" />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            👥 Utilisateurs
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gérez les comptes, rôles et statuts.
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
            onClick={() => navigate("/users/new")}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm text-white shadow-theme-xs hover:bg-brand-600"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11 11V6h2v5h5v2h-5v5h-2v-5H6v-2z" />
            </svg>
            Nouvel utilisateur
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
            placeholder="Rechercher nom, email, rôle…"
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
                <th className="px-6 py-3 font-medium">Utilisateur</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Rôle</th>
                <th className="px-6 py-3 font-medium">Statut</th>
                <th className="px-6 py-3 text-center font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 animate-pulse rounded-full bg-gray-100 dark:bg-white/5" />
                        <div className="h-4 w-40 animate-pulse rounded bg-gray-100 dark:bg-white/5" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-48 animate-pulse rounded bg-gray-100 dark:bg-white/5" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-5 w-24 animate-pulse rounded bg-gray-100 dark:bg-white/5" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-5 w-16 animate-pulse rounded bg-gray-100 dark:bg-white/5" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="mx-auto h-8 w-28 animate-pulse rounded bg-gray-100 dark:bg-white/5" />
                    </td>
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12">
                    <div className="flex flex-col items-center justify-center gap-3 text-center">
                      <div className="size-12 rounded-full bg-gray-100 dark:bg-white/5" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Aucun utilisateur trouvé.
                      </p>
                      <button
                        onClick={() => navigate("/users/new")}
                        className="rounded-lg bg-brand-500 px-4 py-2 text-sm text-white hover:bg-brand-600"
                      >
                        Créer un utilisateur
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((u) => (
                  <tr
                    key={u.id}
                    className="transition-colors hover:bg-gray-50/60 dark:hover:bg-white/5"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {u.photoUrl ? (
                          <img
                            src={`${BACKEND_URL}${u.photoUrl}`}
                            alt="avatar"
                            className="size-10 rounded-full object-cover ring-1 ring-gray-200 dark:ring-gray-800"
                          />
                        ) : (
                          <div className="flex size-10 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600 ring-1 ring-gray-200 dark:bg-white/10 dark:text-white/70 dark:ring-gray-800">
                            {initials(u.nom, u.prenom)}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-800 dark:text-white/90">
                            {u.nom} {u.prenom}
                          </div>
                          <div className="text-xs text-gray-400">ID: {u.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      <span className="inline-flex items-center gap-1">
                        <span
                          className={`size-2 rounded-full ${
                            u.isActive ? "bg-emerald-500" : "bg-gray-400 dark:bg-white/30"
                          }`}
                        />
                        {u.email}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-lg px-2.5 py-1 text-xs ${
                          roleClass[u.role] ||
                          "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-white/80"
                        }`}
                      >
                        {roleLabel[u.role] || u.role}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="relative inline-flex items-center">
                        <input
                          type="checkbox"
                          id={`toggle-${u.id}`}
                          className="peer sr-only"
                          checked={!!u.isActive}
                          onChange={() => handleToggle(u)}
                        />
                        <label
                          htmlFor={`toggle-${u.id}`}
                          className="block h-6 w-11 cursor-pointer rounded-full bg-gray-200 transition-colors peer-checked:bg-emerald-500 dark:bg-gray-700"
                        />
                        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="relative flex items-center justify-center">
                        <button
                          onClick={() =>
                            setMenuOpenId((id) => (id === u.id ? null : u.id))
                          }
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs hover:bg-gray-50 dark:border-gray-800 dark:text-white/90 dark:hover:bg-white/10"
                        >
                          •••
                        </button>

                        {menuOpenId === u.id && (
                          <div
                            className="absolute right-0 top-9 z-20 w-40 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-900"
                            onMouseLeave={() => setMenuOpenId(null)}
                          >
                            <button
                              onClick={() => navigate(`/admin/users/edit/${u.id}`)}
                              className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-white/5"
                            >
                              Éditer
                            </button>
                            <button
                              onClick={() => askDelete(u)}
                              className="block w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                            >
                              Supprimer
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-sm dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Page {page} / {totalPages} — {filtered.length} utilisateurs
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
                {userToDelete?.nom} {userToDelete?.prenom}
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
