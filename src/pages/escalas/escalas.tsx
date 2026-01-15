// src/pages/escalas/Escalas.tsx - Calendário interativo
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, FileDown, Sun, Moon, Calendar as CalendarIcon, Home, Menu, X, BarChart3, Users as UsersIcon, AlertTriangle, TrendingUp, Eye, MoreHorizontal } from 'lucide-react';
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

const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

// Frentes de serviço
const frentesServico = [
  'COQUE',
  'PICHE', 
  'FLUORETO',
  'HYDRATO',
  'CARVAO',
  'BAUXITA',
  'LINGOTE',
  'GARAGEM',
  'ALBRAS'
];

// Componente Layout integrado
function EscalasLayout({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: string }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: 'Menu Principal', path: '/', color: 'bg-blue-600 hover:bg-blue-700' },
    { icon: BarChart3, label: 'Dashboard', path: '/escalas/dashboard', color: 'bg-cyan-600 hover:bg-cyan-700' },
    { icon: UsersIcon, label: 'Pessoal', path: '/escalas/pessoal', color: 'bg-blue-600 hover:bg-blue-700' },
    { icon: CalendarIcon, label: 'Escalas', path: '/escalas', color: 'bg-purple-600 hover:bg-purple-700' },
    { icon: AlertTriangle, label: 'Ocorrências', path: '/escalas/ocorrencias', color: 'bg-orange-600 hover:bg-orange-700' },
    { icon: TrendingUp, label: 'Relatórios', path: '/escalas/relatorios', color: 'bg-green-600 hover:bg-green-700' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-950 text-white">
      {/* Mobile Header */}
      <div className="lg:hidden bg-blue-900/80 backdrop-blur-md shadow-lg sticky top-0 z-10">
        <div className="flex justify-between items-center px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-blue-300 hover:bg-blue-800/50"
              title="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">{title}</h1>
              {subtitle && <p className="text-sm text-blue-300">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-blue-300 hover:bg-blue-800/50"
              title="Menu Principal"
            >
              <Home className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-blue-900/95 backdrop-blur-sm">
          <div className="flex justify-between items-center p-4 border-b border-blue-600/30">
            <h2 className="text-xl font-bold text-white">Menu de Escalas</h2>
            <Button
              variant="ghost"
              onClick={() => setSidebarOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <div className="p-4 space-y-3 overflow-y-auto h-[calc(100%-80px)]">
            {menuItems.map((item) => (
              <Button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`w-full h-16 ${item.color} text-white text-lg font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02]`}
              >
                <div className="flex items-center justify-start space-x-4 w-full">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-left">{item.label}</span>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-blue-900/30 backdrop-blur-sm border-r border-blue-600/30 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-blue-600/30">
            <div className="flex items-center space-x-4">
              <div className="bg-cyan-500/20 p-3 rounded-xl">
                <CalendarIcon className="h-8 w-8 text-cyan-300" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Módulo Escalas</h1>
                <p className="text-blue-300 text-sm">Gestão completa</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <Button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full h-14 ${window.location.pathname === item.path ? 'bg-cyan-600/30 border border-cyan-500/50' : 'bg-white/5 hover:bg-white/10'} text-white font-medium rounded-lg transition-all duration-300 hover:shadow-md`}
              >
                <div className="flex items-center justify-start space-x-3 w-full">
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
              </Button>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-blue-600/30">
            <Button
              onClick={() => navigate('/')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 gap-2"
            >
              <Home className="h-4 w-4" />
              Menu Principal
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">{title}</h1>
            {subtitle && <p className="text-blue-300 mt-2">{subtitle}</p>}
          </div>

          {/* Page Content */}
          {children}
        </div>
      </div>

      {/* Mobile Content (when sidebar is closed) */}
      {!sidebarOpen && (
        <div className="lg:hidden p-4">
          {children}
        </div>
      )}
    </div>
  );
}

// Componente principal
export default function EscalasCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });
  const [filterFrente, setFilterFrente] = useState<string>('all');
  const [escalasDoDia, setEscalasDoDia] = useState<any[]>([]);
  const [escalasPorDia, setEscalasPorDia] = useState<{[key: string]: any[]}>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  // Carregar escalas do mês atual
  useEffect(() => {
    carregarEscalasDoMes();
  }, [currentDate]);

  // Carregar escalas do dia selecionado
  useEffect(() => {
    carregarEscalasDoDia(selectedDate);
  }, [selectedDate]);

  const carregarEscalasDoMes = async () => {
    try {
      setIsLoading(true);
      
      const firstDay = new Date(year, month, 1).toISOString().split('T')[0];
      const lastDay = new Date(year, month + 1, 0).toISOString().split('T')[0];

      const { data: escalas, error } = await supabase
        .from('escalas')
        .select('*')
        .gte('data_escala', firstDay)
        .lte('data_escala', lastDay)
        .order('data_escala');

      if (error) throw error;

      // Agrupar escalas por dia
      const agrupado: {[key: string]: any[]} = {};
      escalas?.forEach(escala => {
        const data = escala.data_escala;
        if (!agrupado[data]) {
          agrupado[data] = [];
        }
        agrupado[data].push(escala);
      });

      setEscalasPorDia(agrupado);
    } catch (error) {
      console.error('Erro ao carregar escalas do mês:', error);
      toast.error('Erro ao carregar escalas');
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
      console.error('Erro ao carregar escalas:', error);
      toast.error('Erro ao carregar escalas do dia');
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleNovaEscala = () => {
    navigate(`/escalas/nova?data=${selectedDate}`);
  };

  const handleVerEscala = (id: string) => {
    navigate(`/escalas/visualizar/${id}`);
  };

  const handleEditarEscala = (id: string) => {
    navigate(`/escalas/editar/${id}`);
  };

  const handleExcluirEscala = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta escala?')) return;

    try {
      const { error } = await supabase
        .from('escalas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Escala excluída com sucesso');
      await carregarEscalasDoMes();
      await carregarEscalasDoDia(selectedDate);
    } catch (error) {
      console.error('Erro ao excluir escala:', error);
      toast.error('Erro ao excluir escala');
    }
  };

  const getEscalasParaDia = (dia: number) => {
    const dataStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    return escalasPorDia[dataStr] || [];
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getBadgeColor = (frente: string) => {
    const cores: {[key: string]: string} = {
      'COQUE': 'bg-amber-500/20 text-amber-300',
      'PICHE': 'bg-gray-500/20 text-gray-300',
      'FLUORETO': 'bg-blue-500/20 text-blue-300',
      'HYDRATO': 'bg-cyan-500/20 text-cyan-300',
      'CARVAO': 'bg-stone-500/20 text-stone-300',
      'BAUXITA': 'bg-orange-500/20 text-orange-300',
      'LINGOTE': 'bg-purple-500/20 text-purple-300',
      'GARAGEM': 'bg-green-500/20 text-green-300',
      'ALBRAS': 'bg-indigo-500/20 text-indigo-300',
    };
    return cores[frente] || 'bg-blue-500/20 text-blue-300';
  };

  const getStatusColor = (status: string) => {
    switch(status?.toUpperCase()) {
      case 'CONFIRMADA':
        return 'bg-green-500/20 text-green-300';
      case 'PENDENTE':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'CANCELADA':
        return 'bg-red-500/20 text-red-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <EscalasLayout 
      title="Calendário de Escalas" 
      subtitle="Visualize e gerencie as escalas do mês"
    >
      <div className="mb-8">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="bg-blue-600/20 border-blue-400/30 text-blue-300 hover:bg-blue-600/30 hover:text-blue-200 gap-2"
            onClick={() => carregarEscalasDoMes()}
          >
            <FileDown className="h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2 bg-white/5 backdrop-blur-sm border-blue-200/30">
          <CardContent className="p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigateMonth('prev')}
                className="text-blue-300 hover:text-white hover:bg-blue-500/20"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-lg font-semibold text-white">
                {meses[month]} {year}
              </h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigateMonth('next')}
                className="text-blue-300 hover:text-white hover:bg-blue-500/20"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Weekday headers */}
              {diasSemana.map(dia => (
                <div key={dia} className="h-10 flex items-center justify-center text-xs font-medium text-blue-300">
                  {dia}
                </div>
              ))}

              {/* Calendar days */}
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="h-32" />;
                }

                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isSelected = dateStr === selectedDate;
                const today = new Date();
                const isToday = today.getFullYear() === year && 
                              today.getMonth() === month && 
                              today.getDate() === day;
                const escalasDia = getEscalasParaDia(day);
                const temEscalas = escalasDia.length > 0;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`
                      h-32 p-1.5 rounded-lg border transition-all text-left flex flex-col
                      hover:border-cyan-500/50 hover:shadow-sm
                      ${isSelected 
                        ? 'border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-500/20' 
                        : 'border-blue-200/30 bg-white/5'
                      }
                      ${isToday && !isSelected ? 'border-amber-500' : ''}
                    `}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`
                        text-sm font-medium
                        ${isToday ? 'text-amber-300 font-bold' : 'text-white'}
                      `}>
                        {day}
                      </span>
                      {temEscalas && (
                        <Badge className="h-5 px-1.5 bg-green-500/20 text-green-300 text-xs">
                          {escalasDia.length}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Mini listagem de escalas */}
                    <div className="flex-1 space-y-0.5 overflow-hidden">
                      {escalasDia.slice(0, 3).map((escala: any) => (
                        <div 
                          key={escala.id}
                          className={`text-xs px-1 py-0.5 rounded truncate ${getBadgeColor(escala.frente_servico)}`}
                          title={`${escala.frente_servico} - ${escala.navio}`}
                        >
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></div>
                            <span className="truncate">{escala.frente_servico}</span>
                          </div>
                        </div>
                      ))}
                      {escalasDia.length > 3 && (
                        <div className="text-xs text-blue-400/70 px-1">
                          +{escalasDia.length - 3} mais
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Day Details */}
        <Card className="bg-white/5 backdrop-blur-sm border-blue-200/30">
          <CardContent className="p-0">
            <div className="p-4 border-b border-blue-200/30">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-semibold text-white text-lg">
                    {formatarData(selectedDate)}
                  </h3>
                  <p className="text-sm text-blue-400">
                    {escalasDoDia.length} escala{escalasDoDia.length !== 1 ? 's' : ''} para este dia
                  </p>
                </div>
                <Button
                  onClick={handleNovaEscala}
                  className="bg-cyan-600 hover:bg-cyan-700 gap-2"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                  Nova Escala
                </Button>
              </div>
              
              <div className="mt-3">
                <Select value={filterFrente} onValueChange={setFilterFrente}>
                  <SelectTrigger className="w-full bg-white/5 border-blue-200/30 text-white">
                    <SelectValue placeholder="Filtrar por frente" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-blue-200/30">
                    <SelectItem value="all" className="text-white hover:bg-blue-500/20">Todas as Frentes</SelectItem>
                    {frentesServico.map(frente => (
                      <SelectItem key={frente} value={frente} className="text-white hover:bg-blue-500/20">
                        {frente}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent"></div>
                </div>
              ) : escalasDoDia.length === 0 ? (
                <div className="py-8 text-center text-blue-400 text-sm">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="mb-2">Nenhuma escala para este dia</p>
                  <Button
                    onClick={handleNovaEscala}
                    variant="outline"
                    className="mt-2 border-blue-200/30 text-blue-300 hover:bg-blue-500/20"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Escala
                  </Button>
                </div>
              ) : (
                escalasDoDia
                  .filter(escala => filterFrente === 'all' || escala.frente_servico === filterFrente)
                  .map(escala => (
                    <div 
                      key={escala.id}
                      className="p-3 rounded-lg border border-blue-200/30 bg-blue-900/10 hover:bg-blue-900/20 transition-colors group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={`${getBadgeColor(escala.frente_servico)}`}>
                              {escala.frente_servico}
                            </Badge>
                            <Badge className={getStatusColor(escala.status)}>
                              {escala.status || 'PENDENTE'}
                            </Badge>
                          </div>
                          <h4 className="font-semibold text-white">{escala.navio}</h4>
                          <p className="text-sm text-blue-300">Berço: {escala.berco || 'Não informado'}</p>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-blue-300 hover:text-white hover:bg-blue-500/20"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-gray-800 border-blue-200/30">
                            <DropdownMenuItem 
                              onClick={() => handleVerEscala(escala.id)}
                              className="text-white hover:bg-blue-500/20"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleEditarEscala(escala.id)}
                              className="text-yellow-400 hover:bg-yellow-500/20"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleExcluirEscala(escala.id)}
                              className="text-red-400 hover:bg-red-500/20"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-1.5 text-blue-300">
                            {escala.turno?.includes('19:00') ? (
                              <Moon className="h-3 w-3 text-indigo-300" />
                            ) : (
                              <Sun className="h-3 w-3 text-amber-300" />
                            )}
                            <span>{escala.turno || 'Turno não definido'}</span>
                          </div>
                          
                          {escala.encarregado_manha && (
                            <div className="flex items-center gap-1.5 text-blue-300">
                              <span className="text-xs opacity-70">Manhã:</span>
                              <span>{escala.encarregado_manha}</span>
                            </div>
                          )}
                          
                          {escala.encarregado_tarde && (
                            <div className="flex items-center gap-1.5 text-blue-300">
                              <span className="text-xs opacity-70">Tarde:</span>
                              <span>{escala.encarregado_tarde}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center pt-2 border-t border-blue-200/20">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleVerEscala(escala.id)}
                            className="text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/20"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Ver Detalhes
                          </Button>
                          
                          <span className="text-xs text-blue-400">
                            {new Date(escala.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas do Mês */}
      <Card className="mt-6 bg-white/5 backdrop-blur-sm border-blue-200/30">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 justify-between">
            <div className="text-center">
              <p className="text-sm text-blue-300">Total de Escalas no Mês</p>
              <p className="text-2xl font-bold text-white">
                {Object.values(escalasPorDia).flat().length}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-blue-300">Dias com Escalas</p>
              <p className="text-2xl font-bold text-white">
                {Object.keys(escalasPorDia).length}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-blue-300">Frente mais Ativa</p>
              <p className="text-2xl font-bold text-white">
                {(() => {
                  const todasEscalas = Object.values(escalasPorDia).flat();
                  const contagemFrentes: {[key: string]: number} = {};
                  
                  todasEscalas.forEach(escala => {
                    const frente = escala.frente_servico;
                    contagemFrentes[frente] = (contagemFrentes[frente] || 0) + 1;
                  });
                  
                  const frenteMaisAtiva = Object.entries(contagemFrentes)
                    .sort((a, b) => b[1] - a[1])[0];
                  
                  return frenteMaisAtiva ? frenteMaisAtiva[0] : '-';
                })()}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-blue-300">Escalas Hoje</p>
              <p className="text-2xl font-bold text-white">
                {escalasDoDia.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </EscalasLayout>
  );
}