// src/pages/ContratoForm.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const tipos = [
  { value: 'locacao', label: 'LOCAÇÃO' },
  { value: 'prestacao_servico', label: 'PRESTAÇÃO DE SERVIÇO' }
];

const ContratoForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { userProfile } = useAuth();
  const { toast } = useToast();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    numero: '',
    numero_pedido: '',
    fornecedor: '',
    objeto: '',
    tipo: 'prestacao_servico',
    tipo_label: 'PRESTAÇÃO DE SERVIÇO',
    valor_total: '',
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: '',
    observacoes: '',
    status: 'ativo'
  });

  useEffect(() => {
    if (id) {
      carregarContrato();
    }
  }, [id]);

  const carregarContrato = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('bmm_contratos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          numero: data.numero || '',
          numero_pedido: data.numero_pedido || '',
          fornecedor: data.fornecedor || '',
          objeto: data.objeto || '',
          tipo: data.tipo || 'prestacao_servico',
          tipo_label: data.tipo_label || 'PRESTAÇÃO DE SERVIÇO',
          valor_total: data.valor_total?.toString() || '',
          data_inicio: data.data_inicio || new Date().toISOString().split('T')[0],
          data_fim: data.data_fim || '',
          observacoes: data.observacoes || '',
          status: data.status || 'ativo'
        });
      }
    } catch (error) {
      console.error('Erro ao carregar contrato:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados do contrato',
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
    
    if (!formData.numero || !formData.fornecedor || !formData.data_fim || !userProfile?.id) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);

    try {
      const contratoData = {
        numero: formData.numero,
        numero_pedido: formData.numero_pedido || null,
        fornecedor: formData.fornecedor,
        objeto: formData.objeto || null,
        tipo: formData.tipo,
        tipo_label: formData.tipo_label,
        valor_total: formData.valor_total ? parseFloat(formData.valor_total) : 0,
        data_inicio: formData.data_inicio,
        data_fim: formData.data_fim,
        observacoes: formData.observacoes || null,
        status: formData.status,
        user_id: userProfile.id
      };

      let result;

      if (id) {
        result = await supabase
          .from('bmm_contratos')
          .update(contratoData)
          .eq('id', id)
          .select();
      } else {
        result = await supabase
          .from('bmm_contratos')
          .insert([contratoData])
          .select();
      }

      const { error } = result;

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: id ? 'Contrato atualizado com sucesso.' : 'Contrato criado com sucesso.'
      });

      navigate('/bm');

    } catch (error: any) {
      console.error('Erro ao salvar contrato:', error);
      
      let mensagem = 'Não foi possível salvar o contrato.';
      if (error.code === '23505') {
        mensagem = 'Já existe um contrato com este número.';
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
            onClick={() => navigate('/bm')} 
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar para contratos
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {id ? 'Editar Contrato' : 'Novo Contrato'}
                </h1>
                <p className="text-xs text-slate-400">
                  {id ? 'Altere as informações do contrato' : 'Preencha as informações do novo contrato'}
                </p>
              </div>
            </div>
            <Button 
              type="submit"
              form="form-contrato"
              disabled={isSaving}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar Contrato'}
            </Button>
          </div>
        </div>
      </header>

      {/* Formulário */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <form id="form-contrato" onSubmit={handleSubmit} className="space-y-6">
          {/* Dados principais */}
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-base">Informações Principais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numero" className="text-slate-300">
                    Número do Contrato <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="numero"
                    value={formData.numero}
                    onChange={handleChange}
                    className="bg-slate-800 border-slate-700 text-white"
                    placeholder="Ex: 001/2024"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numero_pedido" className="text-slate-300">Número do Pedido</Label>
                  <Input
                    id="numero_pedido"
                    value={formData.numero_pedido}
                    onChange={handleChange}
                    className="bg-slate-800 border-slate-700 text-white"
                    placeholder="Ex: PO-2024-001"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fornecedor" className="text-slate-300">
                  Fornecedor <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="fornecedor"
                  value={formData.fornecedor}
                  onChange={handleChange}
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="Nome da empresa fornecedora"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="objeto" className="text-slate-300">Objeto do Contrato</Label>
                <Textarea
                  id="objeto"
                  value={formData.objeto}
                  onChange={handleChange}
                  className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
                  placeholder="Descreva o objeto do contrato"
                />
              </div>
            </CardContent>
          </Card>

          {/* Valores e Prazos */}
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-base">Valores e Prazos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo" className="text-slate-300">
                    Tipo do Contrato <span className="text-red-400">*</span>
                  </Label>
                  <Select 
                    value={formData.tipo}
                    onValueChange={(value) => {
                      const tipo = tipos.find(t => t.value === value);
                      setFormData({ 
                        ...formData, 
                        tipo: value,
                        tipo_label: tipo?.label || value
                      });
                    }}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      {tipos.map(tipo => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor_total" className="text-slate-300">
                    Valor Total (R$) <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="valor_total"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valor_total}
                    onChange={handleChange}
                    className="bg-slate-800 border-slate-700 text-white"
                    placeholder="0,00"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data_inicio" className="text-slate-300">
                    Data Início <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="data_inicio"
                    type="date"
                    value={formData.data_inicio}
                    onChange={handleChange}
                    className="bg-slate-800 border-slate-700 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_fim" className="text-slate-300">
                    Data Fim <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="data_fim"
                    type="date"
                    value={formData.data_fim}
                    onChange={handleChange}
                    className="bg-slate-800 border-slate-700 text-white"
                    required
                  />
                </div>
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
                    <SelectItem value="suspenso">Suspenso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-base">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="observacoes" className="text-slate-300">Observações adicionais</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={handleChange}
                  className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
                  placeholder="Informações complementares sobre o contrato..."
                />
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default ContratoForm;