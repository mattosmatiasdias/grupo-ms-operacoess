// src/pages/LinhasPedido.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Edit, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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

const LinhasPedido = () => {
  const { id: contratoId, pedidoId } = useParams<{ id: string; pedidoId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [linhas, setLinhas] = useState<any[]>([]);
  const [pedido, setPedido] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null as string | null });
  
  const [formData, setFormData] = useState({
    linha: '',
    descricao: '',
    unidade: '',
    quantidade: '',
    valorUnitario: ''
  });

  useEffect(() => {
    if (pedidoId && contratoId) {
      carregarDados();
    }
  }, [pedidoId, contratoId]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Carregar pedido
      const { data: pedidoData, error: pedidoError } = await supabase
        .from('bmm_pedidos')
        .select('*, contrato:contrato_id(numero, fornecedor)')
        .eq('id', pedidoId)
        .single();

      if (pedidoError) throw pedidoError;
      setPedido(pedidoData);

      // Carregar linhas do pedido - usando contrato_id como chave estrangeira
      const { data: linhasData, error: linhasError } = await supabase
        .from('bmm_linhas_pedido')
        .select('*')
        .eq('contrato_id', contratoId)
        .order('linha', { ascending: true });

      if (linhasError) throw linhasError;
      
      // Filtrar apenas as linhas que pertencem a este pedido (se houver algum campo de relação)
      // Como a tabela não tem pedido_id, vamos mostrar todas as linhas do contrato por enquanto
      setLinhas(linhasData || []);

    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as linhas do pedido.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (linha: any) => {
    setEditingId(linha.id);
    setFormData({
      linha: linha.linha,
      descricao: linha.descricao,
      unidade: linha.unidade,
      quantidade: linha.quantidade.toString(),
      valorUnitario: linha.valor_unitario.toString()
    });
    setAdding(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.linha || !formData.descricao || !formData.unidade || !formData.quantidade || !formData.valorUnitario) {
        toast({
          title: 'Erro',
          description: 'Preencha todos os campos.',
          variant: 'destructive'
        });
        return;
      }

      const linhaData = {
        contrato_id: contratoId, // Usando contrato_id como no banco
        linha: formData.linha,
        descricao: formData.descricao,
        unidade: formData.unidade,
        quantidade: parseFloat(formData.quantidade) || 0,
        valor_unitario: parseFloat(formData.valorUnitario) || 0
      };

      let result;

      if (editingId) {
        result = await supabase
          .from('bmm_linhas_pedido')
          .update(linhaData)
          .eq('id', editingId)
          .select();
      } else {
        result = await supabase
          .from('bmm_linhas_pedido')
          .insert([linhaData])
          .select();
      }

      const { error } = result;

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: editingId ? 'Linha atualizada com sucesso!' : 'Linha adicionada com sucesso!',
      });

      setFormData({ linha: '', descricao: '', unidade: '', quantidade: '', valorUnitario: '' });
      setAdding(false);
      setEditingId(null);
      await carregarDados();

    } catch (error: any) {
      console.error('Erro ao salvar linha:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a linha.',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;

    try {
      const { error } = await supabase
        .from('bmm_linhas_pedido')
        .delete()
        .eq('id', deleteDialog.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Linha excluída com sucesso!',
      });

      await carregarDados();
    } catch (error: any) {
      console.error('Erro ao excluir linha:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a linha.',
        variant: 'destructive'
      });
    } finally {
      setDeleteDialog({ open: false, id: null });
    }
  };

  const totalPedido = linhas.reduce((sum, linha) => sum + (linha.quantidade * linha.valor_unitario), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Pedido não encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <button 
            onClick={() => navigate(`/contrato/${contratoId}/pedidos`)} 
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar para pedidos
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">
                Linhas do Pedido {pedido.numero_pedido}
              </h1>
              <p className="text-xs text-slate-400">
                {pedido.contrato?.fornecedor} - Contrato {pedido.contrato?.numero}
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingId(null);
                setFormData({ linha: '', descricao: '', unidade: '', quantidade: '', valorUnitario: '' });
                setAdding(true);
              }}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Linha
            </Button>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-slate-900/40 border-slate-800 mb-6">
          <CardHeader>
            <CardTitle className="text-white text-base">Resumo do Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-500">Número</p>
                <p className="text-sm font-bold text-white">{pedido.numero_pedido}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Data</p>
                <p className="text-sm text-white">{new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Status</p>
                <Badge className={`text-xs ${
                  pedido.status === 'ativo' ? 'bg-green-500/10 text-green-400' :
                  pedido.status === 'encerrado' ? 'bg-blue-500/10 text-blue-400' :
                  'bg-red-500/10 text-red-400'
                }`}>
                  {pedido.status}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-slate-500">Total</p>
                <p className="text-sm font-bold text-green-400">{formatCurrency(totalPedido)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulário de nova linha */}
        {adding && (
          <Card className="bg-slate-900/40 border-slate-800 mb-6">
            <CardHeader>
              <CardTitle className="text-white text-base">
                {editingId ? 'Editar Linha' : 'Nova Linha'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                <div>
                  <Input
                    placeholder="Linha *"
                    value={formData.linha}
                    onChange={(e) => setFormData({ ...formData, linha: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="lg:col-span-2">
                  <Input
                    placeholder="Descrição *"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Input
                    placeholder="Unidade *"
                    value={formData.unidade}
                    onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Input
                    placeholder="Quantidade *"
                    type="number"
                    step="0.01"
                    value={formData.quantidade}
                    onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Input
                    placeholder="Valor Unit. *"
                    type="number"
                    step="0.01"
                    value={formData.valorUnitario}
                    onChange={(e) => setFormData({ ...formData, valorUnitario: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setAdding(false);
                    setEditingId(null);
                    setFormData({ linha: '', descricao: '', unidade: '', quantidade: '', valorUnitario: '' });
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? 'Atualizar' : 'Adicionar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabela de linhas */}
        <Card className="bg-slate-900/40 border-slate-800">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-slate-300 font-medium">Linha</th>
                    <th className="px-4 py-3 text-left text-slate-300 font-medium">Descrição</th>
                    <th className="px-4 py-3 text-center text-slate-300 font-medium">Unid.</th>
                    <th className="px-4 py-3 text-right text-slate-300 font-medium">Quantidade</th>
                    <th className="px-4 py-3 text-right text-slate-300 font-medium">Valor Unit.</th>
                    <th className="px-4 py-3 text-right text-slate-300 font-medium">Valor Total</th>
                    <th className="px-4 py-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {linhas.map((linha) => {
                    const total = linha.quantidade * linha.valor_unitario;
                    return (
                      <tr key={linha.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3 font-mono font-medium text-white">{linha.linha}</td>
                        <td className="px-4 py-3 text-slate-300">{linha.descricao}</td>
                        <td className="px-4 py-3 text-center text-slate-400">{linha.unidade}</td>
                        <td className="px-4 py-3 text-right font-mono text-white">{linha.quantidade}</td>
                        <td className="px-4 py-3 text-right font-mono text-white">{formatCurrency(linha.valor_unitario)}</td>
                        <td className="px-4 py-3 text-right font-mono font-medium text-white">{formatCurrency(total)}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleEdit(linha)}
                              className="p-1 text-slate-500 hover:text-blue-400 transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteDialog({ open: true, id: linha.id })}
                              className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {linhas.length === 0 && !adding && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                        Nenhuma linha cadastrada para este contrato
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-slate-800/30">
                  <tr>
                    <td colSpan={5} className="px-4 py-3 text-right text-slate-300 font-medium">
                      Total do Contrato:
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-white">
                      {formatCurrency(totalPedido)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, id: null })}>
        <AlertDialogContent className="bg-slate-900 border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Tem certeza que deseja excluir esta linha? Esta ação não pode ser desfeita.
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

export default LinhasPedido;