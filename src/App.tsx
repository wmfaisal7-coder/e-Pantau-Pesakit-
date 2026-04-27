import { getFollowUpRequired } from "./lib";
import { DashboardPage } from "./pages/DashboardPage";
import { FollowUpPage } from "./pages/FollowUpPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { LoginPage } from "./pages/LoginPage";
import { PatientsPage } from "./pages/PatientsPage";
import { AppointmentsPage } from "./pages/AppointmentsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { createAppointment, createFollowUpIfNeeded, createPatient, deleteAppointment, deletePatient, getAppSettings, getAppointments, getFollowUps, getPatients, saveAppSettings, updateAppointment, updatePatient } from "./services/dataService";
import { createAppointment, createFollowUpIfNeeded, createPatient, deleteAppointment, deletePatient, getAppSettings, getAppointments, getFollowUps, getNotificationLogs, getPatients, saveAppSettings, updateAppointment, updatePatient } from "./services/dataService";
import { getCurrentUserEmail, signOut } from "./services/authService";
import { hasSupabaseConfig } from "./supabase";
import type { Appointment, FollowUp, Patient, ViewName } from "./types";
import type { Appointment, FollowUp, NotificationLog, Patient, ViewName } from "./types";

const pageConfig: Record<ViewName, { title: string; subtitle: string }> = {
  dashboard: {
@@ -26,6 +27,10 @@ const pageConfig: Record<ViewName, { title: string; subtitle: string }> = {
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
@@ -54,6 +59,7 @@ export default function App() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  const [clinicName, setClinicName] = useState("Klinik A");
  const [theme, setTheme] = useState("Dark");
  const [loading, setLoading] = useState(true);
@@ -63,16 +69,18 @@ export default function App() {
  async function refreshAll(showLoader = false) {
    try {
      if (showLoader) setLoading(true);
      const [patientsData, appointmentsData, followUpsData, email, settings] = await Promise.all([
      const [patientsData, appointmentsData, followUpsData, email, settings, notificationLogsData] = await Promise.all([
        getPatients(),
        getAppointments(),
        getFollowUps(),
        getCurrentUserEmail(),
        getAppSettings()
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
@@ -102,6 +110,15 @@ export default function App() {
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
@@ -156,7 +173,7 @@ export default function App() {

  async function handleCreateAppointment(payload: Omit<Appointment, "id">) {
    if (!canEdit) return;
    const mockAppointment: Appointment = { id: crypto.randomUUID(), ...payload };
    const mockAppointment: Appointment = { id: crypto.randomUUID(), ...payload, reminderStatus: payload.reminderStatus ?? "Belum Dihantar", reminderSentAt: payload.reminderSentAt ?? null, reminderChannel: payload.reminderChannel ?? null, reminderNote: payload.reminderNote ?? null };
    setAppointments((current) => [...current, mockAppointment]);

    try {
@@ -254,6 +271,7 @@ export default function App() {
      title={pageConfig[view].title}
      subtitle={pageConfig[view].subtitle}
      pendingFollowUpCount={pendingFollowUpCount}
      pendingNotificationCount={pendingNotificationCount}
      userEmail={userEmail}
      clinicName={clinicName}
      theme={theme}
@@ -310,6 +328,14 @@ export default function App() {
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
