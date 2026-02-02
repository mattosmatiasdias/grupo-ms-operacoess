// src/pages/escalas.tsx - Calendário Interativo Premium
import { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  RefreshCw, 
  Sun, 
  Moon, 
  Calendar as CalendarIcon, 
  Eye, 
  MoreHorizontal,
  Filter,
  AlertCircle,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EscalasLayout } from '@/components/Escalas/EscalasLayout';

const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const frentesServico = [
  'TODAS', 'GARAGEM', 'COQUE', 'PICHE', 'FLUORETO', 'HYDRATO', 'CARVAO', 'BAUXITA', 'LINGOTE', 'ALBRAS'
];

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

// Função para obter a data de hoje no formato YYYY-MM-DD
const getDataHojeFormatada = (): string => {
  return formatarDataParaYYYYMMDD(new Date());
};

export default function EscalasCalendar() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Data selecionada para visualização lateral (Hoje por padrão)
  const [selectedDate, setSelectedDate] = useState<string>(getDataHojeFormatada());

  const [filterFrente, setFilterFrente] = useState<string>('TODAS');
  const [filterStatus, setFilterStatus] = useState<string>('TODOS');
  
  const [escalasDoDia, setEscalasDoDia] = useState<any[]>([]);
  const [escalasPorDia, setEscalasPorDia] = useState<{[key: string]: any[]}>({});
  const [isLoading, setIsLoading] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Lógica do Calendário com datas locais
  const firstDayOfMonth = criarDataLocal(year, month, 1);
  const lastDayOfMonth = criarDataLocal(year, month + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayWeekday; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  // Efeitos de Carregamento
  useEffect(() => {
    carregarEscalasDoMes();
  }, [currentDate, filterFrente, filterStatus]);

  useEffect(() => {
    carregarEscalasDoDia(selectedDate);
  }, [selectedDate]);

  const carregarEscalasDoMes = async () => {
    try {
      setIsLoading(true);
      const firstDay = formatarDataParaYYYYMMDD(firstDayOfMonth);
      const lastDay = formatarDataParaYYYYMMDD(lastDayOfMonth);

      let query = supabase
        .from('escalas')
        .select('*')
        .gte('data_escala', firstDay)
        .lte('data_escala', lastDay)
        .order('data_escala', { ascending: true });

      if (filterFrente !== 'TODAS') {
        query = query.eq('frente_servico', filterFrente);
      }
      if (filterStatus !== 'TODOS') {
        query = query.eq('status', filterStatus);
      }

      const { data: escalas, error } = await query;

      if (error) throw error;

      const agrupado: {[key: string]: any[]} = {};
      escalas?.forEach(escala => {
        const data = escala.data_escala;
        if (!agrupado[data]) agrupado[data] = [];
        agrupado[data].push(escala);
      });

      setEscalasPorDia(agrupado);
    } catch (error) {
      console.error('Erro ao carregar escalas:', error);
      toast.error('Erro ao carregar calendário');
    } finally {
      setIsLoading(false);
    }
  };

  const carregarEscalasDoDia = async (data: string) => {
    try {
      const { data: escalas, error } = await supabase
        .from('escalas')
        .select('*')
        .eq('data_escala', data)
        .order('frente_servico');

      if (error) throw error;
      setEscalasDoDia(escalas || []);
    } catch (error) {
      console.error('Erro ao carregar detalhes do dia:', error);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const handleNovaEscala = (data?: string) => {
    const dataParam = data || selectedDate;
    navigate(`/nova?data=${dataParam}`);
  };

  const handleVerEscala = (id: string) => {
    navigate(`/visualizar?id=${id}`);
  };

  const getEscalasParaDia = (dia: number) => {
    const dateStr = formatarDataParaYYYYMMDD(criarDataLocal(year, month, dia));
    
    // Filtra localmente também para garantir consistência visual rápida
    let items = escalasPorDia[dateStr] || [];
    if (filterFrente !== 'TODAS') items = items.filter(e => e.frente_servico === filterFrente);
    if (filterStatus !== 'TODOS') items = items.filter(e => e.status === filterStatus);
    
    return items;
  };

  const formatarDataParaExibicao = (dataString: string) => {
    const data = parseDataLocal(dataString);
    return data.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getFrenteColor = (frente: string) => {
    const cores: {[key: string]: string} = {
      'COQUE': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      'PICHE': 'bg-gray-600/20 text-gray-300 border-gray-500/30',
      'FLUORETO': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'HYDRATO': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      'CARVAO': 'bg-stone-600/20 text-stone-300 border-stone-500/30',
      'BAUXITA': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      'LINGOTE': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'GARAGEM': 'bg-green-500/20 text-green-300 border-green-500/30',
      'ALBRAS': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    };
    return cores[frente] || 'bg-slate-600/20 text-slate-300 border-slate-500/30';
  };

  const getStatusColor = (status: string) => {
    switch(status?.toUpperCase()) {
      case 'CONFIRMADA': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'FINALIZADA': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'PENDENTE': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'CANCELADA': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-slate-600/20 text-slate-300';
    }
  };

  // Verifica se um dia é hoje
  const isToday = (day: number) => {
    const today = new Date();
    return today.getFullYear() === year && 
           today.getMonth() === month && 
           today.getDate() === day;
  };

  // Verifica se uma data string é hoje
  const isDateStringToday = (dateString: string) => {
    return dateString === getDataHojeFormatada();
  };

  return (
    <EscalasLayout title="Gestão de Escalas" subtitle="Planeje e acompanhe as operações diárias">
      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* Header de Controles */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-700">
          
          {/* Navegação de Mês */}
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')} className="border-slate-600 hover:bg-slate-800 text-white">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-bold text-white min-w-[180px] text-center">
              {meses[month]} {year}
            </h2>
            <Button variant="outline" size="icon" onClick={() => navigateMonth('next')} className="border-slate-600 hover:bg-slate-800 text-white">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setCurrentDate(new Date());
                setSelectedDate(getDataHojeFormatada());
              }} 
              className="text-slate-400 hover:text-white ml-2"
            >
              Hoje
            </Button>
          </div>

          {/* Filtros Rápidos */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700">
              <Filter className="h-4 w-4 text-slate-400" />
              <Select value={filterFrente} onValueChange={setFilterFrente}>
                <SelectTrigger className="border-none bg-transparent text-white text-sm focus:ring-0 w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {frentesServico.map(f => (
                    <SelectItem key={f} value={f} className="text-white hover:bg-slate-700">{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700">
              <Layers className="h-4 w-4 text-slate-400" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="border-none bg-transparent text-white text-sm focus:ring-0 w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="TODOS" className="text-white hover:bg-slate-700">Todos Status</SelectItem>
                  <SelectItem value="PENDENTE" className="text-amber-400 hover:bg-slate-700">Pendentes</SelectItem>
                  <SelectItem value="CONFIRMADA" className="text-green-400 hover:bg-slate-700">Confirmadas</SelectItem>
                  <SelectItem value="CANCELADA" className="text-red-400 hover:bg-slate-700">Canceladas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={carregarEscalasDoMes} 
              disabled={isLoading}
              variant="outline" 
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Layout Principal: Calendário + Detalhes */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* CALENDÁRIO (Esquerda - Ocupa 2 colunas em XL) */}
          <Card className="xl:col-span-2 bg-slate-900/40 backdrop-blur-sm border-slate-700 min-h-[600px]">
            <CardContent className="p-0">
              {/* Cabeçalho Dias da Semana */}
              <div className="grid grid-cols-7 border-b border-slate-700 bg-slate-800/30">
                {diasSemana.map(dia => (
                  <div key={dia} className="py-3 text-center text-sm font-semibold text-slate-400 uppercase tracking-wider">
                    {dia}
                  </div>
                ))}
              </div>

              {/* Grid de Dias */}
              <div className="grid grid-cols-7 auto-rows-fr">
                {calendarDays.map((day, index) => {
                  if (day === null) return <div key={`empty-${index}`} className="min-h-[120px] bg-slate-900/20" />;

                  const dateStr = formatarDataParaYYYYMMDD(criarDataLocal(year, month, day));
                  const isSelected = dateStr === selectedDate;
                  const isTodayLocal = isToday(day);
                  
                  const escalasDia = getEscalasParaDia(day);
                  const temEscalas = escalasDia.length > 0;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`
                        group relative min-h-[120px] border-b border-r border-slate-700/50 p-2 transition-all duration-200 text-left flex flex-col
                        hover:bg-slate-800/50
                        ${isSelected ? 'bg-blue-900/20 ring-2 ring-inset ring-blue-500/50' : 'bg-transparent'}
                        ${isTodayLocal && !isSelected ? 'bg-slate-800/30' : ''}
                      `}
                    >
                      {/* Número do Dia */}
                      <div className="flex justify-between items-start mb-1">
                        <span className={`
                          text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full
                          ${isTodayLocal ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' : 'text-slate-300'}
                        `}>
                          {day}
                        </span>
                        {temEscalas && (
                          <Badge className="h-5 px-1.5 text-[10px] bg-blue-500/20 text-blue-300 border-blue-500/30">
                            {escalasDia.length}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Lista de Mini Escalas */}
                      <div className="flex-1 space-y-1 overflow-hidden">
                        {escalasDia.slice(0, 3).map((escala: any) => (
                          <div 
                            key={escala.id}
                            className={`text-[10px] px-1.5 py-0.5 rounded truncate border flex items-center gap-1 ${getFrenteColor(escala.frente_servico)}`}
                          >
                            {escala.turno?.includes('19:00') ? <Moon className="h-2.5 w-2.5" /> : <Sun className="h-2.5 w-2.5" />}
                            <span className="truncate font-medium">{escala.frente_servico}</span>
                          </div>
                        ))}
                        {escalasDia.length > 3 && (
                          <div className="text-[10px] text-slate-500 px-1 truncate">+{escalasDia.length - 3} escalas</div>
                        )}
                      </div>

                      {/* Botão Flutuante Rápido (+) */}
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          size="icon" 
                          className="h-6 w-6 bg-blue-600 hover:bg-blue-500 rounded-full shadow-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNovaEscala(dateStr);
                          }}
                        >
                          <Plus className="h-3 w-3 text-white" />
                        </Button>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* DETALHES DO DIA (Direita) */}
          <Card className="bg-slate-900/40 backdrop-blur-sm border-slate-700 h-fit">
            <CardContent className="p-0">
              {/* Cabeçalho do Painel */}
              <div className="p-5 border-b border-slate-700 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white text-lg leading-tight">
                    {formatarDataParaExibicao(selectedDate)}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {isDateStringToday(selectedDate) && (
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                        Hoje
                      </Badge>
                    )}
                    <span className="text-slate-400 text-sm">
                      {escalasDoDia.length} escala{escalasDoDia.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <Button size="sm" onClick={() => handleNovaEscala()} className="bg-blue-600 hover:bg-blue-700 text-white gap-1 h-8">
                  <Plus className="h-3.5 w-3.5" /> Nova
                </Button>
              </div>

              {/* Lista de Escalas do Dia */}
              <div className="p-4 space-y-3 max-h-[700px] overflow-y-auto custom-scrollbar">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                  </div>
                ) : escalasDoDia.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto">
                      <CalendarIcon className="h-6 w-6 text-slate-500" />
                    </div>
                    <div className="text-slate-400 space-y-1">
                      <p className="font-medium">Nenhuma escala</p>
                      <p className="text-xs">Clique em "Nova" para adicionar.</p>
                    </div>
                  </div>
                ) : (
                  escalasDoDia.map((escala) => (
                    <div 
                      key={escala.id}
                      onClick={() => handleVerEscala(escala.id)}
                      className="group relative p-3 rounded-lg border border-slate-700 bg-slate-800/20 hover:bg-slate-800/40 hover:border-blue-500/50 transition-all cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {escala.turno?.includes('19:00') ? 
                            <Moon className="h-3.5 w-3.5 text-indigo-400" /> : 
                            <Sun className="h-3.5 w-3.5 text-amber-400" />
                          }
                          <Badge className={`${getFrenteColor(escala.frente_servico)} text-[10px] h-5`}>
                            {escala.frente_servico}
                          </Badge>
                          <Badge className={`${getStatusColor(escala.status)} text-[10px] h-5 border`}>
                            {escala.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <h4 className="text-sm font-semibold text-white truncate mb-1">
                        {escala.navio || 'Operação Geral'}
                      </h4>
                      
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Turno: <span className="text-slate-200">{escala.turno}</span></span>
                        {escala.berco && <span>Berço: {escala.berco}</span>}
                      </div>

                      {/* Hover Action */}
                      <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="p-1 bg-blue-600 rounded-full">
                          <Eye className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo do Mês */}
        <Card className="bg-slate-900/40 backdrop-blur-sm border-slate-700">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-2">
                <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Total Escalas</p>
                <p className="text-xl font-bold text-white mt-1">
                  {Object.values(escalasPorDia).flat().length}
                </p>
              </div>
              
              <div className="text-center p-2">
                <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Confirmadas</p>
                <p className="text-xl font-bold text-green-400 mt-1">
                  {Object.values(escalasPorDia).flat().filter(e => e.status === 'CONFIRMADA').length}
                </p>
              </div>
              
              <div className="text-center p-2">
                <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Pendentes</p>
                <p className="text-xl font-bold text-amber-400 mt-1">
                  {Object.values(escalasPorDia).flat().filter(e => e.status === 'PENDENTE').length}
                </p>
              </div>
              
              <div className="text-center p-2">
                <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Dias Ativos</p>
                <p className="text-xl font-bold text-blue-400 mt-1">
                  {Object.keys(escalasPorDia).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </EscalasLayout>
  );
}