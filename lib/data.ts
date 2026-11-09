export type Category = 'beach' | 'cabins' | 'city' | 'countryside' | 'luxe' | 'pools' | 'tiny' | 'tropical';

export type Review = {
  id: string;
  listingId: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string; // ISO
  text: string;
};

export type Host = {
  name: string;
  avatar: string;
  superhost: boolean;
  years: number;
  responseRate: number;
  userId?: string;
};

export type Listing = {
  id: string;
  title: string;
  type: 'Entire home' | 'Apartment' | 'Villa' | 'Cabin' | 'Hotel room' | 'Private room' | 'Tiny home';
  city: string;
  country: string;
  address: string;
  lat: number;
  lng: number;
  price: number; // USD per night
  cleaningFee: number;
  rating: number;
  reviewCount: number;
  categories: Category[];
  images: string[];
  guests: number;
  bedrooms: number;
  beds: number;
  baths: number;
  amenities: string[];
  description: string;
  highlights: { icon: string; title: string; text: string }[];
  host: Host;
  rules: string[];
  cancellation: string;
  checkInTime: string;
  checkOutTime: string;
  instantBook: boolean;
  createdBy?: string; // userId when hosted in-app
};

export const CATEGORIES: { key: Category | 'all'; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: 'apps-outline' },
  { key: 'beach', label: 'Beach', icon: 'umbrella-outline' },
  { key: 'cabins', label: 'Cabins', icon: 'leaf-outline' },
  { key: 'city', label: 'City', icon: 'business-outline' },
  { key: 'pools', label: 'Pools', icon: 'water-outline' },
  { key: 'tropical', label: 'Tropical', icon: 'sunny-outline' },
  { key: 'luxe', label: 'Luxe', icon: 'diamond-outline' },
  { key: 'countryside', label: 'Countryside', icon: 'flower-outline' },
  { key: 'tiny', label: 'Tiny homes', icon: 'cube-outline' },
];

export const AMENITY_ICONS: Record<string, string> = {
  'Wi-Fi': 'wifi-outline',
  'Air conditioning': 'snow-outline',
  Kitchen: 'restaurant-outline',
  Pool: 'water-outline',
  'Free parking': 'car-outline',
  Washer: 'shirt-outline',
  TV: 'tv-outline',
  Workspace: 'laptop-outline',
  'Hot tub': 'flame-outline',
  Fireplace: 'bonfire-outline',
  'Beach access': 'umbrella-outline',
  Gym: 'barbell-outline',
  'Pets allowed': 'paw-outline',
  Breakfast: 'cafe-outline',
  'Self check-in': 'key-outline',
  'Security cameras': 'videocam-outline',
  'Smoke alarm': 'alert-circle-outline',
  'First aid kit': 'medkit-outline',
  'Ocean view': 'boat-outline',
  'Mountain view': 'triangle-outline',
  BBQ: 'flame-outline',
  Elevator: 'swap-vertical-outline',
};

export const ALL_AMENITIES = Object.keys(AMENITY_ICONS);

const u = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=70`;
const avatar = (n: number, g: 'men' | 'women') => `https://randomuser.me/api/portraits/${g}/${n}.jpg`;

const STD_RULES = ['Check-in after 3:00 PM', 'Checkout before 11:00 AM', 'No parties or events', 'No smoking'];
const FLEX = 'Free cancellation up to 48 hours before check-in. After that, cancel before check-in and get a 50% refund, minus the service fee.';
const MOD = 'Free cancellation up to 5 days before check-in. After that, the first night is non-refundable.';

