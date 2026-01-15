// src/pages/escalas/Dashboard.tsx - Com layout integrado
import { Users, UserCheck, AlertTriangle, Calendar, TrendingUp, Home, Menu, X, BarChart3 as BarChart3Icon, Users as UsersIcon, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

// Componente Layout integrado (similar ao da página Escalas)
function EscalasLayout({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: string }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: 'Menu Principal', path: '/', color: 'bg-blue-600 hover:bg-blue-700' },
    { icon: BarChart3Icon, label: 'Dashboard', path: '/escalas/dashboard', color: 'bg-cyan-600 hover:bg-cyan-700' },
    { icon: UsersIcon, label: 'Pessoal', path: '/escalas/pessoal', color: 'bg-blue-600 hover:bg-blue-700' },
    { icon: Calendar, label: 'Escalas', path: '/escalas', color: 'bg-purple-600 hover:bg-purple-700' },
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
                <Calendar className="h-8 w-8 text-cyan-300" />
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
export default function EscalasDashboard() {
  // Dados serão carregados da API
  const stats = {
    totalFuncionarios: 0,
    funcionariosAtivos: 0,
    ocorrenciasRecentes: 0,
    escalasHoje: 0
  };

  return (
    <EscalasLayout 
      title="Dashboard de Escalas" 
      subtitle="Visão geral do sistema de gestão de escalas"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white/5 backdrop-blur-sm border-blue-200/30 hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-200">Total de Funcionários</p>
                <p className="text-3xl font-bold text-white">{stats.totalFuncionarios}</p>
                <p className="text-xs text-blue-300 mt-1">Cadastrados no sistema</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/20">
                <Users className="h-6 w-6 text-blue-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-sm border-blue-200/30 hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-200">Funcionários Ativos</p>
                <p className="text-3xl font-bold text-white">{stats.funcionariosAtivos}</p>
                <p className="text-xs text-blue-300 mt-1">
                  {stats.totalFuncionarios > 0 
                    ? `${Math.round((stats.funcionariosAtivos / stats.totalFuncionarios) * 100)}% do total`
                    : '0% do total'
                  }
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/20">
                <UserCheck className="h-6 w-6 text-green-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-sm border-blue-200/30 hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-200">Ocorrências (30 dias)</p>
                <p className="text-3xl font-bold text-white">{stats.ocorrenciasRecentes}</p>
                <p className="text-xs text-blue-300 mt-1">Faltas, atestados e suspensões</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-500/20">
                <AlertTriangle className="h-6 w-6 text-orange-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-sm border-blue-200/30 hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-200">Escalados Hoje</p>
                <p className="text-3xl font-bold text-white">{stats.escalasHoje}</p>
                <p className="text-xs text-blue-300 mt-1">Funcionários em serviço</p>
              </div>
              <div className="p-3 rounded-lg bg-cyan-500/20">
                <Calendar className="h-6 w-6 text-cyan-300" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 bg-white/5 backdrop-blur-sm border-blue-200/30">
          <CardHeader>
            <CardTitle className="text-xl text-white">Ocorrências por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-16 w-16 text-blue-400 mx-auto mb-4 opacity-50" />
                <p className="text-blue-400/70">
                  Gráfico será carregado após integração com banco de dados
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-sm border-blue-200/30">
          <CardHeader>
            <CardTitle className="text-xl text-white">Distribuição por Função</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <Users className="h-16 w-16 text-cyan-400 mx-auto mb-4 opacity-50" />
                <p className="text-cyan-400/70">
                  Dados de distribuição serão carregados dinamicamente
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/5 backdrop-blur-sm border-blue-200/30">
          <CardHeader>
            <CardTitle className="text-xl text-white">Escalados para Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-blue-400">
              Dados de escalas serão carregados da API
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-sm border-blue-200/30">
          <CardHeader>
            <CardTitle className="text-xl text-white">Ocorrências Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-blue-400">
              Dados de ocorrências serão carregados da API
            </div>
          </CardContent>
        </Card>
      </div>
    </EscalasLayout>
  );
}