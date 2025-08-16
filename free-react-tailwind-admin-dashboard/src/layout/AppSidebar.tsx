import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PlugInIcon,
  UserCircleIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  roles?: string[]; // ex: ["ADMIN", "CHEF_PROJET"]; si absent => visible pour tous
  subItems?: {
    name: string;
    path: string;
    roles?: string[];
    pro?: boolean;
    new?: boolean;
  }[];
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();

  // Rôle courant (stocké au login)
  const role = useMemo(
    () => (typeof window !== "undefined" ? localStorage.getItem("role") : null),
    []
  );
  const canSee = useCallback(
    (roles?: string[]) =>
      !roles || roles.length === 0 || roles.includes(role || ""),
    [role]
  );

  // ======= MENUS PRINCIPAUX (adaptés à ton projet) =======
  const navItems: NavItem[] = [
    { icon: <GridIcon />, name: "Dashboard", path: "/dashboard" },

    {
      icon: <ListIcon />,
      name: "Projets",
      subItems: [
        { name: "Tous les projets", path: "/admin/projects" },
        {
          name: "Nouveau projet",
          path: "/admin/projects/new",
          roles: ["ADMIN", "CHEF_PROJET"],
        },
      ],
    },
    {
      icon: <BoxCubeIcon />,
      name: "Équipements",
      subItems: [
        { name: "Tous les équipements", path: "/equipements" },
        {
          name: "Nouveau équipement",
          path: "/equipements/new",
          roles: ["ADMIN", "CHEF_PROJET"],
        },
      ],
    },
    {
      icon: <PlugInIcon />,
      name: "Matériaux",
      subItems: [
        { name: "Tous les matériaux", path: "/materiaux" },
        {
          name: "Nouveau matériau",
          path: "/materiau/new",
          roles: ["ADMIN", "CHEF_PROJET"],
        },
      ],
    },
     {
      icon: <PlugInIcon />,
      name: "Fournisseurs",
      subItems: [
        { name: "Tous les Fournisseurs", path: "/fournisseurs" },
        {
          name: "Nouveau fournisseur",
          path: "/fournisseur/new",
          roles: ["ADMIN", "CHEF_PROJET","GESTIONNAIRE_RESSOURCES"],
        },
      ],
    },
  
    {
      icon: <UserCircleIcon />,
      name: "Utilisateurs",
      roles: ["ADMIN"],
      subItems: [
        {
          name: "Tous les utilisateurs",
          path: "/admin/users",
          roles: ["ADMIN"],
        },
        { name: "Nouveau utilisateur", path: "/users/new", roles: ["ADMIN"] },
      ],
    },
    

    { icon: <CalenderIcon />, name: "Calendrier", path: "/calendar" },
    { icon: <PageIcon />, name: "Profil", path: "/profile" },
  ];

  // ======= SECTION "Others" (démo / optionnelle) =======
  const othersItems: NavItem[] = [
    // Laisse vide si tu ne veux pas afficher cette section.
    // Exemple de démos :
    // {
    //   icon: <TableIcon />,
    //   name: "Tables (demo)",
    //   subItems: [{ name: "Basic Tables", path: "/basic-tables" }],
    // },
    // {
    //   icon: <PieChartIcon />,
    //   name: "Charts (demo)",
    //   subItems: [
    //     { name: "Line Chart", path: "/line-chart" },
    //     { name: "Bar Chart", path: "/bar-chart" },
    //   ],
    // },
    // {
    //   icon: <PlugInIcon />,
    //   name: "Auth (demo)",
    //   subItems: [
    //     { name: "Sign In", path: "/signin" },
    //     { name: "Sign Up", path: "/signup" },
    //   ],
    // },
  ];

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  // Ouvrir automatiquement le sous-menu qui contient la route active
  useEffect(() => {
    let matched = false;
    [
      { type: "main" as const, items: navItems },
      { type: "others" as const, items: othersItems },
    ].forEach(({ type, items }) => {
      items.forEach((nav, index) => {
        if (nav.subItems?.some((s) => isActive(s.path))) {
          setOpenSubmenu({ type, index });
          matched = true;
        }
      });
    });
    if (!matched) setOpenSubmenu(null);
  }, [location, isActive]); // eslint-disable-line

  // Mesurer la hauteur du sous-menu pour animation
  useEffect(() => {
    if (openSubmenu) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      const el = subMenuRefs.current[key];
      setSubMenuHeight((h) => ({ ...h, [key]: el?.scrollHeight || 0 }));
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prev) =>
      prev && prev.type === menuType && prev.index === index
        ? null
        : { type: menuType, index }
    );
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("chatbot_messages");
    navigate("/signin");
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items
        .filter((nav) => canSee(nav.roles))
        .map((nav, index) => (
          <li key={`${menuType}-${nav.name}`}>
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`menu-item group ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-active"
                    : "menu-item-inactive"
                } ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-start"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDownIcon
                    className={`ml-auto h-5 w-5 transition-transform ${
                      openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                        ? "rotate-180 text-brand-500"
                        : ""
                    }`}
                  />
                )}
              </button>
            ) : (
              nav.path &&
              canSee(nav.roles) && (
                <Link
                  to={nav.path}
                  className={`menu-item group ${
                    isActive(nav.path)
                      ? "menu-item-active"
                      : "menu-item-inactive"
                  }`}
                >
                  <span
                    className={`menu-item-icon-size ${
                      isActive(nav.path)
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                </Link>
              )
            )}

            {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el: HTMLDivElement | null) => {
                  subMenuRefs.current[`${menuType}-${index}`] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height:
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? `${subMenuHeight[`${menuType}-${index}`]}px`
                      : "0px",
                }}
              >
                <ul className="ml-9 mt-2 space-y-1">
                  {nav.subItems
                    .filter((s) => canSee(s.roles))
                    .map((s) => (
                      <li key={s.path}>
                        <Link
                          to={s.path}
                          className={`menu-dropdown-item ${
                            isActive(s.path)
                              ? "menu-dropdown-item-active"
                              : "menu-dropdown-item-inactive"
                          }`}
                        >
                          {s.name}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </li>
        ))}
    </ul>
  );

  return (
    <aside
      className={`fixed top-0 left-0 z-50 h-screen border-r border-gray-200 bg-white text-gray-900 transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div
        className={`py-8 px-5 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                style={{ marginLeft: "20px" }}
                src="/images/logo/LogoTrackProBlanc2.svg"
                alt="Logo"
                width={200}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/LogoTrackProBlanc2.svg"
                style={{ marginLeft: "20px" }}
                alt="Logo"
                width={200}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>

      {/* Menu */}
      <div className="no-scrollbar flex flex-col overflow-y-auto px-5 pb-6">
        <h2
          className={`mb-4 flex text-xs uppercase text-gray-400 ${
            !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
        >
          {isExpanded || isHovered || isMobileOpen ? (
            "Menu"
          ) : (
            <HorizontaLDots className="size-6" />
          )}
        </h2>
        {renderMenuItems(navItems, "main")}

        {/* Others (optionnel) */}
        {othersItems.length > 0 && (
          <>
            <h2
              className={`mt-6 mb-4 flex text-xs uppercase text-gray-400 ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
              }`}
            >
              {isExpanded || isHovered || isMobileOpen ? (
                "Others"
              ) : (
                <HorizontaLDots />
              )}
            </h2>
            {renderMenuItems(othersItems, "others")}
          </>
        )}

        {/* Déconnexion */}
        <button
          onClick={logout}
          className="mt-6 w-full rounded-lg border border-gray-200 px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/5"
        >
          Se déconnecter
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
