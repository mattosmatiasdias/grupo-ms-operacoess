// src/pages/escalas/editarescala.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save,
  ChevronLeft,
  Users,
  Calendar as CalendarIcon,
  UserCheck,
  Loader2,
  Filter,
  Search,
  Plus,
  X,
  AlertCircle,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

const FRENTES_SERVICO = [
  'COQUE', 'PICHE', 'FLUORETO', 'HYDRO', 'HIDRATO',
  'CARVAO', 'BAUXITA', 'LINGOTE', 'GARAGEM', 'ALBRAS'
];

const TURNOS = [
  { value: '07:00-19:00', label: 'Dia (07:00 às 19:00)' },
  { value: '19:00-07:00', label: 'Noite (19:00 às 07:00)' }
];

const EQUIPAMENTOS = ['CB', 'CV', 'PC', 'ES', 'RE', 'CP', 'CM', 'EP', 'MN', 'RE'];
const SEM_EQUIPAMENTO = 'SEM_EQUIPAMENTO';

const EscalasLayout = ({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: string }) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-950 text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/escalas')}
            className="gap-2 bg-blue-900/20 border-blue-400/30 text-blue-300 hover:bg-blue-800/40 mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar para escalas
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-white">{title}</h1>
          {subtitle && <p className="text-blue-300 mt-2 text-sm md:text-base">{subtitle}</p>}
        </div>
        
        {children}
      </div>
    </div>
  );
};

