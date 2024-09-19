export const userSearchableFields: string[] = ["email"]; // Only for searchTerm  (partial match)

//  For other query fields than searchTerm  (exact match)
export const userFilterableFields: string[] = [
  "email",
  "searchTerm",
  "role",
  "status",
];
