import { TripItineraryDay } from "@/lib/trek-data";

export interface AddonPreset {
  id: string;
  title: string;
  priceUSD: number;
  description: string;
}

export const COMMON_ADDON_PRESETS: AddonPreset[] = [
  {
    id: "preset-porter",
    title: "Personal Porter Service",
    priceUSD: 250,
    description:
      "Hire a dedicated licensed porter to carry up to 18-20 kg of your baggage throughout the trail, letting you hike freely with only a daypack.",
  },
  {
    id: "preset-heli",
    title: "Helicopter Return Flight",
    priceUSD: 950,
    description:
      "Skip the multi-day downhill return trek with a scenic chartered helicopter flight directly to the city airport.",
  },
  {
    id: "preset-gear",
    title: "Sleeping Bag & Down Jacket Rental",
    priceUSD: 60,
    description:
      "Sanitized high-altitude -20°C down sleeping bag and premium expedition goose-down jacket for the duration of the trip.",
  },
  {
    id: "preset-single",
    title: "Single Room Supplement",
    priceUSD: 180,
    description:
      "Guaranteed private single room in city hotels and private lodges throughout the trekking route (subject to mountain lodge availability).",
  },
];

export interface ItineraryDayTemplate {
  id: string;
  name: string;
  badge: string;
  title: string;
  description: string;
  maxAltitude?: string;
  accommodation?: string;
  meals?: string;
  details?: Array<{ label: string; value: string }>;
}

export const COMMON_ITINERARY_DAY_TEMPLATES: ItineraryDayTemplate[] = [
  {
    id: "tpl-arrival",
    name: "Arrival in Kathmandu",
    badge: "Arrival",
    title: "Arrive in Kathmandu & Transfer to Hotel",
    description:
      "Warm reception at Tribhuvan International Airport (KTM) by our airport representative. Private transfer to your luxury hotel. Evening welcome briefing, gear check, and orientation dinner.",
    maxAltitude: "Kathmandu (1,400 m / 4,593 ft)",
    accommodation: "Hotel in Kathmandu",
    meals: "Welcome Dinner",
    details: [
      { label: "Transport", value: "Private AC Vehicle" },
      { label: "Activity", value: "Airport Reception & Orientation" },
    ],
  },
  {
    id: "tpl-prep",
    name: "Kathmandu Sightseeing & Prep",
    badge: "Prep & Sightseeing",
    title: "Kathmandu Sightseeing & Final Trek Preparation",
    description:
      "Guided cultural tour of UNESCO World Heritage sites including Swayambhunath, Pashupatinath, and Boudhanath Stupa. Final gear check, permit verifications, and rental arrangement.",
    maxAltitude: "Kathmandu (1,400 m / 4,593 ft)",
    accommodation: "Hotel in Kathmandu",
    meals: "Breakfast",
    details: [
      { label: "Tour Guide", value: "Licensed City Cultural Guide" },
      { label: "Permits", value: "TIMS & National Park Permits Finalized" },
    ],
  },
  {
    id: "tpl-trailhead-flight",
    name: "Fly to Trailhead & Trek",
    badge: "Trailhead",
    title: "Scenic Flight to Trailhead & Begin Trekking",
    description:
      "Early morning scenic mountain flight to the mountain airstrip. Meet our porter crew, organize duffel bags, and embark on the introductory trail through pine forests along the rushing river.",
    maxAltitude: "2,840 m / 9,318 ft",
    accommodation: "Tea House / Mountain Lodge",
    meals: "Breakfast, Lunch & Dinner",
    details: [
      { label: "Flight Time", value: "35 mins scenic flight" },
      { label: "Hiking Time", value: "3 – 4 hours" },
    ],
  },
  {
    id: "tpl-trail-day",
    name: "Trail Progression Day",
    badge: "Trek Day",
    title: "Trek through Alpine Valleys & Mountain Settlements",
    description:
      "Scenic hike following the winding river valley, crossing suspension bridges, and ascending past Mani stones and prayer wheels with panoramic views of snow-capped Himalayan peaks.",
    maxAltitude: "3,440 m / 11,286 ft",
    accommodation: "Tea House / Mountain Lodge",
    meals: "Breakfast, Lunch & Dinner",
    details: [
      { label: "Hiking Time", value: "5 – 6 hours" },
      { label: "Terrain", value: "Alpine forest & suspension bridges" },
    ],
  },
  {
    id: "tpl-acclimatization",
    name: "Acclimatization & Exploration",
    badge: "Acclimatization",
    title: "Acclimatization Day & Hike to High Viewpoint",
    description:
      "Rest and active acclimatization day following the golden rule: 'Climb high, sleep low'. Morning day-hike to a nearby ridge or viewpoint for panoramic vistas, followed by an afternoon exploring the local Sherpa settlement.",
    maxAltitude: "3,880 m / 12,730 ft",
    accommodation: "Tea House / Mountain Lodge",
    meals: "Breakfast, Lunch & Dinner",
    details: [
      { label: "Hiking Time", value: "3 – 4 hours (day hike)" },
      { label: "Activity", value: "Active acclimatization & panoramic views" },
    ],
  },
  {
    id: "tpl-pass-summit",
    name: "High Pass / Summit Day",
    badge: "Highlight Day",
    title: "Early Morning High Pass Crossing / Summit Ascent",
    description:
      "Pre-dawn departure with headlamps under starlit skies. Steady ascent over rocky moraines and snow trails to reach the highest point of the route. Celebrate the achievement with panoramic 360-degree Himalayan views before descending to camp.",
    maxAltitude: "5,416 m / 17,769 ft",
    accommodation: "Mountain Lodge / High Camp",
    meals: "Breakfast, Lunch & Dinner",
    details: [
      { label: "Hiking Time", value: "7 – 9 hours" },
      { label: "Difficulty", value: "Challenging / High Altitude" },
    ],
  },
  {
    id: "tpl-return-flight",
    name: "Fly Back to Kathmandu",
    badge: "Return Flight",
    title: "Scenic Flight Back to Kathmandu & Celebration",
    description:
      "Early morning mountain flight back to Kathmandu. Private transfer to your hotel. Afternoon at leisure for souvenir shopping, spa relaxation, and an evening celebratory farewell dinner.",
    maxAltitude: "Kathmandu (1,400 m / 4,593 ft)",
    accommodation: "Hotel in Kathmandu",
    meals: "Breakfast & Farewell Dinner",
    details: [
      { label: "Flight Time", value: "35 mins" },
      { label: "Evening", value: "Celebration & Farewell Dinner" },
    ],
  },
  {
    id: "tpl-departure",
    name: "Final Departure",
    badge: "Departure",
    title: "Final Departure from Kathmandu",
    description:
      "Enjoy a leisurely breakfast at the hotel. Free time for last-minute shopping in Thamel. Private transfer to Tribhuvan International Airport approximately 3 hours prior to your scheduled international flight.",
    maxAltitude: "Kathmandu (1,400 m / 4,593 ft)",
    accommodation: "Departure Day (No overnight)",
    meals: "Breakfast",
    details: [
      { label: "Transfer", value: "Private Airport Drop-off" },
    ],
  },
];