export const LISTINGS: Listing[] = [
  {
    id: 'l1', title: 'Siargao Luxury Resort', type: 'Villa', city: 'Siargao Island', country: 'Philippines',
    address: 'Tourism Rd, General Luna, Siargao Island', lat: 9.7854, lng: 126.1617, price: 159, cleaningFee: 25,
    rating: 4.9, reviewCount: 214, categories: ['tropical', 'pools', 'beach', 'luxe'],
    images: [u('1566073771259-6a8506099945'), u('1540541338287-41700207dee6'), u('1571896349842-33c89424de2d'), u('1520250497591-112f2f40a3f4')],
    guests: 4, bedrooms: 2, beds: 2, baths: 2,
    amenities: ['Wi-Fi', 'Air conditioning', 'Pool', 'Breakfast', 'Beach access', 'Free parking', 'Kitchen', 'Smoke alarm'],
    description: 'A perfect place to stay when you\'re at Siargao. Thatched-roof villas wrapped around a lagoon pool, a short tricycle ride from Cloud 9. Comes with parking, daily breakfast, and every tricycle driver knows the place.',
    highlights: [
      { icon: 'water-outline', title: 'Dive right in', text: 'One of the few places in the area with a lagoon pool.' },
      { icon: 'key-outline', title: 'Self check-in', text: 'Check yourself in with the smart lock.' },
      { icon: 'ribbon-outline', title: 'Superhost', text: 'Superhosts are experienced, highly rated hosts.' },
    ],
    host: { name: 'Maya', avatar: avatar(44, 'women'), superhost: true, years: 6, responseRate: 100 },
    rules: STD_RULES, cancellation: FLEX, checkInTime: '3:00 PM', checkOutTime: '11:00 AM', instantBook: true,
  },
  {
    id: 'l2', title: 'Romance Living Rooms', type: 'Apartment', city: 'New York', country: 'United States',
    address: '32 W 32nd St, New York, NY 10001', lat: 40.7479, lng: -73.9867, price: 289, cleaningFee: 60,
    rating: 4.8, reviewCount: 98, categories: ['city', 'luxe'],
    images: [u('1502672260266-1c1ef2d93688'), u('1522708323590-d24dbb6b0267'), u('1493809842364-78817add7ffb'), u('1560448204-e02f11c3d0e2')],
    guests: 3, bedrooms: 1, beds: 2, baths: 1,
    amenities: ['Wi-Fi', 'Air conditioning', 'Kitchen', 'Washer', 'TV', 'Workspace', 'Elevator', 'Smoke alarm'],
    description: 'Sunlit loft in Koreatown with 1200 sq ft of space, exposed brick and huge windows. Walk to the Empire State Building, Herald Square, and endless late-night food.',
    highlights: [
      { icon: 'laptop-outline', title: 'Dedicated workspace', text: 'A common area with Wi-Fi that\'s well-suited for working.' },
      { icon: 'walk-outline', title: 'Walkable area', text: 'Guests say this area is easy to get around.' },
      { icon: 'calendar-outline', title: 'Free cancellation for 48 hours', text: 'Get a full refund if you change your mind.' },
    ],
    host: { name: 'Lena', avatar: avatar(65, 'women'), superhost: true, years: 4, responseRate: 98 },
    rules: STD_RULES, cancellation: FLEX, checkInTime: '4:00 PM', checkOutTime: '11:00 AM', instantBook: true,
  },
  {
    id: 'l3', title: 'Pine Ridge A-Frame Cabin', type: 'Cabin', city: 'Lake Tahoe', country: 'United States',
    address: '88 Pine Ridge Rd, South Lake Tahoe, CA', lat: 38.9399, lng: -119.9772, price: 210, cleaningFee: 45,
    rating: 4.95, reviewCount: 156, categories: ['cabins', 'countryside'],
    images: [u('1449158743715-0a90ebb6d2d8'), u('1510798831971-661eb04b3739'), u('1542718610-a1d656d1884c'), u('1587061949409-02df41d5e562')],
    guests: 6, bedrooms: 3, beds: 4, baths: 2,
    amenities: ['Wi-Fi', 'Fireplace', 'Hot tub', 'Kitchen', 'Free parking', 'Mountain view', 'BBQ', 'Pets allowed'],
    description: 'A cozy A-frame tucked into the pines, ten minutes from Heavenly. Wood-burning fireplace, cedar hot tub under the stars, and a deck made for slow mornings.',
    highlights: [
      { icon: 'flame-outline', title: 'Hot tub under the stars', text: 'Private cedar hot tub on the deck.' },
      { icon: 'paw-outline', title: 'Pet friendly', text: 'Bring your dog along for the adventure.' },
      { icon: 'ribbon-outline', title: 'Superhost', text: 'Daniel is a Superhost with great reviews.' },
    ],
    host: { name: 'Daniel', avatar: avatar(32, 'men'), superhost: true, years: 8, responseRate: 99 },
    rules: ['Check-in after 4:00 PM', 'Checkout before 10:00 AM', 'Pets allowed', 'Quiet hours 10 PM – 7 AM'], cancellation: MOD,
    checkInTime: '4:00 PM', checkOutTime: '10:00 AM', instantBook: false,
  },
  {
    id: 'l4', title: 'Royal Merit Suites', type: 'Hotel room', city: 'Bali', country: 'Indonesia',
    address: 'Jl. Pantai Kuta, Kuta, Bali', lat: -8.7177, lng: 115.1688, price: 50, cleaningFee: 0,
    rating: 5.0, reviewCount: 61, categories: ['tropical', 'city'],
    images: [u('1618773928121-c32242e63f39'), u('1611892440504-42a792e24d32'), u('1590490360182-c33d57733427'), u('1582719478250-c89cae4dc85b')],
    guests: 2, bedrooms: 1, beds: 1, baths: 1,
    amenities: ['Wi-Fi', 'Air conditioning', 'Breakfast', 'Pool', 'Gym', 'TV', 'Security cameras'],
    description: 'Boutique suites steps from Kuta Beach with a rooftop pool, sunrise yoga, and a 24-hour front desk that will book scooters, surf lessons and temple tours for you.',
    highlights: [
      { icon: 'cafe-outline', title: 'Breakfast included', text: 'Balinese and continental breakfast every morning.' },
      { icon: 'shield-checkmark-outline', title: '24h security', text: 'Front desk and security around the clock.' },
      { icon: 'star-outline', title: 'Guest favorite', text: 'One of the most loved homes on Staymark.' },
    ],
    host: { name: 'Hamza', avatar: avatar(12, 'men'), superhost: false, years: 3, responseRate: 95 },
    rules: STD_RULES, cancellation: FLEX, checkInTime: '2:00 PM', checkOutTime: '12:00 PM', instantBook: true,
  },
  {
    id: 'l5', title: 'Cliffside Ocean Villa', type: 'Villa', city: 'Santorini', country: 'Greece',
    address: 'Oia 847 02, Santorini', lat: 36.4618, lng: 25.3753, price: 540, cleaningFee: 90,
    rating: 4.97, reviewCount: 189, categories: ['luxe', 'pools', 'beach'],
    images: [u('1613490493576-7fde63acd811'), u('1602343168117-bb8ffe3e2e9f'), u('1584132967334-10e028bd69f7'), u('1600596542815-ffad4c1539a9')],
    guests: 6, bedrooms: 3, beds: 3, baths: 3,
    amenities: ['Wi-Fi', 'Pool', 'Ocean view', 'Air conditioning', 'Kitchen', 'Breakfast', 'Hot tub', 'Washer'],
    description: 'Whitewashed cave villa carved into the caldera with an infinity plunge pool facing the most famous sunset in the world. Daily breakfast delivered to your terrace.',
    highlights: [
      { icon: 'sunny-outline', title: 'Sunset views', text: 'Front-row caldera views from every room.' },
      { icon: 'water-outline', title: 'Infinity pool', text: 'Private heated plunge pool.' },
      { icon: 'ribbon-outline', title: 'Superhost', text: 'Elena has hosted for 9 years.' },
    ],
    host: { name: 'Elena', avatar: avatar(68, 'women'), superhost: true, years: 9, responseRate: 100 },
    rules: STD_RULES, cancellation: MOD, checkInTime: '3:00 PM', checkOutTime: '11:00 AM', instantBook: false,
  },
  {
    id: 'l6', title: 'Minimal Tiny House', type: 'Tiny home', city: 'Kyoto', country: 'Japan',
    address: 'Sakyo Ward, Kyoto 606-8317', lat: 35.0275, lng: 135.7944, price: 95, cleaningFee: 20,
    rating: 4.86, reviewCount: 77, categories: ['tiny', 'city', 'countryside'],
    images: [u('1586023492125-27b2c045efd7'), u('1505691938895-1758d7feb511'), u('1631049307264-da0ec9d70304'), u('1416331108676-a22ccb276e35')],
    guests: 2, bedrooms: 1, beds: 1, baths: 1,
    amenities: ['Wi-Fi', 'Air conditioning', 'Kitchen', 'Self check-in', 'Workspace', 'First aid kit'],
    description: 'A 20 m² Japanese-minimalist tiny house near the Philosopher\'s Path. Cedar bath, tatami lounge and a little garden for morning matcha.',
    highlights: [
      { icon: 'key-outline', title: 'Self check-in', text: 'Keypad entry, arrive whenever you like.' },
      { icon: 'leaf-outline', title: 'Peaceful & quiet', text: 'Guests love the calm neighbourhood.' },
      { icon: 'walk-outline', title: 'Great location', text: '95% of recent guests gave the location 5 stars.' },
    ],
    host: { name: 'Kenji', avatar: avatar(52, 'men'), superhost: true, years: 5, responseRate: 97 },
    rules: STD_RULES, cancellation: FLEX, checkInTime: '3:00 PM', checkOutTime: '10:00 AM', instantBook: true,
  },
  {
    id: 'l7', title: 'Modern Glass House', type: 'Entire home', city: 'Tulum', country: 'Mexico',
    address: 'Region 15, Tulum, Quintana Roo', lat: 20.2114, lng: -87.4654, price: 330, cleaningFee: 70,
    rating: 4.82, reviewCount: 132, categories: ['tropical', 'pools', 'luxe'],
    images: [u('1580587771525-78b9dba3b914'), u('1600585154340-be6161a56a0c'), u('1600607687939-ce8a6c25118c'), u('1512917774080-9991f1c4c750')],
    guests: 8, bedrooms: 4, beds: 5, baths: 4,
    amenities: ['Wi-Fi', 'Pool', 'Air conditioning', 'Kitchen', 'Free parking', 'BBQ', 'Washer', 'Workspace'],
    description: 'Architectural jungle home with floor-to-ceiling glass, a 12-metre pool and a rooftop for stargazing. Ten minutes by bike to the beach and the best taquerias in town.',
    highlights: [
      { icon: 'people-outline', title: 'Great for groups', text: 'Four bedrooms with en-suite bathrooms.' },
      { icon: 'water-outline', title: 'Private pool', text: 'Saltwater pool surrounded by jungle.' },
      { icon: 'bicycle-outline', title: 'Bikes included', text: 'Four bikes for getting around town.' },
    ],
    host: { name: 'Priya', avatar: avatar(26, 'women'), superhost: false, years: 2, responseRate: 93 },
    rules: STD_RULES, cancellation: MOD, checkInTime: '3:00 PM', checkOutTime: '11:00 AM', instantBook: true,
  },
  {
    id: 'l8', title: 'Beachfront Surf Shack', type: 'Entire home', city: 'Byron Bay', country: 'Australia',
    address: 'Lawson St, Byron Bay NSW 2481', lat: -28.6474, lng: 153.612, price: 180, cleaningFee: 40,
    rating: 4.78, reviewCount: 88, categories: ['beach', 'tiny'],
    images: [u('1499793983690-e29da59ef1c2'), u('1507525428034-b723cf961d3e'), u('1475087542963-13ab5e611954'), u('1533104816931-20fa691ff6ca')],
    guests: 4, bedrooms: 2, beds: 2, baths: 1,
    amenities: ['Wi-Fi', 'Beach access', 'Kitchen', 'BBQ', 'Free parking', 'Ocean view', 'Pets allowed'],
    description: 'Barefoot living right on Main Beach. Boards, wetsuits and an outdoor shower included — just wake up and paddle out.',
    highlights: [
      { icon: 'umbrella-outline', title: 'Beachfront', text: 'Steps from the sand.' },
      { icon: 'paw-outline', title: 'Pet friendly', text: 'Dogs welcome on request.' },
      { icon: 'boat-outline', title: 'Surf gear included', text: 'Two boards and wetsuits.' },
    ],
    host: { name: 'Greg', avatar: avatar(75, 'men'), superhost: false, years: 3, responseRate: 90 },
    rules: STD_RULES, cancellation: FLEX, checkInTime: '2:00 PM', checkOutTime: '10:00 AM', instantBook: true,
  },
  {
    id: 'l9', title: 'Tuscan Farmhouse Retreat', type: 'Entire home', city: 'Tuscany', country: 'Italy',
    address: 'Strada di Montalcino, Siena', lat: 43.0567, lng: 11.4889, price: 260, cleaningFee: 55,
    rating: 4.93, reviewCount: 172, categories: ['countryside', 'pools', 'luxe'],
    images: [u('1568605114967-8130f3a36994'), u('1564013799919-ab600027ffc6'), u('1570129477492-45c003edd2be'), u('1576941089067-2de3c901e126')],
    guests: 8, bedrooms: 4, beds: 5, baths: 3,
    amenities: ['Wi-Fi', 'Pool', 'Kitchen', 'Free parking', 'Fireplace', 'BBQ', 'Washer', 'Mountain view'],
    description: 'Restored 18th-century stone farmhouse among vineyards and olive groves. Wine tasting next door, cooking classes on request, and a pool overlooking the Val d\'Orcia.',
    highlights: [
      { icon: 'wine-outline', title: 'Vineyard views', text: 'Surrounded by Brunello vineyards.' },
      { icon: 'restaurant-outline', title: 'Chef\'s kitchen', text: 'Fully equipped for big family dinners.' },
      { icon: 'ribbon-outline', title: 'Superhost', text: 'Marco has 172 glowing reviews.' },
    ],
    host: { name: 'Marco', avatar: avatar(41, 'men'), superhost: true, years: 7, responseRate: 100 },
    rules: STD_RULES, cancellation: MOD, checkInTime: '4:00 PM', checkOutTime: '10:00 AM', instantBook: false,
  },
  {
    id: 'l10', title: 'Juniper Flats Studio', type: 'Apartment', city: 'Lisbon', country: 'Portugal',
    address: 'Rua da Rosa 118, Bairro Alto, Lisbon', lat: 38.7139, lng: -9.1449, price: 85, cleaningFee: 25,
    rating: 4.74, reviewCount: 203, categories: ['city'],
    images: [u('1494526585095-c41746248156'), u('1560448204-e02f11c3d0e2'), u('1493809842364-78817add7ffb'), u('1501785888041-af3ef285b470')],
    guests: 2, bedrooms: 1, beds: 1, baths: 1,
    amenities: ['Wi-Fi', 'Kitchen', 'Washer', 'Workspace', 'Self check-in', 'TV'],
    description: 'Bright studio with a Juliet balcony in the heart of Bairro Alto. Tiled floors, a reading nook, and the best pastéis de nata on the corner.',
    highlights: [
      { icon: 'key-outline', title: 'Self check-in', text: 'Lockbox entry at any hour.' },
      { icon: 'laptop-outline', title: 'Fast Wi-Fi', text: '300 Mbps — great for video calls.' },
      { icon: 'walk-outline', title: 'Walkable', text: 'Everything is a short stroll away.' },
    ],
    host: { name: 'Sofia', avatar: avatar(90, 'women'), superhost: false, years: 2, responseRate: 96 },
    rules: STD_RULES, cancellation: FLEX, checkInTime: '3:00 PM', checkOutTime: '11:00 AM', instantBook: true,
  },
];

