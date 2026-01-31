export default function Home() {
  return (
    <section className="space-y-8">
      {/* TÍTULO */}
      <header>
        <h2 className="text-2xl font-bold text-gray-900">
          Painel inicial
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Acesso rápido às principais áreas do sistema
        </p>
      </header>

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        {/* AGENDA GERAL */}
        <a
          href="/agenda"
          className="group block rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 text-xl">
              📅
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700">
                Agenda Geral
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Visualize todos os atendimentos organizados por
                profissionais, datas e horários.
              </p>
            </div>
          </div>
        </a>

        {/* CHAMADA DO DIA */}
        <a
          href="/chamada"
          className="group block rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 text-xl">
              📋
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-700">
                Lista de Chamada
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Confira os pacientes previstos para o dia
                e realize o controle de presença.
              </p>
            </div>
          </div>
        </a>

      </div>
    </section>
  );
}
