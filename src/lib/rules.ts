export const NOTICE_TYPES = [
  "RULE",
  "POLICY",
  "CIRCULAR",
  "JAHERNOTICE",
  "COURT_ORDER",
  "GAZETTE",
] as const;

export type NoticeType = (typeof NOTICE_TYPES)[number];

export const NOTICE_TYPE_LABELS: Record<string, string> = {
  RULE: "Rule",
  POLICY: "Policy",
  CIRCULAR: "Circular",
  JAHERNOTICE: "Jahernotice (public notice)",
  COURT_ORDER: "Court order",
  GAZETTE: "Gazette notification",
};

export const BIHAR_DISTRICTS = [
  "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur",
  "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad",
  "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani",
  "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa",
  "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul",
  "Vaishali", "West Champaran",
];

export const STATE_DISTRICTS: Record<string, string[]> = {
  Bihar: BIHAR_DISTRICTS,
  Jharkhand: [
    "Bokaro", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", "Giridih",
    "Gumla", "Hazaribagh", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu",
    "Ramgarh", "Ranchi", "Sahibganj", "Seraikela Kharsawan", "Simdega", "West Singhbhum",
  ],
  "Uttar Pradesh": ["Agra", "Allahabad", "Ghaziabad", "Gorakhpur", "Kanpur", "Lucknow", "Varanasi"],
  "West Bengal": ["Bardhaman", "Darjeeling", "Howrah", "Hooghly", "Kolkata", "Murshidabad", "Nadia"],
  Karnataka: ["Bengaluru Urban", "Belagavi", "Dakshina Kannada", "Mysuru", "Tumakuru"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli"],
};

export const STATES = Object.keys(STATE_DISTRICTS);

export function districtsFor(state?: string | null) {
  return (state && STATE_DISTRICTS[state]) || [];
}
