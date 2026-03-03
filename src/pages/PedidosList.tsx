// src/pages/PedidosList.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Package, Eye, Trash2, Edit, ListOrdered } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
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

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR');
};

const PedidosList = () => {
  const { id: contratoId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [contrato, setContrato] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null as string | null });

  useEffect(() => {
    if (contratoId) {
      carregarDados();
    }
  }, [contratoId]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Carregar contrato
      const { data: contratoData, error: contratoError } = await supabase
        .from('bmm_contratos')
        .select('*')
        .eq('id', contratoId)
        .single();

      if (contratoError) throw contratoError;
      setContrato(contratoData);

      // Carregar pedidos do contrato
      const { data: pedidosData, error: pedidosError } = await supabase
        .from('bmm_pedidos')
        .select('*')
        .eq('contrato_id', contratoId)
        .order('created_at', { ascending: false });

      if (pedidosError) throw pedidosError;
      setPedidos(pedidosData || []);

    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os pedidos.',
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
        .from('bmm_pedidos')
        .delete()
        .eq('id', deleteDialog.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Pedido excluído com sucesso!',
      });

      await carregarDados();
    } catch (error: any) {
      console.error('Erro ao excluir pedido:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o pedido.',
        variant: 'destructive'
      });
    } finally {
      setDeleteDialog({ open: false, id: null });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (!contrato) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Contrato não encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <button 
            onClick={() => navigate(`/contrato/${contratoId}`)} 
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar para detalhes do contrato
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Package className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Pedidos do Contrato</h1>
                <p className="text-xs text-slate-400">
                  {contrato.fornecedor} - {contrato.numero}
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate(`/contrato/${contratoId}/pedido/novo`)}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Pedido
            </Button>
          </div>
        </div>
      </header>

      {/* Lista de Pedidos */}
      <div className="container mx-auto px-4 py-8">
        {pedidos.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/40 rounded-lg border border-slate-800">
            <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 mb-4">Nenhum pedido cadastrado para este contrato</p>
            <Button 
              onClick={() => navigate(`/contrato/${contratoId}/pedido/novo`)}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Primeiro Pedido
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pedidos.map((pedido) => (
              <div
                key={pedido.id}
                className="bg-slate-900/40 rounded-lg border border-slate-800 p-5 hover:border-green-500/50 hover:bg-slate-900/60 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Package className="w-6 h-6 text-green-400" />
                    <div>
                      <h3 className="font-semibold text-white text-lg">
                        Pedido {pedido.numero_pedido}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {pedido.descricao || 'Sem descrição'}
                      </p>
                    </div>
                  </div>
                  <Badge className={`text-xs ${
                    pedido.status === 'ativo' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                    pedido.status === 'encerrado' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {pedido.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500">Data do Pedido</p>
                    <p className="text-sm text-white">{formatDate(pedido.data_pedido)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Valor Total</p>
                    <p className="text-sm font-bold text-white">{formatCurrency(pedido.valor_total || 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Observações</p>
                    <p className="text-sm text-slate-300 truncate">{pedido.observacoes || '-'}</p>
                  </div>
                </div>

                {/* BOTÕES DE AÇÃO - AGORA COM O BOTÃO + PARA LINHAS */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  {/* BOTÃO PRINCIPAL: Adicionar Linhas (+) */}
                  <Button
                    size="sm"
                    onClick={() => navigate(`/contrato/${contratoId}/pedido/${pedido.id}/linhas`)}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar Linhas
                  </Button>

                  {/* Botão para ver linhas (opcional) */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`/contrato/${contratoId}/pedido/${pedido.id}/linhas`)}
                    className="text-slate-400 hover:text-white"
                  >
                    <ListOrdered className="w-4 h-4 mr-1" />
                    Ver Linhas
                  </Button>

                  {/* Botão de editar */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`/contrato/${contratoId}/pedido/editar/${pedido.id}`)}
                    className="text-slate-400 hover:text-white"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>

                  {/* Botão de excluir */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteDialog({ open: true, id: pedido.id })}
                    className="text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, id: null })}>
        <AlertDialogContent className="bg-slate-900 border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Tem certeza que deseja excluir este pedido? Todas as linhas vinculadas também serão excluídas.
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

export default PedidosList;