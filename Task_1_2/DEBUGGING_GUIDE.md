# 🔧 Hướng dẫn Debug - Vấn đề không hiển thị sinh viên

## 🚨 Vấn đề: Frontend không hiển thị danh sách sinh viên khi mới load

### 📋 Checklist kiểm tra:

#### 1. ✅ Kiểm tra Backend Server

```bash
# Kiểm tra backend có chạy không
curl http://localhost:3000/health

# Hoặc dùng PowerShell
powershell "Invoke-RestMethod -Uri 'http://localhost:3000/health'"
```

**Kết quả mong đợi:**

```json
{
  "success": true,
  "message": "Server is running successfully",
  "timestamp": "2025-08-06T07:35:19.557Z",
  "environment": "development"
}
```

#### 2. ✅ Kiểm tra API Students

```bash
# Kiểm tra API lấy danh sách sinh viên
powershell "Invoke-RestMethod -Uri 'http://localhost:3000/api/students'"
```

**Kết quả mong đợi:**

```json
{
  "success": true,
  "message": "Lấy danh sách sinh viên thành công",
  "data": [...],
  "count": 5
}
```

#### 3. ✅ Kiểm tra Frontend Server

- Frontend phải chạy trên port 3001: `http://localhost:3001`
- Backend phải chạy trên port 3000: `http://localhost:3000`

#### 4. ✅ Kiểm tra CORS

- Backend phải cho phép CORS từ `http://localhost:3001`
- Kiểm tra trong file `backend/config/env.js`:

```javascript
CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3001";
```

### 🛠️ Các bước khắc phục:

#### Bước 1: Chạy Backend

```bash
cd backend
npm install
npm start
```

#### Bước 2: Chạy Frontend

```bash
cd frontend
python -m http.server 3001
# Hoặc
npx serve -p 3001
```

#### Bước 3: Kiểm tra Debug Page

Mở: `http://localhost:3001/debug.html`

### 🔍 Debug trên Browser:

#### Mở Developer Tools (F12):

1. **Console Tab** - Kiểm tra lỗi JavaScript:

   ```
   🚀 Initializing Student Dropout Risk Analysis System...
   📡 Loading students...
   response: {success: true, data: [...]}
   ✅ Loaded 5 students
   ```

2. **Network Tab** - Kiểm tra API calls:

   - `GET http://localhost:3000/api/students` → Status 200
   - `GET http://localhost:3000/api/config/thresholds` → Status 200

3. **Elements Tab** - Kiểm tra DOM:
   - `#studentTableBody` có dữ liệu
   - `#loadingIndicator` display: none
   - `#emptyState` display: none

### ❌ Các lỗi thường gặp:

#### 1. **CORS Error**

```
Access to fetch at 'http://localhost:3000/api/students' from origin 'http://localhost:3001' has been blocked by CORS policy
```

**Khắc phục:** Kiểm tra backend CORS config

#### 2. **Connection Refused**

```
Failed to fetch: TypeError: Failed to fetch
```

**Khắc phục:** Backend chưa chạy hoặc sai port

#### 3. **Empty Response**

```
response: {success: true, data: []}
```

**Khắc phục:** Database trống hoặc query sai

#### 4. **JavaScript Errors**

```
Cannot read properties of null (reading 'value')
```

**Khắc phục:** DOM elements chưa load xong

### 🎯 Cách test từng phần:

#### Test 1: API hoạt động

```javascript
// Paste vào Console
fetch("http://localhost:3000/api/students")
  .then((r) => r.json())
  .then((d) => console.log("API Result:", d))
  .catch((e) => console.error("API Error:", e));
```

#### Test 2: DOM elements tồn tại

```javascript
// Paste vào Console
console.log("Search Input:", document.getElementById("searchInput"));
console.log("Risk Filter:", document.getElementById("riskFilter"));
console.log("Sort By:", document.getElementById("sortBy"));
console.log("Table Body:", document.getElementById("studentTableBody"));
```

#### Test 3: Load function

```javascript
// Paste vào Console
loadStudents().then(() => {
  console.log("Manual load completed");
  console.log("All students:", allStudents);
});
```

### 🔧 Các fix đã áp dụng:

1. ✅ **Null safety** cho DOM elements
2. ✅ **Better error handling** cho API responses
3. ✅ **Validation** cho response format
4. ✅ **Fallback values** cho sorting và filtering

### 📞 Nếu vẫn không hoạt động:

1. **Clear browser cache** (Ctrl+Shift+R)
2. **Check Windows Firewall** cho ports 3000, 3001
3. **Try different browser** (Chrome, Firefox, Edge)
4. **Check antivirus software** có block không

### 🎯 Debug URL:

- Frontend: http://localhost:3001
- Backend Health: http://localhost:3000/health
- Backend API: http://localhost:3000/api/students
- Debug Page: http://localhost:3001/debug.html
