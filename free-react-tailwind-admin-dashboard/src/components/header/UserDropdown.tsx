// src/components/header/UserDropdown.tsx
import { useEffect, useMemo, useState } from "react";
// import { Link } from "react-router";
import { useNavigate } from "react-router-dom";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";

const BACKEND_URL =
  (import.meta as any).env?.VITE_BACKEND_URL || "http://localhost:3000";

type LocalUser = {
  id?: number;
  nom?: string;
  prenom?: string;
  email?: string;
  photoUrl?: string; // ex: "/uploads/profile/xxx.jpg"
};

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<LocalUser | null>(null);
  const navigate = useNavigate();

  // charge / recharge l'utilisateur depuis localStorage
  useEffect(() => {
    const loadUser = () => {
      try {
        const raw = localStorage.getItem("user");
        setUser(raw ? JSON.parse(raw) : null);
      } catch {
        setUser(null);
      }
    };

    loadUser();

    // réagit aux changements faits dans d’autres onglets
    const onStorage = (e: StorageEvent) => {
      if (e.key === "user" || e.key === "token") loadUser();
    };

    // évènement custom déclenché après login / update profil
    const onUserUpdated = () => loadUser();

    window.addEventListener("storage", onStorage);
    window.addEventListener("user:updated", onUserUpdated);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("user:updated", onUserUpdated);
    };
  }, []);

  const displayName =
    [user?.prenom, user?.nom].filter(Boolean).join(" ") ||
    user?.email ||
    "Invité";

  const email = user?.email || "—";

  const avatarSrc = useMemo(() => {
    if (user?.photoUrl) {
      // garde propre l’URL: BACKEND_URL + /uploads/...
      const rel = user.photoUrl.startsWith("/") ? user.photoUrl : `/${user.photoUrl}`;
      return `${BACKEND_URL}${rel}`;
    }
    return "/images/user/user-01.png"; // fallback du thème
  }, [user?.photoUrl]);

  function toggleDropdown() {
    setIsOpen((v) => !v);
  }
  function closeDropdown() {
    setIsOpen(false);
  }

  function handleLogout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("chatbot_messages");
    window.dispatchEvent(new Event("user:updated"));
    closeDropdown();
    navigate("/signin");
  }

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dropdown-toggle dark:text-gray-400"
        aria-expanded={isOpen}
      >
        <span className="mr-3 overflow-hidden rounded-full h-11 w-11 ring-2 ring-gray-100 dark:ring-gray-800">
          <img
            src={avatarSrc}
            alt={displayName}
            className="h-full w-full object-cover"
          />
        </span>

        <span className="block mr-1 font-medium text-theme-sm truncate max-w-[120px]">
          {displayName}
        </span>

        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[280px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-800">
          <span className="overflow-hidden rounded-full h-10 w-10 ring-2 ring-gray-100 dark:ring-gray-800">
            <img
              src={avatarSrc}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          </span>
          <div className="min-w-0">
            <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-300 truncate">
              {displayName}
            </span>
            <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400 truncate">
              {email}
            </span>
          </div>
        </div>

        <ul className="flex flex-col gap-1 pt-3 pb-2">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              to="/profile"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              <svg
                className="fill-gray-500 group-hover:fill-gray-700 dark:fill-gray-400 dark:group-hover:fill-gray-300"
                width="20"
                height="20"
                viewBox="0 0 24 24"
              >
                <path d="M12 12.9c-2.7 0-4.9-2.2-4.9-4.9S9.3 3.1 12 3.1s4.9 2.2 4.9 4.9S14.7 12.9 12 12.9zm0 2.1c3.3 0 9.9 1.7 9.9 5v1H2.1v-1c0-3.3 6.6-5 9.9-5z" />
              </svg>
              Edit profile
            </DropdownItem>
          </li>

          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              to="/settings"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              <svg
                className="fill-gray-500 group-hover:fill-gray-700 dark:fill-gray-400 dark:group-hover:fill-gray-300"
                width="20"
                height="20"
                viewBox="0 0 24 24"
              >
                <path d="M19.4 13.5c.1-.5.1-1 .1-1.5s0-1-.1-1.5l2.1-1.6c.2-.2.3-.5.1-.8l-2-3.5c-.2-.3-.5-.4-.8-.3l-2.5 1c-.8-.6-1.6-1-2.6-1.3l-.4-2.7C13.3 0 13 0 12.7 0h-4c-.3 0-.6.2-.6.5l-.4 2.7c-.9.3-1.8.7-2.6 1.3l-2.5-1c-.3-.1-.6 0-.8.3l-2 3.5c-.2.3-.1.6.1.8l2.1 1.6c-.1.5-.1 1-.1 1.5s0 1 .1 1.5L.4 15.1c-.2.2-.3.5-.1.8l2 3.5c.2.3.5.4.8.3l2.5-1c.8.6 1.6 1 2.6 1.3l.4 2.7c0 .3.3.5.6.5h4c.3 0 .6-.2.6-.5l.4-2.7c.9-.3 1.8-.7 2.6-1.3l2.5 1c.3.1.6 0 .8-.3l2-3.5c.2-.3.1-.6-.1-.8l-2.1-1.6zM12 16c-2.2 0-4-1.8-4-4s1.8-4 4-4c2.3 0 4 1.8 4 4s-1.7 4-4 4z" />
              </svg>
              Account settings
            </DropdownItem>
          </li>
        </ul>

        <button
          onClick={handleLogout}
          className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left font-medium text-gray-700 text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
        >
          <svg
            className="fill-gray-500 group-hover:fill-gray-700 dark:group-hover:fill-gray-300"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path d="M16 13v-2H7V8l-5 4 5 4v-3h9zm3-11H9c-1.1 0-2 .9-2 2v4h2V4h10v16H9v-2H7v4c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
          </svg>
          Sign out
        </button>
      </Dropdown>
    </div>
  );
}
