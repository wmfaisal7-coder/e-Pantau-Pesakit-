import { appointments as mockAppointments, followUps as mockFollowUps, patients as mockPatients } from "../data/mockData";
import type { Appointment, FollowUp, Patient } from "../types";
import { hasSupabaseConfig, supabase } from "../supabase";

function mapPatient(row: any): Patient {
  return {
    id: row.id,
    patientCode: row.patient_code,
    fullName: row.full_name,
    nationalId: row.national_id,
    address: row.address ?? "",
    phoneNumber: row.phone_number,
    diseaseType: row.disease_type,
    treatmentType: row.treatment_type,
    patientStatus: row.patient_status,
    notes: row.notes ?? ""
  };
}

function mapAppointment(row: any): Appointment {
  return {
    id: row.id,
    appointmentCode: row.appointment_code,
    patientId: row.patient_id,
    appointmentDate: row.appointment_date,
    appointmentTime: row.appointment_time,
    treatmentType: row.treatment_type,
    clinicOrOfficer: row.clinic_or_officer,
    manualStatus: row.manual_status,
    notes: row.notes ?? ""
  };
}

function mapFollowUp(row: any): FollowUp {
  return {
    id: row.id,
    appointmentId: row.appointment_id,
    patientId: row.patient_id,
    contactStatus: row.contact_status,
    followUpNote: row.follow_up_note ?? "",
    followUpDate: row.follow_up_date ?? null,
    handledBy: row.handled_by ?? null
  };
}

export async function getPatients(): Promise<Patient[]> {
  if (!hasSupabaseConfig || !supabase) return mockPatients;
  const { data, error } = await supabase.from("patients").select("*").order("patient_code");
  if (error) throw error;
  return (data ?? []).map(mapPatient);
}

export async function getAppointments(): Promise<Appointment[]> {
  if (!hasSupabaseConfig || !supabase) return mockAppointments;
  const { data, error } = await supabase.from("appointments").select("*").order("appointment_date");
  if (error) throw error;
  return (data ?? []).map(mapAppointment);
}

export async function getFollowUps(): Promise<FollowUp[]> {
  if (!hasSupabaseConfig || !supabase) return mockFollowUps;
  const { data, error } = await supabase.from("follow_ups").select("*").order("created_at");
  if (error) throw error;
  return (data ?? []).map(mapFollowUp);
}

export async function createPatient(payload: Omit<Patient, "id">): Promise<Patient | null> {
  if (!hasSupabaseConfig || !supabase) return null;

  const { data, error } = await supabase
    .from("patients")
    .insert({
      patient_code: payload.patientCode,
      full_name: payload.fullName,
      national_id: payload.nationalId,
      address: payload.address,
      phone_number: payload.phoneNumber,
      disease_type: payload.diseaseType,
      treatment_type: payload.treatmentType,
      patient_status: payload.patientStatus,
      notes: payload.notes
    })
    .select()
    .single();

  if (error) throw error;
  return mapPatient(data);
}

export async function updatePatient(payload: Patient): Promise<Patient | null> {
  if (!hasSupabaseConfig || !supabase) return null;

  const { data, error } = await supabase
    .from("patients")
    .update({
      patient_code: payload.patientCode,
      full_name: payload.fullName,
      national_id: payload.nationalId,
      address: payload.address,
      phone_number: payload.phoneNumber,
      disease_type: payload.diseaseType,
      treatment_type: payload.treatmentType,
      patient_status: payload.patientStatus,
      notes: payload.notes
    })
    .eq("id", payload.id)
    .select()
    .single();

  if (error) throw error;
  return mapPatient(data);
}

export async function deletePatient(id: string): Promise<void> {
  if (!hasSupabaseConfig || !supabase) return;
  const { error } = await supabase.from("patients").delete().eq("id", id);
  if (error) throw error;
}

export async function createAppointment(payload: Omit<Appointment, "id">): Promise<Appointment | null> {
  if (!hasSupabaseConfig || !supabase) return null;

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      appointment_code: payload.appointmentCode,
      patient_id: payload.patientId,
      appointment_date: payload.appointmentDate,
      appointment_time: payload.appointmentTime,
      treatment_type: payload.treatmentType,
      clinic_or_officer: payload.clinicOrOfficer,
      manual_status: payload.manualStatus,
      notes: payload.notes
    })
    .select()
    .single();

  if (error) throw error;
  return mapAppointment(data);
}

export async function updateAppointment(payload: Appointment): Promise<Appointment | null> {
  if (!hasSupabaseConfig || !supabase) return null;

  const { data, error } = await supabase
    .from("appointments")
    .update({
      appointment_code: payload.appointmentCode,
      patient_id: payload.patientId,
      appointment_date: payload.appointmentDate,
      appointment_time: payload.appointmentTime,
      treatment_type: payload.treatmentType,
      clinic_or_officer: payload.clinicOrOfficer,
      manual_status: payload.manualStatus,
      notes: payload.notes
    })
    .eq("id", payload.id)
    .select()
    .single();

  if (error) throw error;
  return mapAppointment(data);
}

export async function deleteAppointment(id: string): Promise<void> {
  if (!hasSupabaseConfig || !supabase) return;
  const { error } = await supabase.from("appointments").delete().eq("id", id);
  if (error) throw error;
}

export async function createFollowUpIfNeeded(payload: {
  appointmentId: string;
  patientId: string;
}): Promise<FollowUp | null> {
  if (!hasSupabaseConfig || !supabase) return null;

  const { data: existing, error: findError } = await supabase
    .from("follow_ups")
    .select("*")
    .eq("appointment_id", payload.appointmentId)
    .maybeSingle();

  if (findError) throw findError;
  if (existing) return mapFollowUp(existing);

  const { data, error } = await supabase
    .from("follow_ups")
    .insert({
      appointment_id: payload.appointmentId,
      patient_id: payload.patientId,
      contact_status: "Belum Dihubungi"
    })
    .select()
    .single();

  if (error) throw error;
  return mapFollowUp(data);
}

export async function updateFollowUp(payload: FollowUp): Promise<void> {
  if (!hasSupabaseConfig || !supabase) return;

  const { error } = await supabase
    .from("follow_ups")
    .update({
      contact_status: payload.contactStatus,
      follow_up_note: payload.followUpNote,
      follow_up_date: payload.followUpDate,
      handled_by: payload.handledBy
    })
    .eq("id", payload.id);

  if (error) throw error;
}

export interface AppSettings {
  clinicName: string;
  theme: string;
}

export async function getAppSettings(): Promise<AppSettings> {
  if (!hasSupabaseConfig || !supabase) {
    return { clinicName: "Klinik A", theme: "Dark" };
  }

  const { data, error } = await supabase
    .from("app_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return { clinicName: "Klinik A", theme: "Dark" };
  }

  return {
    clinicName: data.clinic_name ?? "Klinik A",
    theme: data.theme ?? "Dark"
  };
}

export async function saveAppSettings(payload: AppSettings): Promise<void> {
  if (!hasSupabaseConfig || !supabase) return;

  const { data: existing } = await supabase
    .from("app_settings")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase
      .from("app_settings")
      .update({
        clinic_name: payload.clinicName,
        theme: payload.theme,
        updated_at: new Date().toISOString()
      })
      .eq("id", existing.id);

    if (error) throw error;
    return;
  }

  const { error } = await supabase.from("app_settings").insert({
    clinic_name: payload.clinicName,
    theme: payload.theme
  });

  if (error) throw error;
}
