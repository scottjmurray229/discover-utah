#!/usr/bin/env python3
"""Utah Tier 3 quality pass — adds affiliatePicks, scottTips, immersive-break-inline, AEO ledes"""
import os, re

BASE = "C:/Users/scott/Documents/discover-utah/src/content/destinations"

BOOKING = "https://www.booking.com/region/us/utah.html?aid=2778866"
GYG = "https://www.getyourguide.com/?partner_id=IVN6IQ3"
AMAZON = "https://www.amazon.com/s?k=utah+travel&tag=discovermore-20"

# Full Tier 3 data for all destinations
DESTINATIONS = {
    "zion": {
        "title": "Zion National Park",
        "aeo": "Zion National Park is Utah's most visited national park and one of the most spectacular canyons in the American Southwest — towering sandstone cliffs over 2,000 feet tall rising directly from the Virgin River, with world-class hikes including Angels Landing and the Narrows river walk. It's simultaneously breathtaking and accessible, which is why over four million people visit each year.",
        "gradient": "linear-gradient(135deg, #dc2626, #ea580c, #b45309)",
        "video_title": "Zion: Temples of Stone",
        "video_text": "Sandstone towers, emerald pools, and the legendary Narrows.",
        "affiliatePicks": [
            {"name": "Zion Lodge", "type": "hotel", "url": f"{BOOKING}&ss=Springdale+UT", "description": "The only in-park lodging. Book 6+ months out — demand is extreme.", "priceRange": "$$$"},
            {"name": "Zion Narrows Guided Tour", "type": "tour", "url": f"{GYG}&q=Zion+Narrows", "description": "Guided bottom-up Narrows hike with gear rental included.", "priceRange": "$$"},
            {"name": "Osprey Daylite 13 Pack", "type": "activity", "url": f"{AMAZON}&k=osprey+day+pack+hiking", "description": "Lightweight pack for canyon hikes in the heat.", "priceRange": "$"},
        ],
        "scottTips": {
            "logistics": "Angels Landing requires a permit lottery on Recreation.gov. Book well in advance for both spring seasonal and day-before lotteries. The mandatory shuttle runs March–November — you cannot drive the main canyon road during this period.",
            "bestTime": "April–May and September–October for ideal temperatures and manageable crowds. Summer is intensely hot and crowded. Winter is beautiful and uncrowded but trails can be icy — bring microspikes.",
            "gettingAround": "Shuttle is mandatory in canyon during peak season and is actually efficient. Rent waterproof boots and poles in Springdale for the Narrows — street shoes will destroy your ankles.",
            "money": "$35 vehicle entry (7 days) or America the Beautiful pass ($80/year) covers Zion plus all national parks — worth it if you're doing the Mighty Five. Budget $160–220/night for Springdale lodging in peak season.",
            "safety": "Flash flood risk in the Narrows — always check weather and flow conditions at the visitor center before entering. Never enter if thunderstorms are forecast anywhere in the watershed. The Virgin River rises fast.",
            "packing": "Waterproof boots and neoprene socks for the Narrows, sun protection for canyon hiking, layers for temperature swings. Trekking poles on Angels Landing chains section.",
            "localCulture": "Springdale is entirely oriented around the park. Most restaurants close relatively early. Book dinner reservations. The Zion Canyon Giant Screen Theatre shows a Zion film if you need evening entertainment."
        },
    },
    "bryce-canyon": {
        "title": "Bryce Canyon National Park",
        "aeo": "Bryce Canyon National Park is not actually a canyon — it's an amphitheater of thousands of otherworldly orange-red hoodoos (spire-shaped rock formations) carved by frost and erosion from the rim of the Paunsaugunt Plateau. At 8,000–9,000 feet elevation, it's dramatically different from Zion: cooler, quieter, and more other-worldly. The Navajo Loop and Queens Garden trails together form the best one-day hike in Utah.",
        "gradient": "linear-gradient(135deg, #dc2626, #f97316, #fbbf24)",
        "video_title": "Bryce Canyon: A Forest of Stone",
        "video_text": "Hoodoos, amphitheaters, and the most surreal landscape in Utah.",
        "affiliatePicks": [
            {"name": "Bryce Canyon Lodge", "type": "hotel", "url": f"{BOOKING}&ss=Bryce+Canyon+UT", "description": "Historic in-park lodge surrounded by pines. Book 6+ months out.", "priceRange": "$$$"},
            {"name": "Bryce Canyon Guided Hoodoo Tour", "type": "tour", "url": f"{GYG}&q=Bryce+Canyon+tour", "description": "Guided rim and below-rim hike explaining the hoodoo geology.", "priceRange": "$$"},
            {"name": "Microspikes for Hiking", "type": "activity", "url": f"{AMAZON}&k=microspikes+hiking", "description": "Essential for icy winter and early spring trails at 8,000 feet.", "priceRange": "$"},
        ],
        "scottTips": {
            "logistics": "Bryce Canyon is 83 miles from Zion — easy to combine in a multi-park trip. The park shuttle runs May–October. Sunrise Point and Sunset Point are the best rim viewpoints for golden hour.",
            "bestTime": "May–June and September–October. Summer is ideal hiking weather (60s–70s°F) with afternoon storms. Winter brings snow that makes the hoodoos even more photogenic, but trails are icy.",
            "gettingAround": "Rim Drive takes you to all major viewpoints. Park shuttle covers the main corridor. The Navajo Loop + Queens Garden combination (2.9 miles) is the essential hike — descend via Navajo, return via Queens Garden.",
            "money": "$35 vehicle entry (7 days) or America the Beautiful pass. Ruby's Inn outside the park is the main budget alternative to Bryce Canyon Lodge.",
            "safety": "The 8,000-foot elevation means altitude awareness. The hike out of the canyon is an uphill climb — start early and hydrate. Ice on trails October–May even when the rim seems clear.",
            "packing": "Warm layers even in summer (cold mornings and evenings at altitude). Microspikes for spring/fall/winter. Headlamp for sunrise hikes from the rim.",
            "localCulture": "Bryce City (near the park) is tiny — stock up on supplies in Panguitch 25 miles north. The park visitor center has excellent geology exhibits explaining how hoodoos form."
        },
    },
    "arches": {
        "title": "Arches National Park",
        "aeo": "Arches National Park contains the world's largest concentration of natural stone arches — over 2,000 of them within 76,000 acres of stunning Utah red rock country near Moab. Delicate Arch is the most iconic, recognizable from the Utah license plate. The park is compact and visually spectacular, but summer heat is extreme and the timed entry system requires advance planning.",
        "gradient": "linear-gradient(135deg, #ea580c, #dc2626, #b45309)",
        "video_title": "Arches: Windows in Stone",
        "video_text": "Two thousand arches. One extraordinary landscape.",
        "affiliatePicks": [
            {"name": "Moab Hotel at Arches", "type": "hotel", "url": f"{BOOKING}&ss=Moab+UT", "description": "Moab is the gateway to both Arches and Canyonlands. Book early for spring peak.", "priceRange": "$$"},
            {"name": "Arches Guided Hike", "type": "tour", "url": f"{GYG}&q=Arches+National+Park+tour", "description": "Guided half-day tour covering Delicate Arch and Landscape Arch.", "priceRange": "$$"},
            {"name": "Camelbak 2L Hydration Pack", "type": "activity", "url": f"{AMAZON}&k=camelbak+hydration+pack", "description": "Required for desert hiking — 2L minimum for Delicate Arch trail in summer.", "priceRange": "$"},
        ],
        "scottTips": {
            "logistics": "Timed entry required April 1–October 31, 7am–4pm entry window. Reserve on Recreation.gov — they sell out days in advance during spring peak. Enter before 7am or after 4pm to bypass timed entry.",
            "bestTime": "March–May and September–November. March–April has desert wildflowers. Summer (June–August) is brutally hot — 100°F+, dangerous for midday hiking. Spring and fall are the target windows.",
            "gettingAround": "One main road through the park with short hikes to major arches. Delicate Arch (3 miles RT, 480 ft gain) is the must-do. Landscape Arch (1.6 miles RT, easy) in Devils Garden area.",
            "money": "$35 vehicle entry. America the Beautiful pass covers both Arches and Canyonlands — get it if you're doing both, which you should be.",
            "safety": "Desert heat kills. Carry more water than you think you need — minimum 1 liter per person per hour in summer. Start hikes at dawn, be off exposed trails by 10am in summer. No shade on Delicate Arch trail.",
            "packing": "Large water capacity (hydration pack), sun hat and sunscreen, trail runners or hiking boots. Trekking poles helpful on Delicate Arch's slickrock finale.",
            "localCulture": "Moab has excellent restaurants and a fun outdoor-adventure culture. Moab Brewery is the social hub. Book restaurants for dinner — options fill up in spring peak."
        },
    },
    "canyonlands": {
        "title": "Canyonlands National Park",
        "aeo": "Canyonlands National Park is Utah's largest national park and its most dramatic from above — the Colorado and Green Rivers carve through a vast canyon system of mesas, buttes, and canyon walls dropping 1,500 feet to the rivers below. It's less visited than nearby Arches because it's bigger and harder to access, which makes it more rewarding. Island in the Sky mesa is spectacular and easy; the Needles district requires more effort but delivers deep canyon country.",
        "gradient": "linear-gradient(135deg, #b45309, #dc2626, #ea580c)",
        "video_title": "Canyonlands: Rivers Meet Stone",
        "video_text": "The Colorado and Green Rivers carved this. Words can't complete the sentence.",
        "affiliatePicks": [
            {"name": "Moab Gateway Hotels", "type": "hotel", "url": f"{BOOKING}&ss=Moab+UT", "description": "Moab is the base for both Island in the Sky and Needles districts.", "priceRange": "$$"},
            {"name": "Canyonlands Jeep/4WD Tour", "type": "tour", "url": f"{GYG}&q=Canyonlands+jeep+tour", "description": "Access backcountry areas of Canyonlands only reachable by 4WD.", "priceRange": "$$$"},
            {"name": "REI Co-op Trail Running Shoes", "type": "activity", "url": f"{AMAZON}&k=trail+running+shoes+desert", "description": "Lightweight trail shoes for slickrock and canyon hiking.", "priceRange": "$$"},
        ],
        "scottTips": {
            "logistics": "Canyonlands has three separate districts — Island in the Sky (closest to Moab, 35 miles), Needles (75 miles), and The Maze (very remote, high-clearance 4WD only). Plan which district(s) to visit before you go.",
            "bestTime": "March–May and September–October. Mesa Arch at Island in the Sky is famous for sunrise — arrive 45 minutes before sunrise and expect other photographers. Summer heat is extreme in canyon bottoms.",
            "gettingAround": "Island in the Sky is the easiest: paved road to overlooks. Needles requires some 4WD for inner roads but 2WD reaches the main trailheads. The Maze is expedition territory — don't go without navigation skills and a permit.",
            "money": "$35 vehicle entry covers the specific district you're entering. America the Beautiful covers all three. Canyonlands gets far fewer visitors than Arches despite being larger and arguably more dramatic.",
            "safety": "Mesa Arch trail is easy but the clifftop is unguarded — stay back from the edge. Backcountry hiking requires a permit and should not be attempted without navigation skills. No water sources in most areas — carry all your water.",
            "packing": "More water than Arches — longer distances and more exposure. Permit required for backcountry camping. Topo map and compass/GPS for Needles backcountry.",
            "localCulture": "Canyonlands is quieter and more local than Arches. The Needles Outpost just outside the park is the only gas/supply option near that district — don't run low."
        },
    },
    "capitol-reef": {
        "title": "Capitol Reef National Park",
        "aeo": "Capitol Reef National Park is the least-visited and most underrated of Utah's Mighty Five parks — a 100-mile wrinkle in the earth called the Waterpocket Fold, created by a monocline fault that pushed ancient rock layers into a dramatic reef-like ridge. The park preserves a historic Mormon pioneer settlement (Fruita), petroglyphs, slot canyons, and stunning erosional landscapes without the crowds of Zion or Bryce.",
        "gradient": "linear-gradient(135deg, #dc2626, #ea580c, #16a34a)",
        "video_title": "Capitol Reef: Utah's Hidden Giant",
        "video_text": "Orchards, petroglyphs, and hundred-mile folds of stone.",
        "affiliatePicks": [
            {"name": "Capitol Reef Resort", "type": "hotel", "url": f"{BOOKING}&ss=Torrey+UT", "description": "Best lodging base near Capitol Reef. Torrey is the gateway town.", "priceRange": "$$"},
            {"name": "Capitol Reef Hiking Tour", "type": "tour", "url": f"{GYG}&q=Capitol+Reef+National+Park", "description": "Guided tour of Fruita orchards, petroglyphs, and canyon hikes.", "priceRange": "$$"},
            {"name": "National Parks Guide Utah", "type": "activity", "url": f"{AMAZON}&k=utah+national+parks+guide+book", "description": "Comprehensive Utah parks guide covering all five Mighty Five parks.", "priceRange": "$"},
        ],
        "scottTips": {
            "logistics": "Capitol Reef is often the middle stop on a Mighty Five road trip (Bryce → Capitol Reef → Canyonlands/Arches route). The Scenic Drive ($10, cash only) gives the best canyon access. The Fruita orchards produce free fruit in season — pick your own.",
            "bestTime": "April–October. The park is driveable year-round but some roads wash out after heavy rain. Spring brings desert wildflowers in the orchards and canyon washes.",
            "gettingAround": "Paved Scenic Drive accesses most highlights. Grand Wash and Capitol Gorge are narrows hikes reachable from paved roads. High Clearance Road south of Fruita needs 4WD — don't risk it in a standard rental.",
            "money": "The entrance fee is $20/vehicle but only covers the Scenic Drive area. Free to enter for most trailheads along Highway 24. America the Beautiful covers everything.",
            "safety": "Flash flooding risk in the slot canyons — check weather before entering Grand Wash or Capitol Gorge. The canyon narrows funnel water fast.",
            "packing": "Cash for the Scenic Drive and orchard fruit. Sun protection — the Waterpocket Fold is exposed. Good boots for slickrock.",
            "localCulture": "Torrey (7 miles from the park) has excellent dining at Café Diablo and Capitol Reef Resort restaurant. Tiny population but a surprisingly strong dining scene."
        },
    },
    "moab": {
        "title": "Moab",
        "aeo": "Moab is Utah's adventure capital and the gateway to both Arches and Canyonlands National Parks — a small canyon town of 5,000 people surrounded by some of the most dramatic red rock landscape in North America. It's the base for mountain biking on the world-famous Slickrock Trail, off-road Jeep adventures, Colorado River rafting, and hiking in two of Utah's five national parks.",
        "gradient": "linear-gradient(135deg, #ea580c, #dc2626, #b45309)",
        "video_title": "Moab: Adventure on Red Rock",
        "video_text": "Two national parks, one river, and the world's best slickrock.",
        "affiliatePicks": [
            {"name": "Moab Under Canvas", "type": "hotel", "url": f"{BOOKING}&ss=Moab+UT", "description": "Glamping just outside town with red rock views. Unique and photogenic.", "priceRange": "$$$"},
            {"name": "Colorado River Rafting Half-Day", "type": "tour", "url": f"{GYG}&q=Moab+rafting", "description": "Half-day raft on the Colorado — suitable for families and beginners.", "priceRange": "$$"},
            {"name": "Jeep Wrangler Rental Moab", "type": "transport", "url": f"{GYG}&q=Moab+jeep+rental", "description": "Rent a Jeep to access backcountry trails in Canyonlands and beyond.", "priceRange": "$$$"},
        ],
        "scottTips": {
            "logistics": "Moab is the base for both Arches (5 miles north) and Canyonlands Island in the Sky (35 miles northwest). Book accommodation far in advance for spring and fall — the town fills completely. Timed entry for Arches requires Recreation.gov reservation.",
            "bestTime": "March–May and September–November. Spring is the sweet spot: wildflowers, comfortable temps, and events like Jeep Safari (Easter week). Summer is brutally hot but the Colorado River becomes rafting paradise.",
            "gettingAround": "Car essential. Moab's canyon topography means there are no alternatives for reaching either national park. Rent a Jeep if you want to access backcountry trails.",
            "money": "$160–280/night for quality lodging in peak spring. America the Beautiful pass ($80/year) covers both Arches and Canyonlands entrance. Budget for one guided activity — rafting or a Jeep tour adds significantly to the experience.",
            "safety": "Heat is the primary danger in summer. Flash floods in canyon washes after storms. Tell someone your backcountry itinerary if going off main roads.",
            "packing": "Large water capacity for desert hiking. Layers for cool canyon mornings. Sunscreen is non-negotiable. Sandals for river activities.",
            "localCulture": "Moab has excellent dining and a thriving craft beer scene for a small town. Moab Brewery is the social anchor. Wake up early — the best canyon light is at sunrise, and the cooler temperatures make dawn starts wise."
        },
    },
    "salt-lake-city": {
        "title": "Salt Lake City",
        "aeo": "Salt Lake City is Utah's capital and largest city — a surprisingly cosmopolitan mountain city of 200,000 set against the dramatic backdrop of the Wasatch Range, with quick access to some of the best skiing in North America (Alta, Snowbird, Park City are all within an hour) and serving as the gateway to Utah's national parks and outdoor adventures.",
        "gradient": "linear-gradient(135deg, #1e40af, #1d4ed8, #b45309)",
        "video_title": "Salt Lake City: Mountain Meets Metro",
        "video_text": "World-class skiing, temple square, and the gateway to five national parks.",
        "affiliatePicks": [
            {"name": "Grand America Hotel", "type": "hotel", "url": f"{BOOKING}&ss=Salt+Lake+City+UT", "description": "Salt Lake City's finest hotel — ornate, central, excellent service.", "priceRange": "$$$$"},
            {"name": "Temple Square and City History Tour", "type": "tour", "url": f"{GYG}&q=Salt+Lake+City+tour", "description": "Walking tour covering Temple Square, state capitol, and Pioneer history.", "priceRange": "$"},
            {"name": "Alta/Snowbird Lift Tickets", "type": "activity", "url": f"{GYG}&q=Alta+Snowbird+skiing", "description": "Book ski passes for Alta or Snowbird for best pricing.", "priceRange": "$$$"},
        ],
        "scottTips": {
            "logistics": "SLC's airport is excellent — direct flights from most major US cities. The TRAX light rail runs from the airport to downtown and to the University of Utah. Rent a car for ski resorts and national park trips — you need one for most Utah exploration.",
            "bestTime": "November–March for skiing. April–May and September–October for national park trips. Summer is good for city exploration and Wasatch hiking but hot in the valley.",
            "gettingAround": "TRAX light rail handles airport and downtown. UTA bus system exists. Car essential for ski resorts and everything outside the city. Canyon roads to Alta/Snowbird are sometimes chain-required in winter.",
            "money": "SLC hotels run $130–220/night for solid mid-range options. Ski resorts add significantly to the budget — budget $200+ per person per day skiing. The Great Salt Lake and Temple Square are free.",
            "safety": "Winter driving on I-215 and canyon roads can be treacherous. The inversions (air quality) in winter valley are notoriously bad — check AQI before strenuous outdoor exercise in the city.",
            "packing": "Full ski gear if renting is your plan (or rent in SLC). Layers for the dramatic temperature swings. Sunscreen year-round at elevation.",
            "localCulture": "Utah liquor laws apply but are more relaxed than commonly perceived. Grocery stores sell 5% ABV beer. Full-strength spirits and wine at state liquor stores and restaurant bars. Temple Square is a major landmark regardless of faith — worth an hour."
        },
    },
    "monument-valley": {
        "title": "Monument Valley",
        "aeo": "Monument Valley is the most recognizable landscape in the American West — the massive red sandstone buttes called the Mittens, Merrick Butte, and the Three Sisters rising from a vast flat desert floor on the Utah-Arizona border. It's Navajo Nation land, meaning the valley itself is administered by the Navajo Nation Tribal Park rather than the National Park Service, and guided Navajo tours are the best way to experience the interior.",
        "gradient": "linear-gradient(135deg, #dc2626, #ea580c, #92400e)",
        "video_title": "Monument Valley: The American West",
        "video_text": "The Mittens at sunrise. No further explanation needed.",
        "affiliatePicks": [
            {"name": "The View Hotel", "type": "hotel", "url": f"{BOOKING}&ss=Monument+Valley+AZ", "description": "The only hotel in Monument Valley, with direct Mittens views from every room.", "priceRange": "$$$"},
            {"name": "Navajo Guided Jeep Tour", "type": "tour", "url": f"{GYG}&q=Monument+Valley+jeep+tour", "description": "Navajo-guided interior valley tour to areas not accessible on the self-drive loop.", "priceRange": "$$"},
            {"name": "Sunrise Photo Workshop", "type": "tour", "url": f"{GYG}&q=Monument+Valley+photography+tour", "description": "Photography-focused sunrise tour with positioning guidance for the Mittens shot.", "priceRange": "$$"},
        ],
        "scottTips": {
            "logistics": "Monument Valley is 5 hours from Zion, 2.5 hours from Page/Antelope Canyon, 3 hours from Moab. Plan it as part of a larger Utah/Arizona road trip — it's not worth a dedicated long-distance trip on its own, though the landscape is extraordinary.",
            "bestTime": "April–May and September–October. Summer is brutally hot (100°F+) and the Valley Drive becomes deeply rutted. Sunrise and sunset are the peak times — The View Hotel is worth booking just to see the Mittens at dawn from your room.",
            "gettingAround": "The 17-mile Valley Drive self-drive loop (4WD recommended, regular cars possible in dry conditions) accesses the main overlooks. Beyond the overlooks, Navajo guides are required — and worth it.",
            "money": "$8 per person Tribal Park entry fee ($20 max per vehicle). Navajo-guided tours run $50–80 per person. The View Hotel runs $250–400/night in peak season — expensive but the view from the room is genuine.",
            "safety": "Heat and dehydration risks are extreme in summer. Stay on designated roads and trails — wandering off-trail on Navajo land is not permitted without a guide.",
            "packing": "Camera and wide-angle lens for the butte shots. Sunrise alarm — the Mittens at golden hour are significantly more photogenic than midday.",
            "localCulture": "You are on Navajo Nation land — be respectful. Do not climb the buttes or enter restricted areas. Purchase Navajo art and food directly from local vendors; this is the economy. The scale of the valley is difficult to convey in photos — it's even bigger in person."
        },
    },
    "lake-powell": {
        "title": "Lake Powell",
        "aeo": "Lake Powell is a vast reservoir on the Colorado River straddling the Utah-Arizona border — 186 miles of blue water in a dramatic red rock canyon landscape, created by Glen Canyon Dam in 1966. It's a boating and houseboat destination unlike anything else in the Southwest. Antelope Canyon is just downstream at Page, Arizona.",
        "gradient": "linear-gradient(135deg, #0369a1, #0ea5e9, #dc2626)",
        "video_title": "Lake Powell: Blue Water, Red Rock",
        "video_text": "A canyon flooded by a lake. Complicated, and spectacular.",
        "affiliatePicks": [
            {"name": "Lake Powell Resort and Marina", "type": "hotel", "url": f"{BOOKING}&ss=Page+AZ", "description": "The main resort at Wahweap Marina near Page, AZ. Best for houseboat access.", "priceRange": "$$$"},
            {"name": "Lake Powell Houseboat Rental", "type": "activity", "url": f"{GYG}&q=Lake+Powell+houseboat", "description": "Multi-day houseboat rental for the full Lake Powell experience.", "priceRange": "$$$$"},
            {"name": "Antelope Canyon and Lake Powell Tour", "type": "tour", "url": f"{GYG}&q=Antelope+Canyon+Lake+Powell+tour", "description": "Combined Antelope Canyon (Navajo-guided) and Lake Powell boat tour from Page.", "priceRange": "$$"},
        ],
        "scottTips": {
            "logistics": "Page, Arizona is the gateway — Antelope Canyon, Horseshoe Bend, and Wahweap Marina are all within 10 miles. Antelope Canyon requires advance booking of a Navajo tour — fill up months in advance in spring and fall.",
            "bestTime": "May–September for boating. The water is warm, days are long. Spring and fall for hiking around the lake. The lake level has dropped significantly due to drought — check current status before planning water activities.",
            "gettingAround": "Boat or houseboat for the lake itself. Car to access Page, Antelope Canyon, and Horseshoe Bend. The canyon lands surrounding the lake are navigable by 4WD in many areas.",
            "money": "Houseboat rentals start around $1,200/night — split among a group this is reasonable and the experience is exceptional. Hotel lodging in Page runs $150–250/night.",
            "safety": "Boating safety on the open lake — life jackets required for children. Afternoon monsoon storms July–September can arrive fast on open water. Check forecasts before departing marina.",
            "packing": "Sunscreen in industrial quantities — the water reflects UV. Boat-appropriate clothing that dries fast. Camera for the canyon reflections.",
            "localCulture": "Antelope Canyon is Navajo Nation land — guides are mandatory. Book directly with Navajo tour operators (Ken's Tours, Antelope Canyon Navajo Tours) for authentic experience."
        },
    },
    "antelope-island": {
        "title": "Antelope Island State Park",
        "aeo": "Antelope Island is the largest island in the Great Salt Lake — a 42-square-mile chunk of desert mountains accessible by causeway, with a herd of 500–700 free-roaming bison, Great Salt Lake views, and a stark landscape unlike anything else in the region. It's one of Utah's most underrated destinations and only 30 miles from Salt Lake City.",
        "gradient": "linear-gradient(135deg, #78716c, #a16207, #0369a1)",
        "video_title": "Antelope Island: Wild Utah",
        "video_text": "Bison, salt flats, and a lake three times saltier than the ocean.",
        "affiliatePicks": [
            {"name": "Salt Lake City Hotels", "type": "hotel", "url": f"{BOOKING}&ss=Salt+Lake+City+UT", "description": "Day trip from SLC — no accommodation on the island itself.", "priceRange": "$$"},
            {"name": "Antelope Island Wildlife Tour", "type": "tour", "url": f"{GYG}&q=Antelope+Island+State+Park+tour", "description": "Guided wildlife and geology tour covering bison behavior and Great Salt Lake ecology.", "priceRange": "$"},
            {"name": "Waterproof Hiking Boots", "type": "activity", "url": f"{AMAZON}&k=waterproof+hiking+boots", "description": "Shore areas can be wet and salty — waterproof footwear is helpful.", "priceRange": "$$"},
        ],
        "scottTips": {
            "logistics": "Antelope Island is 30 miles north of Salt Lake City — an easy half-day or full-day trip. The causeway from Syracuse is paved and well-maintained. $15/vehicle entry. No overnight accommodation on the island.",
            "bestTime": "Spring and fall for bison viewing and birdwatching (the Great Salt Lake is a major migratory bird stopover). Summer works for hiking but biting gnats (no-see-ums) can be intense in July–August.",
            "gettingAround": "Drive the main road to Fielding Garr Ranch (southern tip) and major trailheads. The Buffalo Point area has the best bison viewing overlooks. Bike rentals available in peak season.",
            "money": "$15/vehicle for day use. Worth every dollar — this is one of the best wildlife viewing opportunities in the Intermountain West and surprisingly uncrowded.",
            "safety": "Bison are wild and dangerous — maintain 25-yard minimum distance. The island has rattlesnakes in rocky areas — watch where you step. Bring more water than you think you need (no services on most of the island).",
            "packing": "Bug spray if visiting July–August (gnats are relentless). Binoculars for bison and birdwatching. Sunscreen — the island is completely exposed.",
            "localCulture": "The Great Salt Lake ecology is a legitimate scientific curiosity — read about brine shrimp and migratory birds before you go. The lake's shrinking is a major environmental story; you can see historical waterlines on the mountains."
        },
    },
    "great-salt-lake": {
        "title": "Great Salt Lake",
        "aeo": "The Great Salt Lake is the largest natural lake west of the Mississippi River — a terminal salt lake three to five times saltier than the ocean, with no outlet, giving it a pink-tinted color in some areas from salt-loving microorganisms. It's ecologically significant (one of the top shorebird habitats in North America), scientifically fascinating, and increasingly threatened by drought and water diversion.",
        "gradient": "linear-gradient(135deg, #0369a1, #7c3aed, #be185d)",
        "video_title": "Great Salt Lake: An Inland Sea",
        "video_text": "Pink water, migratory birds, and an ecological emergency.",
        "affiliatePicks": [
            {"name": "Salt Lake City Base Hotels", "type": "hotel", "url": f"{BOOKING}&ss=Salt+Lake+City+UT", "description": "Salt Lake City is the base for Great Salt Lake exploration.", "priceRange": "$$"},
            {"name": "Great Salt Lake Ecology Tour", "type": "tour", "url": f"{GYG}&q=Great+Salt+Lake+tour", "description": "Guided ecology tour covering brine shrimp, migratory birds, and lake science.", "priceRange": "$"},
            {"name": "Binoculars for Birdwatching", "type": "activity", "url": f"{AMAZON}&k=binoculars+birdwatching", "description": "The lake hosts millions of migratory shorebirds — binoculars are essential.", "priceRange": "$$"},
        ],
        "scottTips": {
            "logistics": "Antelope Island State Park (see above) is the best access point. Saltair Pavilion on the south shore is historic and photographable. The Bear River Migratory Bird Refuge on the north shore is the premier birdwatching site.",
            "bestTime": "April–May and August–October for peak migratory bird activity. Millions of phalaropes, avocets, stilts, and other shorebirds stop here. Summer is also good for the pink-water photography opportunities.",
            "gettingAround": "Each access point (Antelope Island, Saltair, Bear River Refuge) is a separate destination requiring a car. Plan which areas you want to prioritize.",
            "money": "Antelope Island is $15/vehicle. Bear River Migratory Bird Refuge is free (part of the National Wildlife Refuge system). Saltair Pavilion is free to drive by.",
            "safety": "The extreme salinity means buoyancy but also skin and eye irritation if you swim. Rinse off immediately after any contact. Biting gnats in summer near shore — bring bug spray.",
            "packing": "Bug spray, binoculars, camera with long lens for birds. Waterproof shoes if wading near shore.",
            "localCulture": "The Great Salt Lake is currently experiencing a severe ecological crisis due to water diversion and drought — the lake has shrunk by 50% in recent decades. This context matters for understanding what you're seeing and why conservation matters."
        },
    },
    "st-george": {
        "title": "St. George",
        "aeo": "St. George is Utah's sunniest city — a fast-growing desert city in the state's southwest corner, an hour from Zion National Park, with red rock canyon scenery right in town, world-class golf, and genuinely warm winters that make it a popular snowbird destination. It's also the western gateway to Zion and an underrated destination in its own right.",
        "gradient": "linear-gradient(135deg, #dc2626, #ea580c, #fbbf24)",
        "video_title": "St. George: Sunny Desert City",
        "video_text": "Red rock canyons, warm winters, and the gateway to Zion.",
        "affiliatePicks": [
            {"name": "Red Mountain Resort", "type": "hotel", "url": f"{BOOKING}&ss=St+George+UT", "description": "Wellness resort in the red rock canyons near St. George. Hiking from the property.", "priceRange": "$$$"},
            {"name": "Snow Canyon State Park Guided Hike", "type": "tour", "url": f"{GYG}&q=Snow+Canyon+State+Park", "description": "Guided hike through Snow Canyon's lava tubes and sandstone formations.", "priceRange": "$"},
            {"name": "St. George Shuttle to Zion", "type": "transport", "url": f"{GYG}&q=St+George+to+Zion+shuttle", "description": "Shuttle service from St. George to Zion National Park entrance.", "priceRange": "$"},
        ],
        "scottTips": {
            "logistics": "St. George is 46 miles from Zion, making it a viable and often cheaper base than Springdale. Snow Canyon State Park is 10 miles north — an underrated gem with lava tubes, red and white sandstone, and far fewer crowds than Zion.",
            "bestTime": "October–April for pleasant weather. Summers are extremely hot (105°F+) — not ideal for hiking. Winter temperatures are mild (50s–60s°F days) compared to the rest of Utah.",
            "gettingAround": "Car essential — St. George is spread out and doesn't have meaningful public transit. Drive or shuttle to Zion; don't try to shuttle from St. George.",
            "money": "Significantly cheaper than Springdale for lodging ($100–180/night vs. $180–300+). A good budget option for Zion access.",
            "safety": "Heat in summer is extreme — plan any outdoor activities before 10am. Snow Canyon's lava tubes can be dark and slippery — bring a headlamp.",
            "packing": "Golf gear if you're inclined (St. George has world-class golf resorts). Hiking boots for Snow Canyon. Sun protection year-round.",
            "localCulture": "St. George is a large and growing city with a strong LDS community. Restaurant options are good. The Dixie State University area has more evening activity than you'd expect."
        },
    },
    "alta-snowbird": {
        "title": "Alta and Snowbird",
        "aeo": "Alta and Snowbird are two of the best ski resorts in North America, located in Little Cottonwood Canyon just 30 miles from Salt Lake City — and they now operate as a combined ski area called Wasatch Interconnect. Alta receives an average of 500 inches of light, dry powder per year. Snowbird adds vertical drop and terrain variety. Together, they're the premier ski destination in the American West.",
        "gradient": "linear-gradient(135deg, #1e40af, #0369a1, #7c3aed)",
        "video_title": "Alta and Snowbird: Utah Powder",
        "video_text": "500 inches of average snowfall. Salt Lake City 30 miles away.",
        "affiliatePicks": [
            {"name": "Snowbird Cliff Lodge", "type": "hotel", "url": f"{BOOKING}&ss=Snowbird+UT", "description": "Ski-in/ski-out lodging at Snowbird with access to the full mountain.", "priceRange": "$$$$"},
            {"name": "Alta Ski Lift Tickets", "type": "activity", "url": f"{GYG}&q=Alta+Snowbird+ski+pass", "description": "Lift passes for Alta/Snowbird — book in advance for best pricing.", "priceRange": "$$$"},
            {"name": "Ski Rental SLC", "type": "activity", "url": f"{GYG}&q=Salt+Lake+City+ski+rental", "description": "Ski rental shop in SLC or canyon — cheaper than renting on the mountain.", "priceRange": "$$"},
        ],
        "scottTips": {
            "logistics": "Little Cottonwood Canyon road closes during storms and avalanche control — this is normal. Utah DOT provides real-time road status. Plan your canyon departure before major storms or you may be stuck. Canyon access is also restricted during weekends (alternating gate system).",
            "bestTime": "December–March for skiing. Alta historically gets the most snow in January–February. Snowbird stays open into May most years. The quality of light powder is exceptional even by Rocky Mountain standards.",
            "gettingAround": "UTA buses run from SLC to the canyon resorts on weekends — a viable option. Driving in winter requires AWD or chains. Snowbird has an aerial tram that's worth the ride even for non-skiers.",
            "money": "Alta is one of the last ski resorts still banning snowboarders (skiers only). Snowbird allows both. Combined lift tickets run $175–220/day. Stay slope-side to avoid canyon road issues.",
            "safety": "Avalanche terrain exists in both resorts' expert areas — stay in bounds unless you're with a certified guide and have avalanche safety training. The canyon itself has avalanche risk that can close roads.",
            "packing": "High-quality ski gear is worth renting properly. Base layers, mid-layers, waterproof ski pants/jacket, helmet, and goggles. Wrist guards for beginners. Hand/toe warmers.",
            "localCulture": "Alta has a cult following among serious skiers who've been coming for decades. The vibe is old-school mountain skiing rather than resort luxury. Snowbird is more modern and high-energy."
        },
    },
    "park-city": {
        "title": "Park City",
        "aeo": "Park City is Utah's premier ski resort town — a beautifully preserved silver mining town from the 1860s that's now home to two of the largest ski resorts in North America (Park City Mountain and Deer Valley), the Sundance Film Festival, and a historic Main Street with excellent dining and galleries. It's 30 miles from Salt Lake City and feels like a completely different world.",
        "gradient": "linear-gradient(135deg, #1e40af, #7c3aed, #be185d)",
        "video_title": "Park City: Mountain Town Done Right",
        "video_text": "Sundance Film Festival, world-class skiing, and a real historic Main Street.",
        "affiliatePicks": [
            {"name": "Waldorf Astoria Park City", "type": "hotel", "url": f"{BOOKING}&ss=Park+City+UT", "description": "Ski-in/ski-out luxury at Canyons Village. Top option for splurge stays.", "priceRange": "$$$$"},
            {"name": "Deer Valley Ski Experience", "type": "activity", "url": f"{GYG}&q=Deer+Valley+skiing", "description": "Deer Valley is skiers-only, groomed to perfection, with valet parking.", "priceRange": "$$$"},
            {"name": "Park City Historic Walking Tour", "type": "tour", "url": f"{GYG}&q=Park+City+historic+tour", "description": "Walking tour of Main Street's silver mining history and current restaurant scene.", "priceRange": "$"},
        ],
        "scottTips": {
            "logistics": "Park City is 35 minutes from SLC airport — among the closest ski resorts to a major airport in North America. This is a genuine advantage for long-weekend ski trips. Park City Mountain and Deer Valley are now connected as PCMR — the largest ski resort in the US by acreage.",
            "bestTime": "December–March for skiing. January is peak Sundance Film Festival (film industry crowds, book 12+ months out if you want Sundance accommodation). Summer is excellent for mountain biking and hiking with the gondola running.",
            "gettingAround": "Free bus (Park City Transit) runs throughout town and to the mountains. You technically don't need a car once in Park City. Salt Lake Express runs shuttles from SLC airport.",
            "money": "Park City is expensive — Deer Valley in particular skews luxury. Budget $200+ per day for skiing plus accommodation. Historic Main Street restaurants range from $15 casual to $80+ fine dining.",
            "safety": "Mountain driving on I-80 in winter requires AWD — SLC to Park City goes over Parley's Canyon. Road closures during storms are possible.",
            "packing": "Full ski gear or budget for mountain rental. Nice clothing for Main Street dining. Camera — the town is photogenic in every season.",
            "localCulture": "Park City is Utah's most cosmopolitan small town. The influence of Sundance (Robert Redford's organization is based here) and the international ski crowd creates a progressive vibe distinct from the rest of Utah. Real bars, diverse restaurants, strong arts scene."
        },
    },
    "dead-horse-point": {
        "title": "Dead Horse Point State Park",
        "aeo": "Dead Horse Point is a narrow mesa promontory in southeastern Utah offering one of the most dramatic canyon overlooks in the American West — a 2,000-foot drop to the Colorado River gorge below, with Canyonlands National Park spreading to the horizon. It's 10 miles from Moab and receives far fewer visitors than Arches, making it one of the best bang-for-buck viewpoints in Utah.",
        "gradient": "linear-gradient(135deg, #dc2626, #b45309, #ea580c)",
        "video_title": "Dead Horse Point: The Edge of Everything",
        "video_text": "2,000 feet down to the Colorado River. No guardrail needed.",
        "affiliatePicks": [
            {"name": "Moab Hotels — Arches Gateway", "type": "hotel", "url": f"{BOOKING}&ss=Moab+UT", "description": "Dead Horse Point is 10 miles from Moab — easy day trip from any Moab base.", "priceRange": "$$"},
            {"name": "Dead Horse Point Sunrise Photography Tour", "type": "tour", "url": f"{GYG}&q=Dead+Horse+Point+photography", "description": "Guided sunrise photo tour at the overlook — best light of the day.", "priceRange": "$$"},
            {"name": "National Geographic Utah Map", "type": "activity", "url": f"{AMAZON}&k=utah+national+parks+map", "description": "Topo map covering the canyon country around Moab and Dead Horse Point.", "priceRange": "$"},
        ],
        "scottTips": {
            "logistics": "Dead Horse Point requires a $20/vehicle day use fee (or America the Beautiful pass doesn't cover it — it's a state park, not federal). It's on the way to Canyonlands Island in the Sky — combine both in one day.",
            "bestTime": "Sunrise and sunset for the best canyon light. Midday views are still spectacular but less dramatic. Spring and fall for comfortable temperatures at the rim.",
            "gettingAround": "10-mile paved road from the highway junction. Easy drive. The rim trail is 4.5 miles and flat — easy walking to multiple overlooks beyond the main viewpoint.",
            "money": "$20/vehicle day use fee for the state park. The viewpoint is worth the price — arguably a better single view than anything in Arches National Park.",
            "safety": "The cliff edges are unguarded and a genuine hazard — stay back from the rim. Wind can be strong and sudden on the exposed mesa.",
            "packing": "Camera and wide-angle lens. Water and snacks — no services at the viewpoint. Tripod for sunrise/sunset photography.",
            "localCulture": "The name comes from a story (possibly apocryphal) of horses being corralled on the mesa and dying of thirst — the Colorado River visible from above but inaccessible to them. The film 127 Hours (Aron Ralston's story) was filmed partially in this region."
        },
    },
    "goblin-valley": {
        "title": "Goblin Valley State Park",
        "aeo": "Goblin Valley is Utah's strangest landscape — thousands of mushroom-shaped sandstone hoodoos called 'goblins' covering a flat desert valley floor in patterns that look genuinely alien. It's 4 hours from Salt Lake City and 2.5 hours from Moab, off the typical tourist circuit, which means you can walk among thousands of bizarre rock formations in relative solitude.",
        "gradient": "linear-gradient(135deg, #92400e, #dc2626, #f97316)",
        "video_title": "Goblin Valley: Another Planet",
        "video_text": "Thousands of mushroom-shaped goblins. Completely, utterly strange.",
        "affiliatePicks": [
            {"name": "Goblin Valley State Park Campground", "type": "hotel", "url": f"{BOOKING}&ss=Green+River+UT", "description": "Camping in the park is the best way to experience sunrise and sunset light on the goblins.", "priceRange": "$"},
            {"name": "Slot Canyon Hike Near Goblin Valley", "type": "tour", "url": f"{GYG}&q=Little+Wild+Horse+Canyon+tour", "description": "Guided hike through Little Wild Horse Canyon — a spectacular slot canyon 5 miles away.", "priceRange": "$"},
            {"name": "National Geographic Utah Map", "type": "activity", "url": f"{AMAZON}&k=utah+national+geographic+map", "description": "Maps for the remote canyon country around Goblin Valley.", "priceRange": "$"},
        ],
        "scottTips": {
            "logistics": "Goblin Valley is in the middle of Utah canyon country — make it a stop between Capitol Reef and Moab on a road trip. Little Wild Horse Canyon (5 miles from the park) adds a slot canyon experience to the same day.",
            "bestTime": "April–May and September–October. Summer is extremely hot. The goblins are best photographed in the low, golden light of early morning and late afternoon.",
            "gettingAround": "20-mile paved road from Highway 24. Standard vehicles fine in dry conditions. The valley floor is open to free-roaming among the goblins — there are no marked trails in the main valley.",
            "money": "$20/vehicle day use. Camping is $30–40/night for developed sites. Worth booking the campsite for sunrise light on the formations.",
            "safety": "Summer heat is extreme and the valley is fully exposed — bring more water than you think you need. The remote location means cell service is nonexistent — download offline maps.",
            "packing": "Camera and a playful attitude — the goblins invite climbing (permitted here, unlike national parks). Headlamp if camping.",
            "localCulture": "Goblin Valley has a relatively small footprint of visitors compared to Utah's national parks. It was briefly famous for a viral video of Boy Scout leaders knocking over a goblin formation (they were prosecuted). Leave the formations intact."
        },
    },
    "bear-lake": {
        "title": "Bear Lake",
        "aeo": "Bear Lake is a natural glacial lake on the Utah-Idaho border with impossibly turquoise-blue water — the 'Caribbean of the Rockies.' The color comes from calcium carbonate particles suspended in the water, not algae. It's a summer recreation destination for boating, swimming, and the famous Bear Lake Raspberry Festival in August, located 2 hours from Salt Lake City.",
        "gradient": "linear-gradient(135deg, #0369a1, #0ea5e9, #16a34a)",
        "video_title": "Bear Lake: The Caribbean of the Rockies",
        "video_text": "Turquoise water, raspberry shakes, and summer Utah at its finest.",
        "affiliatePicks": [
            {"name": "Bear Lake Luxury Cabins", "type": "hotel", "url": f"{BOOKING}&ss=Garden+City+UT", "description": "Waterfront cabin rental for the full Bear Lake experience.", "priceRange": "$$$"},
            {"name": "Bear Lake Boat Rental", "type": "activity", "url": f"{GYG}&q=Bear+Lake+boat+rental", "description": "Pontoon boat rental for exploring the lake's turquoise waters.", "priceRange": "$$"},
            {"name": "Bear Lake State Park Marina", "type": "activity", "url": f"{GYG}&q=Bear+Lake+Utah+activities", "description": "Boat launch, equipment rental, and lake access at the state park marina.", "priceRange": "$"},
        ],
        "scottTips": {
            "logistics": "Bear Lake is 2 hours from Salt Lake City via US-89 north. Garden City is the main town on the Utah side. The Idaho side (Montpelier) has additional lodging. Plan as a weekend trip from SLC — one night minimum.",
            "bestTime": "June–August for swimming and boating. The Raspberry Festival in early August is a local institution. Fall is quieter with good hiking in the Bear River Range nearby.",
            "gettingAround": "Car essential — the lake is in a mountain valley with no public transit. Drive the perimeter road for views or park at the state beach for swimming.",
            "money": "$10–15/vehicle for state park beach access. Boat rentals are the big expense — $200–400/day for a pontoon. Raspberry shakes from local stands are a required purchase.",
            "safety": "The lake gets cold despite the summer heat — hypothermia risk in early season. Afternoon thunderstorms are possible in July–August. Life jackets for any water activities.",
            "packing": "Swimwear, towels, sunscreen. Layers for evenings — mountain altitude means cool nights even in August.",
            "localCulture": "The raspberry shake at La Beau's Raspberry Stand in Garden City is iconic and genuinely delicious — a Bear Lake visit is incomplete without one. The town is small and very family-oriented."
        },
    },
    "sundance": {
        "title": "Sundance Mountain Resort",
        "aeo": "Sundance Mountain Resort is Robert Redford's intimate mountain resort in Provo Canyon — a small, carefully curated ski resort and year-round destination centered on art, film, and environmental stewardship. It's the founding home of the Sundance Film Festival (which now runs in Park City) and one of the most distinctive resort experiences in the American West.",
        "gradient": "linear-gradient(135deg, #166534, #1e40af, #92400e)",
        "video_title": "Sundance: Where Art Meets Mountain",
        "video_text": "Robert Redford's vision. A mountain resort unlike any other.",
        "affiliatePicks": [
            {"name": "Sundance Mountain Resort Cottages", "type": "hotel", "url": f"{BOOKING}&ss=Provo+Canyon+UT", "description": "Hand-crafted mountain cottages with wood-burning fireplaces and art throughout.", "priceRange": "$$$"},
            {"name": "Sundance Ski Lesson Package", "type": "activity", "url": f"{GYG}&q=Sundance+Utah+skiing", "description": "Ski lesson packages at Sundance — excellent for intermediate skiers.", "priceRange": "$$"},
            {"name": "Sundance Art Studio Workshop", "type": "activity", "url": f"{GYG}&q=Sundance+Resort+art", "description": "Art studio workshops offered at the resort — weaving, pottery, painting.", "priceRange": "$$"},
        ],
        "scottTips": {
            "logistics": "Sundance is 15 miles north of Provo and 50 miles from SLC. The Provo Canyon drive (US-189) is one of the most beautiful canyon drives in Utah — worth experiencing in any season. The resort is small by comparison to Park City or Snowbird.",
            "bestTime": "December–March for skiing. Summer (June–September) for mountain activities, outdoor concerts, and hiking. The Sundance Film Festival (January) is centered in Park City, not the resort.",
            "gettingAround": "Car essential from SLC or Provo. The resort is compact and walkable once there. No shuttle service from SLC.",
            "money": "Sundance runs on the higher end — cottages start around $250/night. The Foundry Grill restaurant is excellent but pricey. Worth it for the atmosphere and experience.",
            "safety": "Standard mountain skiing safety. Sundance has some challenging terrain but is primarily intermediate — good for families.",
            "packing": "Layers for mountain conditions. The resort's art-focused environment rewards a camera. Casual mountain dress is the norm.",
            "localCulture": "The Robert Redford environmental and artistic philosophy permeates every aspect of the resort. Locally sourced food at the Foundry Grill, native art throughout the buildings, low-impact design choices. It's a genuine vision rather than marketing."
        },
    },
    "ogden": {
        "title": "Ogden",
        "aeo": "Ogden is Utah's adventure-oriented mountain city — a gritty, historic railroad town north of Salt Lake City with three ski resorts (Snowbasin, Powder Mountain, Nordic Valley) within 20 miles, legendary mountain bike trails, and a revitalized 25th Street district that's one of the best restaurant and bar scenes in Utah outside of SLC.",
        "gradient": "linear-gradient(135deg, #1e40af, #166534, #dc2626)",
        "video_title": "Ogden: Utah's Adventure City",
        "video_text": "Three ski resorts, trail systems, and a railroad town reborn.",
        "affiliatePicks": [
            {"name": "Marriott Ogden", "type": "hotel", "url": f"{BOOKING}&ss=Ogden+UT", "description": "Central downtown Ogden hotel, walkable to 25th Street dining and Union Station.", "priceRange": "$$"},
            {"name": "Snowbasin Ski Lift Tickets", "type": "activity", "url": f"{GYG}&q=Snowbasin+ski+resort", "description": "Snowbasin hosted the 2002 Olympic downhill — world-class skiing with no crowds.", "priceRange": "$$$"},
            {"name": "Ogden Trails Mountain Biking", "type": "activity", "url": f"{GYG}&q=Ogden+Utah+mountain+biking", "description": "Guided mountain biking on Ogden's Weber County trail network.", "priceRange": "$$"},
        ],
        "scottTips": {
            "logistics": "Ogden is 35 miles north of Salt Lake City — an easy drive or TRAX/FrontRunner connection. Its ski resorts (especially Snowbasin) are consistently under-visited compared to SLC's Cottonwood Canyon options. Snowbasin hosted 2002 Olympic downhill and has world-class terrain with no lift lines.",
            "bestTime": "December–March for skiing. June–October for mountain biking (the Bonneville Shoreline Trail and Wheeler Creek Trail are both excellent). September–October for fall color in Ogden Canyon.",
            "gettingAround": "FrontRunner commuter rail from SLC to Ogden. Car for ski resorts and trails. Ogden River Parkway is bikeable through town.",
            "money": "Significantly cheaper than Park City — hotels run $100–160/night, restaurants are more affordable than SLC. Snowbasin lift tickets are comparable to other Utah resorts.",
            "safety": "Mountain roads to Powder Mountain can be treacherous in storms — carry chains in winter. Ogden's city center has improved significantly but some areas still warrant awareness after dark.",
            "packing": "Full winter gear for ski season. Mountain bike if you have one — Ogden's trails are legitimately excellent. Day pack for canyon hiking.",
            "localCulture": "Ogden has a genuine working-class Utah identity that's distinct from the SLC tech scene or Park City luxury resort vibe. 25th Street has excellent craft cocktail bars, Mexican food, and breweries. Union Station is worth an hour — it's a gorgeous historic building with multiple small museums."
        },
    },
    "provo": {
        "title": "Provo",
        "aeo": "Provo is Utah's third-largest city and home to Brigham Young University — a deeply LDS-influenced college town in the Utah Valley with the stunning Wasatch Range as its immediate backdrop, Provo Canyon and Sundance Resort 15 miles east, and Utah Lake to the west. It's less tourist-oriented than SLC or Park City, but the canyon access is exceptional.",
        "gradient": "linear-gradient(135deg, #1e40af, #0369a1, #166534)",
        "video_title": "Provo: Canyon Country College Town",
        "video_text": "Wasatch Range access, Provo Canyon, and a university city that surprises.",
        "affiliatePicks": [
            {"name": "Provo Marriott Hotel and Conference Center", "type": "hotel", "url": f"{BOOKING}&ss=Provo+UT", "description": "Central downtown Provo, walkable to Center Street dining.", "priceRange": "$$"},
            {"name": "Provo Canyon and Sundance Day Tour", "type": "tour", "url": f"{GYG}&q=Provo+Canyon+tour", "description": "Guided Provo Canyon tour including Bridal Veil Falls and Sundance Resort area.", "priceRange": "$"},
            {"name": "Timpanogos Cave National Monument Tour", "type": "activity", "url": f"{GYG}&q=Timpanogos+Cave", "description": "Guided cave tour in American Fork Canyon — spectacular helictite formations.", "priceRange": "$"},
        ],
        "scottTips": {
            "logistics": "Provo is 45 miles south of SLC and a viable base for central Utah — close to Sundance, Timpanogos Cave, Provo Canyon, and driving distance to Bryce Canyon and Capitol Reef. BYU campus is worth walking — it's beautiful and well-maintained.",
            "bestTime": "April–October for canyon hiking and outdoor activities. December–March for Sundance skiing. BYU football season in fall adds energy to the city.",
            "gettingAround": "FrontRunner from SLC to Provo. Car for canyons and Sundance. Provo is more spread out than SLC.",
            "money": "Provo is budget-friendly by Utah standards — hotel rates are lower than SLC, restaurants cater to a student budget. Good value base city.",
            "safety": "Provo Canyon (US-189) is a well-traveled but narrow mountain highway — drive carefully especially in winter. Avalanche risk on backcountry routes above the canyon.",
            "packing": "Hiking gear for canyon access. Layers for mountain conditions.",
            "localCulture": "BYU culture strongly influences Provo — the city is conservative, deeply LDS, and alcohol is harder to find than in SLC (fewer bars, state liquor stores only). The 2.0 beer sold in grocery stores is the local workaround. Respectful of the culture; don't lead with expectations of a nightlife scene."
        },
    },
}

