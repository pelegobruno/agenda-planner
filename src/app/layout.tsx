import "./globals.css";
import Image from "next/image";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        {/* ================= CABEÇALHO ================= */}
        <header className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-5">

            {/* GRID PARA CENTRALIZAÇÃO REAL */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-center">

              {/* LOGO ESQUERDA */}
              <div className="flex justify-start">
                <Image
                  src="/logo-esquerda.png"
                  alt="Logo CERTA"
                  width={120}
                  height={44}
                  priority
                  className="object-contain"
                />
              </div>

              {/* TÍTULO CENTRAL */}
              <div className="text-center">
                <h1 className="text-2xl sm:text-3xl">
                CERTA
                </h1>
                <p className="text-xs text-gray-500 uppercase tracking-[0.3em] mt-1">
                  Centro de Referência do Transtorno Autista
                </p>
              </div>

              {/* LOGO DIREITA */}
              <div className="flex justify-end">
                <Image
                  src="/logo-direita.png"
                  alt="Sistema de Saúde Vila Nova"
                  width={120}
                  height={44}
                  priority
                  className="object-contain"
                />
              </div>

            </div>

            {/* MENU */}
            <nav className="mt-6 flex justify-center gap-6 text-sm font-medium text-gray-700">
              <a className="hover:text-blue-600" href="/agenda">
                Agenda Geral
              </a>
              <a className="hover:text-blue-600" href="/chamada">
                Chamada do Dia
              </a>
              <a className="hover:text-blue-600" href="/planner">
                Planner Mensal
              </a>
              <a className="hover:text-blue-600" href="/treinamentos">
                Treinamentos
              </a>
            </nav>

          </div>
        </header>

        {/* ================= CONTEÚDO ================= */}
        <main className="max-w-6xl mx-auto px-4 py-10">
          {children}
        </main>
      </body>
    </html>
  );
}
