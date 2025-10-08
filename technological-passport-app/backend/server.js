const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'technological_passport_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Database connection test
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Database connected successfully');
        connection.release();
    } catch (error) {
        console.error('Database connection failed:', error.message);
    }
}

// Routes

// Get all passports
app.get('/api/passports', async (req, res) => {
    try {
        const [rows] = await pool.execute('CALL GetAllPassports()');
        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Error fetching passports:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching passports',
            error: error.message
        });
    }
});

// Get passport by ID
app.get('/api/passports/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute('CALL GetPassportById(?)', [id]);
        
        if (rows[0].length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Passport not found'
            });
        }
        
        res.json({
            success: true,
            data: rows[0][0]
        });
    } catch (error) {
        console.error('Error fetching passport:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching passport',
            error: error.message
        });
    }
});

// Get passport process steps
app.get('/api/passports/:id/steps', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute(
            'SELECT * FROM process_steps WHERE passport_id = ? ORDER BY step_number',
            [id]
        );
        
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error fetching process steps:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching process steps',
            error: error.message
        });
    }
});

// Update passport status
app.put('/api/passports/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, inspectorName, notes } = req.body;
        
        await pool.execute(
            'CALL UpdatePassportStatus(?, ?, ?, ?)',
            [id, status, inspectorName, notes]
        );
        
        res.json({
            success: true,
            message: 'Passport status updated successfully'
        });
    } catch (error) {
        console.error('Error updating passport status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating passport status',
            error: error.message
        });
    }
});

// Get assembly types
app.get('/api/assembly-types', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM assembly_types ORDER BY type_name');
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error fetching assembly types:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching assembly types',
            error: error.message
        });
    }
});

// Get quality inspectors
app.get('/api/inspectors', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM quality_inspectors WHERE is_active = true ORDER BY first_name, last_name'
        );
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error fetching inspectors:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching inspectors',
            error: error.message
        });
    }
});

// Create new passport
app.post('/api/passports', async (req, res) => {
    try {
        const {
            passportId,
            articleNumber,
            serialNumber,
            assemblyName,
            unitSerial,
            invNumber,
            currentSheet,
            totalSheets,
            manufacturingDate,
            assemblyType,
            inspectorName,
            notes,
            checkedBy,
            authorizedBy
        } = req.body;
        
        const [result] = await pool.execute(
            `INSERT INTO technological_passports 
             (passport_id, article_number, serial_number, assembly_name, unit_serial,
              inv_number, current_sheet, total_sheets, manufacturing_date, assembly_type,
              inspector_name, notes, checked_by, authorized_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                passportId, articleNumber, serialNumber, assemblyName, unitSerial,
                invNumber, currentSheet, totalSheets, manufacturingDate, assemblyType,
                inspectorName, notes, checkedBy, authorizedBy
            ]
        );
        
        res.json({
            success: true,
            message: 'Passport created successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Error creating passport:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating passport',
            error: error.message
        });
    }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Start server
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await testConnection();
});

module.exports = app;