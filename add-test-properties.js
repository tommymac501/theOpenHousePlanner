// Add test properties with current dates to demonstrate the filters
import fetch from 'node-fetch';

async function addTestProperties() {
  console.log('🏠 Adding test properties for this week and next week...\n');
  
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(today.getTime() + 9 * 24 * 60 * 60 * 1000);
  
  const testProperties = [
    {
      address: "123 Test Street, This Week Demo",
      price: "$450,000",
      date: tomorrow.toISOString().split('T')[0], // Tomorrow
      time: "2:00 PM",
      notes: "Test property for 'This Week' filter demo",
      visited: false,
      favorited: false,
      disliked: false
    },
    {
      address: "456 Next Week Avenue, Filter Test",
      price: "$525,000",
      date: nextWeek.toISOString().split('T')[0], // Next week
      time: "1:00 PM", 
      notes: "Test property for 'Next Week' filter demo",
      visited: false,
      favorited: true,
      disliked: false
    }
  ];
  
  try {
    for (const property of testProperties) {
      console.log(`Adding: ${property.address}`);
      console.log(`  Date: ${property.date}`);
      
      const response = await fetch('http://localhost:5000/api/open-houses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(property)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`  ✅ Added with ID: ${result.id}`);
      } else {
        const error = await response.text();
        console.log(`  ❌ Failed: ${error}`);
      }
    }
    
    console.log('\n📊 Updated stats should now show:');
    console.log('  This Week: 1 property');
    console.log('  Next Week: 1 property');
    console.log('  Liked: +1 (the next week property)');
    
    console.log('\n🎯 Now try clicking the "This Week" and "Next Week" filter boxes!');
    
  } catch (error) {
    console.error('❌ Error adding test properties:', error.message);
  }
}

addTestProperties().catch(console.error);