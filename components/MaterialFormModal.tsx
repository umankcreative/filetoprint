import React, { useState, useEffect } from 'react';
import { Material, Category } from '../types';
import { X, Save } from 'lucide-react';

interface MaterialFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (material: Omit<Material, 'id'> | Material) => void;
  materialToEdit?: Material | null;
  categories: Category[];
}

const MaterialFormModal: React.FC<MaterialFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  materialToEdit,
  categories,
}) => {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(1);
  const [price, setPrice] = useState(0);
  const [unitType, setUnitType] = useState<'sheet' | 'sqm'>('sheet');

  useEffect(() => {
    if (materialToEdit) {
      setName(materialToEdit.name);
      setCategoryId(materialToEdit.category_id);
      setPrice(materialToEdit.price_per_unit);
      setUnitType(materialToEdit.unit_type);
    } else {
      setName('');
      setCategoryId(categories[0]?.id || 1);
      setPrice(0);
      setUnitType('sheet');
    }
  }, [materialToEdit, categories, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const materialData = {
      name,
      category_id: categoryId,
      price_per_unit: price,
      unit_type: unitType,
    };
    if (materialToEdit) {
      onSubmit({ ...materialData, id: materialToEdit.id });
    } else {
      onSubmit(materialData);
    }
    onClose();
  };

  if (!isOpen) return null;
  
  const inputStyles = "mt-1 block w-full border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100">
            {materialToEdit ? 'Edit Bahan' : 'Tambah Bahan Baru'}
          </h2>
          <button onClick={onClose} className="text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Nama Bahan</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={inputStyles}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Kategori</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(parseInt(e.target.value))}
              className={inputStyles}
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.description}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Harga per Unit</label>
            <input
              type="number"
              min="0"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value))}
              required
              className={inputStyles}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Tipe Unit</label>
            <select
              value={unitType}
              onChange={(e) => setUnitType(e.target.value as 'sheet' | 'sqm')}
              className={inputStyles}
            >
              <option value="sheet">Lembar (sheet)</option>
              <option value="sqm">Meter Persegi (sqm)</option>
            </select>
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

export default MaterialFormModal;