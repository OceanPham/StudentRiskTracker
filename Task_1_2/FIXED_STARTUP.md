# 🎯 Hướng dẫn Khởi động Hệ thống - ĐÃ SỬA

## 🚀 Các Port đã thay đổi:

- **Backend**: `http://localhost:3005`
- **Frontend**: `http://localhost:8080`

## ✅ Các vấn đề đã sửa:

### 1. **Port Conflicts**

- Backend chuyển từ 3000 → 3005
- Frontend chuyển từ 3001 → 8080
- Cập nhật CORS origin tương ứng

### 2. **DOM Loading Issues**

- Thêm DOM verification trước khi load data
- Thêm setTimeout để đảm bảo DOM ready
- Force display students sau khi load API

### 3. **Error Handling**

- Safer DOM element access
- Better console logging cho debugging
- Fallback cho missing elements

## 🏃‍♂️ Cách chạy:

### Backend:

```bash
cd backend
npm start
# ✅ Server: http://localhost:3005
```

### Frontend:

```bash
cd frontend
python -m http.server 8080
# ✅ UI: http://localhost:8080
```

## 🔧 Test nhanh:

1. **Backend Health**: http://localhost:3005/health
2. **Frontend**: http://localhost:8080
3. **API Students**: http://localhost:3005/api/students

## 🎯 Những gì đã sửa trong code:

### 1. `main.js` - DOM Safety:

```javascript
// Before
document.getElementById('studentTableBody').innerHTML = ...

// After
const tableBody = document.getElementById('studentTableBody');
if (!tableBody) {
    console.error('❌ Element not found!');
    return;
}
tableBody.innerHTML = ...
```

### 2. `main.js` - Force Display:

```javascript
// Thêm force display sau khi load
displayStudents(allStudents);
setTimeout(() => {
  filterAndDisplayStudents();
}, 50);
```

### 3. `main.js` - DOM Ready Check:

```javascript
// Verify tất cả elements tồn tại trước khi chạy
const criticalElements = [
  "studentTableBody",
  "loadingIndicator",
  "emptyState",
  "searchInput",
  "riskFilter",
  "sortBy",
];

const missing = criticalElements.filter((id) => !document.getElementById(id));
if (missing.length > 0) {
  console.error("❌ Missing DOM elements:", missing);
  return;
}
```

## 📊 Debug Console Output:

Khi mở http://localhost:8080, trong Console (F12) bạn sẽ thấy:

```
🚀 Initializing Student Dropout Risk Analysis System...
🔄 Starting data load after DOM ready...
✅ All DOM elements found
📡 Loading students...
response: {success: true, data: Array(5), count: 5}
✅ Loaded 5 students
🔄 Force displaying students...
displayStudents called with: 5 students
📝 Hiding empty state
allStudents: (5) [{...}, {...}, {...}, {...}, {...}]
filteredStudents: (5) [{...}, {...}, {...}, {...}, {...}]
✅ Application initialized successfully
```

## ❌ Nếu vẫn không hiển thị:

1. **Hard refresh**: Ctrl+Shift+R
2. **Check Console**: F12 → Console tab
3. **Check Network**: F12 → Network tab
4. **Clear cache**: Browser settings → Clear data

## 🎉 Kết quả mong đợi:

- Trang load lên hiển thị ngay 5 sinh viên
- Statistics cards show: 2 LOW, 1 MEDIUM, 1 HIGH, 4 total
- Filter/search hoạt động bình thường
- Không cần phải filter mới thấy data
