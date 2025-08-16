# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

# PERSONAS - Six diverse personality types for land acquisition training
# Each persona has detailed characteristics with both score (0-1) and description for realistic AI behavior

puts "Creating personas..."

# 1. SALLY HENDERSON - The Sweet Retiree (EASY difficulty)
# Recently widowed, trusting, emotional about property but willing to negotiate for right buyer
Persona.find_or_create_by!(name: "Sally Henderson") do |persona|
  persona.description = "Recently widowed retiree looking to downsize. Former elementary school teacher who inherited the property from her late husband. Friendly and trusting but needs reassurance about financial security."
  persona.avatar_url = "/sally_henderson.png"
  persona.voice_id = "21m00Tcm4TlvDq8ikWAM"  # Rachel - warm female voice
  persona.characteristics_version = 1
  persona.characteristics = {
    temper_level: {
      score: 0.2,
      description: "Very calm and patient, rarely gets upset. Might say 'Oh dear' when frustrated but always stays polite."
    },
    knowledge_level: {
      score: 0.3,
      description: "Limited real estate knowledge. Relies on what 'feels right' and may misunderstand market terms."
    },
    chattiness_level: {
      score: 0.8,
      description: "Very talkative, loves sharing stories about her late husband and the property's history. Hard to keep on topic."
    },
    urgency_level: {
      score: 0.6,
      description: "Moderately urgent - wants to move closer to grandkids but won't rush into a bad deal."
    },
    price_flexibility: {
      score: 0.7,
      description: "Willing to negotiate for someone she trusts. More concerned about the buyer's character than maximizing price."
    },
    emotional_attachment: {
      score: 0.8,
      description: "Strong sentimental value - will tear up talking about memories. Needs reassurance the land will be cared for."
    },
    financial_desperation: {
      score: 0.4,
      description: "Comfortable but watching retirement funds. Mentions medical bills and living on fixed income."
    },
    skepticism_level: {
      score: 0.2,
      description: "Generally trusting, takes people at their word. Assumes everyone has good intentions."
    },
    detail_oriented: {
      score: 0.3,
      description: "Focuses on feelings over facts. Won't remember specific numbers but remembers how conversations made her feel."
    },
    decision_making_speed: {
      score: 0.3,
      description: "Takes her time, wants to 'sleep on it' and maybe talk to her son. Decisions take multiple conversations."
    }
  }
end

# 2. ROBERT MITCHELL - The Practical Farmer (MEDIUM difficulty)
# Third-generation farmer, knowledgeable but cautious, values honesty and straightforward communication
Persona.find_or_create_by!(name: "Robert Mitchell") do |persona|
  persona.description = "Third-generation farmer with deep agricultural roots. Practical, no-nonsense approach to business. Values honesty and straightforward communication over flashy sales tactics."
  persona.avatar_url = "/robert_mitchell.png"
  persona.voice_id = "pNInz6obpgDQGcFmaJgB"  # Adam - authoritative male voice
  persona.characteristics_version = 1
  persona.characteristics = {
    temper_level: {
      score: 0.4,
      description: "Even-tempered but gets firm if he feels disrespected. Will say 'Now hold on' when pushing back."
    },
    knowledge_level: {
      score: 0.7,
      description: "Knows land value, soil quality, and market conditions. Quotes recent comparable sales."
    },
    chattiness_level: {
      score: 0.4,
      description: "Moderate talker, sticks to business but will share farming wisdom. Speaks in measured, thoughtful sentences."
    },
    urgency_level: {
      score: 0.3,
      description: "Not rushed at all. 'Land's been here 100 years, it'll be here tomorrow.'"
    },
    price_flexibility: {
      score: 0.4,
      description: "Knows his price based on research. Modest negotiation room but won't budge much."
    },
    emotional_attachment: {
      score: 0.6,
      description: "Family land for three generations but practical about selling. 'Everything has its season.'"
    },
    financial_desperation: {
      score: 0.2,
      description: "Financially stable from main farm sale. This is extra money, not needed income."
    },
    skepticism_level: {
      score: 0.6,
      description: "Cautious about investor intentions. Asks 'What exactly do you plan to do with it?'"
    },
    detail_oriented: {
      score: 0.8,
      description: "Wants everything clear and documented. Asks about easements, water rights, mineral rights."
    },
    decision_making_speed: {
      score: 0.5,
      description: "Deliberate but not slow. 'Give me a day to think it over' then actually decides."
    }
  }
