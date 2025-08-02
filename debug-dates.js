// Debug the date filtering logic
import fetch from 'node-fetch';

async function debugDateFiltering() {
  console.log('🔍 Debugging "This Week" and "Next Week" filters...\n');
  
  try {
    const response = await fetch('http://localhost:5000/api/open-houses');
    const houses = await response.json();
    
    const now = new Date();
    console.log('Current date/time:', now.toISOString());
    console.log('Current date (local):', now.toLocaleDateString());
    
    // Show current week calculation
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfWeek = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    console.log('\n📅 This Week Range:');
    console.log('  Start (today):', startOfToday.toLocaleDateString());
    console.log('  End (7 days):', endOfWeek.toLocaleDateString());
    
    // Show next week calculation
    const startOfNextWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
    const endOfNextWeek = new Date(startOfNextWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    console.log('\n📅 Next Week Range:');
    console.log('  Start (day 8):', startOfNextWeek.toLocaleDateString());
    console.log('  End (day 14):', endOfNextWeek.toLocaleDateString());
    
    // Check all house dates
    console.log('\n🏠 All Property Dates:');
    houses.forEach((house, index) => {
      if (index < 10) { // Show first 10
        const houseDate = new Date(house.date);
        const isThisWeek = houseDate >= startOfToday && houseDate < endOfWeek;
        const isNextWeek = houseDate >= startOfNextWeek && houseDate < endOfNextWeek;
        
        console.log(`  ${house.address.substring(0, 30)}...`);
        console.log(`    Date: ${house.date} -> ${houseDate.toLocaleDateString()}`);
        console.log(`    This Week: ${isThisWeek}, Next Week: ${isNextWeek}`);
      }
    });
    
    // Count matches
    const thisWeekCount = houses.filter(house => {
      const houseDate = new Date(house.date);
      return houseDate >= startOfToday && houseDate < endOfWeek;
    }).length;
    
    const nextWeekCount = houses.filter(house => {
      const houseDate = new Date(house.date);
      return houseDate >= startOfNextWeek && houseDate < endOfNextWeek;
    }).length;
    
    console.log('\n📊 Filter Results:');
    console.log(`  This Week matches: ${thisWeekCount}`);
    console.log(`  Next Week matches: ${nextWeekCount}`);
    console.log(`  Total properties: ${houses.length}`);
    
    if (thisWeekCount === 0 && nextWeekCount === 0) {
      console.log('\n⚠️  No properties found in this week or next week ranges');
      console.log('   This could be why the filters appear not to work');
      
      // Show upcoming dates
      const futureHouses = houses.filter(house => new Date(house.date) > now);
      console.log(`\n🔮 Future properties: ${futureHouses.length}`);
      futureHouses.slice(0, 3).forEach(house => {
        console.log(`  ${house.address.substring(0, 30)}: ${house.date}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error debugging dates:', error.message);
  }
}

debugDateFiltering().catch(console.error);