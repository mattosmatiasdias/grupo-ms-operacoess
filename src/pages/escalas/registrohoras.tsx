import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock, Calendar, User, FileText, CheckCircle, XCircle,
  Plus, Filter, Download, Printer, Search, ArrowLeft,
  AlertTriangle, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { EscalasLayout } from '@/components/Escalas/EscalasLayout';

export default function RegistroHoras() {
  const navigate = useNavigate();
  const [registros, setRegistros] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPeriodo, setFilterPeriodo] = useState<string>('2025-01');

  // Mock data
  const mockRegistros = [
    {
      id: 1,
      funcionario_id: 'FUNC001',
      funcionario_nome: 'João Silva',
      data_trabalho: '2025-01-16',
      hora_entrada: '07:00',
      hora_saida: '16:00',
      horas_trabalhadas: 8,
      horas_extras_50: 1.5,
      horas_extras_100: 0,
      turno: 'Dia',
      status: 'Confirmado',
      observacoes: 'Normal'
    },
    {
      id: 2,
      funcionario_id: 'FUNC002',
      funcionario_nome: 'Maria Santos',
      data_trabalho: '2025-01-16',
      hora_entrada: '19:00',
      hora_saida: '07:00',
      horas_trabalhadas: 12,
      horas_extras_50: 0,
      horas_extras_100: 4,
      turno: 'Noite',
      status: 'Pendente',
      observacoes: 'Extra 100% autorizado'
    },
    {
      id: 3,
      funcionario_id: 'FUNC003',
      funcionario_nome: 'Carlos Oliveira',
      data_trabalho: '2025-01-16',
      hora_entrada: '07:00',
      hora_saida: '16:00',
      horas_trabalhadas: 8,
      horas_extras_50: 0,
      horas_extras_100: 0,
      turno: 'Dia',
      status: 'Confirmado',
      observacoes: 'Normal'
    },
    {
      id: 4,
      funcionario_id: 'FUNC001',
      funcionario_nome: 'João Silva',
      data_trabalho: '2025-01-17',
      hora_entrada: '07:00',
      hora_saida: '18:00',
      horas_trabalhadas: 8,
      horas_extras_50: 3,
      horas_extras_100: 0,
      turno: 'Dia',
      status: 'Aprovado',
      observacoes: 'Extra 50%'
    },
    {
      id: 5,
      funcionario_id: 'FUNC004',
      funcionario_nome: 'Ana Costa',
      data_trabalho: '2025-01-17',
      hora_entrada: '07:00',
      hora_saida: '16:00',
      horas_trabalhadas: 8,
      horas_extras_50: 0,
      horas_extras_100: 0,
      turno: 'Folga',
      status: 'Confirmado',
      observacoes: 'Folga'
    },
  ];

  useEffect(() => {
    console.log('RegistroHoras carregado');
    carregarRegistros();
  }, []);

  const carregarRegistros = async () => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRegistros(mockRegistros);
    } catch (error) {
      console.error('Erro ao carregar registros:', error);
      toast.error('Erro ao carregar registros de horas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNovoRegistro = () => {
    navigate('/escalas/novo-registro');
  };

  const handleEditarRegistro = (id: number) => {
    navigate(`/escalas/registro/${id}/editar`);
  };

  const handleConfirmarRegistro = async (id: number) => {
    try {
      toast.success('Registro confirmado com sucesso!');
      await carregarRegistros();
    } catch (error) {
      console.error('Erro ao confirmar registro:', error);
      toast.error('Erro ao confirmar registro');
    }
  };

  const handleRejeitarRegistro = async (id: number) => {
    if (!confirm('Tem certeza que deseja rejeitar este registro?')) return;
    
    try {
      toast.success('Registro rejeitado!');
      await carregarRegistros();
    } catch (error) {
      console.error('Erro ao rejeitar registro:', error);
      toast.error('Erro ao rejeitar registro');
    }
  };

  const filteredRegistros = registros.filter(registro => {
    const matchesSearch = 
      registro.funcionario_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registro.funcionario_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || registro.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const calcularTotais = () => {
    const totais = {
      horasNormais: filteredRegistros.reduce((sum, r) => sum + (r.horas_trabalhadas || 0), 0),
      horasExtras50: filteredRegistros.reduce((sum, r) => sum + (r.horas_extras_50 || 0), 0),
      horasExtras100: filteredRegistros.reduce((sum, r) => sum + (r.horas_extras_100 || 0), 0),
      totalRegistros: filteredRegistros.length,
      registrosPendentes: filteredRegistros.filter(r => r.status === 'Pendente').length,
    };
    
    return totais;
  };

  const totais = calcularTotais();

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Confirmado':
        return 'bg-green-500/20 text-green-300';
      case 'Aprovado':
        return 'bg-blue-500/20 text-blue-300';
      case 'Pendente':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'Rejeitado':
        return 'bg-red-500/20 text-red-300';
      default:
        return 'bg-slate-600 text-white';
    }
  };

  const getTurnoColor = (turno: string) => {
    switch(turno) {
      case 'Dia':
        return 'bg-amber-500/20 text-amber-300';
      case 'Noite':
        return 'bg-indigo-500/20 text-indigo-300';
      case 'Folga':
        return 'bg-slate-500/20 text-slate-300';
      default:
        return 'bg-blue-500/20 text-blue-300';
    }
  };

  return (
    <EscalasLayout
      title="Registro de Horas"
      subtitle="Controle e gestão de horas trabalhadas"
    >
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Cards de Resumo */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-slate-900/80 border border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-300" />
                </div>
                <div>
                  <p className="text-sm text-slate-300">Total Registros</p>
                  <p className="text-2xl font-bold text-white">{totais.totalRegistros}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-600/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-300" />
                </div>
                <div>
                  <p className="text-sm text-slate-300">Horas Normais</p>
                  <p className="text-2xl font-bold text-white">{totais.horasNormais.toFixed(1)}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-600/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-amber-300" />
                </div>
                <div>
                  <p className="text-sm text-slate-300">HE 50%</p>
                  <p className="text-2xl font-bold text-amber-300">{totais.horasExtras50.toFixed(1)}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-600/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-red-300" />
                </div>
                <div>
                  <p className="text-sm text-slate-300">HE 100%</p>
                  <p className="text-2xl font-bold text-red-300">{totais.horasExtras100.toFixed(1)}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-600/20 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-300" />
                </div>
                <div>
                  <p className="text-sm text-slate-300">Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-300">{totais.registrosPendentes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Ações */}
        <Card className="bg-slate-900/80 border border-slate-700">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Buscar funcionário..."
                    className="pl-10 bg-slate-800/60 text-white border-slate-600 w-full md:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-48 bg-slate-800/60 text-white border-slate-600">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600 text-white">
                    <SelectItem value="all" className="text-white hover:bg-slate-700">Todos</SelectItem>
                    <SelectItem value="Confirmado" className="text-white hover:bg-slate-700">Confirmados</SelectItem>
                    <SelectItem value="Aprovado" className="text-white hover:bg-slate-700">Aprovados</SelectItem>
                    <SelectItem value="Pendente" className="text-white hover:bg-slate-700">Pendentes</SelectItem>
                    <SelectItem value="Rejeitado" className="text-white hover:bg-slate-700">Rejeitados</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterPeriodo} onValueChange={setFilterPeriodo}>
                  <SelectTrigger className="w-full md:w-48 bg-slate-800/60 text-white border-slate-600">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600 text-white">
                    <SelectItem value="2025-01" className="text-white hover:bg-slate-700">2025/01</SelectItem>
                    <SelectItem value="2024-12" className="text-white hover:bg-slate-700">2024/12</SelectItem>
                    <SelectItem value="2024-11" className="text-white hover:bg-slate-700">2024/11</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <Button
                  onClick={handleNovoRegistro}
                  className="bg-amber-600 hover:bg-amber-700 gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Novo Registro
                </Button>
                <Button
                  variant="outline"
                  className="border-green-600/30 text-green-300 hover:bg-green-800/40 gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
                <Button
                  variant="outline"
                  className="border-blue-600/30 text-blue-300 hover:bg-blue-800/40 gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Imprimir
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Registros */}
        <Card className="bg-slate-900/80 border border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Registros de Horas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
              </div>
            ) : filteredRegistros.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum registro encontrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-600">
                      <TableHead className="text-slate-300">Funcionário</TableHead>
                      <TableHead className="text-slate-300">Data</TableHead>
                      <TableHead className="text-slate-300">Turno</TableHead>
                      <TableHead className="text-slate-300">Horário</TableHead>
                      <TableHead className="text-slate-300">Horas</TableHead>
                      <TableHead className="text-slate-300">HE 50%</TableHead>
                      <TableHead className="text-slate-300">HE 100%</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-300">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRegistros.map((registro) => (
                      <TableRow key={registro.id} className="border-slate-600 hover:bg-slate-800/20">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-white">{registro.funcionario_nome}</span>
                            <span className="text-sm text-slate-400">{registro.funcionario_id}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-white">
                          {new Date(registro.data_trabalho).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <Badge className={getTurnoColor(registro.turno)}>
                            {registro.turno}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-white">{registro.hora_entrada}</span>
                            <span className="text-sm text-slate-400">às {registro.hora_saida}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-white">
                          {registro.horas_trabalhadas?.toFixed(1)}h
                        </TableCell>
                        <TableCell className="text-amber-300">
                          {registro.horas_extras_50 || 0}h
                        </TableCell>
                        <TableCell className="text-red-300">
                          {registro.horas_extras_100 || 0}h
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(registro.status)}>
                            {registro.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {registro.status === 'Pendente' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleConfirmarRegistro(registro.id)}
                                  className="h-8 w-8 p-0 text-green-400 hover:text-green-300 hover:bg-green-500/20"
                                  title="Confirmar"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRejeitarRegistro(registro.id)}
                                  className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                  title="Rejeitar"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditarRegistro(registro.id)}
                              className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                              title="Editar"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Observações e Totais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-900/80 border border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Observações Gerais</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-slate-300">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Registros confirmados não podem ser editados</span>
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span>Registros pendentes aguardam aprovação</span>
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span>HE 100% requer autorização especial</span>
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>Folgas devem ser registradas normalmente</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Resumo do Período</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Horas Normais Totais:</span>
                  <span className="text-xl font-bold text-white">{totais.horasNormais.toFixed(1)}h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Horas Extras 50%:</span>
                  <span className="text-xl font-bold text-amber-300">{totais.horasExtras50.toFixed(1)}h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Horas Extras 100%:</span>
                  <span className="text-xl font-bold text-red-300">{totais.horasExtras100.toFixed(1)}h</span>
                </div>
                <div className="pt-4 border-t border-slate-600">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Total de Horas:</span>
                    <span className="text-2xl font-bold text-green-300">
                      {(totais.horasNormais + totais.horasExtras50 + totais.horasExtras100).toFixed(1)}h
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => navigate('/escalas')}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Escalas
          </Button>
        </div>

      </div>
    </EscalasLayout>
  );
}