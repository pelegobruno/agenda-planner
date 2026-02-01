export default function Home() {
  return (
    <section className="space-y-8">
      {/* TÍTULO */}
      <header className="text-center">
        <h2>Painel inicial</h2>
        <p className="text-sm mt-2">
          Acesso rápido às principais áreas do sistema
        </p>
      </header>

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

        <a href="/agenda" className="card">
          <h3 className="flex items-center gap-2">
            📅 Agenda Geral
          </h3>
          <p className="text-sm mt-2">
            Visualize todos os atendimentos organizados
            por profissionais, datas e horários.
          </p>
        </a>

        <a href="/chamada" className="card">
          <h3 className="flex items-center gap-2">
            📋 Lista de Chamada
          </h3>
          <p className="text-sm mt-2">
            Confira os pacientes previstos para o dia
            e registre a presença.
          </p>
        </a>

      </div>
    </section>
  );
}