const REVIEW_TEXTS = [
  'Absolutely stunning place, even better than the photos. The host was incredibly responsive and thoughtful.',
  'Spotless, comfortable and in a perfect location. We would book again in a heartbeat.',
  'Great value for money. Check-in was smooth and the bed was super comfortable.',
  'The views were unreal. Every detail was considered — coffee, towels, local tips. Loved it!',
  'Lovely stay. A little noisy at night on the weekend but otherwise perfect.',
  'Our family had the best week here. Kids loved it and we didn\'t want to leave.',
];
const NAMES = ['Lena F.', 'Daniel O.', 'Priya S.', 'Greg O.', 'Ana M.', 'Tom W.', 'Yuki T.', 'Carlos R.'];

export const SEED_REVIEWS: Review[] = LISTINGS.flatMap((l, li) =>
  [0, 1, 2, 3].map((k) => {
    const i = (li + k) % REVIEW_TEXTS.length;
    const d = new Date();
    d.setDate(d.getDate() - (k + 1) * 23 - li * 3);
    return {
      id: `${l.id}-r${k}`,
      listingId: l.id,
      author: NAMES[(li * 2 + k) % NAMES.length],
      avatar: avatar((li * 7 + k * 11) % 90, k % 2 ? 'men' : 'women'),
      rating: i === 4 ? 4 : 5,
      date: d.toISOString(),
      text: REVIEW_TEXTS[i],
    };
  })
);

