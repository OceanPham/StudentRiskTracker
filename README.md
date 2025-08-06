# 🎓 Student Dropout Risk Analysis System

**Hệ thống dự đoán và đánh giá rủi ro bỏ học sinh viên với giao diện web hoàn chỉnh**

## 📋 Tổng quan

Hệ thống này được thiết kế để giúp các cơ sở giáo dục:

- 🔍 **Đánh giá rủi ro bỏ học** dựa trên dữ liệu hành vi học tập
- 📊 **Theo dõi và phân tích** tỷ lệ tham dự, nộp bài tập, liên hệ hỗ trợ
- ⚠️ **Cảnh báo sớm** sinh viên có nguy cơ bỏ học cao
- 🎯 **Hỗ trợ can thiệp** kịp thời và hiệu quả

## 🏗️ Kiến trúc Hệ thống

```
📁 Student Dropout Risk Analysis System/
├── 🗄️ database/           # SQL schema và dữ liệu mẫu
├── 🖥️ backend/           # Node.js + Express API Server
│   ├── config/           # Cấu hình database và môi trường
│   ├── models/           # Data models và business logic
│   ├── controllers/      # API request handlers
│   ├── routes/           # API route definitions
│   └── server.js         # Main server file
├── 🌐 frontend/          # HTML + CSS + JavaScript
│   ├── css/              # Stylesheets
│   ├── js/               # JavaScript logic
│   └── index.html        # Main UI file
└── 📖 docs/              # Documentation files
```

## 🚀 Công nghệ Sử dụng

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Relational database
- **mysql2** - Database driver với Promise support

### Frontend

- **HTML5** - Semantic markup
- **CSS3** - Modern styling với Grid/Flexbox
- **Vanilla JavaScript** - No framework dependencies
- **Font Awesome** - Icon library

### Công cụ khác

- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger

## 📊 Logic Đánh giá Rủi ro

### Các chỉ số đánh giá:

1. **📅 Tỷ lệ Tham dự (Attendance Rate)**

   - Tính: `số ngày ATTEND / tổng số ngày`
   - Ngưỡng mặc định: < 75% → +1 điểm rủi ro

2. **📚 Tỷ lệ Nộp Bài tập (Assignment Rate)**

   - Tính: `số bài đã nộp / tổng số bài`
   - Ngưỡng mặc định: < 50% → +1 điểm rủi ro

3. **📞 Liên hệ Hỗ trợ Thất bại (Failed Contacts)**
   - Tính: `số lần liên hệ FAILED`
   - Ngưỡng mặc định: ≥ 2 lần → +1 điểm rủi ro

### Phân loại rủi ro:

- **🟢 RỦI RO THẤP (LOW)**: 0-1 điểm
- **🟡 RỦI RO TRUNG BÌNH (MEDIUM)**: 2 điểm
- **🔴 RỦI RO CAO (HIGH)**: 3 điểm

### Xác suất bỏ học:

```
Dropout Probability = (Risk Score / 3) × 100%
```

## 🛠️ Cài đặt và Triển khai

### Yêu cầu hệ thống

- **Node.js** >= 14.0.0
- **MySQL** >= 5.7 hoặc **MariaDB** >= 10.3
- **NPM** hoặc **Yarn**

### 1. Clone Repository

```bash
git clone <repository-url>
cd student-dropout-analysis
```

### 2. Cài đặt Backend

```bash
cd backend
npm install
```

### 3. Cấu hình Database

Tạo database MySQL:

```bash
mysql -u root -p < ../database/schema.sql
mysql -u root -p < ../database/sample_data.sql
```

Hoặc import thủ công:

```sql
-- Import schema.sql để tạo cấu trúc database
-- Import sample_data.sql để có dữ liệu mẫu
```

### 4. Cấu hình Backend

Tạo file `.env` trong thư mục `backend/`:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=student_dropout_system
DB_PORT=3306

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3001
```

### 5. Chạy Backend Server

```bash
cd backend
npm start
# Server sẽ chạy tại: http://localhost:3000
```

### 6. Chạy Frontend

**Option 1: Simple HTTP Server**

```bash
cd frontend
python -m http.server 3001
# hoặc
npx serve -p 3001
```

**Option 2: Live Server (VS Code Extension)**

- Cài đặt Live Server extension
- Right-click vào `frontend/index.html` → "Open with Live Server"

Frontend sẽ chạy tại: `http://localhost:3001`

