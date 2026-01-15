// src/pages/escalas/Ocorrencias.tsx
import { useState } from 'react';
import { Plus, Search, AlertTriangle, FileCheck, UserX, HelpCircle, Edit, Trash2, MoreHorizontal } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { EscalasLayout } from '@/components/escalas/EscalasLayout';

const tiposOcorrencia = ['Falta', 'Atestado', 'Suspensão', 'Outro'];

const tipoIcons = {
  'Falta': UserX,
  'Atestado': FileCheck,
  'Suspensão': AlertTriangle,
  'Outro': HelpCircle,
};

export default function Ocorrencias() {
  const [ocorrencias, setOcorrencias] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOcorrencia, setEditingOcorrencia] = useState<any>(null);

  const [formData, setFormData] = useState({
    idFuncionario: '',
    dataOcorrencia: new Date().toISOString().split('T')[0],
    tipoOcorrencia: 'Falta',
    duracaoDias: 1,
    observacoes: '',
  });

  const filteredOcorrencias = ocorrencias.filter(ocor => {
    const matchesSearch = ocor.funcionarioNome?.toLowerCase().includes(search.toLowerCase()) || false;
    const matchesTipo = filterTipo === 'all' || ocor.tipoOcorrencia === filterTipo;
    return matchesSearch && matchesTipo;
  });

  const handleOpenDialog = (ocorrencia?: any) => {
    if (ocorrencia) {
      setEditingOcorrencia(ocorrencia);
      setFormData(ocorrencia);
    } else {
      setEditingOcorrencia(null);
      setFormData({
        idFuncionario: '',
        dataOcorrencia: new Date().toISOString().split('T')[0],
        tipoOcorrencia: 'Falta',
        duracaoDias: 1,
        observacoes: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.idFuncionario || !formData.dataOcorrencia) {
      toast.error('Selecione o funcionário e a data');
      return;
    }

    toast.success(editingOcorrencia ? 'Ocorrência atualizada com sucesso' : 'Ocorrência registrada com sucesso');
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setOcorrencias(prev => prev.filter(o => o.id !== id));
    toast.success('Ocorrência removida com sucesso');
  };

  const stats = {
    total: 0,
    faltas: 0,
    atestados: 0,
    suspensoes: 0,
  };

  return (
    <EscalasLayout 
      title="Registro de Ocorrências"
      subtitle="Gerenciar faltas, atestados e suspensões"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header com botão Nova Ocorrência */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => handleOpenDialog()} 
                className="bg-orange-600 hover:bg-orange-700 gap-2"
              >
                <Plus className="h-4 w-4" />
                Nova Ocorrência
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-gray-800 border-blue-200/30">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingOcorrencia ? 'Editar Ocorrência' : 'Nova Ocorrência'}
                </DialogTitle>
                <DialogDescription className="text-blue-300">
                  {editingOcorrencia 
                    ? 'Atualize as informações da ocorrência' 
                    : 'Registre uma nova ocorrência para o funcionário'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label className="text-white">Funcionário *</Label>
                  <Select 
                    value={formData.idFuncionario} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, idFuncionario: value }))}
                  >
                    <SelectTrigger className="bg-white/5 border-blue-200/30 text-white">
                      <SelectValue placeholder="Selecione o funcionário" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-blue-200/30">
                      {/* Funcionários serão carregados da API */}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="data" className="text-white">Data *</Label>
                    <Input
                      id="data"
                      type="date"
                      value={formData.dataOcorrencia}
                      onChange={(e) => setFormData(prev => ({ ...prev, dataOcorrencia: e.target.value }))}
                      className="bg-white/5 border-blue-200/30 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Tipo *</Label>
                    <Select 
                      value={formData.tipoOcorrencia} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, tipoOcorrencia: value }))}
                    >
                      <SelectTrigger className="bg-white/5 border-blue-200/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-blue-200/30">
                        {tiposOcorrencia.map(t => (
                          <SelectItem key={t} value={t} className="text-white hover:bg-blue-500/20">{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duracao" className="text-white">Duração (dias)</Label>
                  <Input
                    id="duracao"
                    type="number"
                    min="1"
                    value={formData.duracaoDias}
                    onChange={(e) => setFormData(prev => ({ ...prev, duracaoDias: Number(e.target.value) }))}
                    className="bg-white/5 border-blue-200/30 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="obs" className="text-white">Observações</Label>
                  <Textarea
                    id="obs"
                    value={formData.observacoes}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Detalhes sobre a ocorrência..."
                    rows={3}
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
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {editingOcorrencia ? 'Salvar Alterações' : 'Registrar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/5 backdrop-blur-sm border-blue-200/30">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-blue-300 mb-1">Total</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 backdrop-blur-sm border-blue-200/30">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-blue-300 mb-1">Faltas</p>
              <p className="text-2xl font-bold text-red-400">{stats.faltas}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 backdrop-blur-sm border-blue-200/30">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-blue-300 mb-1">Atestados</p>
              <p className="text-2xl font-bold text-orange-400">{stats.atestados}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 backdrop-blur-sm border-blue-200/30">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-blue-300 mb-1">Suspensões</p>
              <p className="text-2xl font-bold text-blue-400">{stats.suspensoes}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/5 backdrop-blur-sm border-blue-200/30 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-300" />
                <Input
                  placeholder="Buscar por nome..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-white/5 border-blue-200/30 text-white"
                />
              </div>
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger className="w-full md:w-48 bg-white/5 border-blue-200/30 text-white">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-blue-200/30">
                  <SelectItem value="all" className="text-white hover:bg-blue-500/20">Todos os Tipos</SelectItem>
                  {tiposOcorrencia.map(t => (
                    <SelectItem key={t} value={t} className="text-white hover:bg-blue-500/20">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="bg-white/5 backdrop-blur-sm border-blue-200/30">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-blue-200/30 bg-blue-900/20">
                  <TableHead className="font-semibold text-white w-[50px]"></TableHead>
                  <TableHead className="font-semibold text-white">Funcionário</TableHead>
                  <TableHead className="font-semibold text-white">Data</TableHead>
                  <TableHead className="font-semibold text-white">Tipo</TableHead>
                  <TableHead className="font-semibold text-white">Duração</TableHead>
                  <TableHead className="font-semibold text-white">Observações</TableHead>
                  <TableHead className="font-semibold text-white w-[80px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOcorrencias.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-blue-400">
                      Nenhuma ocorrência registrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOcorrencias.map((ocorrencia, index) => {
                    const Icon = tipoIcons[ocorrencia.tipoOcorrencia] || HelpCircle;

                    return (
                      <TableRow 
                        key={ocorrencia.id}
                        className={`border-blue-200/30 ${index % 2 === 0 ? 'bg-white/5' : 'bg-white/10'}`}
                      >
                        <TableCell>
                          <div className={`
                            flex h-8 w-8 items-center justify-center rounded-full
                            ${ocorrencia.tipoOcorrencia === 'Falta' || ocorrencia.tipoOcorrencia === 'Suspensão'
                              ? "bg-red-500/20 text-red-400"
                              : "bg-orange-500/20 text-orange-400"
                            }
                          `}>
                            <Icon className="h-4 w-4" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-white">{ocorrencia.funcionarioNome || 'Nome não disponível'}</p>
                            <p className="text-xs text-blue-300">Função • Equipe</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-blue-300">
                          {new Date(ocorrencia.dataOcorrencia).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <Badge className={`
                            ${ocorrencia.tipoOcorrencia === 'Falta' 
                              ? 'bg-red-500/20 text-red-400'
                              : ocorrencia.tipoOcorrencia === 'Atestado'
                              ? 'bg-orange-500/20 text-orange-400'
                              : ocorrencia.tipoOcorrencia === 'Suspensão'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-gray-500/20 text-gray-400'
                            }
                          `}>
                            {ocorrencia.tipoOcorrencia}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-blue-300">
                          {ocorrencia.duracaoDias} dia{ocorrencia.duracaoDias > 1 ? 's' : ''}
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <p className="text-sm text-blue-300 truncate">
                            {ocorrencia.observacoes || '-'}
                          </p>
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
                                onClick={() => handleOpenDialog(ocorrencia)}
                                className="text-white hover:bg-blue-500/20"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(ocorrencia.id)}
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
        <div className="mt-4 text-sm text-blue-400">
          Exibindo {filteredOcorrencias.length} ocorrências
        </div>
      </div>
    </EscalasLayout>
  );
}