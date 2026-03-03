// src/store/contractStore.ts
import { supabase } from '@/integrations/supabase/client';
import type { Contract, Order, OrderLine, BoletimMedicao, BMLine } from '@/types/contracts';

// --- CONTRATOS ---

export async function getContracts(): Promise<Contract[]> {
  const { data, error } = await supabase
    .from('cto_contracts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) { console.error('Erro ao buscar contratos:', error); return []; }
  
  return data.map(c => ({
    id: c.id, user_id: c.user_id, numero: c.numero, fornecedor: c.fornecedor, cnpj: c.cnpj,
    objeto: c.objeto, tipo: c.tipo, tipoLabel: c.tipo === 'servico' ? 'Prestação de Serviços' : 'Locação',
    valorTotal: c.valor_total, dataInicio: c.data_inicio, dataFim: c.data_fim, numeroPedido: c.numero_pedido,
  }));
}

export async function getContract(id: string): Promise<Contract | null> {
  const { data, error } = await supabase.from('cto_contracts').select('*').eq('id', id).single();
  if (error || !data) return null;
  return {
    id: data.id, user_id: data.user_id, numero: data.numero, fornecedor: data.fornecedor, cnpj: data.cnpj,
    objeto: data.objeto, tipo: data.tipo, tipoLabel: data.tipo === 'servico' ? 'Prestação de Serviços' : 'Locação',
    valorTotal: data.valor_total, dataInicio: data.data_inicio, dataFim: data.data_fim, numeroPedido: data.numero_pedido,
  };
}

export async function saveContract(contract: Contract): Promise<void> {
  const payload = {
    user_id: contract.user_id, numero: contract.numero, fornecedor: contract.fornecedor, cnpj: contract.cnpj,
    objeto: contract.objeto, tipo: contract.tipo, valor_total: contract.valorTotal,
    data_inicio: contract.dataInicio, data_fim: contract.dataFim, numero_pedido: contract.numeroPedido,
  };
  const { error } = await supabase.from('cto_contracts').insert(payload);
  if (error) throw error;
}

// --- PEDIDOS (ORDERS) ---

export async function getOrders(contractId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('cto_orders')
    .select('*')
    .eq('contract_id', contractId)
    .order('created_at', { ascending: true });

  if (error) { console.error('Erro ao buscar pedidos:', error); return []; }
  
  return data.map(o => ({
    id: o.id, contractId: o.contract_id, numeroPedido: o.numero_pedido, descricao: o.descricao,
    dataPedido: o.data_pedido, status: o.status, valorTotal: o.valor_total,
  }));
}

export async function getActiveOrder(contractId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('cto_orders')
    .select('*')
    .eq('contract_id', contractId)
    .eq('status', 'ativo')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return {
    id: data.id, contractId: data.contract_id, numeroPedido: data.numero_pedido, descricao: data.descricao,
    dataPedido: data.data_pedido, status: data.status, valorTotal: data.valor_total,
  };
}

export async function saveOrder(order: Order): Promise<void> {
  // Lógica de exclusividade: Se o novo pedido for 'ativo', marca os outros como 'concluido'
  // (Usamos 'concluido' porque a restrição do banco não aceita 'inativo')
  if (order.status === 'ativo') {
    await supabase
      .from('cto_orders')
      .update({ status: 'concluido' })
      .eq('contract_id', order.contractId)
      .neq('id', order.id); // Atualiza apenas os outros pedidos, não este
  }

  const payload = {
    contract_id: order.contractId,
    numero_pedido: order.numeroPedido,
    descricao: order.descricao,
    data_pedido: order.dataPedido,
    status: order.status,
    valor_total: order.valorTotal,
  };
  
  const { error } = await supabase.from('cto_orders').insert(payload);
  if (error) throw error;
}

// --- ORDER LINES (LINHAS DO PEDIDO) ---

export async function getOrderLines(orderId: string): Promise<OrderLine[]> {
  const { data, error } = await supabase
    .from('cto_order_lines')
    .select('*')
    .eq('order_id', orderId);

  if (error) return [];
  return data.map(l => ({
    id: l.id, orderId: l.order_id, linha: l.linha, descricao: l.descricao,
    unidade: l.unidade, quantidade: l.quantidade, valorUnitario: l.valor_unitario,
  }));
}

export async function saveOrderLine(line: OrderLine): Promise<void> {
  const { error } = await supabase.from('cto_order_lines').insert({
    order_id: line.orderId,
    linha: line.linha,
    descricao: line.descricao,
    unidade: line.unidade,
    quantidade: line.quantidade,
    valor_unitario: line.valorUnitario,
  });
  if (error) throw error;
}

export async function deleteOrderLine(lineId: string): Promise<void> {
  const { error } = await supabase.from('cto_order_lines').delete().eq('id', lineId);
  if (error) throw error;
}

// --- BOLETINS DE MEDIÇÃO (BM) ---

export async function getBMs(contractId?: string, orderId?: string): Promise<BoletimMedicao[]> {
  let query = supabase.from('cto_boletins_medicao').select(`*, cto_bm_lines (*)`);
  
  if (orderId) {
    query = query.eq('order_id', orderId);
  } else if (contractId) {
    query = query.eq('contract_id', contractId);
  }

  const { data, error } = await query.order('numero', { ascending: true });

  if (error) return [];

  return data.map(bm => ({
    id: bm.id,
    contractId: bm.contract_id,
    orderId: bm.order_id,
    numero: bm.numero,
    dataEmissao: bm.data_emissao,
    periodoInicio: bm.periodo_inicio,
    periodoFim: bm.periodo_fim,
    valorTotal: bm.valor_total,
    status: bm.status,
    linhas: (bm.cto_bm_lines || []).map((l: any) => ({
      orderLineId: l.order_line_id, linha: l.linha, descricao: l.descricao,
      unidade: l.unidade, quantidadeContratada: l.quantidade_contratada,
      valorUnitario: l.valor_unitario, valorTotalContrato: l.valor_total_contrato,
      acumuladoAnteriorQtd: l.acumulado_anterior_qtd, acumuladoAnteriorValor: l.acumulado_anterior_valor,
      medidoAtualQtd: l.medido_atual_qtd, medidoAtualValor: l.medido_atual_valor,
      acumuladoTotalQtd: l.acumulado_total_qtd, acumuladoTotalValor: l.acumulado_total_valor,
      saldoQtd: l.saldo_qtd, saldoValor: l.saldo_valor,
      execucaoPercent: l.execucao_percent, centroCusto: l.centro_custo,
    })),
  }));
}

export async function getBM(bmId: string): Promise<BoletimMedicao | null> {
  const { data, error } = await supabase
    .from('cto_boletins_medicao')
    .select(`*, cto_bm_lines (*)`)
    .eq('id', bmId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id, contractId: data.contract_id, orderId: data.order_id, numero: data.numero,
    dataEmissao: data.data_emissao, periodoInicio: data.periodo_inicio, periodoFim: data.periodo_fim,
    valorTotal: data.valor_total, status: data.status,
    linhas: (data.cto_bm_lines || []).map((l: any) => ({
      orderLineId: l.order_line_id, linha: l.linha, descricao: l.descricao,
      unidade: l.unidade, quantidadeContratada: l.quantidade_contratada,
      valorUnitario: l.valor_unitario, valorTotalContrato: l.valor_total_contrato,
      acumuladoAnteriorQtd: l.acumulado_anterior_qtd, acumuladoAnteriorValor: l.acumulado_anterior_valor,
      medidoAtualQtd: l.medido_atual_qtd, medidoAtualValor: l.medido_atual_valor,
      acumuladoTotalQtd: l.acumulado_total_qtd, acumuladoTotalValor: l.acumulado_total_valor,
      saldoQtd: l.saldo_qtd, saldoValor: l.saldo_valor,
      execucaoPercent: l.execucao_percent, centroCusto: l.centro_custo,
    })),
  };
}

export async function saveBM(bm: BoletimMedicao): Promise<void> {
  // Salva cabeçalho com order_id
  const { data: bmData, error: bmError } = await supabase
    .from('cto_boletins_medicao')
    .upsert({
      id: bm.id,
      contract_id: bm.contractId,
      order_id: bm.orderId,
      numero: bm.numero,
      data_emissao: bm.dataEmissao,
      periodo_inicio: bm.periodoInicio,
      periodo_fim: bm.periodoFim,
      valor_total: bm.valorTotal,
      status: bm.status,
    })
    .select()
    .single();

  if (bmError) throw bmError;

  // Deleta e reinsere linhas
  await supabase.from('cto_bm_lines').delete().eq('bm_id', bm.id);

  const linesToInsert = bm.linhas.map(l => ({
    bm_id: bm.id,
    order_line_id: l.orderLineId,
    linha: l.linha, descricao: l.descricao, unidade: l.unidade,
    quantidade_contratada: l.quantidadeContratada, valor_unitario: l.valorUnitario,
    valor_total_contrato: l.valorTotalContrato,
    acumulado_anterior_qtd: l.acumuladoAnteriorQtd, acumulado_anterior_valor: l.acumuladoAnteriorValor,
    medido_atual_qtd: l.medidoAtualQtd, medido_atual_valor: l.medidoAtualValor,
    acumulado_total_qtd: l.acumuladoTotalQtd, acumulado_total_valor: l.acumuladoTotalValor,
    saldo_qtd: l.saldoQtd, saldoValor: l.saldoValor,
    execucao_percent: l.execucaoPercent, centro_custo: l.centroCusto,
  }));

  if (linesToInsert.length > 0) {
    const { error: linesError } = await supabase.from('cto_bm_lines').insert(linesToInsert);
    if (linesError) throw linesError;
  }
}

export function getAccumulatedForLine(orderId: string, orderLineId: string, currentBMNumber?: number): { qtd: number; valor: number } {
  return { qtd: 0, valor: 0 }; 
}