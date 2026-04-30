export type PatientStatus = "Aktif" | "Tidak Aktif" | "Selesai Rawatan";
export type ManualStatus = "Dijadualkan" | "Selesai" | "Dibatalkan" | "Ditunda" | "Tidak Hadir";
export type SystemStatus = "Selesai" | "Dibatalkan" | "Terlepas" | "Hari Ini" | "Akan Datang" | "Dijadualkan";
export type ContactStatus = "Belum Dihubungi" | "Sudah Dihubungi" | "Tidak Berjaya Dihubungi" | "Jadual Semula" | "Menolak Rawatan";

export interface Patient {
  id: string;
  patientCode: string;
  fullName: string;
  nationalId: string;
  address: string;
  phoneNumber: string;
  diseaseType: string;
  treatmentType: string;
  patientStatus: PatientStatus;
  notes: string;
}

export interface Appointment {
  id: string;
  appointmentCode: string;
  patientId: string;
  appointmentDate: string;
  appointmentTime: string;
  treatmentType: string;
  clinicOrOfficer: string;
  manualStatus: ManualStatus;
  notes: string;
}

export interface FollowUp {
  id: string;
  appointmentId: string;
  patientId: string;
  contactStatus: ContactStatus;
  followUpNote: string;
  followUpDate: string | null;
  handledBy: string | null;
}

export type ViewName = "dashboard" | "patients" | "appointments" | "followup" | "reports" | "settings";
