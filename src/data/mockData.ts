import type { Appointment, FollowUp, Patient } from "../types";

export const patients: Patient[] = [
  {
    id: "1",
    patientCode: "P001",
    fullName: "Siti Aminah binti Kassim",
    nationalId: "900101-01-1234",
    address: "No 12, Jalan Melur, Shah Alam",
    phoneNumber: "012-3456789",
    diseaseType: "Diabetes",
    treatmentType: "Insulin",
    patientStatus: "Aktif",
    notes: "Perlu datang setiap bulan"
  },
  {
    id: "2",
    patientCode: "P002",
    fullName: "Ahmad Faiz bin Roslan",
    nationalId: "880202-10-5678",
    address: "No 8, Taman Murni, Klang",
    phoneNumber: "013-9876543",
    diseaseType: "Hipertensi",
    treatmentType: "Ubat tekanan darah",
    patientStatus: "Aktif",
    notes: "Pantau bacaan darah"
  },
  {
    id: "3",
    patientCode: "P003",
    fullName: "Ravi Kumar a/l Subramaniam",
    nationalId: "750505-14-2222",
    address: "No 5, Jalan Kenanga, PJ",
    phoneNumber: "016-2233445",
    diseaseType: "Asma",
    treatmentType: "Inhaler",
    patientStatus: "Tidak Aktif",
    notes: "Berpindah klinik"
  }
];

export const appointments: Appointment[] = [
  {
    id: "1",
    appointmentCode: "T001",
    patientId: "1",
    appointmentDate: "2026-04-18",
    appointmentTime: "09:00",
    treatmentType: "Insulin",
    clinicOrOfficer: "Klinik A",
    manualStatus: "Dijadualkan",
    notes: "",
    reminderStatus: "Belum Dihantar",
    reminderSentAt: null,
    reminderChannel: null,
    reminderNote: null
  },
  {
    id: "2",
    appointmentCode: "T002",
    patientId: "2",
    appointmentDate: "2026-04-20",
    appointmentTime: "10:30",
    treatmentType: "Ubat tekanan darah",
    clinicOrOfficer: "Klinik A",
    manualStatus: "Dijadualkan",
    notes: "",
    reminderStatus: "Belum Dihantar",
    reminderSentAt: null,
    reminderChannel: null,
    reminderNote: null
  },
  {
    id: "3",
    appointmentCode: "T003",
    patientId: "1",
    appointmentDate: "2026-04-25",
    appointmentTime: "11:00",
    treatmentType: "Semakan susulan",
    clinicOrOfficer: "Klinik A",
    manualStatus: "Dijadualkan",
    notes: "",
    reminderStatus: "Belum Dihantar",
    reminderSentAt: null,
    reminderChannel: null,
    reminderNote: null
  },
  {
    id: "4",
    appointmentCode: "T004",
    patientId: "3",
    appointmentDate: "2026-04-15",
    appointmentTime: "08:30",
    treatmentType: "Inhaler",
    clinicOrOfficer: "Klinik B",
    manualStatus: "Tidak Hadir",
    notes: "",
    reminderStatus: "Tidak Perlu",
    reminderSentAt: null,
    reminderChannel: null,
    reminderNote: null
  }
];

export const followUps: FollowUp[] = [
  {
    id: "FU001",
    appointmentId: "1",
    patientId: "1",
    contactStatus: "Belum Dihubungi",
    followUpNote: "",
    followUpDate: null,
    handledBy: null
  },
  {
    id: "FU002",
    appointmentId: "4",
    patientId: "3",
    contactStatus: "Belum Dihubungi",
    followUpNote: "",
    followUpDate: null,
    handledBy: null
  },
  {
    id: "FU003",
    appointmentId: "2",
    patientId: "2",
    contactStatus: "Belum Dihubungi",
    followUpNote: "",
    followUpDate: null,
    handledBy: null
  }
];
