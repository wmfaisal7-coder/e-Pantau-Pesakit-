import { useEffect, useMemo, useState } from "react";
import { Layout } from "./components/Layout";
import { getFollowUpRequired } from "./lib";
import { DashboardPage } from "./pages/DashboardPage";
import { FollowUpPage } from "./pages/FollowUpPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { LoginPage } from "./pages/LoginPage";
import { PatientsPage } from "./pages/PatientsPage";
import { AppointmentsPage } from "./pages/AppointmentsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { createAppointment, createFollowUpIfNeeded, createPatient, deleteAppointment, deletePatient, getAppSettings, getAppointments, getFollowUps, getNotificationLogs, getPatients, saveAppSettings, updateAppointment, updatePatient } from "./services/dataService";
import { getCurrentUserEmail, signOut } from "./services/authService";
import { hasSupabaseConfig } from "./supabase";
import type { Appointment, FollowUp, NotificationLog, Patient, ViewName } from "./types";

const pageConfig: Record<ViewName, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Pantau pesakit, temujanji, dan tindakan susulan dalam satu paparan."
  },
  patients: {
    title: "Pesakit",
    subtitle: "Urus maklumat pesakit dan lihat rawatan seterusnya."
  },
  appointments: {
    title: "Temujanji",
    subtitle: "Semak status temujanji dan jadual rawatan pesakit."
  },
  notifications: {
    title: "Notifikasi",
    subtitle: "Urus peringatan temujanji yang perlu dihantar tanpa mengubah dashboard utama."
  },
  followup: {
    title: "Follow-Up",
    subtitle: "Keutamaan untuk pesakit yang perlu dihubungi semula."
  },
  reports: {
    title: "Laporan",
    subtitle: "Ringkasan prestasi rawatan, temujanji, dan follow-up."
  },
  settings: {
    title: "Tetapan",
    subtitle: "Kemas kini maklumat asas dan konfigurasi sistem."
  }
};

