/*
  # Digital Print System Database Schema

  ## Overview
  Complete database schema for Digital Print Online System with proper RLS policies.

  ## Tables Created
  
  ### 1. users
  - `id` (serial, primary key)
  - `name` (varchar)
  - `email` (varchar, unique)
  - `user_type` (enum: customer, admin, operator)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

  ### 2. categories
  - `id` (serial, primary key)
  - `name` (varchar, unique)
  - `description` (text)

  ### 3. materials
  - `id` (serial, primary key)
  - `category_id` (foreign key to categories)
  - `name` (varchar)
  - `price_per_unit` (decimal)
  - `unit_type` (enum: sheet, sqm)

  ### 4. finishing_options
  - `id` (serial, primary key)
  - `name` (varchar)
  - `price` (decimal)
  - `price_type` (enum: per_unit, per_job, per_meter)
  - `applies_to` (enum: all, document, banner, business_card)

  ### 5. payment_methods
  - `id` (serial, primary key)
  - `name` (varchar)
  - `type` (varchar)
  - `details` (jsonb)
  - `active` (boolean)

  ### 6. orders
  - `id` (varchar, primary key)
  - `customer_id` (foreign key to users)
  - `status` (enum)
  - `total_price` (decimal)
  - `file_name` (varchar)
  - `file_url` (text)
  - `category` (varchar)
  - `material_id` (foreign key to materials)
  - `copies` (integer)
  - `printing_type` (varchar)
  - `paper_size` (varchar)
  - `printing_sides` (varchar)
  - `custom_width` (varchar)
  - `custom_height` (varchar)
  - `special_instructions` (text)
  - `rejection_reason` (text)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

  ### 7. order_finishings
  - Junction table for orders and finishing_options
  - `order_id` (foreign key)
  - `finishing_option_id` (foreign key)

  ### 8. notifications
  - `id` (serial, primary key)
  - `user_id` (foreign key to users)
  - `message` (text)
  - `type` (varchar)
  - `is_read` (boolean)
  - `created_at` (timestamp)

  ## Security
  - RLS enabled on all tables
  - Customers can view/update their own data
  - Admins have full access to orders, materials, and settings
  - Operators can view orders and update status
  - Public read access to categories, materials, and finishing options
*/

-- Create ENUMS
DO $$ BEGIN
  CREATE TYPE user_type AS ENUM ('customer', 'admin', 'operator');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'PENDING',
    'WAITING_PAYMENT',
    'PAYMENT_VERIFIED',
    'FILE_REVIEW',
    'APPROVED',
    'REJECTED',
    'PRINTING',
    'COMPLETED',
    'CANCELLED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE unit_type AS ENUM ('sheet', 'sqm');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE price_type AS ENUM ('per_unit', 'per_job', 'per_meter');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE applies_to AS ENUM ('all', 'document', 'banner', 'business_card');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  user_type user_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT
);

-- Create materials table
CREATE TABLE IF NOT EXISTS materials (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  name VARCHAR(100) NOT NULL,
  price_per_unit DECIMAL(10, 2) NOT NULL,
  unit_type unit_type NOT NULL
);

-- Create finishing_options table
CREATE TABLE IF NOT EXISTS finishing_options (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  price_type price_type NOT NULL,
  applies_to applies_to NOT NULL
);

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  details JSONB NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(50) PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES users(id),
  status order_status NOT NULL,
  total_price DECIMAL(12, 2) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT,
  category VARCHAR(50) NOT NULL,
  material_id INTEGER NOT NULL REFERENCES materials(id),
  copies INTEGER,
  printing_type VARCHAR(20),
  paper_size VARCHAR(50),
  printing_sides VARCHAR(20),
  custom_width VARCHAR(20),
  custom_height VARCHAR(20),
  special_instructions TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create order_finishings junction table