export default function EditarEscala() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingFuncionarios, setLoadingFuncionarios] = useState(false);
  
  const [escala, setEscala] = useState<any>(null);
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [escalaFuncionarios, setEscalaFuncionarios] = useState<any[]>([]);
  const [todosFuncionarios, setTodosFuncionarios] = useState<any[]>([]);

  const [filtroStatus, setFiltroStatus] = useState('Ativo');
  const [filtroFuncao, setFiltroFuncao] = useState('all');
  const [filtroTurma, setFiltroTurma] = useState('all');
  const [buscaNome, setBuscaNome] = useState('');

  useEffect(() => {
    if (id) {
      carregarEscala(id);
      carregarTodosFuncionarios();
    }
  }, [id]);

  const carregarEscala = async (escalaId: string) => {
    try {
      setIsLoading(true);
      
      const { data: escalaData, error: erroEscala } = await supabase
        .from('escalas')
        .select('*')
        .eq('id', escalaId)
        .single();

      if (erroEscala) throw erroEscala;

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
      setEscalaFuncionarios(funcEscala?.map((f: any) => ({
        ...f.funcionario,
        equipamento: f.equipamento || SEM_EQUIPAMENTO,
        encarregado: f.encarregado || escalaData.encarregado_manha,
        ordem: f.ordem,
        escala_funcionario_id: f.id
      })) || []);

    } catch (error) {
      console.error('Erro ao carregar escala:', error);
      toast.error('Erro ao carregar escala');
      navigate('/escalas');
    } finally {
      setIsLoading(false);
    }
  };

  const carregarTodosFuncionarios = async () => {
    try {
      setLoadingFuncionarios(true);
      const { data, error } = await supabase
        .from('escalas_funcionarios')
        .select('*')
        .order('nome_completo');

      if (error) throw error;
      setTodosFuncionarios(data || []);
    } catch {
      toast.error('Erro ao carregar colaboradores');
      setTodosFuncionarios([]);
    } finally {
      setLoadingFuncionarios(false);
    }
  };

  const funcoesDisponiveis = [...new Set(todosFuncionarios.map(f => f.funcao).filter(Boolean))].sort();
  const turmasDisponiveis = [...new Set(todosFuncionarios.map(f => f.turma).filter(Boolean))].sort();

  const funcionariosFiltrados = todosFuncionarios.filter(func => {
    if (!func?.id) return false;
    if (filtroStatus !== 'all' && func.status !== filtroStatus) return false;
    if (filtroFuncao !== 'all' && func.funcao !== filtroFuncao) return false;
    if (filtroTurma !== 'all' && func.turma !== filtroTurma) return false;
    if (buscaNome && !func.nome_completo?.toLowerCase().includes(buscaNome.toLowerCase())) return false;
    if (escalaFuncionarios.some(f => f.id === func.id)) return false;
    return true;
  });

  const adicionarFuncionario = (func: any) => {
    if (escalaFuncionarios.some(f => f.id === func.id)) {
      toast.warning('Funcionário já está na escala');
      return;
    }

    setEscalaFuncionarios(prev => [
      ...prev,
      {
        ...func,
        equipamento: SEM_EQUIPAMENTO,
        encarregado: escala?.encarregado_manha || '',
        ordem: prev.length + 1,
        escala_funcionario_id: null
      }
    ]);
  };

  const removerFuncionario = (funcId: string) => {
    setEscalaFuncionarios(prev =>
      prev.filter(f => f.id !== funcId).map((f, i) => ({ ...f, ordem: i + 1 }))
    );
  };

  const atualizarFuncionario = (funcId: string, campo: string, valor: any) => {
    setEscalaFuncionarios(prev =>
      prev.map(f => (f.id === funcId ? { ...f, [campo]: valor } : f))
    );
  };

  const atualizarEscala = (campo: string, valor: any) => {
    setEscala(prev => ({ ...prev, [campo]: valor }));
  };

  const reordenarFuncionarios = (index: number, direcao: 'up' | 'down') => {
    const novaLista = [...escalaFuncionarios];
    const alvoIndex = direcao === 'up' ? index - 1 : index + 1;
    
    if (alvoIndex >= 0 && alvoIndex < novaLista.length) {
      [novaLista[index], novaLista[alvoIndex]] = [novaLista[alvoIndex], novaLista[index]];
      setEscalaFuncionarios(novaLista.map((f, i) => ({ ...f, ordem: i + 1 })));
    }
  };

  const limparFiltros = () => {
    setFiltroStatus('Ativo');
    setFiltroFuncao('all');
    setFiltroTurma('all');
    setBuscaNome('');
  };

  const salvarAlteracoes = async () => {
    if (!escala) return;

    if (!escala.frente_servico || !escala.data_escala || !escala.turno || !escala.encarregado_manha) {
      toast.error('Preencha todos os campos obrigatórios (*)');
      return;
    }

    if (escalaFuncionarios.length === 0) {
      toast.error('Adicione pelo menos um funcionário à escala');
      return;
    }

    setIsSaving(true);

    try {
      // Atualizar escala principal
      const { error: erroEscala } = await supabase
        .from('escalas')
        .update({
          frente_servico: escala.frente_servico,
          data_escala: escala.data_escala,
          turno: escala.turno,
          navio: escala.navio,
          berco: escala.berco,
          encarregado_manha: escala.encarregado_manha,
          encarregado_tarde: escala.encarregado_tarde,
          observacoes: escala.observacoes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (erroEscala) throw erroEscala;

      // Preparar dados dos funcionários
      const funcionariosParaSalvar = escalaFuncionarios.map((func, index) => ({
        escala_id: id,
        funcionario_id: func.id,
        equipamento: func.equipamento === SEM_EQUIPAMENTO ? null : func.equipamento,
        encarregado: func.encarregado || escala.encarregado_manha,
        ordem: index + 1,
        status: 'CONFIRMADO'
      }));

      // Primeiro, remover funcionários antigos
      const { error: erroRemover } = await supabase
        .from('escalas_funcionarios_escala')
        .delete()
        .eq('escala_id', id);

      if (erroRemover) throw erroRemover;

      // Inserir funcionários atualizados
      if (funcionariosParaSalvar.length > 0) {
        const { error: erroInserir } = await supabase
          .from('escalas_funcionarios_escala')
          .insert(funcionariosParaSalvar);

        if (erroInserir) throw erroInserir;
      }

      toast.success('Escala atualizada com sucesso!');
      
      setTimeout(() => {
        navigate(`/escalas/visualizar/${id}`);
      }, 1000);

    } catch (error: any) {
      console.error('Erro ao atualizar escala:', error);
      toast.error(`Erro ao atualizar escala: ${error.message || 'Tente novamente'}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <EscalasLayout title="Carregando..." subtitle="Aguarde enquanto carregamos os dados">
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
        </div>
      </EscalasLayout>
    );
  }

  if (!escala) {
    return (
      <EscalasLayout title="Escala não encontrada" subtitle="Não foi possível carregar a escala">
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4">Escala não encontrada</p>
          <Button onClick={() => navigate('/escalas')}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar para escalas
          </Button>
        </div>
      </EscalasLayout>
    );
  }

  return (
    <EscalasLayout 
      title="Editar Escala"
      subtitle={`${new Date(escala.data_escala).toLocaleDateString('pt-BR')} - ${escala.turno}`}
    >
      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* Configurações da Escala */}
        <Card className="bg-blue-900/20 border border-blue-600/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Configurações da Escala
            </CardTitle>
            <CardDescription className="text-blue-300">
              Atualize os parâmetros básicos da escala
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Frente *</Label>
                <Select value={escala.frente_servico} onValueChange={v => atualizarEscala('frente_servico', v)}>
                  <SelectTrigger className="bg-blue-800/20 text-white border-blue-600/30">
                    <SelectValue className="text-white" placeholder="Selecione a frente" />
                  </SelectTrigger>
                  <SelectContent className="bg-blue-900 border-blue-600/30 text-white">
                    {FRENTES_SERVICO.map(f => (
                      <SelectItem key={f} value={f} className="text-white hover:bg-blue-800 focus:bg-blue-800">
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Data *</Label>
                <Input
                  type="date"
                  className="bg-blue-800/20 text-white border-blue-600/30"
                  value={escala.data_escala ? escala.data_escala.split('T')[0] : ''}
                  onChange={e => atualizarEscala('data_escala', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Turno *</Label>
                <Select value={escala.turno} onValueChange={v => atualizarEscala('turno', v)}>
                  <SelectTrigger className="bg-blue-800/20 text-white border-blue-600/30">
                    <SelectValue className="text-white" placeholder="Selecione o turno" />
                  </SelectTrigger>
                  <SelectContent className="bg-blue-900 border-blue-600/30 text-white">
                    {TURNOS.map(t => (
                      <SelectItem key={t.value} value={t.value} className="text-white hover:bg-blue-800 focus:bg-blue-800">
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Navio</Label>
                <Input
                  className="bg-blue-800/20 text-white border-blue-600/30"
                  value={escala.navio || ''}
                  onChange={e => atualizarEscala('navio', e.target.value)}
                  placeholder="Nome do navio (opcional)"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Berço/Local</Label>
                <Input
                  className="bg-blue-800/20 text-white border-blue-600/30"
                  value={escala.berco || ''}
                  onChange={e => atualizarEscala('berco', e.target.value)}
                  placeholder="Local de trabalho (opcional)"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Encarregado (Manhã) *</Label>
                <Input
                  className="bg-blue-800/20 text-white border-blue-600/30"
                  value={escala.encarregado_manha || ''}
                  onChange={e => atualizarEscala('encarregado_manha', e.target.value)}
                  placeholder="Nome do encarregado"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Encarregado (Tarde)</Label>
                <Input
                  className="bg-blue-800/20 text-white border-blue-600/30"
                  value={escala.encarregado_tarde || ''}
                  onChange={e => atualizarEscala('encarregado_tarde', e.target.value)}
                  placeholder="Nome do encarregado (opcional)"
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Label className="text-white">Observações</Label>
              <Textarea
                className="bg-blue-800/20 text-white border-blue-600/30 min-h-[100px]"
                value={escala.observacoes || ''}
                onChange={e => atualizarEscala('observacoes', e.target.value)}
                placeholder="Observações adicionais (opcional)"
              />
            </div>
          </CardContent>
        </Card>

        {/* Filtros para Adicionar Funcionários */}
        <Card className="bg-blue-900/20 border border-blue-600/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Buscar Colaboradores para Adicionar
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Status</Label>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="bg-blue-800/20 text-white border-blue-600/30">
                    <SelectValue className="text-white" placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-blue-900 border-blue-600/30 text-white">
                    <SelectItem value="Ativo" className="text-white hover:bg-blue-800">Ativo</SelectItem>
                    <SelectItem value="all" className="text-white hover:bg-blue-800">Todos</SelectItem>
                    <SelectItem value="Inativo" className="text-white hover:bg-blue-800">Inativo</SelectItem>
                    <SelectItem value="Férias" className="text-white hover:bg-blue-800">Férias</SelectItem>
                    <SelectItem value="Afastado" className="text-white hover:bg-blue-800">Afastado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Função</Label>
                <Select value={filtroFuncao} onValueChange={setFiltroFuncao}>
                  <SelectTrigger className="bg-blue-800/20 text-white border-blue-600/30">
                    <SelectValue className="text-white" placeholder="Função" />
                  </SelectTrigger>
                  <SelectContent className="bg-blue-900 border-blue-600/30 text-white">
                    <SelectItem value="all" className="text-white hover:bg-blue-800">Todas</SelectItem>
                    {funcoesDisponiveis.map(f => (
                      <SelectItem key={f} value={f} className="text-white hover:bg-blue-800">
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Turma</Label>
                <Select value={filtroTurma} onValueChange={setFiltroTurma}>
                  <SelectTrigger className="bg-blue-800/20 text-white border-blue-600/30">
                    <SelectValue className="text-white" placeholder="Turma" />
                  </SelectTrigger>
                  <SelectContent className="bg-blue-900 border-blue-600/30 text-white">
                    <SelectItem value="all" className="text-white hover:bg-blue-800">Todas</SelectItem>
                    {turmasDisponiveis.map(t => (
                      <SelectItem key={t} value={t} className="text-white hover:bg-blue-800">
                        Turma {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
                  <Input
                    className="bg-blue-800/20 text-white border-blue-600/30 pl-9"
                    value={buscaNome}
                    onChange={e => setBuscaNome(e.target.value)}
                    placeholder="Buscar por nome"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button variant="outline" size="sm" onClick={limparFiltros} className="border-blue-600/30 text-blue-300">
                <RefreshCw className="h-4 w-4 mr-2" />
                Limpar filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Colunas: Funcionários Disponíveis e Escala */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Coluna: Funcionários Disponíveis */}
          <Card className="bg-blue-900/20 border border-blue-600/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                Colaboradores Disponíveis
                <Badge variant="outline" className="text-blue-300 border-blue-600/30">
                  {funcionariosFiltrados.length}
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="max-h-[65vh] overflow-y-auto space-y-3 pr-2">
              {loadingFuncionarios ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                </div>
              ) : funcionariosFiltrados.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-blue-400/50 mx-auto mb-4" />
                  <p className="text-blue-400">Nenhum colaborador disponível</p>
                  <p className="text-sm text-blue-500 mt-1">Tente ajustar os filtros</p>
                </div>
              ) : (
                funcionariosFiltrados.map(func => (
                  <div
                    key={func.id}
                    className="p-3 rounded-lg border border-blue-600/30 bg-blue-800/20 flex justify-between hover:bg-blue-800/30 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-white font-medium">{func.nome_completo}</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {func.funcao && (
                          <Badge className="bg-blue-600/20 text-blue-300 border-blue-400/30">
                            {func.funcao}
                          </Badge>
                        )}
                        {func.turma && (
                          <Badge className="bg-blue-600/20 text-blue-300 border-blue-400/30">
                            Turma {func.turma}
                          </Badge>
                        )}
                        {func.status && func.status !== 'Ativo' && (
                          <Badge className="bg-yellow-600/20 text-yellow-300 border-yellow-400/30">
                            {func.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => adicionarFuncionario(func)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Coluna: Escala Montada */}
          <Card className="bg-blue-900/20 border border-blue-600/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Escala Montada
                <Badge variant="outline" className="text-blue-300 border-blue-600/30">
                  {escalaFuncionarios.length}
                </Badge>
              </CardTitle>
              <CardDescription className="text-blue-300">
                {escalaFuncionarios.length} funcionário(s) na escala
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
              {escalaFuncionarios.length === 0 ? (
                <Alert className="bg-blue-800/20 border-blue-600/30">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-blue-300">
                    Nenhum funcionário adicionado à escala. Adicione funcionários da coluna ao lado.
                  </AlertDescription>
                </Alert>
              ) : (
                escalaFuncionarios.map((func, index) => (
                  <div
                    key={func.id}
                    className="p-4 rounded-lg border border-blue-600/30 bg-blue-800/20"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600/20 text-blue-300 font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-white font-semibold">{func.nome_completo}</p>
                          <div className="flex gap-2 mt-1">
                            {func.funcao && (
                              <Badge className="bg-blue-600/20 text-blue-300 border-blue-400/30 text-xs">
                                {func.funcao}
                              </Badge>
                            )}
                            {func.turma && (
                              <Badge className="bg-blue-600/20 text-blue-300 border-blue-400/30 text-xs">
                                Turma {func.turma}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        {index > 0 && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => reordenarFuncionarios(index, 'up')}
                            className="h-7 w-7 text-blue-400 hover:text-blue-300"
                          >
                            ↑
                          </Button>
                        )}
                        {index < escalaFuncionarios.length - 1 && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => reordenarFuncionarios(index, 'down')}
                            className="h-7 w-7 text-blue-400 hover:text-blue-300"
                          >
                            ↓
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removerFuncionario(func.id)}
                          className="h-7 w-7 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      <div>
                        <Label className="text-sm text-blue-300 mb-2">Equipamento</Label>
                        <Select
                          value={func.equipamento || SEM_EQUIPAMENTO}
                          onValueChange={v => atualizarFuncionario(func.id, 'equipamento', v)}
                        >
                          <SelectTrigger className="bg-blue-800/20 text-white border-blue-600/30">
                            <SelectValue className="text-white" placeholder="Equipamento" />
                          </SelectTrigger>
                          <SelectContent className="bg-blue-900 border-blue-600/30 text-white">
                            <SelectItem value={SEM_EQUIPAMENTO} className="text-white hover:bg-blue-800">
                              Sem equipamento
                            </SelectItem>
                            {EQUIPAMENTOS.map(eq => (
                              <SelectItem key={eq} value={eq} className="text-white hover:bg-blue-800">
                                {eq}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm text-blue-300 mb-2">Encarregado</Label>
                        <Input
                          className="bg-blue-800/20 text-white border-blue-600/30"
                          value={func.encarregado || ''}
                          onChange={e => atualizarFuncionario(func.id, 'encarregado', e.target.value)}
                          placeholder="Encarregado responsável"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Rodapé com Botões de Ação */}
        <Card className="bg-blue-900/20 border border-blue-600/30">
          <CardContent className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6">
            <div className="space-y-2">
              <p className="text-blue-300 text-sm">
                <strong>{escalaFuncionarios.length}</strong> funcionário(s) na escala
              </p>
              <p className="text-blue-400 text-xs">
                Última atualização: {new Date(escala.updated_at || escala.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate(`/escalas/visualizar/${id}`)}
                className="border-blue-600/30 text-blue-300 hover:bg-blue-800/40"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              
              <Button 
                onClick={salvarAlteracoes} 
                disabled={isSaving || escalaFuncionarios.length === 0}
                className="bg-blue-600 hover:bg-blue-700 gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </EscalasLayout>
  );
}