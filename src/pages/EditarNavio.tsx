// src/pages/EditarNavio.tsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, X, LogOut, ArrowLeft, Ship, BarChart3, 
  Calendar, Anchor, Package, ChevronDown, Plus, Loader2, 
  Activity, Save 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProducaoDia {
  data: string;
  total_tons: number;
}

const tiposCarga = [
  "HIDRATO",
  "CARVAO",
  "BAUXITA",
  "COQUE",
  "PICHE",
  "FLUORETO",
  "LINGOTE"
];

const EditarNavio = () => {
  const { id: navioId } = useParams();
  const { userProfile, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cargaDropdownOpen, setCargaDropdownOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    nome_navio: '',
    carga: '',
    berco: '',
    quantidade_prevista: '',
    cbs_total: '',
    media_cb: '',
    inicio_operacao: '',
    final_operacao: '',
    concluido: false
  });

  const [producaoPorDia, setProducaoPorDia] = useState<ProducaoDia[]>([]);
  const [loadingProd, setLoadingProd] = useState(false);

  const handleCargaSelect = (carga: string) => {
    setFormData(prev => ({ ...prev, carga }));
    setCargaDropdownOpen(false);
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, concluido: checked }));
  };

  const carregarDados = useCallback(async () => {
    setLoading(true);
    setLoadingProd(true);
    try {
      if (!navioId) return;

      const { data: navioData, error: navioError } = await supabase
        .from('navios')
        .select('*')
        .eq('id', navioId)
        .single();
      
      if (navioError) throw navioError;
      
      if (navioData) {
        setFormData({
          nome_navio: navioData.nome_navio || '',
          carga: navioData.carga || '',
          berco: navioData.berco || '',
          quantidade_prevista: navioData.quantidade_prevista?.toString() || '',
          cbs_total: navioData.cbs_total?.toString() || '',
          media_cb: navioData.media_cb?.toString() || '',
          inicio_operacao: navioData.inicio_operacao || '',
          final_operacao: navioData.final_operacao || '',
          concluido: navioData.concluido || false
        });
      }

      const { data: prodData, error: prodError } = await supabase
        .from('registros_producao')
        .select('data, tons_total')
        .eq('navio_id', navioId)
        .order('data', { ascending: true });

      if (prodError) throw prodError;

      if (prodData && prodData.length > 0) {
        const dadosOrdenados = prodData.sort((a, b) => a.data.localeCompare(b.data));

        const agrupado = dadosOrdenados.reduce((acc: any[], curr) => {
          const idx = acc.findIndex(item => item.data === curr.data);
          if (idx !== -1) {
            acc[idx] = { ...acc[idx], total_tons: acc[idx].total_tons + (curr.tons_total || 0) };
          } else {
            acc.push({ data: curr.data, total_tons: curr.tons_total || 0 });
          }
          return acc;
        }, []);
        
        setProducaoPorDia(agrupado.reverse());
      } else {
        setProducaoPorDia([]);
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({ 
        title: "Erro", 
        description: "Não foi possível carregar os dados do navio.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
      setLoadingProd(false);
    }
  }, [navioId, toast]);

  useEffect(() => {
    if (navioId) carregarDados();
  }, [navioId, carregarDados]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [id]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !navioId) return;
    setIsSaving(true);
    
    try {
      const updateData = {
        nome_navio: formData.nome_navio,
        carga: formData.carga,
        berco: formData.berco,
        quantidade_prevista: formData.quantidade_prevista ? Number(formData.quantidade_prevista) : 0,
        cbs_total: formData.cbs_total ? Number(formData.cbs_total) : 0,
        inicio_operacao: formData.inicio_operacao || null,
        final_operacao: formData.final_operacao || null,
        media_cb: formData.media_cb ? Number(formData.media_cb) : 0,
        concluido: formData.concluido
      };

      const { error } = await supabase
        .from('navios')
        .update(updateData)
        .eq('id', navioId);

      if (error) throw error;

      toast({ 
        title: "Sucesso!", 
        description: "Dados do navio atualizados." 
      });
      
      await carregarDados();
      
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      toast({ 
        title: "Erro ao salvar", 
        description: error.message || "Não foi possível salvar os dados.", 
        variant: "destructive" 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const progresso = Number(formData.cbs_total) && Number(formData.quantidade_prevista)
    ? (Number(formData.quantidade_prevista) / Number(formData.cbs_total)) * 100 
    : 0;

  const totalGeralTons = producaoPorDia.reduce((sum, dia) => sum + (dia.total_tons || 0), 0);

  const menuItems = [
    {
      icon: Ship,
      label: 'NAVIOS',
      path: '/navios',
      color: 'text-blue-400',
      bgHover: 'hover:bg-blue-500/10'
    }
  ];

  const handleSignOut = async () => { 
    await signOut(); 
    navigate('/login'); 
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="fixed inset-0 -z-10 bg-slate-950"></div>
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-400">Carregando dados do navio...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 -z-10 bg-slate-950"></div>

      <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 relative">
        {/* Layout Desktop */}
        <div className="hidden lg:flex min-h-screen">
          {/* Sidebar Desktop */}
          <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0">
            <div className="p-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500/20 p-2 rounded-lg">
                  <Ship className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight leading-none">Editar Navio</h1>
                  <p className="text-xs text-slate-500 mt-1">Gestão de Operações</p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-1 overflow-y-auto flex-1">
              <div className="px-2 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Navegação</div>
              <Button onClick={() => navigate('/navios')} variant="ghost" className="w-full justify-start h-10 px-3 text-slate-400 hover:text-white hover:bg-slate-800">
                <ArrowLeft className="mr-3 h-4 w-4" />
                <span className="text-sm font-medium">Voltar para Navios</span>
              </Button>
              {menuItems.map((item) => (
                <Button key={item.path} onClick={() => navigate(item.path)} variant="ghost" className={`w-full justify-start h-10 px-3 text-slate-400 hover:text-white hover:bg-slate-800 ${item.bgHover}`}>
                  <item.icon className={`mr-3 h-4 w-4 ${item.color}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Button>
              ))}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
              <div className="flex items-center gap-3 px-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-purple-500/20">
                  {userProfile?.full_name?.substring(0,2).toUpperCase() || 'US'}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium text-white truncate leading-tight">{userProfile?.full_name || 'Usuário'}</span>
                  <span className="text-xs text-slate-500 truncate">Operador</span>
                </div>
              </div>
              <Button variant="outline" onClick={handleSignOut} className="w-full border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white justify-start h-9 text-sm">
                <LogOut className="mr-2 h-4 w-4" /> Sair do Sistema
              </Button>
            </div>
          </div>

          {/* Main Content Desktop */}
          <div className="flex-1 flex flex-col min-w-0 bg-slate-950/50">
            {/* Sticky Header - Com Nome do Navio e Carga */}
            <div className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50 px-8 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Editar Viagem</h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-slate-400">
                    Navio: <span className="text-slate-300 font-medium">{formData.nome_navio || 'Carregando...'}</span>
                  </p>
                  {formData.carga && (
                    <>
                      <span className="text-slate-600">•</span>
                      <p className="text-xs text-slate-400">
                        Carga: <span className="text-slate-300 font-medium">{formData.carga}</span>
                      </p>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button onClick={() => navigate('/novo-navio')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 shadow-sm shadow-blue-900/20 h-9 text-base font-bold">
                  <Plus className="h-4 w-4 mr-2" /> Novo Navio
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleSignOut} 
                  className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white justify-start h-9 text-sm"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sair
                </Button>
              </div>
            </div>

            <main className="flex-1 overflow-y-auto p-6 space-y-6">
              <form onSubmit={handleSave}>
                {/* Card Dados da Viagem - 3 Colunas */}
                <Card className="bg-slate-900/40 border-slate-800 shadow-sm">
                  <CardHeader className="bg-slate-800/30 border-b border-slate-800/50 px-6 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Anchor className="h-5 w-5 text-blue-400" />
                        <CardTitle className="text-slate-100 text-base font-medium">Dados da Viagem</CardTitle>
                      </div>
                      <Badge variant="outline" className={`
                        ${formData.concluido 
                          ? 'bg-green-500/10 text-green-300 border-green-500/30' 
                          : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                        } px-3 py-1
                      `}>
                        {formData.concluido ? 'Concluído' : 'Em Andamento'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Coluna 1 */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="nome_navio" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Nome do Navio
                          </Label>
                          <Input 
                            id="nome_navio" 
                            value={formData.nome_navio} 
                            onChange={handleChange}
                            className="bg-slate-950 border-slate-700 text-white h-11 px-4 focus-visible:ring-blue-500 text-base"
                            placeholder="Nome do navio"
                            required 
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="carga" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Carga / Produto
                          </Label>
                          <div className="relative">
                            <Input 
                              id="carga" 
                              value={formData.carga} 
                              onChange={handleChange}
                              className="bg-slate-950 border-slate-700 text-white h-11 px-4 focus-visible:ring-blue-500 text-base pr-24"
                              placeholder="Selecione ou digite"
                            />
                            <div className="absolute right-1 top-1/2 -translate-y-1/2">
                              <Button
                                type="button"
                                onClick={() => setCargaDropdownOpen(!cargaDropdownOpen)}
                                variant="ghost"
                                size="sm"
                                className="h-9 px-3 text-slate-400 hover:text-white hover:bg-slate-800"
                              >
                                <span className="text-xs mr-1">{formData.carga || 'Selecionar'}</span>
                                <ChevronDown className={`h-4 w-4 transition-transform ${cargaDropdownOpen ? 'rotate-180' : ''}`} />
                              </Button>
                            </div>
                          </div>
                          {cargaDropdownOpen && (
                            <div className="absolute z-50 w-64 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl">
                              <div className="p-2">
                                <p className="text-xs font-semibold text-slate-400 mb-2 px-2">Selecione o tipo de carga</p>
                                <div className="space-y-1">
                                  {tiposCarga.map((tipo) => (
                                    <button
                                      key={tipo}
                                      type="button"
                                      onClick={() => handleCargaSelect(tipo)}
                                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                                        formData.carga === tipo 
                                          ? 'bg-blue-500/20 text-blue-300' 
                                          : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                                      }`}
                                    >
                                      {tipo}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="berco" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Berço
                          </Label>
                          <select 
                            id="berco"
                            value={formData.berco}
                            onChange={(e) => setFormData(prev => ({ ...prev, berco: e.target.value }))}
                            className="w-full bg-slate-950 border border-slate-700 text-white h-11 px-4 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          >
                            <option value="">Selecione o berço...</option>
                            <option value="101">101</option>
                            <option value="102">102</option>
                            <option value="103">103</option>
                            <option value="104">104</option>
                            <option value="201">201</option>
                            <option value="202">202</option>
                            <option value="203">203</option>
                            <option value="204">204</option>
                          </select>
                        </div>
                      </div>

                      {/* Coluna 2 */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="quantidade_prevista" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Quantidade (Tons)
                          </Label>
                          <div className="relative">
                            <Input 
                              id="quantidade_prevista" 
                              value={formData.quantidade_prevista}
                              type="number"
                              step="0.001"
                              onChange={handleChange} 
                              className="bg-slate-950 border-slate-700 text-white h-11 px-4 focus-visible:ring-blue-500 text-base pr-16"
                              placeholder="0.000"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium">Tons</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cbs_total" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Total CBs
                          </Label>
                          <Input 
                            id="cbs_total" 
                            value={formData.cbs_total}
                            type="number"
                            step="0.001"
                            onChange={handleChange} 
                            className="bg-slate-950 border-slate-700 text-white h-11 px-4 focus-visible:ring-blue-500 text-base"
                            placeholder="0"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="media_cb" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Média CB (Tons/CB)
                          </Label>
                          <div className="relative">
                            <Input 
                              id="media_cb" 
                              value={formData.media_cb}
                              type="number"
                              step="0.0001"
                              onChange={handleChange} 
                              className="bg-slate-950 border-slate-700 text-white h-11 px-4 focus-visible:ring-blue-500 text-base pr-16"
                              placeholder="0.0000"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium">T/CB</span>
                          </div>
                        </div>
                      </div>

                      {/* Coluna 3 */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="inicio_operacao" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Início da Operação
                          </Label>
                          <div className="relative">
                            <Input 
                              id="inicio_operacao" 
                              value={formData.inicio_operacao || ''} 
                              onChange={handleChange} 
                              type="datetime-local" 
                              className="bg-slate-950 border-slate-700 text-white h-11 px-4 focus-visible:ring-blue-500 text-base"
                            />
                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="final_operacao" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Fim da Operação
                          </Label>
                          <div className="relative">
                            <Input 
                              id="final_operacao" 
                              value={formData.final_operacao || ''} 
                              onChange={handleChange} 
                              type="datetime-local" 
                              className="bg-slate-950 border-slate-700 text-white h-11 px-4 focus-visible:ring-blue-500 text-base"
                            />
                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Status
                          </Label>
                          <div className="flex items-center gap-3 h-11 px-4 bg-slate-950/50 rounded-lg border border-slate-800">
                            <Switch 
                              id="concluido" 
                              checked={formData.concluido} 
                              onCheckedChange={handleSwitchChange} 
                              className="data-[state=checked]:bg-blue-600"
                            />
                            <Label htmlFor="concluido" className="text-sm font-medium text-slate-300 cursor-pointer">
                              {formData.concluido ? 'Concluído' : 'Em Andamento'}
                            </Label>
                          </div>
                        </div>

                        {/* Botão Salvar na 3ª coluna */}
                        <div className="pt-4">
                          <Button 
                            type="submit" 
                            disabled={isSaving}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 px-4 rounded-lg font-semibold shadow-lg shadow-blue-900/20"
                          >
                            {isSaving ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Salvando...
                              </>
                            ) : (
                              'Salvar Dados do Navio'
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Card Produção Diária - Sem lixeiras */}
                <Card className="bg-slate-900/40 border-slate-800 shadow-sm">
                  <CardHeader className="bg-slate-800/30 border-b border-slate-800/50 px-6 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-400" />
                        <CardTitle className="text-slate-100 text-base font-medium">Produção Diária</CardTitle>
                        <Badge variant="outline" className="bg-slate-950 border-slate-700 text-slate-400 text-xs px-2 py-0.5">
                          {producaoPorDia.length} registro(s)
                        </Badge>
                      </div>
                      <span className="text-sm text-emerald-400 font-bold">
                        Total: {totalGeralTons.toFixed(3)} T
                      </span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    {loadingProd ? (
                      <div className="flex items-center justify-center h-32">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                      </div>
                    ) : producaoPorDia.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <Activity className="h-10 w-10 mx-auto mb-2 text-slate-600" />
                        <p className="text-sm">Nenhuma produção registrada para este navio.</p>
                        <Button 
                          onClick={() => navigate(`/producao-diaria/${navioId}`)}
                          variant="outline"
                          className="mt-4 border-slate-700 text-slate-300 hover:bg-slate-800"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Produção
                        </Button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-slate-800">
                              <th className="text-left py-3 px-4 text-[10px] uppercase font-bold text-slate-500">Data</th>
                              <th className="text-right py-3 px-4 text-[10px] uppercase font-bold text-slate-500">Toneladas</th>
                              <th className="text-right py-3 px-4 text-[10px] uppercase font-bold text-slate-500">% da Meta</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/50">
                            {producaoPorDia.map((dia) => {
                              const percentualMeta = Number(formData.quantidade_prevista) > 0
                                ? (dia.total_tons / Number(formData.quantidade_prevista)) * 100
                                : 0;
                              
                              return (
                                <tr key={dia.data} className="hover:bg-slate-800/40 transition-colors">
                                  <td className="py-3 px-4 text-sm text-slate-300">
                                    {format(new Date(dia.data), 'dd/MM/yyyy', { locale: ptBR })}
                                  </td>
                                  <td className="py-3 px-4 text-right text-sm font-mono text-slate-300">
                                    {dia.total_tons.toFixed(3)}
                                  </td>
                                  <td className="py-3 px-4 text-right text-sm text-slate-400">
                                    {percentualMeta.toFixed(1)}%
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot className="border-t border-slate-800">
                            <tr>
                              <td className="py-4 px-4 text-xs font-bold text-slate-400">Total Geral</td>
                              <td className="py-4 px-4 text-right text-sm font-bold text-emerald-400">
                                {totalGeralTons.toFixed(3)} Tons
                              </td>
                              <td className="py-4 px-4 text-right text-sm font-bold text-slate-400">
                                {progresso.toFixed(1)}%
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </form>
            </main>
          </div>
        </div>

        {/* Layout Mobile */}
        <div className="lg:hidden flex flex-col min-h-screen bg-slate-950">
          {/* Header Mobile - Com Nome do Navio e Carga */}
          <div className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-30 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <Button onClick={() => navigate('/navios')} variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Ship className="text-blue-400 w-5 h-5" />
                <div>
                  <h1 className="text-lg font-bold text-white leading-tight">Editar Navio</h1>
                  <div className="flex items-center gap-1">
                    <p className="text-[10px] text-slate-400 truncate max-w-[100px]">{formData.nome_navio}</p>
                    {formData.carga && (
                      <>
                        <span className="text-slate-600 text-[10px]">•</span>
                        <p className="text-[10px] text-slate-400 truncate max-w-[80px]">{formData.carga}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => navigate('/novo-navio')} variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                <Plus className="h-5 w-5" />
              </Button>
              <Button onClick={() => setSidebarOpen(true)} variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Sidebar Mobile Overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="flex justify-between items-center p-4 border-b border-slate-800">
                <h2 className="text-white font-bold text-lg">Menu</h2>
                <Button onClick={() => setSidebarOpen(false)} variant="ghost" size="icon" className="text-white hover:bg-slate-800">
                  <X className="w-6 h-6" />
                </Button>
              </div>
              <div className="p-4 space-y-2">
                <Button 
                  onClick={() => {
                    navigate('/navios');
                    setSidebarOpen(false);
                  }} 
                  variant="outline" 
                  className="w-full justify-start border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white h-12 px-4"
                >
                  <ArrowLeft className="mr-3 h-4 w-4" /> Voltar para Navios
                </Button>
                <Button 
                  onClick={() => {
                    handleSignOut();
                    setSidebarOpen(false);
                  }} 
                  variant="outline" 
                  className="w-full justify-start border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white h-12 px-4"
                >
                  <LogOut className="mr-3 h-4 w-4" /> Sair
                </Button>
              </div>
            </div>
          )}

          {/* Conteúdo Mobile */}
          <div className="p-4 space-y-6 pb-20">
            {/* Form Mobile Simplificado */}
            <Card className="bg-slate-900/40 border-slate-800">
              <CardContent className="p-4 space-y-4">
                <div>
                  <Label htmlFor="nome_navio_mobile" className="text-slate-400 text-xs">Nome do Navio</Label>
                  <Input 
                    id="nome_navio_mobile"
                    value={formData.nome_navio} 
                    onChange={handleChange}
                    className="bg-slate-950 border-slate-700 text-white h-10"
                  />
                </div>

                <div>
                  <Label className="text-slate-400 text-xs">Carga</Label>
                  <select 
                    value={formData.carga}
                    onChange={(e) => setFormData(prev => ({ ...prev, carga: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 text-white h-10 rounded-md px-3 text-sm"
                  >
                    <option value="">Selecione...</option>
                    {tiposCarga.map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Status</span>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={formData.concluido} 
                      onCheckedChange={handleSwitchChange} 
                    />
                    <span className="text-xs text-slate-400">
                      {formData.concluido ? 'Concluído' : 'Em andamento'}
                    </span>
                  </div>
                </div>

                <Button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12"
                >
                  {isSaving ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Salvando...</>
                  ) : (
                    <><Save className="h-4 w-4 mr-2" /> Salvar Alterações</>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Produção Mobile */}
            <Card className="bg-slate-900/40 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-purple-400" />
                  Produção Diária
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {producaoPorDia.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">Nenhuma produção registrada</p>
                ) : (
                  <div className="space-y-3">
                    {producaoPorDia.slice(0, 5).map((dia) => (
                      <div key={dia.data} className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">
                          {format(new Date(dia.data), 'dd/MM/yyyy')}
                        </span>
                        <span className="text-xs font-bold text-emerald-400">
                          {dia.total_tons.toFixed(2)} T
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditarNavio;