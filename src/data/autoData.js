// YOUR DRIVE. — BATCH 1 DATA ENGINE

export const BRAND = {
  name: "YOUR DRIVE.",
  tagline: "Engineered for the road ahead.",
  descriptor: "AUTO CARE · PERFORMANCE · PRECISION",
  developer:
    "Website Concept Made by: Web Developer Devin Planas",
};

const photo = (id, width = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

export const IMAGES = {
  hero: photo("photo-1503376780353-7e6692767b70", 1800),
  sport: photo("photo-1552519507-da3b142c6e3d"),
  drive: photo("photo-1507136566006-cfc505b114fc"),
  showroom: photo("photo-1493238792000-8113da705763"),
  details: photo("photo-1542362567-b07e54358753"),
  precision: photo("photo-1485291571150-772bcfc10da5"),
  garage: photo("photo-1487754180451-c456f719a1fc"),
};

export const VEHICLE_TYPES = [
  {
    id: "hatchback",
    name: "Hatchback",
    multiplier: 0.92,
    description: "Compact city vehicles",
  },
  {
    id: "sedan",
    name: "Sedan",
    multiplier: 1,
    description: "Everyday passenger cars",
  },
  {
    id: "suv",
    name: "SUV",
    multiplier: 1.25,
    description: "Crossovers and utility vehicles",
  },
  {
    id: "mpv",
    name: "MPV / Van",
    multiplier: 1.18,
    description: "Family and passenger vehicles",
  },
  {
    id: "pickup",
    name: "Pickup Truck",
    multiplier: 1.3,
    description: "Light-duty pickup vehicles",
  },
];

export const SERVICES = [
  {
    id: "preventive-maintenance",
    number: "01",
    name: "Preventive Maintenance",
    shortName: "Maintenance",
    category: "Maintenance",
    eyebrow: "KEEP EVERY MILE CONFIDENT",
    subtitle: "Consistency is performance.",
    description:
      "A comprehensive illustrative maintenance package that focuses on routine inspection, basic engine care, and preventive service planning.",
    basePrice: 3200,
    duration: "2–3 hours",
    image: IMAGES.garage,
    featured: true,
    inclusions: [
      "Basic engine oil and fluid review",
      "Sample filter inspection checklist",
      "Brake and tire condition review",
      "General under-hood visual inspection",
      "Maintenance summary",
    ],
    process: [
      "Vehicle condition review",
      "Maintenance checklist",
      "Proposed service work",
      "Final sample inspection report",
    ],
  },
  {
    id: "computer-diagnostics",
    number: "02",
    name: "Computer Diagnostics",
    shortName: "Diagnostics",
    category: "Diagnostics",
    eyebrow: "CLARITY BEFORE EVERY REPAIR",
    subtitle: "Know more. Guess less.",
    description:
      "A diagnostic service concept covering fault-code scanning, system observations, and a clear explanation of potential follow-up work.",
    basePrice: 1800,
    duration: "1–2 hours",
    image: IMAGES.precision,
    inclusions: [
      "Illustrative OBD diagnostic scan",
      "Basic warning-light review",
      "Selected electrical system checks",
      "Initial findings summary",
      "Recommendations for further inspection",
    ],
    process: [
      "Discuss reported symptoms",
      "Perform sample system checks",
      "Review observations",
      "Prepare a findings report",
    ],
  },
  {
    id: "brake-system-care",
    number: "03",
    name: "Brake System Care",
    shortName: "Brake Care",
    category: "Repairs",
    eyebrow: "CONTROL IN EVERY MOMENT",
    subtitle: "Confidence when it counts.",
    description:
      "An illustrative brake inspection and maintenance experience focused on component condition and recommended next steps.",
    basePrice: 2800,
    duration: "2–4 hours",
    image: IMAGES.details,
    inclusions: [
      "Brake pad condition inspection",
      "Disc and rotor visual review",
      "Brake fluid condition check",
      "Basic pedal response observation",
      "Suggested repair findings",
    ],
    process: [
      "Initial safety discussion",
      "Visual component inspection",
      "Review required repair work",
      "Document sample recommendations",
    ],
  },
  {
    id: "aircon-performance",
    number: "04",
    name: "Aircon Performance",
    shortName: "Aircon Care",
    category: "Maintenance",
    eyebrow: "COMFORT BUILT INTO EVERY DRIVE",
    subtitle: "Keep your cool.",
    description:
      "A vehicle air-conditioning care concept including cabin comfort checks, cooling observations, and filter condition review.",
    basePrice: 2400,
    duration: "1–3 hours",
    image: IMAGES.showroom,
    inclusions: [
      "Cabin air-flow observation",
      "Cooling performance review",
      "Cabin filter visual inspection",
      "Basic air-conditioning checks",
      "Illustrative findings summary",
    ],
    process: [
      "Discuss cooling concerns",
      "Perform sample checks",
      "Review findings",
      "Explain proposed next steps",
    ],
  },
  {
    id: "premium-detailing",
    number: "05",
    name: "Premium Detailing",
    shortName: "Detailing",
    category: "Detailing",
    eyebrow: "PRESENCE IN EVERY DETAIL",
    subtitle: "Rediscover the finish.",
    description:
      "An elevated aesthetic care experience concept combining detailed cleaning, finish presentation, and visual enhancement.",
    basePrice: 4500,
    duration: "3–5 hours",
    image: IMAGES.sport,
    featured: true,
    inclusions: [
      "Exterior wash and finish preparation",
      "Interior surface detailing",
      "Glass cleaning",
      "Wheel appearance care",
      "Final appearance walk-through",
    ],
    process: [
      "Initial condition documentation",
      "Cleaning and preparation concept",
      "Detailing process",
      "Visual quality review",
    ],
  },
  {
    id: "tire-wheel-inspection",
    number: "06",
    name: "Tire & Wheel Inspection",
    shortName: "Tire Care",
    category: "Maintenance",
    eyebrow: "BUILT TO STAY IN MOTION",
    subtitle: "Every journey starts at the wheels.",
    description:
      "A wheel and tire care concept centered on visual tire condition, pressure observations, and alignment recommendations.",
    basePrice: 1600,
    duration: "1–2 hours",
    image: IMAGES.drive,
    inclusions: [
      "Tire surface inspection",
      "Inflation pressure check concept",
      "Wheel condition review",
      "Tread wear observations",
      "Illustrative recommendations",
    ],
    process: [
      "Inspect visible tire condition",
      "Review sample measurements",
      "Explain findings",
      "Document suggested actions",
    ],
  },
];

export const UPGRADES = [
  {
    id: "interior-sanitizing",
    name: "Interior Sanitizing",
    price: 850,
    description: "Sample interior surface treatment.",
  },
  {
    id: "engine-bay-detail",
    name: "Engine Bay Detailing",
    price: 1200,
    description: "Additional cosmetic engine-bay care.",
  },
  {
    id: "premium-car-wash",
    name: "Premium Car Wash",
    price: 650,
    description: "Enhanced exterior wash package.",
  },
  {
    id: "pickup-assistance",
    name: "Vehicle Pickup Assistance",
    price: 1500,
    description: "Illustrative logistics service fee.",
  },
];

export const APPOINTMENT_TIMES = [
  {
    id: "08:00",
    name: "8:00 AM",
  },
  {
    id: "10:00",
    name: "10:00 AM",
  },
  {
    id: "13:00",
    name: "1:00 PM",
  },
  {
    id: "15:00",
    name: "3:00 PM",
  },
];

export const SERVICE_CATEGORIES = [
  "All",
  "Maintenance",
  "Diagnostics",
  "Repairs",
  "Detailing",
];

export const WORKFLOW = [
  {
    number: "01",
    title: "Choose your care.",
    description:
      "Explore services and select the automotive work you want to understand.",
  },
  {
    number: "02",
    title: "Build an estimate.",
    description:
      "Choose a vehicle category and preview a clear sample cost breakdown.",
  },
  {
    number: "03",
    title: "Plan your visit.",
    description:
      "Save a fictional appointment preference and track it in My Garage.",
  },
];

export const FAQS = [
  {
    question: "Is YOUR DRIVE. a real auto repair shop?",
    answer:
      "No. This is a fictional automotive service website concept created for a web development portfolio.",
  },
  {
    question: "Are the displayed service costs final?",
    answer:
      "No. All service estimates use invented demo prices. Real repair costs depend on vehicle condition, labor, parts, diagnostics, taxes, and inspection.",
  },
  {
    question: "Does saving an appointment reserve a service bay?",
    answer:
      "No. The appointment planner saves a demo request in this browser only. It does not check real workshop availability.",
  },
  {
    question: "Can I save my vehicle information?",
    answer:
      "Yes. My Garage can save fictional vehicle profiles locally in this browser. Do not enter plate numbers, contact details, or sensitive information.",
  },
];

export const findService = (id) =>
  SERVICES.find(
    (service) => service.id === id
  );

export const findVehicleType = (id) =>
  VEHICLE_TYPES.find(
    (type) => type.id === id
  );

export function formatPeso(value) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export function localDateKey(date = new Date()) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function dateAfter(days) {
  const date = new Date();

  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);

  return localDateKey(date);
}

