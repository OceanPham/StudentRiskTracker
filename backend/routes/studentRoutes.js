const express = require('express');
const StudentController = require('../controllers/studentController');

const router = express.Router();

/**
 * @route GET /students
 * @desc Lấy danh sách tất cả sinh viên
 * @access Public
 */
router.get('/students', StudentController.getAllStudents);

/**
 * @route GET /students/risk/:level
 * @desc Lọc sinh viên theo mức độ rủi ro (LOW, MEDIUM, HIGH)
 * @access Public
 */
router.get('/students/risk/:level', StudentController.getStudentsByRiskLevel);

/**
 * @route GET /students/:id
 * @desc Lấy chi tiết một sinh viên
 * @access Public
 */
router.get('/students/:id', StudentController.getStudentById);

/**
 * @route POST /students/:id/evaluate
 * @desc Đánh giá rủi ro bỏ học cho một sinh viên
 * @access Public
 */
router.post('/students/:id/evaluate', StudentController.evaluateStudentRisk);

/**
 * @route GET /config/thresholds
 * @desc Lấy ngưỡng cấu hình hiện tại
 * @access Public
 */
router.get('/config/thresholds', StudentController.getThresholds);

/**
 * @route PUT /config/thresholds
 * @desc Cập nhật ngưỡng cấu hình
 * @access Public
 */
router.put('/config/thresholds', StudentController.updateThresholds);

module.exports = router;