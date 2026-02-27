// src/components/Dashboard.tsx
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, FileText, Ship, LogOut, BarChart3, Menu, X, 
  Calendar, ClipboardCheck, Car, AlertTriangle, Building2, 
  Percent, Activity, Clock, ArrowUpRight, Users // Adicionei Users aqui
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Dashboard = () => {
  const { userProfile, signOut } = useAuth();
  const { hasUnread } = useNotifications();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const menuItems = [
    {
      icon: FileText,
      label: 'Relatório Transporte',
      path: '/relatorio-transporte',
      color: 'text-blue-400',
      bgHover: 'hover:bg-blue-500/10',
    },
    {
      icon: Ship,
      label: 'Navios',
      path: '/navios',
      color: 'text-purple-400',
      bgHover: 'hover:bg-purple-500/10',
    },
    {
      icon: Calendar,
      label: 'Escalas',
      path: '/escalas',
      color: 'text-cyan-400',
      bgHover: 'hover:bg-cyan-500/10',
    },
    {
      icon: ClipboardCheck,
      label: 'Vistorias',
      path: '/vistorias',
      color: 'text-teal-400',
      bgHover: 'hover:bg-teal-500/10',
    },
    {
      icon: Car,
      label: 'Master Drive',
      path: '/master-drive',
      color: 'text-indigo-400',
      bgHover: 'hover:bg-indigo-500/10',
    },
    {
      icon: AlertTriangle,
      label: 'Ocorrências',
      path: '/ocorrencias',
      color: 'text-orange-400',
      bgHover: 'hover:bg-orange-500/10',
    },
    {
      icon: Percent,
      label: 'Rateios',
      path: '/rateios',
      color: 'text-amber-400',
      bgHover: 'hover:bg-amber-500/10',
    },
    {
      icon: Bell,
      label: 'Notificações',
      path: '/notificacao',
      color: 'text-violet-400',
      bgHover: 'hover:bg-violet-500/10',
      hasNotification: hasUnread
    },
    {
      icon: Building2,
      label: 'RDO Santos Brasil',
      path: '/santos-brasil',
      color: 'text-red-400',
      bgHover: 'hover:bg-red-500/10',
    },
    {
      icon: BarChart3,
      label: 'Visuais e Dashboard',
      path: '/visuais',
      color: 'text-emerald-400',
      bgHover: 'hover:bg-emerald-500/10',
    },
    // NOVO MÓDULO HH - HOMEM HORA
    {
      icon: Users, // Ícone de usuários para representar Homem Hora
      label: 'Homem Hora',
      path: '/homem-hora',
      color: 'text-pink-400', // Cor rosa para diferenciar
      bgHover: 'hover:bg-pink-500/10',
    }
  ];

  // Dados de Estatísticas
  const statsData = [
    { label: 'Operações Hoje', value: '12', change: '+2', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Navios Ativos', value: '3', change: 'Estável', icon: Ship, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Rateios Pendentes', value: '8', change: '-1', icon: Percent, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  // Dados de Atividade Recente com Mapeamento de Ícones para evitar erros JSX
  const rawRecentActivity = [
    { title: 'Novo relatório de transporte', sub: 'Operação HYDRO - Área 82', time: '2h', type: 'file' as const, colorClass: 'bg-blue-500/10 text-blue-400' },
    { title: 'Rateio processado', sub: 'BM-001 - ALBRAS COQUE', time: '3h', type: 'percent' as const, colorClass: 'bg-amber-500/10 text-amber-400' },
    { title: 'Navio atualizado', sub: 'LCA/UFO MAY2010 - 0.5%', time: '4h', type: 'ship' as const, colorClass: 'bg-purple-500/10 text-purple-400' },
  ];

  // Mapeamento seguro dos ícones
  const recentActivity = rawRecentActivity.map(item => ({
    ...item,
    Icon: item.type === 'file' ? FileText : (item.type === 'ship' ? Ship : Percent)
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Layout Desktop */}
      <div className="hidden lg:flex min-h-screen">
        {/* Sidebar Desktop */}
        <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0">
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600/20 p-2 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight leading-none">Gestão Ops</h1>
                <p className="text-xs text-slate-500 mt-1">VERSÃO: 25.00</p>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-1">
            <div className="px-2 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Módulos
            </div>
            {menuItems.map((item) => (
              <Button
                key={item.path}
                onClick={() => navigate(item.path)}
                variant="ghost"
                className={`w-full justify-start h-10 px-3 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors relative group ${item.bgHover}`}
              >
                <item.icon className={`mr-3 h-4 w-4 ${item.color}`} />
                <span className="text-sm font-medium">{item.label}</span>
                {item.hasNotification && (
                  <span className="ml-auto flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </Button>
            ))}
          </div>

          <div className="p-4 border-t border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-3 px-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-blue-500/20">
                {userProfile?.full_name?.substring(0,2).toUpperCase() || 'US'}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium text-white truncate leading-tight">{userProfile?.full_name || 'Usuário'}</span>
                <span className="text-xs text-slate-500 truncate">Operador</span>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white justify-start h-9 text-sm"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair do Sistema
            </Button>
          </div>
        </div>

        {/* Main Content Desktop */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-950/50">
          <div className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50 px-8 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Visão Geral</h2>
              <p className="text-xs text-slate-400">Resumo das operações diárias</p>
            </div>
            <div className="flex items-center gap-3">
               <div className="text-right hidden sm:block">
                 <div className="text-sm font-medium text-white">{new Date().toLocaleDateString('pt-BR')}</div>
                 <div className="text-xs text-slate-500">{new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</div>
               </div>
               <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-white hover:bg-slate-800">
                 <Bell className="h-5 w-5" />
                 {hasUnread && (
                   <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-slate-950"></span>
                 )}
               </Button>
            </div>
          </div>

          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="rounded-xl bg-gradient-to-r from-blue-900/40 to-slate-900/40 border border-blue-800/30 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  Bem-vindo, <span className="text-blue-400">{userProfile?.full_name?.split(' ')[0] || 'Usuário'}</span>
                </h3>
                <p className="text-sm text-slate-400 mt-1">Sistema de gestão de operações portuárias integradas.</p>
              </div>
              <div className="flex gap-2">
                 <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 h-9">
                   <Activity className="mr-2 h-4 w-4" /> Status Operacional
                 </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {statsData.map((stat, idx) => (
                <Card key={idx} className="bg-slate-900/40 border-slate-800 p-4 flex items-center justify-between hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                      <p className="text-xl font-bold text-white mt-0.5">{stat.value}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stat.change.startsWith('+') ? 'bg-green-500/10 text-green-400' : 'bg-slate-800 text-slate-400'}`}>
                      {stat.change}
                    </span>
                  </div>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-slate-900/40 border-slate-800 shadow-sm">
                  <CardHeader className="pb-3 border-b border-slate-800/50 px-6">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-slate-100 text-base font-medium">Atividade Recente</CardTitle>
                      <Button variant="ghost" size="sm" className="text-xs text-blue-400 hover:text-blue-300 h-auto p-0">Ver tudo</Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-1">
                    {recentActivity.map((activity, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800/40 transition-colors group cursor-default">
                        <div className="flex items-center gap-4 overflow-hidden">
                          <div className={`p-2 rounded-md ${activity.colorClass}`}>
                             <activity.Icon className="h-4 w-4"/>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-200 group-hover:text-white truncate">{activity.title}</p>
                            <p className="text-xs text-slate-500 truncate">{activity.sub}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                           <Badge variant="outline" className="bg-slate-900/50 border-slate-700 text-slate-400 text-xs py-0 h-5 px-2">
                             {activity.time}
                           </Badge>
                           <ArrowUpRight className="h-4 w-4 text-slate-600 group-hover:text-slate-400 transition-colors"/>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                 <Card className="bg-gradient-to-br from-indigo-900/20 to-slate-900/40 border-indigo-800/30 p-5 text-center">
                    <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-400">
                       <BarChart3 className="w-6 h-6" />
                    </div>
                    <h4 className="text-white font-medium">Visuais Avançados</h4>
                    <p className="text-xs text-slate-400 mt-2 mb-4 leading-relaxed">
                      Acesse gráficos detalhados de produtividade e rateios por centro de custo.
                    </p>
                    <Button onClick={() => navigate('/visuais')} variant="outline" className="w-full border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 text-xs h-8">
                       Abrir Dashboard
                    </Button>
                 </Card>

                 <Card className="bg-slate-900/40 border-slate-800 p-0 overflow-hidden">
                    <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-800">
                        <h4 className="text-xs font-semibold text-slate-300 uppercase">Acesso Rápido</h4>
                    </div>
                    <div className="p-2">
                        <Button onClick={() => navigate('/novo-lancamento')} variant="ghost" className="w-full justify-start h-9 px-3 text-slate-400 hover:text-white hover:bg-slate-800">
                           <FileText className="mr-2 h-3.5 w-3.5 text-blue-400" /> Novo Relatório
                        </Button>
                        <Button onClick={() => navigate('/ocorrencias')} variant="ghost" className="w-full justify-start h-9 px-3 text-slate-400 hover:text-white hover:bg-slate-800">
                           <AlertTriangle className="mr-2 h-3.5 w-3.5 text-orange-400" /> Registrar Ocorrência
                        </Button>
                    </div>
                 </Card>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col min-h-screen bg-slate-950">
        <div className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-30 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <Button onClick={() => setSidebarOpen(true)} variant="ghost" size="icon" className="text-white hover:bg-slate-800">
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
               <BarChart3 className="text-blue-500 w-5 h-5" />
               <h1 className="text-lg font-bold text-white leading-tight">Gestão Ops</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-white">
              <Bell className="h-5 w-5" />
              {hasUnread && (
                <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-slate-900"></span>
              )}
            </Button>
            <Button onClick={handleSignOut} variant="ghost" size="icon" className="text-slate-400 hover:text-red-400 hover:bg-red-500/10">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {sidebarOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="flex justify-between items-center p-4 border-b border-slate-800">
              <h2 className="text-white font-bold text-lg">Menu de Navegação</h2>
              <Button onClick={() => setSidebarOpen(false)} variant="ghost" size="icon" className="text-white hover:bg-slate-800">
                <X className="w-6 h-6" />
              </Button>
            </div>
            <div className="p-4 space-y-2 overflow-y-auto h-[calc(100%-80px)]">
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`w-full justify-start h-12 px-4 ${item.bgHover} bg-slate-900 text-slate-300 hover:text-white border border-slate-800 rounded-lg transition-all`}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${item.color}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.hasNotification && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-red-500"></span>
                  )}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 space-y-6 pb-20">
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Total Horas (Hoje)</p>
                <p className="text-2xl font-bold text-white">124.5h</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {menuItems.slice(0, 6).map((item) => (
                 <Card key={item.path} className="bg-slate-900/40 border-slate-800 hover:border-slate-600 transition-colors cursor-pointer group" onClick={() => navigate(item.path)}>
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                       <div className={`p-2 rounded-lg ${item.bgHover} ${item.color} group-hover:scale-110 transition-transform`}>
                         <item.icon className="w-6 h-6" />
                       </div>
                       <span className="text-xs font-semibold text-slate-300 group-hover:text-white">{item.label}</span>
                    </CardContent>
                 </Card>
              ))}
            </div>

            <Card className="bg-slate-900/40 border-slate-800">
               <CardHeader className="px-4 py-3 border-b border-slate-800/50">
                  <CardTitle className="text-sm font-medium text-slate-300">Recentes</CardTitle>
               </CardHeader>
               <CardContent className="p-0">
                  {recentActivity.map((activity, idx) => (
                     <div key={idx} className="p-3 border-b border-slate-800/50 last:border-0 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className={`p-1.5 rounded ${activity.colorClass}`}>
                              <activity.Icon className="h-3.5 w-3.5"/>
                           </div>
                           <div className="flex flex-col">
                              <span className="text-xs font-medium text-white">{activity.title}</span>
                              <span className="text-[10px] text-slate-500">{activity.sub}</span>
                           </div>
                        </div>
                        <span className="text-[10px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">{activity.time}</span>
                     </div>
                  ))}
               </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;