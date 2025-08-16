import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import { getProjects } from "../../api/projects";
import { getUsers } from "../../api/users";
import { toast } from "react-toastify";

/* ---------- Helpers ---------- */
const role = () => localStorage.getItem("role");
const currentUser = () => {
  try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
};

const Etat = {
  EN_ATTENTE: "EN_ATTENTE",
  EN_COURS: "EN_COURS",
  TERMINE: "TERMINE",
};

const etatLabel = {
  EN_ATTENTE: "En attente",
  EN_COURS: "En cours",
  TERMINE: "Terminé",
};

const stateBadgeClass =
  (e) =>
    ({
      EN_ATTENTE:
        "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
      EN_COURS:
        "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
      TERMINE:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    }[e] ||
    "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-white/80");

const safeNumber = (v) => {
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

const fmtMoney = (n) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "TND", maximumFractionDigits: 2 }).format(n);

/* ---------- Page ---------- */
export default function Dashboard() {
  const navigate = useNavigate();

  const me = useMemo(currentUser, []);
  const r = useMemo(role, []);
  const isAdmin = r === "ADMIN";
  const isChef = r === "CHEF_PROJET";

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [userStats, setUserStats] = useState({ total: 0, actifs: 0 });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const pRes = await getProjects();
        let list = pRes.data || [];
        if (isChef && me?.id) {
          list = list.filter((pr) => pr?.chefProjet?.id === me.id);
        }
        setProjects(list);

        if (isAdmin) {
          const uRes = await getUsers();
          const all = uRes.data || [];
          setUserStats({
            total: all.length,
            actifs: all.filter((x) => x?.isActive).length,
          });
        }
      } catch (e) {
        console.error(e);
        toast.error("Erreur lors du chargement du tableau de bord");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, isChef]);

  /* ---------- Stats projets ---------- */
  const total = projects.length;
  const nbAttente = projects.filter((p) => p.etat === Etat.EN_ATTENTE).length;
  const nbCours = projects.filter((p) => p.etat === Etat.EN_COURS).length;
  const nbTermine = projects.filter((p) => p.etat === Etat.TERMINE).length;

  const budgetTotal = projects.reduce((acc, p) => acc + safeNumber(p.budget), 0);

  const nextDeadlines = useMemo(() => {
    return [...projects]
      .filter((p) => p?.dateFin)
      .sort((a, b) => new Date(a.dateFin) - new Date(b.dateFin))
      .slice(0, 5);
  }, [projects]);

  /* ---------- Donut (CSS) ---------- */
  const pct = {
    attente: total ? Math.round((nbAttente / total) * 100) : 0,
    cours: total ? Math.round((nbCours / total) * 100) : 0,
    termine: total ? Math.round((nbTermine / total) * 100) : 0,
  };
  const donutStyle = {
    background: `conic-gradient(
      rgb(250, 204, 21) 0 ${pct.attente}%,
      rgb(56, 189, 248) ${pct.attente}% ${pct.attente + pct.cours}%,
      rgb(16, 185, 129) ${pct.attente + pct.cours}% 100%
    )`,
  };

  return (
    <>
      <PageMeta title="Dashboard — TrackPro" />

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
            Tableau de bord
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Vue d’ensemble de vos projets {isAdmin ? "et utilisateurs" : ""}.
          </p>
        </div>

        {(isAdmin || isChef) && (
          <button
            onClick={() => navigate("/admin/projects/new")}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="currentColor"><path d="M11 11V6h2v5h5v2h-5v5h-2v-5H6v-2z" /></svg>
            Nouveau projet
          </button>
        )}
      </div>

      {/* KPI Row */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Projets totaux"
          value={total}
          icon={<CircleIcon />}
        />
        <KpiCard
          title="En cours"
          value={nbCours}
          accent="sky"
          icon={<PlayIcon />}
        />
        <KpiCard
          title="Terminés"
          value={nbTermine}
          accent="emerald"
          icon={<CheckIcon />}
        />
        <KpiCard
          title="Budget total"
          value={fmtMoney(budgetTotal)}
          accent="brand"
          icon={<MoneyIcon />}
        />
      </div>

      {/* Charts / Insights */}
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        {/* Donut état */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-800 dark:text-white/90">
              Répartition des projets
            </h3>
            <span className="text-xs text-gray-400">{total} projets</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative size-28 shrink-0">
              <div className="size-28 rounded-full" style={donutStyle} />
              <div className="absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white dark:bg-gray-900 ring-8 ring-white dark:ring-gray-900" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Terminé</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-white/90">{pct.termine}%</p>
              </div>
            </div>

            <ul className="grid flex-1 grid-cols-2 gap-3 text-sm">
              <Legend color="bg-amber-400" label="En attente" value={`${pct.attente}%`} />
              <Legend color="bg-sky-400" label="En cours" value={`${pct.cours}%`} />
              <Legend color="bg-emerald-500" label="Terminé" value={`${pct.termine}%`} />
              <Legend color="bg-gray-300 dark:bg-white/20" label="Total" value={total} />
            </ul>
          </div>
        </div>

        {/* Prochains jalons */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-800 dark:text-white/90">
              Prochains jalons (date fin)
            </h3>
            <button
              onClick={() => navigate("/admin/projects")}
              className="text-xs text-brand-600 hover:underline dark:text-brand-400"
            >
              Voir tout
            </button>
          </div>

          {nextDeadlines.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Aucun jalon à venir.</p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {nextDeadlines.map((p) => (
                <li
                  key={p.id}
                  className="py-3 hover:bg-gray-50/60 dark:hover:bg-white/5 rounded-lg px-2 -mx-2 cursor-pointer"
                  onClick={() => navigate(`/admin/projects/${p.id}`)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                        {p.nom}
                      </p>
                      <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                        Chef : {p?.chefProjet?.email || "—"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center rounded-lg px-2 py-1 text-xs ${stateBadgeClass(p.etat)}`}>
                        {etatLabel[p.etat] || p.etat}
                      </span>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {p.dateFin ? new Date(p.dateFin).toLocaleDateString("fr-FR") : "—"}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Bloc utilisateurs (admin) */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-800 dark:text-white/90">
              Utilisateurs
            </h3>
            {isAdmin && (
              <button
                onClick={() => navigate("/admin/users")}
                className="text-xs text-brand-600 hover:underline dark:text-brand-400"
              >
                Gérer
              </button>
            )}
          </div>

          {isAdmin ? (
            <div className="grid grid-cols-2 gap-4">
              <MiniStat label="Total" value={userStats.total} />
              <MiniStat label="Actifs" value={userStats.actifs} />
              <div className="col-span-2">
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800">
                  <div
                    className="h-2 rounded-full bg-emerald-500"
                    style={{
                      width: `${
                        userStats.total
                          ? Math.min(100, Math.round((userStats.actifs / userStats.total) * 100))
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Taux d’activation :{" "}
                  <span className="font-medium text-gray-700 dark:text-white/90">
                    {userStats.total
                      ? Math.round((userStats.actifs / userStats.total) * 100)
                      : 0}
                    %
                  </span>
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Accès limité aux projets où vous êtes Chef de projet.
            </p>
          )}
        </div>
      </div>

      {/* Liste cartes projets */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-800 dark:text-white/90">Projets</h3>
        <span className="text-xs text-gray-400">{total} items</span>
      </div>

      {loading ? (
        <ProjectsSkeleton />
      ) : total === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-500 dark:border-gray-800">
          Aucun projet à afficher.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => (
            <article
              key={p.id}
              onClick={() => navigate(`/admin/projects/${p.id}`)}
              className="cursor-pointer rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs transition hover:shadow-theme-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                  {p.nom}
                </h4>
                <span className={`shrink-0 rounded-lg px-2 py-1 text-xs ${stateBadgeClass(p.etat)}`}>
                  {etatLabel[p.etat] || p.etat}
                </span>
              </div>

              {p.description && (
                <p className="mb-3 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                  {p.description}
                </p>
              )}

              <ul className="mb-4 space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Chef</span>
                  <span className="font-medium">{p?.chefProjet?.email || "—"}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Budget</span>
                  <span className="font-medium">{fmtMoney(safeNumber(p.budget))}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Échéance</span>
                  <span className="font-medium">
                    {p.dateFin ? new Date(p.dateFin).toLocaleDateString("fr-FR") : "—"}
                  </span>
                </li>
                {Array.isArray(p.tasks) && (
                  <li className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Tâches</span>
                    <span className="font-medium">{p.tasks.length}</span>
                  </li>
                )}
              </ul>

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/admin/projects/${p.id}`);
                  }}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/10"
                >
                  Détails
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/admin/projects/edit/${p.id}`);
                  }}
                  className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs text-white shadow-theme-xs hover:bg-brand-600"
                >
                  Éditer
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

/* ---------- Small components ---------- */
function KpiCard({ title, value, icon, accent = "gray" }) {
  const ring =
    accent === "brand"
      ? "ring-brand-100 bg-brand-50 text-brand-600 dark:text-brand-400"
      : accent === "sky"
      ? "ring-sky-100 bg-sky-50 text-sky-600 dark:text-sky-300"
      : accent === "emerald"
      ? "ring-emerald-100 bg-emerald-50 text-emerald-600 dark:text-emerald-300"
      : "ring-gray-100 bg-gray-50 text-gray-600 dark:text-gray-300";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3 inline-flex size-9 items-center justify-center rounded-full ring-8 dark:ring-gray-900 ring-gray-50">
        <div className={`inline-flex size-9 items-center justify-center rounded-full ${ring}`}>
          <span className="scale-90">{icon}</span>
        </div>
      </div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

function Legend({ color, label, value }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-3 py-2 dark:border-gray-800">
      <div className="flex items-center gap-2">
        <span className={`inline-block size-2 rounded-full ${color}`} />
        <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      </div>
      <span className="text-xs font-medium text-gray-800 dark:text-white/90">{value}</span>
    </li>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-gray-800 dark:text-white/90">{value}</p>
    </div>
  );
}

function ProjectsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-40 animate-pulse rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-800/40"
        />
      ))}
    </div>
  );
}

/* ---------- Icons (inline SVG) ---------- */
function CircleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5">
      <circle cx="12" cy="12" r="9" fill="currentColor" />
    </svg>
  );
}
function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5">
      <path d="M8 5v14l11-7z" fill="currentColor" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5">
      <path d="M9 16.17l-3.88-3.88L4 13.41 9 18.41 20.59 6.83 19.17 5.41z" fill="currentColor" />
    </svg>
  );
}
function MoneyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5">
      <path d="M3 6h18v12H3zM7 10h5m-5 4h10" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}
