import { useMemo, useState } from "react";
import { getDaysRemaining, getSystemStatus, needsReminder } from "../lib";
import { markReminderSent } from "../services/dataService";
import type { Appointment, NotificationLog, Patient } from "../types";

interface Props {
  appointments: Appointment[];
  patients: Patient[];
  logs: NotificationLog[];
  onRefresh?: () => Promise<void> | void;
}

export function NotificationsPage({ appointments, patients, logs, onRefresh }: Props) {
  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const pendingReminders = useMemo(() => {
    return appointments.filter((appointment) => {
      if (!needsReminder(appointment)) return false;
      const patient = patients.find((p) => p.id === appointment.patientId);
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return Boolean(
        appointment.appointmentCode.toLowerCase().includes(q) ||
        appointment.treatmentType.toLowerCase().includes(q) ||
        patient?.fullName.toLowerCase().includes(q) ||
        patient?.phoneNumber.toLowerCase().includes(q)
      );
    });
  }, [appointments, patients, query]);

  async function handleMarkSent(appointment: Appointment) {
    const patient = patients.find((p) => p.id === appointment.patientId);
    if (!patient) return;
    setSavingId(appointment.id);
    try {
      await markReminderSent({
        appointmentId: appointment.id,
        patientId: patient.id,
        channel: "Dalam Sistem",
        message: `Peringatan temujanji ${appointment.appointmentDate} ${appointment.appointmentTime} untuk ${patient.fullName}`
      });
      if (onRefresh) await onRefresh();
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="stack-lg">
      <div className="grid-stats">
        <div className="mini-stat warning"><div className="mini-label">Perlu Notifikasi</div><div className="mini-value">{appointments.filter((a) => needsReminder(a)).length}</div></div>
        <div className="mini-stat success"><div className="mini-label">Sudah Dihantar</div><div className="mini-value">{appointments.filter((a) => a.reminderStatus === "Sudah Dihantar").length}</div></div>
        <div className="mini-stat"><div className="mini-label">Hari Ini</div><div className="mini-value">{appointments.filter((a) => getSystemStatus(a) === "Hari Ini").length}</div></div>
        <div className="mini-stat danger"><div className="mini-label">Terlepas</div><div className="mini-value">{appointments.filter((a) => getSystemStatus(a) === "Terlepas").length}</div></div>
      </div>

      <div className="section-actions">
        <div className="search-box">
          <span>🔍</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari pesakit, telefon, kod temujanji..." />
        </div>
      </div>

      <div className="card">
        <div className="card-title">Temujanji Perlu Notifikasi ({pendingReminders.length})</div>
        <div className="followup-list">
          {pendingReminders.map((appointment) => {
            const patient = patients.find((p) => p.id === appointment.patientId);
            const systemStatus = getSystemStatus(appointment);
            const days = getDaysRemaining(appointment.appointmentDate);

            return (
              <div key={appointment.id} className="followup-item">
                <div className="followup-head">
                  <div>
                    <div className="followup-name">{patient?.fullName ?? "-"}</div>
                    <div className="followup-meta">{appointment.appointmentCode} · {patient?.phoneNumber ?? "-"}</div>
                  </div>
                  <span className="pill">{appointment.reminderStatus}</span>
                </div>

                <div className="followup-grid">
                  <div><strong>Tarikh:</strong> {appointment.appointmentDate}</div>
                  <div><strong>Masa:</strong> {appointment.appointmentTime}</div>
                  <div><strong>Rawatan:</strong> {appointment.treatmentType}</div>
                  <div><strong>Status:</strong> {systemStatus}</div>
                  <div><strong>Hari lagi:</strong> {days}</div>
                  <div><strong>Saluran:</strong> {appointment.reminderChannel ?? "Dalam Sistem"}</div>
                </div>

                <div className="followup-actions">
                  <button className="primary-btn" onClick={() => handleMarkSent(appointment)} disabled={savingId === appointment.id}>
                    {savingId === appointment.id ? "Menyimpan..." : "Tanda Notifikasi Dihantar"}
                  </button>
                </div>
              </div>
            );
          })}
          {!pendingReminders.length ? (
            <div className="card-empty-state">
              <div className="card-title">Tiada notifikasi tertunggak</div>
              <p>Semua temujanji yang hampir tiba sudah diproses atau belum masuk tempoh peringatan.</p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Log Notifikasi Terkini</div>
        <div className="simple-list">
          {logs.slice(0, 10).map((log) => {
            const patient = patients.find((p) => p.id === log.patientId);
            return (
              <div key={log.id}>
                <strong>{patient?.fullName ?? "-"}</strong> — {log.channel} — {log.status} — {new Date(log.sentAt).toLocaleString()}
              </div>
            );
          })}
          {!logs.length ? <div>Belum ada log notifikasi.</div> : null}
        </div>
      </div>
    </div>
  );
}