def build_destination(slug, data):
    """Build a complete destination .md file."""
    affiliatePicks_yaml = ""
    for pick in data.get("affiliatePicks", []):
        affiliatePicks_yaml += f"""  - name: "{pick['name']}"
    type: {pick['type']}
    url: "{pick['url']}"
    description: "{pick['description']}"
    priceRange: "{pick['priceRange']}"
"""

    scottTips = data.get("scottTips", {})

    video_block = f"""<div class="immersive-break-inline">
  <video autoplay muted loop playsinline preload="metadata">
    <source src="/videos/destinations/{slug}-hero.mp4" type="video/mp4" />
  </video>
  <div class="ib-gradient" style="background: {data['gradient']};"></div>
  <div class="ib-content">
    <div class="ib-title">{data['video_title']}</div>
    <p class="ib-text">{data['video_text']}</p>
  </div>
</div>"""

    return None, affiliatePicks_yaml, scottTips, video_block, data.get("aeo", "")


def process_existing_file(filepath, slug, data):
    """Add affiliatePicks, scottTips, immersive-break-inline, and AEO to an existing file."""
    content = open(filepath, 'r', encoding='utf-8').read()

    # Replace empty affiliatePicks: []
    affiliatePicks_yaml = "affiliatePicks:\n"
    for pick in data.get("affiliatePicks", []):
        affiliatePicks_yaml += f"""  - name: "{pick['name']}"
    type: {pick['type']}
    url: "{pick['url']}"
    description: "{pick['description']}"
    priceRange: "{pick['priceRange']}"
"""

    if "affiliatePicks: []" in content:
        content = content.replace("affiliatePicks: []", affiliatePicks_yaml.rstrip())

    # Add scottTips before lastVerified
    scottTips = data.get("scottTips", {})
    if "scottTips:" not in content and "lastVerified:" in content:
        scottTips_yaml = f"""scottTips:
  logistics: "{scottTips.get('logistics', '').replace('"', "'")}"
  bestTime: "{scottTips.get('bestTime', '').replace('"', "'")}"
  gettingAround: "{scottTips.get('gettingAround', '').replace('"', "'")}"
  money: "{scottTips.get('money', '').replace('"', "'")}"
  safety: "{scottTips.get('safety', '').replace('"', "'")}"
  packing: "{scottTips.get('packing', '').replace('"', "'")}"
  localCulture: "{scottTips.get('localCulture', '').replace('"', "'")}"
"""
        content = content.replace("lastVerified:", scottTips_yaml + "lastVerified:")

    # Add immersive-break-inline after first paragraph in body
    if "immersive-break-inline" not in content:
        video_block = f"""<div class="immersive-break-inline">
  <video autoplay muted loop playsinline preload="metadata">
    <source src="/videos/destinations/{slug}-hero.mp4" type="video/mp4" />
  </video>
  <div class="ib-gradient" style="background: {data['gradient']};"></div>
  <div class="ib-content">
    <div class="ib-title">{data['video_title']}</div>
    <p class="ib-text">{data['video_text']}</p>
  </div>
</div>

"""
        # Find the body (after last ---)
        lines = content.split('\n')
        fm_end = -1
        fm_count = 0
        for i, line in enumerate(lines):
            if line.strip() == '---':
                fm_count += 1
                if fm_count == 2:
                    fm_end = i
                    break

        if fm_end >= 0:
            # Find first blank line after fm_end to detect end of first paragraph
            body_lines = lines[fm_end+1:]
            first_para_end = -1
            in_para = False
            for j, bl in enumerate(body_lines):
                if bl.strip() and not in_para:
                    in_para = True
                elif not bl.strip() and in_para:
                    first_para_end = j
                    break

            if first_para_end >= 0:
                aeo_text = data.get("aeo", "")
                new_body_lines = []
                if aeo_text:
                    new_body_lines.append(aeo_text)
                    new_body_lines.append("")
                new_body_lines.extend(body_lines[:first_para_end])
                new_body_lines.append("")
                new_body_lines.append(video_block.rstrip())
                new_body_lines.append("")
                new_body_lines.extend(body_lines[first_para_end:])
                content = '\n'.join(lines[:fm_end+1]) + '\n' + '\n'.join(new_body_lines)

    open(filepath, 'w', encoding='utf-8').write(content)
    print(f"Done {slug}")


