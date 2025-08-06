-- SQL Update Script for DBeaver: Insert Missing Notes for Palm Coast Properties
-- Run this script in DBeaver to add descriptive notes to all properties

-- Diamond Drive Properties (Luxury waterfront community)
UPDATE open_houses SET notes = 'Prime waterfront location in Diamond Drive. Excellent for luxury living with canal access. Check for boat dock availability and water views from main living areas.' WHERE address = '45 Diamond Drive, Palm Coast, FL 32164';

-- Westridge Lane Properties (Established residential area)
UPDATE open_houses SET notes = 'Westridge Lane is a well-established residential area in Palm Coast. Great for families, close to schools and shopping. Check neighborhood amenities and HOA requirements.' WHERE address = '2 Westridge Ln, Palm Coast FL 32164';

-- Wasserman Drive Properties (Mid-range family neighborhood)
UPDATE open_houses SET notes = 'Wasserman Drive offers great value in a family-friendly neighborhood. Look for updated kitchens, spacious yards, and proximity to Flagler schools.' WHERE address IN ('36 Wasserman Dr, Palm Coast, FL 32164', '31 Wasserman Dr, Palm Coast, FL 32164', '32 Wasserman Dr, Palm Coast, FL 32164');

-- Seoane Court Properties (Quiet cul-de-sac living)
UPDATE open_houses SET notes = 'Seoane Court is a peaceful cul-de-sac perfect for families. Low traffic area with mature landscaping. Check for privacy fencing and outdoor entertaining spaces.' WHERE address IN ('6 Seoane Ct, Palm Coast, FL 32164', '3 Seoane Ct, Palm Coast, FL 32164');

-- Eric Drive Properties (Popular residential street with multiple options)
UPDATE open_houses SET notes = 'Eric Drive property - popular residential street in Palm Coast. Great for comparison shopping with multiple properties available. Check for unique features and recent updates.' WHERE address IN (
    '71 Eric Dr, Palm Coast, FL 32164',
    '80 Eric Dr, Palm Coast, FL 32164',
    '90 Eric Dr, Palm Coast, FL 32164',
    '111 Eric Dr, Palm Coast, FL 32164',
    '102 Eric Dr, Palm Coast, FL 32164',
    '113 Eric Dr, Palm Coast, FL 32164',
    '122 Eric Dr, Palm Coast, FL 32164',
    '132 Eric Dr, Palm Coast, FL 32164',
    '133 Eric Dr, Palm Coast, FL 32164',
    '142 Eric Dr, Palm Coast, FL 32164',
    '152 Eric Dr, Palm Coast, FL 32164',
    '162 Eric Dr, Palm Coast, FL 32164',
    '172 Eric Dr, Palm Coast, FL 32164',
    '182 Eric Dr, Palm Coast, FL 32164',
    '192 Eric Dr, Palm Coast, FL 32164',
    '202 Eric Dr, Palm Coast, FL 32164',
    '212 Eric Dr, Palm Coast, FL 32164',
    '222 Eric Dr, Palm Coast, FL 32164'
);

-- Ballard Lane Property (Different ZIP code - Palm Coast 32137)
UPDATE open_houses SET notes = 'Ballard Lane in the 32137 area - different section of Palm Coast with unique characteristics. Compare pricing and amenities to 32164 properties. Check for community features and HOA differences.' WHERE address = '14 BALLARD Lane, Palm Coast, FL 32137';

-- Verify the updates
SELECT id, address, notes FROM open_houses WHERE notes IS NOT NULL AND notes != '' ORDER BY address;