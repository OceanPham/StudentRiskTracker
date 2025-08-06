const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { testConnection } = require('./config/database');
const studentRoutes = require('./routes/studentRoutes');
const config = require('./config/env');

// Tạo Express app
const app = express();

// Middleware bảo mật
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
    optionsSuccessStatus: 200
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (config.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running successfully',
        timestamp: new Date().toISOString(),
        environment: config.NODE_ENV
    });
});

// API routes
app.use('/api', studentRoutes);

// Root endpoint với thông tin API
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Student Dropout Risk Analysis API',
        version: '1.0.0',
        endpoints: {
            students: {
                'GET /api/students': 'Lấy danh sách tất cả sinh viên',
                'GET /api/students/:id': 'Lấy chi tiết một sinh viên',
                'GET /api/students/risk/:level': 'Lọc sinh viên theo mức độ rủi ro',
                'POST /api/students/:id/evaluate': 'Đánh giá rủi ro cho một sinh viên'
            },
            config: {
                'GET /api/config/thresholds': 'Lấy ngưỡng cấu hình hiện tại',
                'PUT /api/config/thresholds': 'Cập nhật ngưỡng cấu hình'
            },
            system: {
                'GET /health': 'Kiểm tra trạng thái server'
            }
        },
        documentation: 'Xem file README.md để biết thêm chi tiết'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.stack);

    // Không leak thông tin lỗi trong production
    const isDevelopment = config.NODE_ENV === 'development';

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(isDevelopment && { stack: err.stack }),
        timestamp: new Date().toISOString()
    });
});

// Handle 404 - Route not found
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        availableRoutes: [
            'GET /api/students',
            'GET /api/students/:id',
            'GET /api/students/risk/:level',
            'POST /api/students/:id/evaluate',
            'GET /api/config/thresholds',
            'PUT /api/config/thresholds',
            'GET /health'
        ]
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received. Shutting down gracefully...');
    process.exit(0);
});

// Start server
async function startServer() {
    try {
        // Test database connection
        console.log('🔄 Testing database connection...');
        const dbConnected = await testConnection();

        if (!dbConnected) {
            console.error('❌ Cannot connect to database. Please check your database configuration.');
            console.log('📝 Make sure MySQL is running and database exists.');
            console.log('📝 Check backend/config/env.js for database settings.');
            process.exit(1);
        }

        // Start HTTP server
        const PORT = config.PORT;
        app.listen(PORT, () => {
            console.log('🚀 =============================================');
            console.log(`🎓 Student Dropout Risk Analysis API Server`);
            console.log('🚀 =============================================');
            console.log(`📡 Server running on: http://localhost:${PORT}`);
            console.log(`🌍 Environment: ${config.NODE_ENV}`);
            console.log(`🔗 CORS origin: ${config.CORS_ORIGIN}`);
            console.log(`📊 Health check: http://localhost:${PORT}/health`);
            console.log(`📚 API docs: http://localhost:${PORT}/`);
            console.log('🚀 =============================================');

            if (config.NODE_ENV === 'development') {
                console.log('💡 Development Tips:');
                console.log('   - Use Postman or curl to test APIs');
                console.log('   - Check /health endpoint for server status');
                console.log('   - Frontend should run on http://localhost:3001');
                console.log('🚀 =============================================');
            }
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
}

// Initialize and start server
startServer();

module.exports = app;