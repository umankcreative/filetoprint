import React, { useState, useEffect, useMemo } from 'react';
import { Upload, FileText, DollarSign } from 'lucide-react';
import { Material, Category, FinishingOption, Order, OrderStatus } from '../types';

interface NewOrderFormProps {
  materials: Material[];
  categories: Category[];
  finishingOptions: FinishingOption[];
  customerId: number;
  onSubmit: (order: Order) => void;
}

const NewOrderForm: React.FC<NewOrderFormProps> = ({
  materials,
  categories,
  finishingOptions,
  customerId,
  onSubmit,
}) => {
  // Form State
  const [category, setCategory] = useState<string>(categories[0]?.name || '');
  const [file, setFile] = useState<File | null>(null);
  const [materialId, setMaterialId] = useState<number | ''>('');
  const [copies, setCopies] = useState(1);
  const [printingType, setPrintingType] = useState<'black_white' | 'color'>('black_white');
  const [paperSize, setPaperSize] = useState('A4');
  const [printingSides, setPrintingSides] = useState<'single_sided' | 'double_sided'>('single_sided');
  const [selectedFinishing, setSelectedFinishing] = useState<number[]>([]);
  const [customWidth, setCustomWidth] = useState('1');
  const [customHeight, setCustomHeight] = useState('1');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);

  const availableMaterials = useMemo(() => {
    const selectedCategory = categories.find(c => c.name === category);
    if (!selectedCategory) return [];
    return materials.filter(m => m.category_id === selectedCategory.id);
  }, [category, materials, categories]);

  const availableFinishing = useMemo(() => {
    return finishingOptions.filter(f => f.applies_to === 'all' || f.applies_to === category);
  }, [category, finishingOptions]);
  
  // Reset material when category changes
  useEffect(() => {
      setMaterialId('');
      setSelectedFinishing([]);
  }, [category]);
  
  // Price Calculation Logic
  useEffect(() => {
    const calculatePrice = () => {
        if (!materialId) return 0;
        const material = materials.find(m => m.id === materialId);
        if (!material) return 0;

        let basePrice = 0;
        let area = 0;

        if (category === 'banner') {
            const width = parseFloat(customWidth) || 0;
            const height = parseFloat(customHeight) || 0;
            area = width * height;
            basePrice = area * material.price_per_unit;
        } else { // document, business_card
            basePrice = copies * material.price_per_unit;
            if (printingSides === 'double_sided' && category === 'document') {
                basePrice *= 2; // Simple assumption for double-sided documents
            }
        }

        const finishingCost = selectedFinishing.reduce((total, id) => {
            const option = finishingOptions.find(f => f.id === id);
            if (!option) return total;

            switch (option.price_type) {
                case 'per_unit':
                    return total + (option.price * (category === 'banner' ? 1 : copies));
                case 'per_job':
                    return total + option.price;
                case 'per_meter':
                     const width = parseFloat(customWidth) || 0;
                     const height = parseFloat(customHeight) || 0;
                    return total + (option.price * (width + height) * 2); // Assuming perimeter for cutting
                default:
                    return total;
            }
        }, 0);

        return basePrice + finishingCost;
    };

    setTotalPrice(calculatePrice());
  }, [materialId, copies, printingSides, customWidth, customHeight, selectedFinishing, category, materials, finishingOptions]);


  const handleFinishingChange = (optionId: number) => {
    setSelectedFinishing(prev =>
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !materialId) {
      alert('Please fill all required fields: File and Material.');
      return;
    }
    
    const newOrder: Order = {
        id: `ORD-${Date.now()}`,
        customer_id: customerId,
        status: OrderStatus.WAITING_PAYMENT,
        total_price: totalPrice,
        created_at: new Date().toISOString(),
        file: file,
        file_name: file.name,
        category: category,
        material_id: materialId,
        copies: category === 'banner' ? 1 : copies,
        printing_type: printingType,
        paper_size: category === 'document' ? paperSize : 'standard',
        printing_sides: category === 'document' ? printingSides : 'single_sided',
        finishing: selectedFinishing,
        custom_width: category === 'banner' ? customWidth : '',
        custom_height: category === 'banner' ? customHeight : '',
        special_instructions: specialInstructions,
    };
    
    onSubmit(newOrder);
  };
  
  const inputStyles = "w-full border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-md px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500";
  const labelStyles = "block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1";
  
  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg animate-fade-in space-y-8 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-slate-100 border-b dark:border-slate-700 pb-4">Buat Pesanan Baru</h2>
        
        {/* Step 1: File & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className={labelStyles}>Kategori Cetak</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className={inputStyles}>
                    {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.description}</option>)}
                </select>
            </div>
             <div>
                <label className={labelStyles}>Upload File</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-slate-600 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600 dark:text-slate-400">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                <span>Pilih file untuk diupload</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={e => setFile(e.target.files ? e.target.files[0] : null)} required />
                            </label>
                        </div>
                        {file ? (
                           <p className="text-sm text-gray-500 dark:text-slate-300 flex items-center justify-center"><FileText size={14} className="mr-2" /> {file.name}</p>
                        ) : (
                           <p className="text-xs text-gray-500 dark:text-slate-400">PDF, JPG, PNG, DOCX, dll.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Step 2: Specifications */}
        <div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-slate-200 mb-4">Spesifikasi Cetak</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border dark:border-slate-700 rounded-lg">
                <div>
                    <label className={labelStyles}>Bahan</label>
                    <select value={materialId} onChange={e => setMaterialId(Number(e.target.value))} className={inputStyles} required>
                        <option value="" disabled>Pilih bahan...</option>
                        {availableMaterials.map(mat => <option key={mat.id} value={mat.id}>{mat.name}</option>)}
                    </select>
                </div>

                <div>
                    <label className={labelStyles}>Jenis Cetak</label>
                    <div className="flex gap-4 mt-2">
                        <label className="flex items-center"><input type="radio" name="printingType" value="black_white" checked={printingType === 'black_white'} onChange={() => setPrintingType('black_white')} className="form-radio" /> <span className="ml-2 dark:text-slate-300">Hitam Putih</span></label>
                        <label className="flex items-center"><input type="radio" name="printingType" value="color" checked={printingType === 'color'} onChange={() => setPrintingType('color')} className="form-radio" /> <span className="ml-2 dark:text-slate-300">Berwarna</span></label>
                    </div>
                </div>

                {category === 'document' && (
                    <>
                        <div>
                            <label htmlFor="copies" className={labelStyles}>Jumlah Copy</label>
                            <input type="number" id="copies" value={copies} onChange={e => setCopies(Math.max(1, parseInt(e.target.value) || 1))} min="1" className={inputStyles} />
                        </div>
                        <div>
                            <label className={labelStyles}>Ukuran Kertas</label>
                            <select value={paperSize} onChange={e => setPaperSize(e.target.value)} className={inputStyles}>
                                <option value="A4">A4 (21 x 29.7 cm)</option>
                                <option value="F4">F4 (21.5 x 33 cm)</option>
                                <option value="A3">A3 (29.7 x 42 cm)</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelStyles}>Cetak Sisi</label>
                            <div className="flex gap-4 mt-2">
                                <label className="flex items-center"><input type="radio" name="printingSides" value="single_sided" checked={printingSides === 'single_sided'} onChange={() => setPrintingSides('single_sided')} className="form-radio" /> <span className="ml-2 dark:text-slate-300">1 Sisi</span></label>
                                <label className="flex items-center"><input type="radio" name="printingSides" value="double_sided" checked={printingSides === 'double_sided'} onChange={() => setPrintingSides('double_sided')} className="form-radio" /> <span className="ml-2 dark:text-slate-300">2 Sisi (Bolak-balik)</span></label>
                            </div>
                        </div>
                    </>
                )}
                
                 {category === 'business_card' && (
                    <div>
                        <label htmlFor="copies" className={labelStyles}>Jumlah Box (isi 100 pcs)</label>
                        <input type="number" id="copies" value={copies} onChange={e => setCopies(Math.max(1, parseInt(e.target.value) || 1))} min="1" className={inputStyles} />
                    </div>
                 )}
                 
                 {category === 'banner' && (
                    <>
                        <div>
                            <label htmlFor="width" className={labelStyles}>Lebar (meter)</label>
                            <input type="number" id="width" value={customWidth} onChange={e => setCustomWidth(e.target.value)} min="0.1" step="0.1" className={inputStyles} />
                        </div>
                        <div>
                            <label htmlFor="height" className={labelStyles}>Tinggi (meter)</label>
                            <input type="number" id="height" value={customHeight} onChange={e => setCustomHeight(e.target.value)} min="0.1" step="0.1" className={inputStyles} />
                        </div>
                    </>
                 )}

            </div>
        </div>
        
        {/* Step 3: Finishing */}
        {availableFinishing.length > 0 && (
             <div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-slate-200 mb-4">Finishing (Opsional)</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-6 border dark:border-slate-700 rounded-lg">
                    {availableFinishing.map(option => (
                        <label key={option.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700/50">
                            <input 
                                type="checkbox"
                                checked={selectedFinishing.includes(option.id)}
                                onChange={() => handleFinishingChange(option.id)}
                                className="form-checkbox h-5 w-5 text-blue-600"
                            />
                            <span className="text-gray-700 dark:text-slate-300">{option.name}</span>
                        </label>
                    ))}
                </div>
            </div>
        )}
        
        {/* Step 4: Instructions & Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
             <div>
                <label htmlFor="instructions" className={labelStyles}>Instruksi Khusus (Opsional)</label>
                <textarea 
                    id="instructions"
                    value={specialInstructions}
                    onChange={e => setSpecialInstructions(e.target.value)}
                    rows={4}
                    className={inputStyles}
                    placeholder="Contoh: Tolong bagian header dicetak lebih tebal..."
                />
            </div>
             <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-4">Ringkasan Biaya</h3>
                <div className="flex justify-between items-center">
                    <p className="text-gray-600 dark:text-slate-300 text-lg">Estimasi Total:</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center">
                        <DollarSign size={20} className="mr-2" /> Rp {totalPrice.toLocaleString()}
                    </p>
                </div>
                <button type="submit" className="w-full mt-6 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition transform hover:scale-105 shadow-md">
                    Buat Pesanan
                </button>
            </div>
        </div>
    </form>
  );
};

export default NewOrderForm;
