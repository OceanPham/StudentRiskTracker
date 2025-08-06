const readline = require('readline');
const fs = require('fs');
const path = require('path');

class ConsoleRiskAnalyzer {
    constructor() {
        this.students = [];
        this.riskConfig = {};
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        this.loadConfig();
    }

    /**
     * Load configuration from riskConfig.json
     */
    loadConfig() {
        try {
            const configData = fs.readFileSync('riskConfig.json', 'utf8');
            this.riskConfig = JSON.parse(configData);
        } catch (error) {
            console.error('⚠️  Lỗi khi đọc file riskConfig.json:', error.message);
            // Fallback to default config
            this.riskConfig = {
                attendanceThreshold: 0.75,
                assignmentThreshold: 0.5,
                contactFailureThreshold: 2,
                riskLevelMapping: [
                    { min: 0, max: 1, level: "LOW" },
                    { min: 2, max: 2, level: "MEDIUM" },
                    { min: 3, max: 3, level: "HIGH" }
                ]
            };
        }
    }

    /**
     * Load students data from JSON file
     * @param {string} filePath - Path to students JSON file
     * @returns {boolean} Success status
     */
    loadStudents(filePath = 'students.json') {
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            this.students = JSON.parse(data);
            console.log(`✅ Đã tải thành công ${this.students.length} sinh viên từ ${filePath}`);
            return true;
        } catch (error) {
            console.error(`❌ Lỗi khi đọc file ${filePath}:`, error.message);
            return false;
        }
    }

    /**
     * Calculate attendance rate
     * @param {Array} attendance - Attendance records
     * @returns {number} Attendance rate (0-1)
     */
    calculateAttendanceRate(attendance) {
        if (!attendance || attendance.length === 0) return 0;
        const attendedCount = attendance.filter(record => record.status === 'ATTEND').length;
        return attendedCount / attendance.length;
    }

    /**
     * Calculate assignment submission rate
     * @param {Array} assignments - Assignment records
     * @returns {number} Assignment submission rate (0-1)
     */
    calculateAssignmentRate(assignments) {
        if (!assignments || assignments.length === 0) return 0;
        const submittedCount = assignments.filter(assignment => assignment.submitted === true).length;
        return submittedCount / assignments.length;
    }

    /**
     * Count failed contacts
     * @param {Array} contacts - Contact records
     * @returns {number} Number of failed contacts
     */
    countFailedContacts(contacts) {
        if (!contacts || contacts.length === 0) return 0;
        return contacts.filter(contact => contact.status === 'FAILED').length;
    }

    /**
     * Calculate risk level based on score
     * @param {number} riskScore - Risk score
     * @returns {string} Risk level
     */
    calculateRiskLevel(riskScore) {
        const riskLevelMapping = this.riskConfig?.riskLevelMapping;
        if (!riskLevelMapping || riskLevelMapping.length === 0) return 'LOW';

        const riskLevel = riskLevelMapping.find(level => riskScore >= level.min && riskScore <= level.max);
        return riskLevel?.level || 'LOW';
    }

    /**
     * Assess dropout risk for a student
     * @param {Object} student - Student object
     * @returns {Object} Risk assessment result
     */
    assessRisk(student) {
        const attendanceRate = this.calculateAttendanceRate(student?.attendance);
        const assignmentRate = this.calculateAssignmentRate(student?.assignments);
        const failedContacts = this.countFailedContacts(student?.contacts);

        let riskScore = 0;
        const riskFactors = [];

        // Check attendance rate
        if (attendanceRate < this.riskConfig?.attendanceThreshold) {
            riskScore += 1;
            riskFactors.push('attendance');
        }

        // Check assignment submission rate
        if (assignmentRate < this.riskConfig?.assignmentThreshold) {
            riskScore += 1;
            riskFactors.push('assignment');
        }

        // Check failed contacts
        if (failedContacts >= this.riskConfig?.contactFailureThreshold) {
            riskScore += 1;
            riskFactors.push('communication');
        }

        const riskLevel = this.calculateRiskLevel(riskScore);
        const dropoutProbability = Math.round((riskScore / 3) * 100);

        const assessment = {
            risk_score: riskScore,
            risk_level: riskLevel,
            dropoutProbability: dropoutProbability,
            note: riskFactors.length > 0 ? riskFactors.join(', ') : 'No risk factors detected',
            details: {
                attendance_rate: (attendanceRate * 100).toFixed(1) + '%',
                assignment_rate: (assignmentRate * 100).toFixed(1) + '%',
                failed_contacts: failedContacts
            }
        };

        // Store assessment in student object
        student.riskAssessment = assessment;

        return assessment;
    }

    /**
     * Display main menu
     */
    displayMenu() {
        console.log('\n' + '='.repeat(60));
        console.log('🎓 HỆ THỐNG ĐÁNH GIÁ RỦI RO BỎ HỌC SINH VIÊN');
        console.log('='.repeat(60));
        console.log('1. 📋 Xem danh sách sinh viên');
        console.log('2. 👤 Xem chi tiết 1 sinh viên');
        console.log('3. 🔍 Đánh giá rủi ro toàn bộ sinh viên');
        console.log('4. 💾 Lưu kết quả vào file mới');
        console.log('5. ⚙️  Hiển thị cấu hình hệ thống');
        console.log('6. 🚪 Thoát chương trình');
        console.log('='.repeat(60));
    }

    /**
     * Show list of all students
     */
    showStudentList() {
        if (this.students.length === 0) {
            console.log('❌ Không có dữ liệu sinh viên. Vui lòng tải dữ liệu trước.');
            return;
        }

        console.log('\n📋 DANH SÁCH SINH VIÊN:');
        console.log('-'.repeat(80));
        console.log('| STT | Student ID | Name              | Risk Level | Dropout Risk |');
        console.log('-'.repeat(80));

        this.students.forEach((student, index) => {
            const assessment = student?.riskAssessment || { risk_level: 'Chưa đánh giá', dropoutProbability: 'N/A' };
            const stt = (index + 1).toString().padStart(3);
            const studentId = student?.student_id.padEnd(10);
            const name = student?.student_name.padEnd(17);
            const riskLevel = assessment.risk_level.padEnd(10);
            const dropoutRisk = assessment.dropoutProbability !== 'N/A' ?
                `${assessment.dropoutProbability}%`.padEnd(12) : 'N/A'.padEnd(12);

            console.log(`| ${stt} | ${studentId} | ${name} | ${riskLevel} | ${dropoutRisk} |`);
        });
        console.log('-'.repeat(80));
    }

    /**
     * Show detailed information for a specific student
     * @param {string} studentId - Student ID to show details for
     */
    showStudentDetail(studentId) {
        const student = this.students.find(s => s?.student_id === studentId);

        if (!student) {
            console.log(`❌ Không tìm thấy sinh viên với ID: ${studentId}`);
            return;
        }

        console.log('\n👤 CHI TIẾT SINH VIÊN:');
        console.log('='.repeat(50));
        console.log(`📋 ID: ${student.student_id}`);
        console.log(`📝 Tên: ${student.student_name}`);

        // Attendance details
        console.log('\n📅 THÔNG TIN THAM DỰ:');
        const attendanceRate = this.calculateAttendanceRate(student?.attendance);
        const totalDays = student?.attendance?.length || 0;
        const attendedDays = student?.attendance?.filter(a => a?.status === 'ATTEND').length || 0;

        console.log(`   Tổng số ngày: ${totalDays}`);
        console.log(`   Số ngày tham dự: ${attendedDays}`);
        console.log(`   Tỷ lệ tham dự: ${(attendanceRate * 100).toFixed(1)}%`);

        // Assignment details
        console.log('\n📚 THÔNG TIN BÀI TẬP:');
        const assignmentRate = this.calculateAssignmentRate(student?.assignments);
        const totalAssignments = student?.assignments?.length || 0;
        const submittedAssignments = student?.assignments?.filter(a => a?.submitted).length || 0;
        console.log(`   Tổng số bài tập: ${totalAssignments}`);
        console.log(`   Số bài đã nộp: ${submittedAssignments}`);
        console.log(`   Tỷ lệ nộp bài: ${(assignmentRate * 100).toFixed(1)}%`);

        // Contact details
        console.log('\n📞 THÔNG TIN LIÊN HỆ HỖ TRỢ:');
        const failedContacts = this.countFailedContacts(student?.contacts);
        const totalContacts = student?.contacts?.length || 0;
        console.log(`   Tổng số lần liên hệ: ${totalContacts}`);
        console.log(`   Số lần thất bại: ${failedContacts}`);

        // Risk assessment
        if (student?.riskAssessment) {
            console.log('\n🔍 ĐÁNH GIÁ RỦI RO:');
            console.log(`   Điểm rủi ro: ${student?.riskAssessment?.risk_score}/3`);
            console.log(`   Mức độ rủi ro: ${student?.riskAssessment?.risk_level}`);
            console.log(`   Xác suất bỏ học: ${student?.riskAssessment?.dropoutProbability}%`);
            console.log(`   Yếu tố rủi ro: ${student?.riskAssessment?.note}`);
        } else {
            console.log('\n🔍 ĐÁNH GIÁ RỦI RO: Chưa được đánh giá');
        }
        console.log('='.repeat(50));
    }

    /**
     * Assess risk for all students
     */
    assessAllStudents() {
        if (this.students.length === 0) {
            console.log('❌ Không có dữ liệu sinh viên. Vui lòng tải dữ liệu trước.');
            return;
        }

        console.log('\n🔍 ĐANG ĐÁNH GIÁ RỦI RO CHO TẤT CẢ SINH VIÊN...');
        console.log('-'.repeat(80));

        let lowRisk = 0, mediumRisk = 0, highRisk = 0;

        this.students?.forEach(student => {
            const assessment = this.assessRisk(student);

            if (assessment.risk_level === 'LOW') lowRisk++;
            else if (assessment.risk_level === 'MEDIUM') mediumRisk++;
            else if (assessment.risk_level === 'HIGH') highRisk++;

            console.log(`✅ ${student.student_id} (${student.student_name}): ${assessment.risk_level} - ${assessment.dropoutProbability}% risk`);
        });

        console.log('\n📊 THỐNG KÊ TỔNG QUAN:');
        console.log(`   🟢 Rủi ro THẤP (LOW): ${lowRisk} sinh viên`);
        console.log(`   🟡 Rủi ro TRUNG BÌNH (MEDIUM): ${mediumRisk} sinh viên`);
        console.log(`   🔴 Rủi ro CAO (HIGH): ${highRisk} sinh viên`);

        // Show high-risk students
        const highRiskStudents = this.students?.filter(s => s?.riskAssessment?.risk_level === 'HIGH' || s?.riskAssessment?.risk_level === 'MEDIUM');
        if (highRiskStudents.length > 0) {
            console.log('\n⚠️  SINH VIÊN CẦN QUAN TÂM:');
            highRiskStudents.forEach(student => {
                console.log(`   - ${student?.student_id} (${student?.student_name}): ${student?.riskAssessment?.risk_level} - ${student?.riskAssessment?.note}`);
            });
        }

        console.log('\n✅ Hoàn thành đánh giá rủi ro cho tất cả sinh viên!');
    }

    /**
     * Save results to a new JSON file
     * @param {string} fileName - Output file name
     */
    saveResultsToFile(fileName = 'students_with_risk.json') {
        try {
            const dataToSave = JSON.stringify(this.students || [], null, 2);
            fs.writeFileSync(fileName, dataToSave, 'utf8');
            console.log(`✅ Đã lưu kết quả vào file: ${fileName}`);
            console.log(`📄 File chứa ${this.students?.length} sinh viên với thông tin đánh giá rủi ro`);
        } catch (error) {
            console.error(`❌ Lỗi khi lưu file ${fileName}:`, error.message);
        }
    }

    /**
     * Display system configuration
     */
    showConfiguration() {
        console.log('\n⚙️  CẤU HÌNH HỆ THỐNG:');
        console.log('='.repeat(50));
        console.log(`📊 Ngưỡng tham dự: ${(this.riskConfig.attendanceThreshold * 100)}%`);
        console.log(`📚 Ngưỡng nộp bài: ${(this.riskConfig.assignmentThreshold * 100)}%`);
        console.log(`📞 Ngưỡng liên hệ thất bại: ${this.riskConfig.contactFailureThreshold} lần`);
        console.log('\n🎯 Mức độ rủi ro:');
        this.riskConfig.riskLevelMapping.forEach(level => {
            console.log(`   ${level.min}-${level.max} điểm: ${level.level}`);
        });
        console.log('='.repeat(50));
    }

    /**
     * Get user input
     * @param {string} question - Question to ask
     * @returns {Promise<string>} User input
     */
    async getUserInput(question) {
        return new Promise((resolve) => {
            this.rl.question(question, (answer) => {
                resolve(answer.trim());
            });
        });
    }

    /**
     * Main program loop
     */
    async run() {
        console.log('🚀 Khởi động Hệ thống Đánh giá Rủi ro Bỏ học Sinh viên...\n');

        // Load students data
        if (!this.loadStudents()) {
            console.log('❌ Không thể tải dữ liệu sinh viên. Chương trình sẽ thoát.');
            this.rl.close();
            return;
        }

        while (true) {
            this.displayMenu();

            const choice = await this.getUserInput('\n👆 Vui lòng chọn một tùy chọn (1-6): ');

            switch (choice) {
                case '1':
                    this.showStudentList();
                    break;

                case '2':
                    const studentId = await this.getUserInput('\n🔍 Nhập ID sinh viên: ');
                    this.showStudentDetail(studentId);
                    break;

                case '3':
                    this.assessAllStudents();
                    break;

                case '4':
                    const fileName = await this.getUserInput('\n💾 Nhập tên file (mặc định: students_with_risk.json): ');
                    this.saveResultsToFile(fileName || 'students_with_risk.json');
                    break;

                case '5':
                    this.showConfiguration();
                    break;

                case '6':
                    console.log('\n👋 Cảm ơn bạn đã sử dụng hệ thống. Tạm biệt!');
                    this.rl.close();
                    return;

                default:
                    console.log('❌ Lựa chọn không hợp lệ. Vui lòng chọn từ 1 đến 6.');
                    break;
            }

            // Wait for user to press Enter before showing menu again
            await this.getUserInput('\n⏎  Nhấn Enter để tiếp tục...');
        }
    }
}

// Start the application
if (require.main === module) {
    const analyzer = new ConsoleRiskAnalyzer();
    analyzer.run().catch(error => {
        console.error('❌ Lỗi chương trình:', error);
        process.exit(1);
    });
}

module.exports = ConsoleRiskAnalyzer;