// src/pages/escalas/Salarios.tsx
import { useState, useEffect } from 'react';
import { DollarSign, Edit, Save, X, Plus, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { EscalasLayout } from '@/components/escalas/EscalasLayout';
import { supabase } from '@/integrations/supabase/client';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const funcoesPadrao = [
  'TRUCK',
  'OPERADOR', 
  'CARRETEIRO',
  'PIPA',
  'MINIPÁ',
  'MUNCK',
  'COMBOIO',
  'AJUDANTE',
  'SINALEIRO',
  'ENCARREGADO'
];

export default function Salarios() {
  const [salarios, setSalarios] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSalario, setNewSalario] = useState({
    funcao: 'AJUDANTE',
    salario_base: 0,
    he100_valor: 0,
    he50_valor: 0,
    data_vigencia: new Date().toISOString().split('T')[0],
    ativo: true
  });

  useEffect(() => {
    carregarSalarios();
  }, []);

  const carregarSalarios = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('escalas_config_salarios')
        .select('*')
        .order('funcao');

      if (error) throw error;
      setSalarios(data || []);
    } catch (error) {
      console.error('Erro ao carregar salários:', error);
      toast.error('Erro ao carregar configurações de salário');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (salario: any) => {
    setEditingId(salario.id);
    setEditForm({
      funcao: salario.funcao,
      salario_base: salario.salario_base,
      he100_valor: salario.he100_valor,
      he50_valor: salario.he50_valor,
      data_vigencia: salario.data_vigencia || new Date().toISOString().split('T')[0],
      ativo: salario.ativo !== false
    });
  };

  const handleSave = async (id: string) => {
    try {
      // Validar valores
      if (editForm.salario_base <= 0) {
        toast.error('Salário base deve ser maior que zero');
        return;
      }

      const { error } = await supabase
        .from('escalas_config_salarios')
        .update(editForm)
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Salário atualizado com sucesso');
      setEditingId(null);
      await carregarSalarios();
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast.error(`Erro: ${error.message}`);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleAddNew = async () => {
    try {
      // Validar se já existe configuração para esta função
      const existing = salarios.find(s => s.funcao === newSalario.funcao && s.ativo);
      if (existing) {
        toast.error(`Já existe uma configuração ativa para a função ${newSalario.funcao}`);
        return;
      }

      // Validar valores
      if (newSalario.salario_base <= 0) {
        toast.error('Salário base deve ser maior que zero');
        return;
      }

      const { error } = await supabase
        .from('escalas_config_salarios')
        .insert([newSalario]);

      if (error) throw error;
      
      toast.success('Configuração de salário adicionada com sucesso');
      setIsDialogOpen(false);
      setNewSalario({
        funcao: 'AJUDANTE',
        salario_base: 0,
        he100_valor: 0,
        he50_valor: 0,
        data_vigencia: new Date().toISOString().split('T')[0],
        ativo: true
      });
      await carregarSalarios();
    } catch (error: any) {
      console.error('Erro ao adicionar:', error);
      toast.error(`Erro: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta configuração de salário?')) return;

    try {
      const { error } = await supabase
        .from('escalas_config_salarios')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Configuração excluída com sucesso');
      await carregarSalarios();
    } catch (error: any) {
      console.error('Erro ao excluir:', error);
      toast.error('Erro ao excluir configuração');
    }
  };

  const handleToggleStatus = async (salario: any) => {
    try {
      const novoStatus = !salario.ativo;
      const { error } = await supabase
        .from('escalas_config_salarios')
        .update({ ativo: novoStatus })
        .eq('id', salario.id);

      if (error) throw error;
      
      toast.success(`Configuração ${novoStatus ? 'ativada' : 'desativada'} com sucesso`);
      await carregarSalarios();
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status');
    }
  };

  const handleCopyPrevious = () => {
    // Copia valores da última configuração ativa da mesma função, se existir
    const ultimoSalario = salarios.find(s => s.funcao === newSalario.funcao && s.ativo);
    if (ultimoSalario) {
      setNewSalario(prev => ({
        ...prev,
        salario_base: ultimoSalario.salario_base,
        he100_valor: ultimoSalario.he100_valor,
        he50_valor: ultimoSalario.he50_valor
      }));
      toast.success('Valores copiados da configuração anterior');
    } else {
      toast.info('Não há configuração anterior para esta função');
    }
  };

  const filteredSalarios = salarios.filter(salario => {
    const matchesSearch = salario.funcao?.toLowerCase().includes(search.toLowerCase()) || false;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && salario.ativo) || 
      (filterStatus === 'inactive' && !salario.ativo);
    return matchesSearch && matchesStatus;
  });

  const funcoesDisponiveis = funcoesPadrao.filter(f => 
    !salarios.some(s => s.funcao === f && s.ativo)
  );

  return (
    <EscalasLayout 
      title="Configuração de Salários"
      subtitle="Gerenciar valores salariais por função"
    >
      <div className="max-w-7xl mx-auto">
        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 gap-2"
                disabled={funcoesDisponiveis.length === 0}
              >
                <Plus className="h-4 w-4" />
                Nova Configuração
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-gray-800 border-blue-200/30">
              <DialogHeader>
                <DialogTitle className="text-white">Nova Configuração de Salário</DialogTitle>
                <DialogDescription className="text-blue-300">
                  Adicione uma nova configuração salarial para uma função específica
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label className="text-white">Função *</Label>
                  <Select 
                    value={newSalario.funcao} 
                    onValueChange={(value) => setNewSalario(prev => ({ ...prev, funcao: value }))}
                  >
                    <SelectTrigger className="bg-white/5 border-blue-200/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-blue-200/30">
                      {funcoesPadrao.map(f => (
                        <SelectItem 
                          key={f} 
                          value={f} 
                          className="text-white hover:bg-blue-500/20"
                          disabled={salarios.some(s => s.funcao === f && s.ativo)}
                        >
                          {f}
                          {salarios.some(s => s.funcao === f && s.ativo) && ' (Já configurado)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-white">Valores Salariais *</Label>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleCopyPrevious}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                    >
                      Copiar da configuração anterior
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-sm text-blue-300">Salário Base</Label>
                      <Input
                        type="number"
                        value={newSalario.salario_base}
                        onChange={(e) => setNewSalario(prev => ({ 
                          ...prev, 
                          salario_base: parseFloat(e.target.value) || 0 
                        }))}
                        placeholder="0,00"
                        className="bg-white/5 border-blue-200/30 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm text-blue-300">Hora Extra 100%</Label>
                      <Input
                        type="number"
                        value={newSalario.he100_valor}
                        onChange={(e) => setNewSalario(prev => ({ 
                          ...prev, 
                          he100_valor: parseFloat(e.target.value) || 0 
                        }))}
                        placeholder="0,00"
                        className="bg-white/5 border-blue-200/30 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm text-blue-300">Hora Extra 50%</Label>
                      <Input
                        type="number"
                        value={newSalario.he50_valor}
                        onChange={(e) => setNewSalario(prev => ({ 
                          ...prev, 
                          he50_valor: parseFloat(e.target.value) || 0 
                        }))}
                        placeholder="0,00"
                        className="bg-white/5 border-blue-200/30 text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Data de Vigência *</Label>
                  <Input
                    type="date"
                    value={newSalario.data_vigencia}
                    onChange={(e) => setNewSalario(prev => ({ ...prev, data_vigencia: e.target.value }))}
                    className="bg-white/5 border-blue-200/30 text-white"
                  />
                  <p className="text-xs text-blue-400/70">
                    A partir desta data, os novos cálculos usarão estes valores
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="ativo"
                      checked={newSalario.ativo}
                      onChange={(e) => setNewSalario(prev => ({ ...prev, ativo: e.target.checked }))}
                      className="h-4 w-4 rounded border-blue-200/30 bg-white/5 text-blue-600"
                    />
                    <Label htmlFor="ativo" className="text-white cursor-pointer">
                      Configuração ativa
                    </Label>
                  </div>
                  <p className="text-xs text-blue-400/70">
                    Configurações inativas não serão usadas em novos cálculos
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="bg-white/5 border-blue-200/30 text-blue-300 hover:bg-blue-500/20"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleAddNew}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configuração
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="flex-1" />
        </div>

        {/* Filtros */}
        <Card className="bg-white/5 backdrop-blur-sm border-blue-200/30 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-300" />
                <Input
                  placeholder="Buscar por função..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-white/5 border-blue-200/30 text-white"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-40 bg-white/5 border-blue-200/30 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-blue-200/30">
                  <SelectItem value="all" className="text-white hover:bg-blue-500/20">Todos</SelectItem>
                  <SelectItem value="active" className="text-white hover:bg-blue-500/20">Ativas</SelectItem>
                  <SelectItem value="inactive" className="text-white hover:bg-blue-500/20">Inativas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card className="bg-white/5 backdrop-blur-sm border-blue-200/30">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-blue-200/30 bg-blue-900/20">
                  <TableHead className="font-semibold text-white">Função</TableHead>
                  <TableHead className="font-semibold text-white">Salário Base</TableHead>
                  <TableHead className="font-semibold text-white">Hora Extra 100%</TableHead>
                  <TableHead className="font-semibold text-white">Hora Extra 50%</TableHead>
                  <TableHead className="font-semibold text-white">Vigência</TableHead>
                  <TableHead className="font-semibold text-white">Status</TableHead>
                  <TableHead className="font-semibold text-white w-[150px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-400 border-t-transparent"></div>
                        <p className="text-blue-400">Carregando configurações de salário...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredSalarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-blue-400">
                      <div className="flex flex-col items-center gap-3">
                        <DollarSign className="h-12 w-12 text-blue-400" />
                        <p>Nenhuma configuração de salário encontrada</p>
                        <p className="text-sm text-blue-300/70">
                          {salarios.length === 0 
                            ? 'Clique em "Nova Configuração" para começar' 
                            : 'Tente ajustar os filtros de busca'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSalarios.map((salario, index) => (
                    <TableRow 
                      key={salario.id}
                      className={`border-blue-200/30 ${index % 2 === 0 ? 'bg-white/5' : 'bg-white/10'}`}
                    >
                      <TableCell className="font-medium text-white">
                        {salario.funcao}
                      </TableCell>
                      
                      {editingId === salario.id ? (
                        <>
                          <TableCell>
                            <Input
                              type="number"
                              value={editForm.salario_base}
                              onChange={(e) => setEditForm(prev => ({ 
                                ...prev, 
                                salario_base: parseFloat(e.target.value) || 0 
                              }))}
                              className="bg-white/5 border-blue-200/30 text-white h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={editForm.he100_valor}
                              onChange={(e) => setEditForm(prev => ({ 
                                ...prev, 
                                he100_valor: parseFloat(e.target.value) || 0 
                              }))}
                              className="bg-white/5 border-blue-200/30 text-white h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={editForm.he50_valor}
                              onChange={(e) => setEditForm(prev => ({ 
                                ...prev, 
                                he50_valor: parseFloat(e.target.value) || 0 
                              }))}
                              className="bg-white/5 border-blue-200/30 text-white h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="date"
                              value={editForm.data_vigencia}
                              onChange={(e) => setEditForm(prev => ({ 
                                ...prev, 
                                data_vigencia: e.target.value 
                              }))}
                              className="bg-white/5 border-blue-200/30 text-white h-8"
                            />
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="text-green-300 font-medium">
                            {salario.salario_base.toLocaleString('pt-BR', { 
                              style: 'currency', 
                              currency: 'BRL' 
                            })}
                          </TableCell>
                          <TableCell className="text-amber-300">
                            {salario.he100_valor.toLocaleString('pt-BR', { 
                              style: 'currency', 
                              currency: 'BRL' 
                            })}
                          </TableCell>
                          <TableCell className="text-blue-300">
                            {salario.he50_valor.toLocaleString('pt-BR', { 
                              style: 'currency', 
                              currency: 'BRL' 
                            })}
                          </TableCell>
                          <TableCell className="text-blue-300">
                            {salario.data_vigencia ? new Date(salario.data_vigencia).toLocaleDateString('pt-BR') : '-'}
                          </TableCell>
                        </>
                      )}
                      
                      <TableCell>
                        <Badge className={
                          salario.ativo 
                            ? 'bg-green-500/20 text-green-300 border-green-300/30' 
                            : 'bg-red-500/20 text-red-300 border-red-300/30'
                        }>
                          {salario.ativo ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        {editingId === salario.id ? (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={() => handleSave(salario.id)}
                              className="h-8 bg-green-600 hover:bg-green-700"
                            >
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancel}
                              className="h-8 border-blue-200/30 text-blue-300 hover:bg-blue-500/20"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(salario)}
                              className="h-8 text-blue-300 hover:text-white hover:bg-blue-500/20"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleToggleStatus(salario)}
                              className="h-8 text-amber-300 hover:text-amber-200 hover:bg-amber-500/20"
                            >
                              {salario.ativo ? 'Desativar' : 'Ativar'}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(salario.id)}
                              className="h-8 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="mt-4 text-sm text-blue-400 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <span>
            Exibindo {filteredSalarios.length} de {salarios.length} configurações
          </span>
          {salarios.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-green-500/20 text-green-300">
                Ativas: {salarios.filter(s => s.ativo).length}
              </Badge>
              <Badge className="bg-red-500/20 text-red-300">
                Inativas: {salarios.filter(s => !s.ativo).length}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </EscalasLayout>
  );
}