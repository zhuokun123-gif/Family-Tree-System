const mysql = require('mysql2/promise');
require('dotenv').config();

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'family tree',
  port: process.env.DB_PORT || 3306
};

async function verifyLivingPeople() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database successfully');

    // Get statistics
    const [stats] = await connection.execute(`
      SELECT 
        \`Life_Status\`,
        COUNT(*) as count
      FROM \`familytree_people\`
      GROUP BY \`Life_Status\`
      ORDER BY count DESC
    `);

    console.log('\n=== LIVING PEOPLE STATISTICS ===');
    stats.forEach(stat => {
      console.log(`${stat.Life_Status}: ${stat.count} people`);
    });

    // Get examples of living people with different criteria
    console.log('\n=== EXAMPLES OF LIVING PEOPLE ===');
    
    // People born after 1900 with no death year
    const [bornAfter1900] = await connection.execute(`
      SELECT \`Personal _ID\`, \`Forenames\`, \`Surname\`, \`Birth_Year\`, \`Death_Year\`, \`Age\`
      FROM \`familytree_people\`
      WHERE \`Life_Status\` = 'Living' 
        AND \`Birth_Year\` > 1900 
        AND (\`Death_Year\` IS NULL OR \`Death_Year\` = '')
      LIMIT 5
    `);

    console.log('\nPeople born after 1900 with no death year:');
    bornAfter1900.forEach(person => {
      console.log(`- ${person['Personal _ID']}: ${person['Forenames']} ${person['Surname']} (${person['Birth_Year']} - Present) - ${person['Age']}`);
    });

    // People with age at death < 135
    const [ageLessThan135] = await connection.execute(`
      SELECT \`Personal _ID\`, \`Forenames\`, \`Surname\`, \`Birth_Year\`, \`Death_Year\`, \`Age\`
      FROM \`familytree_people\`
      WHERE \`Life_Status\` = 'Living' 
        AND \`Birth_Year\` IS NOT NULL 
        AND \`Death_Year\` IS NOT NULL 
        AND \`Death_Year\` != ''
        AND (\`Death_Year\` - \`Birth_Year\`) < 135
      LIMIT 5
    `);

    console.log('\nPeople with age at death less than 135:');
    ageLessThan135.forEach(person => {
      console.log(`- ${person['Personal _ID']}: ${person['Forenames']} ${person['Surname']} (${person['Birth_Year']} - ${person['Death_Year']}) - ${person['Age']}`);
    });

    // Get some deceased examples for comparison
    const [deceasedExamples] = await connection.execute(`
      SELECT \`Personal _ID\`, \`Forenames\`, \`Surname\`, \`Birth_Year\`, \`Death_Year\`, \`Age\`
      FROM \`familytree_people\`
      WHERE \`Life_Status\` = 'Deceased'
      LIMIT 5
    `);

    console.log('\nExamples of Deceased People:');
    deceasedExamples.forEach(person => {
      console.log(`- ${person['Personal _ID']}: ${person['Forenames']} ${person['Surname']} (${person['Birth_Year']} - ${person['Death_Year']}) - ${person['Age']}`);
    });

  } catch (error) {
    console.error('Error verifying living people:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
}

// Run the verification
verifyLivingPeople().catch(console.error);
