const fs = require('fs');
const csv = require('csv-parser');
const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'family tree',
    port: 3306
};

console.log('🚀 Starting Processed Data Import...');
console.log('');

async function importProcessedData() {
    let connection;
    
    try {
        // Connect to database
        console.log('📡 Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');
        
        // Read processed data
        console.log('📖 Reading processed data...');
        const processedPeople = [];
        
        await new Promise((resolve, reject) => {
            fs.createReadStream('FamilyTree_People_Processed.csv')
                .pipe(csv())
                .on('data', (row) => {
                    processedPeople.push(row);
                })
                .on('end', resolve)
                .on('error', reject);
        });
        
        console.log(`✅ Loaded ${processedPeople.length} processed records`);
        
        // Update existing records with new fields
        console.log('🔄 Updating database with processed data...');
        
        let updatedCount = 0;
        let errorCount = 0;
        
        for (const person of processedPeople) {
            try {
                const updateQuery = `
                    UPDATE familytree_people 
                    SET 
                        Gender = ?,
                        Age = ?,
                        Life_Status = ?,
                        Marital_Status = ?
                    WHERE \`Personal _ID\` = ?
                `;
                
                const values = [
                    person.Gender || 'Unknown',
                    person.Age || null,
                    person.Life_Status || 'Unknown',
                    person.Marital_Status || 'Unknown',
                    person['Personal _ID']
                ];
                
                const [result] = await connection.execute(updateQuery, values);
                
                if (result.affectedRows > 0) {
                    updatedCount++;
                } else {
                    console.log(`⚠️  No record found for ID: ${person['Personal _ID']}`);
                }
                
            } catch (error) {
                console.error(`❌ Error updating ${person['Personal _ID']}:`, error.message);
                errorCount++;
            }
        }
        
        console.log('');
        console.log('📊 IMPORT STATISTICS');
        console.log('===================');
        console.log(`Total Records Processed: ${processedPeople.length}`);
        console.log(`Successfully Updated: ${updatedCount}`);
        console.log(`Errors: ${errorCount}`);
        console.log('');
        
        // Verify the update
        console.log('🔍 Verifying updates...');
        const [verifyRows] = await connection.execute(`
            SELECT 
                COUNT(*) as total,
                COUNT(Gender) as with_gender,
                COUNT(Age) as with_age,
                COUNT(Life_Status) as with_life_status,
                COUNT(Marital_Status) as with_marital_status
            FROM familytree_people
        `);
        
        const stats = verifyRows[0];
        console.log(`Total Records: ${stats.total}`);
        console.log(`With Gender: ${stats.with_gender}`);
        console.log(`With Age: ${stats.with_age}`);
        console.log(`With Life Status: ${stats.with_life_status}`);
        console.log(`With Marital Status: ${stats.with_marital_status}`);
        
        console.log('');
        console.log('🎉 Data import completed successfully!');
        
    } catch (error) {
        console.error('❌ Import failed:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('📡 Database connection closed');
        }
    }
}

// Run the import
importProcessedData();