function inferRole(email: string): "admin" | "staff" | "viewer" {
  if (email.includes("viewer")) return "viewer";
  if (email.includes("staff")) return "staff";
  return "admin";
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("admin@klinik.com");
  const [userRole, setUserRole] = useState<"admin" | "staff" | "viewer">("admin");
  const [view, setView] = useState<ViewName>("dashboard");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  const [clinicName, setClinicName] = useState("Klinik A");
  const [theme, setTheme] = useState("Dark");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [toast, setToast] = useState("");

  async function refreshAll(showLoader = false) {
    try {
      if (showLoader) setLoading(true);
      const [patientsData, appointmentsData, followUpsData, email, settings, notificationLogsData] = await Promise.all([
        getPatients(),
        getAppointments(),
        getFollowUps(),
        getCurrentUserEmail(),
        getAppSettings(),
        getNotificationLogs()
      ]);
      setPatients(patientsData);
      setAppointments(appointmentsData);
      setFollowUps(followUpsData);
      setNotificationLogs(notificationLogsData);
      setClinicName(settings.clinicName);
      setTheme(settings.theme);
      if (email) {
        setUserEmail(email);
        setUserRole(inferRole(email));
      }
    } catch (error) {
      console.error(error);
      setLoadError("Data gagal dimuatkan.");
    } finally {
      if (showLoader) setLoading(false);
    }
  }

  useEffect(() => {
    refreshAll(true);
  }, []);

  useEffect(() => {
    if (loggedIn) {
      refreshAll(true);
    }
  }, [loggedIn]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const pendingFollowUpCount = useMemo(
    () => appointments.filter((appointment) => getFollowUpRequired(appointment) === "Ya").length,
    [appointments]
  );

  const pendingNotificationCount = useMemo(
    () => appointments.filter((appointment) => getFollowUpRequired(appointment) !== "Ya" && appointment.manualStatus === "Dijadualkan" && appointment.reminderStatus === "Belum Dihantar").filter((appointment) => {
      const days = new Date(appointment.appointmentDate).getTime() - new Date("2026-04-20").getTime();
      const diffDays = Math.round(days / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 3;
    }).length,
    [appointments]
  );

  const canEdit = userRole === "admin" || userRole === "staff";

  async function handleCreatePatient(payload: Omit<Patient, "id">) {
    if (!canEdit) return;
    const mockPatient: Patient = { id: crypto.randomUUID(), ...payload };
    setPatients((current) => [...current, mockPatient]);
    try {
      const created = await createPatient(payload);
      if (created) {
        setPatients((current) => current.map((item) => item.id === mockPatient.id ? created : item));
      }
      await refreshAll();
      setToast("Pesakit berjaya ditambah dan disimpan online.");
    } catch (error) {
      console.error(error);
      setToast("Pesakit ditambah dalam mode demo.");
    }
  }

  async function handleUpdatePatient(payload: Patient) {
    if (!canEdit) return;
    const previous = patients;
    setPatients((current) => current.map((item) => item.id === payload.id ? payload : item));
    try {
      const updated = await updatePatient(payload);
      if (updated) {
        setPatients((current) => current.map((item) => item.id === payload.id ? updated : item));
      }
      await refreshAll();
      setToast("Pesakit berjaya dikemas kini.");
    } catch (error) {
      console.error(error);
      setPatients(previous);
      setToast("Kemaskini pesakit gagal.");
    }
  }

  async function handleDeletePatient(id: string) {
    if (userRole !== "admin") return;
    const previous = patients;
    setPatients((current) => current.filter((item) => item.id !== id));
    try {
      await deletePatient(id);
      await refreshAll();
      setToast("Pesakit berjaya dipadam.");
    } catch (error) {
      console.error(error);
      setPatients(previous);
      setToast("Padam pesakit gagal.");
    }
  }

  async function handleCreateAppointment(payload: Omit<Appointment, "id">) {
    if (!canEdit) return;
    const mockAppointment: Appointment = { id: crypto.randomUUID(), ...payload, reminderStatus: payload.reminderStatus ?? "Belum Dihantar", reminderSentAt: payload.reminderSentAt ?? null, reminderChannel: payload.reminderChannel ?? null, reminderNote: payload.reminderNote ?? null };
    setAppointments((current) => [...current, mockAppointment]);

    try {
      const created = await createAppointment(payload);
      const finalAppointment = created ?? mockAppointment;

      if (created) {
        setAppointments((current) => current.map((item) => item.id === mockAppointment.id ? created : item));
      }

      if (payload.manualStatus === "Tidak Hadir" || payload.manualStatus === "Dijadualkan") {
        const followUp = await createFollowUpIfNeeded({
          appointmentId: finalAppointment.id,
          patientId: payload.patientId
        });
        if (followUp) {
          setFollowUps((current) => {
            const exists = current.some((item) => item.id === followUp.id);
            return exists ? current : [...current, followUp];
          });
        }
      }

      await refreshAll();
      setToast("Temujanji berjaya ditambah dan disimpan online.");
    } catch (error) {
      console.error(error);
      setToast("Temujanji ditambah dalam mode demo.");
    }
  }

  async function handleUpdateAppointment(payload: Appointment) {
    if (!canEdit) return;
    const previous = appointments;
    setAppointments((current) => current.map((item) => item.id === payload.id ? payload : item));
    try {
      const updated = await updateAppointment(payload);
      if (updated) {
        setAppointments((current) => current.map((item) => item.id === payload.id ? updated : item));
      }
      await refreshAll();
      setToast("Temujanji berjaya dikemas kini.");
    } catch (error) {
      console.error(error);
      setAppointments(previous);
      setToast("Kemaskini temujanji gagal.");
    }
  }

  async function handleDeleteAppointment(id: string) {
    if (userRole !== "admin") return;
    const previous = appointments;
    setAppointments((current) => current.filter((item) => item.id !== id));
    try {
      await deleteAppointment(id);
      await refreshAll();
      setToast("Temujanji berjaya dipadam.");
    } catch (error) {
      console.error(error);
      setAppointments(previous);
      setToast("Padam temujanji gagal.");
    }
  }

  async function handleSaveSettings(payload: { clinicName: string; theme: string }) {
    setClinicName(payload.clinicName);
    setTheme(payload.theme);
    try {
      await saveAppSettings(payload);
      await refreshAll();
      setToast("Tetapan berjaya disimpan.");
    } catch (error) {
      console.error(error);
      setToast("Tetapan disimpan dalam mode demo.");
    }
  }

  async function handleLogout() {
    await signOut();
    setLoggedIn(false);
  }

  if (!loggedIn) {
    return <LoginPage onLogin={(email) => {
      const nextEmail = email ?? "admin@klinik.com";
      setUserEmail(nextEmail);
      setUserRole(inferRole(nextEmail));
      setLoggedIn(true);
    }} />;
  }

  return (
    <Layout
      current={view}
      title={pageConfig[view].title}
      subtitle={pageConfig[view].subtitle}
      pendingFollowUpCount={pendingFollowUpCount}
      pendingNotificationCount={pendingNotificationCount}
      userEmail={userEmail}
      clinicName={clinicName}
      theme={theme}
      onLogout={handleLogout}
      onNavigate={setView}
    >
      {!hasSupabaseConfig ? (
        <div className="alert-banner">
          <strong>Mode demo aktif.</strong>
          <span>Masukkan Supabase URL dan anon key dalam fail .env untuk guna data sebenar.</span>
        </div>
      ) : null}

      {!canEdit ? (
        <div className="alert-banner">
          <strong>Mode viewer aktif.</strong>
          <span>Akaun ini hanya boleh melihat data tanpa mengubah rekod.</span>
        </div>
      ) : null}

      {loading ? (
        <div className="card"><div className="card-title">Memuatkan data...</div><p>Sedang mengambil data sistem.</p></div>
      ) : loadError ? (
        <div className="alert-banner danger"><strong>Ralat.</strong><span>{loadError}</span></div>
      ) : (
        <>
          {view === "dashboard" && (
            <DashboardPage
              patients={patients}
              appointments={appointments}
              followUps={followUps}
              onOpenFollowUp={() => setView("followup")}
            />
          )}
          {view === "patients" && (
            <PatientsPage
              patients={patients}
              appointments={appointments}
              onCreatePatient={handleCreatePatient}
              onUpdatePatient={handleUpdatePatient}
              onDeletePatient={handleDeletePatient}
              canEdit={canEdit}
              canDelete={userRole === "admin"}
            />
          )}
          {view === "appointments" && (
            <AppointmentsPage
              appointments={appointments}
              patients={patients}
              onCreateAppointment={handleCreateAppointment}
              onUpdateAppointment={handleUpdateAppointment}
              onDeleteAppointment={handleDeleteAppointment}
              canEdit={canEdit}
              canDelete={userRole === "admin"}
            />
          )}
          {view === "notifications" && (
            <NotificationsPage
              appointments={appointments}
              patients={patients}
              logs={notificationLogs}
              onRefresh={() => refreshAll()}
            />
          )}
          {view === "followup" && (
            <FollowUpPage
              patients={patients}
              appointments={appointments}
              followUpItems={followUps}
              onUpdated={setFollowUps}
              onRefresh={() => refreshAll()}
            />
          )}
          {view === "reports" && <ReportsPage patients={patients} appointments={appointments} followUps={followUps} />}
          {view === "settings" && <SettingsPage userEmail={userEmail} role={userRole} clinicName={clinicName} theme={theme} onSave={handleSaveSettings} />}
        </>
      )}

      {toast ? <div className="toast">{toast}</div> : null}
    </Layout>
  );
}
