/* eslint-disable @next/next/no-img-element */
import "./globals.css";
import Link from "next/link";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  const navItems = [
    { label: "Agenda Geral", href: "/agenda" },
    { label: "Chamada do Dia", href: "/chamada" },
    { label: "Planner Mensal", href: "/planner" },
    { label: "Treinamentos", href: "/treinamentos" },
  ];

  return (
    <html lang="pt-BR">
      <body className="bg-gray-50 text-gray-900 antialiased">
        
        {/* ================= CABEÇALHO ================= */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
          
          {/* LOGOS + TÍTULO */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between gap-6">
              
              {/* LOGO ESQUERDA */}
              <img
                src="/logo-esquerda.png"
                alt="CERTA"
                className="h-9 object-contain"
                width={72}
                height={36}
              />

              {/* TÍTULO */}
              <div className="flex-1 text-center leading-tight">
                <h1 className="text-lg sm:text-xl font-bold text-blue-900 tracking-wide">
                  CERTA
                </h1>
                <p className="text-[11px] sm:text-xs text-gray-600 uppercase tracking-wider">
                  Centro de Referência do Transtorno Autista
                </p>
              </div>

              {/* LOGO DIREITA */}
              <img
                src="/logo-direita.png"
                alt="Sistema de Saúde Vila Nova"
                className="h-9 object-contain"
                width={72}
                height={36}
              />
            </div>
          </div>

          {/* MENU */}
          <nav className="bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <ul className="flex flex-wrap justify-center gap-2 py-2">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="relative px-4 py-2 text-sm font-medium text-gray-700 rounded-md transition
                                 hover:text-blue-700 hover:bg-blue-50
                                 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </header>

        {/* ================= CONTEÚDO ================= */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 min-h-[calc(100vh-150px)]">
          {children}
        </main>
      </body>
    </html>
  );
}
