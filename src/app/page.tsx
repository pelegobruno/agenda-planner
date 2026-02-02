export default function Home() {
  return (
    <section className="space-y-10">
      {/* CABEÇALHO */}
      <header className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold">
          Painel Inicial
        </h2>
        <p className="text-sm mt-2 text-gray-600">
          Acesso rápido às principais funcionalidades da Agenda CERTA
        </p>
      </header>

      {/* CARDS DE ACESSO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* AGENDA GERAL */}
        <a
          href="/agenda"
          className="group bg-white rounded-xl border border-gray-200 p-6 shadow-sm
                     hover:shadow-md hover:-translate-y-1 transition-all"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-blue-100 text-blue-700 text-xl">
              📅
            </div>
            <h3 className="text-lg font-semibold group-hover:text-blue-700">
              Agenda Geral
            </h3>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed">
            Visualize todos os atendimentos organizados por
            profissional, data e horário.
          </p>

          <p className="mt-4 text-sm font-medium text-blue-600">
            Acessar agenda →
          </p>
        </a>

        {/* LISTA DE CHAMADA */}
        <a
          href="/chamada"
          className="group bg-white rounded-xl border border-gray-200 p-6 shadow-sm
                     hover:shadow-md hover:-translate-y-1 transition-all"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 text-xl">
              📋
            </div>
            <h3 className="text-lg font-semibold group-hover:text-emerald-700">
              Lista de Chamada
            </h3>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed">
            Confira os pacientes previstos para o dia
            e registre presença ou ausência.
          </p>

          <p className="mt-4 text-sm font-medium text-emerald-600">
            Abrir chamada →
          </p>
        </a>

        {/* PLANNER MENSAL */}
        <a
          href="/planner"
          className="group bg-white rounded-xl border border-gray-200 p-6 shadow-sm
                     hover:shadow-md hover:-translate-y-1 transition-all"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-purple-100 text-purple-700 text-xl">
              🗓️
            </div>
            <h3 className="text-lg font-semibold group-hover:text-purple-700">
              Planner Mensal
            </h3>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed">
            Visualização mensal por paciente, ideal para
            acompanhamento e impressão.
          </p>

          <p className="mt-4 text-sm font-medium text-purple-600">
            Ver planner →
          </p>
        </a>

      </div>
    </section>
  );
}
