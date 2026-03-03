import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User, Calendar, Clock, DollarSign, TrendingUp, FileText,
  Download, Printer, ArrowLeft, CheckCircle, PieChart as PieChartIcon
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

export default function AnaliseIndividual() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [funcionario, setFuncionario] = useState<any>(null);
  const [periodo, setPeriodo] = useState<string>('2025-01');
  const [registrosPeriodo, setRegistrosPeriodo] = useState<any[]>([]);
  const [resumoMensal, setResumoMensal] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [periodosDisponiveis, setPeriodosDisponiveis] = useState<string[]>(['2025-01', '2024-12', '2024-11']);

  // Cores para gráficos
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  useEffect(() => {
    console.log('AnaliseIndividual carregado - ID:', id);
    carregarDadosFuncionario();
  }, [id, periodo]);

  const carregarDadosFuncionario = async () => {
    try {
      setIsLoading(true);

      // Dados mockados para exemplo
      const funcData = {
        id: id || '1',
        nome_completo: id ? 'João Silva' : 'Análise Geral',
        matricula: id ? 'FUNC001' : '',
        funcao: id ? 'Operador' : 'Todos os colaboradores',
        turma: 'A',
        status: 'Ativo',
        data_contratacao: '2023-01-15'
      };

      // Registros mockados
      const registrosMock = [
        { id: 1, funcionario_id: id || '1', data_trabalho: '2025-01-16', horas_trabalhadas: 8, horas_extras_50: 1, horas_extras_100: 0, turno: 'Dia' },
        { id: 2, funcionario_id: id || '1', data_trabalho: '2025-01-17', horas_trabalhadas: 8, horas_extras_50: 0, horas_extras_100: 2, turno: 'Noite' },
        { id: 3, funcionario_id: id || '1', data_trabalho: '2025-01-18', horas_trabalhadas: 8, horas_extras_50: 1.5, horas_extras_100: 0, turno: 'Dia' },
        { id: 4, funcionario_id: id || '1', data_trabalho: '2025-01-19', horas_trabalhadas: 8, horas_extras_50: 0, horas_extras_100: 1, turno: 'Dia' },
        { id: 5, funcionario_id: id || '1', data_trabalho: '2025-01-20', horas_trabalhadas: 4, horas_extras_50: 0, horas_extras_100: 0, turno: 'Folga' },
      ];

      // Resumo mockado
      const resumoMock = {
        valor_salario: 3500.00,
        valor_he_50: 450.50,
        valor_he_100: 320.75,
        valor_total: 4271.25,
        status: 'Pago',
        periodo: { mes_ano: periodo }
      };

      setFuncionario(funcData);
      setRegistrosPeriodo(registrosMock);
      setResumoMensal(resumoMock);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do funcionário');
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
      horasAdicionais: 0,
      diasFolga: registrosPeriodo.filter(r => r.turno === 'Folga').length,
      diasFalta: 0,
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
    toast.success('Relatório gerado com sucesso!');
  };

  const imprimirRelatorio = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <EscalasLayout 
        title="Análise Individual" 
        subtitle="Carregando dados..."
      >
        <div className="flex justify-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
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
      subtitle={`Matrícula: ${funcionario.matricula || 'Sem matrícula'} | Função: ${funcionario.funcao}`}
    >
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Cabeçalho com Controles */}
        <Card className="bg-slate-900/80 border border-slate-700">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600/20 rounded-xl">
                  <User className="h-8 w-8 text-blue-300" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{funcionario.nome_completo}</h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge className="bg-slate-700 text-white">
                      {funcionario.funcao}
                    </Badge>
                    <Badge className="bg-slate-700 text-white">
                      Turma {funcionario.turma}
                    </Badge>
                    <Badge className={
                      funcionario.status === 'Ativo'
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-red-500/20 text-red-300'
                    }>
                      {funcionario.status}
                    </Badge>
                    {funcionario.data_contratacao && (
                      <span className="text-sm text-slate-400">
                        Desde {new Date(funcionario.data_contratacao).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-3">
                <Select value={periodo} onValueChange={setPeriodo}>
                  <SelectTrigger className="w-full md:w-48 bg-slate-800/60 text-white border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600 text-white">
                    {periodosDisponiveis.map(p => (
                      <SelectItem key={p} value={p} className="text-white hover:bg-slate-700">
                        {p.replace('-', '/')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={exportarRelatorio}
                    className="border-green-600/30 text-green-300 hover:bg-green-800/40 gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Exportar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={imprimirRelatorio}
                    className="border-blue-600/30 text-blue-300 hover:bg-blue-800/40 gap-2"
                  >
                    <Printer className="h-4 w-4" />
                    Imprimir
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900/80 border border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-600/20 rounded-lg">
                  <Calendar className="h-5 w-5 text-cyan-300" />
                </div>
                <div>
                  <p className="text-sm text-slate-300">Dias Trabalhados</p>
                  <p className="text-2xl font-bold text-white">{stats.totalDias}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-600/20 rounded-lg">
                  <Clock className="h-5 w-5 text-green-300" />
                </div>
                <div>
                  <p className="text-sm text-slate-300">Horas Normais</p>
                  <p className="text-2xl font-bold text-white">{stats.totalHorasNormais.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-600/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-amber-300" />
                </div>
                <div>
                  <p className="text-sm text-slate-300">HE 50%</p>
                  <p className="text-2xl font-bold text-amber-300">{stats.totalHE50.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-600/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-red-300" />
                </div>
                <div>
                  <p className="text-sm text-slate-300">HE 100%</p>
                  <p className="text-2xl font-bold text-red-300">{stats.totalHE100.toFixed(1)}</p>
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
              <CardTitle className="text-white">Evolução de Horas por Semana</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dadosGrafico}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="semana" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      borderColor: '#4B5563',
                      color: '#FFFFFF'
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="horasNormais"
                    name="Horas Normais"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="horasExtras50"
                    name="HE 50%"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="horasExtras100"
                    name="HE 100%"
                    stroke="#EF4444"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Pizza - Distribuição */}
          <Card className="bg-slate-900/80 border border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Distribuição de Horas</CardTitle>
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
                  >
                    {dadosDistribuicao.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      borderColor: '#4B5563',
                      color: '#FFFFFF'
                    }}
                    formatter={(value) => [`${value} horas`, 'Quantidade']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Resumo Financeiro */}
        {resumoMensal && (
          <Card className="bg-slate-900/80 border border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Resumo Financeiro - {resumoMensal.periodo?.mes_ano?.replace('-', '/')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-slate-300">Salário Base</p>
                  <p className="text-2xl font-bold text-white">
                    {resumoMensal.valor_salario?.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-slate-300">HE 50%</p>
                  <p className="text-2xl font-bold text-amber-300">
                    {resumoMensal.valor_he_50?.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-slate-300">HE 100%</p>
                  <p className="text-2xl font-bold text-red-300">
                    {resumoMensal.valor_he_100?.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-slate-300">Total</p>
                  <p className="text-2xl font-bold text-green-300">
                    {resumoMensal.valor_total?.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </p>
                  <Badge className={
                    resumoMensal.status === 'Pago'
                      ? 'bg-green-500/20 text-green-300'
                      : resumoMensal.status === 'Aprovado'
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }>
                    {resumoMensal.status}
                  </Badge>
                </div>
              </div>

              {resumoMensal.observacoes && (
                <div className="mt-6 p-4 rounded-lg bg-slate-800/60 border border-slate-600">
                  <p className="text-sm text-slate-400 mb-2">Observações:</p>
                  <p className="text-slate-300">{resumoMensal.observacoes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tabela de Registros Diários */}
        <Card className="bg-slate-900/80 border border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Registros Diários - {periodo.replace('-', '/')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Data</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Turno</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Entrada</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Saída</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Horas Normais</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">HE 50%</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">HE 100%</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {registrosPeriodo.map((registro, index) => (
                    <tr
                      key={registro.id}
                      className={`border-b border-slate-600/30 ${index % 2 === 0 ? 'bg-slate-800/20' : 'bg-slate-800/40'}`}
                    >
                      <td className="py-3 px-4 text-white">
                        {new Date(registro.data_trabalho).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={
                          registro.turno === 'Dia'
                            ? 'bg-amber-600/20 text-amber-300'
                            : registro.turno === 'Noite'
                            ? 'bg-indigo-600/20 text-indigo-300'
                            : 'bg-slate-600/20 text-slate-300'
                        }>
                          {registro.turno}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-white">{registro.hora_entrada || '07:00'}</td>
                      <td className="py-3 px-4 text-white">{registro.hora_saida || '16:00'}</td>
                      <td className="py-3 px-4 text-white">{registro.horas_trabalhadas?.toFixed(1) || '0'}h</td>
                      <td className="py-3 px-4 text-amber-300">{registro.horas_extras_50 || 0}h</td>
                      <td className="py-3 px-4 text-red-300">{registro.horas_extras_100 || 0}h</td>
                      <td className="py-3 px-4">
                        <Badge className={
                          registro.status === 'Confirmado'
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }>
                          {registro.status || 'Confirmado'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {registrosPeriodo.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum registro encontrado para este período</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => navigate('/escalas')}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Escalas
          </Button>

          <Button
            onClick={() => navigate(`/escalas/ajustes/${id}?periodo=${periodo}`)}
            className="bg-cyan-600 hover:bg-cyan-700 gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Solicitar Ajustes
          </Button>
        </div>

      </div>
    </EscalasLayout>
  );
}