def build_stub_destination(slug, data):
    """Build full file content for stub destinations (ogden, park-city, provo)."""
    scottTips = data.get("scottTips", {})
    affiliatePicks_yaml = ""
    for pick in data.get("affiliatePicks", []):
        affiliatePicks_yaml += f"""  - name: "{pick['name']}"
    type: {pick['type']}
    url: "{pick['url']}"
    description: "{pick['description']}"
    priceRange: "{pick['priceRange']}"
"""

    return f"""---
title: "{data['title']}"
description: "{data.get('description', data['title'] + ' travel guide 2026.')}"
heroVideo: ""
heroImage: ""
tagline: "{data.get('tagline', '')}"
region: {data.get('region', 'utah')}
bestMonths: {data.get('bestMonths', '[April, May, September, October]')}
budgetPerDay:
  backpacker: {data.get('budget_backpacker', 60)}
  midRange: {data.get('budget_midrange', 180)}
  luxury: {data.get('budget_luxury', 400)}
gettingThere: "{data.get('gettingThere', '')}"
faqItems:
{data.get('faqItems_yaml', '  - question: "When is the best time to visit?"\n    answer: "Spring and fall offer the most comfortable temperatures for outdoor activities."')}
affiliatePicks:
{affiliatePicks_yaml.rstrip()}
scottTips:
  logistics: "{scottTips.get('logistics', '').replace('"', "'")}"
  bestTime: "{scottTips.get('bestTime', '').replace('"', "'")}"
  gettingAround: "{scottTips.get('gettingAround', '').replace('"', "'")}"
  money: "{scottTips.get('money', '').replace('"', "'")}"
  safety: "{scottTips.get('safety', '').replace('"', "'")}"
  packing: "{scottTips.get('packing', '').replace('"', "'")}"
  localCulture: "{scottTips.get('localCulture', '').replace('"', "'")}"
lastVerified: 2026-03-08
contentStatus: published
draft: false
---

{data.get('aeo', '')}

<div class="immersive-break-inline">
  <video autoplay muted loop playsinline preload="metadata">
    <source src="/videos/destinations/{slug}-hero.mp4" type="video/mp4" />
  </video>
  <div class="ib-gradient" style="background: {data['gradient']};"></div>
  <div class="ib-content">
    <div class="ib-title">{data['video_title']}</div>
    <p class="ib-text">{data['video_text']}</p>
  </div>
</div>

{data.get('body', '')}
"""