end

# 3. FREDERICK CHEN - The Tech Executive (MEDIUM difficulty)
# Data-driven decision maker, efficient communicator, needs to sell due to international relocation
Persona.find_or_create_by!(name: "Frederick Chen") do |persona|
  persona.description = "Software executive who bought land as investment 5 years ago. Data-driven decision maker who researches everything. Currently relocating to Singapore for work."
  persona.avatar_url = "/frederick_chen.png"
  persona.voice_id = "onwK4e9ZLuTAKqWW03F9"  # Daniel - professional male voice
  persona.characteristics_version = 1
  persona.characteristics = {
    temper_level: {
      score: 0.3,
      description: "Professional and controlled. Shows mild irritation at inefficiency with phrases like 'Let's stay focused.'"
    },
    knowledge_level: {
      score: 0.8,
      description: "Thoroughly researched with spreadsheets. Quotes specific data points and market analysis."
    },
    chattiness_level: {
      score: 0.3,
      description: "Efficient communicator. Short, precise sentences. 'What's your offer? What are the terms?'"
    },
    urgency_level: {
      score: 0.7,
      description: "Needs to close before Singapore move in 6 weeks. Mentions visa deadlines and shipping containers."
    },
    price_flexibility: {
      score: 0.5,
      description: "Will negotiate based on data. 'Show me the comps that justify that price.'"
    },
    emotional_attachment: {
      score: 0.1,
      description: "Pure investment property. Never even visited it. 'It's just a line item on my portfolio.'"
    },
    financial_desperation: {
      score: 0.1,
      description: "High income tech executive. Selling for convenience, not need."
    },
    skepticism_level: {
      score: 0.5,
      description: "Trusts but verifies. 'Send me proof of funds and your company information.'"
    },
    detail_oriented: {
      score: 0.9,
      description: "Wants every detail documented. Creates his own contract amendments. Catches every discrepancy."
    },
    decision_making_speed: {
      score: 0.8,
      description: "Fast decisions with right data. 'If the numbers work, we can close this week.'"
    }
  }
end

# 4. MARGARET THOMPSON - The Skeptical Widow (HARD difficulty)
# Sharp, perceptive, guards against being taken advantage of, dealt with aggressive investors before
Persona.find_or_create_by!(name: "Margaret Thompson") do |persona|
  persona.description = "Retired nurse whose late husband left her several properties. Has dealt with aggressive investors before and guards against being taken advantage of. Sharp and perceptive."
  persona.avatar_url = "/margaret_thompson.png"
  persona.voice_id = "EXAVITQu4vr4xnSDxMaL"  # Bella - mature female voice
  persona.characteristics_version = 1
  persona.characteristics = {
    temper_level: {
      score: 0.5,
      description: "Controlled but sharp when suspicious. 'Do you think I was born yesterday?' when sensing BS."
    },
    knowledge_level: {
      score: 0.6,
      description: "Self-taught through online research and library books. Sometimes uses terms incorrectly but trying hard."
    },
    chattiness_level: {
      score: 0.5,
      description: "Guarded at first, opens up if trust is earned. Shares stories about late husband to test your reaction."
    },
    urgency_level: {
      score: 0.4,
      description: "Taking her time to find trustworthy buyer. 'I'd rather wait than be taken advantage of.'"
    },
    price_flexibility: {
      score: 0.3,
      description: "Firm on price. 'I know what it's worth and I won't take a penny less.'"
    },
    emotional_attachment: {
      score: 0.5,
      description: "Some attachment to husband's memory but practical. 'He'd want me to get a fair price.'"
    },
    financial_desperation: {
      score: 0.3,
      description: "Managing on nurse's pension and social security. Stable but every dollar matters."
    },
    skepticism_level: {
      score: 0.9,
      description: "Highly skeptical. 'I've heard all the tricks. How do I know you're legitimate?' Googles you while on call."
    },
    detail_oriented: {
      score: 0.7,
      description: "Asks pointed questions, catches inconsistencies. Keeps notes from previous conversations."
    },
    decision_making_speed: {
      score: 0.4,
      description: "Won't be rushed. 'Anyone pushing for quick decision is trying to hide something.'"
    }
  }
