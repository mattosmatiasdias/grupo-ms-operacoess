// src/pages/Visuais.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Filter, PieChart as PieChartIcon, ArrowLeft, Menu, X, Ship, Building2, Warehouse, Globe, Factory, Clock, Package, Home, Users, Calculator, RefreshCw, Database, Anchor, Weight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// --- IMPORTAÇÕES RECHARTS (Gráficos Profissionais) ---
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, Rectangle 
} from 'recharts';

// --- INTERFACES ---
interface LocalData {
  local: string;
  horas: number;
  quantidade: number;
  porcentagem: number;
}

interface TagGenericoData {
  tag_generico: string;
  horas: number;
  quantidade: number;
  porcentagem?: number;
}

interface CategoriaData {
  categoria_nome: string;
  horas: number;
  quantidade: number;
  porcentagem?: number;
}

interface NavioCargaData {
  id: string;
  nome_navio: string;
  carga: string;
  navio_carga: string;
  horas: number;
  quantidade: number;
  quantidade_total: number;
  navio_id?: string;
  tons_produzidos: number;
  percentual_cumprido: number;
}

interface RateioRHData {
  centro_resultado: string;
  truck: {
    horas: number;
    porcentagem: number;
  };
  operador: {
    horas: number;
    porcentagem: number;
  };
  carreteiro: {
    horas: number;
    porcentagem: number;
  };
}

type VistaAtiva = 'GERAL' | 'NAVIO' | 'ALBRAS' | 'SANTOS_BRASIL' | 'HYDRO' | 'RATEIO_RH';

// --- COMPONENTES VISUAIS AUXILIARES ---

// Paleta de Cores
const COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#8B5CF6', // Violet
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#EC4899', // Pink
  '#6366F1', // Indigo
];

// Tooltip Personalizado para Dark Mode
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 p-3 rounded-lg shadow-xl z-50">
        <p className="text-slate-200 text-sm font-bold mb-1 border-b border-slate-700 pb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm flex items-center justify-between gap-4">
            <span style={{ color: entry.color }}>{entry.name}:</span>
            <span className="text-white font-mono">{entry.value.toFixed(1)}h</span>
          </p>
        ))}
        {payload[0].payload.quantidade !== undefined && (
           <p className="text-xs text-slate-400 mt-2 pt-1 border-t border-slate-700/50">
             {payload[0].payload.quantidade} apontamento{payload[0].payload.quantidade !== 1 ? 's' : ''}
           </p>
        )}
      </div>
    );
  }
  return null;
};

