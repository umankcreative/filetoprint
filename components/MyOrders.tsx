import React, { useState } from 'react';
// FIX: Import the 'X' icon from lucide-react to be used for closing the modal.
import { Package, CreditCard, AlertCircle, Eye, Clipboard, QrCode, X } from 'lucide-react';
import { Order, OrderStatus, PaymentMethod } from '../types';
import StatusBadge from './StatusBadge';

interface MyOrdersProps {
  orders: Order[];
  paymentMethods: PaymentMethod[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onViewDetails: (order: Order) => void;
}

const MyOrders: React.FC<MyOrdersProps> = ({ orders, paymentMethods, onUpdateStatus, onViewDetails }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);

  const handleShowPaymentModal = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
    setSelectedPaymentMethod(null);
  };

  const handleConfirmPayment = () => {
    if (selectedOrder) {
      alert(`Konfirmasi pembayaran untuk order ${selectedOrder.id} telah diterima. Pesanan Anda akan segera diproses setelah verifikasi oleh admin.`);
      onUpdateStatus(selectedOrder.id, OrderStatus.PAYMENT_VERIFIED);
      handleCloseModal();
    }
  };
    
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Nomor rekening disalin!');
  };

  const activePaymentMethods = paymentMethods.filter(pm => pm.active);

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg animate-fade-in">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-slate-100 mb-6">Pesanan Saya</h2>
        <div className="space-y-4">
            {orders.length > 0 ? (
                orders.map(order => (
                    <div key={order.id} className="border dark:border-slate-700 rounded-lg p-4 transition-all hover:shadow-md dark:hover:bg-slate-700/50">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div className="flex items-center space-x-4 mb-4 md:mb-0">
                                <Package className="h-10 w-10 text-blue-500 dark:text-blue-400" />
                                <div>
                                    <p className="font-bold text-lg text-gray-900 dark:text-slate-100">{order.id}</p>
                                    <p className="text-sm text-gray-500 dark:text-slate-400">{order.file_name} - Dipesan pada {new Date(order.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-start md:items-end w-full md:w-auto">
                                <div className="flex items-center gap-4 mb-2">
                                    <p className="font-semibold text-lg text-gray-800 dark:text-slate-200">Rp {order.total_price.toLocaleString()}</p>
                                    <StatusBadge status={order.status} />
                                </div>
                                <div className="flex items-center gap-2">
                                    {order.status === OrderStatus.WAITING_PAYMENT && (
                                        <button
                                            onClick={() => handleShowPaymentModal(order)}
                                            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition text-sm flex items-center gap-2"
                                        >
                                            <CreditCard size={16} /> Bayar Sekarang
                                        </button>
                                    )}
                                     <button
                                        onClick={() => onViewDetails(order)}
                                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition text-sm flex items-center gap-2"
                                    >
                                        <Eye size={16} /> Lihat Detail
                                    </button>
                                </div>
                            </div>
                        </div>
                        {order.status === OrderStatus.REJECTED && order.rejection_reason && (
                            <div className="mt-4 p-3 bg-red-50 dark:bg-red-500/10 border-l-4 border-red-400 text-red-700 dark:text-red-300 flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 mt-0.5" />
                                <div>
                                    <p className="font-bold">Pesanan Ditolak</p>
                                    <p className="text-sm">{order.rejection_reason}</p>
                                </div>
                            </div>
                        )}
                    </div>
                ))
            ) : (
                <div className="text-center py-12 text-gray-500 dark:text-slate-400">
                    <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-xl">Anda belum memiliki pesanan.</h3>
                    <p>Mulai buat pesanan baru sekarang!</p>
                </div>
            )}
        </div>
        {isModalOpen && selectedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in p-4">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-lg relative">
                    <button onClick={handleCloseModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X size={24}/>
                    </button>
                    <div className="text-center">
                        <CreditCard className="mx-auto h-12 w-12 text-blue-500 dark:text-blue-400 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Lakukan Pembayaran</h2>
                        <p className="text-gray-600 dark:text-slate-400">Total Tagihan: <span className="font-bold text-blue-600 dark:text-blue-400">Rp {selectedOrder.total_price.toLocaleString()}</span></p>
                    </div>

                    {!selectedPaymentMethod ? (
                        <div className="mt-6">
                             <h3 className="font-semibold text-gray-700 dark:text-slate-200 mb-4">Pilih Metode Pembayaran:</h3>
                             <div className="space-y-3">
                                {activePaymentMethods.map(method => (
                                    <button key={method.id} onClick={() => setSelectedPaymentMethod(method)} className="w-full text-left p-4 border dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 flex justify-between items-center">
                                        <div>
                                            <p className="font-bold dark:text-slate-100">{method.name}</p>
                                            <p className="text-sm text-gray-500 dark:text-slate-400">{method.type}</p>
                                        </div>
                                        <div className="text-blue-500">→</div>
                                    </button>
                                ))}
                             </div>
                        </div>
                    ) : (
                        <div className="mt-6 text-center bg-gray-50 dark:bg-slate-700/50 p-6 rounded-lg">
                            <h3 className="font-semibold text-lg text-gray-800 dark:text-slate-100 mb-4">Instruksi Pembayaran {selectedPaymentMethod.name}</h3>
                            {selectedPaymentMethod.type === 'Bank Transfer' && (
                                <div className="space-y-2 text-gray-700 dark:text-slate-300">
                                    <p>Silakan transfer ke rekening berikut:</p>
                                    <p className="font-bold text-xl">{selectedPaymentMethod.details.bankName}</p>
                                    <div className="flex items-center justify-center bg-white dark:bg-slate-800 p-3 rounded-md">
                                        <p className="text-lg font-mono mr-4">{selectedPaymentMethod.details.accountNumber}</p>
                                        <button onClick={() => copyToClipboard(selectedPaymentMethod.details.accountNumber)} className="text-blue-500 hover:text-blue-700">
                                            <Clipboard size={18}/>
                                        </button>
                                    </div>
                                    <p>a.n. {selectedPaymentMethod.details.accountHolder}</p>
                                </div>
                            )}
                            {selectedPaymentMethod.type === 'QRIS' && (
                                <div className="space-y-2 text-gray-700 dark:text-slate-300">
                                    <p>{selectedPaymentMethod.details.info}</p>
                                    <div className="flex justify-center">
                                         <div className="bg-white p-2 rounded-md inline-block">
                                            <QrCode size={128} className="text-black" />
                                         </div>
                                    </div>
                                    <p className="text-xs">Ini adalah contoh QR Code</p>
                                </div>
                            )}
                            <div className="mt-6 flex flex-col items-center gap-4">
                                <button
                                    onClick={handleConfirmPayment}
                                    className="w-full bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition font-bold"
                                >
                                Saya Sudah Bayar
                                </button>
                                <button
                                    onClick={() => setSelectedPaymentMethod(null)}
                                    className="text-sm text-gray-500 dark:text-slate-400 hover:underline"
                                >
                                Pilih metode lain
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
  );
};

export default MyOrders;