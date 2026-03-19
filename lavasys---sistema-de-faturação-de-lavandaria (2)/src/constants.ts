export const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  processing: 'bg-blue-100 text-blue-800 border-blue-200',
  ready: 'bg-green-100 text-green-800 border-green-200',
  delivered: 'bg-gray-100 text-gray-800 border-gray-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  processing: 'Em Processamento',
  ready: 'Pronto',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};
