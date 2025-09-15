import React, { useState, useEffect } from 'react';
import { PaymentMethod, PaymentMethodType } from '../types';
import { X, Save } from 'lucide-react';

interface PaymentMethodFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (method: Omit<PaymentMethod, 'id'> | PaymentMethod) => void;
  methodToEdit?: PaymentMethod | null;
}

const PaymentMethodFormModal: React.FC<PaymentMethodFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  methodToEdit,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<PaymentMethodType>(PaymentMethodType.BANK_TRANSFER);
  const [details, setDetails] = useState<{ [key: string]: string }>({});
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (methodToEdit) {
      setName(methodToEdit.name);
      setType(methodToEdit.type);
      setDetails(methodToEdit.details);
      setActive(methodToEdit.active);
    } else {
      // Reset form to default state for a new entry
      setName('');
      setType(PaymentMethodType.BANK_TRANSFER);
      setDetails({ bankName: '', accountHolder: '', accountNumber: '' });
      setActive(true);
    }
  }, [methodToEdit, isOpen]);

  // Adjust details fields when type changes
  useEffect(() => {
    if (!methodToEdit) { // Only auto-adjust for new entries
        if (type === PaymentMethodType.BANK_TRANSFER) {
            setDetails({ bankName: '', accountHolder: '', accountNumber: '' });
        } else if (type === PaymentMethodType.QRIS) {
            setDetails({ info: '' });
        } else if (type === PaymentMethodType.E_WALLET) {
            setDetails({ accountHolder: '', accountNumber: '' });
        }
    }
  }, [type, methodToEdit]);

  const handleDetailChange = (key: string, value: string) => {
    setDetails(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const methodData = { name, type, details, active };
    if (methodToEdit) {
      onSubmit({ ...methodData, id: methodToEdit.id });
    } else {
      onSubmit(methodData);
    }
    onClose();
  };

  if (!isOpen) return null;
  
  const inputStyles = "mt-1 block w-full border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500";
  const labelStyles = "block text-sm font-medium text-gray-700 dark:text-slate-300";

  const renderDetailFields = () => {
    switch (type) {
      case PaymentMethodType.BANK_TRANSFER:
        return (
          <>
            <div>
              <label className={labelStyles}>Nama Bank</label>
              <input type="text" value={details.bankName || ''} onChange={e => handleDetailChange('bankName', e.target.value)} className={inputStyles} required />
            </div>
            <div>
              <label className={labelStyles}>Nama Pemilik Rekening</label>
              <input type="text" value={details.accountHolder || ''} onChange={e => handleDetailChange('accountHolder', e.target.value)} className={inputStyles} required />
            </div>
            <div>
              <label className={labelStyles}>Nomor Rekening</label>
              <input type="text" value={details.accountNumber || ''} onChange={e => handleDetailChange('accountNumber', e.target.value)} className={inputStyles} required />
            </div>
          </>
        );
      case PaymentMethodType.QRIS:
        return (
          <div>
            <label className={labelStyles}>Informasi Tambahan</label>
            <textarea value={details.info || ''} onChange={e => handleDetailChange('info', e.target.value)} className={inputStyles} rows={3} placeholder="Contoh: Scan QR dengan aplikasi e-wallet Anda." />
          </div>
        );
      case PaymentMethodType.E_WALLET:
        return (
          <>
            <div>
              <label className={labelStyles}>Nama Pemilik Akun</label>
              <input type="text" value={details.accountHolder || ''} onChange={e => handleDetailChange('accountHolder', e.target.value)} className={inputStyles} required />
            </div>
            <div>
              <label className={labelStyles}>Nomor Telepon Terdaftar</label>
              <input type="text" value={details.accountNumber || ''} onChange={e => handleDetailChange('accountNumber', e.target.value)} className={inputStyles} required />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100">
            {methodToEdit ? 'Edit Metode Pembayaran' : 'Tambah Metode Baru'}
          </h2>
          <button onClick={onClose} className="text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelStyles}>Nama Metode (e.g. BCA Transfer, GoPay)</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required className={inputStyles} />
          </div>
          <div>
            <label className={labelStyles}>Tipe Metode</label>
            <select value={type} onChange={e => setType(e.target.value as PaymentMethodType)} className={inputStyles}>
              {Object.values(PaymentMethodType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          
          {renderDetailFields()}

          <div className="flex items-center">
            <input id="active-toggle" type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <label htmlFor="active-toggle" className="ml-2 block text-sm text-gray-900 dark:text-slate-300">Aktifkan metode pembayaran ini</label>
          </div>
          
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-800 dark:bg-slate-600 dark:text-slate-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-slate-500 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Save size={16} />
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentMethodFormModal;