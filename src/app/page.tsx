export default function Home() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">
        Painel inicial
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a
          href="/agenda"
          className="bg-white p-6 rounded shadow hover:shadow-md"
        >
          <h3 className="font-medium text-lg">
            📅 Agenda Geral
          </h3>
          <p className="text-sm text-gray-600">
            Ver atendimentos de todos os profissionais
          </p>
        </a>

        <a
          href="/chamada"
          className="bg-white p-6 rounded shadow hover:shadow-md"
        >
          <h3 className="font-medium text-lg">
            📋 Lista de Chamada
          </h3>
          <p className="text-sm text-gray-600">
            Pacientes previstos para o dia
          </p>
        </a>
      </div>
    </div>
  );
}
