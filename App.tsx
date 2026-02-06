import React, { useState, useEffect } from 'react';
import { User, UserType, Order, Material, Category, FinishingOption, OrderStatus, Notification, AdminData, OperatorData, OperatorTask, AdminRecentOrder, PaymentMethod } from './types';
import { api } from './lib/api';

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
import SideNav from './components/SideNav';
import Header from './components/Header';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('login');

  const [orders, setOrders] = useState<Order[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [finishingOptions, setFinishingOptions] = useState<FinishingOption[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [operatorData, setOperatorData] = useState<OperatorData | null>(null);
  const [selectedTask, setSelectedTask] = useState<Order | null>(null);

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [usersData, categoriesData, materialsData, finishingData, paymentsData] = await Promise.all([
          api.getUsers(),
          api.getCategories(),
          api.getMaterials(),
          api.getFinishingOptions(),
          api.getPaymentMethods(),
        ]);

        setUsers(usersData);
        setCategories(categoriesData);
        setMaterials(materialsData);
        setFinishingOptions(finishingData);
        setPaymentMethods(paymentsData);
      } catch (error) {
        console.error('Failed to load initial data:', error);
        addNotification('Failed to load application data', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const loadOrders = async () => {
    try {
      const ordersData = await api.getOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to load orders:', error);
      addNotification('Failed to load orders', 'error');
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadOrders();
    }
  }, [currentUser]);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!currentUser) return;

      setAdminData(null);
      setOperatorData(null);

      try {
        if (currentUser.user_type === UserType.ADMIN) {
          const stats = await api.getDashboardStats();
          const allOrders = await api.getOrders();
          const recentOrders: AdminRecentOrder[] = allOrders.slice(0, 5).map(o => ({
            id: o.id,
            customer_id: o.customer_id,
            customer_name: users.find(u => u.id === o.customer_id)?.name || 'Unknown',
            status: o.status,
            total_price: o.total_price,
            created_at: o.created_at,
          }));

          setAdminData({
            dashboardStats: stats,
            recentOrders,
          });
        }

        if (currentUser.user_type === UserType.OPERATOR) {
          const stats = await api.getOperatorStats();
          const reviewOrders = await api.getOrdersForReview();
          const printingOrders = orders.filter(o => ['APPROVED', 'PRINTING'].includes(o.status));

          const tasks: OperatorTask[] = [
            ...reviewOrders.map(o => ({
              id: o.id,
              customer_name: users.find(u => u.id === o.customer_id)?.name || 'Unknown',
              status: o.status,
              file_name: o.file_name,
              category: o.category,
              submitted_at: o.created_at,
              priority: 'high' as const,
            })),
            ...printingOrders.slice(0, 3).map(o => ({
              id: o.id,
              customer_name: users.find(u => u.id === o.customer_id)?.name || 'Unknown',
              status: o.status,
              file_name: o.file_name,
              category: o.category,
              submitted_at: o.created_at,
              priority: 'normal' as const,
            })),
          ];

          setOperatorData({
            queueStats: stats,
            tasks,
          });
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        addNotification('Failed to load dashboard data', 'error');
      }
    };

    loadDashboardData();
  }, [currentUser, orders, users]);

  const addNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const newNotif = { id: Date.now(), message, type };
    setNotifications(prev => [...prev, newNotif]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
    }, 5000);
  };

  const handleLogin = async (userType: UserType) => {
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
    setOrders([]);
  };

  const handleNewOrder = async (order: Order) => {
    try {
      await api.createOrder(order);
      await loadOrders();
      setCurrentView('my_orders');
      addNotification('Your order has been placed successfully!', 'success');
    } catch (error) {
      console.error('Failed to create order:', error);
      addNotification('Failed to create order', 'error');
    }
  };

  const handleUpdateStatus = async (orderId: string, status: OrderStatus, reason?: string) => {
    try {
      await api.updateOrderStatus(orderId, status, reason);
      await loadOrders();

      if (selectedOrder?.id === orderId) {
        const updatedOrder = orders.find(o => o.id === orderId);
        if (updatedOrder) {
          setSelectedOrder({ ...updatedOrder, status, rejection_reason: reason });
        }
      }

      addNotification(`Order ${orderId} status updated to ${status.replace(/_/g, ' ')}.`, 'info');
    } catch (error) {
      console.error('Failed to update order status:', error);
      addNotification('Failed to update order status', 'error');
    }
  };

  const handleReuploadFile = async (orderId: string, newFile: File) => {
    try {
      await api.updateOrderFile(orderId, newFile.name);
      await loadOrders();
      addNotification(`File baru untuk pesanan ${orderId} telah diupload dan menunggu review.`, 'success');
    } catch (error) {
      console.error('Failed to reupload file:', error);
      addNotification('Failed to reupload file', 'error');
    }
  };

  const handleUpdateFileUrl = async (orderId: string, newUrl: string) => {
    try {
      await api.updateOrderFile(orderId, 'File from URL', newUrl);
      await loadOrders();
      addNotification(`Link file untuk pesanan ${orderId} telah diperbarui dan menunggu review.`, 'success');
    } catch (error) {
      console.error('Failed to update file URL:', error);
      addNotification('Failed to update file URL', 'error');
    }
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

  const handleAddMaterial = async (material: Omit<Material, 'id'>) => {
    try {
      await api.addMaterial(material);
      const materialsData = await api.getMaterials();
      setMaterials(materialsData);
      addNotification('New material added successfully!', 'success');
    } catch (error) {
      console.error('Failed to add material:', error);
      addNotification('Failed to add material', 'error');
    }
  };

  const handleUpdateMaterial = async (material: Material) => {
    try {
      await api.updateMaterial(material);
      const materialsData = await api.getMaterials();
      setMaterials(materialsData);
      addNotification('Material updated successfully!', 'success');
    } catch (error) {
      console.error('Failed to update material:', error);
      addNotification('Failed to update material', 'error');
    }
  };

  const handleDeleteMaterial = async (materialId: number) => {
    try {
      await api.deleteMaterial(materialId);
      const materialsData = await api.getMaterials();
      setMaterials(materialsData);
      addNotification('Material deleted successfully!', 'info');
    } catch (error) {
      console.error('Failed to delete material:', error);
      addNotification('Failed to delete material', 'error');
    }
  };

  const handleAddPaymentMethod = async (method: Omit<PaymentMethod, 'id'>) => {
    try {
      await api.addPaymentMethod(method);
      const paymentsData = await api.getPaymentMethods();
      setPaymentMethods(paymentsData);
      addNotification('New payment method added!', 'success');
    } catch (error) {
      console.error('Failed to add payment method:', error);
      addNotification('Failed to add payment method', 'error');
    }
  };

  const handleUpdatePaymentMethod = async (method: PaymentMethod) => {
    try {
      await api.updatePaymentMethod(method);
      const paymentsData = await api.getPaymentMethods();
      setPaymentMethods(paymentsData);
      addNotification('Payment method updated!', 'success');
    } catch (error) {
      console.error('Failed to update payment method:', error);
      addNotification('Failed to update payment method', 'error');
    }
  };

  const handleDeletePaymentMethod = async (methodId: number) => {
    try {
      await api.deletePaymentMethod(methodId);
      const paymentsData = await api.getPaymentMethods();
      setPaymentMethods(paymentsData);
      addNotification('Payment method deleted!', 'info');
    } catch (error) {
      console.error('Failed to delete payment method:', error);
      addNotification('Failed to delete payment method', 'error');
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-400">Loading application...</p>
        </div>
      </div>
    );
  }

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

      case 'new_order':
        return <NewOrderForm materials={materials} categories={categories} finishingOptions={finishingOptions} customerId={currentUser.id} onSubmit={handleNewOrder} />;
      case 'my_orders':
        return <MyOrders orders={customerOrders} paymentMethods={paymentMethods} onUpdateStatus={handleUpdateStatus} onViewDetails={handleViewDetails} onReuploadFile={handleReuploadFile} onUpdateFileUrl={handleUpdateFileUrl} />;

      case 'manage_orders':
        return <ManageOrders orders={orders} users={users} onViewDetails={handleViewDetails} />;
      case 'manage_materials':
        return <ManageMaterials materials={materials} categories={categories} onAddMaterial={handleAddMaterial} onUpdateMaterial={handleUpdateMaterial} onDeleteMaterial={handleDeleteMaterial} />;
      case 'verify_payments':
        return <VerifyPayments orders={orders} users={users} onUpdateStatus={handleUpdateStatus} />;
      case 'payment_settings':
        return <PaymentSettings paymentMethods={paymentMethods} onAdd={handleAddPaymentMethod} onUpdate={handleUpdatePaymentMethod} onDelete={handleDeletePaymentMethod} />;

      case 'file_review_queue':
        return <FileReviewQueue ordersToReview={ordersToReview} users={users} onReviewOrder={handleReviewOrder} onBack={() => setCurrentView('dashboard')} />;
      case 'file_review':
        if (selectedTask) {
          return <FileReview order={selectedTask} onUpdateStatus={handleUpdateStatus} onBack={() => setCurrentView('file_review_queue')} />;
        }
        setCurrentView('dashboard');
        addNotification('Selected task is not valid anymore.', 'error');
        return null;

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

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900 font-sans">
      <Notifications notifications={notifications} onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))} />
      <SideNav currentUser={currentUser} currentView={currentView} setCurrentView={setCurrentView} />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <Header
          pageTitle={getPageTitle()}
          currentUser={currentUser}
          theme={theme}
          toggleTheme={toggleTheme}
          setCurrentView={setCurrentView}
          handleLogout={handleLogout}
        />
        <main className="flex-1 p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
