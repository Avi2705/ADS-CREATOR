export interface LocationData {
  [country: string]: {
    [state: string]: string[];
  };
}

export const LOCATION_DATA: LocationData = {
  "India": {
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Amravati"],
    "Delhi": ["New Delhi", "North Delhi", "South Delhi", "West Delhi", "East Delhi"],
    "Karnataka": ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Belagavi", "Davangere"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Siliguri", "Asansol"],
    "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam"],
    "Uttar Pradesh": ["Noida", "Lucknow", "Kanpur", "Agra", "Varanasi", "Ghaziabad"],
    "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Mohali"]
  },
  "United States": {
    "California": ["Los Angeles", "San Francisco", "San Diego", "San Jose", "Sacramento"],
    "New York": ["New York City", "Buffalo", "Rochester", "Albany", "Syracuse"],
    "Texas": ["Houston", "Austin", "Dallas", "San Antonio", "Fort Worth"],
    "Florida": ["Miami", "Orlando", "Tampa", "Jacksonville", "Fort Lauderdale"],
    "Washington": ["Seattle", "Spokane", "Tacoma", "Bellevue"]
  },
  "United Arab Emirates": {
    "Dubai": ["Dubai City", "Deira", "Jumeirah", "Dubai Marina", "Downtown Dubai"],
    "Abu Dhabi": ["Abu Dhabi City", "Al Ain", "Al Dhafra"],
    "Sharjah": ["Sharjah City", "Khor Fakkan", "Kalba"],
    "Ajman": ["Ajman City", "Masfout"]
  },
  "United Kingdom": {
    "England": ["London", "Manchester", "Birmingham", "Liverpool", "Leeds", "Bristol"],
    "Scotland": ["Edinburgh", "Glasgow", "Aberdeen", "Dundee"],
    "Wales": ["Cardiff", "Swansea", "Newport"],
    "Northern Ireland": ["Belfast", "Derry"]
  },
  "Canada": {
    "Ontario": ["Toronto", "Ottawa", "Mississauga", "Hamilton", "Brampton"],
    "British Columbia": ["Vancouver", "Victoria", "Surrey", "Burnaby"],
    "Quebec": ["Montreal", "Quebec City", "Laval", "Gatineau"],
    "Alberta": ["Calgary", "Edmonton", "Red Deer"]
  }
};

export const CATEGORY_OPTIONS = [
  "Education",
  "Hospital / Healthcare",
  "E-Commerce & Retail",
  "Real Estate & Housing",
  "Fashion & Apparel",
  "Electronics & Tech",
  "Food & Restaurants",
  "Automobile",
  "Beauty & Wellness",
  "Financial Services",
  "Others"
];

export const TARGETED_CUSTOMER_OPTIONS = [
  "Students",
  "Home Maker",
  "IT Professionals",
  "Business Owners / Entrepreneurs",
  "Healthcare Professionals",
  "Working Professionals",
  "Senior Citizens",
  "Others"
];

export const AD_TYPE_SIMPLIFIED_OPTIONS = [
  "B2C Creative Banner",
  "B2B Commercial Ad",
  "Social Promotion",
  "Product Launch",
  "Brand Awareness"
];
