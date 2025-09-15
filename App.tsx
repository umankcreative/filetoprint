import React, { useState, useEffect } from 'react';
import { User, UserType, Order, Material, Category, FinishingOption, OrderStatus, Notification, AdminData, OperatorData, OperatorTask, AdminRecentOrder, PaymentMethod } from './types';
import { MOCK_USERS, MOCK_CATEGORIES, MOCK_MATERIALS, MOCK_FINISHING_OPTIONS, MOCK_PAYMENT_METHODS } from './constants';

// Component Imports
import LoginForm from './components/LoginForm';
import CustomerDashboard from './components/CustomerDashboard';
import AdminDashboard from './components/AdminDashboard';
import OperatorDashboard from './components/OperatorDashboard';
import NewOrderForm from './components/NewOrderForm';
import MyOrders from './components/MyOrders';
import OrderDetails from './components/OrderDetails';
import ManageOrders from './components/ManageOrders';
import ManageMaterials from './components/ManageMaterials';
import VerifyPayments from './components/VerifyPayments';
import FileReviewQueue from './components/FileReviewQueue';
import FileReview from './components/FileReview';
import Profile from './components/Profile';
import Notifications from './components/Notifications';
import PaymentSettings from './components/PaymentSettings';
import { LayoutDashboard, LogOut, PlusCircle, User as UserIcon, Settings, ListOrdered, Package, CreditCard, FileSearch, Printer, ChevronDown, Search, Bell, Moon, Sun, Wallet } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('login'); // login, dashboard, new_order, my_orders, etc.
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [materials, setMaterials] = useState<Material[]>(MOCK_MATERIALS);
  const [categories] = useState<Category[]>(MOCK_CATEGORIES);
  const [finishingOptions] = useState<FinishingOption[]>(MOCK_FINISHING_OPTIONS);
  const [users] = useState<User[]>(MOCK_USERS);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(MOCK_PAYMENT_METHODS);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Admin & Operator specific data
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [operatorData, setOperatorData] = useState<OperatorData | null>(null);
  const [selectedTask, setSelectedTask] = useState<Order | null>(null);
  
  // Dark Mode State
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Dark Mode Effect
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };


  // Handlers
  const addNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const newNotif = { id: Date.now(), message, type };
    setNotifications(prev => [...prev, newNotif]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
    }, 5000);
  };
  
  const handleLogin = (userType: UserType) => {
    const user = users.find(u => u.user_type === userType);
    if (user) {
      setCurrentUser(user);
      setCurrentView('dashboard');
      addNotification(`Welcome back, ${user.name}!`, 'success');
    }
  };

  const handleLogout = () => {
    addNotification(`Goodbye, ${currentUser?.name}!`);
    setCurrentUser(null);
    setCurrentView('login');
  };

  const handleNewOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
    setCurrentView('my_orders');
    addNotification('Your order has been placed successfully!', 'success');
  };

  const handleUpdateStatus = (orderId: string, status: OrderStatus, reason?: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, rejection_reason: reason || o.rejection_reason } : o));
    if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status, rejection_reason: reason || prev.rejection_reason } : null);
    }
    addNotification(`Order ${orderId} status updated to ${status.replace(/_/g, ' ')}.`, 'info');
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setCurrentView('order_details');
  };
  
  const handleReviewTask = (task: OperatorTask) => {
    const orderToReview = orders.find(o => o.id === task.id);
    if (orderToReview) {
      setSelectedTask(orderToReview);
      setCurrentView('file_review');
    } else {
      addNotification(`Could not find order details for task ${task.id}`, 'error');
    }
  };

  const handleReviewOrder = (order: Order) => {
    setSelectedTask(order);
    setCurrentView('file_review');
  };
  
  const handleAddMaterial = (material: Omit<Material, 'id'>) => {
      const newMaterial = { ...material, id: Date.now() };
      setMaterials(prev => [...prev, newMaterial]);
      addNotification('New material added successfully!', 'success');
  };

  const handleUpdateMaterial = (material: Material) => {
      setMaterials(prev => prev.map(m => m.id === material.id ? material : m));
      addNotification('Material updated successfully!', 'success');
  };

  const handleDeleteMaterial = (materialId: number) => {
      setMaterials(prev => prev.filter(m => m.id !== materialId));
      addNotification('Material deleted successfully!', 'info');
  };
  
  const handleAddPaymentMethod = (method: Omit<PaymentMethod, 'id'>) => {
      const newMethod = { ...method, id: Date.now() };
      setPaymentMethods(prev => [...prev, newMethod]);
      addNotification('New payment method added!', 'success');
  };
  
  const handleUpdatePaymentMethod = (method: PaymentMethod) => {
      setPaymentMethods(prev => prev.map(m => m.id === method.id ? method : m));
      addNotification('Payment method updated!', 'success');
  };
  
  const handleDeletePaymentMethod = (methodId: number) => {
      setPaymentMethods(prev => prev.filter(m => m.id !== methodId));
      addNotification('Payment method deleted!', 'info');
  };

  // Load base orders on initial app load to simulate a database
    useEffect(() => {
        fetch('/customer_data.json')
            .then(res => res.json())
            .then(data => {
                const allOrders: Order[] = data.map((o: any) => ({
                    ...o,
                    status: o.status.toUpperCase() as OrderStatus,
                    file: new File([""], o.file_name, { type: "text/plain" }),
                    printing_sides: o.printing_sides || 'single_sided',
                }));
                setOrders(allOrders);
            })
            .catch(err => {
                console.error("Failed to load initial order data", err);
                addNotification("Could not load order data.", "error");
            });
    }, []);

    // Fetch dashboard-specific data when user changes
    useEffect(() => {
        // Clear specific data on user change
        setAdminData(null);
        setOperatorData(null);

        if (currentUser?.user_type === UserType.ADMIN) {
          fetch('/admin_data.json')
            .then(res => res.json())
            .then(data => {
                const recentOrders: AdminRecentOrder[] = data.recentOrders.map((o: any) => ({
                    ...o,
                    status: o.status.toUpperCase() as OrderStatus,
                }));
                setAdminData({ ...data, recentOrders });
            })
            .catch(err => {
                console.error("Failed to load admin dashboard data", err)
                addNotification("Could not load admin dashboard.", "error");
            });
        }
        
        if (currentUser?.user_type === UserType.OPERATOR) {
          fetch('/operator_data.json')
            .then(res => res.json())
            .then(data => {
                 const tasks: OperatorTask[] = data.tasks.map((t: any) => ({
                    ...t,
                    status: t.status.toUpperCase() as OrderStatus,
                }));
                setOperatorData({ ...data, tasks });
            })
            .catch(err => {
                console.error("Failed to load operator dashboard data", err)
                addNotification("Could not load operator dashboard.", "error");
            });
        }
    }, [currentUser]);

    const pageTitles: { [key: string]: string } = {
        dashboard: 'Dashboard',
        new_order: 'Buat Pesanan Baru',
        my_orders: 'Pesanan Saya',
        order_details: `Detail Pesanan #${selectedOrder?.id || ''}`,
        manage_orders: 'Kelola Pesanan',
        manage_materials: 'Kelola Bahan',
        verify_payments: 'Verifikasi Pembayaran',
        payment_settings: 'Pengaturan Pembayaran',
        file_review_queue: 'Antrian Review File',
        file_review: `Review File #${selectedTask?.id || ''}`,
        profile: 'Profil Saya',
    };

    const getPageTitle = () => pageTitles[currentView] || 'Digital Print';

  // Render logic
  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const customerOrders = orders.filter(o => o.customer_id === currentUser.id);
  const ordersToReview = orders.filter(o => o.status === OrderStatus.FILE_REVIEW);

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        if (currentUser.user_type === 'customer') return <CustomerDashboard orders={customerOrders} onViewOrders={() => setCurrentView('my_orders')} />;
        if (currentUser.user_type === 'admin') return <AdminDashboard adminData={adminData} onViewOrders={() => setCurrentView('manage_orders')} />;
        if (currentUser.user_type === 'operator') return <OperatorDashboard operatorData={operatorData} onViewTask={handleReviewTask} onViewFileReviewQueue={() => setCurrentView('file_review_queue')}/>;
        return null;

      // Customer Views
      case 'new_order':
        return <NewOrderForm materials={materials} categories={categories} finishingOptions={finishingOptions} customerId={currentUser.id} onSubmit={handleNewOrder} />;
      case 'my_orders':
        return <MyOrders orders={customerOrders} paymentMethods={paymentMethods} onUpdateStatus={handleUpdateStatus} onViewDetails={handleViewDetails} />;
      
      // Admin Views
      case 'manage_orders':
        return <ManageOrders orders={orders} users={users} onViewDetails={handleViewDetails} />;
      case 'manage_materials':
        return <ManageMaterials materials={materials} categories={categories} onAddMaterial={handleAddMaterial} onUpdateMaterial={handleUpdateMaterial} onDeleteMaterial={handleDeleteMaterial} />;
      case 'verify_payments':
        return <VerifyPayments orders={orders} users={users} onUpdateStatus={handleUpdateStatus} />;
      case 'payment_settings':
        return <PaymentSettings paymentMethods={paymentMethods} onAdd={handleAddPaymentMethod} onUpdate={handleUpdatePaymentMethod} onDelete={handleDeletePaymentMethod} />;
      
      // Operator Views
      case 'file_review_queue':
        return <FileReviewQueue ordersToReview={ordersToReview} users={users} onReviewOrder={handleReviewOrder} onBack={() => setCurrentView('dashboard')} />;
      case 'file_review':
        if (selectedTask) {
          return <FileReview order={selectedTask} onUpdateStatus={handleUpdateStatus} onBack={() => setCurrentView('file_review_queue')} />;
        }
        setCurrentView('dashboard');
        addNotification('Selected task is not valid anymore.', 'error');
        return null;
        
      // Shared Views
      case 'order_details':
        if (selectedOrder) {
          const backView = currentUser.user_type === 'customer' ? 'my_orders' : 'manage_orders'
          return <OrderDetails order={selectedOrder} currentUser={currentUser} users={users} materials={materials} finishingOptions={finishingOptions} onUpdateStatus={handleUpdateStatus} onBack={() => setCurrentView(backView)} />;
        }
        setCurrentView('dashboard');
        addNotification('Selected order is not valid anymore.', 'error');
        return null;
      case 'profile':
        return <Profile user={currentUser} onLogout={handleLogout} onBack={() => setCurrentView('dashboard')} />;
      
      default:
        return <div>Page not found</div>;
    }
  };

  const SideNav = () => {
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
        <nav className="hidden md:flex flex-col w-72 bg-slate-800 p-6 shrink-0">
            <div className="flex items-center text-white mb-12">
                <Printer size={32} className="text-white"/>
                <span className="text-2xl font-bold ml-3">Digital Print</span>
            </div>
            <div className="space-y-2">
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
  
  const Header = () => {
      const [dropdownOpen, setDropdownOpen] = useState(false);

      return (
        <header className="bg-white dark:bg-slate-800 dark:border-b dark:border-slate-700 shadow-sm h-20 flex items-center justify-between px-8 shrink-0">
            <div>
                <p className="text-gray-500 dark:text-slate-400 text-sm">Application / <span className="text-gray-800 dark:text-slate-200 font-medium">{getPageTitle()}</span></p>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100">{getPageTitle()}</h2>
            </div>
            <div className="flex items-center gap-6">
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"/>
                    <input type="text" placeholder="Search..." className="bg-gray-100 dark:bg-slate-700 dark:text-slate-300 rounded-full pl-10 pr-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <button
                    onClick={toggleTheme}
                    className="text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200"
                    aria-label="Toggle dark mode"
                >
                    {theme === 'light' ? <Moon size={20}/> : <Sun size={20}/>}
                </button>
                <button className="relative text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200">
                    <Bell size={20}/>
                    <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>
                 <div className="relative">
                    <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2">
                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                           {currentUser.name.charAt(0)}
                       </div>
                       <span className="font-medium text-sm dark:text-slate-200">{currentUser.name}</span>
                       <ChevronDown size={16} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}/>
                    </button>
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-700 rounded-lg shadow-xl z-10 py-2 animate-fade-in-up">
                            <button onClick={() => { setCurrentView('profile'); setDropdownOpen(false); }} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-600">
                                <UserIcon size={16} className="mr-3"/> Profile
                            </button>
                             <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                                <LogOut size={16} className="mr-3"/> Logout
                            </button>
                        </div>
                    )}
                 </div>
            </div>
        </header>
      );
  };

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900 font-sans">
        <Notifications notifications={notifications} onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))} />
        <SideNav/>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-y-auto">
            <Header />
            <main className="flex-1 p-8">
                {renderContent()}
            </main>
        </div>
    </div>
  );
};

export default App;