## 📡 API Documentation

### Students Endpoints

| Method | Endpoint                     | Description                       |
| ------ | ---------------------------- | --------------------------------- |
| `GET`  | `/api/students`              | Lấy danh sách tất cả sinh viên    |
| `GET`  | `/api/students/:id`          | Lấy chi tiết một sinh viên        |
| `GET`  | `/api/students/risk/:level`  | Lọc sinh viên theo mức rủi ro     |
| `POST` | `/api/students/:id/evaluate` | Đánh giá rủi ro cho một sinh viên |

### Configuration Endpoints

| Method | Endpoint                 | Description                  |
| ------ | ------------------------ | ---------------------------- |
| `GET`  | `/api/config/thresholds` | Lấy ngưỡng cấu hình hiện tại |
| `PUT`  | `/api/config/thresholds` | Cập nhật ngưỡng cấu hình     |

### System Endpoints

| Method | Endpoint  | Description                |
| ------ | --------- | -------------------------- |
| `GET`  | `/health` | Kiểm tra trạng thái server |
| `GET`  | `/`       | API documentation          |

### Ví dụ API Calls

**Lấy danh sách sinh viên:**

```bash
curl -X GET http://localhost:3000/api/students
```

**Đánh giá rủi ro cho sinh viên:**

```bash
curl -X POST http://localhost:3000/api/students/STDA/evaluate
```

**Cập nhật ngưỡng cấu hình:**

```bash
curl -X PUT http://localhost:3000/api/config/thresholds \
  -H "Content-Type: application/json" \
  -d '{
    "attendance_threshold": 0.8,
    "assignment_threshold": 0.6,
    "contact_failure_threshold": 3
  }'
```

## 🎯 Tính năng Chính

### 🌐 Frontend Features

#### 📊 Dashboard Overview

- **Thống kê tổng quan** với các card hiển thị số lượng sinh viên theo mức rủi ro
- **Charts và indicators** trực quan và dễ hiểu

#### 📋 Student Management

- **Danh sách sinh viên** với thông tin đầy đủ
- **Tìm kiếm và lọc** theo tên, ID, mức rủi ro
- **Sắp xếp** theo nhiều tiêu chí khác nhau
- **Chi tiết sinh viên** với modal popup

#### 🔍 Risk Analysis

- **Đánh giá rủi ro cá nhân** cho từng sinh viên
- **Đánh giá hàng loạt** cho tất cả sinh viên
- **Visual feedback** với progress bars và badges

#### ⚙️ Configuration Management

- **Cấu hình ngưỡng** đánh giá qua giao diện
- **Real-time updates** không cần restart server

#### 📱 User Experience

- **Responsive design** cho mọi thiết bị
- **Loading indicators** và error handling
- **Toast notifications** cho feedback tức thì
- **Smooth animations** và transitions

### 🖥️ Backend Features

#### 🗄️ Database Management

- **MySQL integration** với connection pooling
- **Transaction support** để đảm bảo data integrity
- **Optimized queries** với indexing

#### 🔒 Security & Performance

- **CORS protection**
- **Helmet security** middleware
- **Request logging** với Morgan
- **Error handling** comprehensive

#### 📈 Analytics Engine

- **Risk calculation** algorithm
- **Statistical analysis** cho attendance/assignments
- **Configurable thresholds** cho flexibility

## 📖 Hướng dẫn Sử dụng

### 1. Khởi động Hệ thống

1. **Start Backend**: `cd backend && npm start`
2. **Start Frontend**: Mở `http://localhost:3001` trong browser
3. **Verify**: Kiểm tra `http://localhost:3000/health` cho backend status

### 2. Xem Danh sách Sinh viên

- Dashboard sẽ hiển thị tất cả sinh viên
- Sử dụng **search box** để tìm kiếm theo tên/ID
- Sử dụng **dropdown filters** để lọc theo mức rủi ro
- **Sort** theo tên hoặc mức rủi ro

### 3. Đánh giá Rủi ro

**Đánh giá cá nhân:**

- Click **"Đánh giá"** button bên cạnh sinh viên
- Hệ thống sẽ tự động tính toán và lưu kết quả

