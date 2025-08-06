const { executeQuery } = require('../config/database');

class Student {
    /**
     * Lấy tất cả sinh viên với thông tin đánh giá rủi ro (nếu có)
     */
    static async findAll() {
        const sql = `
            SELECT 
                s.*,
                re.risk_score,
                re.risk_level,
                re.dropout_probability,
                re.note as risk_note,
                re.evaluated_at
            FROM students s
            LEFT JOIN risk_evaluations re ON s.student_id = re.student_id
            ORDER BY s.student_name
        `;
        return await executeQuery(sql);
    }

    /**
     * Lấy sinh viên theo ID với thông tin chi tiết
     */
    static async findById(studentId) {
        const sql = `
            SELECT 
                s.*,
                re.risk_score,
                re.risk_level,
                re.dropout_probability,
                re.note as risk_note,
                re.attendance_rate,
                re.assignment_rate,
                re.failed_contacts,
                re.evaluated_at
            FROM students s
            LEFT JOIN risk_evaluations re ON s.student_id = re.student_id
            WHERE s.student_id = ?
        `;
        return await executeQuery(sql, [studentId]);
    }

    /**
     * Lọc sinh viên theo mức độ rủi ro
     */
    static async findByRiskLevel(riskLevel) {
        const sql = `
            SELECT 
                s.*,
                re.risk_score,
                re.risk_level,
                re.dropout_probability,
                re.note as risk_note,
                re.evaluated_at
            FROM students s
            INNER JOIN risk_evaluations re ON s.student_id = re.student_id
            WHERE re.risk_level = ?
            ORDER BY re.dropout_probability DESC, s.student_name
        `;
        return await executeQuery(sql, [riskLevel]);
    }

    /**
     * Lấy dữ liệu điểm danh của sinh viên
     */
    static async getAttendanceData(studentId) {
        const sql = `
            SELECT attendance_date, status
            FROM attendance
            WHERE student_id = ?
            ORDER BY attendance_date
        `;
        return await executeQuery(sql, [studentId]);
    }

    /**
     * Lấy dữ liệu bài tập của sinh viên
     */
    static async getAssignmentData(studentId) {
        const sql = `
            SELECT assignment_name, assignment_date, submitted, submission_date
            FROM assignments
            WHERE student_id = ?
            ORDER BY assignment_date
        `;
        return await executeQuery(sql, [studentId]);
    }

    /**
     * Lấy dữ liệu liên hệ hỗ trợ của sinh viên
     */
    static async getContactData(studentId) {
        const sql = `
            SELECT contact_date, contact_type, status, notes
            FROM contacts
            WHERE student_id = ?
            ORDER BY contact_date
        `;
        return await executeQuery(sql, [studentId]);
    }

    /**
     * Tính toán tỷ lệ tham dự
     */
    static async calculateAttendanceRate(studentId) {
        const attendanceResult = await this.getAttendanceData(studentId);
        if (!attendanceResult.success || attendanceResult.data.length === 0) {
            return 0;
        }

        const attendanceData = attendanceResult.data;
        const totalDays = attendanceData.length;
        const attendedDays = attendanceData.filter(record => record.status === 'ATTEND').length;

        return totalDays > 0 ? attendedDays / totalDays : 0;
    }

    /**
     * Tính toán tỷ lệ nộp bài tập
     */
    static async calculateAssignmentRate(studentId) {
        const assignmentResult = await this.getAssignmentData(studentId);
        if (!assignmentResult.success || assignmentResult.data.length === 0) {
            return 0;
        }

        const assignmentData = assignmentResult.data;
        const totalAssignments = assignmentData.length;
        const submittedAssignments = assignmentData.filter(assignment => assignment.submitted).length;

        return totalAssignments > 0 ? submittedAssignments / totalAssignments : 0;
    }

    /**
     * Đếm số lần liên hệ thất bại
     */
    static async countFailedContacts(studentId) {
        const contactResult = await this.getContactData(studentId);
        if (!contactResult.success || contactResult.data.length === 0) {
            return 0;
        }

        const contactData = contactResult.data;
        return contactData.filter(contact => contact.status === 'FAILED').length;
    }

    /**
     * Lấy ngưỡng cấu hình từ database
     */
    static async getRiskThresholds() {
        const sql = `SELECT * FROM risk_thresholds ORDER BY id DESC LIMIT 1`;
        const result = await executeQuery(sql);

        if (result.success && result.data.length > 0) {
            return result.data[0];
        }

        // Default fallback
        return {
            attendance_threshold: 0.75,
            assignment_threshold: 0.50,
            contact_failure_threshold: 2
        };
    }

    /**
     * Lưu kết quả đánh giá rủi ro
     */
    static async saveRiskEvaluation(studentId, riskData) {
        // Xóa đánh giá cũ nếu có
        const deleteSql = `DELETE FROM risk_evaluations WHERE student_id = ?`;
        await executeQuery(deleteSql, [studentId]);

        // Chèn đánh giá mới
        const insertSql = `
            INSERT INTO risk_evaluations 
            (student_id, risk_score, risk_level, dropout_probability, note, 
             attendance_rate, assignment_rate, failed_contacts, evaluated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        const params = [
            studentId,
            riskData.risk_score,
            riskData.risk_level,
            riskData.dropout_probability,
            riskData.note,
            riskData.attendance_rate,
            riskData.assignment_rate,
            riskData.failed_contacts
        ];

        return await executeQuery(insertSql, params);
    }

    /**
     * Cập nhật ngưỡng cấu hình
     */
    static async updateRiskThresholds(thresholds) {
        const sql = `
            UPDATE risk_thresholds SET
                attendance_threshold = ?,
                assignment_threshold = ?,
                contact_failure_threshold = ?,
                updated_at = NOW()
            ORDER BY id DESC LIMIT 1
        `;

        const params = [
            thresholds.attendance_threshold,
            thresholds.assignment_threshold,
            thresholds.contact_failure_threshold
        ];

        return await executeQuery(sql, params);
    }
}

module.exports = Student;