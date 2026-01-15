// src/components/Dashboard.tsx
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, FileText, Ship, LogOut, BarChart3, Menu, X, Calendar, 
  ClipboardCheck, Car, AlertTriangle, Building2, Percent, Users,
  TrendingUp, CheckCircle, Clock, Truck, Package, Anchor, Waves
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

const Dashboard = () => {
  const { userProfile, signOut } = useAuth();
  const { hasUnread } = useNotifications();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalOperacoes: 0,
    naviosAtivos: 0,
    rateiosPendentes: 0,
    operacoesHoje: 0,
    vistoriasPendentes: 0,
    ocorrenciasAbertas: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Aqui você pode fazer chamadas à API para carregar os dados reais
      // Exemplo de dados mock para demonstração
      setStats({
        totalOperacoes: 245,
        naviosAtivos: 8,
        rateiosPendentes: 12,
        operacoesHoje: 18,
        vistoriasPendentes: 5,
        ocorrenciasAbertas: 3
      });
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const menuItems = [
    {
      icon: FileText,
      label: 'RELATÓRIO DE TRANSPORTE',
      path: '/relatorio-transporte',
      color: 'bg-blue-500 hover:bg-blue-600',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-300'
    },
    {
      icon: Ship,
      label: 'NAVIOS',
      path: '/navios',
      color: 'bg-purple-600 hover:bg-purple-700',
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-300'
    },
    {
      icon: Calendar,
      label: 'ESCALAS',
      path: '/escalas',
      color: 'bg-cyan-600 hover:bg-cyan-700',
      iconBg: 'bg-cyan-500/20',
      iconColor: 'text-cyan-300'
    },
    {
      icon: ClipboardCheck,
      label: 'VISTORIAS (DESENVOLVIMENTO',
      path: '/vistorias',
      color: 'bg-teal-600 hover:bg-teal-700',
      iconBg: 'bg-teal-500/20',
      iconColor: 'text-teal-300'
    },
    {
      icon: Car,
      label: 'MASTER DRIVE (DESENVOLVIMENTO)',
      path: '/master-drive',
      color: 'bg-indigo-600 hover:bg-indigo-700',
      iconBg: 'bg-indigo-500/20',
      iconColor: 'text-indigo-300'
    },
    {
      icon: AlertTriangle,
      label: 'OCORRÊNCIAS (DESENVOLVIMENTO)',
      path: '/ocorrencias',
      color: 'bg-orange-600 hover:bg-orange-700',
      iconBg: 'bg-orange-500/20',
      iconColor: 'text-orange-300'
    },
    {
      icon: Percent,
      label: 'RATEIOS',
      path: '/rateios',
      color: 'bg-amber-600 hover:bg-amber-700',
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-300'
    },
    {
      icon: Bell,
      label: 'NOTIFICAÇÕES',
      path: '/notificacao',
      color: 'bg-violet-600 hover:bg-violet-700',
      iconBg: 'bg-violet-500/20',
      iconColor: 'text-violet-300',
      hasNotification: hasUnread
    },
    {
      icon: Building2,
      label: 'RDO SANTOS BRASIL',
      path: '/santos-brasil',
      color: 'bg-red-600 hover:bg-red-700',
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-300'
    },
    {
      icon: BarChart3,
      label: 'VISUAIS E DASHBOARD',
      path: '/visuais',
      color: 'bg-green-600 hover:bg-green-700',
      iconBg: 'bg-green-500/20',
      iconColor: 'text-green-300'
    }
  ];

  const quickActions = [
    {
      icon: FileText,
      label: 'NOVO LANÇAMENTO',
      path: '/novo-lancamento',
      color: 'bg-cyan-500 hover:bg-cyan-600',
      iconBg: 'bg-cyan-400/20'
    },
    {
      icon: Building2,
      label: 'NOVO RDO SANTOS BRASIL',
      path: '/santos-brasil/novo',
      color: 'bg-red-500 hover:bg-red-600',
      iconBg: 'bg-red-400/20'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      title: 'Novo relatório de transporte',
      description: 'Operação HYDRO - Área 82',
      icon: FileText,
      iconColor: 'text-blue-300',
      iconBg: 'bg-blue-500/20',
      time: 'há 2 horas'
    },
    {
      id: 2,
      title: 'Rateio processado',
      description: 'BM-001 - ALBRAS COQUE',
      icon: Percent,
      iconColor: 'text-amber-300',
      iconBg: 'bg-amber-500/20',
      time: 'há 3 horas'
    },
    {
      id: 3,
      title: 'Navio atualizado',
      description: 'LCA/UFO MAY2010 - 0.5%',
      icon: Ship,
      iconColor: 'text-purple-300',
      iconBg: 'bg-purple-500/20',
      time: 'há 4 horas'
    },
    {
      id: 4,
      title: 'Vistoria realizada',
      description: 'Caminhão ABC-1234',
      icon: ClipboardCheck,
      iconColor: 'text-teal-300',
      iconBg: 'bg-teal-500/20',
      time: 'há 5 horas'
    }
  ];

  const upcomingOperations = [
    {
      id: 1,
      navio: 'MAYA ACE',
      operacao: 'DESCARGA',
      terminal: 'TECON',
      eta: '15:30',
      status: 'AGENDADO'
    },
    {
      id: 2,
      navio: 'ALPHA STAR',
      operacao: 'CARGA',
      terminal: 'BRASIL TERMINAIS',
      eta: '18:45',
      status: 'EM ANDAMENTO'
    },
    {
      id: 3,
      navio: 'OCEAN WAVE',
      operacao: 'DESCARGA',
      terminal: 'TECON',
      eta: '22:00',
      status: 'AGENDADO'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header Mobile */}
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
              <h1 className="text-xl font-bold text-white">Gestão de Operações</h1>
              <p className="text-sm text-blue-300">{userProfile?.full_name || 'Usuário'}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="text-blue-300 hover:bg-blue-800/50"
            title="Sair do sistema"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Sidebar Mobile */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-blue-900/95 backdrop-blur-sm">
          <div className="flex justify-between items-center p-4 border-b border-blue-600/30">
            <h2 className="text-xl font-bold text-white">Menu</h2>
            <Button
              variant="ghost"
              onClick={() => setSidebarOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <div className="p-4 space-y-3 overflow-y-auto h-[calc(100%-80px)]">
            {/* Menu Principal Mobile */}
            <div className="space-y-2">
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`w-full h-16 ${item.color} text-white text-lg font-semibold rounded-xl transition-all duration-300 relative hover:shadow-lg hover:scale-[1.02]`}
                >
                  <div className="flex items-center justify-start space-x-4 w-full">
                    <div className={`${item.iconBg} p-3 rounded-lg`}>
                      <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                    </div>
                    <span className="text-left">{item.label}</span>
                  </div>
                  {item.hasNotification && (
                    <span className="absolute top-3 right-3 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  )}
                </Button>
              ))}
            </div>
            
            {/* Separador */}
            <div className="my-4 border-t border-blue-600/30"></div>
            
            {/* Ações Rápidas Mobile */}
            <div className="space-y-2">
              <h3 className="text-blue-200 font-semibold text-sm uppercase tracking-wider mb-2">Ações Rápidas</h3>
              {quickActions.map((action) => (
                <Button
                  key={action.path}
                  onClick={() => {
                    navigate(action.path);
                    setSidebarOpen(false);
                  }}
                  className={`w-full h-14 ${action.color} text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02]`}
                >
                  <div className="flex items-center justify-start space-x-3 w-full">
                    <div className={`${action.iconBg} p-2 rounded-lg`}>
                      <action.icon className="h-4 w-4 text-white" />
                    </div>
                    <span>{action.label}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen">
        {/* Sidebar Desktop */}
        <div className="w-80 bg-blue-900/30 backdrop-blur-sm border-r border-blue-600/30 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-blue-600/30">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-500/20 p-3 rounded-xl">
                <BarChart3 className="h-8 w-8 text-blue-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Gestão de Operações</h1>
                <p className="text-blue-300 text-sm">(versão 20.00)</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-blue-600/30">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-blue-200/30">
              <p className="text-white font-semibold text-lg">{userProfile?.full_name || 'Usuário'}</p>
              <p className="text-blue-300 text-sm mt-1">Status: <span className="text-green-400 font-medium">Ativo</span></p>
              <p className="text-blue-300 text-sm mt-1">Último acesso: {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          {/* Main Menu */}
          <div className="flex-1 p-6 space-y-3 overflow-y-auto">
            <h3 className="text-blue-200 font-semibold text-sm uppercase tracking-wider mb-4">Menu Principal</h3>
            {menuItems.map((item) => (
              <Button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full h-16 ${item.color} text-white text-lg font-semibold rounded-xl transition-all duration-300 relative group hover:shadow-lg hover:scale-[1.02]`}
              >
                <div className="flex items-center justify-start space-x-4 w-full">
                  <div className={`${item.iconBg} p-3 rounded-lg group-hover:bg-white/30 transition-colors`}>
                    <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                  </div>
                  <span className="text-left">{item.label}</span>
                </div>
                {item.hasNotification && (
                  <span className="absolute top-4 right-4 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
              </Button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="p-6 border-t border-blue-600/30">
            <h3 className="text-blue-200 font-semibold text-sm uppercase tracking-wider mb-4">Ações Rápidas</h3>
            {quickActions.map((action) => (
              <Button
                key={action.path}
                onClick={() => navigate(action.path)}
                className={`w-full h-14 ${action.color} text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02]`}
              >
                <div className="flex items-center justify-start space-x-3 w-full">
                  <div className={`${action.iconBg} p-2 rounded-lg`}>
                    <action.icon className="h-4 w-4 text-white" />
                  </div>
                  <span>{action.label}</span>
                </div>
              </Button>
            ))}
          </div>

          {/* Logout */}
          <div className="p-6 border-t border-blue-600/30">
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full text-blue-300 hover:text-white hover:bg-blue-500/20 border-blue-300/30 rounded-xl transition-all duration-300 py-3 hover:shadow"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sair do Sistema
            </Button>
          </div>
        </div>

        {/* Main Content Desktop */}
        <div className="flex-1 flex flex-col">
          {/* Welcome Section */}
          <div className="bg-blue-800/30 backdrop-blur-sm border-b border-blue-600/30 p-8">
            <div className="max-w-4xl">
              <h2 className="text-3xl font-bold text-white mb-4">
                Bem-vindo, <span className="text-blue-300">{userProfile?.full_name || 'Usuário'}</span>!
              </h2>
              <p className="text-lg text-blue-200">
                Sistema de gestão de operações, navios e relatórios integrados
              </p>
            </div>
          </div>

          {/* Main Dashboard Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card className="bg-white/10 backdrop-blur-sm border-blue-200/30 hover:shadow-lg transition-all hover:scale-[1.02]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-200">Operações Hoje</p>
                      <p className="text-3xl font-bold text-white">{stats.operacoesHoje}</p>
                      <p className="text-xs text-blue-300 mt-1">+2 em relação a ontem</p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-500/20">
                      <TrendingUp className="h-6 w-6 text-blue-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-blue-200/30 hover:shadow-lg transition-all hover:scale-[1.02]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-200">Navios Ativos</p>
                      <p className="text-3xl font-bold text-white">{stats.naviosAtivos}</p>
                      <p className="text-xs text-blue-300 mt-1">Todos em operação</p>
                    </div>
                    <div className="p-3 rounded-lg bg-purple-500/20">
                      <Ship className="h-6 w-6 text-purple-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-blue-200/30 hover:shadow-lg transition-all hover:scale-[1.02]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-200">Rateios Pendentes</p>
                      <p className="text-3xl font-bold text-white">{stats.rateiosPendentes}</p>
                      <p className="text-xs text-blue-300 mt-1">Aguardando processamento</p>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-500/20">
                      <Percent className="h-6 w-6 text-amber-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-blue-200/30 hover:shadow-lg transition-all hover:scale-[1.02]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-200">Total de Operações</p>
                      <p className="text-3xl font-bold text-white">{stats.totalOperacoes}</p>
                      <p className="text-xs text-blue-300 mt-1">Desde o início</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-500/20">
                      <CheckCircle className="h-6 w-6 text-green-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-blue-200/30 hover:shadow-lg transition-all hover:scale-[1.02]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-200">Vistorias Pendentes</p>
                      <p className="text-3xl font-bold text-white">{stats.vistoriasPendentes}</p>
                      <p className="text-xs text-blue-300 mt-1">Aguardando realização</p>
                    </div>
                    <div className="p-3 rounded-lg bg-teal-500/20">
                      <ClipboardCheck className="h-6 w-6 text-teal-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-blue-200/30 hover:shadow-lg transition-all hover:scale-[1.02]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-200">Ocorrências Abertas</p>
                      <p className="text-3xl font-bold text-white">{stats.ocorrenciasAbertas}</p>
                      <p className="text-xs text-blue-300 mt-1">Necessitam atenção</p>
                    </div>
                    <div className="p-3 rounded-lg bg-orange-500/20">
                      <AlertTriangle className="h-6 w-6 text-orange-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Operations */}
            <Card className="bg-white/10 backdrop-blur-sm border-blue-200/30 mb-8">
              <CardHeader className="pb-3 border-b border-blue-200/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-white">Próximas Operações</CardTitle>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-300/30">
                    HOJE
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {upcomingOperations.map((op) => (
                    <div 
                      key={op.id} 
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Anchor className="h-6 w-6 text-blue-300" />
                          </div>
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-xs font-bold">{op.id}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-white font-medium">{op.navio}</p>
                          <p className="text-sm text-blue-300">{op.operacao} • {op.terminal}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm text-blue-300">ETA</p>
                          <p className="text-lg font-semibold text-white">{op.eta}</p>
                        </div>
                        <Badge 
                          className={
                            op.status === 'EM ANDAMENTO' 
                              ? 'bg-green-500/20 text-green-300 border-green-300/30'
                              : 'bg-blue-500/20 text-blue-300 border-blue-300/30'
                          }
                        >
                          {op.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/10 backdrop-blur-sm border-blue-200/30">
                <CardHeader className="pb-3 border-b border-blue-200/30">
                  <CardTitle className="text-xl font-semibold text-white">Atividade Recente</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div 
                        key={activity.id} 
                        className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`${activity.iconBg} p-3 rounded-lg`}>
                            <activity.icon className={`h-4 w-4 ${activity.iconColor}`} />
                          </div>
                          <div>
                            <p className="text-white font-medium">{activity.title}</p>
                            <p className="text-sm text-blue-300">{activity.description}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-300/30 text-xs">
                          {activity.time}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card className="bg-white/10 backdrop-blur-sm border-blue-200/30">
                <CardHeader className="pb-3 border-b border-blue-200/30">
                  <CardTitle className="text-xl font-semibold text-white">Acesso Rápido</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={() => navigate('/escalas')}
                      className="h-auto p-4 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-400/30 rounded-xl text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-cyan-500/30">
                          <Calendar className="h-5 w-5 text-cyan-300" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Escalas</p>
                          <p className="text-sm text-cyan-300">Gestão de turnos</p>
                        </div>
                      </div>
                    </Button>

                    <Button
                      onClick={() => navigate('/pessoal')}
                      className="h-auto p-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-400/30 rounded-xl text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/30">
                          <Users className="h-5 w-5 text-blue-300" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Pessoal</p>
                          <p className="text-sm text-blue-300">Funcionários</p>
                        </div>
                      </div>
                    </Button>

                    <Button
                      onClick={() => navigate('/relatorios')}
                      className="h-auto p-4 bg-green-600/20 hover:bg-green-600/30 border border-green-400/30 rounded-xl text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/30">
                          <BarChart3 className="h-5 w-5 text-green-300" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Relatórios</p>
                          <p className="text-sm text-green-300">Análises</p>
                        </div>
                      </div>
                    </Button>

                    <Button
                      onClick={() => navigate('/notificacao')}
                      className="h-auto p-4 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-400/30 rounded-xl text-left relative"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-violet-500/30">
                          <Bell className="h-5 w-5 text-violet-300" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Notificações</p>
                          <p className="text-sm text-violet-300">Alertas</p>
                        </div>
                      </div>
                      {hasUnread && (
                        <span className="absolute top-3 right-3 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                      )}
                    </Button>
                  </div>

                  {/* System Status */}
                  <div className="mt-6 pt-6 border-t border-blue-200/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-300">Status do Sistema</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                          <span className="text-sm text-green-400 font-medium">Operacional</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-blue-300">Última Atualização</p>
                        <p className="text-sm text-white">{new Date().toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Content (quando sidebar fechada) */}
      {!sidebarOpen && (
        <div className="lg:hidden p-4">
          {/* Welcome Mobile */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              Bem-vindo, <span className="text-blue-300">{userProfile?.full_name || 'Usuário'}</span>!
            </h2>
            <p className="text-blue-300">
              Sistema de gestão de operações
            </p>
          </div>

          {/* Stats Mobile */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="bg-white/10 backdrop-blur-sm border-blue-200/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-blue-200">Operações</p>
                    <p className="text-xl font-bold text-white">{stats.operacoesHoje}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <TrendingUp className="h-4 w-4 text-blue-300" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-blue-200/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-blue-200">Navios</p>
                    <p className="text-xl font-bold text-white">{stats.naviosAtivos}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Ship className="h-4 w-4 text-purple-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Menu Mobile Grid */}
          <div className="space-y-3">
            {menuItems.map((item) => (
              <Card key={item.path} className="bg-white/10 backdrop-blur-sm border-blue-200/30">
                <CardContent className="p-0">
                  <Button
                    onClick={() => navigate(item.path)}
                    className={`w-full h-14 ${item.color} text-white font-semibold rounded-lg relative`}
                  >
                    <div className="flex items-center justify-start space-x-3 w-full px-4">
                      <div className={`${item.iconBg} p-2 rounded-lg`}>
                        <item.icon className={`h-4 w-4 ${item.iconColor}`} />
                      </div>
                      <span className="text-sm">{item.label}</span>
                    </div>
                    {item.hasNotification && (
                      <span className="absolute top-2 right-2 flex h-3 w-3">
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions Mobile */}
          <div className="mt-6">
            <h3 className="text-blue-200 font-semibold text-sm mb-3">Ações Rápidas</h3>
            <div className="grid grid-cols-1 gap-3">
              {quickActions.map((action) => (
                <Button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className={`w-full h-12 ${action.color} text-white font-semibold rounded-lg`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <action.icon className="h-4 w-4" />
                    <span className="text-sm">{action.label}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;