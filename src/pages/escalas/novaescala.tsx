// src/pages/escalas/NovaEscala.tsx
import { useState, useEffect } from 'react';
import {
  Plus,
  X,
  Save,
  ChevronLeft,
  Users,
  Calendar as CalendarIcon,
  UserCheck,
  Loader2,
  Filter,
  Search
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

import { toast } from 'sonner';
import { EscalasLayout } from '@/components/escalas/EscalasLayout';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';

/* ===================== CONSTANTES ===================== */
const FRENTES_SERVICO = [
  'COQUE', 'PICHE', 'FLUORETO', 'HYDRATO',
  'CARVAO', 'BAUXITA', 'LINGOTE', 'GARAGEM', 'ALBRAS'
];

const TURNOS = [
  { value: '07:00-19:00', label: 'Dia (07:00 às 19:00)' },
  { value: '19:00-07:00', label: 'Noite (19:00 às 07:00)' }
];

const EQUIPAMENTOS = ['CB', 'CV', 'PC', 'ES', 'E', 'F', 'G', 'H', 'CB', 'CDP'];
const SEM_EQUIPAMENTO = 'SEM_EQUIPAMENTO';

export default function NovaEscala() {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const dataSelecionada =
    searchParams.get('data') || new Date().toISOString().split('T')[0];

  /* ===================== ESTADOS ===================== */
  const [isLoading, setIsLoading] = useState(false);
  const [loadingFuncionarios, setLoadingFuncionarios] = useState(true);
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [escalaFuncionarios, setEscalaFuncionarios] = useState<any[]>([]);

  const [escalaData, setEscalaData] = useState({
    frente: 'COQUE',
    data: dataSelecionada,
    turno: '07:00-19:00',
    encarregado: '',
    observacoes: ''
  });

  /* ===================== FILTROS ===================== */
  const [filtroStatus, setFiltroStatus] = useState('Ativo');
  const [filtroFuncao, setFiltroFuncao] = useState('all');
  const [filtroTurma, setFiltroTurma] = useState('all');
  const [buscaNome, setBuscaNome] = useState('');

  /* ===================== LOAD ===================== */
  useEffect(() => {
    carregarFuncionarios();
  }, []);

  const carregarFuncionarios = async () => {
    try {
      setLoadingFuncionarios(true);
      const { data, error } = await supabase
        .from('escalas_funcionarios')
        .select('*')
        .order('nome_completo');

      if (error) throw error;
      setFuncionarios(data || []);
    } catch {
      toast.error('Erro ao carregar colaboradores');
      setFuncionarios([]);
    } finally {
      setLoadingFuncionarios(false);
    }
  };

  const funcoesDisponiveis = [...new Set(funcionarios.map(f => f.funcao).filter(Boolean))].sort();
  const turmasDisponiveis = [...new Set(funcionarios.map(f => f.turma).filter(Boolean))].sort();

  const funcionariosFiltrados = funcionarios.filter(func => {
    if (!func?.id) return false;
    if (filtroStatus !== 'all' && func.status !== filtroStatus) return false;
    if (filtroFuncao !== 'all' && func.funcao !== filtroFuncao) return false;
    if (filtroTurma !== 'all' && func.turma !== filtroTurma) return false;
    if (buscaNome && !func.nome_completo?.toLowerCase().includes(buscaNome.toLowerCase())) return false;
    return true;
  });

  /* ===================== AÇÕES ===================== */
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
        encarregado: escalaData.encarregado,
        ordem: prev.length + 1
      }
    ]);
  };

  const removerFuncionario = (id: string) => {
    setEscalaFuncionarios(prev =>
      prev.filter(f => f.id !== id).map((f, i) => ({ ...f, ordem: i + 1 }))
    );
  };

  const atualizarFuncionario = (id: string, campo: string, valor: any) => {
    setEscalaFuncionarios(prev =>
      prev.map(f => (f.id === id ? { ...f, [campo]: valor } : f))
    );
  };

  const limparFiltros = () => {
    setFiltroStatus('Ativo');
    setFiltroFuncao('all');
    setFiltroTurma('all');
    setBuscaNome('');
  };

  /* ===================== SALVAR ESCALA ===================== */
  const salvarEscala = async () => {
    // Validação básica
    if (!escalaData.frente || !escalaData.data || !escalaData.turno || !escalaData.encarregado) {
      toast.error('Preencha todos os campos obrigatórios (*)');
      return;
    }

    if (escalaFuncionarios.length === 0) {
      toast.error('Adicione pelo menos um funcionário à escala');
      return;
    }

    setIsLoading(true);

    try {
      // Primeiro, criar a escala principal
      const { data: escalaCriada, error: erroEscala } = await supabase
        .from('escalas')
        .insert({
          frente_servico: escalaData.frente,
          data_escala: escalaData.data,
          turno: escalaData.turno,
          encarregado_manha: escalaData.encarregado,
          observacoes: escalaData.observacoes || null,
          status: 'PENDENTE'
        })
        .select()
        .single();

      if (erroEscala) {
        throw new Error(`Erro ao criar escala: ${erroEscala.message}`);
      }

      // Preparar os dados dos funcionários da escala
      const funcionariosEscala = escalaFuncionarios.map(func => ({
        escala_id: escalaCriada.id,
        funcionario_id: func.id,
        equipamento: func.equipamento === SEM_EQUIPAMENTO ? null : func.equipamento,
        encarregado: func.encarregado || escalaData.encarregado,
        ordem: func.ordem,
        status: 'CONFIRMADO'
      }));

      // Inserir os funcionários da escala
      const { error: erroFuncionarios } = await supabase
        .from('escalas_funcionarios_escala')
        .insert(funcionariosEscala);

      if (erroFuncionarios) {
        throw new Error(`Erro ao adicionar funcionários: ${erroFuncionarios.message}`);
      }

      toast.success('Escala criada com sucesso!');
      
      // Redirecionar para a página de escalas após 1 segundo
      setTimeout(() => {
        navigate('/escalas');
      }, 1000);

    } catch (error: any) {
      console.error('Erro ao salvar escala:', error);
      toast.error(`Erro ao salvar escala: ${error.message || 'Tente novamente'}`);
    } finally {
      setIsLoading(false);
    }
  };

  /* ===================== UI ===================== */
  return (
    <EscalasLayout
      title="Criar Nova Escala"
      subtitle={`Data: ${new Date(escalaData.data).toLocaleDateString('pt-BR')}`}
    >
      <div className="max-w-[1600px] mx-auto px-4 space-y-6">

        {/* CONFIGURAÇÕES */}
        <Card className="bg-slate-900/80 border border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Configurações da Escala
            </CardTitle>
            <CardDescription className="text-slate-300">
              Defina os parâmetros básicos
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Frente *</Label>
                <Select value={escalaData.frente} onValueChange={v => setEscalaData(p => ({ ...p, frente: v }))}>
                  <SelectTrigger className="bg-slate-800/60 text-white border-slate-600">
                    <SelectValue className="text-white" placeholder="Selecione a frente" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600 text-white">
                    {FRENTES_SERVICO.map(f => (
                      <SelectItem key={f} value={f} className="text-white hover:bg-slate-700 focus:bg-slate-700">
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
                  className="bg-slate-800/60 text-white border-slate-600"
                  value={escalaData.data}
                  onChange={e => setEscalaData(p => ({ ...p, data: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Turno *</Label>
                <Select value={escalaData.turno} onValueChange={v => setEscalaData(p => ({ ...p, turno: v }))}>
                  <SelectTrigger className="bg-slate-800/60 text-white border-slate-600">
                    <SelectValue className="text-white" placeholder="Selecione o turno" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600 text-white">
                    {TURNOS.map(t => (
                      <SelectItem key={t.value} value={t.value} className="text-white hover:bg-slate-700 focus:bg-slate-700">
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Encarregado *</Label>
                <Input
                  className="bg-slate-800/60 text-white border-slate-600"
                  value={escalaData.encarregado}
                  onChange={e => setEscalaData(p => ({ ...p, encarregado: e.target.value }))}
                  placeholder="Nome do encarregado"
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Label className="text-white">Observações</Label>
              <Textarea
                className="bg-slate-800/60 text-white border-slate-600"
                value={escalaData.observacoes}
                onChange={e => setEscalaData(p => ({ ...p, observacoes: e.target.value }))}
                placeholder="Observações adicionais (opcional)"
              />
            </div>
          </CardContent>
        </Card>

        {/* FILTROS */}
        <Card className="bg-slate-900/80 border border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtrar Colaboradores
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Status</Label>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="bg-slate-800/60 text-white border-slate-600">
                    <SelectValue className="text-white" placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600 text-white">
                    <SelectItem value="Ativo" className="text-white hover:bg-slate-700 focus:bg-slate-700">Ativo</SelectItem>
                    <SelectItem value="all" className="text-white hover:bg-slate-700 focus:bg-slate-700">Todos</SelectItem>
                    <SelectItem value="Inativo" className="text-white hover:bg-slate-700 focus:bg-slate-700">Inativo</SelectItem>
                    <SelectItem value="Férias" className="text-white hover:bg-slate-700 focus:bg-slate-700">Férias</SelectItem>
                    <SelectItem value="Afastado" className="text-white hover:bg-slate-700 focus:bg-slate-700">Afastado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Função</Label>
                <Select value={filtroFuncao} onValueChange={setFiltroFuncao}>
                  <SelectTrigger className="bg-slate-800/60 text-white border-slate-600">
                    <SelectValue className="text-white" placeholder="Função" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600 text-white">
                    <SelectItem value="all" className="text-white hover:bg-slate-700 focus:bg-slate-700">Todas</SelectItem>
                    {funcoesDisponiveis.map(f => (
                      <SelectItem key={f} value={f} className="text-white hover:bg-slate-700 focus:bg-slate-700">
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Turma</Label>
                <Select value={filtroTurma} onValueChange={setFiltroTurma}>
                  <SelectTrigger className="bg-slate-800/60 text-white border-slate-600">
                    <SelectValue className="text-white" placeholder="Turma" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600 text-white">
                    <SelectItem value="all" className="text-white hover:bg-slate-700 focus:bg-slate-700">Todas</SelectItem>
                    {turmasDisponiveis.map(t => (
                      <SelectItem key={t} value={t} className="text-white hover:bg-slate-700 focus:bg-slate-700">
                        Turma {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    className="bg-slate-800/60 text-white border-slate-600 pl-9"
                    value={buscaNome}
                    onChange={e => setBuscaNome(e.target.value)}
                    placeholder="Buscar por nome"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button variant="outline" size="sm" onClick={limparFiltros}>
                Limpar filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* COLUNAS */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card className="bg-slate-900/80 border border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                Colaboradores
                <Badge variant="outline" className="text-white border-slate-500">{funcionariosFiltrados.length}</Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="max-h-[65vh] overflow-y-auto space-y-3 pr-2">
              {funcionariosFiltrados.map(func => (
                <div
                  key={func.id}
                  className="p-3 rounded-lg border border-slate-700 bg-slate-800/60 flex justify-between"
                >
                  <div>
                    <p className="text-white font-medium">{func.nome_completo}</p>
                    <div className="flex gap-2 mt-1">
                      {func.funcao && <Badge className="bg-slate-700 text-white">{func.funcao}</Badge>}
                      {func.turma && <Badge className="bg-slate-700 text-white">Turma {func.turma}</Badge>}
                    </div>
                  </div>
                  <Button size="sm" onClick={() => adicionarFuncionario(func)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Escala Montada
                <Badge variant="outline" className="text-white border-slate-500">{escalaFuncionarios.length}</Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
              {escalaFuncionarios.map((func, i) => (
                <div
                  key={func.id}
                  className="p-4 rounded-lg border border-slate-700 bg-slate-800/60"
                >
                  <div className="flex justify-between mb-3">
                    <p className="text-white font-semibold">
                      {i + 1}. {func.nome_completo}
                    </p>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removerFuncionario(func.id)}
                    >
                      <X className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Select
                      value={func.equipamento}
                      onValueChange={v => atualizarFuncionario(func.id, 'equipamento', v)}
                    >
                      <SelectTrigger className="bg-slate-800/60 text-white border-slate-600">
                        <SelectValue className="text-white" placeholder="Equipamento" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600 text-white">
                        <SelectItem value={SEM_EQUIPAMENTO} className="text-white hover:bg-slate-700 focus:bg-slate-700">
                          Sem equipamento
                        </SelectItem>
                        {EQUIPAMENTOS.map(eq => (
                          <SelectItem key={eq} value={eq} className="text-white hover:bg-slate-700 focus:bg-slate-700">
                            {eq}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      className="bg-slate-800/60 text-white border-slate-600"
                      value={func.encarregado}
                      onChange={e => atualizarFuncionario(func.id, 'encarregado', e.target.value)}
                      placeholder="Encarregado"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* RODAPÉ */}
        <Card className="bg-slate-900/80 border border-slate-700">
          <CardContent className="flex justify-between items-center">
            <Button variant="outline" onClick={() => navigate('/escalas')}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>

            <Button onClick={salvarEscala} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Escala
                </>
              )}
            </Button>
          </CardContent>
        </Card>

      </div>
    </EscalasLayout>
  );
}