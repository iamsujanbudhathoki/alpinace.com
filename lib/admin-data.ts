export interface Booking {
  id: string;
  reference: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  country: string;
  packageName: string;
  packageType: "Trekking" | "Expedition" | "Tour";
  startDate: string;
  endDate: string;
  groupSize: number;
  totalAmountUSD: number;
  paymentStatus: "Paid" | "Deposit Paid" | "Pending" | "Refunded";
  bookingStatus: "Confirmed" | "In Review" | "Active Trek" | "Completed" | "Cancelled";
  assignedGuide?: string;
  permitStatus: "Issued" | "Processing" | "Pending Document";
  specialRequests?: string;
}

export interface PackageItem {
  id: string;
  title: string;
  slug: string;
  category: "Trekking" | "Expedition" | "Tour";
  region: "Everest" | "Annapurna" | "Langtang" | "Manaslu" | "Kathmandu & Pokhara";
  durationDays: number;
  maxAltitudeMeters: number;
  difficulty: "Easy" | "Moderate" | "Challenging" | "Extreme (8000m+)";
  priceUSD: number;
  status: "Active" | "Draft" | "Featured";
  totalBookings: number;
  rating: number;
  permitsRequired: string[];
}

export interface Guide {
  id: string;
  name: string;
  role: "Lead Expedition Leader" | "Senior Trekking Guide" | "High Altitude Sherpa" | "Cultural Tour Guide";
  summitStats: string; // e.g., "14x Everest, 5x K2"
  certifications: string[]; // e.g., ["NMA Certified", "IFMGA", "Wilderness First Responder"]
  status: "Available" | "On Mountain" | "On Leave";
  phone: string;
  email: string;
  currentAssignment?: string;
  avatarUrl: string;
}

export interface Inquiry {
  id: string;
  guestName: string;
  email: string;
  phone: string;
  country: string;
  interestedTrip: string;
  travelDates: string;
  groupSize: number;
  message: string;
  createdAt: string;
  status: "New" | "Contacted" | "Quote Sent" | "Booked" | "Closed";
  notes?: string;
}

export const mockDashboardMetrics = {
  totalRevenueUSD: 148500,
  revenueChangePercent: +18.4,
  activeExpeditions: 6,
  climbersOnMountain: 24,
  pendingBookings: 8,
  pendingInquiries: 12,
  timsPermitsProcessing: 14,
};

export const mockBookings: Booking[] = [
  {
    id: "bkg-101",
    reference: "ACE-2026-0891",
    guestName: "Marcus Vance",
    guestEmail: "marcus.vance@example.com",
    guestPhone: "+1 (555) 234-5678",
    country: "United States",
    packageName: "Everest Base Camp Luxury Helicopter Trek",
    packageType: "Trekking",
    startDate: "2026-09-10",
    endDate: "2026-09-24",
    groupSize: 2,
    totalAmountUSD: 7600,
    paymentStatus: "Deposit Paid",
    bookingStatus: "Confirmed",
    assignedGuide: "Lakpa Tenzing Sherpa",
    permitStatus: "Issued",
    specialRequests: "Requires gluten-free meals & single room supplement in Namche.",
  },
  {
    id: "bkg-102",
    reference: "ACE-2026-0892",
    guestName: "Elena Rostova",
    guestEmail: "elena.r@example.de",
    guestPhone: "+49 170 8923145",
    country: "Germany",
    packageName: "Ama Dablam (6,812m) Autumn Expedition",
    packageType: "Expedition",
    startDate: "2026-10-01",
    endDate: "2026-10-28",
    groupSize: 1,
    totalAmountUSD: 9800,
    paymentStatus: "Paid",
    bookingStatus: "Confirmed",
    assignedGuide: "Mingma Norbu Sherpa",
    permitStatus: "Issued",
    specialRequests: "Personal oxygen setup request verified.",
  },
  {
    id: "bkg-103",
    reference: "ACE-2026-0893",
    guestName: "Jean-Pierre Dubois",
    guestEmail: "jp.dubois@example.fr",
    guestPhone: "+33 6 12 34 56 78",
    country: "France",
    packageName: "Annapurna Circuit High Passes",
    packageType: "Trekking",
    startDate: "2026-09-18",
    endDate: "2026-10-04",
    groupSize: 4,
    totalAmountUSD: 6400,
    paymentStatus: "Pending",
    bookingStatus: "In Review",
    assignedGuide: "Pemba Gelje Sherpa",
    permitStatus: "Processing",
  },
  {
    id: "bkg-104",
    reference: "ACE-2026-0894",
    guestName: "Sarah Jenkins & Group",
    guestEmail: "sarah.j@example.co.uk",
    guestPhone: "+44 7700 900077",
    country: "United Kingdom",
    packageName: "Kathmandu Valley & Chitwan Cultural Safari",
    packageType: "Tour",
    startDate: "2026-08-15",
    endDate: "2026-08-25",
    groupSize: 6,
    totalAmountUSD: 7200,
    paymentStatus: "Paid",
    bookingStatus: "Active Trek",
    assignedGuide: "Rohan Tamang",
    permitStatus: "Issued",
  },
  {
    id: "bkg-105",
    reference: "ACE-2026-0895",
    guestName: "Kenji Sato",
    guestEmail: "kenji.sato@example.jp",
    guestPhone: "+81 90 1234 5678",
    country: "Japan",
    packageName: "Manaslu Circuit Wild Wilderness Trek",
    packageType: "Trekking",
    startDate: "2026-10-10",
    endDate: "2026-10-26",
    groupSize: 2,
    totalAmountUSD: 4200,
    paymentStatus: "Deposit Paid",
    bookingStatus: "Confirmed",
    assignedGuide: "Pasang Dawa Sherpa",
    permitStatus: "Processing",
  },
  {
    id: "bkg-106",
    reference: "ACE-2026-0896",
    guestName: "Carlos Mendez",
    guestEmail: "carlos.m@example.es",
    guestPhone: "+34 600 123 456",
    country: "Spain",
    packageName: "Mera Peak Climbing (6,476m)",
    packageType: "Expedition",
    startDate: "2026-11-02",
    endDate: "2026-11-20",
    groupSize: 3,
    totalAmountUSD: 8500,
    paymentStatus: "Pending",
    bookingStatus: "In Review",
    permitStatus: "Pending Document",
  },
];

