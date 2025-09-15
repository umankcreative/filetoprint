export enum UserType {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  OPERATOR = 'operator',
}

export interface User {
  id: number;
  name: string;
  email: string;
  user_type: UserType;
}

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface Material {
  id: number;
  category_id: number;
  name: string;
  price_per_unit: number;
  unit_type: 'sheet' | 'sqm';
}

export interface FinishingOption {
  id: number;
  name: string;
  price: number;
  price_type: 'per_unit' | 'per_job' | 'per_meter';
  applies_to: 'all' | 'document' | 'banner' | 'business_card';
}

export enum OrderStatus {
  PENDING = 'PENDING',
  WAITING_PAYMENT = 'WAITING_PAYMENT',
  PAYMENT_VERIFIED = 'PAYMENT_VERIFIED',
  FILE_REVIEW = 'FILE_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PRINTING = 'PRINTING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface Order {
  id: string;
  customer_id: number;
  status: OrderStatus;
  total_price: number;
  created_at: string;
  file?: File;
  file_url?: string;
  file_name: string;
  category: string;
  material_id: number;
  copies: number;
  printing_type: 'black_white' | 'color';
  paper_size: string;
  printing_sides: 'single_sided' | 'double_sided';
  finishing: number[];
  custom_width: string;
  custom_height: string;
  special_instructions: string;
  rejection_reason?: string;
}

export interface Notification {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
}

export enum PaymentMethodType {
    BANK_TRANSFER = 'Bank Transfer',
    QRIS = 'QRIS',
    E_WALLET = 'E-Wallet',
}

export interface PaymentMethod {
    id: number;
    name: string; // e.g., "BCA Virtual Account", "GoPay"
    type: PaymentMethodType;
    details: { [key: string]: string }; // e.g., { accountNumber: '12345', accountHolder: 'PT Digital Print' } or { qrCodeUrl: '...' }
    active: boolean;
}


// Admin Dashboard Data
export interface AdminDashboardStats {
    newOrders: number;
    pendingPayments: number;
    inProgress: number;
    dailyRevenue: number;
}

export interface AdminRecentOrder {
    id: string;
    customer_id: number;
    customer_name: string;
    status: OrderStatus;
    total_price: number;
    created_at: string;
}

export interface AdminData {
    dashboardStats: AdminDashboardStats;
    recentOrders: AdminRecentOrder[];
}

// Operator Dashboard Data
export interface OperatorQueueStats {
  filesToReview: number;
  printQueue: number;
  completedToday: number;
}

export interface OperatorTask {
  id: string;
  customer_name: string;
  status: OrderStatus;
  file_name: string;
  category: string;
  submitted_at: string;
  priority: 'high' | 'normal' | 'low';
}

export interface OperatorData {
  queueStats: OperatorQueueStats;
  tasks: OperatorTask[];
}