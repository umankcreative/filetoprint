import React from 'react';
import { FileSearch, User, Calendar, ArrowLeft, Package } from 'lucide-react';
import { Order, User as UserType } from '../types';

interface FileReviewQueueProps {
  ordersToReview: Order[];
  users: UserType[];
  onReviewOrder: (order: Order) => void;
  onBack: () => void;
}

const FileReviewQueue: React.FC<FileReviewQueueProps> = ({ ordersToReview, users, onReviewOrder, onBack }) => {

  const getCustomerName = (customerId: number) => {
    return users.find(u => u.id === customerId)?.name || 'Unknown User';
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg animate-fade-in">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 mr-4">
            <ArrowLeft className="text-gray-600 dark:text-slate-300" />
        </button>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-slate-100">Antrian Review File</h2>
      </div>

      <div className="overflow-x-auto">
        {ordersToReview.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Pelanggan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">File</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Tanggal Masuk</th>
                <th className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {ordersToReview.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100">{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{getCustomerName(order.customer_id)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400 truncate max-w-md">{order.file_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{new Date(order.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => onReviewOrder(order)} 
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition text-sm flex items-center gap-2"
                    >
                      <FileSearch size={16} /> Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-slate-400">
            <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl">Tidak ada file yang perlu direview.</h3>
            <p>Semua pesanan yang masuk sudah diproses.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileReviewQueue;