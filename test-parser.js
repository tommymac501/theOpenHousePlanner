const testText = `$310,000
14 BALLARD Lane, Palm Coast, FL 32137
3
beds

2
baths
1,343
sqft
Est.
:
 $2,139/mo
Get pre-qualified

Single Family Residence

Built in 1991

10,018.8 Square Feet Lot

$301,000 Zestimate®

$231/sqft

$-- HOA
What's special

Completely renovated and move-in ready, this charming 3 bedroom, 2 bathroom home offers 1,343 sq ft of stylish living in the desirable Indian Trails neighborhood of Palm Coast.

Open house

Sat, Jun 21
12:00 PM - 2:00 PM
Add to calendar`;

// Test address pattern
const addressPattern = /\d+\s+[A-Za-z0-9\s\-'\.]+(?:Street|St\.?|Avenue|Ave\.?|Road|Rd\.?|Drive|Dr\.?|Lane|Ln\.?|Boulevard|Blvd\.?|Way|Circle|Cir\.?|Court|Ct\.?|Place|Pl\.?|Parkway|Pkwy\.?|Trail|Tr\.?)\s*,\s*[A-Za-z\s]+,\s*[A-Z]{2}\s*\d{5}/i;

const addressMatch = testText.match(addressPattern);
console.log('Address match:', addressMatch);

// Test price pattern
const pricePattern = /\$[\d,]+(?!\s*(?:Zestimate|RentBerry|Estimate|AVG|Per Month|\/mo))/gi;
const priceMatches = testText.substring(0, 1000).match(pricePattern);
console.log('Price matches:', priceMatches);

// Test open house pattern
const openHousePattern = /Open house\s*\n?\s*([A-Za-z]+,\s*[A-Za-z]+\s*\d+)\s*\n?\s*(\d{1,2}:\d{2}\s*[AP]M\s*-\s*\d{1,2}:\d{2}\s*[AP]M)/i;
const openHouseMatch = testText.match(openHousePattern);
console.log('Open house match:', openHouseMatch);