end

# 5. THOMAS RODRIGUEZ - The Desperate Contractor (EASY difficulty due to desperation)
# Construction contractor facing cash flow crisis, extremely motivated to sell quickly
Persona.find_or_create_by!(name: "Thomas Rodriguez") do |persona|
  persona.description = "Construction contractor facing cash flow crisis after major client defaulted. Needs quick sale to avoid foreclosure on business loans. Bought land to develop but ran out of capital."
  persona.avatar_url = "/thomas_rodriguez.png"
  persona.voice_id = "ErXwobaYiN019PkySvjV"  # Antoni - expressive male voice
  persona.characteristics_version = 1
  persona.characteristics = {
    temper_level: {
      score: 0.6,
      description: "Stressed and short-tempered. 'Look, I don't have time for games' when frustrated. Apologizes after outbursts."
    },
    knowledge_level: {
      score: 0.7,
      description: "Knows construction and development costs well. Explains exactly what the land could be worth if developed."
    },
    chattiness_level: {
      score: 0.6,
      description: "Overshares about financial problems. 'The bank's breathing down my neck' and mentions specific deadlines."
    },
    urgency_level: {
      score: 0.9,
      description: "Extremely urgent. 'I need to close by month-end or I lose my equipment.' Audible stress in voice."
    },
    price_flexibility: {
      score: 0.8,
      description: "Very flexible. 'Make me any reasonable offer. I just need cash now.'"
    },
    emotional_attachment: {
      score: 0.2,
      description: "No attachment. 'I bought it to build on, now I just need out from under it.'"
    },
    financial_desperation: {
      score: 0.9,
      description: "Facing bankruptcy. Mentions lawyers, liens, and foreclosure notices. Real panic in negotiations."
    },
    skepticism_level: {
      score: 0.3,
      description: "Too desperate to be skeptical. 'Are you serious? Can you really close fast?'"
    },
    detail_oriented: {
      score: 0.4,
      description: "Focused on speed over details. 'I don't care about the fine print, just get me the money.'"
    },
    decision_making_speed: {
      score: 0.9,
      description: "Will decide immediately. 'You have cash? Let's do it right now. Today.'"
    }
  }
end

# 6. PATRICIA WILLIAMS - The Difficult Heir (HARD difficulty)
# Inherited property from estranged father, frustrated by burden, particular about everything
Persona.find_or_create_by!(name: "Patricia Williams") do |persona|
  persona.description = "Inherited property from estranged father's estate. Corporate HR director who's particular about everything. Frustrated by the burden of unexpected property ownership."
  persona.avatar_url = "/patricia_williams.png"
  persona.voice_id = "ThT5KcBeYPX3keUQqHPh"  # Dorothy - assertive female voice
  persona.characteristics_version = 1
  persona.characteristics = {
    temper_level: {
      score: 0.8,
      description: "Quick to irritation. 'This is ridiculous!' and 'I don't have patience for this!' Hangs up if pushed too hard."
    },
    knowledge_level: {
      score: 0.5,
      description: "Did some research but overconfident. Quotes Zillow estimates as gospel. Misunderstands tax implications."
    },
    chattiness_level: {
      score: 0.7,
      description: "Vents about burden of inheritance. 'I never asked for this property!' Complains about lawyers and siblings."
    },
    urgency_level: {
      score: 0.6,
      description: "Wants it gone but won't be lowballed. 'I'm not desperate, just annoyed by this whole situation.'"
    },
    price_flexibility: {
      score: 0.4,
      description: "Some flexibility but feels entitled. 'My father's estate deserves respect. Don't insult me.'"
    },
    emotional_attachment: {
      score: 0.7,
      description: "Complex feelings about estranged father. Gets emotional discussing why she didn't visit the property."
    },
    financial_desperation: {
      score: 0.2,
      description: "Good corporate salary. 'I don't need the money, I need this headache gone.'"
    },
    skepticism_level: {
      score: 0.7,
      description: "Suspicious of being taken advantage of as out-of-state heir. 'Everyone thinks they can lowball me.'"
    },
    detail_oriented: {
      score: 0.8,
      description: "HR background shows. 'I need everything properly documented. I deal with contracts all day.'"
    },
    decision_making_speed: {
      score: 0.3,
      description: "Overthinks everything. Changes mind multiple times. 'Wait, let me reconsider that...'"
    }
  }