// Deterministic dates that are blocked by the host (to make calendars realistic)
export function hostBlockedDates(listingId: string): string[] {
  const seed = listingId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const out: string[] = [];
  const today = new Date();
  for (let k = 0; k < 4; k++) {
    const start = new Date(today);
    start.setDate(today.getDate() + 6 + ((seed * (k + 3)) % 9) + k * 14);
    const len = 1 + ((seed + k) % 3);
    for (let j = 0; j < len; j++) {
      const d = new Date(start);
      d.setDate(start.getDate() + j);
      out.push(toISODate(d));
    }
  }
  return out;
}

export function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseISODate(s: string) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function nightsBetween(a: string, b: string) {
  return Math.round((parseISODate(b).getTime() - parseISODate(a).getTime()) / 86400000);
}

export function formatDate(s: string, opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }) {
  return parseISODate(s).toLocaleDateString('en-US', opts);
}

export function formatRange(a: string, b: string) {
  const A = parseISODate(a);
  const B = parseISODate(b);
  if (A.getMonth() === B.getMonth() && A.getFullYear() === B.getFullYear()) {
    return `${A.toLocaleDateString('en-US', { month: 'short' })} ${A.getDate()} – ${B.getDate()}`;
  }
  return `${formatDate(a)} – ${formatDate(b)}`;
}

