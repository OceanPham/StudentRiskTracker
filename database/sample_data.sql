-- Dữ liệu mẫu cho hệ thống đánh giá rủi ro bỏ học
USE student_dropout_system;

-- Chèn dữ liệu sinh viên
INSERT INTO students (student_id, student_name, email, phone, enrollment_date) VALUES
('STDA', 'Nguyễn Văn A', 'student.a@university.edu', '0901234567', '2023-09-01'),
('STDB', 'Trần Thị B', 'student.b@university.edu', '0901234568', '2023-09-01'),
('STDC', 'Lê Văn C', 'student.c@university.edu', '0901234569', '2023-09-01'),
('STDD', 'Phạm Thị D', 'student.d@university.edu', '0901234570', '2023-09-01'),
('STDE', 'Hoàng Văn E', 'student.e@university.edu', '0901234571', '2023-09-01');

-- Dữ liệu điểm danh cho sinh viên STDA (tham dự tốt)
INSERT INTO attendance (student_id, attendance_date, status) VALUES
('STDA', '2025-06-01', 'ATTEND'),
('STDA', '2025-06-02', 'ATTEND'),
('STDA', '2025-06-03', 'ABSENT'),
('STDA', '2025-06-04', 'ATTEND'),
('STDA', '2025-06-05', 'ATTEND'),
('STDA', '2025-06-06', 'ATTEND'),
('STDA', '2025-06-07', 'ATTEND'),
('STDA', '2025-06-08', 'ATTEND'),
('STDA', '2025-06-09', 'ATTEND'),
('STDA', '2025-06-10', 'ATTEND'),
('STDA', '2025-06-11', 'ATTEND'),
('STDA', '2025-06-12', 'ATTEND'),
('STDA', '2025-06-13', 'ATTEND'),
('STDA', '2025-06-14', 'ATTEND'),
('STDA', '2025-06-15', 'ATTEND'),
('STDA', '2025-06-16', 'ATTEND');

-- Dữ liệu điểm danh cho sinh viên STDB (tham dự trung bình)
INSERT INTO attendance (student_id, attendance_date, status) VALUES
('STDB', '2025-06-01', 'ATTEND'),
('STDB', '2025-06-02', 'ABSENT'),
('STDB', '2025-06-03', 'ATTEND'),
('STDB', '2025-06-04', 'ABSENT'),
('STDB', '2025-06-05', 'ATTEND'),
('STDB', '2025-06-06', 'ABSENT'),
('STDB', '2025-06-07', 'ATTEND'),
('STDB', '2025-06-08', 'ABSENT'),
('STDB', '2025-06-09', 'ATTEND'),
('STDB', '2025-06-10', 'ATTEND'),
('STDB', '2025-06-11', 'ATTEND'),
('STDB', '2025-06-12', 'ABSENT'),
('STDB', '2025-06-13', 'ABSENT'),
('STDB', '2025-06-14', 'ABSENT'),
('STDB', '2025-06-15', 'ATTEND'),
('STDB', '2025-06-16', 'ATTEND');

-- Dữ liệu điểm danh cho sinh viên STDC (tham dự kém)
INSERT INTO attendance (student_id, attendance_date, status) VALUES
('STDC', '2025-06-01', 'ABSENT'),
('STDC', '2025-06-02', 'ATTEND'),
('STDC', '2025-06-03', 'ATTEND'),
('STDC', '2025-06-04', 'ABSENT'),
('STDC', '2025-06-05', 'ATTEND'),
('STDC', '2025-06-06', 'ATTEND'),
('STDC', '2025-06-07', 'ATTEND'),
('STDC', '2025-06-08', 'ABSENT'),
('STDC', '2025-06-09', 'ATTEND'),
('STDC', '2025-06-10', 'ABSENT'),
('STDC', '2025-06-11', 'ATTEND'),
('STDC', '2025-06-12', 'ABSENT'),
('STDC', '2025-06-13', 'ATTEND'),
('STDC', '2025-06-14', 'ATTEND'),
('STDC', '2025-06-15', 'ATTEND'),
('STDC', '2025-06-16', 'ATTEND');

