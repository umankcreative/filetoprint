import React from 'react';
import { User as UserIcon, Mail, Shield, LogOut, ArrowLeft } from 'lucide-react';
import { User, UserType } from '../types';

interface ProfileProps {
  user: User;
  onLogout: () => void;
  onBack: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout, onBack }) => {

  const getRoleDescription = (userType: UserType) => {
    switch (userType) {
      case UserType.ADMIN:
        return 'Administrator - Mengelola seluruh sistem';
      case UserType.CUSTOMER:
        return 'Pelanggan - Membuat dan melacak pesanan';
      case UserType.OPERATOR:
        return 'Operator Cetak - Memproses pesanan masuk';
      default:
        return 'Pengguna';
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md">
              <UserIcon className="w-16 h-16 text-white" />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-white">{user.name}</h3>
              <p className="text-blue-100 capitalize">{user.user_type}</p>
            </div>
          </div>
        </div>
        <div className="p-8 space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-4">Informasi Akun</h4>
            <div className="space-y-4 text-gray-700 dark:text-slate-300">
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-4 text-gray-400 dark:text-slate-500" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center">
                <Shield className="w-5 h-5 mr-4 text-gray-400 dark:text-slate-500" />
                <span>{getRoleDescription(user.user_type)}</span>
              </div>
            </div>
          </div>
          <div className="border-t dark:border-slate-700 pt-6">
             <button
              onClick={onBack}
              className="w-full bg-gray-200 text-gray-800 dark:bg-slate-700 dark:text-slate-200 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition flex items-center justify-center text-lg font-medium shadow-md mb-4"
            >
              <ArrowLeft className="mr-3" size={24} />
              Kembali ke Dashboard
            </button>
            <button
              onClick={onLogout}
              className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition transform hover:scale-105 flex items-center justify-center text-lg font-medium shadow-md"
            >
              <LogOut className="mr-3" size={24} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;