const ConsoleRiskAnalyzer = require('./console_risk_analyzer');

// Demo script to test console application
async function demoApplication() {
    console.log('🎯 DEMO HỆ THỐNG ĐÁNH GIÁ RỦI RO BỎ HỌC CONSOLE\n');

    const analyzer = new ConsoleRiskAnalyzer();

    // Load students
    console.log('1️⃣ Tải dữ liệu sinh viên...');
    if (!analyzer.loadStudents()) {
        console.log('❌ Không thể tải dữ liệu sinh viên.');
        return;
    }

    console.log('\n2️⃣ Hiển thị danh sách sinh viên:');
    analyzer.showStudentList();

    console.log('\n3️⃣ Xem chi tiết sinh viên STDB:');
    analyzer.showStudentDetail('STDB');

    console.log('\n4️⃣ Đánh giá rủi ro cho tất cả sinh viên:');
    analyzer.assessAllStudents();

    console.log('\n5️⃣ Hiển thị cấu hình hệ thống:');
    analyzer.showConfiguration();

    console.log('\n6️⃣ Lưu kết quả vào file:');
    analyzer.saveResultsToFile('demo_students_with_risk.json');

    console.log('\n7️⃣ Hiển thị lại danh sách sau khi đánh giá:');
    analyzer.showStudentList();

    // Close readline
    analyzer.rl.close();

    console.log('\n✅ DEMO HOÀN THÀNH!');
    console.log('🎯 Để sử dụng chương trình tương tác, chạy: npm run console');
}

// Run demo
demoApplication().catch(error => {
    console.error('❌ Lỗi demo:', error);
    process.exit(1);
});