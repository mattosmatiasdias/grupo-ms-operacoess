// src/pages/visualizarescala.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Printer, 
  Download, 
  Edit, 
  Users, 
  Calendar, 
  Ship, 
  Clock, 
  UserCheck, 
  FileText,
  Copy,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  MapPin,
  MessageSquare,
  XCircle,
  UserX,
  RefreshCw // ← Ícone adicionado para o botão de atualizar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EscalasLayout } from '@/components/Escalas/EscalasLayout';

// Função auxiliar para criar data no fuso horário local (Brasil)
const criarDataLocal = (year: number, month: number, day: number): Date => {
  // Cria a data com hora 12:00:00 para evitar problemas de fuso horário
  return new Date(year, month, day, 12, 0, 0);
};

// Função para converter uma string de data (YYYY-MM-DD) para Date no fuso local
const parseDataLocal = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return criarDataLocal(year, month - 1, day);
};

// Função para formatar data no formato YYYY-MM-DD no fuso local
const formatarDataParaYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Função para formatar data para exibição em português
const formatarDataParaExibicao = (dateString: string) => {
  const data = parseDataLocal(dateString);
  return data.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

// Função para formatar data e hora para exibição
const formatarDataHora = (dateString: string) => {
  const data = new Date(dateString);
  return data.toLocaleString('pt-BR');
};

// Função para formatar apenas data para exibição (dd/mm/yyyy)
const formatarDataCurta = (dateString: string) => {
  const data = parseDataLocal(dateString);
  return data.toLocaleDateString('pt-BR');
};

export default function VisualizarEscala() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const [isLoading, setIsLoading] = useState(true);
  const [escala, setEscala] = useState<any>(null);
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('detalhes');
  const [errorType, setErrorType] = useState<'NOT_FOUND' | 'PERMISSION' | 'NETWORK' | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false); // ← Estado para controlar animação de atualização

  useEffect(() => {
    if (id) {
      // Validação simples para evitar buscar IDs obviamente inválidos
      if (id === 'undefined' || id === 'null' || id.length < 10) {
        console.warn("ID inválido recebido:", id);
        setErrorType('NOT_FOUND');
        setIsLoading(false);
        toast.error('ID da escala inválido na URL.');
      } else {
        carregarEscala(id);
      }
    } else {
      setIsLoading(false);
      // Não mostra erro agressivo se não tiver ID (pode ser carregamento de rota)
    }
  }, [id]);

  const carregarEscala = async (escalaId: string) => {
    try {
      // Se estiver refrescando (não o carregamento inicial), usamos estado de refreshing
      if (!isLoading) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setErrorType(null);

      // 1. Carregar dados principais
      const { data: escalaData, error: erroEscala } = await supabase
        .from('escalas')
        .select('*')
        .eq('id', escalaId)
        .single();

      if (erroEscala) {
        console.error("Erro Supabase (Escala):", erroEscala);
        
        // Identificação específica do tipo de erro
        if (erroEscala.code === 'PGRST116') {
          setErrorType('NOT_FOUND'); // Registro não existe
        } else if (erroEscala.status === 403 || erroEscala.status === 401) {
          setErrorType('PERMISSION'); // Problema de permissão (RLS)
        }
        throw erroEscala; // Dispara para o catch
      }

      if (!escalaData) {
        setErrorType('NOT_FOUND');
        throw new Error("Dados retornaram nulos.");
      }

      // 2. Carregar equipe
      const { data: funcEscala, error: erroFunc } = await supabase
        .from('escalas_funcionarios_escala')
        .select(`
          *,
          funcionario:funcionario_id (
            id, nome_completo, funcao, turma, matricula, status
          )
        `)
        .eq('escala_id', escalaId)
        .order('ordem', { ascending: true });

      if (erroFunc) {
        console.warn("Erro ao carregar equipe (mas escala foi carregada):", erroFunc);
        // Não falha a tela inteira se apenas a equipe falhar, apenas avisa ou deixa vazio
        toast.warning('Não foi possível carregar a lista de funcionários.');
      }

      setEscala(escalaData);
      setFuncionarios(funcEscala || []);

      // Mostrar mensagem de sucesso apenas se for uma atualização manual
      if (isRefreshing) {
        toast.success('Dados atualizados com sucesso!');
      }

    } catch (error: any) {
      console.error('Falha ao carregar escala:', error);
      
      // Se já definimos um tipo de erro (Not Found), não mostremos toast genérico
      if (!errorType) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          setErrorType('NETWORK');
          toast.error('Erro de conexão com o servidor.');
        } else {
          toast.error('Erro ao carregar dados da escala.');
        }
      }
      
      // Se for uma atualização manual, mostrar mensagem específica
      if (isRefreshing) {
        toast.error('Falha ao atualizar os dados. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Função para atualizar os dados manualmente
  const handleAtualizarDados = () => {
    if (!id) {
      toast.error('ID da escala não disponível para atualização.');
      return;
    }
    carregarEscala(id);
  };

  const exportarPDF = () => {
    toast.info('Gerando PDF...', {
      description: 'O PDF será gerado em breve.',
    });
  };

  const imprimir = () => window.print();

  const editarEscala = () => navigate(`/nova?id=${id}`);
  
  const copiarEscala = () => {
    if (!escala) return;
    toast.success('Dados copiados para a área de transferência!');
    navigate(`/nova?copyFrom=${id}`);
  };

  // --- UI HELPERS ---

  const getEscalaStatusColor = (status: string) => {
    switch(status?.toUpperCase()) {
      case 'CONFIRMADA':
      case 'FINALIZADA':
        return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'PENDENTE':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
      case 'CANCELADA':
        return 'bg-red-500/20 text-red-300 border-red-400/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  const getFuncionarioStatusBadge = (item: any) => {
    const status = item.status || 'PENDENTE';
    
    if (status === 'AUSENTE') {
      return <Badge className="bg-red-500/20 text-red-300 border-red-400/30 gap-1"><XCircle className="h-3 w-3" /> Ausente</Badge>;
    }
    if (status === 'SUBSTITUIDO') {
      return <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30 gap-1"><UserX className="h-3 w-3" /> Substituído</Badge>;
    }
    if (item.presenca_confirmada || status === 'CONFIRMADO') {
       return <Badge className="bg-green-500/20 text-green-300 border-green-400/30 gap-1"><CheckCircle className="h-3 w-3" /> Confirmado</Badge>;
    }
    
    return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30">Pendente</Badge>;
  };

  const getFrenteColor = (frente: string) => {
    const cores: {[key: string]: string} = {
      'COQUE': 'bg-amber-500/20 text-amber-300 border-amber-400/30',
      'PICHE': 'bg-gray-500/20 text-gray-300 border-gray-400/30',
      'FLUORETO': 'bg-blue-500/20 text-blue-300 border-blue-400/30',
      'HYDRATO': 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30',
      'CARVAO': 'bg-stone-500/20 text-stone-300 border-stone-400/30',
      'BAUXITA': 'bg-orange-500/20 text-orange-300 border-orange-400/30',
      'LINGOTE': 'bg-purple-500/20 text-purple-300 border-purple-400/30',
      'GARAGEM': 'bg-green-500/20 text-green-300 border-green-400/30',
      'ALBRAS': 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30',
    };
    return cores[frente] || 'bg-blue-500/20 text-blue-300 border-blue-400/30';
  };

  // --- ESTADOS DE RENDERIZAÇÃO ---

  if (isLoading) {
    return (
      <EscalasLayout title="Carregando..." subtitle="Buscando dados no servidor...">
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent mx-auto"></div>
            <p className="text-cyan-400">Carregando escala...</p>
            {id && <p className="text-xs text-slate-500 font-mono">ID: {id.substring(0, 8)}...</p>}
          </div>
        </div>
      </EscalasLayout>
    );
  }

  if (!escala) {
    return (
      <EscalasLayout title="Erro ao Carregar" subtitle="Não foi possível acessar os dados solicitados">
        <div className="text-center py-20 max-w-lg mx-auto">
          
          {/* Ícone e Título Dinâmicos baseados no erro */}
          <div className="mb-6">
            {errorType === 'PERMISSION' ? (
              <div className="h-20 w-20 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-10 w-10 text-red-400" />
              </div>
            ) : errorType === 'NETWORK' ? (
              <div className="h-20 w-20 bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-10 w-10 text-orange-400" />
              </div>
            ) : (
              <div className="h-20 w-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-10 w-10 text-slate-400" />
              </div>
            )}

            <h2 className="text-2xl font-bold text-white mb-2">
              {errorType === 'PERMISSION' ? 'Acesso Negado' : 'Escala Não Encontrada'}
            </h2>
            <p className="text-slate-400 mb-6">
              {errorType === 'PERMISSION' 
                ? 'Você não tem permissão para visualizar esta escala ou ela foi excluída recentemente.'
                : 'A escala solicitada não foi encontrada no banco de dados ou pode ter sido excluída.'}
            </p>
          </div>

          {/* ID para Debug */}
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 mb-8 text-left">
            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">ID Buscado:</p>
            <code className="block text-red-400 font-mono break-all">{id || 'Nenhum ID fornecido'}</code>
          </div>

          <div className="flex justify-center gap-4">
            <Button onClick={() => navigate('/calendario')} variant="outline" className="border-slate-600 text-slate-300">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Calendário
            </Button>
            {errorType === 'NETWORK' && (
              <Button onClick={() => window.location.reload()} className="bg-cyan-600 hover:bg-cyan-700 text-white">
                Tentar Novamente
              </Button>
            )}
          </div>
        </div>
      </EscalasLayout>
    );
  }

  const turnLabel = escala.turno === '07:00-19:00' ? 'Diurno (07h às 19h)' : 'Noturno (19h às 07h)';
  const isNight = escala.turno?.includes('19:00');

  // Cálculos seguros com optional chaining
  const totalFuncionarios = funcionarios.length;
  const totalConfirmados = funcionarios.filter(f => f.status === 'CONFIRMADO' || f.presenca_confirmada).length;
  const totalAusentes = funcionarios.filter(f => f.status === 'AUSENTE').length;
  const funcoesUnicas = new Set(funcionarios.map(f => f.funcionario?.funcao)).size;

  return (
    <EscalasLayout 
      title={`Escala: ${escala.frente_servico}`}
      subtitle={`${formatarDataCurta(escala.data_escala)} - ${turnLabel}`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Botões de Ação */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={copiarEscala} className="gap-2 bg-purple-600/20 border-purple-400/30 text-purple-300 hover:bg-purple-600/30">
              <Copy className="h-4 w-4" /> Copiar
            </Button>
            <Button variant="outline" onClick={editarEscala} className="gap-2 bg-amber-600/20 border-amber-400/30 text-amber-300 hover:bg-amber-600/30">
              <Edit className="h-4 w-4" /> Editar
            </Button>
            {/* BOTÃO DE ATUALIZAR DADOS ADICIONADO AQUI */}
            <Button 
              variant="outline" 
              onClick={handleAtualizarDados} 
              disabled={isRefreshing || !id}
              className="gap-2 bg-blue-600/20 border-blue-400/30 text-blue-300 hover:bg-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} /> 
              {isRefreshing ? 'Atualizando...' : 'Atualizar Dados'}
            </Button>
            <Button variant="outline" onClick={exportarPDF} className="gap-2 bg-green-600/20 border-green-400/30 text-green-300 hover:bg-green-600/30">
              <Download className="h-4 w-4" /> PDF
            </Button>
            <Button variant="outline" onClick={imprimir} className="gap-2 bg-blue-600/20 border-blue-400/30 text-blue-300 hover:bg-blue-600/30">
              <Printer className="h-4 w-4" /> Imprimir
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Badge className={getEscalaStatusColor(escala.status)}>
              {escala.status || 'PENDENTE'}
            </Badge>
            <Badge className={getFrenteColor(escala.frente_servico)}>
              {escala.frente_servico}
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-900/50 border border-slate-700 grid grid-cols-2 lg:grid-cols-4 w-full max-w-3xl mx-auto">
            <TabsTrigger value="detalhes" className="data-[state=active]:bg-cyan-600/30 text-white">
              <FileText className="h-4 w-4 mr-2" /> Detalhes
            </TabsTrigger>
            <TabsTrigger value="funcionarios" className="data-[state=active]:bg-cyan-600/30 text-white">
              <Users className="h-4 w-4 mr-2" /> Equipe ({totalFuncionarios})
            </TabsTrigger>
            <TabsTrigger value="informacoes" className="data-[state=active]:bg-cyan-600/30 text-white">
              <UserCheck className="h-4 w-4 mr-2" /> Informações
            </TabsTrigger>
            <TabsTrigger value="observacoes" className="data-[state=active]:bg-cyan-600/30 text-white">
              <MessageSquare className="h-4 w-4 mr-2" /> Observações
            </TabsTrigger>
          </TabsList>

          {/* Tab: Detalhes */}
          <TabsContent value="detalhes" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-slate-900/40 backdrop-blur-sm border-slate-700">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-600/20 rounded-xl">
                        <Ship className="h-6 w-6 text-blue-300" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Operação / Navio</p>
                        <p className="font-semibold text-white text-lg">{escala.navio || 'Operação Geral'}</p>
                      </div>
                    </div>
                    <Separator className="bg-slate-700" />
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-600/20 rounded-xl">
                        <Calendar className="h-6 w-6 text-green-300" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Data</p>
                        <p className="font-semibold text-white text-lg">
                          {formatarDataParaExibicao(escala.data_escala)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/40 backdrop-blur-sm border-slate-700">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-cyan-600/20 rounded-xl">
                        <Clock className="h-6 w-6 text-cyan-300" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Turno</p>
                        <p className="font-semibold text-white text-lg">{turnLabel}</p>
                        <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">{escala.turno}</span>
                      </div>
                    </div>
                    <Separator className="bg-slate-700" />
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-orange-600/20 rounded-xl">
                        <MapPin className="h-6 w-6 text-orange-300" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Localização</p>
                        <p className="font-semibold text-white text-lg">{escala.berco || 'Berço não informado'}</p>
                        {escala.local_trabalho && <p className="text-sm text-slate-400 mt-1">{escala.local_trabalho}</p>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/40 backdrop-blur-sm border-slate-700">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-600/20 rounded-xl">
                        <UserCheck className="h-6 w-6 text-purple-300" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Liderança</p>
                        <div className="mt-2 space-y-2">
                          {escala.encarregado_manha && <div><p className="text-xs text-slate-400">Manhã</p><p className="font-medium text-white text-sm">{escala.encarregado_manha}</p></div>}
                          {escala.encarregado_tarde && <div><p className="text-xs text-slate-400">Tarde</p><p className="font-medium text-white text-sm">{escala.encarregado_tarde}</p></div>}
                          {!escala.encarregado_manha && !escala.encarregado_tarde && <p className="text-sm text-slate-500">Não informado</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Funcionários */}
          <TabsContent value="funcionarios">
            <Card className="bg-slate-900/40 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5" /> Equipe Escalada
                </CardTitle>
                <CardDescription className="text-slate-400">{totalFuncionarios} colaborador(es) alocado(s)</CardDescription>
              </CardHeader>
              <CardContent>
                {totalFuncionarios === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">Nenhum funcionário adicionado a esta escala</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700 bg-slate-800/50">
                          <th className="text-left py-3 px-4 text-slate-300 font-medium">#</th>
                          <th className="text-left py-3 px-4 text-slate-300 font-medium">Colaborador</th>
                          <th className="text-left py-3 px-4 text-slate-300 font-medium">Função</th>
                          <th className="text-left py-3 px-4 text-slate-300 font-medium">Turma</th>
                          <th className="text-left py-3 px-4 text-slate-300 font-medium">Detalhes</th>
                          <th className="text-left py-3 px-4 text-slate-300 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {funcionarios.map((item, index) => (
                          <tr 
                            key={item.id} 
                            className={`border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors ${index % 2 === 0 ? 'bg-transparent' : 'bg-slate-800/10'}`}
                          >
                            <td className="py-3 px-4">
                              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-700 text-slate-300 font-medium text-xs">
                                {item.ordem || index + 1}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <p className="text-white font-medium">{item.funcionario?.nome_completo}</p>
                                {item.funcionario?.matricula && <p className="text-xs text-slate-500">Mat: {item.funcionario.matricula}</p>}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className="bg-slate-700 text-slate-300 border-slate-600">{item.funcionario?.funcao || '-'}</Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant="outline" className="border-slate-600 text-slate-400">Turma {item.funcionario?.turma || '-'}</Badge>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              {item.equipamento && <span className="text-slate-300 mr-2">{item.equipamento}</span>}
                              {item.local_trabalho && <span className="text-slate-500 text-xs block">{item.local_trabalho}</span>}
                              {!item.equipamento && !item.local_trabalho && <span className="text-slate-600 text-xs">-</span>}
                            </td>
                            <td className="py-3 px-4">{getFuncionarioStatusBadge(item)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Informações */}
          <TabsContent value="informacoes">
            <Card className="bg-slate-900/40 backdrop-blur-sm border-slate-700">
              <CardHeader><CardTitle className="text-white">Informações Técnicas</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Criado em</p>
                      <p className="text-white font-mono text-sm">{formatarDataHora(escala.created_at)}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Última atualização</p>
                      <p className="text-white font-mono text-sm">{escala.updated_at ? formatarDataHora(escala.updated_at) : '-'}</p>
                    </div>
                  </div>
                </div>
                <Separator className="my-6 bg-slate-700" />
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Resumo da Equipe</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                      <p className="text-2xl font-bold text-white">{totalFuncionarios}</p>
                      <p className="text-sm text-slate-400">Total</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                      <p className="text-2xl font-bold text-green-400">{totalConfirmados}</p>
                      <p className="text-sm text-slate-400">Confirmados</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                      <p className="text-2xl font-bold text-red-400">{totalAusentes}</p>
                      <p className="text-sm text-slate-400">Ausentes</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                      <p className="text-2xl font-bold text-slate-200">{funcoesUnicas}</p>
                      <p className="text-sm text-slate-400">Funções</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Observações */}
          <TabsContent value="observacoes">
            <Card className="bg-slate-900/40 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" /> Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                {escala.observacoes ? (
                  <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                    <p className="text-slate-300 whitespace-pre-wrap">{escala.observacoes}</p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">Nenhuma observação registrada para esta escala</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </EscalasLayout>
  );
}