export const mockPackages: PackageItem[] = [
  {
    id: "pkg-1",
    title: "Everest Base Camp & Gokyo Lakes Luxury Trek",
    slug: "everest-base-camp-gokyo",
    category: "Trekking",
    region: "Everest",
    durationDays: 16,
    maxAltitudeMeters: 5545,
    difficulty: "Challenging",
    priceUSD: 3200,
    status: "Featured",
    totalBookings: 142,
    rating: 4.95,
    permitsRequired: ["Sagarmatha NP Permit", "Khumbu Pasang Lhamu Entry"],
  },
  {
    id: "pkg-2",
    title: "Ama Dablam Technical Expedition (6,812m)",
    slug: "ama-dablam-expedition",
    category: "Expedition",
    region: "Everest",
    durationDays: 28,
    maxAltitudeMeters: 6812,
    difficulty: "Extreme (8000m+)",
    priceUSD: 9800,
    status: "Active",
    totalBookings: 38,
    rating: 5.0,
    permitsRequired: ["NMA Climbing Permit", "Sagarmatha NP Permit", "Garbage Deposit"],
  },
  {
    id: "pkg-3",
    title: "Annapurna Circuit & Tilicho Lake High Pass",
    slug: "annapurna-circuit-tilicho",
    category: "Trekking",
    region: "Annapurna",
    durationDays: 15,
    maxAltitudeMeters: 5416,
    difficulty: "Challenging",
    priceUSD: 1650,
    status: "Active",
    totalBookings: 215,
    rating: 4.88,
    permitsRequired: ["ACAP Permit", "TIMS Card"],
  },
  {
    id: "pkg-4",
    title: "Manaslu Circuit Restricted Area Trek",
    slug: "manaslu-circuit",
    category: "Trekking",
    region: "Manaslu",
    durationDays: 16,
    maxAltitudeMeters: 5160,
    difficulty: "Challenging",
    priceUSD: 2100,
    status: "Featured",
    totalBookings: 89,
    rating: 4.92,
    permitsRequired: ["Manaslu Restricted Permit", "MCAP Permit", "ACAP Permit"],
  },
  {
    id: "pkg-5",
    title: "Langtang Valley & Gosaikunda Sacred Lakes",
    slug: "langtang-gosaikunda",
    category: "Trekking",
    region: "Langtang",
    durationDays: 11,
    maxAltitudeMeters: 4380,
    difficulty: "Moderate",
    priceUSD: 1250,
    status: "Active",
    totalBookings: 104,
    rating: 4.84,
    permitsRequired: ["Langtang NP Permit", "TIMS Card"],
  },
  {
    id: "pkg-6",
    title: "Heritage & Wildlife: Kathmandu, Pokhara & Chitwan",
    slug: "nepal-heritage-wildlife",
    category: "Tour",
    region: "Kathmandu & Pokhara",
    durationDays: 10,
    maxAltitudeMeters: 1400,
    difficulty: "Easy",
    priceUSD: 1450,
    status: "Active",
    totalBookings: 76,
    rating: 4.9,
    permitsRequired: ["Chitwan NP Entry", "Monuments Entrance Fees"],
  },
];

