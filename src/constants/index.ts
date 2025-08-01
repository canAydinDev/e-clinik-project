export const GenderOptions = ["Male", "Female", "Other"] as const;
export type Gender = (typeof GenderOptions)[number];

export const PatientFormDefaultValues = {
  name: "",
  email: "",
  phone: "",
  birthDate: new Date(Date.now()),

  address: "",
  occupation: "",
  emergencyContactName: "",
  emergencyContactNumber: "",

  allergies: "",
  currentMedication: "",
  familyMedicalHistory: "",
  pastMedicalHistory: "",

  identificationNumber: "",
  face: [],
};

export const StatusIcon = {
  scheduled: "/assets/icons/check.svg",
  pending: "/assets/icons/pending.svg",
  cancelled: "/assets/icons/cancelled.svg",
};
