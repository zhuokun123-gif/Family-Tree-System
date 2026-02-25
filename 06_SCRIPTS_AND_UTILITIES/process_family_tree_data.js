const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Configuration
const PEOPLE_CSV = 'FamilyTree_People.csv';
const FAMILIES_CSV = 'FamilyTree_Families.csv';
const OUTPUT_CSV = 'processed_familytree.csv';
const OUTPUT_JSON = 'processed_familytree.json';

// Data storage
let peopleData = [];
let familiesData = [];
let processedData = [];

// Step 1: Read People data
console.log('📖 Reading people data...');
fs.createReadStream(PEOPLE_CSV)
  .pipe(csv())
  .on('data', (row) => {
    peopleData.push(row);
  })
  .on('end', () => {
    console.log(`✅ Loaded ${peopleData.length} people records`);
    
    // Step 2: Read Families data
    console.log('📖 Reading families data...');
    fs.createReadStream(FAMILIES_CSV)
      .pipe(csv())
      .on('data', (row) => {
        familiesData.push(row);
      })
      .on('end', () => {
        console.log(`✅ Loaded ${familiesData.length} family records`);
        
        // Step 3: Process the data
        console.log('🔄 Processing data according to rules...');
        processData();
        
        // Step 4: Write output files
        writeOutputFiles();
      });
  });

function processData() {
  // Create sets for quick lookup
  const fatherIds = new Set();
  const motherIds = new Set();
  
  // Collect all Father_ID and Mother_ID from families
  familiesData.forEach(family => {
    if (family['Father ID'] && family['Father ID'].trim()) {
      fatherIds.add(family['Father ID'].trim());
    }
    if (family['Mother_ID'] && family['Mother_ID'].trim()) {
      motherIds.add(family['Mother_ID'].trim());
    }
  });
  
  console.log(`📊 Found ${fatherIds.size} unique fathers and ${motherIds.size} unique mothers`);
  
  // Process each person
  peopleData.forEach(person => {
    const personId = person['Personal _ID'];
    const forenames = person['Forenames'] || '';
    const surname = person['Surname'] || '';
    const name = `${forenames} ${surname}`.trim();
    
    // Rule 1: Determine Gender
    let gender = 'Unknown';
    if (fatherIds.has(personId)) {
      gender = 'Male';
    } else if (motherIds.has(personId)) {
      gender = 'Female';
    }
    
    // Rule 2: Calculate Age
    let age = 'Unknown';
    const birthYear = person['Birth_Year'] ? parseInt(person['Birth_Year']) : null;
    const deathYear = person['Death_Year'] ? parseInt(person['Death_Year']) : null;
    
    if (birthYear && deathYear && !isNaN(birthYear) && !isNaN(deathYear)) {
      age = deathYear - birthYear;
    }
    
    // Rule 3: Determine Marital Status
    let maritalStatus = 'Single';
    if (person['Spouse_ID'] && person['Spouse_ID'].trim()) {
      maritalStatus = 'Married';
    }
    
    // Create processed record
    const processedRecord = {
      Person_ID: personId,
      Name: name,
      Gender: gender,
      Age: age,
      Marital_Status: maritalStatus
    };
    
    processedData.push(processedRecord);
  });
  
  console.log(`✅ Processed ${processedData.length} people records`);
  
  // Display statistics
  const genderStats = {
    Male: processedData.filter(p => p.Gender === 'Male').length,
    Female: processedData.filter(p => p.Gender === 'Female').length,
    Unknown: processedData.filter(p => p.Gender === 'Unknown').length
  };
  
  const maritalStats = {
    Married: processedData.filter(p => p.Marital_Status === 'Married').length,
    Single: processedData.filter(p => p.Marital_Status === 'Single').length
  };
  
  const ageStats = {
    Known: processedData.filter(p => p.Age !== 'Unknown').length,
    Unknown: processedData.filter(p => p.Age === 'Unknown').length
  };
  
  console.log('\n📊 Processing Statistics:');
  console.log('Gender Distribution:', genderStats);
  console.log('Marital Status Distribution:', maritalStats);
  console.log('Age Information:', ageStats);
}

function writeOutputFiles() {
  // Write CSV file
  const csvWriter = createCsvWriter({
    path: OUTPUT_CSV,
    header: [
      {id: 'Person_ID', title: 'Person_ID'},
      {id: 'Name', title: 'Name'},
      {id: 'Gender', title: 'Gender'},
      {id: 'Age', title: 'Age'},
      {id: 'Marital_Status', title: 'Marital_Status'}
    ]
  });
  
  csvWriter.writeRecords(processedData)
    .then(() => {
      console.log(`✅ CSV file written: ${OUTPUT_CSV}`);
      
      // Write JSON file
      const jsonData = {
        metadata: {
          total_records: processedData.length,
          processing_date: new Date().toISOString(),
          source_files: [PEOPLE_CSV, FAMILIES_CSV],
          rules_applied: [
            'Gender: Male if Person_ID appears as Father_ID, Female if as Mother_ID, otherwise Unknown',
            'Age: Death_Year - Birth_Year, Unknown if either missing',
            'Marital_Status: Married if Spouse_ID exists, Single otherwise'
          ]
        },
        statistics: {
          gender_distribution: {
            Male: processedData.filter(p => p.Gender === 'Male').length,
            Female: processedData.filter(p => p.Gender === 'Female').length,
            Unknown: processedData.filter(p => p.Gender === 'Unknown').length
          },
          marital_status_distribution: {
            Married: processedData.filter(p => p.Marital_Status === 'Married').length,
            Single: processedData.filter(p => p.Marital_Status === 'Single').length
          },
          age_information: {
            Known: processedData.filter(p => p.Age !== 'Unknown').length,
            Unknown: processedData.filter(p => p.Age === 'Unknown').length
          }
        },
        data: processedData
      };
      
      fs.writeFileSync(OUTPUT_JSON, JSON.stringify(jsonData, null, 2));
      console.log(`✅ JSON file written: ${OUTPUT_JSON}`);
      
      // Display sample records
      console.log('\n📋 Sample Processed Records:');
      processedData.slice(0, 5).forEach((record, index) => {
        console.log(`${index + 1}. ${record.Name} (${record.Person_ID}) - ${record.Gender}, Age: ${record.Age}, ${record.Marital_Status}`);
      });
      
      console.log('\n🎉 Processing completed successfully!');
      console.log(`📁 Output files created:`);
      console.log(`   - ${OUTPUT_CSV} (CSV format)`);
      console.log(`   - ${OUTPUT_JSON} (JSON format with metadata)`);
    })
    .catch(error => {
      console.error('❌ Error writing CSV file:', error);
    });
}

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});