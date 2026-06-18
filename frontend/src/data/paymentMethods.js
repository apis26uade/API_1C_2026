export const PAYMENT_METHODS = [
  {
    id: 'credit',
    label: 'Tarjeta de credito',
    description: 'Visa, Mastercard, American Express',
    requiresCard: true,
  },
  {
    id: 'debit',
    label: 'Tarjeta de debito',
    description: 'Debito inmediato',
    requiresCard: true,
  },
  {
    id: 'transfer',
    label: 'Transferencia bancaria',
    description: 'Te enviaremos los datos por email',
    requiresCard: false,
  },
]
