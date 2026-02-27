import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  Save, 
  PlusCircle, 
  Trash2, 
  BarChart3, 
  Target, 
  Clock, 
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Calendar,
  ArrowLeft,
  LayoutDashboard,
  Percent,
  TrendingDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

// Categorias fixas
const CATEGORIAS = [
  "TRUCK", "OPERADOR", "CARRETEIRO", "PIPA", 
  "MINIPÁ", "MUNCK", "COMBOIO", "GUINDASTE"
];

// Interfaces
interface CategoriaData {
  disponivel: number;
  realizado: number;
  meta: number;
}

interface Periodo {
  id: string;
  ano: number;
  label: string;
  data_inicio: string;
  data_fim: string;
  categorias: { [key: string]: CategoriaData };
  isOpen?: boolean;
}

// Dados para os gráficos
interface ChartDataPoint {
  label: string;
  disponivel: number;
  realizado: number;
  meta: number;
  variacao?: number; // Variação em relação ao período anterior
}

// --- COMPONENTE GRÁFICO CUSTOMIZADO (SVG) COM LABELS E VARIAÇÃO ---
const MixedBarLineChart = ({ data, height = 250 }: { 
  data: ChartDataPoint[], 
  height?: number
}) => {
  const maxVal = Math.max(...data.map(d => Math.max(d.disponivel, d.realizado, d.meta))) || 100;
  const padding = { top: 40, right: 20, bottom: 60, left: 50 }; // Top aumentado para variação
  const chartWidth = 800;
  const chartHeight = height - padding.top - padding.bottom;
  const barWidth = Math.min(28, (chartWidth / data.length) * 0.25);
  
  const getY = (val: number) => padding.top + chartHeight - (val / maxVal) * chartHeight;
  const getX = (index: number) => padding.left + (index * (chartWidth / data.length)) + ((chartWidth / data.length) / 2);

  const formatLabel = (val: number) => val >= 1000 ? (val/1000).toFixed(1) + 'k' : val.toFixed(0);
  
  // Calcular variações se não existirem
  const dataWithVariation = data.map((item, index) => ({
    ...item,
    variacao: index > 0 ? item.realizado - data[index - 1].realizado : 0
  }));

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px]">
        <svg width="100%" height={height} viewBox={`0 0 ${chartWidth + padding.left + padding.right} ${height}`} className="overflow-visible font-sans">
          {/* Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(pct => {
            const y = padding.top + chartHeight * (1 - pct);
            return (
              <g key={pct}>
                <line x1={padding.left} y1={y} x2={chartWidth + padding.left} y2={y} stroke="#334155" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
                <text x={padding.left - 10} y={y + 4} fill="#64748b" fontSize="10" textAnchor="end" fontFamily="monospace">{(maxVal * pct).toFixed(0)}</text>
              </g>
            );
          })}

          {/* Eixo X */}
          <line x1={padding.left} y1={height - padding.bottom} x2={chartWidth + padding.left} y2={height - padding.bottom} stroke="#475569" strokeWidth="2" />

          {dataWithVariation.map((d, i) => {
            const centerX = getX(i);
            const yDisponivel = getY(d.disponivel);
            const yRealizado = getY(d.realizado);
            const yMeta = getY(d.meta);

            const showLabels = barWidth > 10;

            return (
              <g key={i}>
                {/* Barra: Disponível (Roxo) */}
                <rect 
                  x={centerX - barWidth - 2} 
                  y={yDisponivel} 
                  width={barWidth} 
                  height={(height - padding.bottom) - yDisponivel} 
                  fill="#a855f7" 
                  opacity="0.8"
                  rx="2"
                />
                {showLabels && d.disponivel > 0 && (
                  <text x={centerX - barWidth/2 - 2} y={yDisponivel - 5} fill="#e9d5ff" fontSize="9" textAnchor="middle" fontWeight="bold">
                    {formatLabel(d.disponivel)}
                  </text>
                )}

                {/* Barra: Realizado (Azul) */}
                <rect 
                  x={centerX + 2} 
                  y={yRealizado} 
                  width={barWidth} 
                  height={(height - padding.bottom) - yRealizado} 
                  fill="#3b82f6" 
                  opacity="0.9"
                  rx="2"
                />
                {showLabels && d.realizado > 0 && (
                  <text x={centerX + barWidth/2 + 2} y={yRealizado - 5} fill="#bfdbfe" fontSize="9" textAnchor="middle" fontWeight="bold">
                    {formatLabel(d.realizado)}
                  </text>
                )}

                {/* Variação em relação ao período anterior */}
                {i > 0 && d.variacao !== 0 && (
                  <g>
                    {d.variacao > 0 ? (
                      <>
                        <TrendingUp className="hidden" /> {/* Ícone usado apenas para referência */}
                        <text 
                          x={centerX} 
                          y={yRealizado - 20} 
                          fill="#4ade80" 
                          fontSize="11" 
                          textAnchor="middle" 
                          fontWeight="bold"
                          className="drop-shadow-lg"
                        >
                          ▲ {Math.abs(d.variacao).toFixed(0)}
                        </text>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="hidden" /> {/* Ícone usado apenas para referência */}
                        <text 
                          x={centerX} 
                          y={yRealizado - 20} 
                          fill="#f87171" 
                          fontSize="11" 
                          textAnchor="middle" 
                          fontWeight="bold"
                          className="drop-shadow-lg"
                        >
                          ▼ {Math.abs(d.variacao).toFixed(0)}
                        </text>
                      </>
                    )}
                  </g>
                )}

                {/* Label X */}
                <text x={centerX} y={height - padding.bottom + 20} fill="#94a3b8" fontSize="10" textAnchor="middle" fontWeight="500">
                  {d.label}
                </text>
              </g>
            );
          })}

          {/* Linha: Meta (Vermelho Tracejado) */}
          <polyline
            points={data.map((d, i) => `${getX(i)},${getY(d.meta)}`).join(" ")}
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            strokeDasharray="5 5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Pontos da Linha Meta + Labels */}
          {data.map((d, i) => {
            const cx = getX(i);
            const cy = getY(d.meta);
            return (
              <g key={`dot-${i}`}>
                 <circle cx={cx} cy={cy} r="4" fill="#1e293b" stroke="#ef4444" strokeWidth="2" />
                 <text x={cx} y={cy - 8} fill="#fca5a5" fontSize="9" textAnchor="middle" fontWeight="bold">
                    {formatLabel(d.meta)}
                 </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

const HomemHora = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { toast } = useToast();
  
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [anoReferencia, setAnoReferencia] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [novoPeriodo, setNovoPeriodo] = useState({
    label: '',
    data_inicio: '',
    data_fim: ''
  });

  // Função para corrigir problema de fuso horário na exibição da data
  const formatDateSafe = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString + 'T12:00:00').toLocaleDateString('pt-BR');
  };

  useEffect(() => {
    if (userProfile?.id) {
      carregarDados(anoReferencia);
    }
  }, [userProfile, anoReferencia]);

  const carregarDados = async (ano: number) => {
    setLoading(true);
    try {
      const { data: periodosData, error: periodosError } = await supabase
        .from('hh_periodos')
        .select('*')
        .eq('user_id', userProfile.id)
        .eq('ano', ano)
        .order('data_inicio', { ascending: true });

      if (periodosError) throw periodosError;

      const periodoIds = periodosData?.map(p => p.id) || [];
      let categoriasMap: { [key: string]: any } = {};

      if (periodoIds.length > 0) {
        const { data: categoriasData } = await supabase
          .from('hh_categorias')
          .select('*')
          .in('periodo_id', periodoIds);

        categoriasData?.forEach(cat => {
          if (!categoriasMap[cat.periodo_id]) categoriasMap[cat.periodo_id] = {};
          categoriasMap[cat.periodo_id][cat.nome] = {
            disponivel: cat.disponivel,
            realizado: cat.realizado,
            meta: cat.meta
          };
        });
      }

      const periodosFormatados: Periodo[] = periodosData?.map(p => ({
        id: p.id,
        ano: p.ano,
        label: p.label,
        data_inicio: p.data_inicio,
        data_fim: p.data_fim,
        categorias: categoriasMap[p.id] || inicializarCategoriasVazias(),
        isOpen: false
      })) || [];

      setPeriodos(periodosFormatados);
    } catch (error) {
      console.error(error);
      toast({ title: "Erro", description: "Falha ao carregar dados.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const inicializarCategoriasVazias = (): { [key: string]: CategoriaData } => {
    const cats: any = {};
    CATEGORIAS.forEach(cat => cats[cat] = { disponivel: 0, realizado: 0, meta: 0 });
    return cats;
  };

  const handleAddPeriodo = async () => {
    if (!novoPeriodo.label || !novoPeriodo.data_inicio || !novoPeriodo.data_fim) {
      toast({ title: "Atenção", description: "Preencha todos os campos.", variant: "destructive" });
      return;
    }
    try {
      const { data, error } = await supabase.from('hh_periodos').insert({
        user_id: userProfile.id, ano: anoReferencia, ...novoPeriodo
      }).select().single();
      if (error) throw error;
      
      setPeriodos([...periodos, { ...data, categorias: inicializarCategoriasVazias(), isOpen: true }]);
      setNovoPeriodo({ label: '', data_inicio: '', data_fim: '' });
      toast({ title: "Sucesso", description: "Período criado." });
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao criar período.", variant: "destructive" });
    }
  };

  const handleDeletePeriodo = async (id: string) => {
    if(!confirm("Excluir este período?")) return;
    try {
      await supabase.from('hh_categorias').delete().eq('periodo_id', id);
      await supabase.from('hh_periodos').delete().eq('id', id);
      setPeriodos(periodos.filter(p => p.id !== id));
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao excluir.", variant: "destructive" });
    }
  };

  const updateCategoria = (periodoId: string, catName: string, field: keyof CategoriaData, valor: string) => {
    const num = parseFloat(valor) || 0;
    setPeriodos(prev => prev.map(p => {
      if (p.id !== periodoId) return p;
      return {
        ...p,
        categorias: { ...p.categorias, [catName]: { ...p.categorias[catName], [field]: num } }
      };
    }));
  };

  const togglePeriodo = (id: string) => {
    setPeriodos(prev => prev.map(p => p.id === id ? { ...p, isOpen: !p.isOpen } : p));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      for (const periodo of periodos) {
        await supabase.from('hh_periodos').update({
          label: periodo.label, data_inicio: periodo.data_inicio, data_fim: periodo.data_fim
        }).eq('id', periodo.id);

        await supabase.from('hh_categorias').delete().eq('periodo_id', periodo.id);
        
        const inserts = Object.entries(periodo.categorias).map(([nome, dados]) => ({
          periodo_id: periodo.id, nome, ...dados
        }));
        if (inserts.length > 0) await supabase.from('hh_categorias').insert(inserts);
      }
      toast({ title: "Salvo!", description: "Dados atualizados com sucesso." });
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao salvar.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // --- CÁLCULOS ---

  // Totais Anuais
  const totaisAno = periodos.reduce((acc, p) => {
    CATEGORIAS.forEach(cat => {
      acc.disponivel += p.categorias[cat]?.disponivel || 0;
      acc.realizado += p.categorias[cat]?.realizado || 0;
      acc.meta += p.categorias[cat]?.meta || 0;
    });
    return acc;
  }, { disponivel: 0, realizado: 0, meta: 0 });

  const eficienciaAno = totaisAno.meta > 0 ? (totaisAno.realizado / totaisAno.meta) * 100 : 0;

  // Médias
  let somaDisponivel = 0;
  let somaRealizado = 0;
  let somaEficienciaPeriodos = 0;
  let periodosComMeta = 0;
  
  periodos.forEach(p => {
    const totalP = CATEGORIAS.reduce((acc, cat) => ({
      d: acc.d + (p.categorias[cat]?.disponivel || 0),
      r: acc.r + (p.categorias[cat]?.realizado || 0),
      m: acc.m + (p.categorias[cat]?.meta || 0)
    }), { d: 0, r: 0, m: 0 });
    
    somaDisponivel += totalP.d;
    somaRealizado += totalP.r;
    
    if (totalP.m > 0) {
      somaEficienciaPeriodos += (totalP.r / totalP.m) * 100;
      periodosComMeta++;
    }
  });

  const mediaDisponivel = periodos.length > 0 ? somaDisponivel / periodos.length : 0;
  const mediaRealizado = periodos.length > 0 ? somaRealizado / periodos.length : 0;
  const mediaEficiencia = periodosComMeta > 0 ? (somaEficienciaPeriodos / periodosComMeta) : 0;
  const mediaHorasPorPeriodo = periodos.length > 0 ? (totaisAno.realizado / periodos.length) : 0;

  // Dados Gráficos
  const dadosGraficoPeriodo: ChartDataPoint[] = periodos.map((p, index) => {
    const total = CATEGORIAS.reduce((acc, cat) => {
      acc.disponivel += p.categorias[cat]?.disponivel || 0;
      acc.realizado += p.categorias[cat]?.realizado || 0;
      acc.meta += p.categorias[cat]?.meta || 0;
      return acc;
    }, { disponivel: 0, realizado: 0, meta: 0 });
    
    return {
      label: p.label,
      ...total
    };
  });

  const dadosGraficoCategoria: ChartDataPoint[] = CATEGORIAS.map(cat => {
    return periodos.reduce((acc, p) => {
      acc.disponivel += p.categorias[cat]?.disponivel || 0;
      acc.realizado += p.categorias[cat]?.realizado || 0;
      acc.meta += p.categorias[cat]?.meta || 0;
      return acc;
    }, { label: cat, disponivel: 0, realizado: 0, meta: 0 });
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-slate-400 hover:text-white hover:bg-slate-800 gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden md:inline">Menu Principal</span>
            </Button>
            <div className="h-6 w-px bg-slate-800 hidden md:block" />
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <BarChart3 className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-white tracking-tight">Homem Hora & Metas</h1>
                <p className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">Dashboard Operacional</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Select value={anoReferencia.toString()} onValueChange={(v) => setAnoReferencia(Number(v))}>
              <SelectTrigger className="w-[140px] h-9 bg-slate-900 border-slate-700 text-xs font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {[2023, 2024, 2025, 2026].map(a => (
                  <SelectItem key={a} value={a.toString()}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSaveAll} disabled={saving} size="sm" className="h-9 bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 border border-blue-500/50">
              {saving ? <span className="flex items-center gap-2"><div className="h-3 w-3 border border-white/30 border-t-white rounded-full animate-spin" /> Salvando</span> : <span className="flex items-center gap-2"><Save className="h-3.5 w-3.5" /> Salvar</span>}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-500 animate-pulse">
            <div className="h-8 w-8 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium">Carregando dashboard...</p>
          </div>
        ) : (
          <>
            {/* KPI Cards com Médias Adicionais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Meta Anual", value: totaisAno.meta, color: "text-blue-400", icon: Target, bg: "bg-blue-500/5", border: "border-blue-500/10" },
                { label: "Realizado Anual", value: totaisAno.realizado, color: "text-emerald-400", icon: TrendingUp, bg: "bg-emerald-500/5", border: "border-emerald-500/10" },
                { label: "Disponível", value: totaisAno.disponivel, color: "text-purple-400", icon: Clock, bg: "bg-purple-500/5", border: "border-purple-500/10" },
                { label: "Eficiência Global", value: eficienciaAno.toFixed(1) + "%", color: "text-white", icon: BarChart3, bg: "bg-slate-800", border: "border-slate-700" }
              ].map((kpi, i) => (
                <Card key={i} className={cn("bg-slate-900/40 border hover:bg-slate-900/60 transition-all duration-300", kpi.border)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{kpi.label}</p>
                      <div className={cn("p-1.5 rounded-lg", kpi.bg)}>
                        <kpi.icon className={cn("h-3.5 w-3.5", kpi.color)} />
                      </div>
                    </div>
                    <h3 className={cn("text-2xl font-bold tabular-nums tracking-tight leading-none", kpi.color)}>
                      {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
                    </h3>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Cards de Média */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-purple-900/20 to-purple-950/20 border-purple-500/20">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-purple-400 uppercase tracking-wider mb-1">Média Disponível</p>
                      <h3 className="text-3xl font-bold text-purple-300 tabular-nums">
                        {mediaDisponivel.toFixed(1)} <span className="text-sm font-normal text-purple-500/70">h/período</span>
                      </h3>
                      <p className="text-[10px] text-purple-500/50 mt-1">Total: {totaisAno.disponivel.toLocaleString()}h</p>
                    </div>
                    <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                      <Clock className="h-5 w-5 text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-900/20 to-emerald-950/20 border-emerald-500/20">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider mb-1">Média Realizado</p>
                      <h3 className="text-3xl font-bold text-emerald-300 tabular-nums">
                        {mediaRealizado.toFixed(1)} <span className="text-sm font-normal text-emerald-500/70">h/período</span>
                      </h3>
                      <p className="text-[10px] text-emerald-500/50 mt-1">Total: {totaisAno.realizado.toLocaleString()}h</p>
                    </div>
                    <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                      <TrendingUp className="h-5 w-5 text-emerald-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* GRÁFICOS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-900 border-slate-800 shadow-xl lg:col-span-2">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base text-slate-100">Evolução por Período</CardTitle>
                  <CardDescription>Barras: Disponível (roxo) e Realizado (azul) | Linha tracejada: Meta | ▲▼ Variação do realizado</CardDescription>
                </CardHeader>
                <CardContent>
                  {dadosGraficoPeriodo.length === 0 ? (
                    <div className="h-64 flex items-center justify-center border border-dashed border-slate-800 rounded-lg text-slate-600 text-sm">Sem dados para o gráfico</div>
                  ) : (
                    <MixedBarLineChart data={dadosGraficoPeriodo} height={300} />
                  )}
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base text-slate-100">Acumulado por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  {dadosGraficoCategoria.length === 0 ? (
                    <div className="h-64 flex items-center justify-center border border-dashed border-slate-800 rounded-lg text-slate-600 text-sm">Sem dados</div>
                  ) : (
                    <MixedBarLineChart data={dadosGraficoCategoria} height={300} />
                  )}
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base text-slate-100">Eficiência por Período</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {periodos.map((p, index) => {
                      const totalP = CATEGORIAS.reduce((acc, cat) => ({
                        r: acc.r + (p.categorias[cat]?.realizado || 0),
                        m: acc.m + (p.categorias[cat]?.meta || 0)
                      }), { r: 0, m: 0 });
                      
                      const eficiencia = totalP.m > 0 ? (totalP.r / totalP.m) * 100 : 0;
                      const variacao = index > 0 ? (() => {
                        const periodoAnterior = periodos[index - 1];
                        const totalAnterior = CATEGORIAS.reduce((acc, cat) => ({
                          r: acc.r + (periodoAnterior.categorias[cat]?.realizado || 0)
                        }), { r: 0 });
                        return totalP.r - totalAnterior.r;
                      })() : 0;

                      return (
                        <div key={p.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                          <div>
                            <p className="text-sm font-medium text-slate-200">{p.label}</p>
                            <p className="text-xs text-slate-500">{totalP.r.toFixed(0)}h / {totalP.m.toFixed(0)}h</p>
                          </div>
                          <div className="text-right">
                            <p className={cn(
                              "text-lg font-bold",
                              eficiencia >= 100 ? "text-emerald-400" : 
                              eficiencia >= 80 ? "text-blue-400" : "text-amber-400"
                            )}>
                              {eficiencia.toFixed(1)}%
                            </p>
                            {variacao !== 0 && (
                              <p className={cn(
                                "text-xs font-medium flex items-center gap-0.5",
                                variacao > 0 ? "text-emerald-400" : "text-red-400"
                              )}>
                                {variacao > 0 ? "▲" : "▼"} {Math.abs(variacao).toFixed(0)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ÁREA DE GESTÃO */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Sidebar Form */}
              <div className="lg:col-span-4 space-y-6">
                <Card className="bg-slate-900 border-slate-800 sticky top-24">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base text-slate-100 flex items-center gap-2">
                      <PlusCircle className="h-4 w-4 text-blue-400" />
                      Criar Período
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-400 uppercase">Identificação</Label>
                      <Input 
                        placeholder="Ex: Janeiro 2024" 
                        value={novoPeriodo.label}
                        onChange={e => setNovoPeriodo({...novoPeriodo, label: e.target.value})}
                        className="bg-slate-950 border-slate-700 text-white focus-visible:ring-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-400 uppercase">Início</Label>
                        <Input type="date" value={novoPeriodo.data_inicio} onChange={e => setNovoPeriodo({...novoPeriodo, data_inicio: e.target.value})} className="bg-slate-950 border-slate-700 text-white text-xs h-9" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-400 uppercase">Fim</Label>
                        <Input type="date" value={novoPeriodo.data_fim} onChange={e => setNovoPeriodo({...novoPeriodo, data_fim: e.target.value})} className="bg-slate-950 border-slate-700 text-white text-xs h-9" />
                      </div>
                    </div>
                    <Button onClick={handleAddPeriodo} className="w-full bg-slate-100 text-slate-900 hover:bg-white font-semibold mt-2 h-9">Adicionar</Button>
                  </CardContent>
                </Card>
              </div>

              {/* Lista de Períodos */}
              <div className="lg:col-span-8 space-y-4">
                {periodos.length === 0 && (
                  <div className="border-2 border-dashed border-slate-800 rounded-xl p-12 text-center bg-slate-900/30">
                    <LayoutDashboard className="h-10 w-10 text-slate-700 mx-auto mb-3" />
                    <h3 className="text-slate-300 font-medium">Nenhum período registrado</h3>
                    <p className="text-slate-500 text-sm mt-1">Crie um período para começar.</p>
                  </div>
                )}

                {periodos.map((periodo) => {
                  const totaisP = CATEGORIAS.reduce((acc, cat) => ({
                    realizado: acc.realizado + (periodo.categorias[cat]?.realizado || 0),
                    meta: acc.meta + (periodo.categorias[cat]?.meta || 0)
                  }), { realizado: 0, meta: 0 });
                  
                  const efP = totaisP.meta > 0 ? (totaisP.realizado / totaisP.meta) * 100 : 0;

                  return (
                    <Card key={periodo.id} className="bg-slate-900 border-slate-800 shadow-sm hover:border-slate-700 transition-colors overflow-hidden">
                      <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 cursor-pointer hover:bg-slate-800/30 transition-colors border-b border-slate-800/50" onClick={() => togglePeriodo(periodo.id)}>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <div className="p-1.5 bg-slate-800 rounded-md text-slate-400">
                            {periodo.isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-200 text-sm">{periodo.label}</h3>
                            <p className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                              <Calendar className="h-3 w-3" /> 
                              {formatDateSafe(periodo.data_inicio)} — {formatDateSafe(periodo.data_fim)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                          <div className="hidden sm:block text-right">
                            <div className="text-[10px] text-slate-500 uppercase font-semibold">Meta</div>
                            <div className="text-sm font-mono text-slate-300">{totaisP.meta.toFixed(0)}h</div>
                          </div>
                          <div className="hidden sm:block text-right">
                            <div className="text-[10px] text-slate-500 uppercase font-semibold">Realizado</div>
                            <div className="text-sm font-mono text-emerald-400">{totaisP.realizado.toFixed(0)}h</div>
                          </div>
                          <div className="bg-slate-950 border border-slate-800 px-2.5 py-1 rounded text-[10px] font-bold text-slate-300 min-w-[50px] text-center tabular-nums">{efP.toFixed(0)}%</div>
                          <Button variant="ghost" size="icon" className="text-slate-500 hover:text-red-400 hover:bg-red-950/20 h-7 w-7" onClick={(e) => { e.stopPropagation(); handleDeletePeriodo(periodo.id); }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {periodo.isOpen && (
                        <div className="p-0 bg-slate-950/30 animate-in fade-in slide-in-from-top-1 duration-200">
                          <div className="px-4 pt-4 pb-2 border-b border-slate-800/50">
                            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Breakdown por Categoria</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2">
                              {CATEGORIAS.map(cat => {
                                const dados = periodo.categorias[cat] || { realizado: 0, meta: 0 };
                                const maxVal = Math.max(dados.meta, dados.realizado) || 1;
                                return (
                                  <div key={cat} className="space-y-1">
                                    <div className="flex justify-between text-[10px]">
                                      <span className="text-slate-400 font-medium">{cat}</span>
                                      <span className="text-slate-500 tabular-nums">{dados.realizado}/{dados.meta}</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                                      <div className="absolute top-0 left-0 h-full bg-slate-700 w-full" />
                                      <div className="absolute top-0 left-0 h-full bg-emerald-500/80" style={{ width: `${Math.min((dados.realizado / maxVal) * 100, 100)}%` }} />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                              <thead className="bg-slate-900/50 text-[11px] uppercase text-slate-500 font-semibold tracking-wider">
                                <tr>
                                  <th className="px-4 py-3 font-medium">Categoria</th>
                                  <th className="px-4 py-3 text-right font-medium">Disp.</th>
                                  <th className="px-4 py-3 text-right font-medium">Real.</th>
                                  <th className="px-4 py-3 text-right font-medium">Meta</th>
                                  <th className="px-4 py-3 w-1/4 font-medium">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800/50 text-xs">
                                {CATEGORIAS.map(cat => {
                                  const dados = periodo.categorias[cat] || { disponivel: 0, realizado: 0, meta: 0 };
                                  const pct = dados.meta > 0 ? (dados.realizado / dados.meta) * 100 : 0;
                                  return (
                                    <tr key={cat} className="hover:bg-slate-800/20 transition-colors group">
                                      <td className="px-4 py-2.5 font-medium text-slate-300 group-hover:text-white">{cat}</td>
                                      <td className="px-4 py-2">
                                        <Input type="number" step="0.1" className="bg-transparent border-b border-slate-700 h-7 text-right w-20 focus:border-purple-500 focus:ring-0 px-0 text-slate-400 focus:text-slate-200 transition-colors" value={dados.disponivel} onChange={e => updateCategoria(periodo.id, cat, 'disponivel', e.target.value)} />
                                      </td>
                                      <td className="px-4 py-2">
                                        <Input type="number" step="0.1" className="bg-transparent border-b border-slate-700 h-7 text-right w-20 focus:border-emerald-500 focus:ring-0 px-0 text-emerald-200/70 font-medium transition-colors" value={dados.realizado} onChange={e => updateCategoria(periodo.id, cat, 'realizado', e.target.value)} />
                                      </td>
                                      <td className="px-4 py-2">
                                        <Input type="number" step="0.1" className="bg-transparent border-b border-slate-700 h-7 text-right w-20 focus:border-blue-500 focus:ring-0 px-0 text-blue-200/70 font-medium transition-colors" value={dados.meta} onChange={e => updateCategoria(periodo.id, cat, 'meta', e.target.value)} />
                                      </td>
                                      <td className="px-4 py-2">
                                        <div className="flex items-center gap-2">
                                          <div className="flex-1 bg-slate-800 h-1 rounded-full overflow-hidden">
                                            <div className={cn("h-full rounded-full transition-all duration-500", pct >= 100 ? "bg-emerald-500" : pct >= 80 ? "bg-blue-500" : "bg-amber-500")} style={{ width: `${Math.min(pct, 100)}%` }} />
                                          </div>
                                          <span className="w-8 text-right font-mono text-slate-400">{pct.toFixed(0)}%</span>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HomemHora;