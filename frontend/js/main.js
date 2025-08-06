// Configuration
const API_BASE_URL = 'http://localhost:3005/api';

// Global variables
let allStudents = [];
let currentStudentId = null;
let isLoading = false;

// DOM Elements
const loadingIndicator = document.getElementById('loadingIndicator');
const studentTableBody = document.getElementById('studentTableBody');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const riskFilter = document.getElementById('riskFilter');
const sortBy = document.getElementById('sortBy');

// Initialize application
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Initializing Student Dropout Risk Analysis System...');

    // Wait a bit more for DOM to be fully ready
    setTimeout(() => {
        console.log('🔄 Starting data load after DOM ready...');
        
        // Verify critical DOM elements exist
        const criticalElements = [
            'studentTableBody',
            'loadingIndicator', 
            'emptyState',
            'searchInput',
            'riskFilter',
            'sortBy'
        ];
        
        const missing = criticalElements.filter(id => !document.getElementById(id));
        if (missing.length > 0) {
            console.error('❌ Missing DOM elements:', missing);
            return;
        }
        
        console.log('✅ All DOM elements found');
        
        // Setup event listeners first
        setupEventListeners();
        
        // Load initial data
        loadStudents();
        loadConfiguration();
        
        console.log('✅ Application initialized successfully');
    }, 100);
});

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', debounce(filterAndDisplayStudents, 300));

    // Filter and sort functionality
    riskFilter.addEventListener('change', filterAndDisplayStudents);
    sortBy.addEventListener('change', filterAndDisplayStudents);

    // Close modals when clicking outside
    window.addEventListener('click', function (event) {
        const studentModal = document.getElementById('studentModal');
        const configModal = document.getElementById('configModal');

        if (event.target === studentModal) {
            closeStudentModal();
        }
        if (event.target === configModal) {
            closeConfigModal();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closeStudentModal();
            closeConfigModal();
        }
    });
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// API Helper Functions
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    try {
        const response = await fetch(url, { ...defaultOptions, ...options });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
}

// Loading state management
function setLoading(loading) {
    isLoading = loading;
    loadingIndicator.style.display = loading ? 'block' : 'none';

    // Disable/enable buttons during loading
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.disabled = loading;
        if (loading) {
            btn.style.opacity = '0.6';
            btn.style.cursor = 'not-allowed';
        } else {
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        }
    });
}

// Load students from API
async function loadStudents() {
    try {
        setLoading(true);
        console.log('📡 Loading students...');

        const response = await apiRequest('/students');

        console.log("response: ", response);

                if (response && response.success && Array.isArray(response.data)) {
            allStudents = response.data;
            console.log(`✅ Loaded ${allStudents.length} students`);
            
            updateStatistics();
            
            // Force display all students on initial load
            console.log('🔄 Force displaying students...');
            displayStudents(allStudents);
            
            // Also call filter function for consistency
            setTimeout(() => {
                filterAndDisplayStudents();
            }, 50);
        } else {
            console.warn('⚠️ Invalid response format:', response);
            allStudents = [];
            updateStatistics();
            showEmptyState();
            showToast('Dữ liệu trả về không đúng định dạng', 'warning');
        }

    } catch (error) {
        console.error('❌ Error loading students:', error);
        showToast('Lỗi khi tải danh sách sinh viên: ' + error.message, 'error');
        allStudents = [];
        updateStatistics();
        showEmptyState();
    } finally {
        setLoading(false);
    }
}

// Update statistics cards
function updateStatistics() {
    const lowRisk = allStudents.filter(s => s.risk_level === 'LOW').length;
    const mediumRisk = allStudents.filter(s => s.risk_level === 'MEDIUM').length;
    const highRisk = allStudents.filter(s => s.risk_level === 'HIGH').length;
    const total = allStudents.length;

    document.getElementById('lowRiskCount').textContent = lowRisk;
    document.getElementById('mediumRiskCount').textContent = mediumRisk;
    document.getElementById('highRiskCount').textContent = highRisk;
    document.getElementById('totalStudents').textContent = total;
}

