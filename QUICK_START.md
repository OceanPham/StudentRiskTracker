# 🚀 Quick Start Guide

## Cài đặt nhanh trong 5 phút

### 1. ⚡ Setup Database (2 phút)

```bash
# Tạo database MySQL
mysql -u root -p
```

```sql
CREATE DATABASE student_dropout_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

```bash
# Import schema và dữ liệu mẫu
mysql -u root -p student_dropout_system < database/schema.sql
mysql -u root -p student_dropout_system < database/sample_data.sql
```

### 2. 🖥️ Setup Backend (1 phút)

```bash
cd backend
npm install

# Tạo file .env (thay đổi password của bạn)
cat > .env << EOF
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=student_dropout_system
DB_PORT=3306
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3001
EOF

# Start server
npm start
```

**✅ Backend running at: http://localhost:3000**

### 3. 🌐 Setup Frontend (1 phút)

```bash
# Terminal mới
cd frontend

# Python 3
python -m http.server 3001

# Hoặc Node.js
npx serve -p 3001

# Hoặc PHP
php -S localhost:3001
```

**✅ Frontend running at: http://localhost:3001**

### 4. 🎯 Test System (1 phút)

1. Mở browser: `http://localhost:3001`
2. Xem danh sách sinh viên có sẵn
3. Click **"Đánh giá tất cả"** để test
4. Kiểm tra kết quả đánh giá rủi ro

## 🎉 Done! 

Hệ thống đã sẵn sàng với:
- ✅ 5 sinh viên mẫu
- ✅ Dữ liệu attendance, assignments, contacts
- ✅ Các API endpoints hoạt động
- ✅ Giao diện web responsive

## 🔧 Nếu có lỗi:

**Database connection failed:**
```bash
# Kiểm tra MySQL running
sudo service mysql start
# Hoặc
brew services start mysql
```

**Port đã sử dụng:**
```bash
# Kill process
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

**CORS error:**
- Đảm bảo frontend chạy port 3001
- Kiểm tra backend .env CORS_ORIGIN

## 📚 Next Steps:

1. Đọc [README.md](README.md) để hiểu chi tiết
2. Test các API endpoints
3. Customize ngưỡng đánh giá
4. Import dữ liệu thật của bạn