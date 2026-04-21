import { downloadCsv } from "../utils/exportCsv";
import { getSystemStatus } from "../lib";
import type { Appointment, FollowUp, Patient } from "../types";

interface Props {
  patients: Patient[];
  appointments: Appointment[];
  followUps: FollowUp[];
}

export function ReportsPage({ patients, appointments, followUps }: Props) {
  const diseaseRows = Object.entries(
    patients.reduce<Record<string, number>>((acc, item) => {
      acc[item.diseaseType] = (acc[item.diseaseType] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([category, total]) => ({ category, total }));

  const statusRows = Object.entries(
    appointments.reduce<Record<string, number>>((acc, item) => {
      const status = getSystemStatus(item);
      acc[status] = (acc[status] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([status, total]) => ({ status, total }));

  const followUpRows = followUps.map((item) => {
    const patient = patients.find((p) => p.id === item.patientId);
    return {
      pesakit: patient?.fullName ?? "-",
      telefon: patient?.phoneNumber ?? "-",
      status_followup: item.contactStatus,
      catatan: item.followUpNote || "-"
    };
  });

  return (
    <div className="stack-lg">
      <div className="section-actions">
        <div className="card-title">Laporan Sistem</div>
        <div className="table-actions">
          <button className="secondary-btn table-btn" onClick={() => downloadCsv("laporan_pesakit.csv", diseaseRows)}>Export Pesakit CSV</button>
          <button className="secondary-btn table-btn" onClick={() => downloadCsv("laporan_temujanji.csv", statusRows)}>Export Temujanji CSV</button>
          <button className="secondary-btn table-btn" onClick={() => downloadCsv("laporan_followup.csv", followUpRows)}>Export Follow-Up CSV</button>
        </div>
      </div>

      <div className="grid-3">
        <div className="card">
          <div className="card-title">Pesakit ikut penyakit</div>
          <div className="simple-list">
            {diseaseRows.map((row) => <div key={row.category}>{row.category}: <strong>{row.total}</strong></div>)}
          </div>
        </div>
        <div className="card">
          <div className="card-title">Temujanji ikut status</div>
          <div className="simple-list">
            {statusRows.map((row) => <div key={row.status}>{row.status}: <strong>{row.total}</strong></div>)}
          </div>
        </div>
        <div className="card">
          <div className="card-title">Follow-Up</div>
          <div className="simple-list">
            <div>Selesai: <strong>{followUps.filter((f) => f.contactStatus === "Sudah Dihubungi").length}</strong></div>
            <div>Belum dihubungi: <strong>{followUps.filter((f) => f.contactStatus === "Belum Dihubungi").length}</strong></div>
            <div>Jadual semula: <strong>{followUps.filter((f) => f.contactStatus === "Jadual Semula").length}</strong></div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Cadangan Laporan</div>
        <ul className="simple-list">
          <li>Jumlah pesakit ikut penyakit</li>
          <li>Jumlah rawatan ikut kategori</li>
          <li>Senarai pesakit tidak hadir</li>
          <li>Trend temujanji bulanan</li>
          <li>Follow-up selesai dan belum selesai</li>
        </ul>
      </div>
    </div>
  );
}
