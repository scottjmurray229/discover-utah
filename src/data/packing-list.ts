import type { PackingItem, PackingConfig, GearRecommendation } from './packing-base';

export const UTAH_ESSENTIALS: PackingItem[] = [
  { id: 'ut-layers', name: 'Layering System (Base + Mid + Shell)', category: 'destination', description: 'Utah weather is extreme and unpredictable. Moab can be 95°F at noon and 45°F at midnight. Zion Narrows requires wetsuits in spring. Bryce Canyon hits below freezing year-round above the rim. A three-layer system covers all of it.', essential: true, amazonSearchFallback: 'layering+system+hiking+base+mid+shell', affiliatePrice: '$60–150' },
  { id: 'ut-sun', name: 'SPF 50+ Sunscreen + UV Sunglasses', category: 'destination', description: 'Utah is a high-altitude desert — Bryce Canyon sits at 8,000 ft where UV radiation is 25% more intense than at sea level. The red rock reflects UV. Reapply every 90 minutes on canyon hikes.', essential: true, amazonSearchFallback: 'sunscreen+spf+50+sport+water+resistant', affiliatePrice: '$15–30' },
  { id: 'ut-water', name: 'Large Hydration Pack or Water Bottles', category: 'destination', description: 'Dehydration is the #1 reason for park rescues in Utah. The Angels Landing and Havasupai trails have no water sources mid-route. Carry 3–4 liters minimum for desert day hikes in summer. A hydration bladder is more practical than bottles on technical terrain.', essential: true, amazonSearchFallback: 'hydration+pack+backpack+3+liter+hiking', affiliatePrice: '$35–75' },
  { id: 'ut-boots', name: 'Waterproof Hiking Boots', category: 'destination', description: 'Zion Narrows requires wading ankle-to-chest-deep water. Canyonlands and Arches have sharp sandstone scrambling. Waterproof boots protect against both — cheaper to buy before the trip than to ruin trail runners in the Virgin River.', essential: true, amazonSearchFallback: 'waterproof+hiking+boots+ankle+support', affiliatePrice: '$100–180' },
];

export const UTAH_GEAR_RECOMMENDATIONS: GearRecommendation[] = [
  { id: 'gr-ut-pack', name: 'Hydration Backpack (3L)', reason: 'Utah park rescues are overwhelmingly dehydration cases. No water sources mid-trail in Arches, Canyonlands, or Angels Landing. A hands-free hydration pack solves this — you drink more when you do not have to stop.', amazonSearchFallback: 'hydration+backpack+3+liter+hiking+reservoir', affiliatePrice: '~$55' },
  { id: 'gr-ut-boots', name: 'Waterproof Hiking Boots', reason: 'Zion Narrows wading, Canyonlands slickrock scrambling, and Bryce Canyon snow (year-round above the rim) all require waterproof ankle support. Trail runners get destroyed in the Virgin River in an afternoon.', amazonSearchFallback: 'waterproof+hiking+boots+ankle+support+trail', affiliatePrice: '~$140' },
  { id: 'gr-ut-poles', name: 'Trekking Poles', reason: 'Angels Landing chain section, Zion Narrows wading, and steep Bryce Canyon switchbacks are all significantly safer and easier with poles. Collapsible poles pack flat — bring them even if you think you do not need them.', amazonSearchFallback: 'trekking+poles+collapsible+lightweight+hiking', affiliatePrice: '~$55' },
  { id: 'gr-ut-shell', name: 'Waterproof Shell Jacket', reason: 'Utah afternoon thunderstorms materialize in minutes from clear sky in summer. The red rock becomes dangerously slick when wet. A packable waterproof shell weighs nothing and could prevent a serious fall.', amazonSearchFallback: 'waterproof+shell+jacket+packable+rain', affiliatePrice: '~$80' },
  { id: 'gr-ut-sun', name: 'Wide-Brim Sun Hat + UV Sunglasses', reason: 'Bryce Canyon sits at 8,000 ft where UV is 25% stronger than at sea level. The red sandstone reflects light from below as well as above. A wide-brim hat is sun protection from all angles on exposed canyon rims.', amazonSearchFallback: 'wide+brim+sun+hat+upf+outdoor+hiking', affiliatePrice: '~$35' },
];

export const UTAH_CONFIG: PackingConfig = {
  sitePrefix: 'dut',
  destination: 'Utah',
  climate: ['desert', 'alpine'],
  currency: 'USD',
  plugType: 'Type A/B',
  plugVoltage: '120V',
  affiliateTag: 'discoverphili-20',
  destinationEssentials: UTAH_ESSENTIALS,
  gearRecommendations: UTAH_GEAR_RECOMMENDATIONS,
};

export const SITE_CONFIG = UTAH_CONFIG;

export const UTAH_PACKING_FAQS = [
  { question: 'What should I pack for Utah national parks?', answer: 'The Utah essentials: a hydration pack or large water bottles (dehydration causes more park rescues than anything else), waterproof hiking boots (Zion Narrows requires wading), a layering system for 50-degree temperature swings, and SPF 50 sunscreen (high-altitude desert UV is brutal). Trekking poles are highly recommended for Angels Landing and Bryce Canyon switchbacks.' },
  { question: 'What should I pack for Zion Narrows?', answer: 'The Narrows requires: neoprene socks (rented from Zion Outfitter for $5–10), a sturdy walking stick or trekking poles, waterproof boots or canyoneering shoes, and quick-dry clothing. In spring (March–May), water temperatures are 45–55°F — a wetsuit is essential and can be rented in Springdale. Always check flash flood warnings before entering.' },
  { question: 'What power adapter do I need for Utah?', answer: 'No adapter needed — Utah uses standard US Type A/B plugs at 120V/60Hz. Everything works as-is.' },
  { question: 'What should I wear in Utah in summer?', answer: 'Lightweight, moisture-wicking layers. Morning hikes start at 50–60°F in the canyons; afternoon heat in Moab and the canyon floors hits 95–100°F. Quick-dry shirts, convertible pants, a hat, and UV sunglasses are the summer uniform. Always carry a light layer — temperatures drop fast once you leave direct sun.' },
  { question: 'What should I pack for Bryce Canyon?', answer: 'Bryce Canyon sits at 8,000–9,000 ft elevation and is cold year-round. Even in July, nights drop to 35–45°F. Pack a warm mid-layer (fleece or down), a waterproof shell, and microspikes or traction devices if visiting October–May. The hoodoos are worth the cold — sunrise from Sunrise Point is one of the best experiences in the American West.' },
  { question: 'What should I NOT pack for Utah?', answer: 'Skip cotton clothing (holds moisture, causes hypothermia when wet — deadly in canyon slot hikes), flip-flops for hiking (wrong footwear for every Utah trail), and underestimating water needs — a liter per hour minimum in summer desert heat. Also skip arrival without a permit reservation — Angels Landing, The Wave, and Coyote Gulch all require advance booking.' },
];
