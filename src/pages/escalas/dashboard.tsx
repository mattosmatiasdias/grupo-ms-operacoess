// src/pages/escalas/dashboard.tsx
const EscalasDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard Escalas</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-blue-200/30">
          <h3 className="text-lg font-semibold mb-2">Total de Colaboradores</h3>
          <p className="text-4xl font-bold">0</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-blue-200/30">
          <h3 className="text-lg font-semibold mb-2">Escalados Hoje</h3>
          <p className="text-4xl font-bold">0</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-blue-200/30">
          <h3 className="text-lg font-semibold mb-2">Ocorrências</h3>
          <p className="text-4xl font-bold">0</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-blue-200/30">
          <h3 className="text-lg font-semibold mb-2">Folgas</h3>
          <p className="text-4xl font-bold">0</p>
        </div>
      </div>
      <p className="mt-8 text-blue-300">Módulo em desenvolvimento...</p>
    </div>
  );
};

export default EscalasDashboard;