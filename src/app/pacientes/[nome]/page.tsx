import { agendamentos } from "@/lib/mockAgendamentos";
import { formatarDataBR } from "@/lib/datas";

export default function Paciente({
  params,
}: {
  params: { nome: string };
}) {
  const nomePaciente = decodeURIComponent(params.nome);

  const agendaPaciente = agendamentos.filter(
    (a) => a.paciente === nomePaciente
  );

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">
        Agenda do Paciente
      </h2>

      <p>
        Paciente: <strong>{nomePaciente}</strong>
      </p>

      <ul className="bg-white rounded shadow divide-y">
        {agendaPaciente.map((item, index) => (
          <li key={index} className="p-3">
            {formatarDataBR(item.data)} — {item.hora} —{" "}
            {item.profissao} ({item.profissional})
          </li>
        ))}
      </ul>
    </div>
  );
}