// Filter and display students
function filterAndDisplayStudents() {
    if (isLoading) return;

    let filteredStudents = [...allStudents];

    console.log("allStudents: ", allStudents);

    // Apply search filter
    const searchTerm = searchInput?.value?.toLowerCase().trim() || '';
    if (searchTerm) {
        filteredStudents = filteredStudents.filter(student =>
            (student.student_id && student.student_id.toLowerCase().includes(searchTerm)) ||
            (student.student_name && student.student_name.toLowerCase().includes(searchTerm)) ||
            (student.email && student.email.toLowerCase().includes(searchTerm))
        );
    }

    // Apply risk level filter
    const riskLevel = riskFilter?.value || "";
    if (riskLevel) {
        if (riskLevel === 'NOT_EVALUATED') {
            filteredStudents = filteredStudents.filter(student => !student.risk_level);
        } else {
            filteredStudents = filteredStudents.filter(student => student.risk_level === riskLevel);
        }
    }

    // Apply sorting
    const sortOption = sortBy?.value || 'name';
    filteredStudents.sort((a, b) => {
        switch (sortOption) {
            case 'name':
                return (a.student_name || '').localeCompare(b.student_name || '');
            case 'name_desc':
                return (b.student_name || '').localeCompare(a.student_name || '');
            case 'risk_desc':
                return getRiskPriority(b.risk_level) - getRiskPriority(a.risk_level);
            case 'risk_asc':
                return getRiskPriority(a.risk_level) - getRiskPriority(b.risk_level);
            case 'probability_desc':
                return (b.dropout_probability || 0) - (a.dropout_probability || 0);
            default:
                return 0;
        }
    });

    console.log("filteredStudents: ", filteredStudents);

    displayStudents(filteredStudents);
}

// Get risk priority for sorting
function getRiskPriority(riskLevel) {
    switch (riskLevel) {
        case 'HIGH': return 3;
        case 'MEDIUM': return 2;
        case 'LOW': return 1;
        default: return 0;
    }
}

