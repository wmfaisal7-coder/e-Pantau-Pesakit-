import type { Appointment, SystemStatus } from "./types";

export const TODAY = "2026-04-20";

export function getSystemStatus(appointment: Appointment): SystemStatus {
  if (appointment.manualStatus === "Selesai") return "Selesai";
  if (appointment.manualStatus === "Dibatalkan") return "Dibatalkan";
  if (appointment.manualStatus === "Tidak Hadir") return "Terlepas";

  const appt = new Date(appointment.appointmentDate).getTime();
  const today = new Date(TODAY).getTime();
  const diffDays = Math.round((appt - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Terlepas";
  if (diffDays === 0) return "Hari Ini";
  if (diffDays <= 3) return "Akan Datang";
  return "Dijadualkan";
}

export function getDaysRemaining(appointmentDate: string): number {
  const appt = new Date(appointmentDate).getTime();
  const today = new Date(TODAY).getTime();
  return Math.round((appt - today) / (1000 * 60 * 60 * 24));
}

export function getFollowUpRequired(appointment: Appointment): "Ya" | "Tidak" {
  const systemStatus = getSystemStatus(appointment);
  if (appointment.manualStatus === "Tidak Hadir") return "Ya";
  if (systemStatus === "Terlepas" || systemStatus === "Hari Ini") return "Ya";
  return "Tidak";
}
