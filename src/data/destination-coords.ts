// Shared destination coordinates — single source of truth
// Used by plan page + companion app + generate-itinerary API.

export const DESTINATION_COORDS: Record<string, { lat: number; lng: number; label: string }> = {
  'salt-lake-city': { lat: 40.7608, lng: -111.8910, label: 'Salt Lake City' },
  'park-city': { lat: 40.6461, lng: -111.4980, label: 'Park City' },
  provo: { lat: 40.2338, lng: -111.6585, label: 'Provo' },
  ogden: { lat: 41.2230, lng: -111.9738, label: 'Ogden' },
};