// Display students in table
function displayStudents(students) {
    console.log("displayStudents called with:", students.length, "students");
    
    // Ensure DOM elements exist
    const tableBody = document.getElementById('studentTableBody');
    if (!tableBody) {
        console.error('❌ studentTableBody element not found!');
        return;
    }

    if (students.length === 0) {
        showEmptyState();
        return;
    }

    hideEmptyState();

    console.log("students: ", students);

    tableBody.innerHTML = students.map(student => `
        <tr>
            <td><strong>${student.student_id}</strong></td>
            <td>${student.student_name}</td>
            <td>${student.email || 'N/A'}</td>
            <td class="text-center">
                ${student.risk_score !== null ?
            `<span class="text-${getRiskColor(student.risk_level)}">${student.risk_score}/3</span>` :
            '<span class="text-muted">-</span>'
        }
            </td>
            <td class="text-center">
                <span class="risk-badge risk-${getRiskBadgeClass(student.risk_level)}">
                    ${getRiskLevelText(student.risk_level)}
                </span>
            </td>
            <td class="text-center">
                ${student.dropout_probability !== null ?
            `<strong class="text-${getRiskColor(student.risk_level)}">${student.dropout_probability}%</strong>` :
            '<span class="text-muted">-</span>'
        }
            </td>
            <td class="text-center">
                ${student.evaluated_at ?
            formatDate(student.evaluated_at) :
            '<span class="text-muted">Chưa đánh giá</span>'
        }
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-primary btn-sm" onclick="viewStudentDetail('${student.student_id}')">
                        <i class="fas fa-eye"></i> Xem
                    </button>
                    <button class="btn btn-warning btn-sm" onclick="evaluateStudentFromTable('${student.student_id}')">
                        <i class="fas fa-calculator"></i> Đánh giá
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Helper functions for risk display
function getRiskColor(riskLevel) {
    switch (riskLevel) {
        case 'HIGH': return 'danger';
        case 'MEDIUM': return 'warning';
        case 'LOW': return 'success';
        default: return 'muted';
    }
}

function getRiskBadgeClass(riskLevel) {
    switch (riskLevel) {
        case 'HIGH': return 'high';
        case 'MEDIUM': return 'medium';
        case 'LOW': return 'low';
        default: return 'not-evaluated';
    }
}

function getRiskLevelText(riskLevel) {
    switch (riskLevel) {
        case 'HIGH': return 'Cao';
        case 'MEDIUM': return 'Trung bình';
        case 'LOW': return 'Thấp';
        default: return 'Chưa đánh giá';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Show/hide empty state
function showEmptyState() {
    const table = document.getElementById('studentTable');
    const empty = document.getElementById('emptyState');
    
    if (table) table.style.display = 'none';
    if (empty) empty.style.display = 'block';
    
    console.log('📝 Showing empty state');
}

function hideEmptyState() {
    const table = document.getElementById('studentTable');
    const empty = document.getElementById('emptyState');
    
    if (table) table.style.display = 'table';
    if (empty) empty.style.display = 'none';
    
    console.log('📝 Hiding empty state');
}

// View student detail
async function viewStudentDetail(studentId) {
    try {
        setLoading(true);
        currentStudentId = studentId;

        console.log(`📡 Loading student detail for: ${studentId}`);
        const response = await apiRequest(`/students/${studentId}`);
        const student = response.data;

        displayStudentDetail(student);
        openStudentModal();

    } catch (error) {
        console.error('❌ Error loading student detail:', error);
        showToast('Lỗi khi tải chi tiết sinh viên: ' + error.message, 'error');
    } finally {
        setLoading(false);
    }
}

// Display student detail in modal
function displayStudentDetail(student) {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.textContent = `Chi tiết Sinh viên - ${student.student_name}`;

    modalBody.innerHTML = `
        <div class="student-detail">
            <div class="detail-section">
                <h3>📋 Thông tin Cơ bản</h3>
                <div class="detail-row">
                    <div><span class="detail-label">ID Sinh viên:</span></div>
                    <div><span class="detail-value">${student.student_id}</span></div>
                </div>
                <div class="detail-row">
                    <div><span class="detail-label">Họ tên:</span></div>
                    <div><span class="detail-value">${student.student_name}</span></div>
                </div>
                <div class="detail-row">
                    <div><span class="detail-label">Email:</span></div>
                    <div><span class="detail-value">${student.email || 'N/A'}</span></div>
                </div>
                <div class="detail-row">
                    <div><span class="detail-label">Số điện thoại:</span></div>
                    <div><span class="detail-value">${student.phone || 'N/A'}</span></div>
                </div>
                <div class="detail-row">
                    <div><span class="detail-label">Ngày nhập học:</span></div>
                    <div><span class="detail-value">${student.enrollment_date ? formatDate(student.enrollment_date) : 'N/A'}</span></div>
                </div>
            </div>

            ${student.risk_score !== null ? `
            <div class="detail-section">
                <h3>🔍 Đánh giá Rủi ro</h3>
                <div class="detail-row">
                    <div><span class="detail-label">Điểm rủi ro:</span></div>
                    <div><span class="detail-value text-${getRiskColor(student.risk_level)}">${student.risk_score}/3</span></div>
                </div>
                <div class="detail-row">
                    <div><span class="detail-label">Mức độ rủi ro:</span></div>
                    <div><span class="risk-badge risk-${getRiskBadgeClass(student.risk_level)}">${getRiskLevelText(student.risk_level)}</span></div>
                </div>
                <div class="detail-row">
                    <div><span class="detail-label">Xác suất bỏ học:</span></div>
                    <div><span class="detail-value text-${getRiskColor(student.risk_level)}">${student.dropout_probability}%</span></div>
                </div>
                <div class="detail-row">
                    <div><span class="detail-label">Yếu tố rủi ro:</span></div>
                    <div><span class="detail-value">${student.risk_note || 'Không có'}</span></div>
                </div>
                <div class="detail-row">
                    <div><span class="detail-label">Ngày đánh giá:</span></div>
                    <div><span class="detail-value">${formatDate(student.evaluated_at)}</span></div>
                </div>
            </div>
            ` : ''}

            <div class="detail-section">
                <h3>📅 Thông tin Tham dự</h3>
                ${renderAttendanceInfo(student)}
            </div>

            <div class="detail-section">
                <h3>📚 Thông tin Bài tập</h3>
                ${renderAssignmentInfo(student)}
            </div>

            <div class="detail-section">
                <h3>📞 Thông tin Liên hệ Hỗ trợ</h3>
                ${renderContactInfo(student)}
            </div>
        </div>
    `;
}

// Render attendance information
function renderAttendanceInfo(student) {
    const records = student.attendance_records || [];
    if (records.length === 0) {
        return '<p class="text-muted">Không có dữ liệu tham dự</p>';
    }

    const totalDays = records.length;
    const attendedDays = records.filter(r => r.status === 'ATTEND').length;
    const attendanceRate = Math.round((attendedDays / totalDays) * 100);

    return `
        <div class="detail-row">
            <div><span class="detail-label">Tổng số ngày:</span></div>
            <div><span class="detail-value">${totalDays}</span></div>
        </div>
        <div class="detail-row">
            <div><span class="detail-label">Số ngày tham dự:</span></div>
            <div><span class="detail-value text-success">${attendedDays}</span></div>
        </div>
        <div class="detail-row">
            <div><span class="detail-label">Tỷ lệ tham dự:</span></div>
            <div><span class="detail-value text-${attendanceRate >= 75 ? 'success' : 'danger'}">${attendanceRate}%</span></div>
        </div>
        <div class="progress-bar">
            <div class="progress-fill progress-${attendanceRate >= 75 ? 'success' : 'danger'}" style="width: ${attendanceRate}%"></div>
        </div>
    `;
}

// Render assignment information
function renderAssignmentInfo(student) {
    const records = student.assignment_records || [];
    if (records.length === 0) {
        return '<p class="text-muted">Không có dữ liệu bài tập</p>';
    }

    const totalAssignments = records.length;
    const submittedAssignments = records.filter(r => r.submitted).length;
    const submissionRate = Math.round((submittedAssignments / totalAssignments) * 100);

    return `
        <div class="detail-row">
            <div><span class="detail-label">Tổng số bài tập:</span></div>
            <div><span class="detail-value">${totalAssignments}</span></div>
        </div>
        <div class="detail-row">
            <div><span class="detail-label">Số bài đã nộp:</span></div>
            <div><span class="detail-value text-success">${submittedAssignments}</span></div>
        </div>
        <div class="detail-row">
            <div><span class="detail-label">Tỷ lệ nộp bài:</span></div>
            <div><span class="detail-value text-${submissionRate >= 50 ? 'success' : 'danger'}">${submissionRate}%</span></div>
        </div>
        <div class="progress-bar">
            <div class="progress-fill progress-${submissionRate >= 50 ? 'success' : 'danger'}" style="width: ${submissionRate}%"></div>
        </div>
    `;
}

// Render contact information
function renderContactInfo(student) {
    const records = student.contact_records || [];
    if (records.length === 0) {
        return '<p class="text-muted">Không có dữ liệu liên hệ</p>';
    }

    const totalContacts = records.length;
    const failedContacts = records.filter(r => r.status === 'FAILED').length;
    const successRate = Math.round(((totalContacts - failedContacts) / totalContacts) * 100);

    return `
        <div class="detail-row">
            <div><span class="detail-label">Tổng số lần liên hệ:</span></div>
            <div><span class="detail-value">${totalContacts}</span></div>
        </div>
        <div class="detail-row">
            <div><span class="detail-label">Số lần thành công:</span></div>
            <div><span class="detail-value text-success">${totalContacts - failedContacts}</span></div>
        </div>
        <div class="detail-row">
            <div><span class="detail-label">Số lần thất bại:</span></div>
            <div><span class="detail-value text-danger">${failedContacts}</span></div>
        </div>
        <div class="detail-row">
            <div><span class="detail-label">Tỷ lệ thành công:</span></div>
            <div><span class="detail-value text-${successRate >= 50 ? 'success' : 'danger'}">${successRate}%</span></div>
        </div>
        <div class="progress-bar">
            <div class="progress-fill progress-${successRate >= 50 ? 'success' : 'danger'}" style="width: ${successRate}%"></div>
        </div>
    `;
}

// Modal management
function openStudentModal() {
    document.getElementById('studentModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeStudentModal() {
    document.getElementById('studentModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    currentStudentId = null;
}

function openConfigModal() {
    document.getElementById('configModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeConfigModal() {
    document.getElementById('configModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Evaluate student risk
async function evaluateStudent() {
    if (!currentStudentId) return;

    try {
        setLoading(true);
        console.log(`📊 Evaluating risk for student: ${currentStudentId}`);

        const response = await apiRequest(`/students/${currentStudentId}/evaluate`, {
            method: 'POST'
        });

        showToast('Đánh giá rủi ro thành công!', 'success');

        // Reload student data
        await loadStudents();
        await viewStudentDetail(currentStudentId);

    } catch (error) {
        console.error('❌ Error evaluating student:', error);
        showToast('Lỗi khi đánh giá rủi ro: ' + error.message, 'error');
    } finally {
        setLoading(false);
    }
}

// Evaluate student from table
async function evaluateStudentFromTable(studentId) {
    try {
        setLoading(true);
        console.log(`📊 Evaluating risk for student: ${studentId}`);

        const response = await apiRequest(`/students/${studentId}/evaluate`, {
            method: 'POST'
        });

        showToast(`Đánh giá rủi ro cho sinh viên ${studentId} thành công!`, 'success');

        // Reload student data
        await loadStudents();

    } catch (error) {
        console.error('❌ Error evaluating student:', error);
        showToast('Lỗi khi đánh giá rủi ro: ' + error.message, 'error');
    } finally {
        setLoading(false);
    }
}

// Evaluate all students
async function evaluateAllStudents() {
    if (allStudents.length === 0) {
        showToast('Không có sinh viên nào để đánh giá', 'warning');
        return;
    }

    const confirmEvaluate = confirm(`Bạn có chắc chắn muốn đánh giá rủi ro cho tất cả ${allStudents.length} sinh viên?`);
    if (!confirmEvaluate) return;

    try {
        setLoading(true);
        console.log(`📊 Evaluating risk for all ${allStudents.length} students...`);

        let successCount = 0;
        let errorCount = 0;

        // Evaluate students in batches to avoid overwhelming the server
        for (let i = 0; i < allStudents.length; i++) {
            try {
                await apiRequest(`/students/${allStudents[i].student_id}/evaluate`, {
                    method: 'POST'
                });
                successCount++;
            } catch (error) {
                console.error(`Error evaluating student ${allStudents[i].student_id}:`, error);
                errorCount++;
            }
        }

        if (errorCount === 0) {
            showToast(`Đánh giá rủi ro thành công cho tất cả ${successCount} sinh viên!`, 'success');
        } else {
            showToast(`Hoàn thành đánh giá: ${successCount} thành công, ${errorCount} lỗi`, 'warning');
        }

        // Reload student data
        await loadStudents();

    } catch (error) {
        console.error('❌ Error evaluating all students:', error);
        showToast('Lỗi khi đánh giá rủi ro cho tất cả sinh viên: ' + error.message, 'error');
    } finally {
        setLoading(false);
    }
}

// Load configuration
async function loadConfiguration() {
    try {
        console.log('📡 Loading configuration...');
        const response = await apiRequest('/config/thresholds');
        const config = response.data;

        // Update form fields
        document.getElementById('attendanceThreshold').value = Math.round(config.attendance_threshold * 100);
        document.getElementById('assignmentThreshold').value = Math.round(config.assignment_threshold * 100);
        document.getElementById('contactThreshold').value = config.contact_failure_threshold;

        console.log('✅ Configuration loaded successfully');

    } catch (error) {
        console.error('❌ Error loading configuration:', error);
        showToast('Lỗi khi tải cấu hình: ' + error.message, 'error');
    }
}

// Save configuration
async function saveConfiguration() {
    try {
        setLoading(true);

        const attendanceThreshold = parseFloat(document.getElementById('attendanceThreshold').value) / 100;
        const assignmentThreshold = parseFloat(document.getElementById('assignmentThreshold').value) / 100;
        const contactThreshold = parseInt(document.getElementById('contactThreshold').value);

        // Validate input
        if (isNaN(attendanceThreshold) || attendanceThreshold < 0 || attendanceThreshold > 1) {
            throw new Error('Ngưỡng tỷ lệ tham dự phải từ 0-100%');
        }
        if (isNaN(assignmentThreshold) || assignmentThreshold < 0 || assignmentThreshold > 1) {
            throw new Error('Ngưỡng tỷ lệ nộp bài phải từ 0-100%');
        }
        if (isNaN(contactThreshold) || contactThreshold < 0) {
            throw new Error('Ngưỡng số lần liên hệ thất bại phải >= 0');
        }

        console.log('📡 Saving configuration...');

        const response = await apiRequest('/config/thresholds', {
            method: 'PUT',
            body: JSON.stringify({
                attendance_threshold: attendanceThreshold,
                assignment_threshold: assignmentThreshold,
                contact_failure_threshold: contactThreshold
            })
        });

        showToast('Cập nhật cấu hình thành công!', 'success');
        closeConfigModal();

        console.log('✅ Configuration saved successfully');

    } catch (error) {
        console.error('❌ Error saving configuration:', error);
        showToast('Lỗi khi lưu cấu hình: ' + error.message, 'error');
    } finally {
        setLoading(false);
    }
}

// Refresh data
async function refreshData() {
    console.log('🔄 Refreshing data...');
    await Promise.all([
        loadStudents(),
        loadConfiguration()
    ]);
    showToast('Dữ liệu đã được làm mới!', 'info');
}

// Toast notification system
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = getToastIcon(type);
    const title = getToastTitle(type);

    toast.innerHTML = `
        <div class="toast-header">
            <i class="${icon}"></i> ${title}
        </div>
        <div class="toast-message">${message}</div>
    `;

    toastContainer.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'toastSlideOut 0.3s ease forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toastContainer.removeChild(toast);
                }
            }, 300);
        }
    }, 5000);

    // Click to dismiss
    toast.addEventListener('click', () => {
        if (toast.parentNode) {
            toast.style.animation = 'toastSlideOut 0.3s ease forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toastContainer.removeChild(toast);
                }
            }, 300);
        }
    });
}

function getToastIcon(type) {
    switch (type) {
        case 'success': return 'fas fa-check-circle';
        case 'error': return 'fas fa-exclamation-circle';
        case 'warning': return 'fas fa-exclamation-triangle';
        case 'info': default: return 'fas fa-info-circle';
    }
}

function getToastTitle(type) {
    switch (type) {
        case 'success': return 'Thành công';
        case 'error': return 'Lỗi';
        case 'warning': return 'Cảnh báo';
        case 'info': default: return 'Thông tin';
    }
}

// Add CSS for toast slide out animation
co