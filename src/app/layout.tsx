/* eslint-disable @next/next/no-img-element */
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-100 text-gray-900">

        {/* ================= CABEÇALHO ================= */}
        <header className="bg-white shadow-sm">

          {/* LOGOS + TÍTULO */}
          <div className="max-w-7xl mx-auto px-6 py-4
                          grid grid-cols-[90px_1fr_90px] items-center">

            {/* LOGO ESQUERDA */}
            <img
              src="/logo-esquerda.png"
              alt="Logo CERTA"
              className="h-10 mx-auto"
            />

            {/* TÍTULO CENTRAL */}
            <div className="text-center leading-tight">
              <h1 className="text-2xl tracking-widest">
                CERTA
              </h1>
              <p className="text-xs uppercase text-gray-500 mt-1">
                Centro de Referência do Transtorno Autista
              </p>
            </div>

            {/* LOGO DIREITA */}
            <img
              src="/logo-direita.png"
              alt="Sistema de Saúde Vila Nova"
              className="h-10 mx-auto"
            />
          </div>

          {/* MENU */}
          <nav className="mt-4">
            <ul className="flex justify-center gap-6 text-sm font-medium">
              <li><a href="/agenda">Agenda Geral</a></li>
              <li><a href="/chamada">Chamada do Dia</a></li>
              <li><a href="/planner">Planner Mensal</a></li>
              <li><a href="/treinamentos">Treinamentos</a></li>
            </ul>
          </nav>

        </header>

        {/* ================= CONTEÚDO ================= */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>

      </body>
    </html>
  );
}