// Componente Gráfico de Pizza (Donut)
const GraficoPizzaLocais = ({ dados, totalHoras }: { dados: LocalData[], totalHoras: number }) => {
  if (dados.length === 0) return null;
  
  return (
    <div className="flex flex-col md:flex-row items-center justify-around gap-8 w-full">
      <div className="relative w-[280px] h-[280px] flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dados}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="horas"
              strokeWidth={0}
            >
              {dados.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Texto Central no Donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold text-white">{totalHoras.toFixed(0)}h</span>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest">Total</span>
        </div>
      </div>

      {/* Legenda Lateral */}
      <div className="flex-1 w-full space-y-2">
        {dados.map((item, index) => (
          <div key={item.local} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <span className="text-slate-200 text-sm font-medium truncate max-w-[120px]">{item.local}</span>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-white font-bold text-sm">{item.horas.toFixed(1)}h</div>
              <div className="text-xs text-slate-400 font-mono">{item.porcentagem}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente Gráfico de Barras Vertical
const GraficoBarrasVertical = ({ dados, titulo, dataKey, nameKey }: { dados: any[], titulo: string, dataKey: string, nameKey: string }) => {
  if (dados.length === 0) return null;

  return (
    <div className="space-y-4 h-full flex flex-col">
      {titulo && <h3 className="text-slate-200 font-semibold text-lg px-1">{titulo}</h3>}
      <div className="flex-1 bg-slate-800/20 rounded-xl p-4 border border-slate-700/50 min-h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dados} margin={{ top: 20, right: 10, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
            <XAxis 
              dataKey={nameKey} 
              angle={-45} 
              textAnchor="end" 
              height={80}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis 
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
            <Bar 
              dataKey={dataKey} 
              radius={[4, 4, 0, 0]}
              fill="#3B82F6"
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.5}/>
                </linearGradient>
              </defs>
              <Rectangle fill="url(#barGradient)" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
const Visuais = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [vistaAtiva, setVistaAtiva] = useState<VistaAtiva>('NAVIO'); // MUDADO PARA NAVIO COMO PADRÃO
  const [atualizandoCR, setAtualizandoCR] = useState(false);
  
  // Função para formatar data
  const formatarDataBR = (dataString: string) => {
    try {
      const data = new Date(dataString + 'T00:00:00');
      return data.toLocaleDateString('pt-BR');
    } catch (error) {
      return dataString;
    }
  };

  // Função para obter o período de 16 a 15
  const getPeriodoPadrao = () => {
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth() + 1;
    
    let dataInicial, dataFinal;
    
    if (hoje.getDate() >= 16) {
      dataInicial = `${anoAtual}-${String(mesAtual).padStart(2, '0')}-16`;
      let proximoMes = mesAtual + 1;
      let proximoAno = anoAtual;
      if (proximoMes > 12) { proximoMes = 1; proximoAno = anoAtual + 1; }
      dataFinal = `${proximoAno}-${String(proximoMes).padStart(2, '0')}-15`;
    } else {
      let mesAnterior = mesAtual - 1;
      let anoAnterior = anoAtual;
      if (mesAnterior < 1) { mesAnterior = 12; anoAnterior = anoAtual - 1; }
      dataInicial = `${anoAnterior}-${String(mesAnterior).padStart(2, '0')}-16`;
      dataFinal = `${anoAtual}-${String(mesAtual).padStart(2, '0')}-15`;
    }
    
    return { dataInicial, dataFinal };
  };

  const getPeriodosDisponiveis = () => {
    const periodos = [];
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth() + 1;
    
    for (let i = 0; i < 6; i++) {
      let mes = mesAtual - i;
      let ano = anoAtual;
      while (mes < 1) { mes += 12; ano -= 1; }
      const dataInicial = `${ano}-${String(mes).padStart(2, '0')}-16`;
      let proximoMes = mes + 1;
      let proximoAno = ano;
      if (proximoMes > 12) { proximoMes = 1; proximoAno = ano + 1; }
      const dataFinal = `${proximoAno}-${String(proximoMes).padStart(2, '0')}-15`;
      periodos.push({
        value: `${dataInicial}_${dataFinal}`,
        label: `${formatarDataBR(dataInicial)} a ${formatarDataBR(dataFinal)}`
      });
    }
    return periodos;
  };

  // Estados
  const [filtros, setFiltros] = useState({ periodo: '', local: 'todos' });
  const [dadosGeral, setDadosGeral] = useState<{ locais: LocalData[]; tags: TagGenericoData[]; categorias: CategoriaData[] }>({ locais: [], tags: [], categorias: [] });
  const [dadosNavio, setDadosNavio] = useState<{ 
    navios: NavioCargaData[]; 
    detalhesNavios: Record<string, TagGenericoData[]>; 
    categoriasNavios: Record<string, CategoriaData[]>;
    totaisPeriodo: { tons_produzidos: number; quantidade_prevista: number; percentual_geral: number };
  }>({ 
    navios: [], 
    detalhesNavios: {}, 
    categoriasNavios: {},
    totaisPeriodo: { tons_produzidos: 0, quantidade_prevista: 0, percentual_geral: 0 }
  });
  const [dadosAlbras, setDadosAlbras] = useState<{ tags: TagGenericoData[]; categorias: CategoriaData[] }>({ tags: [], categorias: [] });
  const [dadosSantosBrasil, setDadosSantosBrasil] = useState<{ tags: TagGenericoData[]; categorias: CategoriaData[] }>({ tags: [], categorias: [] });
  const [dadosHydro, setDadosHydro] = useState<{ tags: TagGenericoData[]; categorias: CategoriaData[] }>({ tags: [], categorias: [] });
  const [dadosRateioRH, setDadosRateioRH] = useState<RateioRHData[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [inicializando, setInicializando] = useState(true);
  const [periodos, setPeriodos] = useState<{value: string, label: string}[]>([]);
  const [totais, setTotais] = useState({ horas: 0, quantidade: 0 });

  const locais = [
    { value: 'todos', label: 'Todos os Locais' },
    { value: 'HYDRO', label: 'HYDRO' },
    { value: 'ALBRAS', label: 'ALBRAS' },
    { value: 'SANTOS BRASIL', label: 'SANTOS BRASIL' },
    { value: 'NAVIO', label: 'NAVIOS' },
    { value: 'NÃO INFORMADO', label: 'Não Informado' }
  ];

  const botoesMenu = [
    { id: 'GERAL' as VistaAtiva, icon: Globe, label: 'VISÃO GERAL', color: 'bg-blue-600 hover:bg-blue-700', iconBg: 'bg-blue-500/20', iconColor: 'text-blue-300' },
    { id: 'HYDRO' as VistaAtiva, icon: Factory, label: 'HYDRO', color: 'bg-cyan-600 hover:bg-cyan-700', iconBg: 'bg-cyan-500/20', iconColor: 'text-cyan-300' },
    { id: 'NAVIO' as VistaAtiva, icon: Ship, label: 'NAVIOS', color: 'bg-purple-600 hover:bg-purple-700', iconBg: 'bg-purple-500/20', iconColor: 'text-purple-300' },
    { id: 'ALBRAS' as VistaAtiva, icon: Warehouse, label: 'ALBRAS', color: 'bg-amber-600 hover:bg-amber-700', iconBg: 'bg-amber-500/20', iconColor: 'text-amber-300' },
    { id: 'SANTOS_BRASIL' as VistaAtiva, icon: Building2, label: 'SANTOS BRASIL', color: 'bg-red-600 hover:bg-red-700', iconBg: 'bg-red-500/20', iconColor: 'text-red-300' },
    { id: 'RATEIO_RH' as VistaAtiva, icon: Users, label: 'RATEIO RH', color: 'bg-green-600 hover:bg-green-700', iconBg: 'bg-green-500/20', iconColor: 'text-green-300' }
  ];

  // Inicializar períodos
  useEffect(() => {
    const inicializar = async () => {
      setInicializando(true);
      try {
        const periodosDisponiveis = getPeriodosDisponiveis();
        setPeriodos(periodosDisponiveis);
        const periodoPadrao = getPeriodoPadrao();
        const periodoAtual = `${periodoPadrao.dataInicial}_${periodoPadrao.dataFinal}`;
        setFiltros({ periodo: periodoAtual, local: 'todos' });
      } catch (error) {
        console.error('Erro ao inicializar:', error);
      } finally {
        setInicializando(false);
      }
    };
    inicializar();
  }, []);

  // Lógica de Atualização CR (Mantida Original)
  const executarAtualizacaoCR = async () => {
    setAtualizandoCR(true);
    try {
      toast.info('Iniciando atualização de Centros de Resultado...', { duration: 3000 });
      const { data, error } = await supabase.rpc('executar_sql_direto', {
        sql_query: `UPDATE public.registro_operacoes ro SET centro_resultado = CASE WHEN ro.op = 'HYDRO' THEN 'HYDRO - OPERACAO PORTUARIA CARVAO BAUXITA' WHEN ro.op = 'SANTOS BRASIL' THEN 'SANTOS BRASIL - PRANCHA' WHEN ro.op = 'ALBRAS' AND UPPER(TRIM(ro.carga)) IN ('COQUE', 'PICHE', 'FLUORETO', 'OUTROS') THEN 'ALBRAS - COQUE, PICHE E FLUORETO' WHEN ro.op = 'ALBRAS' AND UPPER(TRIM(ro.carga)) = 'LINGOTE' THEN 'ALBRAS - CINTAGEM E TRANSPORTE DE ALUMÍNIO' WHEN EXISTS (SELECT 1 FROM public.navios n WHERE n.id = ro.navio_id AND UPPER(TRIM(n.carga)) IN ('HIDRATO', 'CARVAO', 'BAUXITA')) THEN 'HYDRO - OPERACAO PORTUARIA CARVAO BAUXITA' WHEN EXISTS (SELECT 1 FROM public.navios n WHERE n.id = ro.navio_id AND UPPER(TRIM(n.carga)) IN ('COQUE', 'PICHE', 'FLUORETO')) THEN 'ALBRAS - COQUE, PICHE E FLUORETO' WHEN EXISTS (SELECT 1 FROM public.navios n WHERE n.id = ro.navio_id AND UPPER(TRIM(n.carga)) = 'LINGOTE') THEN 'ALBRAS - CINTAGEM E TRANSPORTE DE ALUMÍNIO' ELSE centro_resultado END WHERE ro.centro_resultado IS NULL;`
      });
      if (error) throw error;
      toast.success('Centros de Resultado atualizados com sucesso!', { duration: 5000 });
      if (filtros.periodo) buscarDadosEquipamentos();
    } catch (error: any) {
      console.error('Erro na atualização de CR:', error);
      toast.error(`Erro: ${error.message}`, { duration: 5000 });
    } finally {
      setAtualizandoCR(false);
    }
  };

  // Lógica de Busca de Dados (Adaptada para incluir produção)
  const buscarDadosEquipamentos = async () => {
    setCarregando(true);
    try {
      if (!filtros.periodo) { limparDados(); return; }
      const [dataInicial, dataFinal] = filtros.periodo.split('_');

      // 1. Buscar Navios com dados de produção
      const { data: todosNavios, error: errorNavios } = await supabase
        .from('navios')
        .select(`
          id, 
          nome_navio, 
          carga, 
          quantidade_prevista,
          registros_producao (
            data,
            tons_total
          )
        `);
      
      if (errorNavios) throw new Error(`Erro ao buscar navios: ${errorNavios.message}`);
      
      const naviosMap = new Map();
      const producaoPorNavio: Record<string, { total_tons: number; registros: any[] }> = {};

      todosNavios?.forEach(navio => {
        naviosMap.set(navio.id, {
          nome_navio: navio.nome_navio,
          carga: navio.carga || 'NÃO INFORMADO',
          quantidade_total: navio.quantidade_prevista || 0
        });

        // Calcular produção total do navio no período
        if (navio.registros_producao && navio.registros_producao.length > 0) {
          const producaoFiltrada = navio.registros_producao.filter((reg: any) => {
            return reg.data >= dataInicial && reg.data <= dataFinal;
          });

          const totalTons = producaoFiltrada.reduce((sum: number, reg: any) => {
            return sum + (Number(reg.tons_total) || 0);
          }, 0);

          producaoPorNavio[navio.id] = {
            total_tons: totalTons,
            registros: producaoFiltrada
          };
        } else {
          producaoPorNavio[navio.id] = { total_tons: 0, registros: [] };
        }
      });

      // 2. Buscar Operações
      const allOperacoes = await buscarComPaginacao(
        supabase.from('registro_operacoes')
          .select('id, op, data, navio_id, carga, centro_resultado')
          .gte('data', dataInicial).lte('data', dataFinal)
          .order('data', { ascending: false })
      );

      if (allOperacoes.length === 0) { limparDados(); return; }

      // 3. Buscar Equipamentos
      let queryEquipamentos = supabase
        .from('equipamentos')
        .select('local, horas_trabalhadas, registro_operacoes_id, tag_generico, tag, categoria_nome')
        .in('registro_operacoes_id', allOperacoes.map(op => op.id));

      if (filtros.local !== 'todos') queryEquipamentos = queryEquipamentos.eq('local', filtros.local);
      const allEquipamentos = await buscarComPaginacao(queryEquipamentos);

      processarDadosParaVistas(allEquipamentos, allOperacoes, naviosMap, producaoPorNavio, dataInicial, dataFinal);

    } catch (error: any) {
      console.error('Erro ao processar dados:', error);
      limparDados();
    } finally {
      setCarregando(false);
    }
  };

  const buscarComPaginacao = async (query: any) => {
    let allData: any[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;
    while (hasMore) {
      const from = page * pageSize;
      const to = from + pageSize - 1;
      const { data, error } = await query.range(from, to);
      if (error) throw error;
      if (data) allData = [...allData, ...data];
      hasMore = data && data.length === pageSize;
      page++;
    }
    return allData;
  };

  const limparDados = () => {
    setDadosGeral({ locais: [], tags: [], categorias: [] });
    setDadosNavio({ 
      navios: [], 
      detalhesNavios: {}, 
      categoriasNavios: {},
      totaisPeriodo: { tons_produzidos: 0, quantidade_prevista: 0, percentual_geral: 0 }
    });
    setDadosAlbras({ tags: [], categorias: [] });
    setDadosSantosBrasil({ tags: [], categorias: [] });
    setDadosHydro({ tags: [], categorias: [] });
    setDadosRateioRH([]);
    setTotais({ horas: 0, quantidade: 0 });
  };

  // Processamento de Dados (Adaptado para incluir produção)
  const processarDadosParaVistas = (equipamentos: any[], operacoes: any[], naviosMap: Map<any, any>, producaoPorNavio: Record<string, { total_tons: number; registros: any[] }>, dataInicial: string, dataFinal: string) => {
    const operacoesMap = new Map();
    operacoes.forEach(op => {
      let nome_navio = 'NÃO INFORMADO';
      let carga = op.carga || 'NÃO INFORMADO';
      let quantidade_total = 0;
      let tons_produzidos = 0;
      
      if (op.navio_id) {
        const navioInfo = naviosMap.get(op.navio_id);
        if (navioInfo) {
          nome_navio = navioInfo.nome_navio;
          if (carga === 'NÃO INFORMADO' && navioInfo.carga) carga = navioInfo.carga;
          quantidade_total = navioInfo.quantidade_total || 0;
          tons_produzidos = producaoPorNavio[op.navio_id]?.total_tons || 0;
        }
      }
      
      operacoesMap.set(op.id, {
        navio_id: op.navio_id, 
        carga: carga, 
        nome_navio: nome_navio,
        quantidade_total: quantidade_total, 
        tons_produzidos: tons_produzidos,
        centro_resultado: op.centro_resultado
      });
    });

    const horasTotais = equipamentos.reduce((sum, equip) => sum + (Number(equip.horas_trabalhadas) || 0), 0);
    const quantidadeTotal = equipamentos.length;
    setTotais({ horas: parseFloat(horasTotais.toFixed(1)), quantidade: quantidadeTotal });

    processarDadosGeral(equipamentos);
    processarDadosNavios(equipamentos, operacoesMap, producaoPorNavio);
    processarDadosPorLocal(equipamentos, 'HYDRO', setDadosHydro);
    processarDadosPorLocal(equipamentos, 'ALBRAS', setDadosAlbras);
    processarDadosPorLocal(equipamentos, 'SANTOS BRASIL', setDadosSantosBrasil);
    processarDadosRateioRH(equipamentos, operacoes);
  };

  const processarDadosGeral = (equipamentos: any[]) => {
    const agrupadoPorLocal = equipamentos.reduce((acc, equipamento) => {
      const local = equipamento.local || 'NÃO INFORMADO';
      const localNormalizado = local.includes('NAVIO') ? 'NAVIO' : local;
      if (!acc[localNormalizado]) acc[localNormalizado] = { horas: 0, quantidade: 0 };
      acc[localNormalizado].horas += Number(equipamento.horas_trabalhadas) || 0;
      acc[localNormalizado].quantidade += 1;
      return acc;
    }, {} as Record<string, { horas: number; quantidade: number }>);

    const locaisPrincipais = ['HYDRO', 'NAVIO', 'SANTOS BRASIL', 'ALBRAS'];
    const dadosLocalFiltrado = Object.entries(agrupadoPorLocal)
      .filter(([local]) => locaisPrincipais.includes(local))
      .map(([local, dados]) => ({
        local, horas: parseFloat(dados.horas.toFixed(1)), quantidade: dados.quantidade, porcentagem: 0
      }))
      .sort((a, b) => b.horas - a.horas);

    const totalHorasLocais = dadosLocalFiltrado.reduce((sum, item) => sum + item.horas, 0);
    const dadosLocaisComPorcentagem = dadosLocalFiltrado.map(item => ({
      ...item, porcentagem: totalHorasLocais > 0 ? Math.round((item.horas / totalHorasLocais) * 100) : 0
    }));

    const agrupadoPorTag = equipamentos.reduce((acc, equipamento) => {
      const tagGenerico = equipamento.tag_generico || 'OUTROS';
      if (!acc[tagGenerico]) acc[tagGenerico] = { horas: 0, quantidade: 0 };
      acc[tagGenerico].horas += Number(equipamento.horas_trabalhadas) || 0;
      acc[tagGenerico].quantidade += 1;
      return acc;
    }, {} as Record<string, { horas: number; quantidade: number }>);

    const dadosTags = Object.entries(agrupadoPorTag)
      .map(([tag_generico, dados]) => ({
        tag_generico: tag_generico === '' ? 'OUTROS' : tag_generico,
        horas: parseFloat(dados.horas.toFixed(1)), quantidade: dados.quantidade
      }))
      .sort((a, b) => b.horas - a.horas);

    const agrupadoPorCategoria = equipamentos.reduce((acc, equipamento) => {
      const categoria = equipamento.categoria_nome || 'OUTROS';
      if (!acc[categoria]) acc[categoria] = { horas: 0, quantidade: 0 };
      acc[categoria].horas += Number(equipamento.horas_trabalhadas) || 0;
      acc[categoria].quantidade += 1;
      return acc;
    }, {} as Record<string, { horas: number; quantidade: number }>);

    const dadosCategorias = Object.entries(agrupadoPorCategoria)
      .map(([categoria_nome, dados]) => ({
        categoria_nome, horas: parseFloat(dados.horas.toFixed(1)), quantidade: dados.quantidade
      }))
      .sort((a, b) => b.horas - a.horas);

    setDadosGeral({ locais: dadosLocaisComPorcentagem, tags: dadosTags, categorias: dadosCategorias });
  };

  const processarDadosNavios = (equipamentos: any[], operacoesMap: Map<any, any>, producaoPorNavio: Record<string, { total_tons: number; registros: any[] }>) => {
    const agrupadoPorNavioCarga: Record<string, NavioCargaData> = {};
    const detalhesPorNavioCarga: Record<string, Record<string, { horas: number; quantidade: number }>> = {};
    
    let totalTonsPeriodo = 0;
    let totalPrevistoPeriodo = 0;

    equipamentos.forEach(equipamento => {
      const operacao = operacoesMap.get(equipamento.registro_operacoes_id);
      if (operacao && operacao.navio_id && operacao.nome_navio !== 'NÃO INFORMADO') {
        const nomeNavio = operacao.nome_navio;
        const carga = operacao.carga;
        const quantidadeTotal = operacao.quantidade_total || 0;
        const tonsProduzidos = producaoPorNavio[operacao.navio_id]?.total_tons || 0;
        const tagGenerico = equipamento.tag_generico || 'OUTROS';
        const chaveNavioCarga = `${nomeNavio} - ${carga}`;
        const idUnico = `${nomeNavio}_${carga}_${operacao.navio_id}`;

        if (!agrupadoPorNavioCarga[idUnico]) {
          agrupadoPorNavioCarga[idUnico] = {
            id: idUnico, 
            nome_navio: nomeNavio, 
            carga: carga, 
            navio_carga: chaveNavioCarga,
            horas: 0, 
            quantidade: 0, 
            quantidade_total: quantidadeTotal, 
            tons_produzidos: tonsProduzidos,
            percentual_cumprido: quantidadeTotal > 0 ? (tonsProduzidos / quantidadeTotal) * 100 : 0,
            navio_id: operacao.navio_id
          };
          totalPrevistoPeriodo += quantidadeTotal;
          totalTonsPeriodo += tonsProduzidos;
        }
        
        agrupadoPorNavioCarga[idUnico].horas += Number(equipamento.horas_trabalhadas) || 0;
        agrupadoPorNavioCarga[idUnico].quantidade += 1;

        if (!detalhesPorNavioCarga[chaveNavioCarga]) detalhesPorNavioCarga[chaveNavioCarga] = {};
        if (!detalhesPorNavioCarga[chaveNavioCarga][tagGenerico]) detalhesPorNavioCarga[chaveNavioCarga][tagGenerico] = { horas: 0, quantidade: 0 };
        detalhesPorNavioCarga[chaveNavioCarga][tagGenerico].horas += Number(equipamento.horas_trabalhadas) || 0;
        detalhesPorNavioCarga[chaveNavioCarga][tagGenerico].quantidade += 1;
      }
    });

    const naviosArray = Object.values(agrupadoPorNavioCarga).sort((a, b) => b.horas - a.horas);

    const detalhesArray: Record<string, TagGenericoData[]> = {};
    Object.entries(detalhesPorNavioCarga).forEach(([navioCarga, tags]) => {
      detalhesArray[navioCarga] = Object.entries(tags)
        .map(([tag_generico, dados]) => ({
          tag_generico: tag_generico === '' ? 'OUTROS' : tag_generico,
          horas: parseFloat(dados.horas.toFixed(1)), 
          quantidade: dados.quantidade
        }))
        .sort((a, b) => b.horas - a.horas);
    });

    setDadosNavio({ 
      navios: naviosArray, 
      detalhesNavios: detalhesArray, 
      categoriasNavios: {},
      totaisPeriodo: { 
        tons_produzidos: totalTonsPeriodo, 
        quantidade_prevista: totalPrevistoPeriodo,
        percentual_geral: totalPrevistoPeriodo > 0 ? (totalTonsPeriodo / totalPrevistoPeriodo) * 100 : 0
      }
    });
  };

  const processarDadosPorLocal = (equipamentos: any[], localFiltro: string, setState: React.Dispatch<React.SetStateAction<{tags: TagGenericoData[], categorias: CategoriaData[]}>>) => {
    const equipamentosFiltrados = equipamentos.filter(equip => equip.local === localFiltro);
    const agrupadoPorTag = equipamentosFiltrados.reduce((acc, equipamento) => {
      const tagGenerico = equipamento.tag_generico || 'OUTROS';
      if (!acc[tagGenerico]) acc[tagGenerico] = { horas: 0, quantidade: 0 };
      acc[tagGenerico].horas += Number(equipamento.horas_trabalhadas) || 0;
      acc[tagGenerico].quantidade += 1;
      return acc;
    }, {} as Record<string, { horas: number; quantidade: number }>);

    const dadosTags = Object.entries(agrupadoPorTag)
      .map(([tag_generico, dados]) => ({
        tag_generico: tag_generico === '' ? 'OUTROS' : tag_generico,
        horas: parseFloat(dados.horas.toFixed(1)), 
        quantidade: dados.quantidade
      }))
      .sort((a, b) => b.horas - a.horas);
    
    const agrupadoPorCategoria = equipamentosFiltrados.reduce((acc, equipamento) => {
      const categoria = equipamento.categoria_nome || 'OUTROS';
      if (!acc[categoria]) acc[categoria] = { horas: 0, quantidade: 0 };
      acc[categoria].horas += Number(equipamento.horas_trabalhadas) || 0;
      acc[categoria].quantidade += 1;
      return acc;
    }, {} as Record<string, { horas: number; quantidade: number }>);

    const dadosCategorias = Object.entries(agrupadoPorCategoria)
      .map(([categoria_nome, dados]) => ({
        categoria_nome, 
        horas: parseFloat(dados.horas.toFixed(1)), 
        quantidade: dados.quantidade
      }))
      .sort((a, b) => b.horas - a.horas);

    setState({ tags: dadosTags, categorias: dadosCategorias });
  };

  const processarDadosRateioRH = (equipamentos: any[], operacoes: any[]) => {
    const operacoesMap = new Map();
    operacoes.forEach(op => { operacoesMap.set(op.id, { centro_resultado: op.centro_resultado || 'NÃO INFORMADO' }); });
    const categoriasFiltradas = ['TRUCK', 'OPERADOR', 'CARRETEIRO'];
    const equipamentosFiltrados = equipamentos.filter(equip => categoriasFiltradas.includes(equip.categoria_nome));

    const agrupadoPorCentroCategoria: Record<string, Record<string, number>> = {};
    equipamentosFiltrados.forEach(equipamento => {
      const operacao = operacoesMap.get(equipamento.registro_operacoes_id);
      if (!operacao) return;
      const centroResultado = operacao.centro_resultado || 'NÃO INFORMADO';
      const categoria = equipamento.categoria_nome;
      const horas = Number(equipamento.horas_trabalhadas) || 0;

      if (!agrupadoPorCentroCategoria[centroResultado]) agrupadoPorCentroCategoria[centroResultado] = { TRUCK: 0, OPERADOR: 0, CARRETEIRO: 0 };
      if (agrupadoPorCentroCategoria[centroResultado][categoria] !== undefined) {
        agrupadoPorCentroCategoria[centroResultado][categoria] += horas;
      }
    });

    const totaisCategorias = { TRUCK: 0, OPERADOR: 0, CARRETEIRO: 0 };
    Object.values(agrupadoPorCentroCategoria).forEach(centroData => {
      totaisCategorias.TRUCK += centroData.TRUCK;
      totaisCategorias.OPERADOR += centroData.OPERADOR;
      totaisCategorias.CARRETEIRO += centroData.CARRETEIRO;
    });

    const rateioData: RateioRHData[] = Object.entries(agrupadoPorCentroCategoria)
      .map(([centro_resultado, categorias]) => ({
        centro_resultado,
        truck: { horas: parseFloat(categorias.TRUCK.toFixed(3)), porcentagem: totaisCategorias.TRUCK > 0 ? parseFloat(((categorias.TRUCK / totaisCategorias.TRUCK) * 100).toFixed(2)) : 0 },
        operador: { horas: parseFloat(categorias.OPERADOR.toFixed(3)), porcentagem: totaisCategorias.OPERADOR > 0 ? parseFloat(((categorias.OPERADOR / totaisCategorias.OPERADOR) * 100).toFixed(2)) : 0 },
        carreteiro: { horas: parseFloat(categorias.CARRETEIRO.toFixed(3)), porcentagem: totaisCategorias.CARRETEIRO > 0 ? parseFloat(((categorias.CARRETEIRO / totaisCategorias.CARRETEIRO) * 100).toFixed(2)) : 0 }
      }))
      .sort((a, b) => {
        const ordem = ['HYDRO - OPERACAO PORTUARIA CARVAO BAUXITA', 'ALBRAS - CINTAGEM E TRANSPORTE DE ALUMÍNIO', 'ALBRAS - COQUE, PICHE E FLUORETO', 'SANTOS BRASIL - PRANCHA'];
        const indexA = ordem.indexOf(a.centro_resultado);
        const indexB = ordem.indexOf(b.centro_resultado);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.centro_resultado.localeCompare(b.centro_resultado);
      });

    if (Object.keys(agrupadoPorCentroCategoria).length > 0) {
      rateioData.push({
        centro_resultado: 'TOTAL',
        truck: { horas: parseFloat(totaisCategorias.TRUCK.toFixed(3)), porcentagem: 100 },
        operador: { horas: parseFloat(totaisCategorias.OPERADOR.toFixed(3)), porcentagem: 100 },
        carreteiro: { horas: parseFloat(totaisCategorias.CARRETEIRO.toFixed(3)), porcentagem: 100 }
      });
    }
    setDadosRateioRH(rateioData);
  };

  // Efeitos
  useEffect(() => {
    if (!inicializando && filtros.periodo) buscarDadosEquipamentos();
  }, [filtros, inicializando]);

  // --- RENDERIZAÇÃO DAS VISTAS ---

  const renderizarVistaAtiva = () => {
    switch (vistaAtiva) {
      case 'GERAL':
        return (
          <div className="space-y-6">
            <Card className="bg-slate-900/40 border-slate-800 shadow-xl">
              <CardHeader className="bg-slate-800/30 border-b border-slate-800/50">
                <CardTitle className="text-slate-100 flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-blue-500" />
                  Distribuição de Horas por Local
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {filtros.periodo ? `${formatarDataBR(filtros.periodo.split('_')[0])} a ${formatarDataBR(filtros.periodo.split('_')[1])}` : 'Selecione um período'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                {carregando ? <div className="h-64 flex items-center justify-center text-slate-500">Carregando...</div> : 
                 dadosGeral.locais.length > 0 ? <GraficoPizzaLocais dados={dadosGeral.locais} totalHoras={totais.horas} /> : 
                 <div className="h-40 flex items-center justify-center text-slate-500">Sem dados</div>}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-900/40 border-slate-800 shadow-xl h-[450px]">
                <CardHeader className="bg-slate-800/30 border-b border-slate-800/50 pb-3">
                  <CardTitle className="text-slate-100 text-lg">Horas por Tag Genérico</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 h-[calc(100%-70px)]">
                  {dadosGeral.tags.length > 0 ? <GraficoBarrasVertical dados={dadosGeral.tags} titulo="" dataKey="horas" nameKey="tag_generico" /> : <div className="h-full flex items-center justify-center text-slate-500">Sem dados</div>}
                </CardContent>
              </Card>

              <Card className="bg-slate-900/40 border-slate-800 shadow-xl h-[450px]">
                <CardHeader className="bg-slate-800/30 border-b border-slate-800/50 pb-3">
                  <CardTitle className="text-slate-100 text-lg">Horas por Categoria</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 h-[calc(100%-70px)]">
                  {dadosGeral.categorias.length > 0 ? <GraficoBarrasVertical dados={dadosGeral.categorias} titulo="" dataKey="horas" nameKey="categoria_nome" /> : <div className="h-full flex items-center justify-center text-slate-500">Sem dados</div>}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'NAVIO':
        return (
          <div className="space-y-6">
            {/* Cards de Métricas de Produção */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-slate-900 to-slate-900/60 border-slate-800 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400">
                      <Anchor className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Navios no Período</p>
                      <p className="text-3xl font-bold text-white">{dadosNavio.navios.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-900 to-slate-900/60 border-slate-800 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-emerald-500/20 text-emerald-400">
                      <Weight className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Toneladas Produzidas</p>
                      <p className="text-3xl font-bold text-white">{dadosNavio.totaisPeriodo.tons_produzidos.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-900 to-slate-900/60 border-slate-800 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">% Cumprimento</p>
                      <p className="text-3xl font-bold text-white">{dadosNavio.totaisPeriodo.percentual_geral.toFixed(1)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-900/40 border-slate-800 shadow-xl">
              <CardHeader className="bg-slate-800/30 border-b border-slate-800/50">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-slate-100 flex items-center gap-2">
                      <Ship className="w-5 h-5 text-purple-400" />
                      Análise por Navio
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Operações e produção no período selecionado
                    </CardDescription>
                  </div>
                  <div className="flex gap-6">
                    <div className="text-right">
                      <div className="text-xs text-slate-500 uppercase">Horas Totais</div>
                      <div className="text-xl font-bold text-white">{dadosNavio.navios.reduce((a,b) => a + b.horas, 0).toFixed(1)}h</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500 uppercase">Apontamentos</div>
                      <div className="text-xl font-bold text-white">{dadosNavio.navios.reduce((a,b) => a + b.quantidade, 0)}</div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {carregando ? (
                  <div className="p-8 text-center text-slate-500">Carregando navios...</div>
                ) : dadosNavio.navios.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-slate-700/50">
                    <table className="w-full text-sm text-left text-slate-300">
                      <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                        <tr>
                          <th className="px-6 py-4 font-medium">Navio / Carga</th>
                          <th className="px-6 py-4 text-right font-medium">Horas</th>
                          <th className="px-6 py-4 text-right font-medium">Apont.</th>
                          <th className="px-6 py-4 text-right font-medium">Produção (Tons)</th>
                          <th className="px-6 py-4 text-right font-medium">Previsto</th>
                          <th className="px-6 py-4 text-right font-medium">% Cumprido</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {dadosNavio.navios.map((navio) => (
                          <tr key={navio.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-6 py-4 font-medium text-white">
                              <div className="flex items-center gap-2">
                                <Ship className="w-4 h-4 text-purple-400" />
                                <span>{navio.navio_carga}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right text-blue-300 font-mono">{navio.horas.toFixed(1)}h</td>
                            <td className="px-6 py-4 text-right text-slate-400">{navio.quantidade}</td>
                            <td className="px-6 py-4 text-right text-emerald-400 font-mono font-bold">{navio.tons_produzidos.toFixed(2)}</td>
                            <td className="px-6 py-4 text-right text-slate-400">{navio.quantidade_total.toFixed(2)}</td>
                            <td className="px-6 py-4 text-right">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                navio.percentual_cumprido >= 90 ? 'bg-green-500/20 text-green-400' :
                                navio.percentual_cumprido >= 70 ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {navio.percentual_cumprido.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-800/40 border-t border-slate-700">
                        <tr>
                          <td className="px-6 py-4 font-bold text-white">TOTAL DO PERÍODO</td>
                          <td className="px-6 py-4 text-right font-bold text-blue-300">
                            {dadosNavio.navios.reduce((a,b) => a + b.horas, 0).toFixed(1)}h
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-slate-300">
                            {dadosNavio.navios.reduce((a,b) => a + b.quantidade, 0)}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-emerald-400">
                            {dadosNavio.totaisPeriodo.tons_produzidos.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-slate-300">
                            {dadosNavio.totaisPeriodo.quantidade_prevista.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-right font-bold">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              dadosNavio.totaisPeriodo.percentual_geral >= 90 ? 'bg-green-500/20 text-green-400' :
                              dadosNavio.totaisPeriodo.percentual_geral >= 70 ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {dadosNavio.totaisPeriodo.percentual_geral.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500">Sem dados de navios no período</div>
                )}
              </CardContent>
            </Card>
            
            <div className="space-y-6">
              {Object.entries(dadosNavio.detalhesNavios).slice(0, 3).map(([navioCarga, tags]) => (
                <Card key={navioCarga} className="bg-slate-900/40 border-slate-800 shadow-xl h-[400px]">
                  <CardHeader className="bg-slate-800/30 border-b border-slate-800/50 pb-2">
                    <CardTitle className="text-slate-200 text-base truncate flex items-center gap-2">
                      <Ship className="w-4 h-4 text-purple-400" />
                      {navioCarga} - Detalhamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 h-[calc(100%-60px)]">
                    <GraficoBarrasVertical dados={tags} titulo="" dataKey="horas" nameKey="tag_generico" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'HYDRO':
        return (
          <Card className="bg-slate-900/40 border-slate-800 shadow-xl h-[500px]">
             <CardHeader className="bg-slate-800/30 border-b border-slate-800/50">
               <CardTitle className="text-slate-100 flex items-center gap-2">
                 <Factory className="w-5 h-5 text-cyan-400" />
                 HYDRO - Distribuição
               </CardTitle>
             </CardHeader>
             <CardContent className="pt-6 h-[calc(100%-80px)]">
                <GraficoBarrasVertical dados={dadosHydro.tags} titulo="" dataKey="horas" nameKey="tag_generico" />
             </CardContent>
          </Card>
        );
        
      case 'ALBRAS':
        return (
           <Card className="bg-slate-900/40 border-slate-800 shadow-xl h-[500px]">
             <CardHeader className="bg-slate-800/30 border-b border-slate-800/50">
               <CardTitle className="text-slate-100 flex items-center gap-2">
                 <Warehouse className="w-5 h-5 text-amber-400" />
                 ALBRAS - Distribuição
               </CardTitle>
             </CardHeader>
             <CardContent className="pt-6 h-[calc(100%-80px)]">
                <GraficoBarrasVertical dados={dadosAlbras.tags} titulo="" dataKey="horas" nameKey="tag_generico" />
             </CardContent>
           </Card>
        );

      case 'SANTOS_BRASIL':
        return (
           <Card className="bg-slate-900/40 border-slate-800 shadow-xl h-[500px]">
             <CardHeader className="bg-slate-800/30 border-b border-slate-800/50">
               <CardTitle className="text-slate-100 flex items-center gap-2">
                 <Building2 className="w-5 h-5 text-red-400" />
                 SANTOS BRASIL - Distribuição
               </CardTitle>
             </CardHeader>
             <CardContent className="pt-6 h-[calc(100%-80px)]">
                <GraficoBarrasVertical dados={dadosSantosBrasil.tags} titulo="" dataKey="horas" nameKey="tag_generico" />
             </CardContent>
           </Card>
        );

      case 'RATEIO_RH':
        return (
          <Card className="bg-slate-900/40 border-slate-800 shadow-xl overflow-hidden">
            <CardHeader className="bg-slate-800/30 border-b border-slate-800/50">
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-green-400" />
                Rateio RH
              </CardTitle>
              <CardDescription className="text-slate-400">
                Distribuição de horas por Centro de Resultado
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-900/80 border-b border-slate-700">
                    <tr>
                      <th className="px-6 py-4">Centro de Resultado</th>
                      <th className="px-6 py-4 text-blue-400">Truck</th>
                      <th className="px-6 py-4 text-amber-400">Operador</th>
                      <th className="px-6 py-4 text-purple-400">Carreteiro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {dadosRateioRH.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-200">{item.centro_resultado}</td>
                        <td className="px-6 py-4 text-slate-300">
                          <div className="font-bold font-mono">{item.truck.horas.toFixed(2)}h</div>
                          <div className="text-xs text-slate-500">{item.truck.porcentagem.toFixed(1)}%</div>
                        </td>
                        <td className="px-6 py-4 text-slate-300">
                          <div className="font-bold font-mono">{item.operador.horas.toFixed(2)}h</div>
                          <div className="text-xs text-slate-500">{item.operador.porcentagem.toFixed(1)}%</div>
                        </td>
                        <td className="px-6 py-4 text-slate-300">
                          <div className="font-bold font-mono">{item.carreteiro.horas.toFixed(2)}h</div>
                          <div className="text-xs text-slate-500">{item.carreteiro.porcentagem.toFixed(1)}%</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        );
        
      default: return null;
    }
  };

  if (inicializando) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Carregando Dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Layout Desktop */}
      <div className="hidden lg:flex min-h-screen">
        {/* Sidebar */}
        <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col">
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
                <div className="bg-blue-600/20 p-2 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-blue-500" />
                </div>
                <h1 className="text-xl font-bold text-white tracking-tight">Dashboard Ops</h1>
            </div>
          </div>

          <div className="p-4 space-y-1 overflow-y-auto flex-1">
            <div className="px-2 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Vistas</div>
            {botoesMenu.map((botao) => (
              <Button
                key={botao.id}
                onClick={() => setVistaAtiva(botao.id)}
                variant={vistaAtiva === botao.id ? "secondary" : "ghost"}
                className={`w-full justify-start h-10 ${vistaAtiva === botao.id ? 'bg-slate-800 text-white hover:bg-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
              >
                <botao.icon className="mr-3 h-4 w-4" />
                {botao.label}
              </Button>
            ))}
          </div>

          <div className="p-4 border-t border-slate-800 bg-slate-900/50">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white justify-start"
            >
              <Home className="mr-2 h-4 w-4" />
              Menu Inicial
            </Button>
            <div className="mt-4 flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">
                    {userProfile?.full_name?.substring(0,2).toUpperCase() || 'US'}
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-white leading-tight">{userProfile?.full_name || 'Usuário'}</span>
                    <span className="text-xs text-slate-500">Online</span>
                </div>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 overflow-y-auto bg-slate-950/50">
          {/* Header Fixo */}
          <div className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/50 px-8 py-4">
             <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
               <h2 className="text-2xl font-bold text-white">{vistaAtiva.replace('_', ' ')}</h2>
               <div className="flex items-center gap-3">
                  <Select value={filtros.periodo} onValueChange={(v) => setFiltros({...filtros, periodo: v})}>
                    <SelectTrigger className="w-[280px] bg-slate-900 border-slate-700 text-white focus:ring-0 focus:ring-offset-0 h-9">
                      <SelectValue placeholder="Selecione o período" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700 text-white">
                      {periodos.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={buscarDadosEquipamentos} 
                    disabled={carregando || !filtros.periodo}
                    className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4"
                  >
                    {carregando ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Filter className="w-4 h-4" />}
                  </Button>
                  <Button 
                    onClick={executarAtualizacaoCR}
                    disabled={atualizandoCR}
                    variant="outline"
                    className="border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10 h-9 px-4"
                    title="Atualizar Centros de Resultado"
                  >
                    {atualizandoCR ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Database className="w-4 h-4" />}
                  </Button>
               </div>
             </div>
          </div>

          <main className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Cards de Métricas Rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               <Card className="bg-slate-900/40 border-slate-800 p-4 flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500"><Clock className="w-5 h-5"/></div>
                  <div>
                     <div className="text-slate-500 text-xs font-bold uppercase">Total Horas</div>
                     <div className="text-2xl font-bold text-white">{totais.horas.toFixed(1)}h</div>
                  </div>
               </Card>
               <Card className="bg-slate-900/40 border-slate-800 p-4 flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500"><Package className="w-5 h-5"/></div>
                  <div>
                     <div className="text-slate-500 text-xs font-bold uppercase">Registros</div>
                     <div className="text-2xl font-bold text-white">{totais.quantidade}</div>
                  </div>
               </Card>
            </div>

            {/* Área dos Gráficos */}
            {renderizarVistaAtiva()}
          </main>
        </div>
      </div>
      
      {/* Mobile View */}
      <div className="lg:hidden flex flex-col min-h-screen">
         {/* Header Mobile */}
         <div className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-30">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <BarChart3 className="text-blue-500 w-6 h-6" />
                    <h1 className="text-lg font-bold text-white">Dashboard</h1>
                </div>
                <Button onClick={() => setSidebarOpen(true)} variant="ghost" size="icon" className="text-white">
                    <Menu className="w-5 h-5" />
                </Button>
            </div>
         </div>

         {/* Menu Overlay */}
         {sidebarOpen && (
            <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-white font-bold text-xl">Menu de Navegação</h2>
                    <Button onClick={() => setSidebarOpen(false)} variant="ghost" size="icon" className="text-white">
                        <X className="w-6 h-6" />
                    </Button>
                </div>
                <div className="space-y-2">
                    {botoesMenu.map((botao) => (
                        <Button 
                            key={botao.id} 
                            onClick={() => { setVistaAtiva(botao.id); setSidebarOpen(false); }} 
                            className={`w-full justify-start h-12 ${botao.color} text-white`}
                        >
                            <botao.icon className="mr-3 h-5 w-5" /> {botao.label}
                        </Button>
                    ))}
                    <Button onClick={() => navigate('/')} variant="outline" className="w-full justify-start border-slate-700 text-slate-300 mt-4">
                        <Home className="mr-2 h-4 w-4" /> Voltar ao Início
                    </Button>
                </div>
            </div>
         )}

         <div className="p-4 space-y-6 flex-1 pb-20">
            {/* Filtros Mobile */}
            <Card className="bg-slate-900 border-slate-800 p-4">
                <div className="grid grid-cols-1 gap-4">
                    <Select value={filtros.periodo} onValueChange={(v) => setFiltros({...filtros, periodo: v})}>
                        <SelectTrigger className="w-full bg-slate-950 border-slate-700 text-white"><SelectValue placeholder="Período" /></SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700 text-white">
                            {periodos.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Button onClick={buscarDadosEquipamentos} disabled={carregando} className="w-full bg-blue-600 hover:bg-blue-700">
                        {carregando ? 'Atualizando...' : 'Aplicar Filtros'}
                    </Button>
                    <Button onClick={executarAtualizacaoCR} disabled={atualizandoCR} variant="outline" className="w-full border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10">
                        {atualizandoCR ? 'Atualizando CR...' : 'Atualizar CR'}
                    </Button>
                </div>
            </Card>

            {/* Métricas Mobile */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <div className="text-slate-500 text-xs uppercase font-bold">Horas</div>
                    <div className="text-2xl font-bold text-white">{totais.horas.toFixed(1)}h</div>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <div className="text-slate-500 text-xs uppercase font-bold">Registros</div>
                    <div className="text-2xl font-bold text-white">{totais.quantidade}</div>
                </div>
            </div>

            {/* Gráficos Mobile */}
            {renderizarVistaAtiva()}
         </div>
      </div>
    </div>
  );
};

export default Visuais;