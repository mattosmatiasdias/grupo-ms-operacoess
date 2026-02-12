// src/pages/Navios.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, X, LogOut, Bell, Ship, Calendar, Package, Anchor, 
  BarChart3, Plus, Pencil, ArrowLeft, Loader2, Home, Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Viagem {
  id: string;
  nome_navio: string;
  carga: string | null;
  berco: string | null;
  quantidade_prevista: number | null;
  cbs_total: number | null;
  inicio_operacao: string | null;
  final_operacao: string | null;
  media_cb: number | null;
  concluido: boolean;
  created_at: string;
}

const Navios = () => {
  const { userProfile, signOut } = useAuth();
  const { hasUnread } = useNotifications();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchViagens = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('navios')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error) setViagens(data || []);
      setLoading(false);
    };
    fetchViagens();
  }, []);

  const formatDate = (dateString: string | null) => 
    dateString ? new Date(dateString).toLocaleDateString('pt-BR') : 'N/A';

  const getStatusColor = (concluido: boolean) => 
    concluido 
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
      : 'bg-blue-500/10 text-blue-400 border-blue-500/20';

  const calcularDiasOperacao = (inicio: string | null, final: string | null) => {
    if (!inicio) return 0;
    const inicioDate = new Date(inicio);
    const finalDate = final ? new Date(final) : new Date();
    const diffTime = Math.abs(finalDate.getTime() - inicioDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const menuItems = [
    {
      icon: Ship,
      label: 'Lista de Navios',
      path: '/navios',
      color: 'text-purple-400',
      bgHover: 'hover:bg-purple-500/10',
    }
  ];

  // Dados para Cards de Resumo
  const statsData = [
    { 
      label: 'Total Viagens', 
      value: viagens.length, 
      icon: Ship, 
      color: 'text-blue-400', 
      bg: 'bg-blue-500/10' 
    },
    { 
      label: 'Em Andamento', 
      value: viagens.filter(v => !v.concluido).length, 
      icon: Activity, 
      color: 'text-green-400', 
      bg: 'bg-green-500/10' 
    },
    { 
      label: 'Concluídas', 
      value: viagens.filter(v => v.concluido).length, 
      icon: Package, 
      color: 'text-slate-400', 
      bg: 'bg-slate-700/20' 
    },
    { 
      label: 'Média CBs', 
      value: viagens.length > 0 
        ? Math.round(viagens.reduce((acc, v) => acc + (v.media_cb || 0), 0) / viagens.length)
        : 0,
      icon: BarChart3, 
      color: 'text-amber-400', 
      bg: 'bg-amber-500/10' 
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Layout Desktop */}
      <div className="hidden lg:flex min-h-screen">
        {/* Sidebar Desktop */}
        <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0">
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500/20 p-2 rounded-lg">
                <Ship className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight leading-none">Gestão Navios</h1>
                <p className="text-xs text-slate-500 mt-1">Operações Portuárias</p>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-1 overflow-y-auto flex-1">
            <div className="px-2 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Navegação
            </div>
            <Button
              onClick={() => navigate('/dashboard')}
              variant="ghost"
              className="w-full justify-start h-10 px-3 text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <ArrowLeft className="mr-3 h-4 w-4" />
              <span className="text-sm font-medium">Voltar ao Dashboard</span>
            </Button>
            {menuItems.map((item) => (
              <Button
                key={item.path}
                onClick={() => navigate(item.path)}
                variant="ghost"
                className={`w-full justify-start h-10 px-3 text-slate-400 hover:text-white hover:bg-slate-800 ${item.bgHover}`}
              >
                <item.icon className={`mr-3 h-4 w-4 ${item.color}`} />
                <span className="text-sm font-medium">{item.label}</span>
              </Button>
            ))}
          </div>

          <div className="p-4 border-t border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-3 px-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-blue-500/20">
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
              Sair do Sistema
            </Button>
          </div>
        </div>

        {/* Main Content Desktop */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-950/50">
          {/* Sticky Header */}
          <div className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50 px-8 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Gestão de Navios</h2>
              <p className="text-xs text-slate-400">Sistema de monitoramento de viagens e cargas</p>
            </div>
            <div className="flex items-center gap-3">
               <Button onClick={() => navigate('/novo-navio')} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-900/20 h-9 px-4">
                 <Plus className="h-4 w-4 mr-2" />
                 <span className="text-sm">Novo Navio</span>
               </Button>
            </div>
          </div>

          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {statsData.map((stat, idx) => (
                <Card key={idx} className="bg-slate-900/40 border-slate-800 p-4 flex items-center justify-between hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                      <p className="text-xl font-bold text-white mt-0.5">{stat.value}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Table Card */}
            <Card className="bg-slate-900/40 border-slate-800 shadow-sm flex flex-col">
              <CardHeader className="bg-slate-800/30 border-b border-slate-800/50 p-4 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ship className="h-5 w-5 text-blue-400" />
                  <CardTitle className="text-slate-100 text-base font-medium">Viagens Registradas</CardTitle>
                </div>
                <Badge variant="outline" className="bg-slate-950 border-slate-700 text-slate-400 text-xs px-2 py-0.5">
                  {viagens.length} Total
                </Badge>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-950">
                    <TableRow className="hover:bg-slate-950 border-slate-800">
                      <TableHead className="text-[11px] font-semibold text-slate-400 uppercase py-3 pl-4">Navio</TableHead>
                      <TableHead className="text-[11px] font-semibold text-slate-400 uppercase py-3">Carga</TableHead>
                      <TableHead className="text-[11px] font-semibold text-slate-400 uppercase py-3">Berço</TableHead>
                      <TableHead className="text-[11px] font-semibold text-slate-400 uppercase py-3">Qtd</TableHead>
                      <TableHead className="text-[11px] font-semibold text-slate-400 uppercase py-3">CBs</TableHead>
                      <TableHead className="text-[11px] font-semibold text-slate-400 uppercase py-3">Início</TableHead>
                      <TableHead className="text-[11px] font-semibold text-slate-400 uppercase py-3">Dias</TableHead>
                      <TableHead className="text-[11px] font-semibold text-slate-400 uppercase py-3">Status</TableHead>
                      <TableHead className="text-[11px] font-semibold text-slate-400 uppercase py-3 text-right pr-4">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-12 text-slate-500">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-500 mb-2" />
                          <p className="text-sm">Carregando dados...</p>
                        </TableCell>
                      </TableRow>
                    ) : viagens.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-16 text-slate-500">
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <div className="p-3 bg-slate-800 rounded-full">
                              <Ship className="h-6 w-6 text-slate-400" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-slate-300">Nenhuma viagem registrada</p>
                              <p className="text-xs text-slate-500">Inicie o cadastro para começar</p>
                            </div>
                            <Button onClick={() => navigate('/novo-navio')} variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                              <Plus className="h-3 w-3 mr-1" /> Cadastrar Viagem
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      viagens.map((viagem) => {
                        const diasOperacao = calcularDiasOperacao(viagem.inicio_operacao, viagem.final_operacao);
                        
                        return (
                          <TableRow key={viagem.id} className="hover:bg-slate-800/20 transition-colors border-slate-800">
                            <TableCell className="py-3 pl-4">
                              <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded bg-blue-500/10 text-blue-400">
                                  <Ship className="h-4 w-4" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-white">{viagem.nome_navio}</div>
                                  <div className="text-[10px] text-slate-500 font-mono">{viagem.id.substring(0,8)}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-3 text-sm text-slate-300">
                              <Badge variant="secondary" className="bg-slate-800 text-slate-300 border-slate-700 text-[10px] px-1.5 py-0 h-5">
                                {viagem.carga || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-3 text-sm text-slate-300">
                              <div className="flex items-center gap-1.5">
                                <Anchor className="h-3 w-3 text-slate-500" />
                                <span className="text-xs">{viagem.berco || '-'}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-3 text-sm font-mono text-slate-300">
                              {viagem.quantidade_prevista?.toLocaleString('pt-BR') || '-'}
                            </TableCell>
                            <TableCell className="py-3">
                              <span className="text-xs font-bold text-slate-200 bg-slate-800 px-2 py-1 rounded border border-slate-700">
                                {viagem.cbs_total || 0} CBs
                              </span>
                            </TableCell>
                            <TableCell className="py-3 text-sm text-slate-300">
                              {formatDate(viagem.inicio_operacao)}
                            </TableCell>
                            <TableCell className="py-3">
                              <Badge variant="outline" className="bg-purple-500/5 text-purple-400 border-purple-500/20 text-[10px] h-5 px-1.5">
                                {diasOperacao} dias
                              </Badge>
                            </TableCell>
                            <TableCell className="py-3">
                              <Badge className={getStatusColor(viagem.concluido) + " text-[10px] h-5 px-2 font-medium"}>
                                {viagem.concluido ? 'Concluído' : 'Em andamento'}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-3 text-right pr-4 space-x-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => navigate(`/navio/${viagem.id}/editar`)}
                                className="h-8 w-8 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => navigate(`/navio/${viagem.id}/producao`)}
                                className="h-8 w-8 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col min-h-screen bg-slate-950">
        {/* Header Mobile */}
        <div className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-30 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <Button onClick={() => setSidebarOpen(true)} variant="ghost" size="icon" className="text-white hover:bg-slate-800">
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
               <Ship className="text-purple-400 w-5 h-5" />
               <h1 className="text-lg font-bold text-white leading-tight">Navios</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-white">
              <Bell className="h-5 w-5" />
              {hasUnread && (
                <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-slate-900"></span>
              )}
            </Button>
            <Button onClick={handleSignOut} variant="ghost" size="icon" className="text-slate-400 hover:text-red-400 hover:bg-red-500/10">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Sidebar Mobile Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="flex justify-between items-center p-4 border-b border-slate-800">
              <h2 className="text-white font-bold text-lg">Menu de Navegação</h2>
              <Button onClick={() => setSidebarOpen(false)} variant="ghost" size="icon" className="text-white hover:bg-slate-800">
                <X className="w-6 h-6" />
              </Button>
            </div>
            <div className="p-4 space-y-2">
              <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full justify-start border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white h-12 px-4">
                <ArrowLeft className="mr-3 h-4 w-4" /> Voltar ao Dashboard
              </Button>
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                  className={`w-full justify-start h-12 px-4 ${item.bgHover} bg-slate-900 text-slate-300 hover:text-white border border-slate-800 rounded-lg transition-all`}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${item.color}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Content */}
        <div className="p-4 space-y-6 pb-20">
           {/* Mobile Stats */}
           <div className="grid grid-cols-2 gap-3">
              {statsData.map((stat, idx) => (
                 <div key={idx} className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex items-center gap-3">
                    <div className={`p-2 rounded-md ${stat.bg} ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                       <p className="text-[10px] text-slate-500 uppercase font-semibold">{stat.label}</p>
                       <p className="text-lg font-bold text-white">{stat.value}</p>
                    </div>
                 </div>
              ))}
           </div>

           {/* Mobile Table Card (Scrollable) */}
           <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-lg">
              <div className="p-3 border-b border-slate-800 bg-slate-800/30 flex justify-between items-center">
                 <span className="text-sm font-semibold text-white">Viagens</span>
                 <span className="text-xs text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{viagens.length}</span>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-950">
                    <TableRow className="hover:bg-slate-950 border-slate-800">
                      <TableHead className="text-[10px] uppercase text-slate-400 font-semibold py-2 pl-3">Navio</TableHead>
                      <TableHead className="text-[10px] uppercase text-slate-400 font-semibold py-2">Status</TableHead>
                      <TableHead className="text-[10px] uppercase text-slate-400 font-semibold py-2 text-right pr-3">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-800">
                    {loading ? (
                       <TableRow>
                         <TableCell colSpan={3} className="py-6 text-center text-slate-500">
                           <Loader2 className="h-4 w-4 animate-spin mx-auto text-blue-500 mb-1" />
                           <p className="text-[10px]">Carregando...</p>
                         </TableCell>
                       </TableRow>
                    ) : viagens.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="py-8 text-center text-slate-500">
                          <p className="text-xs">Nenhum registro</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      viagens.map((viagem) => (
                        <TableRow key={viagem.id} className="hover:bg-slate-800/30 border-slate-800">
                          <TableCell className="py-3 pl-3">
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-white truncate max-w-[120px]">{viagem.nome_navio}</span>
                              <span className="text-[10px] text-slate-500 font-mono">{formatDate(viagem.inicio_operacao)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            <Badge className={getStatusColor(viagem.concluido) + " text-[10px] h-5 px-2 font-medium"}>
                              {viagem.concluido ? 'Concluído' : 'Em andamento'}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-3 text-right pr-3 space-x-1">
                             <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:bg-slate-700" onClick={() => navigate(`/navio/${viagem.id}/editar`)}>
                               <Pencil className="h-3 w-3" />
                             </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
           </div>

           {/* Floating Action Button for New Ship */}
           <div className="fixed bottom-4 right-4 lg:hidden">
              <Button onClick={() => navigate('/novo-navio')} className="bg-blue-600 hover:bg-blue-700 text-white h-12 w-12 rounded-full shadow-lg shadow-blue-900/40 flex items-center justify-center p-0">
                <Plus className="h-6 w-6" />
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Navios;