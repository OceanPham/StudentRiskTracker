const fs = require('fs');
const path = require('path');

class DropoutRiskAnalyzer {
    constructor() {
        try {
            this.riskConfig = require('./riskConfig.json');
        } catch (error) {
            console.error('Lỗi khi đọc file riskConfig.json:', error.message);
            this.riskConfig = {};
        }
    }

    /**
     * Đọc dữ liệu sinh viên từ file JSON
     * @param {string} filePath - Đường dẫn đến file JSON
     * @returns {Array} Danh sách sinh viên
     */
    loadStudentData(filePath) {
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Lỗi khi đọc file:', error.message);
            return [];
        }
    }

    /**
     * Tính tỷ lệ tham dự
     * @param {Array} attendance - Danh sách trạng thái tham dự
     * @returns {number} Tỷ lệ tham dự (0-1)
     */
    calculateAttendanceRate(attendance) {
        if (!attendance || attendance.length === 0) return 0;

        const attendedCount = attendance.filter(record => record.status === 'ATTEND').length;
        return attendedCount / attendance.length;
    }

    /**
     * Tính tỷ lệ nộp bài tập
     * @param {Array} assignments - Danh sách bài tập
     * @returns {number} Tỷ lệ nộp bài (0-1)
     */
    calculateAssignmentRate(assignments) {
        if (!assignments || assignments.length === 0) return 0;

        const submittedCount = assignments.filter(assignment => assignment.submitted === true).length;
        return submittedCount / assignments.length;
    }

    /**
     * Đếm số lần liên hệ thất bại
     * @param {Array} contacts - Danh sách liên hệ
     * @returns {number} Số lần liên hệ thất bại
     */
    countFailedContacts(contacts) {
        if (!contacts || contacts.length === 0) return 0;

        return contacts.filter(contact => contact.status === 'FAILED').length;
    }

    calculateRiskLevel(riskScore) {
        const riskLevelMapping = this.riskConfig?.riskLevelMapping;
        if (!riskLevelMapping || riskLevelMapping.length === 0) return 'LOW';

        const riskLevel = riskLevelMapping.find(level => riskScore >= level.min && riskScore <= level.max);
        return riskLevel?.level || 'LOW';
    }

    /**
     * Đánh giá rủi ro cho một sinh viên
     * @param {Object} student - Thông tin sinh viên
     * @returns {Object} Kết quả đánh giá rủi ro
     */
    assessRisk(student) {
        const attendanceRate = this.calculateAttendanceRate(student?.attendance);
        const assignmentRate = this.calculateAssignmentRate(student?.assignments);
        const failedContacts = this.countFailedContacts(student?.contacts);

        let riskScore = 0;
        const riskFactors = [];

        // Kiểm tra tỷ lệ tham dự
        if (attendanceRate < this.riskConfig?.attendanceThreshold) {
            riskScore += 1;
            riskFactors.push('attendance');
        }

        // Kiểm tra tỷ lệ nộp bài tập
        if (assignmentRate < this.riskConfig?.assignmentThreshold) {
            riskScore += 1;
            riskFactors.push('assignment');
        }

        // Kiểm tra số lần liên hệ thất bại
        if (failedContacts >= this.riskConfig?.contactFailureThreshold) {
            riskScore += 1;
            riskFactors.push('communication');
        }

        // Xác định mức độ rủi ro
        // let riskLevel;
        // if (riskScore <= 1) {
        //     riskLevel = 'LOW';
        // } else if (riskScore === 2) {
        //     riskLevel = 'MEDIUM';
        // } else {
        //     riskLevel = 'HIGH';
        // }

        const riskLevel = this.calculateRiskLevel(riskScore);

        return {
            student_id: student?.student_id,
            student_name: student?.student_name,
            risk_score: riskScore,
            risk_level: riskLevel,
            note: riskFactors.length > 0 ? riskFactors.join(', ') : 'No risk factors detected',
            details: {
                attendance_rate: (attendanceRate * 100).toFixed(1) + '%',
                assignment_rate: (assignmentRate * 100).toFixed(1) + '%',
                failed_contacts: failedContacts
            }
        };
    }

    /**
     * Phân tích rủi ro cho tất cả sinh viên
     * @param {Array} students - Danh sách sinh viên
     * @returns {Array} Kết quả đánh giá rủi ro cho tất cả sinh viên
     */
    analyzeAllStudents(students) {
        return students.map(student => this.assessRisk(student));
    }

    /**
     * Hiển thị kết quả dưới dạng bảng
     * @param {Array} results - Kết quả đánh giá rủi ro
     */
    displayResults(results) {
        console.log('\n🎓 KẾT QUẢ ĐÁNH GIÁ RỦI RO BỎ HỌC SINH VIÊN');
        console.log('='.repeat(80));

        // Header
        console.log(
            '| Student ID | Name        | Score | Risk Level | Risk Factors              | Details'
        );
        console.log('|------------|-------------|-------|------------|---------------------------|------------------');

        // Dữ liệu
        results.forEach(result => {
            const studentId = result.student_id.padEnd(10);
            const name = result.student_name.padEnd(11);
            const score = result.risk_score.toString().padEnd(5);
            const level = result.risk_level.padEnd(10);
            const note = result.note.padEnd(25);
            const details = `Att: ${result.details.attendance_rate}, Ass: ${result.details.assignment_rate}, FC: ${result.details.failed_contacts}`;

            console.log(`| ${studentId} | ${name} | ${score} | ${level} | ${note} | ${details}`);
        });

        console.log('\n📊 THỐNG KÊ TỔNG QUAN:');
        const lowRisk = results.filter(r => r.risk_level === 'LOW').length;
        const mediumRisk = results.filter(r => r.risk_level === 'MEDIUM').length;
        const highRisk = results.filter(r => r.risk_level === 'HIGH').length;

        console.log(`- Rủi ro THẤP (LOW): ${lowRisk} sinh viên`);
        console.log(`- Rủi ro TRUNG BÌNH (MEDIUM): ${mediumRisk} sinh viên`);
        console.log(`- Rủi ro CAO (HIGH): ${highRisk} sinh viên`);

        // Hiển thị sinh viên có rủi ro cao cần quan tâm
        const highRiskStudents = results.filter(r => r.risk_level === 'HIGH' || r.risk_level === 'MEDIUM');
        if (highRiskStudents.length > 0) {
            console.log('\n⚠️  SINH VIÊN CẦN QUAN TÂM:');
            highRiskStudents.forEach(student => {
                console.log(`- ${student.student_id} (${student.student_name}): ${student.risk_level} - ${student.note}`);
            });
        }
    }

    /**
     * Chạy phân tích chính
     * @param {string} dataFile - Đường dẫn file dữ liệu
     */
    run(dataFile = 'data.json') {
        console.log('🚀 Bắt đầu phân tích rủi ro bỏ học sinh viên...\n');

        const students = this.loadStudentData(dataFile);
        if (students?.length === 0) {
            console.log('❌ Không có dữ liệu sinh viên để phân tích.');
            return;
        }

        console.log(`📋 Đã tải ${students.length} sinh viên từ file ${dataFile}`);

        const results = this.analyzeAllStudents(students);
        this.displayResults(results);

        console.log('\n✅ Hoàn thành phân tích rủi ro bỏ học sinh viên!');

        return results;
    }
}

// Khởi chạy chương trình
if (require.main === module) {
    const analyzer = new DropoutRiskAnalyzer();
    analyzer.run();
}

module.exports = DropoutRiskAnalyzer;