import { supabase } from './supabase';
import {
  User,
  Order,
  Material,
  Category,
  FinishingOption,
  PaymentMethod,
  OrderStatus
} from '../types';

export const api = {
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('id');

    if (error) throw error;
    return data.map(u => ({ ...u, user_type: u.user_type }));
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;
    return data ? { ...data, user_type: data.user_type } : null;
  },

  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('id');

    if (error) throw error;
    return data;
  },

  async getMaterials(): Promise<Material[]> {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .order('id');

    if (error) throw error;
    return data;
  },

  async addMaterial(material: Omit<Material, 'id'>): Promise<Material> {
    const { data, error } = await supabase
      .from('materials')
      .insert(material)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateMaterial(material: Material): Promise<Material> {
    const { data, error } = await supabase
      .from('materials')
      .update(material)
      .eq('id', material.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteMaterial(materialId: number): Promise<void> {
    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', materialId);

    if (error) throw error;
  },

  async getFinishingOptions(): Promise<FinishingOption[]> {
    const { data, error } = await supabase
      .from('finishing_options')
      .select('*')
      .order('id');

    if (error) throw error;
    return data;
  },

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .order('id');

    if (error) throw error;
    return data;
  },

  async addPaymentMethod(method: Omit<PaymentMethod, 'id'>): Promise<PaymentMethod> {
    const { data, error } = await supabase
      .from('payment_methods')
      .insert(method)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updatePaymentMethod(method: PaymentMethod): Promise<PaymentMethod> {
    const { data, error } = await supabase
      .from('payment_methods')
      .update(method)
      .eq('id', method.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deletePaymentMethod(methodId: number): Promise<void> {
    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', methodId);

    if (error) throw error;
  },

  async getOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_finishings (finishing_option_id)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(order => ({
      ...order,
      finishing: order.order_finishings?.map((f: any) => f.finishing_option_id) || [],
      file: undefined,
    }));
  },

  async getOrdersByCustomer(customerId: number): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_finishings (finishing_option_id)
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(order => ({
      ...order,
      finishing: order.order_finishings?.map((f: any) => f.finishing_option_id) || [],
      file: undefined,
    }));
  },

  async createOrder(order: Order): Promise<Order> {
    const { finishing, file, ...orderData } = order;

    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (error) throw error;

    if (finishing && finishing.length > 0) {
      const finishingData = finishing.map(fid => ({
        order_id: data.id,
        finishing_option_id: fid,
      }));

      const { error: finishingError } = await supabase
        .from('order_finishings')
        .insert(finishingData);

      if (finishingError) throw finishingError;
    }

    return { ...data, finishing, file: undefined };
  },

  async updateOrderStatus(orderId: string, status: OrderStatus, rejectionReason?: string): Promise<void> {
    const updateData: any = { status, updated_at: new Date().toISOString() };

    if (rejectionReason !== undefined) {
      updateData.rejection_reason = rejectionReason;
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (error) throw error;
  },

  async updateOrderFile(orderId: string, fileName: string, fileUrl?: string): Promise<void> {
    const updateData: any = {
      file_name: fileName,
      status: OrderStatus.FILE_REVIEW,
      rejection_reason: null,
      updated_at: new Date().toISOString(),
    };

    if (fileUrl) {
      updateData.file_url = fileUrl;
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (error) throw error;
  },

  async getOrdersForReview(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_finishings (finishing_option_id)
      `)
      .eq('status', OrderStatus.FILE_REVIEW)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return data.map(order => ({
      ...order,
      finishing: order.order_finishings?.map((f: any) => f.finishing_option_id) || [],
      file: undefined,
    }));
  },

  async getDashboardStats() {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('status, total_price, created_at');

    if (error) throw error;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newOrders = orders.filter(o =>
      o.status === 'WAITING_PAYMENT' || o.status === 'PENDING'
    ).length;

    const pendingPayments = orders.filter(o =>
      o.status === 'PAYMENT_VERIFIED'
    ).length;

    const inProgress = orders.filter(o =>
      ['APPROVED', 'PRINTING', 'FILE_REVIEW'].includes(o.status)
    ).length;

    const dailyRevenue = orders
      .filter(o => new Date(o.created_at) >= today)
      .reduce((sum, o) => sum + parseFloat(o.total_price.toString()), 0);

    return {
      newOrders,
      pendingPayments,
      inProgress,
      dailyRevenue,
    };
  },

  async getOperatorStats() {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('status, created_at');

    if (error) throw error;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filesToReview = orders.filter(o => o.status === 'FILE_REVIEW').length;
    const printQueue = orders.filter(o => ['APPROVED', 'PRINTING'].includes(o.status)).length;
    const completedToday = orders.filter(o =>
      o.status === 'COMPLETED' && new Date(o.created_at) >= today
    ).length;

    return {
      filesToReview,
      printQueue,
      completedToday,
    };
  },
};
