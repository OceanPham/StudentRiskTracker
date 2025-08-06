const DropoutRiskAnalyzer = require('./dropout_risk_analyzer');

// Test data mẫu để kiểm tra logic
const testStudents = [
    {
        student_id: "TEST001",
        student_name: "Test Student - Low Risk",
        attendance: [
            { date: "2025-01-01", status: "ATTEND" },
            { date: "2025-01-02", status: "ATTEND" },
            { date: "2025-01-03", status: "ATTEND" },
            { date: "2025-01-04", status: "ATTEND" }
        ],
        assignments: [
            { date: "2025-01-01", name: "HW 1", submitted: true },
            { date: "2025-01-08", name: "HW 2", submitted: true }
        ],
        contacts: []
    },
    {
        student_id: "TEST002",
        student_name: "Test Student - High Risk",
        attendance: [
            { date: "2025-01-01", status: "ABSENT" },
            { date: "2025-01-02", status: "ABSENT" },
            { date: "2025-01-03", status: "ATTEND" },
            { date: "2025-01-04", status: "ABSENT" }
        ],
        assignments: [
            { date: "2025-01-01", name: "HW 1", submitted: false },
            { date: "2025-01-08", name: "HW 2", submitted: false },
            { date: "2025-01-15", name: "HW 3", submitted: false }
        ],
        contacts: [
            { date: "2025-01-20", status: "FAILED" },
            { date: "2025-01-22", status: "FAILED" }
        ]
    }
];

function runTests() {
    console.log('🧪 CHẠY TESTS CHO DROPOUT RISK ANALYZER');
    console.log('='.repeat(50));

    const analyzer = new DropoutRiskAnalyzer();

    // Test 1: Test attendance calculation
    console.log('\n✅ Test 1: Tính toán tỷ lệ attendance');
    const attendance1 = [
        { status: "ATTEND" },
        { status: "ATTEND" },
        { status: "ABSENT" },
        { status: "ATTEND" }
    ];
    const rate1 = analyzer.calculateAttendanceRate(attendance1);
    console.log(`Expected: 0.75, Got: ${rate1}`);
    console.log(rate1 === 0.75 ? '✅ PASS' : '❌ FAIL');

    // Test 2: Test assignment calculation
    console.log('\n✅ Test 2: Tính toán tỷ lệ nộp bài');
    const assignments1 = [
        { submitted: true },
        { submitted: false }
    ];
    const rate2 = analyzer.calculateAssignmentRate(assignments1);
    console.log(`Expected: 0.5, Got: ${rate2}`);
    console.log(rate2 === 0.5 ? '✅ PASS' : '❌ FAIL');

    // Test 3: Test contact failures
    console.log('\n✅ Test 3: Đếm failed contacts');
    const contacts1 = [
        { status: "FAILED" },
        { status: "SUCCESS" },
        { status: "FAILED" }
    ];
    const count1 = analyzer.countFailedContacts(contacts1);
    console.log(`Expected: 2, Got: ${count1}`);
    console.log(count1 === 2 ? '✅ PASS' : '❌ FAIL');

    // Test 4: Test risk assessment
    console.log('\n✅ Test 4: Đánh giá rủi ro tổng thể');
    const results = analyzer.analyzeAllStudents(testStudents);

    console.log('\n📊 KẾT QUẢ TEST:');
    results.forEach(result => {
        console.log(`${result.student_id}: Score=${result.risk_score}, Level=${result.risk_level}`);
    });

    // Kiểm tra kết quả mong đợi
    const lowRiskStudent = results.find(r => r.student_id === 'TEST001');
    const highRiskStudent = results.find(r => r.student_id === 'TEST002');

    console.log('\n🔍 KIỂM TRA KẾT QUẢ:');
    console.log(`TEST001 Low Risk: ${lowRiskStudent.risk_level === 'LOW' ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`TEST002 High Risk: ${highRiskStudent.risk_level === 'HIGH' ? '✅ PASS' : '❌ FAIL'}`);

    console.log('\n🎯 HOÀN THÀNH TẤT CẢ TESTS!');
}

// Chạy tests
if (require.main === module) {
    runTests();
}