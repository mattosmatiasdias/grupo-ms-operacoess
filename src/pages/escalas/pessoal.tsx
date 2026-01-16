// src/pages/escalas/Pessoal.tsx
import { useState, useEffect } from 'react';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Upload, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { EscalasLayout } from '@/components/Escalas/EscalasLayout';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

// Funções baseadas no Excel
const funcoes = [
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

const turmas = ['A', 'B', 'C', 'D', 'ADM', 'AJUD'];

export default function Pessoal() {
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [configSalarios, setConfigSalarios] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterFuncao, setFilterFuncao] = useState<string>('all');
  const [filterTurma, setFilterTurma] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFuncionario, setEditingFuncionario] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    nome_completo: '',
    funcao: 'AJUDANTE',
    turma: 'A',
    data_contratacao: new Date().toISOString().split('T')[0],
    status: 'Ativo',
    matricula: '',
    telefone: '',
    email: '',
    observacoes: '',
  });

  // Carregar funcionários e configurações de salário
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setIsLoading(true);
      
      // Carregar funcionários
      const { data: funcionariosData, error: funcionariosError } = await supabase
        .from('escalas_funcionarios')
        .select('*')
        .order('nome_completo');

      if (funcionariosError) throw funcionariosError;

      // Carregar configurações de salário
      const { data: salariosData, error: salariosError } = await supabase
        .from('escalas_config_salarios')
        .select('*')
        .eq('ativo', true)
        .order('funcao');

      if (salariosError) throw salariosError;

      setFuncionarios(funcionariosData || []);
      setConfigSalarios(salariosData || []);
      
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  // Obter valores salariais para uma função específica
  const getValoresSalariais = (funcao: string) => {
    const config = configSalarios.find(s => s.funcao === funcao);
    return {
      salario_base: config?.salario_base || 0,
      he100_valor: config?.he100_valor || 0,
      he50_valor: config?.he50_valor || 0,
      data_vigencia: config?.data_vigencia || new Date().toISOString().split('T')[0]
    };
  };

  const filteredFuncionarios = funcionarios.filter(func => {
    const matchesSearch = func.nome_completo?.toLowerCase().includes(search.toLowerCase()) || 
                         func.matricula?.toLowerCase().includes(search.toLowerCase()) || false;
    const matchesFuncao = filterFuncao === 'all' || func.funcao === filterFuncao;
    const matchesTurma = filterTurma === 'all' || func.turma === filterTurma;
    const matchesStatus = filterStatus === 'all' || func.status === filterStatus;
    return matchesSearch && matchesFuncao && matchesTurma && matchesStatus;
  });

  const handleOpenDialog = (funcionario?: any) => {
    if (funcionario) {
      setEditingFuncionario(funcionario);
      setFormData({
        nome_completo: funcionario.nome_completo || '',
        funcao: funcionario.funcao || 'AJUDANTE',
        turma: funcionario.turma || 'A',
        data_contratacao: funcionario.data_contratacao ? new Date(funcionario.data_contratacao).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        status: funcionario.status || 'Ativo',
        matricula: funcionario.matricula || '',
        telefone: funcionario.telefone || '',
        email: funcionario.email || '',
        observacoes: funcionario.observacoes || '',
      });
    } else {
      setEditingFuncionario(null);
      setFormData({
        nome_completo: '',
        funcao: 'AJUDANTE',
        turma: 'A',
        data_contratacao: new Date().toISOString().split('T')[0],
        status: 'Ativo',
        matricula: '',
        telefone: '',
        email: '',
        observacoes: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nome_completo || !formData.data_contratacao) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    // Validar matrícula única se for preenchida
    if (formData.matricula) {
      const existing = funcionarios.find(f => 
        f.matricula === formData.matricula && 
        (!editingFuncionario || f.id !== editingFuncionario.id)
      );
      
      if (existing) {
        toast.error('Matrícula já cadastrada para outro funcionário');
        return;
      }
    }

    try {
      if (editingFuncionario) {
        // Atualizar funcionário existente
        const { error } = await supabase
          .from('escalas_funcionarios')
          .update(formData)
          .eq('id', editingFuncionario.id);

        if (error) throw error;
        toast.success('Funcionário atualizado com sucesso');
      } else {
        // Criar novo funcionário
        const { error } = await supabase
          .from('escalas_funcionarios')
          .insert([formData]);

        if (error) throw error;
        toast.success('Funcionário adicionado com sucesso');
      }

      await carregarDados();
      setIsDialogOpen(false);
      
    } catch (error: any) {
      console.error('Erro ao salvar funcionário:', error);
      toast.error(`Erro: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este funcionário?')) return;

    try {
      const { error } = await supabase
        .from('escalas_funcionarios')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Funcionário removido com sucesso');
      await carregarDados();
      
    } catch (error: any) {
      console.error('Erro ao excluir funcionário:', error);
      toast.error('Erro ao excluir funcionário');
    }
  };

  const handleToggleStatus = async (funcionario: any) => {
    const newStatus = funcionario.status === 'Ativo' ? 'Inativo' : 'Ativo';
    
    try {
      const { error } = await supabase
        .from('escalas_funcionarios')
        .update({ status: newStatus })
        .eq('id', funcionario.id);

      if (error) throw error;
      toast.success(`Funcionário ${newStatus === 'Ativo' ? 'ativado' : 'inativado'} com sucesso`);
      await carregarDados();
      
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status do funcionário');
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setFilterFuncao('all');
    setFilterTurma('all');
    setFilterStatus('all');
  };

  return (
    <EscalasLayout 
      title="Gestão de Pessoal"
      subtitle="Gerenciar funcionários, funções e turmas"
    >
      <div className="max-w-7xl mx-auto">
        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => handleOpenDialog()} 
                className="bg-blue-600 hover:bg-blue-700 gap-2"
              >
                <Plus className="h-4 w-4" />
                Novo Funcionário
              </Button>
            </DialogTrigger>
          </Dialog>
          
          <Button 
            variant="outline"
            onClick={handleImportExcel}
            className="bg-green-600/20 border-green-400/30 text-green-300 hover:bg-green-600/30 hover:text-green-200 gap-2"
          >
            <Upload className="h-4 w-4" />
            Importar do Excel
          </Button>

          <Link to="/escalas/salarios">
            <Button 
              variant="outline"
              className="bg-purple-600/20 border-purple-400/30 text-purple-300 hover:bg-purple-600/30 hover:text-purple-200 gap-2"
            >
              <DollarSign className="h-4 w-4" />
              Configurar Salários
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="bg-white/5 backdrop-blur-sm border-blue-200/30 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-300" />
                <Input
                  placeholder="Buscar por nome ou matrícula..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-white/5 border-blue-200/30 text-white"
                />
              </div>
              <Select value={filterFuncao} onValueChange={setFilterFuncao}>
                <SelectTrigger className="w-full md:w-40 bg-white/5 border-blue-200/30 text-white">
                  <SelectValue placeholder="Função" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-blue-200/30">
                  <SelectItem value="all" className="text-white hover:bg-blue-500/20">Todas Funções</SelectItem>
                  {funcoes.map(f => (
                    <SelectItem key={f} value={f} className="text-white hover:bg-blue-500/20">{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterTurma} onValueChange={setFilterTurma}>
                <SelectTrigger className="w-full md:w-40 bg-white/5 border-blue-200/30 text-white">
                  <SelectValue placeholder="Turma" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-blue-200/30">
                  <SelectItem value="all" className="text-white hover:bg-blue-500/20">Todas Turmas</SelectItem>
                  {turmas.map(t => (
                    <SelectItem key={t} value={t} className="text-white hover:bg-blue-500/20">Turma {t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-40 bg-white/5 border-blue-200/30 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-blue-200/30">
                  <SelectItem value="all" className="text-white hover:bg-blue-500/20">Todos Status</SelectItem>
                  <SelectItem value="Ativo" className="text-white hover:bg-blue-500/20">Ativo</SelectItem>
                  <SelectItem value="Inativo" className="text-white hover:bg-blue-500/20">Inativo</SelectItem>
                  <SelectItem value="Férias" className="text-white hover:bg-blue-500/20">Férias</SelectItem>
                  <SelectItem value="Afastado" className="text-white hover:bg-blue-500/20">Afastado</SelectItem>
                </SelectContent>
              </Select>
              {(search || filterFuncao !== 'all' || filterTurma !== 'all' || filterStatus !== 'all') && (
                <Button
                  variant="ghost"
                  onClick={handleClearFilters}
                  className="text-blue-300 hover:text-blue-200 hover:bg-blue-500/20"
                >
                  Limpar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="bg-white/5 backdrop-blur-sm border-blue-200/30">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-blue-200/30 bg-blue-900/20">
                  <TableHead className="font-semibold text-white">Nome / Matrícula</TableHead>
                  <TableHead className="font-semibold text-white">Função</TableHead>
                  <TableHead className="font-semibold text-white">Turma</TableHead>
                  <TableHead className="font-semibold text-white">Salário Base</TableHead>
                  <TableHead className="font-semibold text-white">Contratação</TableHead>
                  <TableHead className="font-semibold text-white">Status</TableHead>
                  <TableHead className="font-semibold text-white w-[80px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-400 border-t-transparent"></div>
                        <p className="text-blue-400">Carregando funcionários...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredFuncionarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-blue-400">
                      {funcionarios.length === 0 ? (
                        <div className="flex flex-col items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Search className="h-6 w-6 text-blue-400" />
                          </div>
                          <p>Nenhum funcionário cadastrado</p>
                          <p className="text-sm text-blue-300/70">Clique em "Novo Funcionário" para começar</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Search className="h-6 w-6 text-blue-400" />
                          </div>
                          <p>Nenhum funcionário encontrado</p>
                          <p className="text-sm text-blue-300/70">Tente ajustar os filtros de busca</p>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFuncionarios.map((funcionario, index) => {
                    const salario = getValoresSalariais(funcionario.funcao);
                    
                    return (
                      <TableRow 
                        key={funcionario.id}
                        className={`border-blue-200/30 ${index % 2 === 0 ? 'bg-white/5' : 'bg-white/10'}`}
                      >
                        <TableCell className="font-medium text-white">
                          <div>
                            {funcionario.nome_completo}
                            {funcionario.matricula && (
                              <div className="text-xs text-blue-400 mt-1">
                                Matrícula: {funcionario.matricula}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-blue-300">{funcionario.funcao}</TableCell>
                        <TableCell>
                          <Badge className="bg-blue-500/20 text-blue-300">
                            Turma {funcionario.turma}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-blue-300">
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {salario.salario_base.toLocaleString('pt-BR', { 
                                style: 'currency', 
                                currency: 'BRL' 
                              })}
                            </span>
                            <span className="text-xs text-blue-400/70">
                              HE 100%: {salario.he100_valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                            <span className="text-xs text-blue-400/70">
                              HE 50%: {salario.he50_valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-blue-300">
                          {funcionario.data_contratacao ? new Date(funcionario.data_contratacao).toLocaleDateString('pt-BR') : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            funcionario.status === 'Ativo' 
                              ? 'bg-green-500/20 text-green-300 border-green-300/30' 
                              : funcionario.status === 'Férias'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-300/30'
                              : funcionario.status === 'Afastado'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-300/30'
                              : 'bg-red-500/20 text-red-300 border-red-300/30'
                          }>
                            {funcionario.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-300 hover:text-white hover:bg-blue-500/20">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-gray-800 border-blue-200/30">
                              <DropdownMenuItem 
                                onClick={() => handleOpenDialog(funcionario)}
                                className="text-white hover:bg-blue-500/20"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleToggleStatus(funcionario)}
                                className="text-white hover:bg-blue-500/20"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                {funcionario.status === 'Ativo' ? 'Inativar' : 'Ativar'}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(funcionario.id)}
                                className="text-red-400 hover:bg-red-500/20"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="mt-4 text-sm text-blue-400 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <span>
            Exibindo {filteredFuncionarios.length} de {funcionarios.length} funcionários
          </span>
          {funcionarios.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-green-500/20 text-green-300">
                Ativos: {funcionarios.filter(f => f.status === 'Ativo').length}
              </Badge>
              <Badge className="bg-amber-500/20 text-amber-300">
                Férias: {funcionarios.filter(f => f.status === 'Férias').length}
              </Badge>
              <Badge className="bg-purple-500/20 text-purple-300">
                Afastados: {funcionarios.filter(f => f.status === 'Afastado').length}
              </Badge>
              <Badge className="bg-red-500/20 text-red-300">
                Inativos: {funcionarios.filter(f => f.status === 'Inativo').length}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Dialog para cadastro/edição */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-gray-800 border-blue-200/30">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingFuncionario ? 'Editar Funcionário' : 'Novo Funcionário'}
            </DialogTitle>
            <DialogDescription className="text-blue-300">
              {editingFuncionario 
                ? 'Atualize as informações do funcionário' 
                : 'Preencha os dados para cadastrar um novo funcionário'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome_completo" className="text-white">Nome Completo *</Label>
                <Input
                  id="nome_completo"
                  value={formData.nome_completo}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome_completo: e.target.value }))}
                  placeholder="Digite o nome completo"
                  className="bg-white/5 border-blue-200/30 text-white"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="matricula" className="text-white">Matrícula (opcional)</Label>
                <Input
                  id="matricula"
                  value={formData.matricula}
                  onChange={(e) => setFormData(prev => ({ ...prev, matricula: e.target.value }))}
                  placeholder="Número da matrícula"
                  className="bg-white/5 border-blue-200/30 text-white"
                />
                <p className="text-xs text-blue-400/70">Deixe em branco se não possuir</p>
              </div>
              <div className="space-y-2">
                <Label className="text-white">Função *</Label>
                <Select 
                  value={formData.funcao} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, funcao: value }))}
                >
                  <SelectTrigger className="bg-white/5 border-blue-200/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-blue-200/30">
                    {funcoes.map(f => (
                      <SelectItem key={f} value={f} className="text-white hover:bg-blue-500/20">{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Turma *</Label>
                <Select 
                  value={formData.turma} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, turma: value }))}
                >
                  <SelectTrigger className="bg-white/5 border-blue-200/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-blue-200/30">
                    {turmas.map(t => (
                      <SelectItem key={t} value={t} className="text-white hover:bg-blue-500/20">Turma {t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_contratacao" className="text-white">Data de Contratação *</Label>
                <Input
                  id="data_contratacao"
                  type="date"
                  value={formData.data_contratacao}
                  onChange={(e) => setFormData(prev => ({ ...prev, data_contratacao: e.target.value }))}
                  className="bg-white/5 border-blue-200/30 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="bg-white/5 border-blue-200/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-blue-200/30">
                    <SelectItem value="Ativo" className="text-white hover:bg-blue-500/20">Ativo</SelectItem>
                    <SelectItem value="Inativo" className="text-white hover:bg-blue-500/20">Inativo</SelectItem>
                    <SelectItem value="Férias" className="text-white hover:bg-blue-500/20">Férias</SelectItem>
                    <SelectItem value="Afastado" className="text-white hover:bg-blue-500/20">Afastado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefone" className="text-white">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                  placeholder="(00) 00000-0000"
                  className="bg-white/5 border-blue-200/30 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                  className="bg-white/5 border-blue-200/30 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes" className="text-white">Observações</Label>
              <Input
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Observações adicionais"
                className="bg-white/5 border-blue-200/30 text-white"
              />
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
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {editingFuncionario ? 'Salvar Alterações' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </EscalasLayout>
  );
}

// Função placeholder para importação
const handleImportExcel = () => {
  toast.info('Funcionalidade de importação será implementada em breve');
};
