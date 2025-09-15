import React from 'react';
import { OrderStatus } from '../types';

interface StatusBadgeProps {
  status: OrderStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusInfo = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', text: 'Menunggu' };
      case OrderStatus.WAITING_PAYMENT: return { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300', text: 'Menunggu Pembayaran' };
      case OrderStatus.PAYMENT_VERIFIED: return { color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300', text: 'Pembayaran Diterima' };
      case OrderStatus.FILE_REVIEW: return { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300', text: 'Review File' };
      case OrderStatus.APPROVED: return { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300', text: 'Disetujui' };
      case OrderStatus.REJECTED: return { color: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300', text: 'Ditolak' };
      case OrderStatus.PRINTING: return { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300', text: 'Sedang Dicetak' };
      case OrderStatus.COMPLETED: return { color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300', text: 'Selesai' };
      case OrderStatus.CANCELLED: return { color: 'bg-red-200 text-red-900 dark:bg-red-800/50 dark:text-red-200', text: 'Dibatalkan' };
      default: return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', text: status };
    }
  };

  const statusInfo = getStatusInfo(status);
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
      {statusInfo.text}
    </span>
  );
};

export default StatusBadge;