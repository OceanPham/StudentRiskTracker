const mysql = require('mysql2/promise');
require('dotenv').config();

// Cấu hình kết nối database
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'student_dropout_system',
    port: process.env.DB_PORT || 3306,
    charset: 'utf8mb4',
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
};

// Tạo connection pool
const pool = mysql.createPool(dbConfig);

// Test connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Kết nối database thành công!');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Lỗi kết nối database:', error.message);
        return false;
    }
}

// Utility function để thực hiện query
async function executeQuery(sql, params = []) {
    try {
        const [rows] = await pool.execute(sql, params);
        return { success: true, data: rows };
    } catch (error) {
        console.error('❌ Lỗi thực hiện query:', error.message);
        return { success: false, error: error.message };
    }
}

// Utility function để thực hiện transaction
async function executeTransaction(queries) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const results = [];
        for (const query of queries) {
            const [result] = await connection.execute(query.sql, query.params || []);
            results.push(result);
        }

        await connection.commit();
        return { success: true, data: results };
    } catch (error) {
        await connection.rollback();
        console.error('❌ Lỗi transaction:', error.message);
        return { success: false, error: error.message };
    } finally {
        connection.release();
    }
}

module.exports = {
    pool,
    testConnection,
    executeQuery,
    executeTransaction
};