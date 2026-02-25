const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing API endpoints...');
    
    // Test enhanced-people endpoint
    const response = await axios.get('http://localhost:3001/api/enhanced-people');
    const people = response.data;
    
    console.log(`\nTotal people fetched: ${people.length}`);
    
    // Count by life status
    const livingCount = people.filter(p => p['Life_Status'] === 'Living').length;
    const deceasedCount = people.filter(p => p['Life_Status'] === 'Deceased').length;
    const unknownCount = people.filter(p => p['Life_Status'] === 'Unknown').length;
    
    console.log(`\nLiving People: ${livingCount}`);
    console.log(`Deceased People: ${deceasedCount}`);
    console.log(`Unknown Status: ${unknownCount}`);
    
    // Show some examples
    console.log('\nExamples of Living People:');
    const livingExamples = people.filter(p => p['Life_Status'] === 'Living').slice(0, 5);
    livingExamples.forEach(person => {
      console.log(`- ${person['Personal _ID']}: ${person['Forenames']} ${person['Surname']} (${person['Birth_Year']} - ${person['Death_Year'] || 'Present'}) - ${person['Age']}`);
    });
    
    // Show some examples of deceased
    console.log('\nExamples of Deceased People:');
    const deceasedExamples = people.filter(p => p['Life_Status'] === 'Deceased').slice(0, 5);
    deceasedExamples.forEach(person => {
      console.log(`- ${person['Personal _ID']}: ${person['Forenames']} ${person['Surname']} (${person['Birth_Year']} - ${person['Death_Year']}) - ${person['Age']}`);
    });
    
  } catch (error) {
    console.error('Error testing API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testAPI();
