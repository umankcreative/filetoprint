import React from 'react';
import { Package, Clock, CheckCircle, FileText, ArrowUp, ArrowDown } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import StatusBadge from './StatusBadge';

interface CustomerDashboardProps {
  orders: Order[];
  onViewOrders: () => void;
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ orders, onViewOrders }) => {
  const totalOrders = orders.length;
  const inProgressOrders = orders.filter(o => 
    o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELLED && o.status !== OrderStatus.REJECTED
  ).length;
  const completedOrders = orders.filter(o => o.status === OrderStatus.COMPLETED).length;
  const recentOrders = orders.slice(0, 3);

  const StatCard = ({ title, value, icon: Icon, change, changeType }: { title: string, value: number, icon: React.ElementType, change: number, changeType: 'increase' | 'decrease' }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex items-center">
        <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-6">
            <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
            <p className="text-3xl font-bold text-gray-800 dark:text-slate-100">{value}</p>
            <p className="text-gray-500 dark:text-slate-400 text-sm">{title}</p>
        </div>
        <div className={`ml-auto flex items-center text-sm font-bold px-2 py-1 rounded-full ${changeType === 'increase' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'}`}>
            {change}%
            {changeType === 'increase' ? <ArrowUp size={14} className="ml-1"/> : <ArrowDown size={14} className="ml-1"/>}
        </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100 mb-4">General Report</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Total Pesanan" value={totalOrders} icon={Package} change={5} changeType="increase"/>
            <StatCard title="Sedang Diproses" value={inProgressOrders} icon={Clock} change={2} changeType="decrease"/>
            <StatCard title="Selesai" value={completedOrders} icon={CheckCircle} change={10} changeType="increase"/>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-100">Pesanan Terbaru</h3>
            <button onClick={onViewOrders} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Lihat Semua</button>
        </div>
        <div className="space-y-4">
          {recentOrders.length > 0 ? (
            recentOrders.map(order => (
            <div key={order.id} className="flex items-center justify-between p-4 border dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50">
              <div className="flex items-center space-x-4">
                <FileText className="h-6 w-6 text-gray-500 dark:text-slate-400" />
                <div>
                  <p className="font-medium text-gray-800 dark:text-slate-200">{order.id}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{order.file_name}</p>
                </div>
              </div>
              <div className="text-right">
                <StatusBadge status={order.status} />
                <p className="text-sm font-semibold text-gray-700 dark:text-slate-300 mt-1">Rp {order.total_price.toLocaleString()}</p>
              </div>
            </div>
          ))
          ) : (
            <p className="text-center text-gray-500 dark:text-slate-400 py-4">Anda belum memiliki pesanan.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;