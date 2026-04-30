import { getFollowUpRequired, getSystemStatus } from "../lib";
import { StatCard } from "../components/StatCard";
import { Table } from "../components/Table";
import { MiniBarChart } from "../components/MiniBarChart";
import { DonutLegend } from "../components/DonutLegend";
import type { Appointment, FollowUp, Patient } from "../types";

interface Props {
  patients: Patient[];
  appointments: Appointment[];
  followUps: FollowUp[];
  onOpenFollowUp?: () => void;
  onOpenAppointments?: () => void;
}

export function DashboardPage({
  patients,
  appointments,
  followUps,
  onOpenFollowUp,
  onOpenAppointments
}: Props) {
  const activePatients = patients.filter((p) => p.patientStatus === "Aktif").length;
  const todayAppointments = appointments.filter((a) => getSystemStatus(a) === "Hari Ini");
  const upcoming7 = appointments.filter((a) => {
    const status = getSystemStatus(a);
    return status === "Hari Ini" || status === "Akan Datang" || status === "Dijadualkan";
  }).length;
  const missedAppointments = appointments.filter((a) => getSystemStatus(a) === "Terlepas");
  const needFollowUp = appointments.filter((a) => getFollowUpRequired(a) === "Ya").length;

  const diseaseSummary = Object.entries(
    patients.reduce<Record<string, number>>((acc, patient) => {
      acc[patient.diseaseType] = (acc[patient.diseaseType] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([label, value]) => ({ label, value }));

  const patientStatusSummary = [
    { label: "Aktif", value: patients.filter((p) => p.patientStatus === "Aktif").length, tone: "success" },
    { label: "Tidak Aktif", value: patients.filter((p) => p.patientStatus === "Tidak Aktif").length, tone: "warning" },
    { label: "Selesai", value: patients.filter((p) => p.patientStatus === "Selesai Rawatan").length, tone: "info" }
  ];

  const monthlyAppointmentSummary = Object.entries(
    appointments.reduce<Record<string, number>>((acc, item) => {
      const key = item.appointmentDate.slice(0, 7);
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([label, value]) => ({ label, value }));

  return (
    <div className="stack-lg">
      <div className="grid-stats">
        <StatCard label="Jumlah Pesakit" value={patients.length} hint="Semua pesakit direkodkan" icon="👥" />
        <StatCard label="Pesakit Aktif" value={activePatients} hint="Sedang dalam pemantauan" icon="💚" tone="success" />

        <div className="clickable-card" onClick={onOpenAppointments}>
          <StatCard
            label="Temujanji Hari Ini"
            value={todayAppointments.length}
            hint="Perlu dipantau hari ini"
            icon="📅"
            tone="info"
          />
        </div>

        <div className="clickable-card" onClick={onOpenAppointments}>
          <StatCard
            label="7 Hari Akan Datang"
            value={upcoming7}
            hint="Jadual semasa"
            icon="🕒"
          />
        </div>

        <StatCard label="Temujanji Terlepas" value={missedAppointments.length} hint="Perlu tindakan segera" icon="⚠" tone="danger" />
        <StatCard label="Perlu Hubungi Semula" value={needFollowUp} hint="Susulan aktif" icon="📞" tone="warning" />
      </div>

      <div className={`alert-banner ${needFollowUp > 0 ? "danger" : ""}`}>
        <strong>{needFollowUp} pesakit memerlukan follow-up segera.</strong>
        <span>{needFollowUp > 0 ? "Utamakan pesakit dengan status terlepas dan hari ini." : "Tiada tindakan segera diperlukan buat masa ini."}</span>
        {needFollowUp > 0 ? (
          <button className="secondary-btn table-btn" onClick={onOpenFollowUp}>Buka Follow-Up</button>
        ) : null}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Temujanji Hari Ini</div>
          <Table
            rows={todayAppointments}
            columns={[
              { header: "Kod", render: (row) => row.appointmentCode },
              { header: "Pesakit", render: (row) => patients.find((p) => p.id === row.patientId)?.fullName ?? "-" },
              { header: "Rawatan", render: (row) => row.treatmentType },
              { header: "Masa", render: (row) => row.appointmentTime },
              { header: "Pegawai", render: (row) => row.clinicOrOfficer }
            ]}
          />
        </div>

        <div className="card">
          <div className="card-title">Kes Follow-Up Segera</div>
          <Table
            rows={followUps
             .filter(
               (row) =>
                 patients.some((p) => p.id === row.patientId) &&
                 row.contactStatus === "Belum Dihubungi"
             )
             .slice(0, 5)}
           columns={[
             { header: "Pesakit", render: (row) => patients.find((p) => p.id === row.patientId)?.fullName ?? "-" },
             { header: "Telefon", render: (row) => patients.find((p) => p.id === row.patientId)?.phoneNumber ?? "-" },
             { header: "Status", render: (row) => row.contactStatus }
           ]}
         />
        </div>
      </div>

      <div className="grid-3">
        <MiniBarChart title="Pesakit ikut penyakit" data={diseaseSummary} />
        <DonutLegend title="Status pesakit" data={patientStatusSummary} />
        <MiniBarChart title="Trend temujanji bulanan" data={monthlyAppointmentSummary} />
      </div>

      <div className="card">
        <div className="card-title">Temujanji Terlepas</div>
        <Table
          rows={missedAppointments}
          columns={[
            { header: "Kod", render: (row) => row.appointmentCode },
            { header: "Pesakit", render: (row) => patients.find((p) => p.id === row.patientId)?.fullName ?? "-" },
            { header: "Tarikh", render: (row) => row.appointmentDate },
            { header: "Rawatan", render: (row) => row.treatmentType },
            { header: "Status", render: (row) => <span className="pill danger">{getSystemStatus(row)}</span> }
          ]}
        />
      </div>
    </div>
  );
}
