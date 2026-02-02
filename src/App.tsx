// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Páginas Gerais
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard"; 

// Páginas do sistema de Escalas
import EscalasDashboard from "./pages/dashboard";
import EscalasCalendar from "./pages/escalas"; 
import Ocorrencias from "./pages/ocorrencias";
import Pessoal from "./pages/pessoal";
import Relatorios from "./pages/relatorios";
import Salarios from "./pages/salarios";
import NovaEscala from "./pages/novaescala";
import VisualizarEscala from "./pages/visualizarescala";
import AnaliseIndividual from "./pages/AnaliseIndividual"; // Importação da nova página

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Rota pública - Acesso livre */}
            <Route path="/auth" element={<Auth />} />

            {/* Rotas protegidas - Requerem autenticação */}
            
            {/* Tela Inicial do App (Menu Principal) */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            {/* Módulo de Dashboard Estatístico */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <EscalasDashboard />
              </ProtectedRoute>
            } />

            {/* Módulo de Calendário */}
            <Route path="/calendario" element={
              <ProtectedRoute>
                <EscalasCalendar />
              </ProtectedRoute>
            } />

            {/* Módulo de Pessoal */}
            <Route path="/pessoal" element={
              <ProtectedRoute>
                <Pessoal />
              </ProtectedRoute>
            } />

            {/* Módulo de Análise Individual (Nova Rota) */}
            <Route path="/analise/:id" element={
              <ProtectedRoute>
                <AnaliseIndividual />
              </ProtectedRoute>
            } />

            {/* Módulo de Salários */}
            <Route path="/salarios" element={
              <ProtectedRoute>
                <Salarios />
              </ProtectedRoute>
            } />

            {/* Módulo de Ocorrências */}
            <Route path="/ocorrencias" element={
              <ProtectedRoute>
                <Ocorrencias />
              </ProtectedRoute>
            } />

            {/* Módulo de Relatórios */}
            <Route path="/relatorios" element={
              <ProtectedRoute>
                <Relatorios />
              </ProtectedRoute>
            } />

            {/* Rotas de Ação (Criar/Ver) */}
            <Route path="/nova" element={
              <ProtectedRoute>
                <NovaEscala />
              </ProtectedRoute>
            } />

            <Route path="/visualizar" element={
              <ProtectedRoute>
                <VisualizarEscala />
              </ProtectedRoute>
            } />

            {/* Redirecionar rotas não encontradas */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;