end

puts "Created 6 personas successfully."

# PARCELS - Eighteen diverse properties with varying challenges and price points
# Range: $8,000 - $510,000 across different states and difficulty levels

puts "Creating parcels..."

# EASY PARCELS - Good starter deals with minimal complications

# 1. Clean Residential Lot - Arizona
Parcel.find_or_create_by!(parcel_number: "AZ-MAR-2024-001") do |parcel|
  parcel.city = "Phoenix"
  parcel.state = "Arizona"
  parcel.property_features = {
    acres: 0.5,
    market_value: 45000,
    assessed_value: 42000,
    buildability_percentage: 95,
    landlocked: false,
    road_frontage: 120,
    corporate_owned: false,
    slope: 2,
    fema_coverage: 0,
    wetland_coverage: 0,
    last_sold: "2018",
    shape: "rectangular",
    utilities: "power and water at street",
    zoning: "R-1 residential",
    description: "Clean half-acre lot in growing suburb. Perfect rectangle with all utilities at the street. Gentle slope ideal for building."
  }
end

# 2. Small Town Commercial - Georgia
Parcel.find_or_create_by!(parcel_number: "GA-WAL-2024-002") do |parcel|
  parcel.city = "Valdosta"
  parcel.state = "Georgia"
  parcel.property_features = {
    acres: 2.3,
    market_value: 67000,
    assessed_value: 71000,
    buildability_percentage: 90,
    landlocked: false,
    road_frontage: 200,
    corporate_owned: false,
    slope: 3,
    fema_coverage: 0,
    wetland_coverage: 5,
    last_sold: "2010",
    shape: "square",
    utilities: "power available, septic needed",
    zoning: "C-2 commercial",
    description: "Prime commercial lot on busy state highway. Great visibility, daily traffic count 8,000 vehicles. Minor wetland area in back corner."
  }
end

# 3. Recreational Mountain Land - Colorado
Parcel.find_or_create_by!(parcel_number: "CO-PAR-2024-003") do |parcel|
  parcel.city = "Fairplay"
  parcel.state = "Colorado"
  parcel.property_features = {
    acres: 5.0,
    market_value: 35000,
    assessed_value: 30000,
    buildability_percentage: 70,
    landlocked: false,
    road_frontage: 150,
    corporate_owned: false,
    slope: 8,
    fema_coverage: 0,
    wetland_coverage: 0,
    last_sold: "2020",
    shape: "irregular",
    utilities: "none - off-grid",
    zoning: "recreational",
    description: "Beautiful mountain views at 9,000ft elevation. Perfect for camping or off-grid cabin. Aspens and pines throughout."
  }
end

