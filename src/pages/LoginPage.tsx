import { useState } from "react";
import { signIn } from "../services/authService";

interface Props {
  onLogin: (email?: string) => void;
}

export function LoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState("admin@klinik.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setLoading(true);
    setError("");
    const result = await signIn(email, password);
    setLoading(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    onLogin(email);
  }

  return (
    <div className="login-shell">
      <section className="login-brand-panel">
        <div className="login-brand-content">
          <div className="eyebrow">e-Pantau Pesakit Klinik</div>
          <h1>Pemantauan pesakit yang lebih teratur dan proaktif</h1>
          <p>
            Pantau pesakit, rawatan, dan temujanji dengan lebih teratur supaya
            follow-up tidak terlepas.
          </p>
          <ul>
            <li>Jejak temujanji dengan mudah</li>
            <li>Kenal pasti pesakit yang perlu follow-up</li>
            <li>Urus data pesakit dalam satu sistem</li>
          </ul>
        </div>
      </section>

      <section className="login-form-panel">
        <div className="login-card">
          <div className="eyebrow">Selamat Datang Kembali</div>
          <h2>Log Masuk</h2>
          <p>Sila log masuk untuk mengakses sistem</p>

          <label>Emel</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} />

          <label>Kata Laluan</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

          <div className="login-meta">
            <label className="checkbox-line">
              <input type="checkbox" defaultChecked />
              Ingat Saya
            </label>
            <a href="#">Lupa Kata Laluan</a>
          </div>

          {error ? <div className="error-box">{error}</div> : null}

          <button className="primary-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? "Sedang log masuk..." : "Log Masuk"}
          </button>

          <div className="secure-note">Akses ini dikhaskan untuk pengguna berdaftar.</div>
        </div>
      </section>
    </div>
  );
}
