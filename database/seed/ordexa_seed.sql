-- =========================================================
-- ORDEXA - Smart Queue Management System
-- Seed Data Script
-- =========================================================

USE ordexa_db;

-- 1. SEED ADMIN (Password: admin123)
-- BCrypt hash for "admin123": $2a$10$7R9rIvlXk1Zl9x1W8U3UYeZ6m5kX4X5X5X5X5X5X5X5X5X5X5X5X5
INSERT INTO admins (id, name, email, password) VALUES
(1, 'Super Admin', 'admin@ordexa.com', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. SEED SAMPLE CUSTOMERS (Password: user123)
INSERT INTO users (id, name, email, password, phone, status) VALUES
(1, 'Rahul Sharma', 'rahul@gmail.com', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', '+91 9876543210', 'ACTIVE'),
(2, 'Priya Patel', 'priya@gmail.com', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', '+91 9876543211', 'ACTIVE'),
(3, 'Amit Verma', 'amit@gmail.com', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', '+91 9876543212', 'ACTIVE')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3. SEED ORGANIZATIONS
INSERT INTO organizations (id, admin_id, name, type, description) VALUES
(1, 1, 'CityCare Multispeciality Hospital', 'HOSPITAL', 'Leading tertiary care hospital with automated outpatient digital queues.')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 4. SEED COUNTERS
INSERT INTO counters (id, organization_id, name, status) VALUES
(1, 1, 'Counter 1 - General OPD', 'OPEN'),
(2, 1, 'Counter 2 - Pediatrics & Specialty', 'OPEN'),
(3, 1, 'Counter 3 - Billing & Pharmacy', 'OPEN')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 5. SEED SERVICE ITEMS
INSERT INTO service_items (id, organization_id, name, average_service_time, status) VALUES
(1, 1, 'General Physician Consultation', 12, 'ACTIVE'),
(2, 1, 'Specialist Consultation', 20, 'ACTIVE'),
(3, 1, 'Express Prescription Billing', 5, 'ACTIVE')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 6. SEED SERVICE ITEM COUNTERS (MAPPINGS)
INSERT INTO service_item_counters (service_item_id, counter_id) VALUES
(1, 1),
(2, 2),
(3, 3)
ON DUPLICATE KEY UPDATE service_item_id=VALUES(service_item_id);

-- 7. SEED SAMPLE STAFF
INSERT INTO staff (id, organization_id, counter_id, name, email, password, role, status) VALUES
(1, 1, 1, 'Dr. Sarah Khan', 'sarah@ordexa.com', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'STAFF', 'ACTIVE'),
(2, 1, 2, 'Dr. Rajesh Gupta', 'rajesh@ordexa.com', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'STAFF', 'ACTIVE'),
(3, 1, 3, 'Kavita Nair', 'kavita@ordexa.com', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'STAFF', 'ACTIVE')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 8. SEED QUEUE TOKENS
INSERT INTO queue_tokens (id, organization_id, counter_id, user_id, service_id, token_number, token_code, status, walk_in_name, created_at, called_at, completed_at) VALUES
(1, 1, 1, 1, 1, 1, 'CIT-GEN-001', 'COMPLETED', NULL, NOW() - INTERVAL 60 MINUTE, NOW() - INTERVAL 45 MINUTE, NOW() - INTERVAL 35 MINUTE),
(2, 1, 1, 2, 1, 2, 'CIT-GEN-002', 'SERVING', NULL, NOW() - INTERVAL 30 MINUTE, NOW() - INTERVAL 10 MINUTE, NULL),
(3, 1, 1, 3, 1, 3, 'CIT-GEN-003', 'WAITING', NULL, NOW() - INTERVAL 15 MINUTE, NULL, NULL),
(4, 1, 3, NULL, 3, 1, 'CIT-EXP-001', 'WAITING', 'Vikram Singh (Walk-in)', NOW() - INTERVAL 5 MINUTE, NULL, NULL)
ON DUPLICATE KEY UPDATE token_code=VALUES(token_code);
