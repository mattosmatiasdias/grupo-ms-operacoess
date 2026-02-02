// src/pages/AnaliseIndividual.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User, Calendar, Clock, DollarSign, TrendingUp, FileText,
  Download, Printer, ArrowLeft, CheckCircle, PieChart as PieChartIcon, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { EscalasLayout } from '@/components/Escalas/EscalasLayout';

// Cores para gráficos
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function AnaliseIndividual() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [funcionario, setFuncionario] = useState<any>(null);
  const [periodo, setPeriodo] = useState<string>(() => {
    // Define período padrão como o mês atual
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    return `${ano}-${mes}`;
  });
  
  const [registrosPeriodo, setRegistrosPeriodo] = useState<any[]>([]);
  const [resumoMensal, setResumoMensal] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [periodosDisponiveis, setPeriodosDisponiveis] = useState<string[]>([]);

  // Gera lista de últimos 6 meses para o select
  useEffect(() => {
    const periodos: string[] = [];
    const data = new Date();
    data.setMonth(data.getMonth() + 1); // Começa do próximo mês para incluir o atual na lógica de fechamento se necessário

    for (let i = 0; i < 6; i++) {
      data.setMonth(data.getMonth() - 1);
      const ano = data.getFullYear();
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      periodos.push(`${ano}-${mes}`);
    }
    setPeriodosDisponiveis(periodos);
  }, []);

  useEffect(() => {
    if (id) {
      carregarDadosFuncionario();
    }
  }, [id, periodo]);

  // Auxiliar para calcular intervalo 16 a 15
  const calcularIntervaloPeriodo = (periodoStr: string) => {
    const [ano, mes] = periodoStr.split('-').map(Number);
    
    // Início: Dia 16 do mês de referência
    const inicio = new Date(ano, mes - 1, 16);
    
    // Fim: Dia 15 do mês seguinte
    // Se for dezembro (mes 12), o próximo mês é janeiro do ano seguinte
    const fim = new Date(ano, mes, 15);

    return {
      inicio: inicio.toISOString().split('T')[0],
      fim: fim.toISOString().split('T')[0]
    };
  };

  const carregarDadosFuncionario = async () => {
    try {
      setIsLoading(true);

      // 1. Buscar dados do funcionário
      const { data: funcData, error: funcError } = await supabase
        .from('escalas_funcionarios')
        .select('*')
        .eq('id', id)
        .single();

      if (funcError) throw funcError;
      if (!funcData) {
        toast.error('Funcionário não encontrado');
        navigate('/pessoal');
        return;
      }
      setFuncionario(funcData);

      // 2. Buscar configuração salarial para a função do funcionário
      const { data: salarioConfig, error: salarioError } = await supabase
        .from('escalas_config_salarios')
        .select('*')
        .eq('funcao', funcData.funcao)
        .eq('ativo', true) // Traz a configuração ativa
        .single();

      // Se não achar config, usa valores padrão 0 para não quebrar a tela
      const config = salarioConfig || {
        salario_base: 0,
        he50_valor: 0,
        he100_valor: 0
      };

      // 3. Buscar registros de horários do período (16 a 15)
      const { inicio, fim } = calcularIntervaloPeriodo(periodo);

      const { data: registros, error: registrosError } = await supabase
        .from('escalas_registro_horarios')
        .select('*')
        .eq('funcionario_id', id)
        .gte('data_trabalho', inicio)
        .lte('data_trabalho', fim)
        .order('data_trabalho', { ascending: true });

      if (registrosError) throw registrosError;
      setRegistrosPeriodo(registros || []);

      // 4. Calcular Resumo Financeiro Real
      const totalHE50 = registros.reduce((acc: number, r: any) => acc + (r.horas_extras_50 || 0), 0);
      const totalHE100 = registros.reduce((acc: number, r: any) => acc + (r.horas_extras_100 || 0), 0);
      
      const valorHE50 = totalHE50 * (config.he50_valor || 0);
      const valorHE100 = totalHE100 * (config.he100_valor || 0);

      const resumoCalculado = {
        valor_salario: config.salario_base || 0,
        valor_he_50: valorHE50,
        valor_he_100: valorHE100,
        valor_total: (config.salario_base || 0) + valorHE50 + valorHE100,
        status: 'Calculado', // Indica que foi calculado on-the-fly baseado nos registros
        periodo: { mes_ano: periodo }
      };
      setResumoMensal(resumoCalculado);

    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast.error(error.message || 'Erro ao carregar dados do funcionário');
    } finally {
      setIsLoading(false);
    }
  };

  const calcularEstatisticas = () => {
    const stats = {
      totalDias: registrosPeriodo.length,
      totalHorasNormais: registrosPeriodo.reduce((sum, r) => sum + (r.horas_trabalhadas || 0), 0),
      totalHE50: registrosPeriodo.reduce((sum, r) => sum + (r.horas_extras_50 || 0), 0),
      totalHE100: registrosPeriodo.reduce((sum, r) => sum + (r.horas_extras_100 || 0), 0),
      horasAdicionais: registrosPeriodo.reduce((sum, r) => sum + (r.horas_adicionais || 0), 0),
      diasFolga: registrosPeriodo.filter(r => r.turno === 'Folga').length,
      diasFalta: registrosPeriodo.filter(r => r.turno === 'Falta' || r.status === 'AUSENTE').length,
    };

    return stats;
  };

  const gerarDadosGrafico = () => {
    // Agrupar por semana
    const semanas: {[key: string]: any} = {};

    registrosPeriodo.forEach(registro => {
      const data = new Date(registro.data_trabalho);
      const semana = `Sem ${Math.ceil(data.getDate() / 7)}`;

      if (!semanas[semana]) {
        semanas[semana] = {
          semana,
          horasNormais: 0,
          horasExtras50: 0,
          horasExtras100: 0,
        };
      }

      semanas[semana].horasNormais += registro.horas_trabalhadas || 0;
      semanas[semana].horasExtras50 += registro.horas_extras_50 || 0;
      semanas[semana].horasExtras100 += registro.horas_extras_100 || 0;
    });

    return Object.values(semanas);
  };

  const gerarDadosDistribuicao = () => {
    const stats = calcularEstatisticas();

    return [
      { name: 'Horas Normais', value: stats.totalHorasNormais },
      { name: 'HE 50%', value: stats.totalHE50 },
      { name: 'HE 100%', value: stats.totalHE100 },
      { name: 'Adicionais', value: stats.horasAdicionais },
    ].filter(item => item.value > 0);
  };

  const exportarRelatorio = () => {
    toast.success('Download do relatório iniciado...');
    // Lógica de exportação real (ex: jsPDF ou Excel) viria aqui
  };

  const imprimirRelatorio = () => {
    window.print();
  };

  const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'confirmado':
      case 'pago':
      case 'calculado':
        return 'bg-green-500/20 text-green-300';
      case 'pendente':
      case 'em análise':
      case 'registrado':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'folga':
      case 'folga programada':
        return 'bg-blue-500/20 text-blue-300';
      case 'falta':
      case 'cancelado':
      case 'ausente':
        return 'bg-red-500/20 text-red-300';
      default:
        return 'bg-slate-600/20 text-slate-300';
    }
  };

  if (isLoading || !funcionario) {
    return (
      <EscalasLayout 
        title="Análise Individual" 
        subtitle="Carregando dados..."
      >
        <div className="flex flex-col justify-center items-center py-20 gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
          <p className="text-blue-300">Buscando informações do funcionário...</p>
        </div>
      </EscalasLayout>
    );
  }

  const stats = calcularEstatisticas();
  const dadosGrafico = gerarDadosGrafico();
  const dadosDistribuicao = gerarDadosDistribuicao();

  return (
    <EscalasLayout
      title={`Análise Individual - ${funcionario.nome_completo}`}
      subtitle={`Matrícula: ${funcionario.matricula || 'N/A'} | Função: ${funcionario.funcao} | Turma: ${funcionario.turma}`}
    >
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Cabeçalho com Controles */}
        <Card className="bg-slate-900/80 border border-slate-700 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-600/20 rounded-xl shrink-0">
                  <User className="h-8 w-8 text-blue-300" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{funcionario.nome_completo}</h2>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="outline" className="bg-slate-700/50 text-white border-slate-600">
                      {funcionario.funcao}
                    </Badge>
                    <Badge className="bg-cyan-600/20 text-cyan-300 border-cyan-500/30">
                      Turma {funcionario.turma}
                    </Badge>
                    <Badge className={getStatusColor(funcionario.status)}>
                      {funcionario.status}
                    </Badge>
                  </div>
                  {funcionario.data_contratacao && (
                    <span className="text-sm text-slate-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Admissão: {new Date(funcionario.data_contratacao).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                <div className="flex flex-col gap-1 w-full sm:w-48">
                  <label className="text-xs text-slate-400 ml-1">Período de Referência</label>
                  <Select value={periodo} onValueChange={setPeriodo}>
                    <SelectTrigger className="w-full bg-slate-800/60 text-white border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600 text-white">
                      {periodosDisponiveis.map(p => (
                        <SelectItem key={p} value={p} className="text-white hover:bg-slate-700 focus:bg-slate-700">
                          {p.replace('-', '/')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 mt-auto sm:mt-0">
                  <Button
                    variant="outline"
                    onClick={exportarRelatorio}
                    className="border-green-600/30 text-green-300 hover:bg-green-800/40 hover:text-green-200 gap-2 shrink-0"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Exportar</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={imprimirRelatorio}
                    className="border-blue-600/30 text-blue-300 hover:bg-blue-800/40 hover:text-blue-200 gap-2 shrink-0"
                  >
                    <Printer className="h-4 w-4" />
                    <span className="hidden sm:inline">Imprimir</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900/80 border border-slate-700 hover:border-cyan-500/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-600/20 rounded-lg">
                  <Calendar className="h-5 w-5 text-cyan-300" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase">Dias Trabalhados</p>
                  <p className="text-2xl font-bold text-white">{stats.totalDias - stats.diasFolga}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border border-slate-700 hover:border-green-500/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-600/20 rounded-lg">
                  <Clock className="h-5 w-5 text-green-300" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase">Horas Normais</p>
                  <p className="text-2xl font-bold text-white">{stats.totalHorasNormais.toFixed(1)}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border border-slate-700 hover:border-amber-500/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-600/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-amber-300" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase">HE 50%</p>
                  <p className="text-2xl font-bold text-amber-300">{stats.totalHE50.toFixed(1)}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border border-slate-700 hover:border-red-500/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-600/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-red-300" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase">HE 100%</p>
                  <p className="text-2xl font-bold text-red-300">{stats.totalHE100.toFixed(1)}h</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Linhas - Evolução Semanal */}
          <Card className="bg-slate-900/80 border border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Evolução de Horas por Semana</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dadosGrafico}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis dataKey="semana" stroke="#9CA3AF" axisLine={false} tickLine={false} />
                  <YAxis stroke="#9CA3AF" axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      borderColor: '#4B5563',
                      color: '#FFFFFF',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="horasNormais"
                    name="Horas Normais"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="horasExtras50"
                    name="HE 50%"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    dot={{ fill: '#F59E0B', r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="horasExtras100"
                    name="HE 100%"
                    stroke="#EF4444"
                    strokeWidth={2}
                    dot={{ fill: '#EF4444', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Pizza - Distribuição */}
          <Card className="bg-slate-900/80 border border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Distribuição de Horas</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosDistribuicao}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {dadosDistribuicao.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      borderColor: '#4B5563',
                      color: '#FFFFFF',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)} horas`, 'Total']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Resumo Financeiro */}
        {resumoMensal && (
          <Card className="bg-slate-900/80 border border-slate-700">
            <CardHeader className="border-b border-slate-700 pb-4">
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5 text-green-400" />
                Resumo Financeiro - {resumoMensal.periodo?.mes_ano?.replace('-', '/')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Salário Base</p>
                  <p className="text-2xl font-bold text-white">
                    {resumoMensal.valor_salario?.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">HE 50%</p>
                  <p className="text-2xl font-bold text-amber-300">
                    {resumoMensal.valor_he_50?.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">HE 100%</p>
                  <p className="text-2xl font-bold text-red-300">
                    {resumoMensal.valor_he_100?.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </p>
                </div>

                <div className="space-y-1 relative overflow-hidden rounded-lg bg-green-900/20 p-2 -m-2 border border-green-500/20">
                  <div className="absolute top-0 right-0 p-2 opacity-10">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                  </div>
                  <p className="text-xs text-green-400 uppercase tracking-wider font-semibold">Total a Pagar</p>
                  <p className="text-3xl font-bold text-green-300">
                    {resumoMensal.valor_total?.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </p>
                  <Badge className={
                    resumoMensal.status === 'Pago'
                      ? 'bg-green-500 text-white'
                      : 'bg-amber-500 text-white'
                  } variant="secondary">
                    {resumoMensal.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabela de Registros Diários */}
        <Card className="bg-slate-900/80 border border-slate-700">
          <CardHeader className="border-b border-slate-700 pb-4">
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-blue-400" />
              Registros Diários - {periodo.replace('-', '/')}
              <Badge variant="outline" className="ml-auto border-slate-600 text-slate-400 text-xs">
                {registrosPeriodo.length} registros
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-800/50">
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Data</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Turno</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Entrada</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Saída</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Horas</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold text-amber-400">HE 50%</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold text-red-400">HE 100%</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {registrosPeriodo.map((registro, index) => (
                    <tr
                      key={registro.id}
                      className={`border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors ${index % 2 === 0 ? 'bg-transparent' : 'bg-slate-800/20'}`}
                    >
                      <td className="py-3 px-4 text-white font-medium">
                        {new Date(registro.data_trabalho).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={
                          registro.turno === 'Dia'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : registro.turno === 'Noite'
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                            : 'bg-slate-600/20 text-slate-300 border-slate-500/30'
                        }>
                          {registro.turno}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{registro.hora_entrada || '-'}</td>
                      <td className="py-3 px-4 text-slate-300">{registro.hora_saida || '-'}</td>
                      <td className="py-3 px-4 text-white font-mono">{registro.horas_trabalhadas?.toFixed(1) || '0'}h</td>
                      <td className="py-3 px-4 text-amber-300 font-mono">{registro.horas_extras_50 || 0}h</td>
                      <td className="py-3 px-4 text-red-300 font-mono">{registro.horas_extras_100 || 0}h</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(registro.status)}>
                          {registro.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {registrosPeriodo.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <AlertCircle className="h-10 w-10 mb-3 opacity-50" />
                <p>Nenhum registro encontrado para este período</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-800">
          <Button
            variant="ghost"
            onClick={() => navigate('/pessoal')}
            className="text-slate-400 hover:text-white hover:bg-slate-800 w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Lista de Pessoal
          </Button>

          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              <FileText className="h-4 w-4 mr-2" />
              Solicitar Correção
            </Button>
            <Button
              className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-500/20"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Aprovar Período
            </Button>
          </div>
        </div>

      </div>
    </EscalasLayout>
  );
}