import { useEffect, useMemo, useState } from "react";
import { Table } from "../components/Table";
import type { Appointment, Patient } from "../types";

interface Props {
  patients: Patient[];
  appointments: Appointment[];
  onCreatePatient: (payload: Omit<Patient, "id">) => Promise<void> | void;
  onUpdatePatient: (payload: Patient) => Promise<void> | void;
  onDeletePatient: (id: string) => Promise<void> | void;
  canEdit?: boolean;
  canDelete?: boolean;
}

function emptyForm(nextCode: string): Omit<Patient, "id"> {
  return {
    patientCode: nextCode,
    fullName: "",
    nationalId: "",
    address: "",
    phoneNumber: "",
    diseaseType: "",
    treatmentType: "",
    patientStatus: "Aktif",
    notes: ""
  };
}

export function PatientsPage({ patients, appointments, onCreatePatient, onUpdatePatient, onDeletePatient, canEdit = true, canDelete = true }: Props) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [form, setForm] = useState<Omit<Patient, "id">>(emptyForm(`P${String(patients.length + 1).padStart(3, "0")}`));

  useEffect(() => {
    if (!open && !editing) {
      setForm(emptyForm(`P${String(patients.length + 1).padStart(3, "0")}`));
    }
  }, [patients.length, open, editing]);

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        patient.fullName.toLowerCase().includes(q) ||
        patient.patientCode.toLowerCase().includes(q) ||
        patient.phoneNumber.toLowerCase().includes(q) ||
        patient.diseaseType.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "Semua" || patient.patientStatus === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [patients, query, statusFilter]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm(`P${String(patients.length + 1).padStart(3, "0")}`));
    setOpen(true);
  }

  function openEdit(patient: Patient) {
    setEditing(patient);
    setForm({
      patientCode: patient.patientCode,
      fullName: patient.fullName,
      nationalId: patient.nationalId,
      address: patient.address,
      phoneNumber: patient.phoneNumber,
      diseaseType: patient.diseaseType,
      treatmentType: patient.treatmentType,
      patientStatus: patient.patientStatus,
      notes: patient.notes
    });
    setOpen(true);
  }

  async function submit() {
    if (!form.fullName || !form.phoneNumber || !form.diseaseType || !form.treatmentType) return;
    if (editing) {
      await onUpdatePatient({ ...editing, ...form });
    } else {
      await onCreatePatient(form);
    }
    setOpen(false);
    setEditing(null);
  }

  async function remove(patient: Patient) {
    const ok = window.confirm(`Padam pesakit ${patient.fullName}?`);
    if (!ok) return;
    await onDeletePatient(patient.id);
  }

  return (
    <div className="stack-lg">
      <div className="section-actions">
        <div className="search-box">
          <span>🔍</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama, ID, telefon atau penyakit..." />
        </div>
        <div className="table-actions">
          <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>Semua</option>
            <option>Aktif</option>
            <option>Tidak Aktif</option>
            <option>Selesai Rawatan</option>
          </select>
          <button className="primary-btn small" onClick={openCreate} disabled={!canEdit}>Tambah Pesakit</button>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Senarai Pesakit ({filteredPatients.length})</div>
        <Table
          rows={filteredPatients}
          columns={[
            { header: "ID Pesakit", render: (row) => row.patientCode },
            { header: "Nama", render: (row) => row.fullName },
            { header: "Telefon", render: (row) => row.phoneNumber },
            { header: "Penyakit", render: (row) => row.diseaseType },
            { header: "Rawatan", render: (row) => row.treatmentType },
            { header: "Status", render: (row) => <span className="pill">{row.patientStatus}</span> },
            {
              header: "Temujanji Seterusnya",
              render: (row) =>
                appointments.find((a) => a.patientId === row.id && a.manualStatus !== "Selesai" && a.manualStatus !== "Dibatalkan")
                  ?.appointmentDate ?? "-"
            },
            {
              header: "Tindakan",
              render: (row) => (
                <div className="table-actions">
                  <button className="secondary-btn table-btn" onClick={() => openEdit(row)} disabled={!canEdit}>Edit</button>
                  <button className="danger-btn table-btn" onClick={() => remove(row)} disabled={!canDelete}>Padam</button>
                </div>
              )
            }
          ]}
        />
      </div>

      {open ? (
        <div className="modal-backdrop">
          <div className="modal-card wide">
            <h3>{editing ? "Edit Pesakit" : "Tambah Pesakit"}</h3>
            <p>Maklumat yang disimpan akan kekal dalam Supabase jika sambungan aktif.</p>

            <div className="form-grid">
              <div><label>ID Pesakit</label><input value={form.patientCode} onChange={(e) => setForm({ ...form, patientCode: e.target.value })} /></div>
              <div><label>Nama Penuh</label><input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
              <div><label>No ID</label><input value={form.nationalId} onChange={(e) => setForm({ ...form, nationalId: e.target.value })} /></div>
              <div><label>No Telefon</label><input value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} /></div>
              <div><label>Jenis Penyakit</label><input value={form.diseaseType} onChange={(e) => setForm({ ...form, diseaseType: e.target.value })} /></div>
              <div><label>Jenis Rawatan</label><input value={form.treatmentType} onChange={(e) => setForm({ ...form, treatmentType: e.target.value })} /></div>
              <div><label>Status Pesakit</label>
                <select value={form.patientStatus} onChange={(e) => setForm({ ...form, patientStatus: e.target.value as Patient["patientStatus"] })}>
                  <option>Aktif</option>
                  <option>Tidak Aktif</option>
                  <option>Selesai Rawatan</option>
                </select>
              </div>
              <div><label>Alamat</label><input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
              <div className="span-2"><label>Catatan</label><textarea rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            </div>

            <div className="modal-actions">
              <button className="secondary-btn" onClick={() => { setOpen(false); setEditing(null); }}>Batal</button>
              <button className="primary-btn" onClick={submit}>{editing ? "Simpan Perubahan" : "Simpan Pesakit"}</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
