# 🎓 Console Student Dropout Risk Analyzer

**Chương trình console đánh giá rủi ro bỏ học sinh viên với giao diện tương tác**

## 📋 Mô tả

Chương trình Node.js này chạy hoàn toàn trong console với giao diện menu tương tác, cho phép:

- ✅ Xem danh sách sinh viên
- ✅ Xem chi tiết từng sinh viên
- ✅ Đánh giá rủi ro tự động cho tất cả sinh viên
- ✅ Lưu kết quả vào file JSON mới
- ✅ Cấu hình linh hoạt thông qua file config

## 🚀 Cách sử dụng

### 1. Chạy chương trình

```bash
# Chạy chương trình console
npm run console

# Hoặc chạy trực tiếp
node console_risk_analyzer.js
```

### 2. Giao diện menu

Khi chạy, bạn sẽ thấy menu tương tác:

```
============================================================
🎓 HỆ THỐNG ĐÁNH GIÁ RỦI RO BỎ HỌC SINH VIÊN
============================================================
1. 📋 Xem danh sách sinh viên
2. 👤 Xem chi tiết 1 sinh viên
3. 🔍 Đánh giá rủi ro toàn bộ sinh viên
4. 💾 Lưu kết quả vào file mới
5. ⚙️  Hiển thị cấu hình hệ thống
6. 🚪 Thoát chương trình
============================================================
```

### 3. Các chức năng chính

#### 📋 **Tùy chọn 1: Xem danh sách sinh viên**

- Hiển thị bảng tổng quan tất cả sinh viên
- Bao gồm: STT, Student ID, Tên, Risk Level, Dropout Risk

#### 👤 **Tùy chọn 2: Xem chi tiết 1 sinh viên**

- Nhập Student ID để xem thông tin chi tiết
- Hiển thị: tham dự, bài tập, liên hệ hỗ trợ, đánh giá rủi ro

#### 🔍 **Tùy chọn 3: Đánh giá rủi ro toàn bộ sinh viên**

- Tự động tính toán rủi ro cho tất cả sinh viên
- Lưu kết quả vào object của từng sinh viên
- Hiển thị thống kê tổng quan và danh sách cần quan tâm

#### 💾 **Tùy chọn 4: Lưu kết quả vào file mới**

- Xuất dữ liệu đã đánh giá ra file JSON
- Mặc định: `students_with_risk.json`
- Có thể tùy chỉnh tên file

#### ⚙️ **Tùy chọn 5: Hiển thị cấu hình hệ thống**

- Xem các ngưỡng đánh giá hiện tại
- Mapping mức độ rủi ro

## 📊 Logic đánh giá rủi ro

### Các yếu tố rủi ro (+1 điểm mỗi yếu tố):

1. **Attendance**: Tỷ lệ tham dự < 75% → +1 điểm
2. **Assignment**: Tỷ lệ nộp bài < 50% → +1 điểm
3. **Communication**: Số lần liên hệ thất bại ≥ 2 → +1 điểm

### Kết quả đánh giá:

- **Điểm rủi ro**: 0-3 điểm
- **Mức độ rủi ro**: LOW (0-1), MEDIUM (2), HIGH (3)
- **Xác suất bỏ học**: (điểm rủi ro / 3) × 100%
- **Ghi chú**: Liệt kê các yếu tố gây rủi ro

### Lưu trữ kết quả:

Kết quả được lưu vào object `riskAssessment` của mỗi sinh viên:

```json
{
  "student_id": "STDA",
  "student_name": "Student A",
  "attendance": [...],
  "assignments": [...],
  "contacts": [...],
  "riskAssessment": {
    "risk_score": 0,
    "risk_level": "LOW",
    "dropoutProbability": 0,
    "note": "No risk factors detected",
    "details": {
      "attendance_rate": "93.8%",
      "assignment_rate": "100.0%",
      "failed_contacts": 0
    }
  }
}
```

## 📁 Cấu trúc files

```
project/
├── console_risk_analyzer.js    # Chương trình console chính
├── riskConfig.json            # Cấu hình ngưỡng đánh giá
├── students.json              # Dữ liệu sinh viên đầu vào
├── students_with_risk.json    # File output (sau khi đánh giá)
└── package.json              # Package configuration
```

## ⚙️ Cấu hình

Chỉnh sửa file `riskConfig.json` để thay đổi ngưỡng đánh giá:

```json
{
  "attendanceThreshold": 0.75, // 75%
  "assignmentThreshold": 0.5, // 50%
  "contactFailureThreshold": 2, // 2 lần
  "riskLevelMapping": [
    { "min": 0, "max": 1, "level": "LOW" },
    { "min": 2, "max": 2, "level": "MEDIUM" },
    { "min": 3, "max": 3, "level": "HIGH" }
  ]
}
```

## 📈 Ví dụ sử dụng

### 1. Khởi động chương trình:

```bash
npm run console
```

### 2. Chọn tùy chọn 3 để đánh giá rủi ro:

```
👆 Vui lòng chọn một tùy chọn (1-6): 3

🔍 ĐANG ĐÁNH GIÁ RỦI RO CHO TẤT CẢ SINH VIÊN...
✅ STDA (Student A): LOW - 0% risk
✅ STDB (Student B): MEDIUM - 67% risk
✅ STDC (Student C): HIGH - 100% risk
✅ STDD (Student D): LOW - 0% risk

📊 THỐNG KÊ TỔNG QUAN:
   🟢 Rủi ro THẤP (LOW): 2 sinh viên
   🟡 Rủi ro TRUNG BÌNH (MEDIUM): 1 sinh viên
   🔴 Rủi ro CAO (HIGH): 1 sinh viên

⚠️  SINH VIÊN CẦN QUAN TÂM:
   - STDB (Student B): MEDIUM - attendance, communication
   - STDC (Student C): HIGH - attendance, assignment, communication
```

### 3. Lưu kết quả:

```
👆 Vui lòng chọn một tùy chọn (1-6): 4
💾 Nhập tên file (mặc định: students_with_risk.json):
✅ Đã lưu kết quả vào file: students_with_risk.json
📄 File chứa 4 sinh viên với thông tin đánh giá rủi ro
```

## 🛠️ Yêu cầu hệ thống

- Node.js >= 12.0.0
- Không cần dependencies bổ sung (chỉ sử dụng built-in modules)

## 📝 Tác giả

CS Team - Console Student Dropout Risk Analysis System
