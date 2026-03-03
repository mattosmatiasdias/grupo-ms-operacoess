// src/pages/escalas/relatorios.tsx
const Relatorios = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Relatórios</h1>
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-blue-200/30">
        <p className="text-blue-300">Relatórios disponíveis:</p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-left">
            Relatório de Horas Trabalhadas
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-left">
            Relatório de Ocorrências
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-left">
            Relatório de Folgas
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-left">
            Relatório de Férias
          </button>
        </div>
      </div>
    </div>
  );
};

export default Relatorios;