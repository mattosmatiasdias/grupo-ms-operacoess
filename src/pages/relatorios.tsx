// src/pages/relatorios.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  BarChart3,
  Search,
  ArrowRight,
  Clock,
  AlertTriangle,
  CheckCircle,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { EscalasLayout } from '@/components/Escalas/EscalasLayout';

export default function Relatorios() {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [selectedFuncId, setSelectedFuncId] = useState('');
  const [isLoadingFuncs, setIsLoadingFuncs] = useState(false);

  // Carrega lista de funcionários para o modal de busca rápida
  useEffect(() => {
    const loadFuncionarios = async () => {
      setIsLoadingFuncs(true);
      const { data } = await supabase
        .from('escalas_funcionarios')
        .select('id, nome_completo, matricula, funcao')
        .eq('status', 'Ativo')
        .order('nome_completo');
      setFuncionarios(data || []);
      setIsLoadingFuncs(false);
    };
    loadFuncionarios();
  }, []);

  const handleGoToAnalise = () => {
    if (!selectedFuncId) {
      toast.error('Selecione um funcionário');
      return;
    }
    setIsSearchOpen(false);
    navigate(`/analise/${selectedFuncId}`);
  };

  const reportGroups = [
    {
      title: "Operacional & Financeiro",
      description: "Análise de custos, horas trabalhadas e produtividade das equipes.",
      items: [
        {
          id: 'produtividade',
          title: "Produtividade vs Previsto",
          description: "Compare horas realizadas com as horas planejadas por frente de serviço.",
          icon: <BarChart3 className="h-8 w-8 text-cyan-400" />,
          color: "border-cyan-500/30 bg-cyan-900/10 hover:bg-cyan-900/20",
          action: () => toast.info("Módulo de Produtividade em desenvolvimento"),
        },
        {
          id: 'custos',
          title: "Análise de Custos",
          description: "Detalhamento de gastos por equipamento (Truck, Operador, etc.) e HE.",
          icon: <DollarSign className="h-8 w-8 text-green-400" />,
          color: "border-green-500/30 bg-green-900/10 hover:bg-green-900/20",
          action: () => toast.info("Módulo de Custos em desenvolvimento"),
        },
      ]
    },
    {
      title: "Gestão de Pessoal",
      description: "Relatórios individuais, folhas de pagamento e controle de ocorrências.",
      items: [
        {
          id: 'analise-individual',
          title: "Análise Individual",
          description: "Relatório completo de horas, faltas, atestados e salários por colaborador.",
          icon: <Users className="h-8 w-8 text-blue-400" />,
          color: "border-blue-500/30 bg-blue-900/10 hover:bg-blue-900/20",
          action: () => setIsSearchOpen(true),
        },
        {
          id: 'folha-pagamento',
          title: "Fechamento de Folha (16 a 15)",
          description: "Geração de resumo mensal para pagamento de salários e horas extras.",
          icon: <FileText className="h-8 w-8 text-purple-400" />,
          color: "border-purple-500/30 bg-purple-900/10 hover:bg-purple-900/20",
          action: () => toast.info("Módulo de Folha em desenvolvimento"),
        },
      ]
    },
    {
      title: "Ocorrências & Frequência",
      description: "Controle de faltas, afastamentos e atestados médicos.",
      items: [
        {
          id: 'ocorrencias',
          title: "Relatório de Ocorrências",
          description: "Histórico de faltas justificadas, atestados e suspensões.",
          icon: <AlertTriangle className="h-8 w-8 text-amber-400" />,
          color: "border-amber-500/30 bg-amber-900/10 hover:bg-amber-900/20",
          action: () => navigate('/ocorrencias'),
        },
        {
          id: 'eficiencia',
          title: "Taxa de Ausência",
          description: "Análise comparativa de absenteísmo entre turmas e funções.",
          icon: <TrendingUp className="h-8 w-8 text-red-400" />,
          color: "border-red-500/30 bg-red-900/10 hover:bg-red-900/20",
          action: () => toast.info("Módulo de Eficiência em desenvolvimento"),
        },
      ]
    }
  ];

  return (
    <EscalasLayout 
      title="Central de Relatórios" 
      subtitle="Consulte produtividade, custos e gestão de pessoas"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Ação Rápida: Buscar Colaborador */}
        <div className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border border-blue-500/30 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/20 rounded-lg">
              <Search className="h-8 w-8 text-blue-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Busca Rápida de Colaborador</h3>
              <p className="text-blue-200/70 text-sm">
                Gere um relatório individual completo (Horas, HE, Salário) para um funcionário específico.
              </p>
            </div>
          </div>
          
          <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-lg shadow-blue-500/20">
                <Users className="h-4 w-4" />
                Selecionar Funcionário
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700 text-white">
              <DialogHeader>
                <DialogTitle>Gerar Relatório Individual</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Selecione o funcionário para visualizar o histórico de horas e pagamentos.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Funcionário</label>
                  <Select value={selectedFuncId} onValueChange={setSelectedFuncId} disabled={isLoadingFuncs}>
                    <SelectTrigger className="bg-slate-800 border-slate-600">
                      <SelectValue placeholder="Carregando funcionários..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600 max-h-60">
                      {funcionarios.map((func) => (
                        <SelectItem key={func.id} value={func.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{func.nome_completo}</span>
                            <span className="text-xs text-slate-400">
                              {func.funcao} • {func.matricula || 'Sem matrícula'}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsSearchOpen(false)} className="border-slate-600 text-slate-300">
                  Cancelar
                </Button>
                <Button onClick={handleGoToAnalise} className="bg-cyan-600 hover:bg-cyan-700 text-white">
                  Gerar Relatório
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Grid de Relatórios */}
        <div className="space-y-8">
          {reportGroups.map((group, groupIdx) => (
            <div key={groupIdx}>
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-blue-400" />
                <h2 className="text-xl font-semibold text-white">{group.title}</h2>
              </div>
              <p className="text-slate-400 mb-6 pl-7">{group.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.items.map((item) => (
                  <Card 
                    key={item.id} 
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg border ${item.color}`}
                    onClick={item.action}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="p-2 bg-slate-800/50 rounded-lg">
                          {item.icon}
                        </div>
                        <ArrowRight className="h-5 w-5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <CardTitle className="text-white mt-4 text-lg">{item.title}</CardTitle>
                      <CardDescription className="text-slate-400 mt-2">
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="ghost" className="w-full text-sm justify-start text-slate-300 hover:text-white hover:bg-white/5">
                        Acessar Relatório
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </EscalasLayout>
  );
}