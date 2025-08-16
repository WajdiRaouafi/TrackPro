// src/pages/AuthPages/AuthLayout.tsx
import React from "react";
import GridShape from "../../components/common/GridShape";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";
import { Link } from "react-router-dom";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative z-1 bg-white p-6 dark:bg-gray-900 sm:p-0">
      <div className="relative flex h-screen w-full flex-col justify-center sm:p-0 lg:flex-row dark:bg-gray-900">
        {/* Colonne formulaire */}
        <div className="w-full lg:w-1/2">{children}</div>

        {/* Colonne droite (branding + contenu) */}
        <aside className="relative hidden h-full w-full place-items-center bg-brand-950/95 lg:grid dark:bg-white/5">
          {/* halos décoratifs */}
          <div className="pointer-events-none absolute -left-24 top-24 h-52 w-52 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 bottom-10 h-44 w-44 rounded-full bg-blue-400/20 blur-3xl" />

          <GridShape />

          <div className="relative z-10 mx-auto flex max-w-md flex-col items-center px-8 text-center">
            {/* Logo 100% CSS (pas d'image) */}
            <Link to="/" className="mb-6 inline-flex items-center gap-3">
              <span className="relative inline-flex size-10 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                {/* 3 barres */}
                <span className="absolute bottom-2 left-2 h-4 w-1.5 rounded bg-indigo-300" />
                <span className="absolute bottom-2 left-1/2 h-6 w-1.5 -translate-x-1/2 rounded bg-indigo-300" />
                <span className="absolute bottom-2 right-2 h-8 w-1.5 rounded bg-indigo-300" />
              </span>
              <span className="text-2xl font-semibold tracking-tight text-white">
                Track
                <span className="bg-gradient-to-r from-indigo-300 to-blue-300 bg-clip-text text-transparent">
                  Pro
                </span>
              </span>
              <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium ring-1 ring-white/15">
                v1.0
              </span>
            </Link>

            <h3 className="mb-2 text-xl font-semibold text-white">
              Suivez mieux. Livrez plus vite.
            </h3>
            <p className="mb-6 text-sm text-white/70">
              Gestion de projets, ressources et rapports — tout en un seul
              endroit.
            </p>

            <ul className="mb-8 w-full space-y-3 text-left">
              <Feature>Suivi en temps réel des projets et des tâches</Feature>
              <Feature>Assignation des ressources & disponibilité</Feature>
              <Feature>Exports PDF & Excel en un clic</Feature>
            </ul>

            {/* mini carte métrique */}
            <div className="w-full rounded-2xl bg-white/5 p-4 text-left ring-1 ring-white/10 backdrop-blur">
              <div className="mb-2 flex items-center justify-between text-white/80">
                <span className="text-xs">Projets actifs</span>
                <span className="text-xs text-emerald-300">+12% ce mois</span>
              </div>
              <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-indigo-400 to-blue-400" />
              </div>
              <p className="text-[12px] leading-5 text-white/80">
                “TrackPro nous a fait gagner du temps à chaque livraison.”
              </p>
            </div>
          </div>
        </aside>

        {/* Toggle thème */}
        <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex size-4 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300 ring-1 ring-emerald-300/20">
        <svg viewBox="0 0 20 20" className="size-3" fill="currentColor" aria-hidden="true">
          <path d="M8.5 13.3 5.7 10.5l-1.2 1.2L8.5 15.7l7-7-1.2-1.2z" />
        </svg>
      </span>
      <span className="text-sm text-white/90">{children}</span>
    </li>
  );
}