**Đánh giá hàng loạt:**

- Click **"Đánh giá tất cả"** button ở header
- Confirm action trong dialog popup

### 4. Xem Chi tiết Sinh viên

- Click **"Xem"** button để mở modal chi tiết
- Xem thông tin:
  - 📋 **Thông tin cơ bản**
  - 🔍 **Kết quả đánh giá rủi ro**
  - 📅 **Dữ liệu tham dự** với progress bars
  - 📚 **Dữ liệu bài tập** và submission rates
  - 📞 **Lịch sử liên hệ hỗ trợ**

### 5. Cấu hình Ngưỡng

- Click **"Cấu hình"** button ở header
- Điều chỉnh các ngưỡng:
  - **Attendance threshold** (%)
  - **Assignment threshold** (%)
  - **Contact failure threshold** (số lần)
- **Save** để áp dụng thay đổi

## 📊 Database Schema

### Tables Overview

```sql
📋 students              # Thông tin sinh viên
📅 attendance            # Dữ liệu điểm danh
📚 assignments           # Dữ liệu bài tập
📞 contacts              # Dữ liệu liên hệ hỗ trợ
🔍 risk_evaluations      # Kết quả đánh giá rủi ro
⚙️ risk_thresholds       # Cấu hình ngưỡng
```

### Key Relationships

```
students (1) ←→ (N) attendance
students (1) ←→ (N) assignments
students (1) ←→ (N) contacts
students (1) ←→ (N) risk_evaluations
```

## 🧪 Testing

### Backend Testing

```bash
cd backend
npm test
```

### API Testing với curl

```bash
# Health check
curl http://localhost:3000/health

# Get all students
curl http://localhost:3000/api/students

# Get student by ID
curl http://localhost:3000/api/students/STDA

# Evaluate student risk
curl -X POST http://localhost:3000/api/students/STDA/evaluate
```

### Frontend Testing

1. Mở browser developer tools
2. Test các chức năng chính:
   - ✅ Load students list
   - ✅ Search và filter
   - ✅ View student detail
   - ✅ Evaluate risk
   - ✅ Update configuration

## 🚨 Troubleshooting

### Common Issues

**1. Database Connection Error**

```
❌ Cannot connect to database
```

**Solution:**

- Kiểm tra MySQL server đang chạy
- Verify credentials trong `.env` file
- Đảm bảo database `student_dropout_system` tồn tại

**2. CORS Error**

```
❌ Access to fetch blocked by CORS policy
```

**Solution:**

- Kiểm tra `CORS_ORIGIN` trong backend config
- Đảm bảo frontend chạy đúng port (3001)

**3. Port Already in Use**

```
❌ Error: listen EADDRINUSE :::3000
```

**Solution:**

```bash
# Kill process sử dụng port 3000
lsof -ti:3000 | xargs kill -9
# Hoặc thay đổi PORT trong .env
```

**4. Frontend không connect Backend**

```
❌ Failed to fetch
```

**Solution:**

- Kiểm tra backend server đang chạy (`http://localhost:3000/health`)
- Verify `API_BASE_URL` trong `frontend/js/main.js`

## 🔄 Deployment

### Production Setup

**1. Environment Configuration**

```env
NODE_ENV=production
DB_HOST=your-production-db-host
CORS_ORIGIN=https://your-frontend-domain.com
```

**2. Database Setup**

```bash
# Production database
mysql -u production_user -p production_db < database/schema.sql
```

**3. Start Production Server**

```bash
cd backend
npm start
```

**4. Serve Frontend**

```bash
# Using nginx, Apache, hoặc static hosting service
```

## 📈 Monitoring và Logging

### Server Monitoring

- **Health endpoint**: `/health`
- **API documentation**: `/`
- **Console logs** với Morgan middleware

### Performance Metrics

- **Database connection pooling**
- **Request/response times**
- **Error rates và stack traces**

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

**CS Team** - POC Student Dropout Risk Analysis System

---

## 📞 Support

Nếu bạn gặp vấn đề hoặc có câu hỏi:

1. Kiểm tra [Troubleshooting](#🚨-troubleshooting) section
2. Review [API Documentation](#📡-api-documentation)
3. Check console logs cho error details
4. Open issue trên repository

---

**🎯 Happy Analyzing! 🎓**