-- Dữ liệu điểm danh cho sinh viên STDD (tham dự tốt)
INSERT INTO attendance (student_id, attendance_date, status) VALUES
('STDD', '2025-06-01', 'ATTEND'),
('STDD', '2025-06-02', 'ATTEND'),
('STDD', '2025-06-03', 'ATTEND'),
('STDD', '2025-06-04', 'ATTEND'),
('STDD', '2025-06-05', 'ATTEND'),
('STDD', '2025-06-06', 'ATTEND'),
('STDD', '2025-06-07', 'ATTEND'),
('STDD', '2025-06-08', 'ATTEND');

-- Dữ liệu điểm danh cho sinh viên STDE (ít dữ liệu)
INSERT INTO attendance (student_id, attendance_date, status) VALUES
('STDE', '2025-06-01', 'ABSENT'),
('STDE', '2025-06-02', 'ABSENT'),
('STDE', '2025-06-03', 'ABSENT'),
('STDE', '2025-06-04', 'ATTEND');

-- Dữ liệu bài tập
INSERT INTO assignments (student_id, assignment_name, assignment_date, due_date, submitted, submission_date) VALUES
-- STDA - nộp đầy đủ
('STDA', 'Homework 1', '2025-06-01', '2025-06-08', TRUE, '2025-06-07'),
('STDA', 'Homework 2', '2025-06-08', '2025-06-15', TRUE, '2025-06-14'),
('STDA', 'Project 1', '2025-06-10', '2025-06-20', TRUE, '2025-06-19'),

-- STDB - nộp một phần
('STDB', 'Homework 1', '2025-06-01', '2025-06-08', TRUE, '2025-06-08'),
('STDB', 'Homework 2', '2025-06-08', '2025-06-15', FALSE, NULL),
('STDB', 'Project 1', '2025-06-10', '2025-06-20', FALSE, NULL),

-- STDC - không nộp
('STDC', 'Homework 1', '2025-06-01', '2025-06-08', FALSE, NULL),
('STDC', 'Homework 2', '2025-06-08', '2025-06-15', FALSE, NULL),
('STDC', 'Project 1', '2025-06-10', '2025-06-20', FALSE, NULL),

-- STDD - nộp đầy đủ
('STDD', 'Homework 1', '2025-06-01', '2025-06-08', TRUE, '2025-06-06'),
('STDD', 'Homework 2', '2025-06-08', '2025-06-15', TRUE, '2025-06-13'),
('STDD', 'Project 1', '2025-06-10', '2025-06-20', TRUE, '2025-06-18'),

-- STDE - không nộp
('STDE', 'Homework 1', '2025-06-01', '2025-06-08', FALSE, NULL),
('STDE', 'Homework 2', '2025-06-08', '2025-06-15', FALSE, NULL);

-- Dữ liệu liên hệ hỗ trợ
INSERT INTO contacts (student_id, contact_date, contact_type, status, notes) VALUES
-- STDA - ít liên hệ, thành công
('STDA', '2025-06-05', 'EMAIL', 'SUCCESS', 'Trả lời nhanh và tích cực'),

-- STDB - nhiều liên hệ, một số thất bại
('STDB', '2025-06-20', 'EMAIL', 'FAILED', 'Không phản hồi email'),
('STDB', '2025-06-22', 'PHONE', 'FAILED', 'Không trả lời điện thoại'),
('STDB', '2025-06-25', 'MEETING', 'SUCCESS', 'Đã gặp và trao đổi'),

-- STDC - nhiều liên hệ thất bại
('STDC', '2025-06-20', 'EMAIL', 'FAILED', 'Không phản hồi email'),
('STDC', '2025-06-22', 'PHONE', 'FAILED', 'Không trả lời điện thoại'),
('STDC', '2025-06-24', 'EMAIL', 'FAILED', 'Email bounce back'),
('STDC', '2025-06-26', 'MEETING', 'FAILED', 'Không đến cuộc hẹn'),

-- STDD - liên hệ thành công
('STDD', '2025-06-20', 'EMAIL', 'SUCCESS', 'Phản hồi tích cực'),

-- STDE - liên hệ thất bại nhiều
('STDE', '2025-06-18', 'EMAIL', 'FAILED', 'Không phản hồi'),
('STDE', '2025-06-20', 'PHONE', 'FAILED', 'Số điện thoại không liên lạc được'),
('STDE', '2025-06-22', 'EMAIL', 'FAILED', 'Tiếp tục không phản hồi');