import React, { useState, useEffect } from 'react';
import { Check, X, AlertCircle, ArrowLeft, Download, Eye, FileText } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import StatusBadge from './StatusBadge';
import { MOCK_MATERIALS, MOCK_FINISHING_OPTIONS } from '../constants';

interface FileReviewProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: OrderStatus, reason?: string) => void;
  onBack: () => void;
}

const FileReview: React.FC<FileReviewProps> = ({ order, onUpdateStatus, onBack }) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const isImage = order.file?.type.startsWith('image/');

  useEffect(() => {
    // Ensure order.file is a File object before creating a URL
    if (order.file && order.file instanceof File) {
      const url = URL.createObjectURL(order.file);
      setPreviewUrl(url);

      // Cleanup function to revoke the object URL on component unmount
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [order.file]);

  const handleApprove = () => {
    onUpdateStatus(order.id, OrderStatus.APPROVED);
  };

  const handleToggleReject = () => {
    setIsRejecting(!isRejecting);
    setRejectionReason('');
    setError(null);
  };

  const handleConfirmReject = () => {
    if (!rejectionReason.trim()) {
      setError('Alasan penolakan tidak boleh kosong.');
      return;
    }
    onUpdateStatus(order.id, OrderStatus.REJECTED, rejectionReason);
  };

  const inputStyles = "w-full border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-md px-3 py-2 shadow-sm focus:ring-red-500 focus:border-red-500";

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 border-b dark:border-slate-700 pb-4">
        <div>
            <button onClick={onBack} className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition mb-2">
                <ArrowLeft size={20} className="mr-2" />
                Kembali ke Antrian
            </button>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-slate-100">Review File Pesanan #{order.id}</h2>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* File Preview & Actions */}
        <div className="space-y-6">
            <div className="p-4 border dark:border-slate-700 rounded-lg">
                <h3 className="font-semibold text-lg text-gray-700 dark:text-slate-200 mb-3">File Preview</h3>
                <div className="bg-gray-100 dark:bg-slate-700 p-4 rounded-md h-64 flex items-center justify-center overflow-hidden">
                    {previewUrl && isImage ? (
                        <img src={previewUrl} alt="File preview" className="max-h-full max-w-full object-contain" />
                    ) : (
                        <div className="text-center text-gray-500 dark:text-slate-400">
                            <FileText size={48} className="mx-auto" />
                            <p className="mt-2 text-sm">Preview tidak tersedia untuk tipe file ini</p>
                        </div>
                    )}
                </div>
                <div className="mt-4 flex items-center justify-between">
                    <span className="font-medium text-gray-800 dark:text-slate-200 truncate" title={order.file_name}>{order.file_name}</span>
                    {previewUrl && (
                        <a 
                            href={previewUrl} 
                            download={order.file_name}
                            className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition inline-flex items-center gap-1 text-sm"
                        >
                            <Download size={16}/> Download
                        </a>
                    )}
                </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-slate-700/50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg text-gray-700 dark:text-slate-200 mb-4">Aksi Review</h3>
                {!isRejecting ? (
                    <div className="flex gap-4">
                        <button 
                            onClick={handleApprove}
                            className="flex-1 bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2"
                        >
                            <Check size={20} /> Setujui & Lanjutkan
                        </button>
                        <button
                            onClick={handleToggleReject}
                            className="flex-1 bg-red-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2"
                        >
                            <X size={20} /> Tolak Pesanan
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Alasan Penolakan</label>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => {
                                setRejectionReason(e.target.value)
                                setError(null);
                            }}
                            placeholder="Contoh: Resolusi file terlalu rendah, mohon unggah file baru..."
                            className={inputStyles}
                            rows={3}
                        />
                        {error && <p className="text-sm text-red-600 flex items-center gap-1"><AlertCircle size={14}/> {error}</p>}
                        <div className="flex gap-3">
                            <button
                                onClick={handleConfirmReject}
                                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                            >
                                Konfirmasi Penolakan
                            </button>
                            <button
                                onClick={handleToggleReject}
                                className="bg-gray-200 text-gray-800 dark:bg-slate-600 dark:text-slate-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-slate-500"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
        
        {/* Order Details */}
        <div className="space-y-4">
            <div className="p-4 border dark:border-slate-700 rounded-lg">
                <h3 className="font-semibold text-lg text-gray-700 dark:text-slate-200 mb-3">Detail Spesifikasi</h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-slate-300">
                    <div><strong>Kategori:</strong> <span className="capitalize">{String(order.category).replace('_', ' ')}</span></div>
                    <div><strong>Bahan:</strong> {MOCK_MATERIALS.find(m => m.id === order.material_id)?.name || 'N/A'}</div>
                    <div><strong>Jenis Cetak:</strong> {order.printing_type === 'color' ? 'Berwarna' : 'Hitam Putih'}</div>
                    { (order.category === 'document' || order.category === 'business_card') && <>
                        <div><strong>Jumlah:</strong> {order.copies} {order.category === 'business_card' ? 'box' : ''}</div>
                        <div><strong>Ukuran:</strong> {order.paper_size}</div>
                    </>}
                    { order.category === 'banner' && <>
                        <div><strong>Lebar:</strong> {order.custom_width} m</div>
                        <div><strong>Tinggi:</strong> {order.custom_height} m</div>
                    </>}
                    <div><strong>Finishing:</strong> {order.finishing.map(id => MOCK_FINISHING_OPTIONS.find(f => f.id === id)?.name).join(', ') || 'Tidak ada'}</div>
                </div>
            </div>
            {order.special_instructions && (
                <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border-l-4 border-blue-400">
                    <h4 className="font-bold text-blue-800 dark:text-blue-300">Instruksi Khusus</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-200 italic">"{order.special_instructions}"</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default FileReview;