// src/lib/formatters.ts

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString + 'T00:00:00'); // Força hora local para evitar timezone shift
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

export const formatPercent = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

export const daysRemaining = (dateString: string): number => {
  if (!dateString) return 0;
  const targetDate = new Date(dateString + 'T23:59:59');
  const today = new Date();
  // Zera as horas de hoje para comparação justa
  today.setHours(0, 0, 0, 0);
  
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};