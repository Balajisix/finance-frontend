export const CATEGORIES = [
  "Salary",
  "Freelance",
  "Investment",
  "Food",
  "Transport",
  "Rent",
  "Utilities",
  "Healthcare",
  "Entertainment",
  "Education",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];
