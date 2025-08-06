const Student = require('../models/Student');

class StudentController {
    /**
     * Lấy danh sách tất cả sinh viên
     * GET /students
     */
    static async getAllStudents(req, res) {
        try {
            const result = await Student.findAll();

            if (!result.success) {
                return res.status(500).json({
                    success: false,
                    message: 'Lỗi khi lấy danh sách sinh viên',
                    error: result.error
                });
            }

            res.json({
                success: true,
                message: 'Lấy danh sách sinh viên thành công',
                data: result.data,
                count: result.data.length
            });
        } catch (error) {
            console.error('Lỗi getAllStudents:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy danh sách sinh viên',
                error: error.message
            });
        }
    }

    /**
     * Lấy chi tiết một sinh viên
     * GET /students/:id
     */
    static async getStudentById(req, res) {
        try {
            const { id } = req.params;
            const result = await Student.findById(id);

            if (!result.success) {
                return res.status(500).json({
                    success: false,
                    message: 'Lỗi khi lấy thông tin sinh viên',
                    error: result.error
                });
            }

            if (result.data.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: `Không tìm thấy sinh viên với ID: ${id}`
                });
            }

            // Lấy thêm dữ liệu chi tiết
            const studentData = result.data[0];
            const [attendanceResult, assignmentResult, contactResult] = await Promise.all([
                Student.getAttendanceData(id),
                Student.getAssignmentData(id),
                Student.getContactData(id)
            ]);

            const detailedData = {
                ...studentData,
                attendance_records: attendanceResult.success ? attendanceResult.data : [],
                assignment_records: assignmentResult.success ? assignmentResult.data : [],
                contact_records: contactResult.success ? contactResult.data : []
            };

            res.json({
                success: true,
                message: 'Lấy thông tin sinh viên thành công',
                data: detailedData
            });
        } catch (error) {
            console.error('Lỗi getStudentById:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy thông tin sinh viên',
                error: error.message
            });
        }
    }

    /**
     * Lọc sinh viên theo mức độ rủi ro
     * GET /students/risk/:level
     */
    static async getStudentsByRiskLevel(req, res) {
        try {
            const { level } = req.params;
            const validLevels = ['LOW', 'MEDIUM', 'HIGH'];

            if (!validLevels.includes(level.toUpperCase())) {
                return res.status(400).json({
                    success: false,
                    message: 'Mức độ rủi ro không hợp lệ. Sử dụng: LOW, MEDIUM, HIGH'
                });
            }

            const result = await Student.findByRiskLevel(level.toUpperCase());

            if (!result.success) {
                return res.status(500).json({
                    success: false,
                    message: 'Lỗi khi lọc sinh viên theo mức độ rủi ro',
                    error: result.error
                });
            }

            res.json({
                success: true,
                message: `Lấy danh sách sinh viên với mức độ rủi ro ${level.toUpperCase()} thành công`,
                data: result.data,
                count: result.data.length,
                risk_level: level.toUpperCase()
            });
        } catch (error) {
            console.error('Lỗi getStudentsByRiskLevel:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lọc sinh viên theo mức độ rủi ro',
                error: error.message
            });
        }
    }

    /**
     * Đánh giá rủi ro cho một sinh viên
     * POST /students/:id/evaluate
     */
    static async evaluateStudentRisk(req, res) {
        try {
            const { id } = req.params;

            // Kiểm tra sinh viên có tồn tại không
            const studentResult = await Student.findById(id);
            if (!studentResult.success || studentResult.data.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: `Không tìm thấy sinh viên với ID: ${id}`
                });
            }

            // Lấy ngưỡng cấu hình
            const thresholds = await Student.getRiskThresholds();

            // Tính toán các chỉ số
            const [attendanceRate, assignmentRate, failedContacts] = await Promise.all([
                Student.calculateAttendanceRate(id),
                Student.calculateAssignmentRate(id),
                Student.countFailedContacts(id)
            ]);

            // Tính điểm rủi ro
            let riskScore = 0;
            const riskFactors = [];

            // Kiểm tra tỷ lệ tham dự
            if (attendanceRate < thresholds.attendance_threshold) {
                riskScore += 1;
                riskFactors.push('attendance');
            }

            // Kiểm tra tỷ lệ nộp bài tập
            if (assignmentRate < thresholds.assignment_threshold) {
                riskScore += 1;
                riskFactors.push('assignment');
            }

            // Kiểm tra số lần liên hệ thất bại
            if (failedContacts >= thresholds.contact_failure_threshold) {
                riskScore += 1;
                riskFactors.push('communication');
            }

            // Xác định mức độ rủi ro
            let riskLevel;
            if (riskScore <= 1) {
                riskLevel = 'LOW';
            } else if (riskScore === 2) {
                riskLevel = 'MEDIUM';
            } else {
                riskLevel = 'HIGH';
            }

            // Tính xác suất bỏ học
            const dropoutProbability = Math.round((riskScore / 3) * 100);

            // Tạo ghi chú
            const note = riskFactors.length > 0 ? riskFactors.join(', ') : 'No risk factors detected';

            // Dữ liệu đánh giá
            const riskData = {
                risk_score: riskScore,
                risk_level: riskLevel,
                dropout_probability: dropoutProbability,
                note: note,
                attendance_rate: Math.round(attendanceRate * 100),
                assignment_rate: Math.round(assignmentRate * 100),
                failed_contacts: failedContacts
            };

            // Lưu kết quả vào database
            const saveResult = await Student.saveRiskEvaluation(id, riskData);

            if (!saveResult.success) {
                return res.status(500).json({
                    success: false,
                    message: 'Lỗi khi lưu kết quả đánh giá',
                    error: saveResult.error
                });
            }

            res.json({
                success: true,
                message: 'Đánh giá rủi ro bỏ học thành công',
                data: {
                    student_id: id,
                    ...riskData,
                    details: {
                        attendance_rate: `${riskData.attendance_rate}%`,
                        assignment_rate: `${riskData.assignment_rate}%`,
                        failed_contacts: failedContacts,
                        thresholds_used: {
                            attendance_threshold: `${Math.round(thresholds.attendance_threshold * 100)}%`,
                            assignment_threshold: `${Math.round(thresholds.assignment_threshold * 100)}%`,
                            contact_failure_threshold: thresholds.contact_failure_threshold
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Lỗi evaluateStudentRisk:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi đánh giá rủi ro sinh viên',
                error: error.message
            });
        }
    }

    /**
     * Cập nhật ngưỡng cấu hình
     * PUT /config/thresholds
     */
    static async updateThresholds(req, res) {
        try {
            const { attendance_threshold, assignment_threshold, contact_failure_threshold } = req.body;

            // Validate input
            if (attendance_threshold !== undefined && (attendance_threshold < 0 || attendance_threshold > 1)) {
                return res.status(400).json({
                    success: false,
                    message: 'attendance_threshold phải nằm trong khoảng 0-1'
                });
            }

            if (assignment_threshold !== undefined && (assignment_threshold < 0 || assignment_threshold > 1)) {
                return res.status(400).json({
                    success: false,
                    message: 'assignment_threshold phải nằm trong khoảng 0-1'
                });
            }

            if (contact_failure_threshold !== undefined && (contact_failure_threshold < 0 || !Number.isInteger(contact_failure_threshold))) {
                return res.status(400).json({
                    success: false,
                    message: 'contact_failure_threshold phải là số nguyên không âm'
                });
            }

            // Lấy cấu hình hiện tại
            const currentThresholds = await Student.getRiskThresholds();

            // Cập nhật với giá trị mới (nếu có)
            const newThresholds = {
                attendance_threshold: attendance_threshold !== undefined ? attendance_threshold : currentThresholds.attendance_threshold,
                assignment_threshold: assignment_threshold !== undefined ? assignment_threshold : currentThresholds.assignment_threshold,
                contact_failure_threshold: contact_failure_threshold !== undefined ? contact_failure_threshold : currentThresholds.contact_failure_threshold
            };

            const result = await Student.updateRiskThresholds(newThresholds);

            if (!result.success) {
                return res.status(500).json({
                    success: false,
                    message: 'Lỗi khi cập nhật ngưỡng cấu hình',
                    error: result.error
                });
            }

            res.json({
                success: true,
                message: 'Cập nhật ngưỡng cấu hình thành công',
                data: {
                    ...newThresholds,
                    display: {
                        attendance_threshold: `${Math.round(newThresholds.attendance_threshold * 100)}%`,
                        assignment_threshold: `${Math.round(newThresholds.assignment_threshold * 100)}%`,
                        contact_failure_threshold: `${newThresholds.contact_failure_threshold} lần`
                    }
                }
            });
        } catch (error) {
            console.error('Lỗi updateThresholds:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi cập nhật ngưỡng cấu hình',
                error: error.message
            });
        }
    }

    /**
     * Lấy ngưỡng cấu hình hiện tại
     * GET /config/thresholds
     */
    static async getThresholds(req, res) {
        try {
            const thresholds = await Student.getRiskThresholds();

            res.json({
                success: true,
                message: 'Lấy ngưỡng cấu hình thành công',
                data: {
                    ...thresholds,
                    display: {
                        attendance_threshold: `${Math.round(thresholds.attendance_threshold * 100)}%`,
                        assignment_threshold: `${Math.round(thresholds.assignment_threshold * 100)}%`,
                        contact_failure_threshold: `${thresholds.contact_failure_threshold} lần`
                    }
                }
            });
        } catch (error) {
            console.error('Lỗi getThresholds:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy ngưỡng cấu hình',
                error: error.message
            });
        }
    }
}

module.exports = StudentController;