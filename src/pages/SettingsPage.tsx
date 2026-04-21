import { useEffect, useState } from "react";

interface Props {
  userEmail?: string;
  role?: string;
  clinicName?: string;
  theme?: string;
  onSave?: (payload: { clinicName: string; theme: string }) => Promise<void> | void;
}

export function SettingsPage({ userEmail, role, clinicName = "Klinik A", theme = "Dark", onSave }: Props) {
  const [formClinicName, setFormClinicName] = useState(clinicName);
  const [formTheme, setFormTheme] = useState(theme);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormClinicName(clinicName);
    setFormTheme(theme);
  }, [clinicName, theme]);

  const hasChanges = formClinicName !== clinicName || formTheme !== theme;

  async function handleSave() {
    if (!onSave) return;
    setSaving(true);
    try {
      await onSave({ clinicName: formClinicName, theme: formTheme });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="stack-lg">
      <div className="card">
        <div className="card-title">Tetapan Asas</div>
        <div className="settings-grid">
          <div>
            <label>Nama Klinik</label>
            <input value={formClinicName} onChange={(e) => setFormClinicName(e.target.value)} />
          </div>
          <div>
            <label>Emel Pengguna</label>
            <input defaultValue={userEmail ?? "admin@klinik.com"} disabled />
          </div>
          <div>
            <label>Peranan</label>
            <input defaultValue={role ?? "admin"} disabled />
          </div>
          <div>
            <label>Tema</label>
            <select value={formTheme} onChange={(e) => setFormTheme(e.target.value)}>
              <option>Light</option>
              <option>Dark</option>
            </select>
          </div>
        </div>

        <div className="settings-actions">
          <button
            className="secondary-btn"
            onClick={() => {
              setFormClinicName(clinicName);
              setFormTheme(theme);
            }}
            disabled={!hasChanges || saving}
          >
            Reset
          </button>
          <button className="primary-btn" onClick={handleSave} disabled={!hasChanges || saving}>
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
}
