import { useEffect, useMemo, useState } from "react";
import { getDaysRemaining, getFollowUpRequired, getSystemStatus } from "../lib";
import { Table } from "../components/Table";
import type { Appointment, Patient } from "../types";

interface Props {
  appointments: Appointment[];
  patients: Patient[];
  onCreateAppointment: (payload: Omit<Appointment, "id">) => Promise<void> | void;
  onUpdateAppointment: (payload: Appointment) => Promise<void> | void;
  onDeleteAppointment: (id: string) => Promise<void> | void;
  canEdit?: boolean;
  canDelete?: boolean;
}

function emptyForm(nextCode: string, patientId: string): Omit<Appointment, "id"> {
  return {
    appointmentCode: nextCode,
    patientId,
    appointmentDate: "2026-04-20",
    appointmentTime: "09:00",
    treatmentType: "",
    clinicOrOfficer: "Klinik A",
    manualStatus: "Dijadualkan",
    notes: ""
  };
}

export function AppointmentsPage({
  appointments,
  patients,
  onCreateAppointment,
  onUpdateAppointment,
  onDeleteAppointment,
  canEdit = true,
  canDelete = true
}: Props) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [form, setForm] = useState<Omit<Appointment, "id">>(
    emptyForm(`T${String(appointments.length + 1).padStart(3, "0")}`, patients[0]?.id ?? "")
  );

  useEffect(() => {
    if (!open && !editing) {
      setForm(emptyForm(`T${String(appointments.length + 1).padStart(3, "0")}`, patients[0]?.id ?? ""));
    }
  }, [appointments.length, patients, open, editing]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const patient = patients.find((item) => item.id === appointment.patientId);
      const systemStatus = getSystemStatus(appointment);
      const q = query.trim().toLowerCase();

      const matchesQuery =
        !q ||
        appointment.appointmentCode.toLowerCase().includes(q) ||
        appointment.treatmentType.toLowerCase().includes(q) ||
        appointment.clinicOrOfficer.toLowerCase().includes(q) ||
        patient?.fullName.toLowerCase().includes(q) ||
        patient?.phoneNumber.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "Semua" ||
        systemStatus === statusFilter ||
        appointment.manualStatus === statusFilter;

      return Boolean(matchesQuery && matchesStatus);
    });
  }, [appointments, patients, query, statusFilter]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm(`T${String(appointments.length + 1).padStart(3, "0")}`, patients[0]?.id ?? ""));
    setOpen(true);
  }

  function openEdit(appointment: Appointment) {
    setEditing(appointment);
    setForm({
      appointmentCode: appointment.appointmentCode,
      patientId: appointment.patientId,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      treatmentType: appointment.treatmentType,
      clinicOrOfficer: appointment.clinicOrOfficer,
      manualStatus: appointment.manualStatus,
      notes: appointment.notes
    });
    setOpen(true);
  }

  async function submit() {
    if (!form.patientId || !form.appointmentDate || !form.appointmentTime || !form.treatmentType) return;

    if (editing) {
      await onUpdateAppointment({ ...editing, ...form });
    } else {
      await onCreateAppointment(form);
    }

    setOpen(false);
    setEditing(null);
  }

  async function remove(appointment: Appointment) {
    const ok = window.confirm(`Padam temujanji ${appointment.appointmentCode}?`);
    if (!ok) return;
    await onDeleteAppointment(appointment.id);
  }

  return (
    <div className="stack-lg">
      <div className="section-actions">
        <div className="search-box">
          <span>🔍</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari pesakit, kod, rawatan atau pegawai..."
          />
        </div>

        <div className="table-actions">
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>Semua</option>
            <option>Hari Ini</option>
            <option>Akan Datang</option>
            <option>Terlepas</option>
            <option>Dijadualkan</option>
            <option>Selesai</option>
            <option>Dibatalkan</option>
            <option>Ditunda</option>
            <option>Tidak Hadir</option>
          </select>

          <button className="primary-btn small" onClick={openCreate} disabled={!canEdit}>
            Tambah Temujanji
          </button>
        </div>
      </div>

      <div className="filter-chips">
        <span className="chip active">Hari Ini</span>
        <span className="chip">Akan Datang</span>
        <span className="chip">Terlepas</span>
        <span className="chip">Perlu Follow-Up</span>
      </div>

      <div className="card">
        <div className="card-title">Senarai Temujanji ({filteredAppointments.length})</div>

        <Table
          rows={filteredAppointments}
          columns={[
            { header: "Kod", render: (row) => row.appointmentCode },
            { header: "Pesakit", render: (row) => patients.find((p) => p.id === row.patientId)?.fullName ?? "-" },
            { header: "Tarikh", render: (row) => row.appointmentDate },
            { header: "Masa", render: (row) => row.appointmentTime },
            { header: "Rawatan", render: (row) => row.treatmentType },
            { header: "Pegawai", render: (row) => row.clinicOrOfficer },
            { header: "Status Sistem", render: (row) => <span className="pill">{getSystemStatus(row)}</span> },
            { header: "Status Manual", render: (row) => row.manualStatus },
            { header: "Follow-Up", render: (row) => getFollowUpRequired(row) },
            { header: "Hari Lagi", render: (row) => getDaysRemaining(row.appointmentDate) },
            {
              header: "Tindakan",
              render: (row) => (
                <div className="table-actions">
                  <button className="secondary-btn table-btn" onClick={() => openEdit(row)} disabled={!canEdit}>
                    Edit
                  </button>
                  <button className="danger-btn table-btn" onClick={() => remove(row)} disabled={!canDelete}>
                    Padam
                  </button>
                </div>
              )
            }
          ]}
        />
      </div>

      {open ? (
        <div className="modal-backdrop">
          <div className="modal-card wide">
            <h3>{editing ? "Edit Temujanji" : "Tambah Temujanji"}</h3>
            <p>Rekod temujanji ini akan kekal online jika Supabase aktif.</p>

            <div className="form-grid">
              <div>
                <label>ID Temujanji</label>
                <input
                  value={form.appointmentCode}
                  onChange={(e) => setForm({ ...form, appointmentCode: e.target.value })}
                />
              </div>

              <div>
                <label>Pesakit</label>
                <select
                  value={form.patientId}
                  onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                >
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Tarikh</label>
                <input
                  type="date"
                  value={form.appointmentDate}
                  onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })}
                />
              </div>

              <div>
                <label>Masa</label>
                <input
                  type="time"
                  value={form.appointmentTime}
                  onChange={(e) => setForm({ ...form, appointmentTime: e.target.value })}
                />
              </div>

              <div>
                <label>Jenis Rawatan</label>
                <input
                  value={form.treatmentType}
                  onChange={(e) => setForm({ ...form, treatmentType: e.target.value })}
                />
              </div>

              <div>
                <label>Klinik/Pegawai</label>
                <input
                  value={form.clinicOrOfficer}
                  onChange={(e) => setForm({ ...form, clinicOrOfficer: e.target.value })}
                />
              </div>

              <div>
                <label>Status Manual</label>
                <select
                  value={form.manualStatus}
                  onChange={(e) => setForm({ ...form, manualStatus: e.target.value as Appointment["manualStatus"] })}
                >
                  <option>Dijadualkan</option>
                  <option>Selesai</option>
                  <option>Dibatalkan</option>
                  <option>Ditunda</option>
                  <option>Tidak Hadir</option>
                </select>
              </div>

              <div className="span-2">
                <label>Catatan</label>
                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="secondary-btn"
                onClick={() => {
                  setOpen(false);
                  setEditing(null);
                }}
              >
                Batal
              </button>
              <button className="primary-btn" onClick={submit}>
                {editing ? "Simpan Perubahan" : "Simpan Temujanji"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