export const mockGuides: Guide[] = [
  {
    id: "gd-1",
    name: "Lakpa Tenzing Sherpa",
    role: "Lead Expedition Leader",
    summitStats: "12x Everest, 4x K2, 6x Lhotse",
    certifications: ["IFMGA Mountain Guide", "NMA Master Instructor", "Wilderness First Responder"],
    status: "On Mountain",
    phone: "+977 9841-234567",
    email: "lakpa.sherpa@alpineace.com",
    currentAssignment: "Everest Base Camp Luxury Trek (ACE-2026-0891)",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "gd-2",
    name: "Mingma Norbu Sherpa",
    role: "Lead Expedition Leader",
    summitStats: "8x Everest, 9x Ama Dablam",
    certifications: ["IFMGA Mountain Guide", "NMA Advanced Mountaineer"],
    status: "Available",
    phone: "+977 9851-876543",
    email: "mingma.norbu@alpineace.com",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "gd-3",
    name: "Pemba Gelje Sherpa",
    role: "Senior Trekking Guide",
    summitStats: "3x Island Peak, 4x Mera Peak",
    certifications: ["NMA Certified Trekking Guide", "Emergency Alpine First Aid"],
    status: "Available",
    phone: "+977 9803-345678",
    email: "pemba.g@alpineace.com",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "gd-4",
    name: "Rohan Tamang",
    role: "Cultural Tour Guide",
    summitStats: "Cultural Specialist (10+ Yrs)",
    certifications: ["Nepal Tourism Board License", "Heritage Historian"],
    status: "On Mountain",
    phone: "+977 9818-567890",
    email: "rohan.tamang@alpineace.com",
    currentAssignment: "Kathmandu & Chitwan Safari (ACE-2026-0894)",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
  },
];

export const mockInquiries: Inquiry[] = [
  {
    id: "inq-201",
    guestName: "Dr. Alexander Wright",
    email: "a.wright@university.edu",
    phone: "+1 415 555 0192",
    country: "USA",
    interestedTrip: "Custom Private Ama Dablam Climb",
    travelDates: "October 2026",
    groupSize: 3,
    message: "We are a group of 3 experienced climbers looking for a private Sherpa team for Ama Dablam. Looking for full logistics, basecamp luxury, and 1:1 Sherpa ratio.",
    createdAt: "2026-07-27 14:30",
    status: "Quote Sent",
    notes: "Sent $9,500/pp proposal with helicopter transfer add-on.",
  },
  {
    id: "inq-202",
    guestName: "Camilla Lindqvist",
    email: "camilla.l@design.se",
    phone: "+46 70 123 4567",
    country: "Sweden",
    interestedTrip: "Everest Base Camp & Gokyo Trek",
    travelDates: "November 2026",
    groupSize: 2,
    message: "Hello! My partner and I want to combine Cho La Pass with Gokyo Lakes. Are oxygen bottles available at tea houses along the route?",
    createdAt: "2026-07-28 09:15",
    status: "New",
  },
  {
    id: "inq-203",
    guestName: "Liam O'Connor",
    email: "liam.oc@dublin.ie",
    phone: "+353 87 123 4567",
    country: "Ireland",
    interestedTrip: "Manaslu Circuit Trek",
    travelDates: "Spring 2027",
    groupSize: 5,
    message: "We have a group of 5 friends planning for Manaslu Circuit. Do we need 2 guides for 5 people or is 1 guide sufficient?",
    createdAt: "2026-07-26 18:40",
    status: "Contacted",
    notes: "Clarified restricted permit regulations (min 2 trekkers, licensed Sherpa guide required).",
  },
];