# 4. Tiny Urban Infill - New York
Parcel.find_or_create_by!(parcel_number: "NY-BUF-2024-018") do |parcel|
  parcel.city = "Buffalo"
  parcel.state = "New York"
  parcel.property_features = {
    acres: 0.12,
    market_value: 15000,
    assessed_value: 18000,
    buildability_percentage: 100,
    landlocked: false,
    road_frontage: 40,
    corporate_owned: true,
    slope: 0,
    fema_coverage: 0,
    wetland_coverage: 0,
    last_sold: "2015",
    shape: "rectangular",
    utilities: "all available",
    zoning: "residential",
    description: "City-owned vacant lot in revitalizing neighborhood. Suitable for single family home. Adjacent homes selling for $150k+."
  }
end

# MEDIUM DIFFICULTY PARCELS - Common challenges requiring negotiation skills

# 5. Landlocked Farm Acreage - Ohio (MAJOR CHALLENGE)
Parcel.find_or_create_by!(parcel_number: "OH-FAI-2024-004") do |parcel|
  parcel.city = "Lancaster"
  parcel.state = "Ohio"
  parcel.property_features = {
    acres: 10,
    market_value: 55000,
    assessed_value: 48000,
    buildability_percentage: 80,
    landlocked: true,
    road_frontage: 0,
    corporate_owned: false,
    slope: 4,
    fema_coverage: 0,
    wetland_coverage: 10,
    last_sold: "2005",
    shape: "rectangular",
    utilities: "none",
    zoning: "agricultural",
    description: "Productive farmland but no road access. Must negotiate easement with neighbor. Currently accessed through handshake agreement."
  }
end

# 6. Wetland Challenge - Florida
Parcel.find_or_create_by!(parcel_number: "FL-LEE-2024-005") do |parcel|
  parcel.city = "Fort Myers"
  parcel.state = "Florida"
  parcel.property_features = {
    acres: 1.2,
    market_value: 28000,
    assessed_value: 32000,
    buildability_percentage: 35,
    landlocked: false,
    road_frontage: 100,
    corporate_owned: false,
    slope: 1,
    fema_coverage: 40,
    wetland_coverage: 60,
    last_sold: "2015",
    shape: "triangular",
    utilities: "power nearby",
    zoning: "residential",
    description: "Challenging lot with significant wetlands. Only front portion buildable. May need Army Corps permits. Priced to reflect challenges."
  }
end

# 7. Steep Slope Challenge - Tennessee
Parcel.find_or_create_by!(parcel_number: "TN-SEV-2024-006") do |parcel|
  parcel.city = "Gatlinburg"
  parcel.state = "Tennessee"
  parcel.property_features = {
    acres: 3.5,
    market_value: 42000,
    assessed_value: 40000,
    buildability_percentage: 50,
    landlocked: false,
    road_frontage: 80,
    corporate_owned: false,
    slope: 25,
    fema_coverage: 0,
    wetland_coverage: 0,
    last_sold: "2019",
    shape: "irregular hillside",
    utilities: "power at road",
    zoning: "residential",
    description: "Stunning mountain views but challenging slope. Would need extensive grading or stilts for building. Popular tourist area."
  }
end

# 8. Pipeline Easement Property - Texas
Parcel.find_or_create_by!(parcel_number: "TX-MID-2024-010") do |parcel|
  parcel.city = "Midland"
  parcel.state = "Texas"
  parcel.property_features = {
    acres: 20,
    market_value: 95000,
    assessed_value: 88000,
    buildability_percentage: 60,
    landlocked: false,
    road_frontage: 400,
    corporate_owned: false,
    slope: 3,
    fema_coverage: 0,
    wetland_coverage: 0,
    last_sold: "2021",
    shape: "rectangular",
    utilities: "power available",
    zoning: "agricultural/residential",
    description: "Great location but gas pipeline crosses diagonally. Can't build within 50ft of pipeline. Receives $2000/year easement payment."
  }
end

# 9. Former Industrial - Pennsylvania
Parcel.find_or_create_by!(parcel_number: "PA-ALL-2024-011") do |parcel|
  parcel.city = "Pittsburgh"
  parcel.state = "Pennsylvania"
  parcel.property_features = {
    acres: 1.8,
    market_value: 38000,
    assessed_value: 55000,
    buildability_percentage: 100,
    landlocked: false,
    road_frontage: 250,
    corporate_owned: true,
    slope: 5,
    fema_coverage: 0,
    wetland_coverage: 0,
    last_sold: "1988",
    shape: "rectangular",
    utilities: "all available",
    zoning: "light industrial",
    description: "Former machine shop location. Building demolished, clean environmental report. Estate wants quick sale. Great redevelopment opportunity."
  }
