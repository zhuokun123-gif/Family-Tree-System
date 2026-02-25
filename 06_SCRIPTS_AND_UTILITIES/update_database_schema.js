const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'family tree',
    port: 3306
};

async function updateDatabaseSchema() {
    let connection;
    
    try {
        console.log('🚀 Starting Database Schema Update...');
        console.log('');
        
        // Connect to database
        console.log('📡 Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');
        
        // Add new columns to familytree_people table
        console.log('🔄 Adding new columns to familytree_people table...');
        
        const alterQueries = [
            'ALTER TABLE familytree_people ADD COLUMN IF NOT EXISTS Gender VARCHAR(20) DEFAULT "Unknown"',
            'ALTER TABLE familytree_people ADD COLUMN IF NOT EXISTS Age INT DEFAULT NULL',
            'ALTER TABLE familytree_people ADD COLUMN IF NOT EXISTS Life_Status VARCHAR(20) DEFAULT "Unknown"',
            'ALTER TABLE familytree_people ADD COLUMN IF NOT EXISTS Marital_Status VARCHAR(20) DEFAULT "Unknown"'
        ];
        
        for (const query of alterQueries) {
            try {
                await connection.execute(query);
                console.log(`✅ Executed: ${query}`);
            } catch (error) {
                if (error.code === 'ER_DUP_FIELDNAME') {
                    console.log(`ℹ️  Column already exists: ${query}`);
                } else {
                    console.error(`❌ Error executing: ${query}`, error.message);
                }
            }
        }
        
        // Verify table structure
        console.log('');
        console.log('🔍 Verifying table structure...');
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'family tree' 
            AND TABLE_NAME = 'familytree_people'
            ORDER BY ORDINAL_POSITION
        `);
        
        console.log('📋 Current table structure:');
        columns.forEach(col => {
            console.log(`  ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE === 'YES' ? 'nullable' : 'not null'}) ${col.COLUMN_DEFAULT ? `default: ${col.COLUMN_DEFAULT}` : ''}`);
        });
        
        console.log('');
        console.log('🎉 Database schema update completed successfully!');
        
    } catch (error) {
        console.error('❌ Schema update failed:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('📡 Database connection closed');
        }
    }
}

// Run the schema update
updateDatabaseSchema();

