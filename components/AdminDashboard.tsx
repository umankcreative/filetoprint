import React from 'react';
import { Package, DollarSign, Clock, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import { AdminData, AdminRecentOrder } from '../types';
import StatusBadge from './StatusBadge';

interface AdminDashboardProps {
  adminData: AdminData | null;
  onViewOrders: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ adminData, onViewOrders }) => {
  if (!adminData) {
    return (
        <div className="flex justify-center items-center h-64">
            <Clock className="animate-spin h-8 w-8 text-gray-500 dark:text-slate-400" />
            <p className="ml-4 text-gray-600 dark:text-slate-300">Loading dashboard data...</p>
        </div>
    );
  }

  const { dashboardStats, recentOrders } = adminData;

  const StatCard = ({ title, value, icon: Icon, change, changeType, isCurrency = false }: { title: string, value: number | string, icon: React.ElementType, change: number, changeType: 'increase' | 'decrease', isCurrency?: boolean }) => (
     <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center">
            <div>
                <p className="text-3xl font-bold text-gray-800 dark:text-slate-100">{isCurrency ? `${(value as number).toLocaleString('de-DE')}` : value}</p>
                <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">{title}</p>
            </div>
            <div className={`ml-auto flex items-center text-sm font-bold px-2 py-1 rounded-full ${changeType === 'increase' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'}`}>
                {change}%
                {changeType === 'increase' ? <ArrowUp size={14} className="ml-1"/> : <ArrowDown size={14} className="ml-1"/>}
            </div>
        </div>
     </div>
  );
  
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stat Cards */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100 mb-4">General Report</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Pesanan Baru" value={dashboardStats.newOrders} icon={Package} change={12} changeType="increase" />
            <StatCard title="Pending Bayar" value={dashboardStats.pendingPayments} icon={Clock} change={5} changeType="decrease" />
            <StatCard title="Dalam Proses" value={dashboardStats.inProgress} icon={TrendingUp} change={8} changeType="increase" />
            <StatCard title="Revenue (Rp)" value={dashboardStats.dailyRevenue} icon={DollarSign} change={20} changeType="increase" isCurrency />
        </div>
      </div>
      
      {/* Recent Orders Table */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-100">Aktivitas Pesanan Terbaru</h3>
          <button onClick={onViewOrders} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Lihat Semua</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Order ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Pelanggan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Tanggal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {recentOrders.length > 0 ? (
                recentOrders.map((order: AdminRecentOrder) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100">{order.id}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{order.customer_name}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300">Rp {order.total_price.toLocaleString()}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-500 dark:text-slate-400">
                    Belum ada aktivitas pesanan terbaru.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;