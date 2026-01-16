import { ReactNode, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Home, Calendar, Users, AlertTriangle, TrendingUp, 
  Menu, X, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface EscalasLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function EscalasLayout({ children, title, subtitle }: EscalasLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: "Menu Principal", path: "/", color: "bg-blue-600 hover:bg-blue-700" },
    { icon: BarChart3, label: "Dashboard", path: "/escalas/dashboard", color: "bg-cyan-600 hover:bg-cyan-700" },
    { icon: Users, label: "Pessoal", path: "/escalas/pessoal", color: "bg-blue-600 hover:bg-blue-700" },
    { icon: Calendar, label: "Escalas", path: "/escalas", color: "bg-purple-600 hover:bg-purple-700" },
    { icon: AlertTriangle, label: "Ocorrências", path: "/escalas/ocorrencias", color: "bg-orange-600 hover:bg-orange-700" },
    { icon: TrendingUp, label: "Relatórios", path: "/escalas/relatorios", color: "bg-green-600 hover:bg-green-700" },
  ];

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-950 text-white">
      {/* Mobile Header */}
      <div className="lg:hidden bg-blue-900/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
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
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-blue-300 hover:bg-blue-800/50"
            title="Menu Principal"
          >
            <Home className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="flex min-h-screen">
        {/* Sidebar - Desktop */}
        <div className="hidden lg:flex w-64 bg-blue-900/30 backdrop-blur-sm border-r border-blue-600/30 flex-col fixed left-0 top-0 bottom-0 z-40">
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
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full h-14 ${isActive ? "bg-cyan-600/30 border border-cyan-500/50" : "bg-white/5 hover:bg-white/10"} text-white font-medium rounded-lg transition-all duration-300 hover:shadow-md`}
                >
                  <div className="flex items-center justify-start space-x-3 w-full">
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                </Button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-blue-600/30">
            <Button
              onClick={() => navigate("/")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 gap-2"
            >
              <Home className="h-4 w-4" />
              Menu Principal
            </Button>
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

        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          <div className="p-4 md:p-6">
            {/* Page Header - Desktop */}
            <div className="hidden lg:block mb-8">
              <h1 className="text-3xl font-bold text-white">{title}</h1>
              {subtitle && <p className="text-blue-300 mt-2">{subtitle}</p>}
            </div>

            {/* Page Content */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
