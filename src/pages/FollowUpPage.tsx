import { useMemo, useState } from "react";
import { getDaysRemaining, getSystemStatus } from "../lib";
import { updateAppointment, updateFollowUp } from "../services/dataService";
import type { Appointment, FollowUp, Patient } from "../types";

interface Props {
  patients: Patient[];
  appointments: Appointment[];
  followUpItems: FollowUp[];
  onUpdated: (items: FollowUp[]) => void;
  onRefresh?: () => Promise<void> | void;
}

export function FollowUpPage({ patients, appointments, followUpItems, onUpdated, onRefresh }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [status, setStatus] = useState<FollowUp["contactStatus"]>("Sudah Dihubungi");
  const [note, setNote] = useState("");
  const [date, setDate] = useState("2026-04-20");
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");

  const activeRecord = useMemo(
    () => followUpItems.find((item) => item.id === activeId) ?? null,
    [followUpItems, activeId]
  );

  const activeAppointment = useMemo(
    () => appointments.find((item) => item.id === activeRecord?.appointmentId) ?? null,
    [appointments, activeRecord]
  );

  const pendingCount = followUpItems.filter((item) => item.contactStatus === "Belum Dihubungi").length;

  const filteredItems = useMemo(() => {
    return followUpItems.filter((item) => {
      const patient = patients.find((p) => p.id === item.patientId);
      const appointment = appointments.find((a) => a.id === item.appointmentId);
      const q = query.trim().toLowerCase();

      const matchesQuery =
        !q ||
        patient?.fullName.toLowerCase().includes(q) ||
        patient?.patientCode.toLowerCase().includes(q) ||
        patient?.phoneNumber.toLowerCase().includes(q) ||
        appointment?.appointmentCode.toLowerCase().includes(q) ||
        appointment?.treatmentType.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "Semua" || item.contactStatus === statusFilter;
      return Boolean(matchesQuery && matchesStatus);
    });
  }, [followUpItems, patients, appointments, query, statusFilter]);

  function openRecord(item: FollowUp) {
    setActiveId(item.id);
    setStatus(item.contactStatus === "Belum Dihubungi" ? "Sudah Dihubungi" : item.contactStatus);
    setNote(item.followUpNote);
    setDate(item.followUpDate ?? "2026-04-20");
  }

  async function saveRecord() {
    if (!activeRecord) return;

    setSaving(true);

    const nextRecord: FollowUp = {
      ...activeRecord,
      contactStatus: status,
      followUpNote: note,
      followUpDate: date,
      handledBy: "Siti Admin"
    };

    const nextItems = followUpItems.map((item) => (item.id === activeRecord.id ? nextRecord : item));
    onUpdated(nextItems);

    try {
      await updateFollowUp(nextRecord);

      if (status === "Jadual Semula" && activeAppointment) {
        const updatedAppointment: Appointment = {
          ...activeAppointment,
          appointmentDate: date,
          manualStatus: "Dijadualkan",
          notes: note
            ? `${activeAppointment.notes ? activeAppointment.notes + " | " : ""}Jadual semula: ${note}`
            : activeAppointment.notes
        };

        await updateAppointment(updatedAppointment);
      }

      if (onRefresh) {
        await onRefresh();
      }
    } finally {
      setSaving(false);
      setActiveId(null);
    }
  }

  return (
    <div className="stack-lg">
      {pendingCount > 0 ? (
        <div className="alert-banner danger">
          <strong>{pendingCount} pesakit belum dihubungi.</strong>
          <span>Sila selesaikan follow-up untuk kes terlepas secepat mungkin.</span>
        </div>
      ) : null}

      <div className="grid-stats">
        <div className="mini-stat"><div className="mini-label">Jumlah Follow-Up</div><div className="mini-value">{followUpItems.length}</div></div>
        <div className="mini-stat danger"><div className="mini-label">Belum Dihubungi</div><div className="mini-value">{pendingCount}</div></div>
        <div className="mini-stat warning"><div className="mini-label">Dalam Proses</div><div className="mini-value">{followUpItems.filter((i) => i.contactStatus === "Tidak Berjaya Dihubungi" || i.contactStatus === "Jadual Semula").length}</div></div>
        <div className="mini-stat success"><div className="mini-label">Selesai</div><div className="mini-value">{followUpItems.filter((i) => i.contactStatus === "Sudah Dihubungi" || i.contactStatus === "Menolak Rawatan").length}</div></div>
      </div>

      <div className="section-actions">
        <div className="search-box">
          <span>🔍</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari pesakit, telefon, kod atau rawatan..." />
        </div>
        <div className="table-actions">
          <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>Semua</option>
            <option>Belum Dihubungi</option>
            <option>Sudah Dihubungi</option>
            <option>Tidak Berjaya Dihubungi</option>
            <option>Jadual Semula</option>
            <option>Menolak Rawatan</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Senarai Follow-Up ({filteredItems.length})</div>
        <div className="followup-list">
          {filteredItems.map((item) => {
            const patient = patients.find((p) => p.id === item.patientId);
            const appointment = appointments.find((a) => a.id === item.appointmentId);
            const urgent = item.contactStatus === "Belum Dihubungi";

            return (
              <div key={item.id} className={`followup-item ${urgent ? "urgent" : ""}`}>
                <div className="followup-head">
                  <div>
                    <div className="followup-name">{patient?.fullName}</div>
                    <div className="followup-meta">{patient?.patientCode} · {patient?.diseaseType}</div>
                  </div>
                  <span className={`pill ${urgent ? "danger" : ""}`}>{item.contactStatus}</span>
                </div>

                <div className="followup-grid">
                  <div><strong>Telefon:</strong> {patient?.phoneNumber}</div>
                  <div><strong>Rawatan:</strong> {appointment?.treatmentType}</div>
                  <div><strong>Tarikh:</strong> {appointment?.appointmentDate}</div>
                  <div><strong>Status:</strong> {appointment ? getSystemStatus(appointment) : "-"}</div>
                  <div><strong>Hari beza:</strong> {appointment ? getDaysRemaining(appointment.appointmentDate) : "-"}</div>
                </div>

                {item.followUpNote ? (
                  <div className="note-box">
                    {item.followUpNote} {item.handledBy ? `— ${item.handledBy}` : ""}
                  </div>
                ) : null}

                <div className="followup-actions">
                  <button className="success-btn" onClick={() => openRecord(item)}>Sudah Dihubungi</button>
                  <button className="warning-btn" onClick={() => { openRecord(item); setStatus("Tidak Berjaya Dihubungi"); }}>Tidak Berjaya</button>
                  <button className="info-btn" onClick={() => { openRecord(item); setStatus("Jadual Semula"); }}>Jadual Semula</button>
                  <button className="secondary-btn" onClick={() => openRecord(item)}>Catatan</button>
                </div>
              </div>
            );
          })}

          {!filteredItems.length ? (
            <div className="card-empty-state">
              <div className="card-title">Tiada rekod follow-up ditemui</div>
              <p>Semak carian atau ubah penapis status.</p>
            </div>
          ) : null}
        </div>
      </div>

      {activeRecord ? (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Rekod Follow-Up</h3>
            <p>Kemaskini status dan catatan pesakit.</p>

            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as FollowUp["contactStatus"])}>
              <option>Sudah Dihubungi</option>
              <option>Tidak Berjaya Dihubungi</option>
              <option>Jadual Semula</option>
              <option>Menolak Rawatan</option>
            </select>

            <label>Tarikh Follow-Up</label>
            <input value={date} onChange={(e) => setDate(e.target.value)} type="date" />

            <label>Catatan</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} />

            <div className="modal-actions">
              <button className="secondary-btn" onClick={() => setActiveId(null)}>Batal</button>
              <button className="primary-btn" onClick={saveRecord} disabled={saving}>
                {saving ? "Menyimpan..." : "Simpan Rekod"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