# Stub destinations that need full rewrites
STUBS = {
    "ogden": {
        **DESTINATIONS["ogden"],
        "description": "Ogden travel guide 2026 — gritty mountain town with historic 25th Street, three ski resorts (Snowbasin, Powder Mountain, Nordic Valley), and legendary mountain bike trails near Salt Lake City.",
        "tagline": "Utah's adventure capital",
        "region": "wasatch-front",
        "bestMonths": "[December, January, February, March, June, July, August, September]",
        "budget_backpacker": 50,
        "budget_midrange": 150,
        "budget_luxury": 350,
        "gettingThere": "35 miles north of Salt Lake City via I-15. FrontRunner commuter rail runs between SLC and Ogden. Salt Lake International Airport is the nearest major airport (45 minutes).",
        "faqItems_yaml": """  - question: "Which ski resort is best near Ogden?"
    answer: "Snowbasin for terrain quality and no crowds (it hosted the 2002 Olympic downhill). Powder Mountain for sheer acreage and powder skiing. Nordic Valley for budget-friendly family skiing."
  - question: "Is Ogden worth visiting beyond skiing?"
    answer: "Yes — the 25th Street dining scene is excellent, the Weber County trail system is among the best mountain biking in Utah, and Ogden Canyon provides quick access to hiking, waterfalls, and fall foliage."
  - question: "How does Ogden compare to Park City?"
    answer: "Ogden is rawer, cheaper, and less polished than Park City. It has a genuine working-class Utah identity that some travelers find more authentic. The skiing (Snowbasin in particular) rivals Park City Mountain but without the resort prices."
  - question: "Can I day trip Ogden from Salt Lake City?"
    answer: "Absolutely — 35 miles via I-15, and FrontRunner runs direct. A day trip covers 25th Street, Union Station, and a drive up Ogden Canyon."
  - question: "When does Snowbasin open?"
    answer: "Snowbasin typically opens in mid-November and closes in late April, conditions permitting. It hosted the 2002 Salt Lake Olympics downhill and super-G events."
  - question: "What is 25th Street?"
    answer: "Historic 25th Street is Ogden's main restaurant and bar district — a revitalized 19th-century commercial street with craft cocktail bars, breweries, excellent Mexican food, and the weekend farmers market."
  - question: "Is Ogden safe?"
    answer: "Ogden's downtown and 25th Street area are safe and active. Some neighborhoods away from the center have higher crime rates. Standard urban awareness applies."
  - question: "What is Ogden's weather like?"
    answer: "Valley temperatures are milder than mountain resorts — winters are cold (20s–40s°F) but not extreme, summers are hot (90s°F). The canyon resorts above are significantly colder and snowier." """,
        "body": """## Ogden's Revival

Ogden spent decades as Utah's forgotten city — overshadowed by Salt Lake City 35 miles south and overlooked by tourists heading for Park City's gloss. That's changing. The 25th Street renaissance brought craft cocktail bars, serious restaurants, and weekend farmers markets to what was once a rough railroad district. The mountain biking trails above town became nationally recognized. Snowbasin — which hosted the 2002 Olympic downhill and super-G events — remains one of the least-crowded world-class ski resorts in the country.

Ogden has a character that Park City simply doesn't. It's a real city with a working history, not a purpose-built resort town. That identity makes it worth a closer look.

## Skiing: Three Resorts, One Canyon

**Snowbasin** (27 miles northeast) is the marquee resort — 3,000 acres, over 3,000 feet of vertical, and the Olympic downhill course that showed the world what Utah skiing looks like. On a powder day, Snowbasin has no lift lines and no crowds. Mid-week in January, you can ski entire runs without seeing another person. This is the best-kept secret in Utah skiing.

**Powder Mountain** (26 miles northeast) is the largest ski resort in the US by acreage — 8,464 skiable acres, though only half is lift-served. It's deliberately low-key, capped at daily ticket sales, and beloved by serious skiers who want powder without the crowds.

**Nordic Valley** is the family resort — smaller, cheaper, excellent for lessons and beginners.

## Mountain Biking: The Real Obsession

Ask Ogden locals what they're most proud of and the answer is increasingly the trail system. The Weber County trail network has earned national recognition for its combination of technical singletrack, canyon riding, and ridgeline access.

**The Bonneville Shoreline Trail** runs 120+ miles along the ancient lakeshore — sections around Ogden offer stunning views of the valley. **Wheeler Creek Trail** and the **North Ogden Divide** are local favorites for fitness rides. The **Ogden Canyon** itself has trail access.

Mountain bike rentals are available from several shops downtown.

## 25th Street and Downtown

Historic 25th Street is Ogden's social spine. In the morning: coffee shops and the Saturday farmers market. In the afternoon: Union Station (the beautifully restored railroad depot housing multiple small museums — worth an hour). In the evening: serious restaurants and the bar scene.

**Eating:** Slackwater Pub for pizza and beer. John Merrill's Tavern for cocktails. Roosters Brewing Company for locally brewed.

**Union Station** houses four small museums in a stunning 1924 Beaux-Arts building: Browning Firearms Museum, Natural History Museum of Utah satellite, Utah State Railroad Museum, and the Browning-Kimball Classic Car collection.

## Ogden Canyon

The canyon drive up Highway 39 to Causey Reservoir (30 miles) is one of Utah's most scenic non-national-park drives. In fall, the aspens turn gold from the canyon walls. Pineview Reservoir at the canyon's entrance provides summer boating and camping.

## Day Trip: Antelope Island

Antelope Island State Park (40 miles southwest via I-15 and the causeway) is an easy Ogden day trip — bison herds, Great Salt Lake shore, and dramatic views without the national park crowds.""",
    },
    "park-city": {
        **DESTINATIONS["park-city"],
        "description": "Park City travel guide 2026 — world-class skiing at two resorts (now connected as PCMR), Sundance Film Festival, historic Main Street, and year-round mountain adventures just 35 miles from Salt Lake City.",
        "tagline": "Where Hollywood meets the slopes",
        "region": "wasatch-front",
        "bestMonths": "[December, January, February, March, June, July, August, September]",
        "budget_backpacker": 80,
        "budget_midrange": 250,
        "budget_luxury": 600,
        "gettingThere": "35 miles from Salt Lake City International Airport via I-80 (35-minute drive). Park City Transportation provides airport shuttles. Car recommended; limited bus service from SLC.",
        "faqItems_yaml": """  - question: "What's the difference between Park City Mountain and Deer Valley?"
    answer: "Park City Mountain (PCMR) is the larger resort — open to both skiers and snowboarders, with over 7,300 acres now connected to Canyons Village. Deer Valley is skiers-only, meticulously groomed, with a luxury-resort experience and valet parking. Both are excellent; Deer Valley costs more and has smaller crowds."
  - question: "Is Park City worth visiting in summer?"
    answer: "Yes — the gondola runs at Park City Mountain for mountain biking and hiking, Main Street has excellent dining year-round, and the surrounding Wasatch Range trails are spectacular. Fewer crowds than ski season and significantly better room rates."
  - question: "When is the Sundance Film Festival?"
    answer: "The Sundance Film Festival runs for 10 days in late January, centered in Park City. If you want to attend screenings, purchase tickets months in advance through sundance.org. The festival transforms the town — Main Street becomes a celebrity and industry hub."
  - question: "Do I need a car in Park City?"
    answer: "Not necessarily — Park City Transit buses are free and cover the major destinations (Main Street, PCMR, Deer Valley, Canyons). From SLC, there are shuttle services. But a car gives you more flexibility, especially for Deer Valley and backcountry areas."
  - question: "How expensive is Park City?"
    answer: "Very. Peak ski season lodging runs $300–600+/night for quality options. Deer Valley lift tickets are $200+/day. Main Street restaurants average $60–100/person for dinner. Budget accordingly and consider staying in SLC and day-tripping to ski."
  - question: "Is Park City good for families?"
    answer: "Excellent. Both PCMR and Deer Valley have strong ski school programs. Main Street is walkable and family-friendly. The Utah Olympic Park (site of 2002 bobsled and ski jump events) is a great family activity."
  - question: "What is the Utah Olympic Park?"
    answer: "The Utah Olympic Park near Park City preserves the 2002 Winter Olympics ski jumping, freestyle skiing, and bobsled facilities. Visitors can watch athletes train, take bobsled rides, and tour the facilities. Free to visit."
  - question: "What should I eat in Park City?"
    answer: "Main Street has excellent dining. Riverhorse on Main for upscale American. High West Distillery for whiskey and elevated bar food in a historic saloon. Handle for chef-driven cuisine. Maxwell's East Coast Eatery for casual. Reserve dinner in advance during ski season."  """,
        "body": """## Park City's Unlikely History

Park City began as a silver mining boomtown in the 1860s — one of the richest silver deposits in the American West. By the 1950s, the mines had closed and the town was in decline. The Park City ski resort opened in 1963, and within a decade, the abandoned mining town had become one of America's most desirable mountain destinations.

The 2002 Winter Olympics cemented Park City's international profile. The Utah Olympic Park preserves the ski jump and bobsled facilities from those games, and Park City Mountain has operated ever since as a major destination resort. Today, the merger of Park City Mountain Resort and Canyons Village into what's marketed as PCMR has created the largest ski resort in the United States by acreage.

## Skiing: Two World-Class Options

**Park City Mountain Resort (PCMR)** — 7,300+ acres spanning what were formerly two separate resorts (Park City Mountain and Canyons Village), connected by an inter-mountain gondola. The terrain ranges from wide beginner cruisers to serious expert terrain in the Canyons section. Snowboarders welcome.

**Deer Valley** — Skiers only. Every run is groomed. Ski valets carry your equipment to the lift. The lodges are elegant. The service is impeccable. Deer Valley is not trying to be a big-mountain adventure resort — it's trying to be the most civilized skiing experience you've ever had, and it succeeds. Worth one day even if you ski other places the rest of your trip.

## Historic Main Street

Park City's Main Street runs along the original downtown from the mining era. Today it's a mile of galleries, restaurants, bars, and boutiques in preserved 19th-century storefronts.

**What to prioritize on Main Street:**
- **High West Distillery** — Utah's first craft distillery, in a stunning historic building. The whiskey is genuinely excellent. The food (après-ski charcuterie, elevated bar bites) is better than most resort-town bars.
- **Riverhorse on Main** — The landmark fine-dining restaurant. Splurge dinner when you want something exceptional.
- **Park City Museum** — Small but excellent local history museum in the historic jail and city hall building. Worth an hour to understand the mining era context.

## Sundance Film Festival

For 10 days each January, Park City becomes the center of the independent film world. Robert Redford's organization — founded at Sundance Mountain Resort in Provo Canyon — moved the festival to Park City years ago, where the infrastructure could handle the crowds.

Attending Sundance is possible: buy tickets months in advance at sundance.org. Screenings are at theaters throughout Park City. Celebrity sightings on Main Street are common during the festival period. Hotel rates during Sundance are among the highest of the year.

## Beyond Skiing

**Utah Olympic Park** — The 2002 Winter Olympics legacy facility 3 miles from downtown. Watch ski jumpers and freestyle skiers train. Take the bobsled experience if you're adventurous. The museum is excellent. Free entry to the facility.

**Swaner Nature Preserve** — 1,200 acres of wetlands and upland habitat at the base of the Wasatch Range. Excellent birdwatching and snowshoeing in winter, hiking and wildlife photography in summer. Free.

**Summer:** When the snow melts, Park City is an excellent mountain biking and hiking destination. The PCMR gondola runs in summer, giving access to trail networks without the ski season prices. Main Street retains its excellent dining and gallery scene year-round.""",
    },
    "provo": {
        **DESTINATIONS["provo"],
        "description": "Provo travel guide 2026 — Utah's college town at the foot of the Wasatch Range, gateway to Provo Canyon, Sundance Resort, and Timpanogos Cave, with surprising dining for its size and strong Wasatch mountain access.",
        "tagline": "Canyon country at the edge of the valley",
        "region": "utah-valley",
        "bestMonths": "[April, May, June, September, October, November]",
        "budget_backpacker": 45,
        "budget_midrange": 150,
        "budget_luxury": 350,
        "gettingThere": "45 miles south of Salt Lake City via I-15. FrontRunner commuter rail connects SLC and Provo in 45 minutes. Provo Airport has limited flights; SLC is the main air gateway.",
        "faqItems_yaml": """  - question: "What is Provo Canyon?"
    answer: "Provo Canyon (US-189) is a dramatic mountain canyon east of Provo with the Provo River flowing through it, Bridal Veil Falls (a roadside stop), access to Sundance Mountain Resort, and Deer Creek Reservoir. It's one of the most scenic drives in Utah's Wasatch Front."
  - question: "Is Provo worth visiting for tourists?"
    answer: "Yes, with the right expectations. Provo itself has limited tourist infrastructure but excellent canyon access — Sundance Resort (15 miles), Timpanogos Cave National Monument (American Fork Canyon), and hiking in the Wasatch Range are all exceptional. It's a good base for central Utah exploration."
  - question: "What is Timpanogos Cave National Monument?"
    answer: "Timpanogos Cave is a system of three caverns in American Fork Canyon (near Provo) with spectacular helictite formations — unusual cave formations that grow sideways and in spirals. The cave tour requires a strenuous 1.5-mile trail hike uphill to the entrance. Reserve tickets in advance in summer."
  - question: "How is Provo different from Salt Lake City?"
    answer: "Provo is smaller (115,000 people), more strongly LDS-influenced, and home to BYU. The dining scene is improving but smaller than SLC. The mountain access is arguably better — Provo Canyon and Sundance are closer. It's a more affordable, less cosmopolitan base."
  - question: "Can I ski near Provo?"
    answer: "Sundance Mountain Resort is 15 miles east via Provo Canyon — small, intimate, and beautiful. For larger resort skiing, Deer Valley and Park City are 45 minutes north, and Alta/Snowbird are an hour north via SLC."
  - question: "What is BYU worth visiting?"
    answer: "The Brigham Young University campus is beautiful and walkable. The BYU Museum of Art has surprisingly strong collections. The campus events (concerts, games, performances) are open to the public. Worth a 2-hour walk if you're interested in the culture."
  - question: "What are the best hikes near Provo?"
    answer: "Timp trail (to Mount Timpanogos summit — strenuous), Stewart Falls trail (4.7 miles RT from Sundance to a beautiful waterfall), and the Rock Canyon trail system above the BYU campus. All are accessible from Provo without driving far."
  - question: "What should I eat in Provo?"
    answer: "Communal Restaurant on Center Street for farm-to-table Utah cooking. Guru's Cafe for healthy international cuisine. Station 22 Cafe for breakfast. The student population has driven more diverse and affordable dining than you'd expect."  """,
        "body": """## Provo's Underrated Position

Provo doesn't get the visitors it deserves because it lacks the obvious tourist identity — not a ski resort town, not a national park gateway (though it's closer than you'd think), not a buzzy food destination. What it is: a college town at the base of the Wasatch Range with exceptional canyon access and strong proximity to some of the best outdoor recreation in Utah.

The BYU influence shapes everything — the city is conservative, mostly dry (state liquor stores only, relatively few bars), and deeply family-oriented. For visitors who aren't part of that culture, it requires modest adjustment in expectations. For everyone, the canyons are the point.

## Provo Canyon

Highway 189 east from Provo enters Provo Canyon within minutes of downtown. This is not a scenic overlook — it's a full mountain canyon with the Provo River running through it, cottonwoods turning gold in fall, and Sundance Mountain Resort at its far end.

**Bridal Veil Falls** is 2 miles in — a roadside parking area with a short walk to a double-tiered 607-foot waterfall. Excellent in spring when snowmelt is at full flow.

**Deer Creek Reservoir** (10 miles) is a popular boating and fishing lake backed by the Wasatch Range.

**Sundance Mountain Resort** (15 miles) is the final stop — Robert Redford's intimate mountain resort with skiing, art studios, and the excellent Foundry Grill restaurant.

## Timpanogos Cave National Monument

American Fork Canyon (15 miles north of Provo) leads to one of Utah's most underrated experiences. Timpanogos Cave is a three-cavern system with helictite formations — cave deposits that grow sideways and in spiraling shapes that defy gravity. The geology is genuinely unusual and beautiful.

The catch: you hike 1.5 miles uphill on a paved trail (1,065 feet of elevation gain) to reach the cave entrance. Guided tours only inside the cave. Reserve tickets online — summer tours sell out days in advance. Allow 3-4 hours total.

**Practical:** Timpanogos Cave is closed November through May. Bring layers even in summer — the cave is a constant 45°F.

## Hiking the Wasatch

Provo's position at the base of the Wasatch gives it immediate trail access:

**Rock Canyon** — Trailhead behind the BYU campus. 5+ miles of canyon hiking with good views back over the valley. Best done in morning to avoid afternoon heat in summer.

**Stewart Falls** — 4.7 miles round trip from Sundance Resort to a 200-foot waterfall. One of the best waterfall hikes in the Wasatch.

**Mount Timpanogos** — For the ambitious: a 15-mile round trip to the summit at 11,752 feet. One of the most popular high-elevation hikes in Utah. Long and strenuous but not technical. Start before dawn in summer.

## BYU Campus

Even non-Mormon visitors find the BYU campus worth an hour. The grounds are impeccably maintained, the architecture ranges from interesting to spectacular (the Marriott Center is enormous), and the BYU Museum of Art has genuine quality — the Carl Bloch religious painting collection is particularly notable.

BYU is free and open to the public. The university bookstore is enormous and worth browsing. Sporting events (football, basketball) are open to general admission purchase.""",
    },
}


for slug, data in STUBS.items():
    filepath = f"{BASE}/{slug}.md"
    if not os.path.exists(filepath):
        print(f"SKIP {slug} — not found")
        continue
    content = open(filepath, 'r', encoding='utf-8').read()
    if "affiliatePicks" in content and "affiliatePicks: []" not in content:
        print(f"SKIP {slug} — already has Tier 3")
        continue
    new_content = build_stub_destination(slug, data)
    open(filepath, 'w', encoding='utf-8').write(new_content)
    print(f"Done stub {slug}")

# Process existing files that already have some Tier 3 structure
EXISTING_SLUGS = [s for s in DESTINATIONS.keys() if s not in STUBS]
for slug in EXISTING_SLUGS:
    filepath = f"{BASE}/{slug}.md"
    if not os.path.exists(filepath):
        print(f"SKIP {slug} — not found")
        continue
    process_existing_file(filepath, slug, DESTINATIONS[slug])

print("Utah Tier 3 complete")
