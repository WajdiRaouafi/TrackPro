// components/common/NotificationDropdown.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { getEquipementsNotifications } from "../../api/equipements";
import { toast } from "react-toastify";

// Helpers
function timeLabel(days?: number) {
  if (days === undefined || days === null) return "—";
  if (days === 0) return "aujourd’hui";
  if (days > 0) return `dans ${days} j`;
  return `il y a ${Math.abs(days)} j`;
}

/** Types enrichis avec `message` */
type NotifBase = {
  id: number;
  nom: string;
  createdAt: string; // ISO
  message?: string;
};
type NotifStock = NotifBase & {
  type: "STOCK";
  stock: number;
  seuil: number;
};
type NotifAppro = NotifBase & {
  type: "APPRO";
  dateProchainApprovisionnement?: string;
  joursRestants?: number;
};
type Notif = NotifStock | NotifAppro;

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(false);

  // “Non lus” (badge rouge) = nouvelles notifs depuis le dernier check
  const [hasUnread, setHasUnread] = useState(false);

  // Pour éviter les toasts en double
  const seenIdsRef = useRef<Set<string>>(new Set());

  // Charge les notifs depuis l’API et fabrique une liste plate
  const fetchNotifs = async (showToasts = false) => {
    try {
      setLoading(true);
      // optionnel: fenêtre de 7 jours
      const res = await getEquipementsNotifications(7);

      // On suppose { alertesStock: [...], approvisionnementProche: [...] } avec `message`
      const stock = (res?.data?.alertesStock || []).map((a: any): Notif => ({
        type: "STOCK",
        id: a.id,
        nom: a.nom,
        stock: Number(a.stock ?? 0),
        seuil: Number(a.seuil ?? 0),
        createdAt: a.createdAt ?? new Date().toISOString(),
        message: a.message, // 👈 récupère le message du backend
      }));

      const appro = (res?.data?.approvisionnementProche || []).map(
        (a: any): Notif => ({
          type: "APPRO",
          id: a.id,
          nom: a.nom,
          dateProchainApprovisionnement: a.dateProchainApprovisionnement,
          joursRestants: a.joursRestants,
          createdAt: a.createdAt ?? new Date().toISOString(),
          message: a.message, // 👈 récupère le message du backend
        })
      );

      const list = [...stock, ...appro].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Détection des nouvelles (pour badge + toasts)
      const newOnes = list.filter(
        (n) => !seenIdsRef.current.has(`${n.type}-${n.id}`)
      );

      if (newOnes.length > 0) {
        setHasUnread(true);
        if (showToasts) {
          for (const n of newOnes) {
            const key = `${n.type}-${n.id}`;
            seenIdsRef.current.add(key);

            // Contenu toast en JSX pour inclure le message
            const content =
              n.type === "STOCK" ? (
                <div>
                  <div>
                    <strong>Stock bas</strong> • {n.nom}{" "}
                    (<strong>{(n as NotifStock).stock}</strong>/
                    {(n as NotifStock).seuil})
                  </div>
                  {n.message && (
                    <div style={{ fontSize: 12, opacity: 0.9 }}>{n.message}</div>
                  )}
                </div>
              ) : (
                <div>
                  <div>
                    <strong>Approvisionnement bientôt</strong> • {n.nom} (
                    {timeLabel((n as NotifAppro).joursRestants)})
                  </div>
                  {n.message && (
                    <div style={{ fontSize: 12, opacity: 0.9 }}>{n.message}</div>
                  )}
                </div>
              );

            if (n.type === "STOCK") {
              toast.warn(content, { icon: <span>⚠️</span> });
            } else {
              toast.info(content, { icon: <span>📦</span> });
            }
          }
        } else {
          // première charge: on marque juste comme “vus” sans toasts
          for (const n of newOnes) {
            seenIdsRef.current.add(`${n.type}-${n.id}`);
          }
        }
      }

      setNotifs(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // 1) Première charge (sans toasts)
  useEffect(() => {
    fetchNotifs(false);
  }, []);

  // 2) Polling toutes les 60s (avec toasts)
  useEffect(() => {
    const t = setInterval(() => fetchNotifs(true), 5000);
    return () => clearInterval(t);
  }, []);

  const onBellClick = () => {
    setIsOpen((v) => !v);
    // Ouvrir = on “lit”
    if (!isOpen) setHasUnread(false);
  };

  // On fabrique les items à rendre (on garde ta structure existante)
  const items = useMemo(() => {
    if (notifs.length === 0) return [];
    return notifs.map((n) => {
      if (n.type === "STOCK") {
        const s = n as NotifStock;
        return {
          key: `S-${s.id}`,
          title: `${s.nom}`,
          desc: `Stock bas: ${s.stock}/${s.seuil}`,
          message: n.message, // 👈 on transmet pour l’affichage
          meta: "Stock",
          to: `/equipements/${s.id}`,
          tone: "error" as const,
        };
      } else {
        const a = n as NotifAppro;
        return {
          key: `A-${a.id}`,
          title: `${a.nom}`,
          desc: `Approvisionnement ${timeLabel(a.joursRestants)}`,
          message: n.message, // 👈 on transmet pour l’affichage
          meta: "Approvisionnement",
          to: `/equipements/${a.id}`,
          tone: "info" as const,
        };
      }
    });
  }, [notifs]);

  return (
    <div className="relative">
      <button
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={onBellClick}
        aria-label="Notifications"
      >
        {/* Badge rouge */}
        {hasUnread && (
          <span className="absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
          </span>
        )}

        {/* Icône cloche */}
        <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notifications
          </h5>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 transition hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Fermer"
          >
            <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
              />
            </svg>
          </button>
        </div>

        <ul className="custom-scrollbar flex h-auto flex-col overflow-y-auto">
          {loading && (
            <li className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              Chargement…
            </li>
          )}

          {!loading && items.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Aucune notification
            </li>
          )}

          {!loading &&
            items.map((it) => (
              <li key={it.key}>
                <DropdownItem
                  onItemClick={() => setIsOpen(false)}
                  className="flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5"
                >
                  <span className="relative z-1 block h-10 w-full max-w-10 rounded-full">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-white ${
                        it.tone === "error"
                          ? "bg-rose-500"
                          : it.tone === "info"
                          ? "bg-sky-500"
                          : "bg-gray-400"
                      }`}
                    >
                      {it.tone === "error" ? "⚠️" : "📦"}
                    </div>
                  </span>

                  <span className="block">
                    {/* Titre + description */}
                    <span className="mb-1 block space-x-1 text-theme-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium text-gray-900 dark:text-white/90">
                        {it.title}
                      </span>
                      <span>— {it.desc}</span>
                    </span>

                    {/* 👇 Phrase courte (message) */}
                    {it.message && (
                      <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
                        {it.message}
                      </span>
                    )}

                    {/* Meta + lien */}
                    <span className="flex items-center gap-2 text-theme-xs text-gray-500 dark:text-gray-400">
                      <span>{it.meta}</span>
                      <span className="h-1 w-1 rounded-full bg-gray-400"></span>
                      <Link
                        to={it.to}
                        className="text-brand-600 hover:underline dark:text-brand-400"
                      >
                        Voir détail
                      </Link>
                    </span>
                  </span>
                </DropdownItem>
              </li>
            ))}
        </ul>

        {/* <Link
          to="/equipements"
          onClick={() => setIsOpen(false)}
          className="mt-3 block rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          Voir tous les équipements
        </Link> */}
      </Dropdown>
    </div>
  );
}
