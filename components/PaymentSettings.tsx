import React, { useState } from 'react';
import { PlusCircle, Edit, Trash2, Banknote, QrCode, Wallet, Power } from 'lucide-react';
import { PaymentMethod, PaymentMethodType } from '../types';
import PaymentMethodFormModal from './PaymentMethodFormModal';

interface PaymentSettingsProps {
  paymentMethods: PaymentMethod[];
  onAdd: (method: Omit<PaymentMethod, 'id'>) => void;
  onUpdate: (method: PaymentMethod) => void;
  onDelete: (methodId: number) => void;
}

const getMethodIcon = (type: PaymentMethodType) => {
    switch(type) {
        case PaymentMethodType.BANK_TRANSFER: return <Banknote className="h-6 w-6 text-blue-500" />;
        case PaymentMethodType.QRIS: return <QrCode className="h-6 w-6 text-purple-500" />;
        case PaymentMethodType.E_WALLET: return <Wallet className="h-6 w-6 text-green-500" />;
        default: return <Banknote className="h-6 w-6 text-gray-500" />;
    }
}

const PaymentSettings: React.FC<PaymentSettingsProps> = ({ paymentMethods, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [methodToEdit, setMethodToEdit] = useState<PaymentMethod | null>(null);

  const handleOpenModal = (method?: PaymentMethod) => {
    setMethodToEdit(method || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setMethodToEdit(null);
    setIsModalOpen(false);
  };

  const handleSubmit = (method: Omit<PaymentMethod, 'id'> | PaymentMethod) => {
    if ('id' in method) {
      onUpdate(method);
    } else {
      onAdd(method);
    }
  };
  
  const handleToggleActive = (method: PaymentMethod) => {
      onUpdate({ ...method, active: !method.active });
  }

  const handleDelete = (methodId: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus metode pembayaran ini?')) {
      onDelete(methodId);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-slate-100">Pengaturan Pembayaran</h2>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <PlusCircle size={20} />
          Tambah Metode
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paymentMethods.map(method => (
            <div key={method.id} className="border dark:border-slate-700 rounded-lg shadow-md transition-all hover:shadow-lg dark:hover:border-blue-500/50">
                <div className="p-4">
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            {getMethodIcon(method.type)}
                            <div>
                                <h3 className="font-bold text-lg text-gray-800 dark:text-slate-100">{method.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-slate-400">{method.type}</p>
                            </div>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={method.active} onChange={() => handleToggleActive(method)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    <div className="mt-4 pt-4 border-t dark:border-slate-600 text-sm text-gray-600 dark:text-slate-300 space-y-1">
                        {Object.entries(method.details).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                                <span className="capitalize font-medium text-gray-500 dark:text-slate-400">{key.replace(/([A-Z])/g, ' $1')}:</span>
                                <span>{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
                 <div className="bg-gray-50 dark:bg-slate-700/50 px-4 py-2 flex justify-end gap-2">
                     <button onClick={() => handleOpenModal(method)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50">
                        <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(method.id)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50">
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        ))}
      </div>
      
      <PaymentMethodFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        methodToEdit={methodToEdit}
      />
    </div>
  );
};

export default PaymentSettings;