export const COMMON_ACCOMMODATION_OPTIONS = [
  "Tea House / Mountain Lodge",
  "Hotel in Kathmandu",
  "Luxury Heritage Hotel",
  "Tented Mountain Camping",
  "Eco Lodge / Resort",
  "Homestay with Local Family",
  "High Altitude Mountain Hut",
  "Departure Day (No accommodation)",
];

export const COMMON_MEAL_OPTIONS = [
  "Breakfast, Lunch & Dinner",
  "Breakfast & Dinner",
  "Breakfast Only",
  "Welcome Dinner Included",
  "Farewell Dinner Included",
  "Meals Not Included",
];

export function generateStandardItineraryDump(durationDays: number = 12): TripItineraryDay[] {
  const count = Math.max(3, durationDays || 12);
  const days: TripItineraryDay[] = [];

  for (let i = 1; i <= count; i++) {
    if (i === 1) {
      days.push({
        day: 1,
        title: "Arrive in Kathmandu & Transfer to Hotel",
        description:
          "Warm reception at Tribhuvan International Airport (KTM) by our representative. Private transfer to your hotel. Evening welcome briefing and orientation dinner.",
        maxAltitude: "Kathmandu (1,400 m / 4,593 ft)",
        accommodation: "Hotel in Kathmandu",
        meals: "Welcome Dinner",
        details: [
          { label: "Transport", value: "Private AC Vehicle" },
          { label: "Activity", value: "Airport Reception & Orientation" },
        ],
      });
    } else if (i === 2 && count >= 5) {
      days.push({
        day: 2,
        title: "Kathmandu Sightseeing & Final Trek Preparation",
        description:
          "Guided cultural tour of UNESCO World Heritage sites including Swayambhunath, Pashupatinath, and Boudhanath Stupa. Final gear check, permits verification, and briefing.",
        maxAltitude: "Kathmandu (1,400 m / 4,593 ft)",
        accommodation: "Hotel in Kathmandu",
        meals: "Breakfast",
        details: [
          { label: "Tour Guide", value: "Licensed City Cultural Guide" },
          { label: "Permits", value: "TIMS & National Park Permits Finalized" },
        ],
      });
    } else if (i === 3 || (i === 2 && count < 5)) {
      days.push({
        day: i,
        title: "Scenic Flight / Drive to Trailhead & Begin Trek",
        description:
          "Early morning scenic mountain transfer to the mountain airstrip / trailhead. Meet our porter crew, organize duffel bags, and begin introductory trek along the river valley.",
        maxAltitude: "2,840 m / 9,318 ft",
        accommodation: "Tea House / Mountain Lodge",
        meals: "Breakfast, Lunch & Dinner",
        details: [
          { label: "Transfer Time", value: "35 mins flight / 4 hrs drive" },
          { label: "Hiking Time", value: "3 – 4 hours" },
        ],
      });
    } else if (i === count) {
      days.push({
        day: i,
        title: "Final International Departure",
        description:
          "Enjoy breakfast at the hotel. Free time for last-minute shopping in Thamel. Private transfer to Tribhuvan International Airport approximately 3 hours prior to departure flight.",
        maxAltitude: "Kathmandu (1,400 m / 4,593 ft)",
        accommodation: "Departure Day (No accommodation)",
        meals: "Breakfast",
        details: [
          { label: "Transfer", value: "Private Airport Drop-off" },
        ],
      });
    } else if (i === count - 1) {
      days.push({
        day: i,
        title: "Return Flight to Kathmandu & Celebration",
        description:
          "Morning flight back to Kathmandu. Private transfer to your hotel. Leisure afternoon for souvenir shopping, spa relaxation, and evening celebratory farewell dinner.",
        maxAltitude: "Kathmandu (1,400 m / 4,593 ft)",
        accommodation: "Hotel in Kathmandu",
        meals: "Breakfast & Farewell Dinner",
        details: [
          { label: "Flight Time", value: "35 mins" },
          { label: "Evening", value: "Celebration & Farewell Dinner" },
        ],
      });
    } else {
      // Middle trekking days
      const trekDayIndex = i - 3;
      const totalTrekDays = count - 4;
      const isAcclimatization = Math.floor(totalTrekDays * 0.35) === trekDayIndex;
      const isPeakDay = Math.floor(totalTrekDays * 0.7) === trekDayIndex;

      if (isAcclimatization) {
        days.push({
          day: i,
          title: "Acclimatization Day & Hike to High Viewpoint",
          description:
            "Rest and active acclimatization following the golden rule 'Climb high, sleep low'. Morning day-hike to a nearby panoramic ridge, followed by village exploration.",
          maxAltitude: "3,880 m / 12,730 ft",
          accommodation: "Tea House / Mountain Lodge",
          meals: "Breakfast, Lunch & Dinner",
          details: [
            { label: "Hiking Time", value: "3 – 4 hours (day hike)" },
            { label: "Activity", value: "Active Acclimatization" },
          ],
        });
      } else if (isPeakDay) {
        days.push({
          day: i,
          title: "High Pass Crossing / Summit Ascent Day",
          description:
            "Pre-dawn departure with headlamps. Steady ascent over alpine moraines to reach the scenic high pass / summit viewpoint before descending to camp.",
          maxAltitude: "5,416 m / 17,769 ft",
          accommodation: "Mountain Lodge / High Camp",
          meals: "Breakfast, Lunch & Dinner",
          details: [
            { label: "Hiking Time", value: "7 – 9 hours" },
            { label: "Difficulty", value: "Challenging / High Altitude" },
          ],
        });
      } else if (trekDayIndex > Math.floor(totalTrekDays * 0.7)) {
        days.push({
          day: i,
          title: `Trek Descending through Alpine Valleys - Day ${i}`,
          description:
            "Scenic downhill descent following rhododendron forests and mountain rivers back towards the lower valley settlements.",
          maxAltitude: "3,440 m / 11,286 ft",
          accommodation: "Tea House / Mountain Lodge",
          meals: "Breakfast, Lunch & Dinner",
          details: [
            { label: "Hiking Time", value: "5 – 6 hours" },
            { label: "Terrain", value: "Downhill alpine trails" },
          ],
        });
      } else {
        days.push({
          day: i,
          title: `Trek through Alpine Settlements - Day ${i}`,
          description:
            "Scenic hike following mountain paths, crossing suspension bridges, and ascending past prayer wheels with dramatic mountain views.",
          maxAltitude: "3,440 m / 11,286 ft",
          accommodation: "Tea House / Mountain Lodge",
          meals: "Breakfast, Lunch & Dinner",
          details: [
            { label: "Hiking Time", value: "5 – 6 hours" },
            { label: "Terrain", value: "Mountain trails & bridges" },
          ],
        });
      }
    }
  }

  return days;
}
