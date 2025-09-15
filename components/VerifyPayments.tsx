import React from 'react';
import { CreditCard, Check, X } from 'lucide-react';
import { Order, User as UserType, OrderStatus } from '../types';

interface VerifyPaymentsProps {
  orders: Order[];
  users: UserType[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

const VerifyPayments: React.FC<VerifyPaymentsProps> = ({ orders, users, onUpdateStatus }) => {
  const paymentsToVerify = orders.filter(o => o.status === OrderStatus.PAYMENT_VERIFIED);

  const getCustomerName = (customerId: number) => {
    return users.find(u => u.id === customerId)?.name || 'Unknown User';
  };

  const handleVerify = (orderId: string) => {
    onUpdateStatus(orderId, OrderStatus.FILE_REVIEW);
  };

  const handleReject = (orderId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menolak pembayaran ini? Status pesanan akan kembali ke "Menunggu Pembayaran".')) {
        onUpdateStatus(orderId, OrderStatus.WAITING_PAYMENT);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-slate-100 mb-6">Verifikasi Pembayaran</h2>
      <div className="overflow-x-auto">
        {paymentsToVerify.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Pelanggan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Tanggal Bayar</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {paymentsToVerify.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100">{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{getCustomerName(order.customer_id)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-slate-200 font-semibold">Rp {order.total_price.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                    <button 
                        onClick={() => handleVerify(order.id)} 
                        className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition inline-flex items-center gap-1"
                    >
                        <Check size={16}/> Verifikasi
                    </button>
                    <button 
                        onClick={() => handleReject(order.id)} 
                        className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition inline-flex items-center gap-1"
                    >
                        <X size={16}/> Tolak
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-slate-400">
            <CreditCard className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl">Tidak ada pembayaran yang perlu diverifikasi.</h3>
            <p>Semua pembayaran yang masuk sudah diproses.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyPayments;