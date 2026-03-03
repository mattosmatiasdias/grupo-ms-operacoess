// src/pages/escalas/VisualizarEscala.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Download, Edit, Users, Calendar, Ship, Clock, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { EscalasLayout } from '@/components/Escalas/EscalasLayout';
import { supabase } from '@/integrations/supabase/client';

export default function VisualizarEscala() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [escala, setEscala] = useState<any>(null);
  const [funcionarios, setFuncionarios] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      carregarEscala(id);
    }
  }, [id]);

  const carregarEscala = async (escalaId: string) => {
    try {
      setIsLoading(true);

      // Carregar dados da escala
      const { data: escalaData, error: erroEscala } = await supabase
        .from('escalas')
        .select('*')
        .eq('id', escalaId)
        .single();

      if (erroEscala) throw erroEscala;

      // Carregar funcionários da escala
      const { data: funcEscala, error: erroFunc } = await supabase
        .from('escalas_funcionarios_escala')
        .select(`
          *,
          funcionario:funcionario_id (
            id, nome_completo, funcao, turma, matricula
          )
        `)
        .eq('escala_id', escalaId)
        .order('ordem');

      if (erroFunc) throw erroFunc;

      setEscala(escalaData);
      setFuncionarios(funcEscala || []);

    } catch (error) {
      console.error('Erro ao carregar escala:', error);
      toast.error('Erro ao carregar dados da escala');
    } finally {
      setIsLoading(false);
    }
  };

  const exportarPDF = () => {
    toast.info('Gerando PDF...');
    // Implementar lógica de PDF
  };

  const imprimir = () => {
    window.print();
  };

  const editarEscala = () => {
    navigate(`/escalas/editar/${id}`);
  };

  if (isLoading) {
    return (
      <EscalasLayout title="Carregando..." subtitle="Aguarde enquanto carregamos os dados">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-cyan-400">Carregando escala...</p>
          </div>
        </div>
      </EscalasLayout>
    );
  }

  if (!escala) {
    return (
      <EscalasLayout title="Escala não encontrada" subtitle="A escala solicitada não existe">
        <div className="text-center py-12">
          <p className="text-red-400 mb-4">Escala não encontrada</p>
          <Button onClick={() => navigate('/escalas')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para escalas
          </Button>
        </div>
      </EscalasLayout>
    );
  }

  return (
    <EscalasLayout 
      title={`Escala: ${escala.frente_servico}`}
      subtitle={`${new Date(escala.data_escala).toLocaleDateString('pt-BR')} - ${escala.turno}`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Botões de Ação */}
        <div className="flex justify-between items-center mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/escalas')}
            className="gap-2 bg-white/5 border-blue-200/30 text-blue-300 hover:bg-blue-500/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={editarEscala}
              className="gap-2 bg-amber-600/20 border-amber-400/30 text-amber-300 hover:bg-amber-600/30"
            >
              <Edit className="h-4 w-4" />
              Editar
            </Button>
            
            <Button
              variant="outline"
              onClick={exportarPDF}
              className="gap-2 bg-green-600/20 border-green-400/30 text-green-300 hover:bg-green-600/30"
            >
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button>
            
            <Button
              variant="outline"
              onClick={imprimir}
              className="gap-2 bg-blue-600/20 border-blue-400/30 text-blue-300 hover:bg-blue-600/30"
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
          </div>
        </div>

        {/* Informações da Escala */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/5 backdrop-blur-sm border-blue-200/30">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Ship className="h-5 w-5 text-blue-300" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-300">Navio</p>
                    <p className="font-semibold text-white text-lg">{escala.navio}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Calendar className="h-5 w-5 text-green-300" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-300">Data e Turno</p>
                    <p className="font-semibold text-white text-lg">
                      {new Date(escala.data_escala).toLocaleDateString('pt-BR')}
                    </p>
                    <Badge className="mt-1 bg-cyan-500/20 text-cyan-300">
                      {escala.turno}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-blue-200/30">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <UserCheck className="h-5 w-5 text-purple-300" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-300">Encarregados</p>
                    <div className="mt-2 space-y-2">
                      <div>
                        <p className="text-xs text-blue-400">Manhã</p>
                        <p className="font-medium text-white">{escala.encarregado_manha || 'Não definido'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-400">Tarde</p>
                        <p className="font-medium text-white">{escala.encarregado_tarde || 'Não definido'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-blue-200/30">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/20 rounded-lg">
                    <Users className="h-5 w-5 text-amber-300" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-300">Resumo</p>
                    <div className="mt-2">
                      <p className="text-2xl font-bold text-white">{funcionarios.length}</p>
                      <p className="text-sm text-blue-300">Funcionários na escala</p>
                    </div>
                    <Badge className="mt-2 bg-blue-500/20 text-blue-300">
                      {escala.frente_servico}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Funcionários */}
        <Card className="bg-white/5 backdrop-blur-sm border-blue-200/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Funcionários na Escala ({funcionarios.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-blue-200/30">
                    <th className="text-left py-3 px-4 text-blue-300 font-medium">#</th>
                    <th className="text-left py-3 px-4 text-blue-300 font-medium">Nome</th>
                    <th className="text-left py-3 px-4 text-blue-300 font-medium">Função</th>
                    <th className="text-left py-3 px-4 text-blue-300 font-medium">Turma</th>
                    <th className="text-left py-3 px-4 text-blue-300 font-medium">Equipamento</th>
                    <th className="text-left py-3 px-4 text-blue-300 font-medium">Encarregado</th>
                    <th className="text-left py-3 px-4 text-blue-300 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {funcionarios.map((item, index) => (
                    <tr key={item.id} className="border-b border-blue-200/10 hover:bg-white/5">
                      <td className="py-3 px-4 text-white font-medium">{index + 1}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-white font-medium">{item.funcionario?.nome_completo}</p>
                          {item.funcionario?.matricula && (
                            <p className="text-xs text-blue-400">Matrícula: {item.funcionario.matricula}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className="bg-blue-500/20 text-blue-300">
                          {item.funcionario?.funcao}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="border-blue-200/30 text-blue-300">
                          Turma {item.funcionario?.turma}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-white">{item.equipamento || '-'}</td>
                      <td className="py-3 px-4 text-white">{item.encarregado || '-'}</td>
                      <td className="py-3 px-4">
                        <Badge className={
                          item.status === 'CONFIRMADO' 
                            ? 'bg-green-500/20 text-green-300'
                            : item.status === 'PENDENTE'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-red-500/20 text-red-300'
                        }>
                          {item.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Observações */}
        {escala.observacoes && (
          <Card className="mt-6 bg-white/5 backdrop-blur-sm border-blue-200/30">
            <CardHeader>
              <CardTitle className="text-white">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-300 whitespace-pre-wrap">{escala.observacoes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </EscalasLayout>
  );
}
