// src/pages/BMForm.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Save, Printer, Check, AlertCircle, Plus, Copy, Trash2 } from 'lucide-react';
import { getContract, getActiveOrder, getOrderLines, getBMs, saveBM } from '@/store/contractStore';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BMLine, BoletimMedicao, OrderLine } from '@/types/contracts';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

// Interface auxiliar
interface BMWorkingItem {
  tempId: string; 
  orderLineId: string; 
  lineData: OrderLine; 
}

export default function BMForm() {
  const { id: contractId, bmId } = useParams<{ id: string; bmId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userProfile } = useAuth();

  // Estados
  const [contract, setContract] = useState<any>(null);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [orderLines, setOrderLines] = useState<OrderLine[]>([]);
  const [existingBM, setExistingBM] = useState<BoletimMedicao | undefined>(undefined);
  
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [bmNumero, setBmNumero] = useState(1);
  const [dataEmissao, setDataEmissao] = useState(new Date().toISOString().slice(0, 10));
  const [periodoInicio, setPeriodoInicio] = useState('');
  const [periodoFim, setPeriodoFim] = useState('');
  
  const [bmItemsList, setBmItemsList] = useState<BMWorkingItem[]>([]);
  const [measurements, setMeasurements] = useState<Record<string, { qtd: number; centroCusto: string }>>({});
  const [accumulatedMap, setAccumulatedMap] = useState<Record<string, { qtd: number; valor: number }>>({});
  const [selectValue, setSelectValue] = useState("");

  useEffect(() => {
    const loadData = async () => {
      if (!contractId) return;
      try {
        setLoading(true);
        const [contractData, orderData] = await Promise.all([
          getContract(contractId),
          getActiveOrder(contractId)
        ]);

        if (!orderData) {
          toast({ title: "Erro", description: "Nenhum pedido ativo encontrado.", variant: "destructive" });
          navigate(`/contrato/${contractId}`);
          return;
        }

        setContract(contractData);
        setActiveOrder(orderData);
        const lines = await getOrderLines(orderData.id);
        setOrderLines(lines);

        const allBMs = await getBMs(contractId, orderData.id);
        
        if (bmId && bmId !== 'novo') {
          const currentBM = allBMs.find(b => b.id === bmId);
          if (currentBM) {
            setExistingBM(currentBM);
            setBmNumero(currentBM.numero);
            setDataEmissao(currentBM.dataEmissao);
            setPeriodoInicio(currentBM.periodoInicio);
            setPeriodoFim(currentBM.periodoFim);
            
            const workList: BMWorkingItem[] = currentBM.linhas.map(l => {
              const originalLine = lines.find(ol => ol.id === l.orderLineId);
              const tempId = crypto.randomUUID();
              setMeasurements(prev => ({
                ...prev,
                [tempId]: { qtd: l.medidoAtualQtd, centroCusto: l.centroCusto }
              }));
              return {
                tempId,
                orderLineId: l.orderLineId,
                lineData: originalLine || { 
                  id: l.orderLineId, 
                  orderId: activeOrder.id, 
                  linha: l.linha, 
                  descricao: l.descricao, 
                  unidade: l.unidade, 
                  quantidade: l.quantidadeContratada, 
                  valorUnitario: l.valorUnitario 
                }
              };
            });
            setBmItemsList(workList);
          }
        } else {
          const nextNum = allBMs.length > 0 ? Math.max(...allBMs.map(b => b.numero)) + 1 : 1;
          setBmNumero(nextNum);
          const today = new Date().toISOString().slice(0, 10);
          setDataEmissao(today);
          setPeriodoInicio(today);
          setPeriodoFim(today);
          setBmItemsList([]);
        }

        const accMap: Record<string, { qtd: number; valor: number }> = {};
        const previousBMs = allBMs.filter(b => b.numero < (existingBM?.numero || bmNumero));
        previousBMs.forEach(bm => {
          bm.linhas.forEach(line => {
            if (!accMap[line.orderLineId]) accMap[line.orderLineId] = { qtd: 0, valor: 0 };
            accMap[line.orderLineId].qtd += line.medidoAtualQtd;
            accMap[line.orderLineId].valor += line.medidoAtualValor;
          });
        });
        setAccumulatedMap(accMap);

      } catch (error) {
        console.error(error);
        toast({ title: "Erro", description: "Falha ao carregar dados.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [contractId, bmId]);

  const addItemToBM = (orderLine: OrderLine) => {
    const tempId = crypto.randomUUID();
    setBmItemsList(prev => [...prev, {
      tempId,
      orderLineId: orderLine.id,
      lineData: orderLine
    }]);
    setSelectValue("");
  };

  const removeItemFromBM = (tempId: string) => {
    setBmItemsList(prev => prev.filter(item => item.tempId !== tempId));
    setMeasurements(prev => {
      const next = { ...prev };
      delete next[tempId];
      return next;
    });
  };

  const cloneItemInBM = (tempId: string) => {
    const itemToClone = bmItemsList.find(i => i.tempId === tempId);
    if (itemToClone) {
      const newTempId = crypto.randomUUID();
      const currentMeasurement = measurements[tempId];
      setBmItemsList(prev => [...prev, { ...itemToClone, tempId: newTempId }]);
      if (currentMeasurement) {
        setMeasurements(prev => ({ ...prev, [newTempId]: { ...currentMeasurement } }));
      }
    }
  };

  const setMeasurement = (tempId: string, qtd: number) => {
    setMeasurements(prev => ({ 
      ...prev, 
      [tempId]: { ...prev[tempId], qtd, centroCusto: prev[tempId]?.centroCusto || '' } 
    }));
  };

  const setCentroCusto = (tempId: string, centroCusto: string) => {
    setMeasurements(prev => ({ 
      ...prev, 
      [tempId]: { ...prev[tempId], qtd: prev[tempId]?.qtd || 0, centroCusto } 
    }));
  };

  const bmLines = useMemo((): BMLine[] => {
    return bmItemsList.map(item => {
      const acc = accumulatedMap[item.orderLineId] || { qtd: 0, valor: 0 };
      const medidoQtd = measurements[item.tempId]?.qtd ?? 0;
      const valorTotal = item.lineData.quantidade * item.lineData.valorUnitario;
      const medidoValor = medidoQtd * item.lineData.valorUnitario;
      const acumuladoTotalQtd = acc.qtd + medidoQtd;
      const acumuladoTotalValor = acc.valor + medidoValor;
      const saldoQtd = item.lineData.quantidade - acumuladoTotalQtd;
      const saldoValor = valorTotal - acumuladoTotalValor;
      const execPercent = item.lineData.quantidade > 0 ? (acumuladoTotalQtd / item.lineData.quantidade) * 100 : 0;

      return {
        orderLineId: item.orderLineId,
        linha: item.lineData.linha,
        descricao: item.lineData.descricao,
        unidade: item.lineData.unidade,
        quantidadeContratada: item.lineData.quantidade,
        valorUnitario: item.lineData.valorUnitario,
        valorTotalContrato: valorTotal,
        acumuladoAnteriorQtd: acc.qtd,
        acumuladoAnteriorValor: acc.valor,
        medidoAtualQtd: medidoQtd,
        medidoAtualValor: medidoValor,
        acumuladoTotalQtd,
        acumuladoTotalValor,
        saldoQtd,
        saldoValor,
        execucaoPercent: execPercent,
        centroCusto: measurements[item.tempId]?.centroCusto || '',
      };
    });
  }, [bmItemsList, measurements, accumulatedMap]);

  const totalBM = bmLines.reduce((s, l) => s + l.medidoAtualValor, 0);

  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    bmLines.forEach(l => {
      if (l.medidoAtualQtd < 0) errors.push(`Linha ${l.linha}: quantidade negativa`);
      if (l.saldoQtd < -0.001) errors.push(`Linha ${l.linha}: medição excede o saldo disponível`);
    });
    if (!periodoInicio || !periodoFim) errors.push('Período é obrigatório');
    if (bmItemsList.length === 0) errors.push('Adicione ao menos um item para medir');
    return errors;
  }, [bmLines, periodoInicio, periodoFim, bmItemsList]);

  const handleSave = async (status: 'rascunho' | 'finalizado') => {
    if (!activeOrder || !contract) return;

    if (validationErrors.length > 0) {
      toast({ 
        title: "Erro de Validação", 
        description: validationErrors.join('\n'), 
        variant: "destructive" 
      });
      return;
    }
    
    setIsSaving(true);
    try {
      const bm: BoletimMedicao = {
        id: existingBM?.id ?? crypto.randomUUID(),
        contractId: contract.id,
        orderId: activeOrder.id,
        numero: bmNumero,
        dataEmissao,
        periodoInicio,
        periodoFim,
        valorTotal: totalBM,
        linhas: bmLines,
        status,
      };
      await saveBM(bm);
      toast({ title: "Sucesso!", description: "Boletim salvo com sucesso." });
      navigate(`/contrato/${contract.id}`);
    } catch (error) {
      console.error(error);
      toast({ title: "Erro", description: "Falha ao salvar BM.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Carregando dados...</div>;
  if (!activeOrder) return <div className="p-10 text-center text-slate-500">Pedido não encontrado</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      <header className="border-b border-slate-800 bg-slate-900 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <button onClick={() => navigate(`/contrato/${contractId}`)} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar para o Contrato
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                {existingBM ? 'Editar Boletim de Medição' : 'Novo Boletim de Medição'}
                <span className="text-rose-500">#{String(bmNumero).padStart(3, '0')}</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {contract?.fornecedor} · Pedido: <span className="text-slate-300">{activeOrder.numeroPedido}</span>
              </p>
            </div>
            <div className="flex gap-2">
               <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800 h-9">
                  <Printer className="w-3.5 h-3.5 mr-1.5" /> PDF
               </Button>
              <Button size="sm" variant="secondary" onClick={() => handleSave('rascunho')} disabled={isSaving} className="bg-slate-800 text-white hover:bg-slate-700 h-9">
                <Save className="w-3.5 h-3.5 mr-1.5" /> Salvar Rascunho
              </Button>
              <Button size="sm" onClick={() => handleSave('finalizado')} disabled={isSaving} className="bg-rose-600 hover:bg-rose-700 text-white h-9">
                <Check className="w-3.5 h-3.5 mr-1.5" /> Finalizar BM
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <Card className="bg-slate-900/40 border-slate-800">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-slate-400 text-xs">BM Nº</Label>
                <Input value={String(bmNumero).padStart(3, '0')} readOnly className="mt-1 text-xs font-mono bg-slate-950 border-slate-700 text-slate-500" />
              </div>
              <div>
                <Label className="text-slate-400 text-xs">Data Emissão</Label>
                <Input type="date" value={dataEmissao} onChange={e => setDataEmissao(e.target.value)} className="mt-1 text-xs bg-slate-950 border-slate-700 text-white" />
              </div>
              <div>
                <Label className="text-slate-400 text-xs">Período Início</Label>
                <Input type="date" value={periodoInicio} onChange={e => setPeriodoInicio(e.target.value)} className="mt-1 text-xs bg-slate-950 border-slate-700 text-white" />
              </div>
              <div>
                <Label className="text-slate-400 text-xs">Período Fim</Label>
                <Input type="date" value={periodoFim} onChange={e => setPeriodoFim(e.target.value)} className="mt-1 text-xs bg-slate-950 border-slate-700 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-slate-800 overflow-hidden">
          <CardHeader className="bg-rose-600/10 border-b border-rose-900/20">
            <CardTitle className="text-rose-400 text-sm flex justify-between items-center">
              <span>Itens nesta Medição</span>
              <span className="text-xs bg-rose-500/20 px-2 py-1 rounded text-rose-300">{bmItemsList.length} itens na lista</span>
            </CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-800/50 text-slate-400 uppercase">
                <tr>
                  <th className="px-2 py-2.5 w-8 text-center">Ações</th>
                  <th className="px-2 py-2.5 text-left">Linha</th>
                  <th className="px-2 py-2.5 text-left">Descrição</th>
                  <th className="px-2 py-2.5 text-center">Unid.</th>
                  <th className="px-2 py-2.5 text-right">Qtd. Contr.</th>
                  <th className="px-2 py-2.5 text-right">Preço</th>
                  <th className="px-2 py-2.5 text-right">Acum. Ant. Qtd</th>
                  <th className="px-2 py-2.5 text-right bg-slate-800 text-slate-300">Acum. Ant. R$</th>
                  <th className="px-2 py-2.5 text-right bg-rose-900/20 text-rose-300">Medido Qtd</th>
                  <th className="px-2 py-2.5 text-right bg-rose-900/20 text-rose-300">Medido R$</th>
                  <th className="px-2 py-2.5 text-right">Saldo R$</th>
                  <th className="px-2 py-2.5 text-right">Exec.%</th>
                  <th className="px-2 py-2.5 text-left">Centro Custo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {bmItemsList.map(item => {
                  const acc = accumulatedMap[item.orderLineId] || { qtd: 0, valor: 0 };
                  const medidoQtd = measurements[item.tempId]?.qtd ?? 0;
                  const valorTotal = item.lineData.quantidade * item.lineData.valorUnitario;
                  const medidoValor = medidoQtd * item.lineData.valorUnitario;
                  const acumuladoTotalQtd = acc.qtd + medidoQtd;
                  const acumuladoTotalValor = acc.valor + medidoValor;
                  const saldoQtd = item.lineData.quantidade - acumuladoTotalQtd;
                  const saldoValor = valorTotal - acumuladoTotalValor;
                  const execPercent = item.lineData.quantidade > 0 ? (acumuladoTotalQtd / item.lineData.quantidade) * 100 : 0;

                  return (
                    <tr key={item.tempId} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-2 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            type="button"
                            onClick={() => cloneItemInBM(item.tempId)}
                            className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-blue-500/10"
                            title="Duplicar Item"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => removeItemFromBM(item.tempId)}
                            className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10"
                            title="Remover"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-2 py-2 font-mono font-medium text-white">{item.lineData.linha}</td>
                      <td className="px-2 py-2 text-slate-300">{item.lineData.descricao}</td>
                      <td className="px-2 py-2 text-center text-slate-400">{item.lineData.unidade}</td>
                      <td className="px-2 py-2 text-right font-mono text-slate-300">{item.lineData.quantidade}</td>
                      <td className="px-2 py-2 text-right font-mono text-slate-300">{formatCurrency(item.lineData.valorUnitario)}</td>
                      <td className="px-2 py-2 text-right font-mono text-slate-500">{acc.qtd}</td>
                      <td className="px-2 py-2 text-right font-mono text-slate-500">{formatCurrency(acc.valor)}</td>
                      <td className="px-2 py-2 text-right">
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={measurements[item.tempId]?.qtd ?? ''}
                          onChange={e => setMeasurement(item.tempId, parseFloat(e.target.value) || 0)}
                          className="w-20 text-xs text-right h-7 ml-auto bg-slate-950 border-slate-700 text-white focus:border-rose-500"
                        />
                      </td>
                      <td className="px-2 py-2 text-right font-mono text-rose-400">{formatCurrency(medidoValor)}</td>
                      <td className="px-2 py-2 text-right font-mono text-amber-400">{formatCurrency(saldoValor)}</td>
                      <td className="px-2 py-2 text-right font-mono text-slate-300">{execPercent.toFixed(1)}%</td>
                      <td className="px-2 py-2">
                        <Input
                          value={measurements[item.tempId]?.centroCusto ?? ''}
                          onChange={e => setCentroCusto(item.tempId, e.target.value)}
                          className="w-24 text-xs h-7 bg-slate-950 border-slate-700 text-white focus:border-rose-500"
                          placeholder="C.Custo"
                        />
                      </td>
                    </tr>
                  );
                })}
                {bmItemsList.length === 0 && (
                  <tr><td colSpan={13} className="px-4 py-8 text-center text-slate-500">Use o seletor abaixo para adicionar itens.</td></tr>
                )}
              </tbody>
              <tfoot className="bg-slate-800/30 border-t border-slate-800">
                <tr>
                  <td colSpan={13} className="p-4">
                    <div className="flex items-center justify-between">
                      {bmItemsList.length === 0 ? (
                        <div className="flex-1">
                           <p className="text-sm text-slate-400 mb-2 font-medium">Nenhum item adicionado. Selecione uma linha do pedido abaixo para começar:</p>
                           <Select 
                             value={selectValue} 
                             onValueChange={(val) => { addItemToBM(orderLines.find(ol => ol.id === val)!); setSelectValue(""); }}
                             className="w-full md:w-1/2"
                           >
                             <SelectTrigger className="bg-slate-950 border-slate-700 text-white hover:bg-slate-800 focus:ring-rose-500 focus:border-rose-500 h-10">
                               <Plus className="mr-2 h-4 w-4" /> Selecione uma linha para adicionar...
                             </SelectTrigger>
                             <SelectContent className="bg-slate-900 border-slate-700 text-white max-h-[300px]">
                               {orderLines.length === 0 ? (
                                 <div className="p-4 text-center text-slate-500 text-xs">Nenhum item disponível no pedido.</div>
                               ) : (
                                 orderLines.map(ol => (
                                   <SelectItem key={ol.id} value={ol.id}>
                                     <div className="flex flex-col">
                                       <span className="font-bold text-xs">{ol.linha}</span>
                                       <span className="text-[10px] text-slate-400 truncate max-w-[300px]">{ol.descricao}</span>
                                       <span className="text-[10px] text-rose-300 font-mono">{formatCurrency(ol.valorUnitario)}/{ol.unidade}</span>
                                     </div>
                                   </SelectItem>
                                 ))
                               )}
                             </SelectContent>
                           </Select>
                        </div>
                      ) : (
                        <div className="flex justify-end w-full">
                           <div className="flex items-center gap-3">
                              <span className="text-xs text-slate-400">Adicionar mais itens:</span>
                              <Select 
                                 value={selectValue} 
                                 onValueChange={(val) => { addItemToBM(orderLines.find(ol => ol.id === val)!); setSelectValue(""); }}
                              >
                                <SelectTrigger className="w-64 bg-slate-950 border-slate-700 text-white hover:bg-slate-800 focus:ring-rose-500 focus:border-rose-500 h-9">
                                  <Plus className="mr-2 h-4 w-4" /> Inserir Linha
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-700 text-white max-h-[200px]">
                                  {orderLines.map(ol => (
                                    <SelectItem key={ol.id} value={ol.id}>
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-xs">{ol.linha}</span>
                                        <span className="text-[10px] text-slate-400 truncate w-32">{ol.descricao}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                           </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
                <tr className="bg-slate-800/50 font-semibold text-white text-xs border-t border-slate-700">
                  <td colSpan={9} className="px-2 py-2.5 text-right">TOTAL DA MEDIÇÃO:</td>
                  <td className="px-2 py-2.5 text-right font-mono text-rose-400 text-sm">{formatCurrency(totalBM)}</td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>

        <Card className="bg-slate-900/40 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs uppercase font-bold">Valor Total do BM</p>
                <p className="text-2xl font-bold text-rose-400">{formatCurrency(totalBM)}</p>
              </div>
              {validationErrors.length > 0 && (
                <div className="text-xs text-red-400 bg-red-500/10 p-3 rounded border border-red-500/20 max-w-md">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <AlertCircle className="w-4 h-4" /> Problemas encontrados:
                  </div>
                  <ul className="list-disc pl-4 space-y-1">
                    {validationErrors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};