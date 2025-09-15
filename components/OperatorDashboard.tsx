import React from 'react';
import { FileCheck, Printer, CheckSquare, Clock, ArrowUp, ArrowDown } from 'lucide-react';
import { OperatorData, OperatorTask } from '../types';
import StatusBadge from './StatusBadge';

interface OperatorDashboardProps {
  operatorData: OperatorData | null;
  onViewTask: (task: OperatorTask) => void;
  onViewFileReviewQueue: () => void;
}

const OperatorDashboard: React.FC<OperatorDashboardProps> = ({ operatorData, onViewTask, onViewFileReviewQueue }) => {
  if (!operatorData) {
    return (
        <div className="flex justify-center items-center h-64">
            <Clock className="animate-spin h-8 w-8 text-gray-500 dark:text-slate-400" />
            <p className="ml-4 text-gray-600 dark:text-slate-300">Loading dashboard data...</p>
        </div>
    );
  }

  const { queueStats, tasks } = operatorData;

  const StatCard = ({ title, value, icon: Icon, change, changeType, action }: { title: string, value: number, icon: React.ElementType, change: number, changeType: 'increase' | 'decrease', action?: () => void }) => (
    <div 
        className={`bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex items-center ${action ? 'cursor-pointer hover:shadow-xl transition-shadow' : ''}`} 
        onClick={action}
    >
        <div className={`p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-6`}>
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
            <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100 mb-4">Operator Report</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Perlu Direview" value={queueStats.filesToReview} icon={FileCheck} change={3} changeType="increase" action={onViewFileReviewQueue} />
                <StatCard title="Antrian Cetak" value={queueStats.printQueue} icon={Printer} change={1} changeType="decrease" />
                <StatCard title="Selesai Hari Ini" value={queueStats.completedToday} icon={CheckSquare} change={15} changeType="increase" />
            </div>
        </div>
      
      {/* Task Queue */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-100 mb-4">Antrian Tugas Anda</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Order ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Pelanggan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">File</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Masuk</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Status Tugas</th>
                <th className="relative px-4 py-3"><span className="sr-only">Aksi</span></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {tasks.length > 0 ? (
                tasks.map(task => (
                  <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100">{task.id}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{task.customer_name}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400 truncate max-w-xs">{task.file_name}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{new Date(task.submitted_at).toLocaleString()}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => onViewTask(task)} className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">
                        {task.status === 'FILE_REVIEW' ? 'Review File' : 'Lihat Detail'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500 dark:text-slate-400">
                    Tidak ada tugas aktif saat ini.
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

export default OperatorDashboard;