// src/pages/escalas/visualizarescala.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  MapPin,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Componente Layout
const EscalasLayout = ({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: string }) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-950 text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/escalas')}
            className="gap-2 bg-blue-900/20 border-blue-400/30 text-blue-300 hover:bg-blue-800/40 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para escalas
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-white">{title}</h1>
          {subtitle && <p className="text-blue-300 mt-2 text-sm md:text-base">{subtitle}</p>}
        </div>
        
        {/* Content */}
        {children}
      </div>
    </div>
  );
};

export default function VisualizarEscala() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [escala, setEscala] = useState<any>(null);
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('detalhes');

  useEffect(() => {
    if (id) {
      carregarEscala(id);
    }
  }, [id]);

  const carregarEscala = async (escalaId: string) => {
    try {
      setIsLoading(true);

      // Carregar dados da escala
      const { data: escalaData, error: erroEscala } = await supabase
        .from('escalas')
        .select('*')
        .eq('id', escalaId)
        .single();

      if (erroEscala) throw erroEscala;

      // Carregar funcionários da escala
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

      if (erroFunc) throw erroFunc;

      setEscala(escalaData);
      setFuncionarios(funcEscala || []);

    } catch (error) {
      console.error('Erro ao carregar escala:', error);
      toast.error('Erro ao carregar dados da escala');
    } finally {
      setIsLoading(false);
    }
  };

  const exportarPDF = () => {
    toast.info('Gerando PDF...', {
      description: 'O PDF será gerado em breve.',
      action: {
        label: 'OK',
        onClick: () => console.log('OK clicked'),
      },
    });
  };

  const imprimir = () => {
    window.print();
  };

  const editarEscala = () => {
    navigate(`/escalas/editar/${id}`);
  };

  const copiarEscala = () => {
    toast.success('Escala copiada para criar nova!', {
      description: 'Você pode criar uma nova escala com estes dados.',
    });
    navigate(`/escalas/nova?data=${escala.data_escala}&frente=${escala.frente_servico}&turno=${escala.turno}`);
  };

  const getStatusColor = (status: string) => {
    switch(status?.toUpperCase()) {
      case 'CONFIRMADA':
        return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'PENDENTE':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
      case 'CANCELADA':
        return 'bg-red-500/20 text-red-300 border-red-400/30';
      case 'EM_ANDAMENTO':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
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

  const getTurnoIcon = (turno: string) => {
    return turno?.includes('19:00') ? 
      <Clock className="h-4 w-4 text-indigo-300" /> : 
      <Clock className="h-4 w-4 text-amber-300" />;
  };

  if (isLoading) {
    return (
      <EscalasLayout title="Carregando..." subtitle="Aguarde enquanto carregamos os dados">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-cyan-400">Carregando escala...</p>
          </div>
        </div>
      </EscalasLayout>
    );
  }

  if (!escala) {
    return (
      <EscalasLayout title="Escala não encontrada" subtitle="A escala solicitada não existe">
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4">Escala não encontrada</p>
          <Button onClick={() => navigate('/escalas')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para escalas
          </Button>
        </div>
      </EscalasLayout>
    );
  }

  return (
    <EscalasLayout 
      title={`Escala: ${escala.frente_servico}`}
      subtitle={`${new Date(escala.data_escala).toLocaleDateString('pt-BR')} - ${escala.turno}`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Botões de Ação */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={copiarEscala}
              className="gap-2 bg-purple-600/20 border-purple-400/30 text-purple-300 hover:bg-purple-600/30"
            >
              <Copy className="h-4 w-4" />
              Copiar Escala
            </Button>
            
            <Button
              variant="outline"
              onClick={editarEscala}
              className="gap-2 bg-amber-600/20 border-amber-400/30 text-amber-300 hover:bg-amber-600/30"
            >
              <Edit className="h-4 w-4" />
              Editar
            </Button>
            
            <Button
              variant="outline"
              onClick={exportarPDF}
              className="gap-2 bg-green-600/20 border-green-400/30 text-green-300 hover:bg-green-600/30"
            >
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button>
            
            <Button
              variant="outline"
              onClick={imprimir}
              className="gap-2 bg-blue-600/20 border-blue-400/30 text-blue-300 hover:bg-blue-600/30"
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Badge className={getStatusColor(escala.status)}>
              {escala.status || 'PENDENTE'}
            </Badge>
            <Badge className={getFrenteColor(escala.frente_servico)}>
              {escala.frente_servico}
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-blue-900/30 border border-blue-600/30 grid grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="detalhes" className="data-[state=active]:bg-blue-600/30">
              <FileText className="h-4 w-4 mr-2" />
              Detalhes
            </TabsTrigger>
            <TabsTrigger value="funcionarios" className="data-[state=active]:bg-blue-600/30">
              <Users className="h-4 w-4 mr-2" />
              Funcionários ({funcionarios.length})
            </TabsTrigger>
            <TabsTrigger value="informacoes" className="data-[state=active]:bg-blue-600/30">
              <UserCheck className="h-4 w-4 mr-2" />
              Informações
            </TabsTrigger>
            <TabsTrigger value="observacoes" className="data-[state=active]:bg-blue-600/30">
              <MessageSquare className="h-4 w-4 mr-2" />
              Observações
            </TabsTrigger>
          </TabsList>

          {/* Tab: Detalhes */}
          <TabsContent value="detalhes" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-blue-900/20 backdrop-blur-sm border-blue-600/30">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-600/20 rounded-xl">
                        <Ship className="h-6 w-6 text-blue-300" />
                      </div>
                      <div>
                        <p className="text-sm text-blue-300">Navio</p>
                        <p className="font-semibold text-white text-lg">{escala.navio || 'Não informado'}</p>
                      </div>
                    </div>
                    
                    <Separator className="bg-blue-600/30" />
                    
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-600/20 rounded-xl">
                        <Calendar className="h-6 w-6 text-green-300" />
                      </div>
                      <div>
                        <p className="text-sm text-blue-300">Data da Escala</p>
                        <p className="font-semibold text-white text-lg">
                          {new Date(escala.data_escala).toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-900/20 backdrop-blur-sm border-blue-600/30">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-cyan-600/20 rounded-xl">
                        <Clock className="h-6 w-6 text-cyan-300" />
                      </div>
                      <div>
                        <p className="text-sm text-blue-300">Turno</p>
                        <p className="font-semibold text-white text-lg">
                          {escala.turno === '07:00-19:00' ? 'Diurno (07:00-19:00)' : 'Noturno (19:00-07:00)'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {getTurnoIcon(escala.turno)}
                          <span className="text-sm text-blue-300">{escala.turno}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="bg-blue-600/30" />
                    
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-orange-600/20 rounded-xl">
                        <MapPin className="h-6 w-6 text-orange-300" />
                      </div>
                      <div>
                        <p className="text-sm text-blue-300">Localização</p>
                        <p className="font-semibold text-white text-lg">
                          {escala.berco || 'Berço não informado'}
                        </p>
                        {escala.local_trabalho && (
                          <p className="text-sm text-blue-300 mt-1">{escala.local_trabalho}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-900/20 backdrop-blur-sm border-blue-600/30">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-600/20 rounded-xl">
                        <UserCheck className="h-6 w-6 text-purple-300" />
                      </div>
                      <div>
                        <p className="text-sm text-blue-300">Encarregados</p>
                        <div className="mt-2 space-y-3">
                          <div>
                            <p className="text-xs text-blue-400">Manhã</p>
                            <p className="font-medium text-white">
                              {escala.encarregado_manha || 'Não definido'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-blue-400">Tarde</p>
                            <p className="font-medium text-white">
                              {escala.encarregado_tarde || 'Não definido'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="bg-blue-600/30" />
                    
                    <div>
                      <p className="text-sm text-blue-300 mb-2">Equipamentos Alocados</p>
                      <div className="flex flex-wrap gap-2">
                        {funcionarios
                          .filter(f => f.equipamento && f.equipamento !== 'SEM_EQUIPAMENTO')
                          .map((f, idx) => (
                            <Badge key={idx} className="bg-blue-600/20 text-blue-300 border-blue-400/30">
                              {f.equipamento}
                            </Badge>
                          ))}
                        {funcionarios.filter(f => f.equipamento && f.equipamento !== 'SEM_EQUIPAMENTO').length === 0 && (
                          <span className="text-sm text-blue-400">Nenhum equipamento alocado</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Funcionários */}
          <TabsContent value="funcionarios">
            <Card className="bg-blue-900/20 backdrop-blur-sm border-blue-600/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Lista de Funcionários
                </CardTitle>
                <CardDescription className="text-blue-300">
                  {funcionarios.length} funcionário(s) nesta escala
                </CardDescription>
              </CardHeader>
              <CardContent>
                {funcionarios.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-blue-400/50 mx-auto mb-4" />
                    <p className="text-blue-400">Nenhum funcionário adicionado a esta escala</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-blue-600/30">
                          <th className="text-left py-3 px-4 text-blue-300 font-medium">#</th>
                          <th className="text-left py-3 px-4 text-blue-300 font-medium">Nome</th>
                          <th className="text-left py-3 px-4 text-blue-300 font-medium">Função</th>
                          <th className="text-left py-3 px-4 text-blue-300 font-medium">Turma</th>
                          <th className="text-left py-3 px-4 text-blue-300 font-medium">Equipamento</th>
                          <th className="text-left py-3 px-4 text-blue-300 font-medium">Encarregado</th>
                          <th className="text-left py-3 px-4 text-blue-300 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {funcionarios.map((item, index) => (
                          <tr key={item.id} className="border-b border-blue-600/10 hover:bg-blue-900/20 transition-colors">
                            <td className="py-3 px-4">
                              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600/20 text-blue-300 font-medium">
                                {index + 1}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <p className="text-white font-medium">{item.funcionario?.nome_completo}</p>
                                {item.funcionario?.matricula && (
                                  <p className="text-xs text-blue-400">Mat: {item.funcionario.matricula}</p>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className="bg-blue-600/20 text-blue-300 border-blue-400/30">
                                {item.funcionario?.funcao || '-'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant="outline" className="border-blue-400/30 text-blue-300">
                                Turma {item.funcionario?.turma || '-'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              {item.equipamento && item.equipamento !== 'SEM_EQUIPAMENTO' ? (
                                <Badge className="bg-cyan-600/20 text-cyan-300 border-cyan-400/30">
                                  {item.equipamento}
                                </Badge>
                              ) : (
                                <span className="text-blue-400 text-sm">Sem equipamento</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-white">{item.encarregado || '-'}</td>
                            <td className="py-3 px-4">
                              <Badge className={
                                item.status === 'CONFIRMADO' 
                                  ? 'bg-green-500/20 text-green-300 border-green-400/30'
                                  : item.status === 'PENDENTE'
                                  ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30'
                                  : 'bg-red-500/20 text-red-300 border-red-400/30'
                              }>
                                {item.status || 'PENDENTE'}
                              </Badge>
                            </td>
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
            <Card className="bg-blue-900/20 backdrop-blur-sm border-blue-600/30">
              <CardHeader>
                <CardTitle className="text-white">Informações Técnicas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-blue-300 mb-1">Data de Criação</p>
                      <p className="text-white">
                        {new Date(escala.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-blue-300 mb-1">Última Atualização</p>
                      <p className="text-white">
                        {escala.updated_at 
                          ? new Date(escala.updated_at).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'Não atualizada'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-blue-300 mb-1">Criado Por</p>
                      <p className="text-white">{escala.created_by || 'Sistema'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-blue-300 mb-1">Atualizado Por</p>
                      <p className="text-white">{escala.updated_by || '-'}</p>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-6 bg-blue-600/30" />
                
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white mb-4">Resumo Estatístico</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-lg bg-blue-800/20 border border-blue-600/30">
                      <p className="text-2xl font-bold text-white">{funcionarios.length}</p>
                      <p className="text-sm text-blue-300">Funcionários</p>
                    </div>
                    
                    <div className="text-center p-4 rounded-lg bg-blue-800/20 border border-blue-600/30">
                      <p className="text-2xl font-bold text-white">
                        {funcionarios.filter(f => f.equipamento && f.equipamento !== 'SEM_EQUIPAMENTO').length}
                      </p>
                      <p className="text-sm text-blue-300">Equipamentos</p>
                    </div>
                    
                    <div className="text-center p-4 rounded-lg bg-blue-800/20 border border-blue-600/30">
                      <p className="text-2xl font-bold text-white">
                        {new Set(funcionarios.map(f => f.funcionario?.turma)).size}
                      </p>
                      <p className="text-sm text-blue-300">Turmas</p>
                    </div>
                    
                    <div className="text-center p-4 rounded-lg bg-blue-800/20 border border-blue-600/30">
                      <p className="text-2xl font-bold text-white">
                        {new Set(funcionarios.map(f => f.funcionario?.funcao)).size}
                      </p>
                      <p className="text-sm text-blue-300">Funções</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Observações */}
          <TabsContent value="observacoes">
            <Card className="bg-blue-900/20 backdrop-blur-sm border-blue-600/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Observações e Anotações
                </CardTitle>
              </CardHeader>
              <CardContent>
                {escala.observacoes ? (
                  <div className="p-4 rounded-lg bg-blue-800/20 border border-blue-600/30">
                    <p className="text-blue-300 whitespace-pre-wrap">{escala.observacoes}</p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-blue-400/50 mx-auto mb-4" />
                    <p className="text-blue-400">Nenhuma observação registrada para esta escala</p>
                  </div>
                )}
                
                {escala.anotacoes_adicionais && (
                  <>
                    <Separator className="my-6 bg-blue-600/30" />
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Anotações Adicionais</h4>
                      <div className="p-4 rounded-lg bg-blue-800/20 border border-blue-600/30">
                        <p className="text-blue-300 whitespace-pre-wrap">{escala.anotacoes_adicionais}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </EscalasLayout>
  );
}