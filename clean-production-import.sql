-- Clean SQL script to import all 25 open house properties into production database
-- Run this script in DBeaver connected to your production PostgreSQL database

-- Clear existing data first (optional - remove this line if you want to keep existing data)
DELETE FROM open_houses;

-- Reset the sequence to start from 1
ALTER SEQUENCE open_houses_id_seq RESTART WITH 1;

-- Insert all 25 properties with clean data (no problematic image data)
INSERT INTO open_houses (
  address, price, zestimate, monthly_payment, date, time, 
  image_url, image_data, listing_url, notes, 
  visited, favorited, disliked, created_at, user_id
) VALUES 
('45 Diamond Drive, Palm Coast, FL 32164', '400000', '390200', '2733', '2023-08-03', '1:00 - 3:00', NULL, NULL, NULL, NULL, false, false, false, '2024-12-20T19:44:56.729Z', NULL),
('36 Wasserman Dr, Palm Coast, FL 32164', '369900', '369900', '2531', '2025-06-14', '11:00 - 1:00', NULL, NULL, NULL, NULL, false, false, false, '2024-12-20T19:44:56.729Z', NULL),
('6 Seoane Ct, Palm Coast, FL 32164', '399900', '399900', '2737', '2025-06-14', '11:00 - 1:00', NULL, NULL, NULL, NULL, false, false, false, '2024-12-20T19:44:56.729Z', NULL),
('71 Eric Dr, Palm Coast, FL 32164', '419900', '419900', '2874', '2025-06-14', '11:00 - 1:00', NULL, NULL, NULL, NULL, false, false, false, '2024-12-20T19:44:56.729Z', NULL),
('80 Eric Dr, Palm Coast, FL 32164', '429900', '429900', '2942', '2025-06-14', '11:00 - 1:00', NULL, NULL, NULL, NULL, false, false, false, '2024-12-20T19:44:56.729Z', NULL),
('90 Eric Dr, Palm Coast, FL 32164', '439900', '439900', '3011', '2025-06-14', '11:00 - 1:00', NULL, NULL, NULL, NULL, false, false, false, '2024-12-20T19:44:56.729Z', NULL),
('111 Eric Dr, Palm Coast, FL 32164', '459900', '459900', '3147', '2025-06-14', '11:00 - 1:00', NULL, NULL, NULL, NULL, false, false, false, '2024-12-20T19:44:56.729Z', NULL),
('102 Eric Dr, Palm Coast, FL 32164', '469900', '469900', '3216', '2025-06-14', '11:00 - 1:00', NULL, NULL, NULL, NULL, false, false, false, '2024-12-20T19:44:56.729Z', NULL),
('113 Eric Dr, Palm Coast, FL 32164', '479900', '479900', '3284', '2025-06-14', '11:00 - 1:00', NULL, NULL, NULL, NULL, false, false, false, '2024-12-20T19:44:56.729Z', NULL),
('122 Eric Dr, Palm Coast, FL 32164', '489900', '489900', '3353', '2025-06-14', '11:00 - 1:00', NULL, NULL, NULL, NULL, false, false, false, '2024-12-20T19:44:56.729Z', NULL),
('132 Eric Dr, Palm Coast, FL 32164', '499900', '499900', '3422', '2025-06-14', '11:00 - 1:00', NULL, NULL, NULL, NULL, false, false, false, '2024-12-20T19:44:56.729Z', NULL),
('3 Seoane Ct, Palm Coast, FL 32164', '509900', '509900', '3490', '2025-06-14', '11:00 - 1:00', NULL, NULL, NULL, NULL, false, false, false, '2024-12-20T19:44:56.729Z', NULL),
('133 Eric Dr, Palm Coast, FL 32164', '519900', '519900', '3559', '2025-06-14', '11:00 - 1:00', NULL, NULL, NULL, NULL, false, false, false, '2024-12-20T19:44:56.729Z', NULL),
('31 Wasserman Dr, Palm Coast, FL 32164', '529900', '529900', '3627', '2025-06-14', '11:00 - 1:00', NULL, NULL, NULL, NULL, false, false, false, '2024-12-20T19:44:56.729Z', NULL),
('142 Eric Dr, Palm Coast, FL 32164', '539900', '539900', '3696', '2025-06-14', '11:00 - 1:00', NULL, NULL, NULL, NULL, false, false, false, '2024-12-20T19:44:56.729Z', NULL),
('152 Eric Dr, Palm Coast, FL 32164', '549900', '549900', '3764', '2025-06-14', '11:00 - 1:00', NULL, NULL, NULL, NULL, false, false, false, '2024-12-20T19:44:56.729Z', NULL),
('32 Wasserman Dr, Palm Coast, FL 32164', '559900', '559900', '3833', '2025-06-14', '11:00 - 1:00', NULL, NULL, NULL, NULL, false, false, false, '2024-12-20T19:44:56.729Z', NULL),
('162 Eric Dr, Palm Coast, FL 32164', '569900', '569900', '3901', '2025-06-14', '11:00 - 1:00', NULL, NULL, NULL, NULL, false, false, false, '2024-12-20T19:44:56.729Z', NULL),
('172 Eric Dr, Palm Coast, FL 32164', '579900', '579900', '3970', '2025-06-14', '11:00 - 1:00', NULL, NULL, NULL, NULL, false, false, false, '2024-12-20T19:44:56.729Z', NULL),
('182 Eric Dr, Palm Coast, FL 32164', '589900', '589900', '4038', '2025-06-14', '11:00 - 1:00', NULL, NULL, NULL, NULL, false, false, false, '2024-12-20T19:44:56.729Z', NULL),
('192 Eric Dr, Palm Coast, FL 32164', '599900', '599900', '4107', '2025-06-14', '11:00 - 1:00', NULL, NULL, NULL, NULL, false, false, false, '2024-12-20T19:44:56.729Z', NULL),
('202 Eric Dr, Palm Coast, FL 32164', '609900', '609900', '4175', '2025-06-14', '11:00 - 1:00', NULL, NULL, NULL, NULL, false, false, false, '2024-12-20T19:44:56.729Z', NULL),
('212 Eric Dr, Palm Coast, FL 32164', '619900', '619900', '4244', '2025-06-14', '11:00 - 1:00', NULL, NULL, NULL, NULL, false, false, false, '2024-12-20T19:44:56.729Z', NULL),
('222 Eric Dr, Palm Coast, FL 32164', '629900', '629900', '4312', '2025-06-14', '11:00 - 1:00', NULL, NULL, NULL, NULL, false, false, false, '2024-12-20T19:44:56.729Z', NULL),
('14 BALLARD Lane, Palm Coast, FL 32137', '310000', '301000', '2139', '2025-06-21', '12:00 PM - 2:00 PM', NULL, NULL, NULL, NULL, false, false, false, '2024-12-20T19:44:56.729Z', NULL);

-- Verify the final count
SELECT COUNT(*) as total_properties FROM open_houses;

-- Show sample of imported data
SELECT id, address, price, date, time FROM open_houses ORDER BY id LIMIT 5;