export const CURRENCIES: { code: string; symbol: string; rate: number; name: string }[] = [
  { code: 'USD', symbol: '$', rate: 1, name: 'US Dollar' },
  { code: 'EUR', symbol: '€', rate: 0.92, name: 'Euro' },
  { code: 'GBP', symbol: '£', rate: 0.79, name: 'British Pound' },
  { code: 'PHP', symbol: '₱', rate: 57, name: 'Philippine Peso' },
  { code: 'JPY', symbol: '¥', rate: 150, name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', rate: 1.52, name: 'Australian Dollar' },
];

export function formatMoney(usd: number, code = 'USD', decimals = false) {
  const c = CURRENCIES.find((x) => x.code === code) ?? CURRENCIES[0];
  const v = usd * c.rate;
  const n = decimals && c.rate < 10
    ? v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : Math.round(v).toLocaleString('en-US');
  return `${c.symbol}${n}`;
}

export const SERVICE_FEE_RATE = 0.12;
export const TAX_RATE = 0.08;

export const EXTRAS = [
  { key: 'breakfast', label: 'Breakfast', price: 15, perNight: true, icon: 'cafe-outline' },
  { key: 'late', label: 'Late check-out', price: 10, perNight: false, icon: 'time-outline' },
  { key: 'pickup', label: 'Airport pickup', price: 35, perNight: false, icon: 'car-outline' },
];

export function priceBreakdown(l: Listing, nights: number, extras: string[]) {
  const base = l.price * nights;
  const extraTotal = EXTRAS.filter((e) => extras.includes(e.key)).reduce(
    (s, e) => s + (e.perNight ? e.price * nights : e.price),
    0
  );
  const weeklyDiscount = nights >= 7 ? Math.round(base * 0.1) : 0;
  const service = Math.round((base - weeklyDiscount + extraTotal) * SERVICE_FEE_RATE);
  const taxes = Math.round((base - weeklyDiscount + extraTotal + l.cleaningFee) * TAX_RATE);
  const total = base - weeklyDiscount + extraTotal + l.cleaningFee + service + taxes;
  return { base, extraTotal, weeklyDiscount, cleaning: l.cleaningFee, service, taxes, total };
}

export function timeAgo(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return 'now';
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 604800) return `${Math.floor(s / 86400)}d`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
