export type TDoctorFilterRequest = {
  searchTerm?: string | undefined;
  email?: string | undefined;
  contactNo?: string | undefined;
  gender?: string | undefined;
  specialties?: string | undefined;
};

export type TDoctorUpdate = {
  name: string;
  profilePhoto: string;
  contactNumber: string;
  address: string;
  registrationNumber: string;
  experience: number;
  gender: "MALE" | "FEMALE";
  apointmentFee: number;
  qualification: string;
  currentWorkingPlace: string;
  designation: string;
  specialties: TSpecialties[];
};

export type TSpecialties = {
  specialtiesId: string;
  isDeleted?: null;
};
