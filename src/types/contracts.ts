// src/types/contracts.ts

export interface Contract {
  id: string;
  user_id: string;
  numero: string;
  fornecedor: string;
  cnpj: string;
  objeto: string;
  tipo: 'servico' | 'locacao';
  tipoLabel: string;
  valorTotal: number; // Valor total do contrato (soma de todos os pedidos ou valor estimado)
  dataInicio: string;
  dataFim: string;
  numeroPedido: string; // Legacy, pode ser removido depois
}

// NOVA: Tabela de Pedidos
export interface Order {
  id: string;
  contractId: string;
  numeroPedido: string; // Ex: "001", "ADITIVO 1"
  descricao: string;
  dataPedido: string;
  status: 'ativo' | 'concluido' | 'cancelado';
  valorTotal: number;
}

// AJUSTADA: Agora pertence a um Pedido (order_id)
export interface OrderLine {
  id: string;
  orderId: string; // Antes era contractId
  linha: string;
  descricao: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
}

export interface BMLine {
  orderLineId: string; // ID da linha do pedido original
  linha: string;
  descricao: string;
  unidade: string;
  quantidadeContratada: number;
  valorUnitario: number;
  valorTotalContrato: number;
  acumuladoAnteriorQtd: number;
  acumuladoAnteriorValor: number;
  medidoAtualQtd: number;
  medidoAtualValor: number;
  acumuladoTotalQtd: number;
  acumuladoTotalValor: number;
  saldoQtd: number;
  saldoValor: number;
  execucaoPercent: number;
  centroCusto: string;
}

export interface BoletimMedicao {
  id: string;
  contractId: string;
  orderId: string; // NOVO: Vínculo com o pedido específico
  numero: number;
  dataEmissao: string;
  periodoInicio: string;
  periodoFim: string;
  valorTotal: number;
  linhas: BMLine[];
  status: 'rascunho' | 'finalizado';
}