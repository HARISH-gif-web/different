export interface Category {
  slug: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  complaints: string[];
  department: string;
}

export const CATEGORIES: Category[] = [
  {
    slug: "food-welfare",
    name: "Food & Public Welfare",
    icon: "🍚",
    description:
      "Report issues regarding food quality, mid-day meals, Anna Canteen, and welfare services.",
    color: "from-orange-500 to-amber-500",
    department: "Civil Supplies Department",
    complaints: ["Food Quality", "Anna Canteen"],
  },
  {
    slug: "civic-infra",
    name: "Civic Infrastructure",
    icon: "🏛",
    description:
      "Report road damage, street lights, water supply, and municipal sanitation issues.",
    color: "from-blue-500 to-indigo-500",
    department: "Municipal Administration",
    complaints: ["Road Damage", "Street Lights", "Water Supply", "Garbage"],
  },
  {
    slug: "education",
    name: "Education",
    icon: "🎓",
    description: "Report issues in government schools, colleges, and higher education facilities.",
    color: "from-purple-500 to-fuchsia-500",
    department: "School Education Department",
    complaints: ["School Issues", "College Issues"],
  },
  {
    slug: "health-services",
    name: "Health Services",
    icon: "🏥",
    description: "Report medical shortages, doctor unavailability, and government hospital issues.",
    color: "from-rose-500 to-red-500",
    department: "Health Department",
    complaints: ["Hospital Issues"],
  },
  {
    slug: "other",
    name: "Other",
    icon: "➕",
    description:
      "Report corruption, traffic hazards, housing, environment, police complaints, and other grievances.",
    color: "from-slate-500 to-gray-600",
    department: "General Administration",
    complaints: [
      "Corruption",
      "Traffic Issues",
      "Police Complaints",
      "Housing Issues",
      "Revenue Issues",
      "Environmental Issues",
      "Other Issues",
    ],
  },
];

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getDepartmentForComplaintType(type: string): string {
  switch (type) {
    case "Food Quality":
    case "Anna Canteen":
      return "Civil Supplies Department";
    case "Garbage":
      return "Municipality";
    case "Road Damage":
      return "Roads & Buildings Department";
    case "Water Supply":
      return "Water Resources Department";
    case "Street Lights":
      return "Electricity Department";
    case "School Issues":
      return "School Education Department";
    case "College Issues":
      return "Higher Education Department";
    case "Hospital Issues":
      return "Health Department";
    case "Traffic Issues":
      return "Traffic Police";
    case "Police Complaints":
      return "Police Department";
    case "Housing Issues":
      return "Housing Department";
    case "Revenue Issues":
      return "Revenue Department";
    case "Environmental Issues":
      return "Environment Department";
    case "Corruption":
      return "Anti-Corruption Bureau / Vigilance Department";
    default:
      return "General Administration Department";
  }
}
