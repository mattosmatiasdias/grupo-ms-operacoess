// src/pages/escalas/Relatorios.tsx
import { useState } from 'react';
import { FileDown, BarChart3, Users, DollarSign, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EscalasLayout } from '@/components/escalas/EscalasLayout';

export default function Relatorios() {
  const [periodo, setPeriodo] = useState('ultimo-mes');

  // Dados serão carregados da API
  const stats = {
    folhaPagamento: 0,
    funcionariosAtivos: 0,
    ocorrencias: 0,
    taxaAssiduidade: 0
  };

  const handleExportCSV = () => {
    // Simula exportação
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Relatório de Escalas\n"
      + "Exportado em: " + new Date().toLocaleDateString('pt-BR') + "\n\n";
    
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "relatorio_escalas.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <EscalasLayout 
      title="Relatórios"
      subtitle="Análise de ocorrências, custos e tendências"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex gap-2">
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger className="w-40 bg-white/5 border-blue-200/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-blue-200/30">
                <SelectItem value="ultimo-mes" className="text-white hover:bg-blue-500/20">Último Mês</SelectItem>
                <SelectItem value="ultimos-3-meses" className="text-white hover:bg-blue-500/20">Últimos 3 Meses</SelectItem>
                <SelectItem value="ultimo-ano" className="text-white hover:bg-blue-500/20">Último Ano</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={handleExportCSV} 
              className="bg-green-600/20 border-green-400/30 text-green-300 hover:bg-green-600/30 hover:text-green-200 gap-2"
            >
              <FileDown className="h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/5 backdrop-blur-sm border-blue-200/30 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-200">Folha de Pagamento</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.folhaPagamento.toLocaleString('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    })}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-blue-200/30 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-200">Funcionários Ativos</p>
                  <p className="text-2xl font-bold text-white">{stats.funcionariosAtivos}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-blue-200/30 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-200">Ocorrências</p>
                  <p className="text-2xl font-bold text-white">{stats.ocorrencias}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-orange-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-blue-200/30 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-200">Taxa de Assiduidade</p>
                  <p className="text-2xl font-bold text-white">{stats.taxaAssiduidade}%</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-cyan-300" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white/5 backdrop-blur-sm border-blue-200/30">
            <CardHeader>
              <CardTitle className="text-xl text-white">Ocorrências por Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 text-blue-400 mx-auto mb-4 opacity-50" />
                  <p className="text-blue-400/70">
                    Gráfico será carregado após integração com banco de dados
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-blue-200/30">
            <CardHeader>
              <CardTitle className="text-xl text-white">Distribuição por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 text-green-400 mx-auto mb-4 opacity-50" />
                  <p className="text-green-400/70">
                    Distribuições serão calculadas com base nos dados do sistema
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Table */}
        <Card className="bg-white/5 backdrop-blur-sm border-blue-200/30">
          <CardHeader>
            <CardTitle className="text-xl text-white">Resumo por Equipe</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-blue-200/30 bg-blue-900/20">
                  <TableHead className="font-semibold text-white">Equipe</TableHead>
                  <TableHead className="font-semibold text-white">Funcionários</TableHead>
                  <TableHead className="font-semibold text-white">Motoristas</TableHead>
                  <TableHead className="font-semibold text-white">Operadores</TableHead>
                  <TableHead className="font-semibold text-white">Ajudantes</TableHead>
                  <TableHead className="font-semibold text-white">Encarregados</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-blue-400">
                    Dados serão carregados após integração com banco de dados
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </EscalasLayout>
  );
}