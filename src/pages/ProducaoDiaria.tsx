// src/pages/ProducaoDiaria.tsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, X, LogOut, ArrowLeft, Ship, BarChart3, 
  Anchor, Save, Loader2, Trash2, Calendar, Plus // 👈 PLUS ADICIONADO AQUI
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RegistroProducao {
  id?: string;
  data: string;
  tons_total: number;
}

const ProducaoDiaria = () => {
  const { id: navioId } = useParams();
  const { userProfile, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Verificação de Segurança - MOVIDA PARA DENTRO DO COMPONENTE
  const [navioError, setNavioError] = useState(false);
  
  useEffect(() => {
    if (!navioId) {
      setNavioError(true);
    }
  }, [navioId]);

  if (navioError || !navioId) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <div className="fixed inset-0 -z-10 bg-slate-950"></div> {/* Fundo fixo */}
        <h1 className="text-xl font-bold text-red-400 mb-2">Erro de Navegação</h1>
        <p className="text-slate-400">Navio não encontrado. Verifique o link ou tente voltar para a lista.</p>
        <Button onClick={() => navigate('/navios')} className="mt-4 bg-blue-600 hover:bg-blue-700">
          Voltar para Navios
        </Button>
      </div>
    );
  }

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [navio, setNavio] = useState<{ nome_navio: string } | null>(null);
  const [registros, setRegistros] = useState<RegistroProducao[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dataGlobal, setDataGlobal] = useState(new Date().toISOString().split('T')[0]);

  const fetchTodosRegistros = useCallback(async () => {
    setLoading(true);
    try {
      const { data: navioData, error: navioError } = await supabase
        .from('navios')
        .select('nome_navio')
        .eq('id', navioId)
        .single();
      
      if (navioError) throw navioError;
      setNavio(navioData);
      
      const { data: registrosData, error } = await supabase
        .from('registros_producao')
        .select('*')
        .eq('navio_id', navioId)
        .order('data', { ascending: true });
      
      if (error) throw error;
      
      if (registrosData && registrosData.length > 0) {
        setRegistros(registrosData);
        setDataGlobal(registrosData[0].data || new Date().toISOString().split('T')[0]);
      } else {
        const dataAtual = new Date().toISOString().split('T')[0];
        setDataGlobal(dataAtual);
        setRegistros([{ 
          id: `new-${Date.now()}`, 
          data: dataAtual, 
          tons_total: 0
        }]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({ 
        title: "Erro", 
        description: "Não foi possível carregar os dados.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  }, [navioId, toast]);

  useEffect(() => {
    fetchTodosRegistros();
  }, [fetchTodosRegistros]);

  const handleRegistroChange = (id: string, field: keyof RegistroProducao, value: string) => {
    if (field === 'data') {
      setRegistros(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    } else {
      const numValue = value === '' ? 0 : Number(value);
      setRegistros(prev => prev.map(r => r.id === id ? { ...r, [field]: numValue } : r));
    }
  };

  const addLinha = () => {
    const ultimaData = registros.length > 0 ? registros[registros.length - 1].data : dataGlobal;
    const novaData = new Date(new Date(ultimaData).getTime() + 86400000).toISOString().split('T')[0];
    
    setRegistros(prev => [...prev, { 
      id: `new-${Date.now()}-${Math.random()}`, // 👈 ID mais único
      data: novaData,
      tons_total: 0
    }]);
  };

  const removeLinha = (id: string) => {
    if (registros.length > 1) {
      setRegistros(prev => prev.filter(r => r.id !== id));
    } else {
      toast({ 
        title: "Aviso", 
        description: "É necessário manter pelo menos um registro.", 
        variant: "default" 
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !navioId) return;
    setIsSaving(true);
    
    try {
      const registrosExistentes = registros.filter(r => r.id && !r.id.startsWith('new-'));
      const registrosNovos = registros.filter(r => !r.id || r.id.startsWith('new-'));

      if (registrosExistentes.length > 0) {
        const updates = registrosExistentes.map(registro => ({
          id: registro.id,
          data: registro.data,
          tons_total: registro.tons_total || 0,
          navio_id: navioId,
          user_id: userProfile.id,
        }));

        const { error: updateError } = await supabase
          .from('registros_producao')
          .upsert(updates);

        if (updateError) throw updateError;
      }

      if (registrosNovos.length > 0) {
        const inserts = registrosNovos.map(registro => ({
          data: registro.data,
          tons_total: registro.tons_total || 0,
          navio_id: navioId,
          user_id: userProfile.id,
        }));

        const { error: insertError } = await supabase
          .from('registros_producao')
          .insert(inserts);

        if (insertError) throw insertError;
      }

      toast({ 
        title: "Sucesso!", 
        description: "Dados de produção salvos com sucesso." 
      });
      
      await fetchTodosRegistros();
      
    } catch (error: any) {
      console.error('Erro completo ao salvar:', error);
      toast({ 
        title: "Erro ao salvar", 
        description: error.message || "Não foi possível salvar os dados.", 
        variant: "destructive" 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAplicarDataGlobal = () => {
    setRegistros(prev => prev.map(r => ({ ...r, data: dataGlobal })));
    try {
      const dataFormatada = format(new Date(dataGlobal), 'dd/MM/yyyy', { locale: ptBR });
      toast({
        title: "Datas Atualizadas",
        description: `Todos os registros definidos para ${dataFormatada}`
      });
    } catch (e) {
      // Ignora erro de formatação
    }
  };

  const totalGeralTons = registros.reduce((acc, r) => acc + (r.tons_total || 0), 0);

  const menuItems = [
    { icon: Ship, label: 'Lista de Navios', path: '/navios', color: 'text-blue-400', bgHover: 'hover:bg-blue-500/10' },
  ];

  const handleSignOut = async () => { await signOut(); };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 relative">
      {/* FORÇA FUNDO ESCURO - FIX DEFINITIVO PARA FUNDO BRANCO */}
      <div className="fixed inset-0 -z-10 bg-slate-950"></div>

      {/* Layout Desktop */}
      <div className="hidden lg:flex min-h-screen">
        {/* Sidebar Desktop */}
        <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0">
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight leading-none">Produção Diária</h1>
                <p className="text-xs text-slate-500 mt-1">Simplificado</p>
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
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-blue-500/20">
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
          {/* Sticky Header */}
          <div className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50 px-8 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Registro de Produção</h2>
              <p className="text-xs text-slate-400">Navio: {navio?.nome_navio || 'Carregando...'}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Total Geral Tons</p>
                <p className="text-3xl font-bold text-emerald-400">{totalGeralTons.toFixed(3)}</p>
              </div>
            </div>
          </div>

          <main className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSave}>
              <Card className="bg-slate-900/40 border-slate-800 shadow-sm">
                <CardHeader className="bg-slate-800/30 border-b border-slate-800/50 px-6 pb-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Anchor className="h-5 w-5 text-blue-400" />
                      <CardTitle className="text-slate-100 text-base font-medium">Apontamento Diário</CardTitle>
                      <Badge variant="outline" className="bg-slate-950 border-slate-700 text-slate-400 text-xs px-2 py-0.5">
                        {registros.length} registro(s)
                      </Badge>
                    </div>

                    {/* Controles Globais */}
                    <div className="flex items-center gap-3 bg-slate-950/50 border border-slate-800 px-4 py-2 rounded-lg">
                       <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <Label className="text-xs font-semibold text-slate-300 uppercase">Data Global:</Label>
                       </div>
                       <Input 
                         type="date" 
                         value={dataGlobal} 
                         onChange={(e) => setDataGlobal(e.target.value)}
                         className="h-8 w-[160px] bg-slate-900 border-slate-700 text-white text-xs"
                       />
                       <Button 
                         type="button"
                         onClick={handleAplicarDataGlobal}
                         variant="secondary"
                         className="h-8 px-3 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white text-xs"
                       >
                         Preencher
                       </Button>
                    </div>
                  </div>
                </CardHeader>
                  
                <CardContent className="p-6">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
                      <p className="text-sm">Carregando registros...</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      
                      {/* Lista de Registros Simplificada */}
                      <div className="space-y-3">
                        {registros.map((registro) => (
                          <div key={registro.id} className="grid grid-cols-12 gap-4 items-center p-4 bg-slate-900/50 rounded-lg border border-slate-800/50 hover:border-blue-900/30 transition-colors group">
                            
                              {/* Data */}
                              <div className="col-span-5 md:col-span-4">
                                <Label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Data</Label>
                                <Input 
                                  type="date" 
                                  value={registro.data} 
                                  onChange={(e) => handleRegistroChange(registro.id!, 'data', e.target.value)}
                                  className="bg-slate-950 border-slate-700 text-white h-10 text-sm focus-visible:ring-blue-500"
                                />
                              </div>

                              {/* Toneladas Total */}
                              <div className="col-span-5 md:col-span-6">
                                <Label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Total Toneladas</Label>
                                <div className="relative">
                                  <Input 
                                    type="number" 
                                    step="0.001" 
                                    value={registro.tons_total === 0 ? '' : registro.tons_total} 
                                    onChange={(e) => handleRegistroChange(registro.id!, 'tons_total', e.target.value)}
                                    className="bg-slate-950 border-slate-700 text-white h-10 text-sm font-mono pl-3 focus-visible:ring-blue-500"
                                    placeholder="0.000"
                                  />
                                  <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-semibold">T</span>
                                </div>
                              </div>

                              {/* Ações */}
                              <div className="col-span-2 md:col-span-2 flex justify-end">
                                {registros.length > 1 && (
                                  <Button 
                                    type="button"
                                    onClick={() => removeLinha(registro.id!)}
                                    variant="ghost" 
                                    className="h-10 w-10 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-md"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>

                      {/* Botões de Ação */}
                      <div className="flex justify-between items-center pt-4 border-t border-slate-800 mt-6">
                         <Button 
                           type="button" 
                           onClick={addLinha}
                           variant="outline"
                           className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white h-10 px-4"
                         >
                           <Plus className="h-4 w-4 mr-2" />
                           Adicionar Registro
                         </Button>
                         
                         <Button 
                           type="submit" 
                           className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-10 shadow-lg shadow-blue-900/20"
                           disabled={isSaving}
                         >
                           {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Salvando...</> : <><Save className="h-4 w-4 mr-2" /> Salvar Tudo</>}
                         </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </form>
          </main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col min-h-screen bg-slate-950">
        {/* Header Mobile */}
        <div className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-30 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <Button onClick={() => setSidebarOpen(true)} variant="ghost" size="icon" className="text-white hover:bg-slate-800">
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
               <Anchor className="text-blue-400 w-5 h-5" />
               <div>
                  <h1 className="text-lg font-bold text-white leading-tight">Produção</h1>
                  <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{navio?.nome_navio}</p>
               </div>
            </div>
          </div>
          <Button onClick={() => navigate('/navios')} variant="ghost" size="icon" className="text-slate-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
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
              <Button onClick={() => navigate('/navios')} variant="outline" className="w-full justify-start border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white h-12 px-4">
                <ArrowLeft className="mr-3 h-4 w-4" /> Voltar para Navios
              </Button>
            </div>
          </div>
        )}

        <div className="p-4 space-y-6 pb-20">
           {/* Header Stats Mobile */}
           <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex justify-between items-center">
              <div>
                   <p className="text-sm font-bold text-white">Total Geral</p>
                   <p className="text-2xl font-bold text-emerald-400">{totalGeralTons.toFixed(3)}</p>
                   <p className="text-[10px] text-slate-400">Toneladas</p>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-full">
                 <Anchor className="h-6 w-6 text-blue-400" />
              </div>
           </div>

           {/* Data Global Mobile */}
           <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                 <Label className="text-xs font-semibold text-slate-300 uppercase flex items-center gap-2"><Calendar className="h-3.5 w-3.5"/> Data Global</Label>
              </div>
              <div className="flex gap-2">
                  <Input 
                      type="date" 
                      value={dataGlobal} 
                      onChange={(e) => setDataGlobal(e.target.value)}
                      className="flex-1 bg-slate-950 border-slate-700 text-white h-8 text-xs"
                  />
                  <Button onClick={handleAplicarDataGlobal} variant="ghost" size="sm" className="h-8 text-[10px] text-blue-400 hover:bg-blue-500/10 px-2">Aplicar</Button>
              </div>
           </div>

           {/* Lista Mobile */}
           <div className="space-y-4">
              {registros.map((registro) => (
                  <Card key={registro.id} className="bg-slate-900 border border-slate-800 p-4">
                    <div className="flex flex-col gap-3 relative">
                       {/* Date Row */}
                       <div>
                          <Label className="text-[10px] text-slate-500 uppercase font-bold mb-1">Data</Label>
                          <Input 
                            type="date" 
                            value={registro.data} 
                            onChange={(e) => handleRegistroChange(registro.id!, 'data', e.target.value)}
                            className="bg-slate-950 border-slate-700 text-white h-9 text-xs"
                          />
                       </div>

                       {/* Tons Row */}
                       <div>
                          <Label className="text-[10px] text-slate-500 uppercase font-bold mb-1">Total Toneladas</Label>
                          <div className="flex gap-2">
                             <Input 
                                type="number" 
                                step="0.001" 
                                value={registro.tons_total === 0 ? '' : registro.tons_total} 
                                onChange={(e) => handleRegistroChange(registro.id!, 'tons_total', e.target.value)}
                                className="flex-1 bg-slate-950 border-slate-700 text-white h-9 text-sm font-mono"
                                placeholder="0.000"
                             />
                             {registros.length > 1 && (
                               <Button onClick={() => removeLinha(registro.id!)} variant="ghost" size="icon" className="h-7 w-7 text-slate-600 hover:text-red-400 hover:bg-red-500/10">
                                 <Trash2 className="h-3 w-3" />
                               </Button>
                             )}
                          </div>
                       </div>
                    </div>
                  </Card>
              ))}
           </div>

           {/* Mobile Footer Buttons */}
           <div className="fixed bottom-6 left-0 right-0 px-4 z-40">
              <div className="flex gap-2">
                 <Button onClick={addLinha} variant="outline" className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800 bg-slate-900/80 backdrop-blur-sm h-12">
                    <Plus className="h-4 w-4 mr-2" /> Nova Linha
                 </Button>
                 <Button onClick={handleSave} disabled={isSaving} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12 shadow-lg shadow-blue-900/20">
                    {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Salvar
                 </Button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProducaoDiaria;