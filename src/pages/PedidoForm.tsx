// src/pages/PedidoForm.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const PedidoForm = () => {
  const navigate = useNavigate();
  const { id: contratoId, pedidoId } = useParams<{ id: string; pedidoId: string }>();
  const { userProfile } = useAuth();
  const { toast } = useToast();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [contrato, setContrato] = useState<any>(null);
  const [formData, setFormData] = useState({
    numero_pedido: '',
    descricao: '',
    data_pedido: new Date().toISOString().split('T')[0],
    valor_total: '',
    status: 'ativo',
    observacoes: ''
  });

  useEffect(() => {
    if (contratoId) {
      carregarContrato();
      if (pedidoId && pedidoId !== 'novo') {
        carregarPedido();
      }
    }
  }, [contratoId, pedidoId]);

  const carregarContrato = async () => {
    try {
      console.log('Carregando contrato ID:', contratoId);
      const { data, error } = await supabase
        .from('bmm_contratos')
        .select('*')
        .eq('id', contratoId)
        .single();

      if (error) {
        console.error('Erro ao carregar contrato:', error);
        throw error;
      }
      
      console.log('Contrato carregado:', data);
      setContrato(data);
    } catch (error: any) {
      console.error('Erro ao carregar contrato:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados do contrato.',
        variant: 'destructive'
      });
    }
  };

  const carregarPedido = async () => {
    try {
      setIsLoading(true);
      console.log('Carregando pedido ID:', pedidoId);
      
      const { data, error } = await supabase
        .from('bmm_pedidos')
        .select('*')
        .eq('id', pedidoId)
        .single();

      if (error) {
        console.error('Erro ao carregar pedido:', error);
        throw error;
      }

      console.log('Pedido carregado:', data);

      if (data) {
        setFormData({
          numero_pedido: data.numero_pedido || '',
          descricao: data.descricao || '',
          data_pedido: data.data_pedido || new Date().toISOString().split('T')[0],
          valor_total: data.valor_total?.toString() || '',
          status: data.status || 'ativo',
          observacoes: data.observacoes || ''
        });
      }
    } catch (error: any) {
      console.error('Erro ao carregar pedido:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados do pedido.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Iniciando submit do pedido...');
    console.log('Form data:', formData);
    console.log('Contrato ID:', contratoId);
    console.log('UserProfile:', userProfile);

    if (!formData.numero_pedido) {
      console.log('Erro: Número do pedido não preenchido');
      toast({
        title: 'Erro',
        description: 'Preencha o número do pedido.',
        variant: 'destructive'
      });
      return;
    }

    if (!userProfile?.id) {
      console.log('Erro: Usuário não autenticado');
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado.',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);

    try {
      const pedidoData = {
        contrato_id: contratoId,
        numero_pedido: formData.numero_pedido,
        descricao: formData.descricao || null,
        data_pedido: formData.data_pedido,
        valor_total: formData.valor_total ? parseFloat(formData.valor_total) : 0,
        status: formData.status,
        observacoes: formData.observacoes || null,
        user_id: userProfile.id
      };

      console.log('Dados para salvar:', pedidoData);

      let result;

      if (pedidoId && pedidoId !== 'novo') {
        console.log('Atualizando pedido existente:', pedidoId);
        result = await supabase
          .from('bmm_pedidos')
          .update(pedidoData)
          .eq('id', pedidoId)
          .select();
      } else {
        console.log('Criando novo pedido');
        result = await supabase
          .from('bmm_pedidos')
          .insert([pedidoData])
          .select();
      }

      console.log('Resultado da operação:', result);

      const { data, error } = result;

      if (error) {
        console.error('Erro do Supabase:', error);
        console.error('Código do erro:', error.code);
        console.error('Mensagem:', error.message);
        console.error('Detalhes:', error.details);
        throw error;
      }

      console.log('Dados salvos com sucesso:', data);

      toast({
        title: 'Sucesso!',
        description: pedidoId && pedidoId !== 'novo' ? 'Pedido atualizado com sucesso.' : 'Pedido criado com sucesso.'
      });

      navigate(`/contrato/${contratoId}/pedidos`);

    } catch (error: any) {
      console.error('Erro detalhado ao salvar pedido:', error);
      
      let mensagem = 'Não foi possível salvar o pedido.';
      
      if (error.code === '23505') {
        mensagem = 'Já existe um pedido com este número para este contrato.';
      } else if (error.code === '23503') {
        mensagem = 'Contrato não encontrado.';
      } else if (error.code === '42P01') {
        mensagem = 'Tabela de pedidos não existe.';
      } else if (error.message) {
        mensagem = error.message;
      }

      toast({
        title: 'Erro',
        description: mensagem,
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Package className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {pedidoId && pedidoId !== 'novo' ? 'Editar Pedido' : 'Novo Pedido'}
                </h1>
                <p className="text-xs text-slate-400">
                  {contrato?.fornecedor} - {contrato?.numero}
                </p>
              </div>
            </div>
            <Button 
              type="submit"
              form="form-pedido"
              disabled={isSaving}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar Pedido'}
            </Button>
          </div>
        </div>
      </header>

      {/* Formulário */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <form id="form-pedido" onSubmit={handleSubmit} className="space-y-6">
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-base">Informações do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numero_pedido" className="text-slate-300">
                    Número do Pedido <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="numero_pedido"
                    value={formData.numero_pedido}
                    onChange={handleChange}
                    className="bg-slate-800 border-slate-700 text-white"
                    placeholder="Ex: PO-2024-001"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_pedido" className="text-slate-300">Data do Pedido</Label>
                  <Input
                    id="data_pedido"
                    type="date"
                    value={formData.data_pedido}
                    onChange={handleChange}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao" className="text-slate-300">Descrição do Pedido</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
                  placeholder="Descreva o objeto do pedido"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valor_total" className="text-slate-300">Valor Total (R$)</Label>
                  <Input
                    id="valor_total"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valor_total}
                    onChange={handleChange}
                    className="bg-slate-800 border-slate-700 text-white"
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-slate-300">Status</Label>
                  <Select 
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="encerrado">Encerrado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes" className="text-slate-300">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={handleChange}
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="Observações adicionais..."
                />
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default PedidoForm;