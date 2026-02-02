// src/pages/Dashboard.tsx
import { EscalasLayout } from '@/components/Escalas/EscalasLayout';

const EscalasDashboard = () => {
  // TODO: Implementar lógica para buscar contagens reais do Supabase
  // const [stats, setStats] = useState({...});

  return (
    <EscalasLayout 
      title="Dashboard" 
      subtitle="Visão geral das métricas de operação"
    >
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
      
      <div className="mt-12 bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-blue-200/30">
        <h3 className="text-xl font-semibold mb-4">Atalhos Rápidos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-600/20 rounded-lg border border-blue-500/30">
            <p className="text-sm text-blue-300">Próximo Turno</p>
            <p className="text-lg font-bold">Turma A - Manhã</p>
          </div>
          <div className="p-4 bg-purple-600/20 rounded-lg border border-purple-500/30">
            <p className="text-sm text-purple-300">Operação Ativa</p>
            <p className="text-lg font-bold">Garagem</p>
          </div>
          <div className="p-4 bg-green-600/20 rounded-lg border border-green-500/30">
            <p className="text-sm text-green-300">Eficiência</p>
            <p className="text-lg font-bold">98.5%</p>
          </div>
        </div>
      </div>

      <p className="mt-8 text-blue-300 text-center">Módulo em desenvolvimento...</p>
    </EscalasLayout>
  );
};

export default EscalasDashboard;