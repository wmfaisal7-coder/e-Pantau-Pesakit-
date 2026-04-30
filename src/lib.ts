import type { Appointment, SystemStatus } from "./types";

function getTodayStart(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function getSystemStatus(appointment: Appointment): SystemStatus {
  if (appointment.manualStatus === "Selesai") return "Selesai";
  if (appointment.manualStatus === "Dibatalkan") return "Dibatalkan";
  if (appointment.manualStatus === "Tidak Hadir") return "Terlepas";

  const appt = new Date(appointment.appointmentDate);
  appt.setHours(0, 0, 0, 0);

  const today = getTodayStart();
  const diffDays = Math.round((appt.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Terlepas";
  if (diffDays === 0) return "Hari Ini";
  if (diffDays <= 3) return "Akan Datang";
  return "Dijadualkan";
}

export function getDaysRemaining(appointmentDate: string): number {
  const appt = new Date(appointmentDate);
  appt.setHours(0, 0, 0, 0);

  const today = getTodayStart();
  return Math.round((appt.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getFollowUpRequired(appointment: Appointment): "Ya" | "Tidak" {
  const systemStatus = getSystemStatus(appointment);
  if (appointment.manualStatus === "Tidak Hadir") return "Ya";
  if (systemStatus === "Terlepas" || systemStatus === "Hari Ini") return "Ya";
  return "Tidak";
}