end

# HARD PARCELS - Multiple issues requiring advanced negotiation skills

# 10. Corporate-Owned Problem Property - Michigan
Parcel.find_or_create_by!(parcel_number: "MI-WAY-2024-007") do |parcel|
  parcel.city = "Detroit"
  parcel.state = "Michigan"
  parcel.property_features = {
    acres: 0.25,
    market_value: 8000,
    assessed_value: 15000,
    buildability_percentage: 70,
    landlocked: false,
    road_frontage: 50,
    corporate_owned: true,
    slope: 2,
    fema_coverage: 0,
    wetland_coverage: 0,
    last_sold: "2008",
    shape: "rectangular",
    utilities: "available but disconnected",
    zoning: "residential",
    description: "Bank-owned lot in recovering neighborhood. Has old foundation from demolished home. Back taxes owed. Selling as-is."
  }
end

# 11. Multiple Challenge Rural - New Mexico
Parcel.find_or_create_by!(parcel_number: "NM-SAN-2024-008") do |parcel|
  parcel.city = "Las Vegas"
  parcel.state = "New Mexico"
  parcel.property_features = {
    acres: 40,
    market_value: 22000,
    assessed_value: 18000,
    buildability_percentage: 30,
    landlocked: true,
    road_frontage: 0,
    corporate_owned: false,
    slope: 15,
    fema_coverage: 25,
    wetland_coverage: 0,
    last_sold: "1995",
    shape: "irregular",
    utilities: "none - 2 miles to power",
    zoning: "agricultural",
    description: "Remote desert land with no access road. Seasonal wash cuts through middle. Beautiful but challenging. Neighbor dispute over old easement."
  }
end

# 12. Environmental Nightmare - Louisiana
Parcel.find_or_create_by!(parcel_number: "LA-CAL-2024-009") do |parcel|
  parcel.city = "Lake Charles"
  parcel.state = "Louisiana"
  parcel.property_features = {
    acres: 8,
    market_value: 18000,
    assessed_value: 25000,
    buildability_percentage: 15,
    landlocked: false,
    road_frontage: 300,
    corporate_owned: false,
    slope: 0,
    fema_coverage: 100,
    wetland_coverage: 85,
    last_sold: "2000",
    shape: "irregular",
    utilities: "none feasible",
    zoning: "agricultural",
    description: "Mostly swampland. Previous owner tried to develop and failed. Multiple environmental restrictions. Good for hunting lease only."
  }
end

# 13. Island Property - South Carolina
Parcel.find_or_create_by!(parcel_number: "SC-BEA-2024-012") do |parcel|
  parcel.city = "Beaufort"
  parcel.state = "South Carolina"
  parcel.property_features = {
    acres: 0.75,
    market_value: 125000,
    assessed_value: 118000,
    buildability_percentage: 85,
    landlocked: false,
    road_frontage: 90,
    corporate_owned: false,
    slope: 2,
    fema_coverage: 100,
    wetland_coverage: 15,
    last_sold: "2017",
    shape: "rectangular",
    utilities: "available",
    zoning: "residential",
    description: "Barrier island lot 200 yards from beach. Requires elevated construction. HOA fees $200/month. Hurricane insurance required."
  }
end

# HIGH-VALUE PARCELS - Premium properties requiring substantial capital

