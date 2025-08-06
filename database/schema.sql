-- Tạo database cho hệ thống đánh giá rủi ro bỏ học
CREATE DATABASE IF NOT EXISTS student_dropout_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE student_dropout_system;

-- Bảng sinh viên
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    enrollment_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng điểm danh
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    attendance_date DATE NOT NULL,
    status ENUM('ATTEND', 'ABSENT') NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    UNIQUE KEY unique_attendance (student_id, attendance_date)
);

-- Bảng bài tập
CREATE TABLE IF NOT EXISTS assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    assignment_name VARCHAR(100) NOT NULL,
    assignment_date DATE NOT NULL,
    due_date DATE,
    submitted BOOLEAN DEFAULT FALSE,
    submission_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- Bảng liên hệ hỗ trợ
CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    contact_date DATE NOT NULL,
    contact_type ENUM('EMAIL', 'PHONE', 'MEETING', 'OTHER') DEFAULT 'EMAIL',
    status ENUM('SUCCESS', 'FAILED') NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- Bảng đánh giá rủi ro
CREATE TABLE IF NOT EXISTS risk_evaluations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    risk_score INT NOT NULL CHECK (risk_score >= 0 AND risk_score <= 3),
    risk_level ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL,
    dropout_probability DECIMAL(5,2) NOT NULL,
    note TEXT,
    attendance_rate DECIMAL(5,2),
    assignment_rate DECIMAL(5,2),
    failed_contacts INT,
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    INDEX idx_risk_level (risk_level),
    INDEX idx_evaluated_at (evaluated_at)
);

-- Bảng cấu hình ngưỡng đánh giá
CREATE TABLE IF NOT EXISTS risk_thresholds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    attendance_threshold DECIMAL(3,2) DEFAULT 0.75,
    assignment_threshold DECIMAL(3,2) DEFAULT 0.50,
    contact_failure_threshold INT DEFAULT 2,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Chèn cấu hình mặc định
INSERT INTO risk_thresholds (attendance_threshold, assignment_threshold, contact_failure_threshold) 
VALUES (0.75, 0.50, 2) 
ON DUPLICATE KEY UPDATE id=id;