CREATE TABLE IF NOT EXISTS order_finishings (
  order_id VARCHAR(50) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  finishing_option_id INTEGER NOT NULL REFERENCES finishing_options(id) ON DELETE CASCADE,
  PRIMARY KEY (order_id, finishing_option_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type VARCHAR(20) NOT NULL,
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE finishing_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_finishings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = (SELECT id FROM users WHERE email = auth.jwt()->>'email'))
  WITH CHECK (id = (SELECT id FROM users WHERE email = auth.jwt()->>'email'));

-- RLS Policies for categories (public read)
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING ((SELECT user_type FROM users WHERE email = auth.jwt()->>'email') = 'admin');

-- RLS Policies for materials (public read)
CREATE POLICY "Anyone can view materials"
  ON materials FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert materials"
  ON materials FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT user_type FROM users WHERE email = auth.jwt()->>'email') = 'admin');

CREATE POLICY "Admins can update materials"
  ON materials FOR UPDATE
  TO authenticated
  USING ((SELECT user_type FROM users WHERE email = auth.jwt()->>'email') = 'admin')
  WITH CHECK ((SELECT user_type FROM users WHERE email = auth.jwt()->>'email') = 'admin');

CREATE POLICY "Admins can delete materials"
  ON materials FOR DELETE
  TO authenticated
  USING ((SELECT user_type FROM users WHERE email = auth.jwt()->>'email') = 'admin');

-- RLS Policies for finishing_options (public read)
CREATE POLICY "Anyone can view finishing options"
  ON finishing_options FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage finishing options"
  ON finishing_options FOR ALL
  TO authenticated
  USING ((SELECT user_type FROM users WHERE email = auth.jwt()->>'email') = 'admin');

-- RLS Policies for payment_methods (public read)
CREATE POLICY "Anyone can view payment methods"
  ON payment_methods FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert payment methods"
  ON payment_methods FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT user_type FROM users WHERE email = auth.jwt()->>'email') = 'admin');

CREATE POLICY "Admins can update payment methods"
  ON payment_methods FOR UPDATE
  TO authenticated
  USING ((SELECT user_type FROM users WHERE email = auth.jwt()->>'email') = 'admin')
  WITH CHECK ((SELECT user_type FROM users WHERE email = auth.jwt()->>'email') = 'admin');

CREATE POLICY "Admins can delete payment methods"
  ON payment_methods FOR DELETE
  TO authenticated
  USING ((SELECT user_type FROM users WHERE email = auth.jwt()->>'email') = 'admin');

-- RLS Policies for orders
CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    customer_id = (SELECT id FROM users WHERE email = auth.jwt()->>'email')
    OR (SELECT user_type FROM users WHERE email = auth.jwt()->>'email') IN ('admin', 'operator')
  );

CREATE POLICY "Customers can insert own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = (SELECT id FROM users WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Customers can update own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    customer_id = (SELECT id FROM users WHERE email = auth.jwt()->>'email')
    OR (SELECT user_type FROM users WHERE email = auth.jwt()->>'email') IN ('admin', 'operator')
  )
  WITH CHECK (
    customer_id = (SELECT id FROM users WHERE email = auth.jwt()->>'email')
    OR (SELECT user_type FROM users WHERE email = auth.jwt()->>'email') IN ('admin', 'operator')
  );

CREATE POLICY "Admins can delete orders"
  ON orders FOR DELETE
  TO authenticated
  USING ((SELECT user_type FROM users WHERE email = auth.jwt()->>'email') = 'admin');

-- RLS Policies for order_finishings
CREATE POLICY "Users can view order finishings"
  ON order_finishings FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM orders WHERE customer_id = (SELECT id FROM users WHERE email = auth.jwt()->>'email')
    )
    OR (SELECT user_type FROM users WHERE email = auth.jwt()->>'email') IN ('admin', 'operator')
  );

CREATE POLICY "Customers can insert order finishings"
  ON order_finishings FOR INSERT
  TO authenticated
  WITH CHECK (
    order_id IN (
      SELECT id FROM orders WHERE customer_id = (SELECT id FROM users WHERE email = auth.jwt()->>'email')
    )
  );

CREATE POLICY "Customers can delete order finishings"
  ON order_finishings FOR DELETE
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM orders WHERE customer_id = (SELECT id FROM users WHERE email = auth.jwt()->>'email')
    )
  );

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = (SELECT id FROM users WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT id FROM users WHERE email = auth.jwt()->>'email'))
  WITH CHECK (user_id = (SELECT id FROM users WHERE email = auth.jwt()->>'email'));

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_materials_category_id ON materials(category_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);