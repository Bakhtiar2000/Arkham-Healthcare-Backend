//  For other query fields than searchTerm  (exact match)
export const userFilterableFields: string[] = [
  "email",
  "searchTerm",
  "role",
  "status",
];

// Only for searchTerm  (partial match)
export const userSearchableFields: string[] = ["email"];
