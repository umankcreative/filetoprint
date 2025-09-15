import React from 'react';
import { LayoutDashboard, PlusCircle, Package, ListOrdered, CreditCard, Settings, Wallet, FileSearch, Printer } from 'lucide-react';
import { User } from '../types';

interface SideNavProps {
    currentUser: User;
    currentView: string;
    setCurrentView: (view: string) => void;
}

const SideNav: React.FC<SideNavProps> = ({ currentUser, currentView, setCurrentView }) => {
    
    const NavItem = ({ icon: Icon, label, view }: { icon: React.ElementType, label: string, view: string }) => {
        const isActive = currentView === view;
        return (
            <button
                onClick={() => setCurrentView(view)}
                className={`flex items-center w-full h-12 px-6 text-sm font-medium rounded-l-full transition-colors relative ${
                    isActive
                        ? 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100'
                        : 'text-slate-400 hover:text-white'
                }`}
            >
                {isActive && <div className="absolute top-[-30px] right-0 h-[30px] w-[30px] bg-transparent shadow-[15px_15px_0_10px_#f1f5f9] dark:shadow-[15px_15px_0_10px_#0f172a] rounded-br-[30px]"></div>}
                <Icon className="mr-4" size={20} />
                <span>{label}</span>
                {isActive && <div className="absolute bottom-[-30px] right-0 h-[30px] w-[30px] bg-transparent shadow-[15px_-15px_0_10px_#f1f5f9] dark:shadow-[15px_-15px_0_10px_#0f172a] rounded-tr-[30px]"></div>}
            </button>
        );
    };
    
    return (
        <nav className="hidden md:flex flex-col w-72 bg-slate-800 pl-6 shrink-0">
            <div className="flex items-center text-white h-20 shrink-0">
                <Printer size={32} className="text-white"/>
                <span className="text-2xl font-bold ml-3">Digital Print</span>
            </div>
            <div className="space-y-2 py-6">
                 <NavItem icon={LayoutDashboard} label="Dashboard" view="dashboard" />
                {currentUser.user_type === 'customer' && (
                    <>
                        <NavItem icon={PlusCircle} label="Buat Pesanan" view="new_order" />
                        <NavItem icon={Package} label="Pesanan Saya" view="my_orders" />
                    </>
                )}
                {currentUser.user_type === 'admin' && (
                    <>
                        <NavItem icon={ListOrdered} label="Kelola Pesanan" view="manage_orders" />
                        <NavItem icon={CreditCard} label="Verifikasi Bayar" view="verify_payments" />
                        <NavItem icon={Settings} label="Kelola Bahan" view="manage_materials" />
                        <NavItem icon={Wallet} label="Atur Pembayaran" view="payment_settings" />
                    </>
                )}
                {currentUser.user_type === 'operator' && (
                    <>
                        <NavItem icon={FileSearch} label="Antrian Review" view="file_review_queue" />
                    </>
                )}
            </div>
        </nav>
    );
};

export default SideNav;
