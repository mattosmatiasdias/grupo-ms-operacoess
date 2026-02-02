// src/pages/escalas/ocorrencias.tsx
const Ocorrencias = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Ocorrências</h1>
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-blue-200/30">
        <p className="text-blue-300">Sistema de registro de ocorrências:</p>
        <ul className="list-disc list-inside mt-2 text-blue-300 ml-4">
          <li>Faltas e atrasos</li>
          <li>Atestados médicos</li>
          <li>Suspensões</li>
          <li>Advertências</li>
          <li>Relatórios de incidentes</li>
        </ul>
      </div>
    </div>
  );
};

export default Ocorrencias;