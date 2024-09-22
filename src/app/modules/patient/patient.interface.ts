import { BloodGroup, Gender, MaritalStatus } from "@prisma/client";

export type TPatientFilterRequest = {
  searchTerm?: string | undefined;
  email?: string | undefined;
  contactNo?: string | undefined;
};

type TPatientHealthData = {
  gender: Gender;
  dateOfBirth: string;
  bloodGroup: BloodGroup;
  hasAllergies?: boolean;
  hasDiabetes?: boolean;
  height: string;
  weight: string;
  smokingStatus?: boolean;
  dietaryPreferences?: string;
  pregnancyStatus?: boolean;
  mentalHealthHistory?: string;
  immunizationStatus?: string;
  hasPastSurgeries?: boolean;
  recentAnxiety?: boolean;
  recentDepression?: boolean;
  maritalStatus?: MaritalStatus;
};

type TMedicalReport = {
  reportName: string;
  reportLink: string;
};

export type TPatientUpdate = {
  name: string;
  contactNumber: string;
  address: string;
  patientHealthData: TPatientHealthData;
  medicalReport: TMedicalReport;
};