# 14. Development-Ready Suburban Land - North Carolina
Parcel.find_or_create_by!(parcel_number: "NC-CHA-2024-013") do |parcel|
  parcel.city = "Charlotte"
  parcel.state = "North Carolina"
  parcel.property_features = {
    acres: 15,
    market_value: 480000,
    assessed_value: 455000,
    buildability_percentage: 95,
    landlocked: false,
    road_frontage: 600,
    corporate_owned: false,
    slope: 4,
    fema_coverage: 0,
    wetland_coverage: 5,
    last_sold: "2019",
    shape: "rectangular",
    utilities: "all utilities at property line",
    zoning: "R-3 multi-family",
    description: "Prime development land in fast-growing suburb. Approved for 30-unit subdivision. All studies complete. Ready to build."
  }
end

# 15. Large Ranch Acreage - Montana
Parcel.find_or_create_by!(parcel_number: "MT-MIS-2024-014") do |parcel|
  parcel.city = "Missoula"
  parcel.state = "Montana"
  parcel.property_features = {
    acres: 160,
    market_value: 320000,
    assessed_value: 298000,
    buildability_percentage: 60,
    landlocked: false,
    road_frontage: 1200,
    corporate_owned: false,
    slope: 12,
    fema_coverage: 0,
    wetland_coverage: 10,
    last_sold: "2012",
    shape: "irregular",
    utilities: "power 1/4 mile away",
    zoning: "agricultural",
    description: "Quarter section with mountain views. Mix of pasture and timber. Year-round creek. Borders national forest on two sides."
  }
end

# 16. Commercial Corner Lot - California
Parcel.find_or_create_by!(parcel_number: "CA-RIV-2024-015") do |parcel|
  parcel.city = "Riverside"
  parcel.state = "California"
  parcel.property_features = {
    acres: 2.8,
    market_value: 425000,
    assessed_value: 410000,
    buildability_percentage: 100,
    landlocked: false,
    road_frontage: 450,
    corporate_owned: true,
    slope: 1,
    fema_coverage: 0,
    wetland_coverage: 0,
    last_sold: "2020",
    shape: "L-shaped corner",
    utilities: "all available",
    zoning: "commercial",
    description: "High-traffic corner at major intersection. 40,000 cars daily. Perfect for retail/restaurant. REIT liquidating portfolio."
  }
end

# 17. Waterfront Acreage - Minnesota
Parcel.find_or_create_by!(parcel_number: "MN-CAS-2024-016") do |parcel|
  parcel.city = "Brainerd"
  parcel.state = "Minnesota"
  parcel.property_features = {
    acres: 80,
    market_value: 280000,
    assessed_value: 265000,
    buildability_percentage: 70,
    landlocked: false,
    road_frontage: 400,
    corporate_owned: false,
    slope: 8,
    fema_coverage: 20,
    wetland_coverage: 25,
    last_sold: "2008",
    shape: "irregular",
    utilities: "power at road",
    zoning: "recreational/residential",
    description: "Half mile of pristine lakeshore. Mix of woods and meadow. Subdividable into multiple lake lots. Seasonal access road."
  }
end

# 18. Income-Producing Farmland - Iowa
Parcel.find_or_create_by!(parcel_number: "IA-STO-2024-017") do |parcel|
  parcel.city = "Ames"
  parcel.state = "Iowa"
  parcel.property_features = {
    acres: 120,
    market_value: 510000,
    assessed_value: 495000,
    buildability_percentage: 95,
    landlocked: false,
    road_frontage: 1320,
    corporate_owned: false,
    slope: 2,
    fema_coverage: 0,
    wetland_coverage: 0,
    last_sold: "2003",
    shape: "rectangular",
    utilities: "available",
    zoning: "agricultural",
    description: "Prime tillable farmland. Currently leased for $350/acre annually. Corn/soybean rotation. Excellent soil quality rating."
  }
end

puts "Created 18 parcels successfully."

puts "\n🎯 SEED DATA SUMMARY:"
puts "✅ 6 Personas created (Easy: 2, Medium: 2, Hard: 2)"
puts "✅ 18 Parcels created"
puts "💰 Price range: $8,000 - $510,000"
puts "📏 Acreage range: 0.12 - 160 acres"
puts "🗺️  Geographic coverage: 18 different states"
puts "\nRun 'rails db:seed' to create this data!"