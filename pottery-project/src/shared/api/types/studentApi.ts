// shared/api/types/studentApi.ts
export interface StudentProfile {
  userId: string;
  fullName: string;
  about: string;
}

export interface Student {
  id: string;
  profile: StudentProfile;
}