export function formatDate(key) {
  if (!key) return "Date not selected";

  const date = new Date(
    `${key}T12:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleDateString("en-PH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function validAppointmentDate(key) {
  if (
    typeof key !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(key)
  ) {
    return false;
  }

  const date = new Date(
    `${key}T12:00:00`
  );

  if (
    Number.isNaN(date.getTime()) ||
    localDateKey(date) !== key
  ) {
    return false;
  }

  return (
    key >= dateAfter(1) &&
    key <= dateAfter(60) &&
    date.getDay() !== 0
  );
}

export function firstBookableDate() {
  let offset = 1;

  while (offset <= 60) {
    const key = dateAfter(offset);

    if (validAppointmentDate(key)) {
      return key;
    }

    offset += 1;
  }

  return "";
}

export function calculateEstimate({
  vehicleType,
  serviceIds = [],
  upgradeIds = [],
}) {
  const vehicle = findVehicleType(
    vehicleType
  );

  if (
    !vehicle ||
    !Array.isArray(serviceIds) ||
    !Array.isArray(upgradeIds)
  ) {
    return null;
  }

  const validServices = [
    ...new Set(serviceIds),
  ].filter((id) =>
    findService(id)
  );

  if (validServices.length === 0) {
    return null;
  }

  const services = validServices.map(
    (id) => {
      const service = findService(id);

      const total =
        Math.round(
          (service.basePrice *
            vehicle.multiplier) /
            50
        ) * 50;

      return {
        ...service,
        total,
      };
    }
  );

  const upgrades = [
    ...new Set(upgradeIds),
  ]
    .map(
      (id) =>
        UPGRADES.find(
          (item) => item.id === id
        )
    )
    .filter(Boolean)
    .map((item) => ({
      ...item,
      total: item.price,
    }));

  const serviceTotal = services.reduce(
    (sum, item) => sum + item.total,
    0
  );

  const upgradeTotal = upgrades.reduce(
    (sum, item) => sum + item.total,
    0
  );

  return {
    vehicle,
    services,
    upgrades,
    serviceTotal,
    upgradeTotal,
    total: serviceTotal + upgradeTotal,
  };
}