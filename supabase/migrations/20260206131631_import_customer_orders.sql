/*
  # Import Customer Orders Data

  This migration imports the customer order data from the application JSON file.
  
  1. New Data
    - 5 customer orders with complete details
    - Order finishings relationships
    
  2. Data Imported
    - Orders with IDs ORD-1718886401 through ORD-1718886405
    - Various statuses: COMPLETED, WAITING_PAYMENT, REJECTED, PRINTING, FILE_REVIEW
    - Associated finishing options
    - Custom dimensions and special instructions
*/

-- Delete existing sample orders to avoid duplicates
DELETE FROM order_finishings WHERE order_id IN (
  'ORD-1718886401', 'ORD-1718886402', 'ORD-1718886403', 'ORD-1718886404', 'ORD-1718886405'
);

DELETE FROM orders WHERE id IN (
  'ORD-1718886401', 'ORD-1718886402', 'ORD-1718886403', 'ORD-1718886404', 'ORD-1718886405'
);

-- Insert customer orders
INSERT INTO orders (
  id, customer_id, status, total_price, file_name, file_url, category, material_id,
  copies, printing_type, paper_size, printing_sides, custom_width, custom_height,
  special_instructions, rejection_reason, created_at, updated_at
) VALUES
  (
    'ORD-1718886401', 1, 'COMPLETED', 75000, 'Company_Profile.pdf', NULL,
    'document', 1, 50, 'color', 'A4', 'double_sided', '', '',
    'Jilid spiral di sisi kiri.', NULL, '2023-10-26T10:00:00Z', '2023-10-26T10:00:00Z'
  ),
  (
    'ORD-1718886402', 1, 'WAITING_PAYMENT', 175000, 'Wedding_Banner.jpg', NULL,
    'banner', 3, 1, 'color', '', 'single_sided', '3', '2',
    'Tambahkan 4 mata ayam di setiap sudut.', NULL, '2023-10-27T09:30:00Z', '2023-10-27T09:30:00Z'
  ),
  (
    'ORD-1718886403', 1, 'REJECTED', 50000, 'Business_Card_LowRes.png', NULL,
    'business_card', 5, 1, 'color', 'standard', 'single_sided', '', '',
    'Pastikan warna sesuai dengan brand guide.', 'Resolusi file terlalu rendah. Mohon unggah file dengan resolusi minimal 300 DPI.',
    '2023-10-27T11:00:00Z', '2023-10-27T11:00:00Z'
  ),
  (
    'ORD-1718886404', 1, 'PRINTING', 25000, 'Proposal_Project_Q4.docx', NULL,
    'document', 2, 10, 'black_white', 'A4', 'single_sided', '', '',
    '', NULL, '2023-10-27T12:45:00Z', '2023-10-27T12:45:00Z'
  ),
  (
    'ORD-1718886405', 1, 'FILE_REVIEW', 150000, 'Marketing_Banner_Final.jpg',
    'https://www.dropbox.com/s/sample/Marketing_Banner_Final.jpg?dl=0',
    'banner', 4, 1, 'color', '', 'single_sided', '2.5', '1',
    'Warna harus cerah dan tajam.', NULL, '2023-10-27T14:20:00Z', '2023-10-27T14:20:00Z'
  );

-- Insert order finishings relationships
INSERT INTO order_finishings (order_id, finishing_option_id) VALUES
  ('ORD-1718886401', 3),
  ('ORD-1718886402', 5),
  ('ORD-1718886403', 1)
ON CONFLICT DO NOTHING;

SELECT 'Customer orders imported successfully' as result;