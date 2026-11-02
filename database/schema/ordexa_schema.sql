-- =========================================================
-- ORDEXA - Smart Queue Management System
-- Database Schema (MySQL 8.0+)
-- =========================================================

CREATE DATABASE IF NOT EXISTS ordexa_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE ordexa_db;

-- ---------------------------------------------------------
-- 1. ADMINS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- 2. USERS (CUSTOMERS) TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- 3. ORGANIZATIONS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS organizations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    admin_id BIGINT NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_organizations_admin FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- 4. COUNTERS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS counters (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    CONSTRAINT fk_counters_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- 5. SERVICE ITEMS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS service_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    average_service_time INT DEFAULT 10,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT fk_services_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- 6. SERVICE ITEM COUNTERS (MAPPING) TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS service_item_counters (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    service_item_id BIGINT NOT NULL,
    counter_id BIGINT NOT NULL,
    CONSTRAINT fk_sic_service FOREIGN KEY (service_item_id) REFERENCES service_items(id) ON DELETE CASCADE,
    CONSTRAINT fk_sic_counter FOREIGN KEY (counter_id) REFERENCES counters(id) ON DELETE CASCADE,
    UNIQUE KEY uk_service_counter (service_item_id, counter_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- 7. STAFF TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS staff (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    counter_id BIGINT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'STAFF',
    status VARCHAR(50) DEFAULT 'ACTIVE',
    CONSTRAINT fk_staff_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_staff_counter FOREIGN KEY (counter_id) REFERENCES counters(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- 8. QUEUE TOKENS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS queue_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    counter_id BIGINT NOT NULL,
    user_id BIGINT,
    service_id BIGINT,
    token_number BIGINT NOT NULL,
    token_code VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'WAITING',
    walk_in_name VARCHAR(255),
    walk_in_phone VARCHAR(50),
    walk_in_note VARCHAR(500),
    added_time_minutes INT DEFAULT 0,
    created_at DATETIME NOT NULL,
    called_at DATETIME,
    completed_at DATETIME,
    CONSTRAINT fk_tokens_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_tokens_counter FOREIGN KEY (counter_id) REFERENCES counters(id) ON DELETE CASCADE,
    CONSTRAINT fk_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_tokens_service FOREIGN KEY (service_id) REFERENCES service_items(id) ON DELETE SET NULL,
    INDEX idx_org_status (organization_id, status),
    INDEX idx_counter_status (counter_id, status),
    INDEX idx_user_status (user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- 9. NOTIFICATIONS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message VARCHAR(500) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'UNREAD',
    created_at DATETIME NOT NULL,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
