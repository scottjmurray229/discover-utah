// Popular Utah POI coordinates for itinerary geocoding.
// Keyed by lowercase normalized name. Covers top attractions at launch destinations.
// Used by generate-itinerary.ts to resolve activity coordinates without Geocoding API calls.

export const LANDMARK_COORDS: Record<string, { lat: number; lng: number }> = {
  // ── Salt Lake City ──
  'temple square': { lat: 40.7706, lng: -111.8916 },
  'utah state capitol': { lat: 40.7776, lng: -111.8882 },
  'natural history museum of utah': { lat: 40.7632, lng: -111.8235 },
  'liberty park': { lat: 40.7447, lng: -111.8755 },
  'red butte garden': { lat: 40.7666, lng: -111.8260 },
  'great salt lake': { lat: 41.1700, lng: -112.5150 },
  'city creek center': { lat: 40.7691, lng: -111.8918 },
  'the gateway': { lat: 40.7699, lng: -111.9031 },
  'tracy aviary': { lat: 40.7427, lng: -111.8777 },
  'hogle zoo': { lat: 40.7502, lng: -111.8137 },
  'this is the place heritage park': { lat: 40.7521, lng: -111.8062 },

  // ── Park City ──
  'park city mountain resort': { lat: 40.6514, lng: -111.5080 },
  'deer valley resort': { lat: 40.6375, lng: -111.4783 },
  'main street park city': { lat: 40.6461, lng: -111.4980 },
  'utah olympic park': { lat: 40.7147, lng: -111.5627 },
  'park city museum': { lat: 40.6459, lng: -111.4987 },
  'woodward park city': { lat: 40.7350, lng: -111.5467 },

  // ── Provo ──
  'brigham young university': { lat: 40.2519, lng: -111.6493 },
  'provo canyon': { lat: 40.3345, lng: -111.5960 },
  'bridal veil falls': { lat: 40.3396, lng: -111.5790 },
  'sundance mountain resort': { lat: 40.3927, lng: -111.5868 },
  'utah lake': { lat: 40.2260, lng: -111.7380 },
  'provo river': { lat: 40.3200, lng: -111.5900 },

  // ── Ogden ──
  'ogden nature center': { lat: 41.2237, lng: -111.9531 },
  'historic 25th street': { lat: 41.2275, lng: -111.9698 },
  'snowbasin resort': { lat: 41.2162, lng: -111.8569 },
  'powder mountain': { lat: 41.3797, lng: -111.7789 },
  'ogden river parkway': { lat: 41.2230, lng: -111.9500 },
  'hill aerospace museum': { lat: 41.1171, lng: -111.9649 },
};
