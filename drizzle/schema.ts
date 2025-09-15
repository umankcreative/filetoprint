import {
  pgTable,
  serial,
  varchar,
  integer,
  text,
  pgEnum,
  timestamp,
  decimal,
  boolean,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ENUMS matching types.ts
export const userTypeEnum = pgEnum('user_type', ['customer', 'admin', 'operator']);
export const orderStatusEnum = pgEnum('order_status', [
  'PENDING',
  'WAITING_PAYMENT',
  'PAYMENT_VERIFIED',
  'FILE_REVIEW',
  'APPROVED',
  'REJECTED',
  'PRINTING',
  'COMPLETED',
  'CANCELLED',
]);
export const unitTypeEnum = pgEnum('unit_type', ['sheet', 'sqm']);
export const priceTypeEnum = pgEnum('price_type', ['per_unit', 'per_job', 'per_meter']);
export const appliesToEnum = pgEnum('applies_to', ['all', 'document', 'banner', 'business_card']);
export const printingTypeEnum = pgEnum('printing_type', ['black_white', 'color']);
export const notificationTypeEnum = pgEnum('notification_type', ['success', 'error', 'info']);

// TABLES

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  userType: userTypeEnum('user_type').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const categories = pgTable('categories', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    description: text('description'),
});

export const materials = pgTable('materials', {
    id: serial('id').primaryKey(),
    categoryId: integer('category_id').notNull().references(() => categories.id),
    name: varchar('name', { length: 100 }).notNull(),
    pricePerUnit: decimal('price_per_unit', { precision: 10, scale: 2 }).notNull(),
    unitType: unitTypeEnum('unit_type').notNull(),
});

export const finishingOptions = pgTable('finishing_options', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    priceType: priceTypeEnum('price_type').notNull(),
    appliesTo: appliesToEnum('applies_to').notNull(),
});

export const orders = pgTable('orders', {
    id: varchar('id', { length: 50 }).primaryKey(), // e.g., 'ORD-1678886401'
    customerId: integer('customer_id').notNull().references(() => users.id),
    status: orderStatusEnum('status').notNull(),
    totalPrice: decimal('total_price', { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp('created_at').notNull(),
    fileName: varchar('file_name', { length: 255 }).notNull(),
    category: varchar('category', { length: 50 }).notNull(),
    materialId: integer('material_id').notNull().references(() => materials.id),
    copies: integer('copies'),
    printingType: printingTypeEnum('printing_type'),
    paperSize: varchar('paper_size', { length: 50 }),
    customWidth: varchar('custom_width', { length: 20 }),
    customHeight: varchar('custom_height', { length: 20 }),
    specialInstructions: text('special_instructions'),
    rejectionReason: text('rejection_reason'),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Junction table for Order <-> FinishingOption
export const orderFinishings = pgTable('order_finishings', {
    orderId: varchar('order_id', { length: 50 }).notNull().references(() => orders.id, { onDelete: 'cascade' }),
    finishingOptionId: integer('finishing_option_id').notNull().references(() => finishingOptions.id, { onDelete: 'cascade' }),
  }, (t) => ({
    pk: primaryKey({ columns: [t.orderId, t.finishingOptionId] }),
  })
);

export const notifications = pgTable('notifications', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    message: text('message').notNull(),
    type: notificationTypeEnum('notification_type').notNull(),
    isRead: boolean('is_read').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// RELATIONS

export const usersRelations = relations(users, ({ many }) => ({
    orders: many(orders),
    notifications: many(notifications),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
    materials: many(materials),
}));

export const materialsRelations = relations(materials, ({ one }) => ({
    category: one(categories, {
        fields: [materials.categoryId],
        references: [categories.id],
    }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
    customer: one(users, {
        fields: [orders.customerId],
        references: [users.id],
    }),
    material: one(materials, {
        fields: [orders.materialId],
        references: [materials.id],
    }),
    finishings: many(orderFinishings),
}));

export const finishingOptionsRelations = relations(finishingOptions, ({ many }) => ({
    orders: many(orderFinishings),
}));

export const orderFinishingsRelations = relations(orderFinishings, ({ one }) => ({
    order: one(orders, {
        fields: [orderFinishings.orderId],
        references: [orders.id],
    }),
    finishingOption: one(finishingOptions, {
        fields: [orderFinishings.finishingOptionId],
        references: [finishingOptions.id],
    }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
    user: one(users, {
        fields: [notifications.userId],
        references: [users.id],
    }),
}));
