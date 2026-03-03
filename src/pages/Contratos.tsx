// src/pages/Contratos.tsx
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
// Ícones
import { 
  FileText, Building2, Calendar, TrendingUp, Plus, 
  Menu, X, LogOut, Bell, ArrowLeft, BarChart3 
} from 'lucide-react';
// Componentes UI
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Hooks e Auth
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// Imports do Módulo
import { getContracts, getBMs, getOrderLines } from '@/store/contractStore';
import { formatCurrency, formatDate, daysRemaining } from '@/lib/formatters';
import ContractFormDialog from '@/components/ContractFormDialog'; 

const Contratos = () => {
  const navigate = useNavigate();
  const { userProfile, signOut } = useAuth();
  const { toast } = useToast();
  
  // Estado da Sidebar Mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Controle do Modal de Novo Contrato
  const [showForm, setShowForm] = useState(false);

  // Dados
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // CORREÇÃO: Função assíncrona para carregar dados
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Aguarda a resposta do banco de dados
        const data = await getContracts();
        setContracts(data);
      } catch (error) {
        console.error("Erro ao carregar contratos:", error);
        toast({
          title: "Erro de Carregamento",
          description: "Não foi possível buscar os contratos.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [showForm]); // Recarrega se fechar o modal de novo contrato

  const handleSignOut = async () => {
    await signOut();
  };

  // Cálculos para as Estatísticas
  const statsData = [
    { 
      label: 'Contratos Ativos', 
      value: contracts.length, 
      icon: FileText,
      color: 'text-blue-400', 
      bg: 'bg-blue-500/10' 
    },
    { 
      label: 'Total BMs Emitidos', 
      value: contracts.reduce((sum, c) => {
        try {
          return sum + getBMs(c.id).length;
        } catch { return sum; }
      }, 0), 
      icon: TrendingUp,
      color: 'text-emerald-400', 
      bg: 'bg-emerald-500/10' 
    },
    { 
      label: 'Valor Total Contratado', 
      value: formatCurrency(contracts.reduce((sum, c) => sum + (c.valorTotal || 0), 0)), 
      icon: Building2,
      color: 'text-amber-400', 
      bg: 'bg-amber-500/10' 
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Header Mobile */}
      <div className="lg:hidden bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-30 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <Button onClick={() => setSidebarOpen(true)} variant="ghost" size="icon" className="text-white hover:bg-slate-800">
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
             <FileText className="text-rose-400 w-5 h-5" />
             <h1 className="text-lg font-bold text-white leading-tight">Gestão de Contratos</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-white">
            <Bell className="h-5 w-5" />
          </Button>
          <Button onClick={handleSignOut} variant="ghost" size="icon" className="text-slate-400 hover:text-red-400 hover:bg-red-500/10">
            <LogOut className="h-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Sidebar Mobile */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="flex justify-between items-center p-4 border-b border-slate-800">
            <h2 className="text-white font-bold text-lg">Menu</h2>
            <Button onClick={() => setSidebarOpen(false)} variant="ghost" size="icon" className="text-white hover:bg-slate-800">
              <X className="w-6 h-6" />
            </Button>
          </div>
          <div className="p-4 space-y-2">
            <Button
              onClick={() => {
                navigate('/');
                setSidebarOpen(false);
              }}
              className="w-full justify-start h-12 px-4 bg-slate-900 text-slate-300 hover:text-white border border-slate-800 rounded-lg"
            >
              <BarChart3 className="mr-3 h-5 w-5 text-blue-400" />
              Voltar ao Dashboard Principal
            </Button>
          </div>
        </div>
      )}

      {/* Layout Desktop */}
      <div className="hidden lg:flex min-h-screen">
        {/* Sidebar Desktop */}
        <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0">
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="bg-rose-600/20 p-2 rounded-lg">
                <FileText className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight leading-none">Contratos</h1>
                <p className="text-xs text-slate-500 mt-1">Boletins de Medição</p>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4 space-y-1">
             <Button
              onClick={() => navigate('/')}
              variant="ghost"
              className="w-full justify-start h-10 px-3 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="mr-3 h-4 w-4" />
              <span className="text-sm font-medium">Voltar ao Menu</span>
            </Button>
          </div>

          <div className="p-4 border-t border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-3 px-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white font-bold text-xs shadow-lg">
                {userProfile?.full_name?.substring(0,2).toUpperCase() || 'US'}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium text-white truncate leading-tight">{userProfile?.full_name || 'Usuário'}</span>
                <span className="text-xs text-slate-500 truncate">Operador</span>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white justify-start h-9 text-sm"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-950/50">
          <div className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50 px-8 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Lista de Contratos</h2>
              <p className="text-xs text-slate-400">Gerencie contratos, pedidos e boletins de medição</p>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20 h-9"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Contrato
            </Button>
          </div>

          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {statsData.map((stat, idx) => (
                <Card key={idx} className="bg-slate-900/40 border-slate-800 p-4 flex items-center justify-between hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                      <p className="text-xl font-bold text-white mt-0.5">{stat.value}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Lista de Contratos */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Contratos Cadastrados</h3>
              
              {loading ? (
                <div className="text-center py-10 text-slate-500 flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mb-4"></div>
                  Carregando contratos do banco de dados...
                </div>
              ) : contracts.length === 0 ? (
                <Card className="bg-slate-900/40 border-slate-800 p-10 text-center">
                  <FileText className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <h4 className="text-white font-medium">Nenhum contrato encontrado</h4>
                  <p className="text-slate-500 text-sm mt-2 mb-4">Comece adicionando um novo contrato ao sistema.</p>
                  <Button onClick={() => setShowForm(true)} variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                    <Plus className="w-4 h-4 mr-2" /> Criar Contrato
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contracts.map((contract) => {
                    // Lógica de cálculo
                    let bms = [];
                    let orderLinesCount = 0;
                    let totalMedido = 0;
                    let progress = 0;
                    let days = 0;

                    try {
                      bms = getBMs(contract.id);
                      orderLinesCount = getOrderLines(contract.id).length;
                      totalMedido = bms.reduce((s: number, b: any) => s + b.valorTotal, 0);
                      progress = contract.valorTotal > 0 ? (totalMedido / contract.valorTotal) * 100 : 0;
                      days = daysRemaining(contract.dataFim);
                    } catch (e) {
                      console.warn("Erro ao calcular stats do contrato", contract.id);
                    }

                    return (
                      <div
                        key={contract.id}
                        onClick={() => navigate(`/contrato/${contract.id}`)} // Futura rota de detalhes
                        className="bg-slate-900/40 border border-slate-800 rounded-lg p-5 cursor-pointer hover:border-rose-500/50 hover:bg-slate-800/50 transition-all group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <Badge variant="secondary" className="text-xs bg-slate-800 text-slate-300 border-slate-700">
                            {contract.tipoLabel || 'Contrato'}
                          </Badge>
                          <Badge variant={days > 60 ? 'default' : days > 0 ? 'secondary' : 'destructive'} className="text-xs">
                            {days > 0 ? `${days} dias` : 'Vencido'}
                          </Badge>
                        </div>

                        <h3 className="font-semibold text-sm mb-1 line-clamp-1 text-white group-hover:text-rose-400 transition-colors">{contract.fornecedor}</h3>
                        <p className="text-xs text-slate-500 font-mono mb-3">Nº {contract.numero}</p>

                        <p className="text-xs text-slate-400 line-clamp-2 mb-4 h-8">{contract.objeto}</p>

                        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                          <span>Execução Financeira</span>
                          <span className="font-semibold text-white">{progress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
                          <div
                            className="h-full bg-rose-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs border-t border-slate-800/50 pt-3">
                          <div>
                            <p className="text-slate-500">Valor</p>
                            <p className="font-semibold text-slate-200">{formatCurrency(contract.valorTotal)}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">BMs</p>
                            <p className="font-semibold text-slate-200">{bms.length}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Itens</p>
                            <p className="font-semibold text-slate-200">{orderLinesCount}</p>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-800/50 flex items-center gap-1.5 text-xs text-slate-500">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(contract.dataInicio)} — {formatDate(contract.dataFim)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Dialog de Novo Contrato */}
      <ContractFormDialog open={showForm} onOpenChange={setShowForm} />
    </div>
  );
};

export default Contratos;