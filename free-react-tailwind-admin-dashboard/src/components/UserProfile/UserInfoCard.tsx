// src/components/UserProfile/UserInfoCard.tsx
import { useEffect, useState } from "react";

const roleLabel = (r?: string) =>
  r === "ADMIN"
    ? "Administrateur"
    : r === "CHEF_PROJET"
    ? "Chef de projet"
    : r === "GESTIONNAIRE_RESSOURCES"
    ? "Gestionnaire de ressources"
    : "Membre d’équipe";

export default function UserInfoCard() {
  const [me, setMe] = useState<any>(null);

  useEffect(() => {
    const load = () => {
      const raw = localStorage.getItem("user");
      setMe(raw ? JSON.parse(raw) : null);
    };
    load();
    const onUpdated = () => load();
    window.addEventListener("user:updated", onUpdated);
    return () => window.removeEventListener("user:updated", onUpdated);
  }, []);

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Personal Information
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">First Name</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {me?.prenom || "—"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Last Name</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {me?.nom || "—"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Email</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90 break-all">
                {me?.email || "—"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Phone</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {me?.telephone || "—"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Role</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {roleLabel(me?.role)}
              </p>
            </div>
          </div>
        </div>

        {/* bouton “Edit” retiré ici pour éviter les doublons d’UI (édition dans UserMetaCard) */}
      </div>
    </div>
  );
}
