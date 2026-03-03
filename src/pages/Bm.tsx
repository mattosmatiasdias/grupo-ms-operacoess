// src/pages/Bm.tsx
import { useNavigate } from 'react-router-dom';
import { FileText, Building2, Calendar, TrendingUp, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Funções auxiliares
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR');
};

const daysRemaining = (endDate: string) => {
  const end = new Date(endDate).getTime();
  const now = new Date().getTime();
  const diff = end - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const Bm = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null as string | null });
  const [stats, setStats] = useState({
    totalBMs: 0,
    valorTotal: 0
  });

  useEffect(() => {
    carregarContratos();
  }, []);

  const carregarContratos = async () => {
    try {
      setLoading(true);
      
      // Buscar contratos
      const { data: contratos, error } = await supabase
        .from('bmm_contratos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setContracts(contratos || []);

      // Calcular estatísticas (BMs será implementado depois)
      const valorTotal = (contratos || []).reduce((sum, c) => sum + (c.valor_total || 0), 0);
      
      // Buscar total de BMs (quando a tabela existir)
      // Por enquanto deixamos 0
      setStats({
        totalBMs: 0,
        valorTotal: valorTotal
      });

    } catch (error: any) {
      console.error('Erro ao carregar contratos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os contratos.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;

    try {
      const { error } = await supabase
        .from('bmm_contratos')
        .delete()
        .eq('id', deleteDialog.id);

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: 'Contrato excluído com sucesso.',
      });

      await carregarContratos();
    } catch (error: any) {
      console.error('Erro ao excluir contrato:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o contrato.',
        variant: 'destructive'
      });
    } finally {
      setDeleteDialog({ open: false, id: null });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Carregando contratos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Gestão de Contratos</h1>
              <p className="text-xs text-slate-400">Controle de Contratos, Pedidos e Boletins de Medição</p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/contrato/novo')}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Contrato
          </Button>
        </div>
      </header>

      {/* Stats */}
      <div className="container mx-auto px-4 -mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Contratos Ativos', value: contracts.length, icon: FileText },
            { label: 'Total BMs Emitidos', value: stats.totalBMs, icon: TrendingUp },
            { label: 'Valor Total Contratado', value: formatCurrency(stats.valorTotal), icon: Building2 },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900/40 rounded-lg border border-slate-800 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <stat.icon className="w-8 h-8 text-slate-600" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contract Cards */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-lg font-semibold text-white mb-4">Contratos</h2>
        {contracts.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/40 rounded-lg border border-slate-800">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Nenhum contrato cadastrado</p>
            <Button 
              onClick={() => navigate('/contrato/novo')}
              variant="outline" 
              className="mt-4 border-slate-700 text-slate-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Primeiro Contrato
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contracts.map((contract) => {
              const days = daysRemaining(contract.data_fim);
              
              return (
                <div
                  key={contract.id}
                  className="bg-slate-900/40 rounded-lg border border-slate-800 p-5 hover:border-blue-500/50 hover:bg-slate-900/60 transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
                      {contract.tipo_label}
                    </Badge>
                    <Badge 
                      className={`text-xs ${
                        days > 60 ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        days > 0 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}
                    >
                      {days > 0 ? `${days} dias` : 'Vencido'}
                    </Badge>
                  </div>

                  <div 
                    onClick={() => navigate(`/contrato/${contract.id}`)}
                    className="cursor-pointer"
                  >
                    <h3 className="font-semibold text-white text-sm mb-1 line-clamp-1">{contract.fornecedor}</h3>
                    <p className="text-xs text-slate-500 font-mono mb-3">Nº {contract.numero}</p>

                    <p className="text-xs text-slate-400 line-clamp-2 mb-4">{contract.objeto}</p>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-slate-500">Valor</p>
                        <p className="font-semibold text-white">{formatCurrency(contract.valor_total)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Status</p>
                        <p className="font-semibold text-white capitalize">{contract.status}</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(contract.data_inicio)} — {formatDate(contract.data_fim)}</span>
                    </div>
                  </div>

                  {/* Ações do card */}
                  <div className="mt-3 pt-3 border-t border-slate-800 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`/contrato/editar/${contract.id}`)}
                      className="h-8 px-2 text-slate-400 hover:text-white"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteDialog({ open: true, id: contract.id })}
                      className="h-8 px-2 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, id: null })}>
        <AlertDialogContent className="bg-slate-900 border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Tem certeza que deseja excluir este contrato? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Bm;