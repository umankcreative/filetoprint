import React, { useState } from 'react';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Material, Category } from '../types';
import MaterialFormModal from './MaterialFormModal';

interface ManageMaterialsProps {
  materials: Material[];
  categories: Category[];
  onAddMaterial: (material: Omit<Material, 'id'>) => void;
  onUpdateMaterial: (material: Material) => void;
  onDeleteMaterial: (materialId: number) => void;
}

const ManageMaterials: React.FC<ManageMaterialsProps> = ({
  materials,
  categories,
  onAddMaterial,
  onUpdateMaterial,
  onDeleteMaterial,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [materialToEdit, setMaterialToEdit] = useState<Material | null>(null);

  const getCategoryName = (categoryId: number) => {
    return categories.find(c => c.id === categoryId)?.name || 'N/A';
  };

  const handleOpenModal = (material?: Material) => {
    setMaterialToEdit(material || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setMaterialToEdit(null);
    setIsModalOpen(false);
  };

  const handleSubmit = (material: Omit<Material, 'id'> | Material) => {
    if ('id' in material) {
      onUpdateMaterial(material);
    } else {
      onAddMaterial(material);
    }
  };

  const handleDelete = (materialId: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus bahan ini?')) {
      onDeleteMaterial(materialId);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-slate-100">Kelola Bahan</h2>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <PlusCircle size={20} />
          Tambah Bahan
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead className="bg-gray-50 dark:bg-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Nama Bahan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Kategori</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Harga</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Tipe Unit</th>
              <th className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
            {materials.map(material => (
              <tr key={material.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100">{material.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400 capitalize">{getCategoryName(material.category_id)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">Rp {material.price_per_unit.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{material.unit_type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                  <button onClick={() => handleOpenModal(material)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(material.id)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <MaterialFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        materialToEdit={materialToEdit}
        categories={categories}
      />
    </div>
  );
};

export default ManageMaterials;