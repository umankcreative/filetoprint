import React, { useState } from 'react';
import { ArrowLeft, User, FileText, Settings, Hash, Calendar, DollarSign, Edit, Save, X, AlertCircle, CheckCircle, Loader, Package, Link } from 'lucide-react';
import { Order, User as UserType, Material, FinishingOption, OrderStatus } from '../types';
import StatusBadge from './StatusBadge';

interface OrderDetailsProps {
  order: Order;
  currentUser: UserType;
  users: UserType[];
  materials: Material[];
  finishingOptions: FinishingOption[];
  onUpdateStatus: (orderId: string, status: OrderStatus, reason?: string) => void;
  onBack: () => void;
}

const ProgressTracker: React.FC<{ status: OrderStatus }> = ({ status }) => {
    const steps = [
        { name: 'Pesanan Dibuat', statuses: [OrderStatus.WAITING_PAYMENT] },
        { name: 'Pembayaran & Review', statuses: [OrderStatus.PAYMENT_VERIFIED, OrderStatus.FILE_REVIEW] },
        { name: 'Proses Cetak', statuses: [OrderStatus.APPROVED, OrderStatus.PRINTING] },
        { name: 'Selesai', statuses: [OrderStatus.COMPLETED] },
    ];

    let activeStepIndex = steps.findIndex(step => step.statuses.includes(status));
    if (activeStepIndex === -1 && status === OrderStatus.COMPLETED) {
        activeStepIndex = steps.length - 1;
    }

    const isCancelledOrRejected = status === OrderStatus.CANCELLED || status === OrderStatus.REJECTED;

    return (
        <div className="mb-8 p-6 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-4">Lacak Pesanan</h3>
            <div className="flex items-center">
                {steps.map((step, index) => {
                    const isCompleted = !isCancelledOrRejected && index < activeStepIndex;
                    const isActive = !isCancelledOrRejected && index === activeStepIndex;
                    const isFuture = !isCancelledOrRejected && index > activeStepIndex;

                    return (
                        <React.Fragment key={step.name}>
                            <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    isCompleted ? 'bg-green-500 text-white' : 
                                    isActive ? 'bg-blue-500 text-white animate-pulse' :
                                    isCancelledOrRejected ? 'bg-red-200 text-red-600' : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-300'
                                }`}>
                                    {isCompleted ? <CheckCircle size={24} /> : 
                                     isActive ? <Loader size={24} className="animate-spin"/> :
                                     <Package size={24}/>}
                                </div>
                                <p className={`mt-2 text-xs text-center font-medium ${
                                    isActive ? 'text-blue-600 dark:text-blue-400' : isCancelledOrRejected ? 'text-red-600' : 'text-gray-600 dark:text-slate-300'
                                }`}>{step.name}</p>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`flex-1 h-1 mx-2 ${
                                    isCompleted ? 'bg-green-500' : 
                                    isCancelledOrRejected ? 'bg-red-200' : 'bg-gray-300 dark:bg-gray-600'
                                }`}></div>
                            )}
                        </React.Fragment>
                    )
                })}
            </div>
             {isCancelledOrRejected && (
                <div className="mt-4 text-center text-red-600 font-semibold">
                    Pesanan ini telah {status === OrderStatus.REJECTED ? 'ditolak' : 'dibatalkan'}.
                </div>
            )}
        </div>
    );
};


const OrderDetails: React.FC<OrderDetailsProps> = ({ order, currentUser, users, materials, finishingOptions, onUpdateStatus, onBack }) => {
  const customer = users.find(u => u.id === order.customer_id);
  const material = materials.find(m => m.id === order.material_id);
  const finishing = order.finishing.map(id => finishingOptions.find(f => f.id === id)).filter(Boolean) as FinishingOption[];

  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>(order.status);
  const [rejectionReason, setRejectionReason] = useState(order.rejection_reason || '');

  const handleStatusSave = () => {
    onUpdateStatus(order.id, newStatus, newStatus === OrderStatus.REJECTED ? rejectionReason : undefined);
    setIsEditingStatus(false);
  };

  const isAdmin = currentUser.user_type === 'admin';
  const isCustomer = currentUser.user_type === 'customer';

  const inputStyles = "w-full border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-md px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500";

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg animate-fade-in">
      <div className="flex items-center justify-between mb-6 border-b dark:border-slate-700 pb-4">
        <div>
          <button onClick={onBack} className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition mb-2">
            <ArrowLeft size={20} className="mr-2" />
            Kembali ke Daftar Pesanan
          </button>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-slate-100">Detail Pesanan #{order.id}</h2>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {isCustomer && <ProgressTracker status={order.status} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Order Specs */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-4 border dark:border-slate-700 rounded-lg">
            <h3 className="font-semibold text-lg text-gray-700 dark:text-slate-200 mb-3 flex items-center"><Settings className="mr-2 text-blue-500 dark:text-blue-400"/>Spesifikasi Pesanan</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-slate-300">
              <div><strong>Kategori:</strong> <span className="capitalize">{String(order.category).replace('_', ' ')}</span></div>
              <div>
                <strong>File:</strong> 
                {order.file_url ? (
                  <a href={order.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                     <Link size={14}/> Tautan Eksternal
                  </a>
                ) : (
                  ` ${order.file_name}`
                )}
              </div>
              <div><strong>Bahan:</strong> {material?.name || 'N/A'}</div>
              <div><strong>Jenis Cetak:</strong> {order.printing_type === 'color' ? 'Berwarna' : 'Hitam Putih'}</div>
              { (order.category === 'document' || order.category === 'business_card') && <>
                <div><strong>Jumlah:</strong> {order.copies} {order.category === 'business_card' ? 'box' : ''}</div>
                <div><strong>Ukuran Kertas:</strong> {order.paper_size}</div>
              </>}
              { order.category === 'banner' && <>
                <div><strong>Lebar:</strong> {order.custom_width} m</div>
                <div><strong>Tinggi:</strong> {order.custom_height} m</div>
              </>}
              <div><strong>Finishing:</strong> {finishing.length > 0 ? finishing.map(f => f.name).join(', ') : 'Tidak ada'}</div>
            </div>
          </div>
          {order.special_instructions && (
            <div className="p-4 border dark:border-slate-700 rounded-lg">
              <h3 className="font-semibold text-lg text-gray-700 dark:text-slate-200 mb-2 flex items-center"><Edit className="mr-2 text-blue-500 dark:text-blue-400"/>Instruksi Khusus</h3>
              <p className="text-gray-600 dark:text-slate-300 italic">"{order.special_instructions}"</p>
            </div>
          )}
          {order.status === OrderStatus.REJECTED && order.rejection_reason && (
             <div className="p-4 bg-red-50 dark:bg-red-500/10 border-l-4 border-red-400 text-red-700 dark:text-red-300">
                <p className="font-bold flex items-center"><AlertCircle className="mr-2"/>Alasan Penolakan</p>
                <p className="text-sm">{order.rejection_reason}</p>
              </div>
          )}
        </div>

        {/* Right Column: Customer & Status */}
        <div className="space-y-6">
          <div className="p-4 border dark:border-slate-700 rounded-lg">
            <h3 className="font-semibold text-lg text-gray-700 dark:text-slate-200 mb-3 flex items-center"><User className="mr-2 text-blue-500 dark:text-blue-400"/>Informasi Pelanggan</h3>
            <div className="space-y-1 text-sm text-gray-600 dark:text-slate-300">
              <p><strong>Nama:</strong> {customer?.name || 'N/A'}</p>
              <p><strong>Email:</strong> {customer?.email || 'N/A'}</p>
            </div>
          </div>
          <div className="p-4 border dark:border-slate-700 rounded-lg">
            <h3 className="font-semibold text-lg text-gray-700 dark:text-slate-200 mb-3 flex items-center"><Calendar className="mr-2 text-blue-500 dark:text-blue-400"/>Ringkasan</h3>
            <div className="space-y-1 text-sm text-gray-600 dark:text-slate-300">
              <p><strong>Tanggal Pesan:</strong> {new Date(order.created_at).toLocaleString()}</p>
              <p className="font-bold text-lg mt-2 flex items-center"><DollarSign size={18} className="mr-1 text-green-600 dark:text-green-400"/>Total: <span className="text-green-600 dark:text-green-400 ml-2">Rp {order.total_price.toLocaleString()}</span></p>
            </div>
          </div>
          
          {isAdmin && (
            <div className="p-4 border dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-700/50">
              <h3 className="font-semibold text-lg text-gray-700 dark:text-slate-200 mb-3 flex items-center"><Edit className="mr-2 text-blue-500 dark:text-blue-400"/>Kelola Status</h3>
              {!isEditingStatus ? (
                <div className="flex justify-between items-center">
                   <StatusBadge status={order.status} />
                   <button onClick={() => setIsEditingStatus(true)} className="text-sm bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600">Ubah</button>
                </div>
              ) : (
                <div className="space-y-3">
                    <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as OrderStatus)} className={inputStyles}>
                       {Object.values(OrderStatus).map(s => <option key={s} value={s} className="capitalize">{s.replace(/_/g, ' ')}</option>)}
                    </select>
                    {newStatus === OrderStatus.REJECTED && (
                        <textarea 
                           value={rejectionReason} 
                           onChange={(e) => setRejectionReason(e.target.value)}
                           placeholder="Masukkan alasan penolakan..."
                           className={inputStyles}
                           rows={2}
                        />
                    )}
                   <div className="flex items-center gap-2">
                       <button onClick={handleStatusSave} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 flex items-center gap-1 text-sm"><Save size={14}/> Simpan</button>
                       <button onClick={() => setIsEditingStatus(false)} className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 flex items-center gap-1 text-sm"><X size={14}/> Batal</button>
                   </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;