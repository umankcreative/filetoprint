import React from 'react';
import { Printer, User, Settings } from 'lucide-react';
import { UserType } from '../types';

interface LoginFormProps {
  onLogin: (userType: UserType) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 dark:from-slate-900 dark:to-purple-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
          <Printer className="w-20 h-20 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">Digital Print</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-2">Sistem Percetakan Online Terintegrasi</p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => onLogin(UserType.CUSTOMER)}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition transform hover:scale-105 flex items-center justify-center text-lg font-medium shadow-md"
          >
            <User className="mr-3" size={24} />
            Login sebagai Customer
          </button>
          <button
            onClick={() => onLogin(UserType.ADMIN)}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition transform hover:scale-105 flex items-center justify-center text-lg font-medium shadow-md"
          >
            <Settings className="mr-3" size={24} />
            Login sebagai Admin
          </button>
          <button
            onClick={() => onLogin(UserType.OPERATOR)}
            className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition transform hover:scale-105 flex items-center justify-center text-lg font-medium shadow-md"
          >
            <Printer className="mr-3" size={24} />
            Login sebagai Operator
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;