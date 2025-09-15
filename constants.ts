
import { User, Category, Material, FinishingOption, UserType, PaymentMethod, PaymentMethodType } from './types';

export const MOCK_USERS: User[] = [
  { id: 1, name: 'John Customer', email: 'customer@test.com', user_type: UserType.CUSTOMER },
  { id: 2, name: 'Admin User', email: 'admin@test.com', user_type: UserType.ADMIN },
  { id: 3, name: 'Operator Print', email: 'operator@test.com', user_type: UserType.OPERATOR }
];

export const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: 'document', description: 'Dokumen (PDF, Word, etc.)' },
  { id: 2, name: 'banner', description: 'Banner & Spanduk' },
  { id: 3, name: 'business_card', description: 'Kartu Nama' }
];

export const MOCK_MATERIALS: Material[] = [
  { id: 1, category_id: 1, name: 'HVS 80gsm', price_per_unit: 500, unit_type: 'sheet' },
  { id: 2, category_id: 1, name: 'Art Paper 120gsm', price_per_unit: 1000, unit_type: 'sheet' },
  { id: 3, category_id: 2, name: 'Vinyl Banner', price_per_unit: 25000, unit_type: 'sqm' },
  { id: 4, category_id: 2, name: 'Flexi Korea', price_per_unit: 35000, unit_type: 'sqm' },
  { id: 5, category_id: 3, name: 'Art Carton 260gsm', price_per_unit: 1500, unit_type: 'sheet' }
];

export const MOCK_FINISHING_OPTIONS: FinishingOption[] = [
  { id: 1, name: 'Laminating Doff', price: 2000, price_type: 'per_unit', applies_to: 'all' },
  { id: 2, name: 'Laminating Glossy', price: 2000, price_type: 'per_unit', applies_to: 'all' },
  { id: 3, name: 'Jilid Spiral', price: 5000, price_type: 'per_job', applies_to: 'document' },
  { id: 4, name: 'Cutting', price: 1000, price_type: 'per_meter', applies_to: 'banner' },
  { id: 5, name: 'Mata Ayam (Eyelets)', price: 1000, price_type: 'per_unit', applies_to: 'banner' }
];

export const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
    {
        id: 1,
        name: 'BCA Bank Transfer',
        type: PaymentMethodType.BANK_TRANSFER,
        details: {
            accountHolder: 'PT Digital Print Sukses',
            accountNumber: '888-1234-567',
            bankName: 'BCA'
        },
        active: true
    },
    {
        id: 2,
        name: 'QRIS',
        type: PaymentMethodType.QRIS,
        details: {
            info: 'Scan the QR code with any supported e-wallet or mobile banking app.'
        },
        active: true,
    },
     {
        id: 3,
        name: 'GoPay',
        type: PaymentMethodType.E_WALLET,
        details: {
            accountHolder: 'PT Digital Print Sukses',
            accountNumber: '08123456789'
        },
        active: false,
    }
];