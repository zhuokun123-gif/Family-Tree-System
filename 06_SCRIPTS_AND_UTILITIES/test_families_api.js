const axios = require('axios');

async function testFamiliesAPI() {
  try {
    console.log('Testing Families API...');
    
    // Test enhanced-families endpoint
    const response = await axios.get('http://localhost:3001/api/enhanced-families');
    const families = response.data;
    
    console.log(`\nTotal families fetched: ${families.length}`);
    
    // Show first few families with their data
    console.log('\n=== SAMPLE FAMILIES DATA ===');
    families.slice(0, 5).forEach((family, index) => {
      console.log(`\nFamily ${index + 1}:`);
      console.log(`- Family_ID: ${family['Family_ID']}`);
      console.log(`- Father ID: ${family['Father ID']}`);
      console.log(`- Father_Name: ${family['Father_Name']}`);
      console.log(`- Mother_ID: ${family['Mother_ID']}`);
      console.log(`- Mother_Name: ${family['Mother_Name']}`);
      console.log(`- Marriage_Year_Display: ${family['Marriage_Year_Display']}`);
      console.log(`- Children_Count: ${family['Children_Count']}`);
      console.log(`- Children_Names: ${family['Children_Names']?.join(', ') || 'None'}`);
    });
    
    // Check if Father_Name is properly populated
    const familiesWithFatherName = families.filter(f => f['Father_Name'] && f['Father_Name'] !== 'Unknown');
    console.log(`\nFamilies with Father_Name: ${familiesWithFatherName.length}`);
    
    // Check if Marriage_Year_Display is properly populated
    const familiesWithMarriageYear = families.filter(f => f['Marriage_Year_Display'] && f['Marriage_Year_Display'] !== 'Unknown');
    console.log(`Families with Marriage_Year_Display: ${familiesWithMarriageYear.length}`);
    
    // Show examples of families with Father_Name
    console.log('\n=== EXAMPLES WITH FATHER_NAME ===');
    familiesWithFatherName.slice(0, 3).forEach(family => {
      console.log(`- ${family['Family_ID']}: Father ${family['Father_Name']} (ID: ${family['Father ID']})`);
    });
    
    // Show examples of families with Marriage_Year_Display
    console.log('\n=== EXAMPLES WITH MARRIAGE_YEAR_DISPLAY ===');
    familiesWithMarriageYear.slice(0, 3).forEach(family => {
      console.log(`- ${family['Family_ID']}: Married in ${family['Marriage_Year_Display']}`);
    });
    
  } catch (error) {
    console.error('Error testing families API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testFamiliesAPI();
