// src/pages/ContractDetail.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Plus, FileText, ClipboardList, Eye, Trash2, 
  Calendar, DollarSign, Package, CheckCircle, Circle, X // Import X adicionado
} from 'lucide-react';
import { getContract, getOrders, getActiveOrder, getOrderLines, getBMs, saveOrderLine, deleteOrderLine, saveOrder } from '@/store/contractStore';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Import Label adicionado
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Order } from '@/types/contracts';

const ContractDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userProfile } = useAuth();
  
  // Estados
  const [contract, setContract] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [orderLines, setOrderLines] = useState<any[]>([]);
  const [bms, setBms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para Adicionar Linha (No Pedido Ativo)
  const [addingLine, setAddingLine] = useState(false);
  const [newLine, setNewLine] = useState({ 
    linha: '', descricao: '', unidade: '', quantidade: '', valorUnitario: '' 
  });

  // Estado para Criar Novo Pedido
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [newOrderForm, setNewOrderForm] = useState({
    numeroPedido: '',
    descricao: '',
    valorTotal: '' 
  });

  // Carregamento de Dados
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [contractData, ordersData] = await Promise.all([
          getContract(id),
          getOrders(id)
        ]);
        setContract(contractData);
        setOrders(ordersData);

        // Tenta encontrar o pedido ativo, ou pega o primeiro, ou null
        let active = ordersData.find(o => o.status === 'ativo');
        if (!active && ordersData.length > 0) active = ordersData[0];
        
        setActiveOrder(active || null);

        // Se tem pedido ativo, carrega as linhas dele
        if (active) {
          const lines = await getOrderLines(active.id);
          setOrderLines(lines);
        }

        // Carrega BMs de todo o contrato
        const bmsData = await getBMs(id); 
        setBms(bmsData);

      } catch (error) {
        console.error(error);
        toast({ title: "Erro", description: "Falha ao carregar detalhes.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  // Função para trocar o pedido ativo
  const handleSetActiveOrder = async (order: Order) => {
    setActiveOrder(order);
    // Recarrega linhas do novo pedido ativo
    const lines = await getOrderLines(order.id);
    setOrderLines(lines);
    toast({ title: "Pedido Selecionado", description: `Trabalhando agora no pedido ${order.numeroPedido}` });
  };

  // Adicionar nova Linha ao Pedido Ativo
  const handleAddLine = async () => {
    if (!activeOrder) {
      toast({ title: "Atenção", description: "Selecione ou crie um pedido ativo primeiro.", variant: "destructive" });
      return;
    }
    try {
      const linePayload = {
        id: crypto.randomUUID(),
        orderId: activeOrder.id, 
        linha: newLine.linha,
        descricao: newLine.descricao,
        unidade: newLine.unidade,
        quantidade: parseFloat(newLine.quantidade) || 0,
        valorUnitario: parseFloat(newLine.valorUnitario) || 0,
      };

      await saveOrderLine(linePayload);
      setOrderLines([...orderLines, linePayload]);
      setNewLine({ linha: '', descricao: '', unidade: '', quantidade: '', valorUnitario: '' });
      setAddingLine(false);
      toast({ title: "Sucesso", description: "Item adicionado ao pedido." });
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível adicionar o item.", variant: "destructive" });
    }
  };

  const handleDeleteLine = async (lineId: string) => {
    if (!confirm("Tem certeza que deseja excluir este item?")) return;
    try {
      await deleteOrderLine(lineId);
      setOrderLines(orderLines.filter(l => l.id !== lineId));
      toast({ title: "Sucesso", description: "Item removido." });
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao remover item.", variant: "destructive" });
    }
  };

  // Criar novo Pedido
  const handleCreateOrder = async () => {
    if (!contract) return;
    try {
      const newOrder: Order = {
        id: crypto.randomUUID(),
        contractId: contract.id,
        numeroPedido: newOrderForm.numeroPedido,
        descricao: newOrderForm.descricao,
        dataPedido: new Date().toISOString().split('T')[0],
        status: 'ativo', 
        valorTotal: 0
      };

      await saveOrder(newOrder);
      
      // Atualiza UI
      const updatedOrders = [...orders, newOrder];
      setOrders(updatedOrders);
      setActiveOrder(newOrder);
      setOrderLines([]); // Novo pedido começa vazio
      setShowNewOrder(false);
      setNewOrderForm({ numeroPedido: '', descricao: '', valorTotal: '' });
      
      toast({ title: "Sucesso", description: "Novo pedido criado e ativado. Adicione os itens na aba 'Itens do Pedido Ativo'." });
    } catch (error) {
      console.error(error);
      toast({ title: "Erro", description: "Falha ao criar pedido.", variant: "destructive" });
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Carregando...</div>;
  if (!contract) return <div className="p-10 text-center text-slate-500">Contrato não encontrado</div>;

  // Cálculos baseados no Pedido Ativo
  const totalOrder = orderLines.reduce((sum, l) => sum + (l.quantidade * l.valorUnitario), 0);
  const totalContract = contract.valorTotal;
  const totalMeasured = bms.reduce((sum, b) => sum + b.valorTotal, 0);
  const balance = totalContract - totalMeasured;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <button onClick={() => navigate('/contratos')} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar para Contratos
          </button>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-white">{contract.fornecedor}</h1>
                <Badge className="bg-slate-800 text-slate-300 border-slate-700 text-xs">{contract.tipoLabel}</Badge>
              </div>
              <p className="text-xs text-slate-500 font-mono">Contrato Nº {contract.numero}</p>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl line-clamp-2">{contract.objeto}</p>
            </div>
            <div className="flex items-center gap-3">
               <Button 
                 type="button"
                 onClick={() => navigate(`/contrato/${contract.id}/bm/novo`)} 
                 className="bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20 h-9"
                 disabled={!activeOrder || orderLines.length === 0}
                 title={!activeOrder ? "Crie um pedido ativo primeiro" : "Gerar Boletim de Medição"}
               >
                 <FileText className="w-4 h-4 mr-2" />
                 Gerar BM
               </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Card do Pedido Ativo */}
        <Card className={`border-l-4 ${activeOrder ? 'border-l-emerald-500 bg-slate-900/60' : 'border-l-amber-500 bg-slate-900/40'}`}>
          <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Pedido Ativo</span>
                {activeOrder ? (
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" /> Ativo
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">
                    Nenhum Selecionado
                  </Badge>
                )}
              </div>
              {activeOrder ? (
                <>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {activeOrder.numeroPedido} - {activeOrder.descricao}
                  </h3>
                  <p className="text-xs text-slate-400">Criado em: {formatDate(activeOrder.dataPedido)}</p>
                </>
              ) : (
                <p className="text-slate-400 text-sm">Selecione um pedido existente na aba "Pedidos" ou crie um novo para começar a trabalhar.</p>
              )}
            </div>
            {!activeOrder && (
              <Button 
                type="button"
                onClick={() => {
                  console.log("Abrir modal criar pedido (topo)");
                  setShowNewOrder(true);
                }} 
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" /> Criar Pedido
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Resumo Financeiro */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-900/40 border-slate-800">
             <CardContent className="p-4">
               <p className="text-xs text-slate-500 uppercase font-bold mb-1">Valor Total Contrato</p>
               <p className="text-xl font-bold text-white">{formatCurrency(totalContract)}</p>
             </CardContent>
          </Card>
          <Card className="bg-slate-900/40 border-slate-800">
             <CardContent className="p-4">
               <p className="text-xs text-slate-500 uppercase font-bold mb-1">Total Medido (Geral)</p>
               <p className="text-xl font-bold text-emerald-400">{formatCurrency(totalMeasured)}</p>
             </CardContent>
          </Card>
          <Card className="bg-slate-900/40 border-slate-800">
             <CardContent className="p-4">
               <p className="text-xs text-slate-500 uppercase font-bold mb-1">Saldo Geral</p>
               <p className="text-xl font-bold text-amber-400">{formatCurrency(balance)}</p>
             </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="itens" className="w-full">
          <TabsList className="bg-slate-900 border-slate-800 mb-4">
            <TabsTrigger value="itens" className="data-[state=active]:bg-slate-800">
              <Package className="w-4 h-4 mr-2" /> Itens do Pedido Ativo
            </TabsTrigger>
            <TabsTrigger value="pedidos" className="data-[state=active]:bg-slate-800">
              <ClipboardList className="w-4 h-4 mr-2" /> Todos os Pedidos ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="medicoes" className="data-[state=active]:bg-slate-800">
              <FileText className="w-4 h-4 mr-2" /> Medições ({bms.length})
            </TabsTrigger>
          </TabsList>

          {/* Tab: Itens do Pedido Ativo */}
          <TabsContent value="itens">
            {!activeOrder ? (
              <div className="text-center py-10 bg-slate-900/20 rounded-lg border border-dashed border-slate-800">
                <p className="text-slate-400 mb-2">Nenhum pedido ativo selecionado.</p>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => {
                    console.log("Abrir modal criar pedido (aba itens)");
                    setShowNewOrder(true);
                  }} 
                  className="border-slate-700"
                >
                  Criar Novo Pedido
                </Button>
              </div>
            ) : (
              <Card className="bg-slate-900/40 border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-800/50 text-slate-400 uppercase">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Linha</th>
                        <th className="px-4 py-3 font-semibold">Descrição</th>
                        <th className="px-4 py-3 font-semibold text-center">Unid.</th>
                        <th className="px-4 py-3 font-semibold text-right">Qtd.</th>
                        <th className="px-4 py-3 font-semibold text-right">Vl. Unit.</th>
                        <th className="px-4 py-3 font-semibold text-right">Vl. Total</th>
                        <th className="px-4 py-3 text-center w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {orderLines.map((line) => {
                        const total = line.quantidade * line.valorUnitario;
                        return (
                          <tr key={line.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-3 font-mono font-medium text-white">{line.linha}</td>
                            <td className="px-4 py-3 max-w-xs truncate text-slate-300">{line.descricao}</td>
                            <td className="px-4 py-3 text-center text-slate-400">{line.unidade}</td>
                            <td className="px-4 py-3 text-right font-mono text-slate-300">{line.quantidade}</td>
                            <td className="px-4 py-3 text-right font-mono text-slate-300">{formatCurrency(line.valorUnitario)}</td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-white">{formatCurrency(total)}</td>
                            <td className="px-4 py-3 text-center">
                              <button onClick={() => handleDeleteLine(line.id)} className="text-slate-500 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </td>
                          </tr>
                        );
                      })}
                      {orderLines.length === 0 && (
                        <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Este pedido ainda não tem itens. Use o formulário abaixo para adicionar.</td></tr>
                      )}
                    </tbody>
                    <tfoot className="bg-slate-800/50 font-semibold text-white">
                      <tr>
                        <td colSpan={5} className="px-4 py-3 text-right">Total do Pedido:</td>
                        <td className="px-4 py-3 text-right font-mono text-emerald-400">{formatCurrency(totalOrder)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="p-4 bg-slate-900 border-t border-slate-800">
                  {!addingLine ? (
                    <Button 
                      type="button"
                      onClick={() => setAddingLine(true)} 
                      variant="ghost" 
                      className="text-slate-400 hover:text-white hover:bg-slate-800 w-full justify-start"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Adicionar Item ao Pedido
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                        <Input placeholder="Linha (ex: 1.0)" value={newLine.linha} onChange={e => setNewLine({...newLine, linha: e.target.value})} className="bg-slate-950 border-slate-700 text-white" />
                        <Input placeholder="Descrição" value={newLine.descricao} onChange={e => setNewLine({...newLine, descricao: e.target.value})} className="bg-slate-950 border-slate-700 text-white col-span-2" />
                        <Input placeholder="Unid." value={newLine.unidade} onChange={e => setNewLine({...newLine, unidade: e.target.value})} className="bg-slate-950 border-slate-700 text-white" />
                        <Input type="number" placeholder="Qtd" value={newLine.quantidade} onChange={e => setNewLine({...newLine, quantidade: e.target.value})} className="bg-slate-950 border-slate-700 text-white" />
                        <Input type="number" placeholder="Vl. Unit." value={newLine.valorUnitario} onChange={e => setNewLine({...newLine, valorUnitario: e.target.value})} className="bg-slate-950 border-slate-700 text-white" />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          type="button"
                          onClick={handleAddLine} 
                          size="sm" 
                          className="bg-rose-600 hover:bg-rose-700 text-white"
                        >
                          Salvar Item
                        </Button>
                        <Button 
                          type="button"
                          onClick={() => setAddingLine(false)} 
                          size="sm" 
                          variant="outline" 
                          className="border-slate-700 text-slate-300 hover:bg-slate-800"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Tab: Lista de Pedidos */}
          <TabsContent value="pedidos">
            <Card className="bg-slate-900/40 border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <h3 className="font-semibold text-white">Histórico de Pedidos</h3>
                <Button 
                  type="button"
                  onClick={() => {
                    console.log("Abrir modal criar pedido (aba pedidos)");
                    setShowNewOrder(true);
                  }} 
                  size="sm" 
                  className="bg-slate-800 hover:bg-slate-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-1" /> Novo Pedido
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-800/50 text-slate-400 uppercase">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Nº Pedido</th>
                      <th className="px-4 py-3 font-semibold">Descrição</th>
                      <th className="px-4 py-3 font-semibold">Data</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {orders.map((order) => (
                      <tr key={order.id} className={`hover:bg-slate-800/30 ${activeOrder?.id === order.id ? 'bg-emerald-500/5' : ''}`}>
                        <td className="px-4 py-3 font-mono font-bold text-white">{order.numeroPedido}</td>
                        <td className="px-4 py-3 text-slate-300">{order.descricao}</td>
                        <td className="px-4 py-3 text-slate-400">{formatDate(order.dataPedido)}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={order.status === 'ativo' ? 'text-emerald-400 border-emerald-500/30' : 'text-slate-400 border-slate-700'}>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {activeOrder?.id !== order.id ? (
                            <Button 
                              type="button"
                              onClick={() => handleSetActiveOrder(order)} 
                              size="sm" 
                              variant="ghost" 
                              className="text-blue-400 hover:text-blue-300 h-8 px-2"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" /> Ativar
                            </Button>
                          ) : (
                            <span className="text-xs text-emerald-500 flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Em uso</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Modal para novo pedido - VERSÃO CORRIGIDA */}
            {showNewOrder && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 p-4 backdrop-blur-sm">
                <Card className="bg-slate-900 border-slate-700 w-full max-w-md shadow-2xl shadow-black">
                  <CardHeader className="border-b border-slate-800 pb-4">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-white text-lg">Criar Novo Pedido</CardTitle>
                      <button 
                        type="button"
                        onClick={() => setShowNewOrder(false)}
                        className="text-slate-400 hover:text-white transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <div>
                      <Label className="text-slate-400 text-xs font-bold">Número do Pedido</Label>
                      <Input 
                        type="text"
                        value={newOrderForm.numeroPedido} 
                        onChange={e => setNewOrderForm({...newOrderForm, numeroPedido: e.target.value})} 
                        placeholder="Ex: 001 ou ADITIVO 01" 
                        className="bg-slate-950 border-slate-700 text-white mt-1.5 focus:border-rose-500 focus:ring-1 focus:ring-rose-500" 
                        autoFocus
                      />
                    </div>
                    <div>
                      <Label className="text-slate-400 text-xs font-bold">Descrição</Label>
                      <Input 
                        type="text"
                        value={newOrderForm.descricao} 
                        onChange={e => setNewOrderForm({...newOrderForm, descricao: e.target.value})} 
                        placeholder="Ex: Serviços Iniciais" 
                        className="bg-slate-950 border-slate-700 text-white mt-1.5 focus:border-rose-500 focus:ring-1 focus:ring-rose-500" 
                      />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <Button 
                        type="button"
                        onClick={() => setShowNewOrder(false)} 
                        variant="outline" 
                        className="border-slate-700 text-slate-300 hover:bg-slate-800"
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="button"
                        onClick={handleCreateOrder} 
                        className="bg-rose-600 hover:bg-rose-700 text-white"
                        disabled={!newOrderForm.numeroPedido}
                      >
                        Criar e Ativar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Tab: Medições */}
          <TabsContent value="medicoes">
            <Card className="bg-slate-900/40 border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-800/50 text-slate-400 uppercase">
                    <tr>
                      <th className="px-4 py-3 font-semibold">BM Nº</th>
                      <th className="px-4 py-3 font-semibold">Pedido Ref.</th>
                      <th className="px-4 py-3 font-semibold">Data Emissão</th>
                      <th className="px-4 py-3 font-semibold text-right">Valor</th>
                      <th className="px-4 py-3 font-semibold text-center">Status</th>
                      <th className="px-4 py-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {bms.sort((a, b) => b.numero - a.numero).map((bm) => {
                      const orderRef = orders.find(o => o.id === bm.orderId);
                      return (
                        <tr key={bm.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-white">#{String(bm.numero).padStart(3, '0')}</td>
                          <td className="px-4 py-3 text-slate-400 text-xs">{orderRef ? orderRef.numeroPedido : 'N/A'}</td>
                          <td className="px-4 py-3 text-slate-300">{formatDate(bm.dataEmissao)}</td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-white">{formatCurrency(bm.valorTotal)}</td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant={bm.status === 'finalizado' ? 'default' : 'secondary'} className="text-xs bg-slate-800">
                              {bm.status === 'finalizado' ? 'Finalizado' : 'Rascunho'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Button 
                              type="button"
                              size="sm" 
                              variant="ghost" 
                              onClick={() => navigate(`/contrato/${contract.id}/bm/${bm.id}`)} 
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <Eye className="w-4 h-4 mr-1" /> Ver
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                    {bms.length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Nenhuma medição emitida ainda.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
export default ContractDetail;