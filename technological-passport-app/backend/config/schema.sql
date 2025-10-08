-- Database Schema for Technological Passport System
-- This schema defines the structure for storing technological passport data

-- Create database
CREATE DATABASE IF NOT EXISTS technological_passport_db;
USE technological_passport_db;

-- Main technological passport table
CREATE TABLE technological_passports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    passport_id VARCHAR(50) UNIQUE NOT NULL,
    article_number VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100) NOT NULL,
    assembly_name VARCHAR(200) NOT NULL,
    unit_serial VARCHAR(100) NOT NULL,
    inv_number VARCHAR(50) NOT NULL,
    current_sheet INT NOT NULL DEFAULT 1,
    total_sheets INT NOT NULL DEFAULT 20,
    manufacturing_date DATE NOT NULL,
    assembly_type VARCHAR(100),
    quality_status ENUM('PASS', 'FAIL', 'PENDING') DEFAULT 'PENDING',
    inspector_name VARCHAR(100),
    notes TEXT,
    checked_by VARCHAR(100),
    authorized_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_passport_id (passport_id),
    INDEX idx_article_number (article_number),
    INDEX idx_serial_number (serial_number)
);

-- Assembly types lookup table
CREATE TABLE assembly_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type_code VARCHAR(20) UNIQUE NOT NULL,
    type_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quality inspectors table
CREATE TABLE quality_inspectors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    inspector_code VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Process steps table (for detailed process tracking)
CREATE TABLE process_steps (
    id INT PRIMARY KEY AUTO_INCREMENT,
    passport_id VARCHAR(50) NOT NULL,
    step_number INT NOT NULL,
    step_name VARCHAR(200) NOT NULL,
    step_description TEXT,
    status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED') DEFAULT 'PENDING',
    completed_by VARCHAR(100),
    completed_at TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (passport_id) REFERENCES technological_passports(passport_id) ON DELETE CASCADE,
    INDEX idx_passport_step (passport_id, step_number)
);

-- Insert sample assembly types
INSERT INTO assembly_types (type_code, type_name, description) VALUES
('CK310', 'CK310 Assembly', 'Main assembly unit for CK310 series'),
('CK311', 'CK311 Assembly', 'Secondary assembly unit for CK311 series'),
('CK312', 'CK312 Assembly', 'Tertiary assembly unit for CK312 series');

-- Insert sample quality inspectors
INSERT INTO quality_inspectors (inspector_code, first_name, last_name, department) VALUES
('INS001', 'Desh', 'Pandian', 'Quality Control'),
('INS002', 'Sarala', 'Kumar', 'Quality Assurance'),
('INS003', 'Rajesh', 'Patel', 'Final Inspection');

-- Insert sample technological passport data
INSERT INTO technological_passports (
    passport_id, article_number, serial_number, assembly_name, unit_serial,
    inv_number, current_sheet, total_sheets, manufacturing_date, assembly_type,
    quality_status, inspector_name, notes, checked_by, authorized_by
) VALUES
('TP001', 'CK310__101__INV101__2001', 'K310-0200-100', 'CK310 Assembly', 'CK310 101',
 'INV101', 1, 20, '2021-10-06', 'CK310', 'PASS', 'Mr DeshPandian', 
 'Assembly completed successfully. All quality checks passed.', 'Mr DeshPandian', 'Mr Sarala'),

('TP002', 'CK310__102__INV102__2002', 'K310-0200-101', 'CK310 Assembly', 'CK310 102',
 'INV102', 1, 20, '2021-10-07', 'CK310', 'PENDING', 'Mr Rajesh Patel', 
 'Assembly in progress. Quality inspection pending.', 'Mr Rajesh Patel', 'Mr Sarala'),

('TP003', 'CK311__201__INV201__3001', 'K311-0300-200', 'CK311 Assembly', 'CK311 201',
 'INV201', 1, 25, '2021-10-08', 'CK311', 'FAIL', 'Mr DeshPandian', 
 'Assembly failed quality check. Requires rework.', 'Mr DeshPandian', 'Mr Sarala');

-- Insert sample process steps for TP001
INSERT INTO process_steps (passport_id, step_number, step_name, step_description, status, completed_by, completed_at) VALUES
('TP001', 1, 'Component Preparation', 'Prepare all required components for assembly', 'COMPLETED', 'Assembly Team A', '2021-10-06 09:00:00'),
('TP001', 2, 'Initial Assembly', 'Assemble primary components', 'COMPLETED', 'Assembly Team A', '2021-10-06 11:30:00'),
('TP001', 3, 'Quality Check 1', 'First quality inspection', 'COMPLETED', 'Mr DeshPandian', '2021-10-06 14:00:00'),
('TP001', 4, 'Final Assembly', 'Complete final assembly steps', 'COMPLETED', 'Assembly Team B', '2021-10-06 16:00:00'),
('TP001', 5, 'Final Quality Check', 'Final quality inspection and approval', 'COMPLETED', 'Mr DeshPandian', '2021-10-06 17:30:00');

-- Create views for easier data access
CREATE VIEW passport_summary AS
SELECT 
    tp.passport_id,
    tp.article_number,
    tp.serial_number,
    tp.assembly_name,
    tp.unit_serial,
    tp.inv_number,
    tp.current_sheet,
    tp.total_sheets,
    tp.manufacturing_date,
    at.type_name as assembly_type_name,
    tp.quality_status,
    tp.inspector_name,
    tp.notes,
    tp.checked_by,
    tp.authorized_by,
    tp.created_at,
    tp.updated_at
FROM technological_passports tp
LEFT JOIN assembly_types at ON tp.assembly_type = at.type_code;

-- Create stored procedure to get passport by ID
DELIMITER //
CREATE PROCEDURE GetPassportById(IN passport_id_param VARCHAR(50))
BEGIN
    SELECT * FROM passport_summary WHERE passport_id = passport_id_param;
END //
DELIMITER ;

-- Create stored procedure to get all passports
DELIMITER //
CREATE PROCEDURE GetAllPassports()
BEGIN
    SELECT * FROM passport_summary ORDER BY created_at DESC;
END //
DELIMITER ;

-- Create stored procedure to update passport status
DELIMITER //
CREATE PROCEDURE UpdatePassportStatus(
    IN passport_id_param VARCHAR(50),
    IN new_status ENUM('PASS', 'FAIL', 'PENDING'),
    IN inspector_name_param VARCHAR(100),
    IN notes_param TEXT
)
BEGIN
    UPDATE technological_passports 
    SET quality_status = new_status,
        inspector_name = inspector_name_param,
        notes = notes_param,
        updated_at = CURRENT_TIMESTAMP
    WHERE passport_id = passport_id_param;
END //
DELIMITER ;