import { useState, useEffect, useRef, useCallback } from "react";

/* ─── Google Fonts ─────────────────────────────────────────────── */
const FontLink = () => (
  <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');`}</style>
);

/* ─── Theme tokens ──────────────────────────────────────────────── */
const THEMES = {
  dark: {
    bg: "#0d0f14",
    surface: "#161a24",
    card: "#1c2130",
    border: "#2a3045",
    accent: "#6c8fff",
    accentSoft: "rgba(108,143,255,0.12)",
    success: "#3ecf8e",
    warning: "#f5a623",
    danger: "#ff5e5e",
    text: "#e8eaf2",
    muted: "#6b7499",
    label: "#9ba3c4",
  },
  light: {
    bg: "#f0f2f8",
    surface: "#ffffff",
    card: "#ffffff",
    border: "#d8dce8",
    accent: "#4264e6",
    accentSoft: "rgba(66,100,230,0.10)",
    success: "#27ae78",
    warning: "#e09000",
    danger: "#e04444",
    text: "#1a1e2e",
    muted: "#8890aa",
    label: "#555e7e",
  },
};

/* ─── Canvas Circular Progress ──────────────────────────────────── */
function CircularProgress({ value, max = 100, color, label, size = 120 }) {
  const canvasRef = useRef(null);
  const pct = Math.min(value / max, 1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";
    ctx.scale(dpr, dpr);

    const cx = size / 2, cy = size / 2, r = size / 2 - 10;
    ctx.clearRect(0, 0, size, size);

    // track
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(128,128,180,0.15)";
    ctx.lineWidth = 8;
    ctx.stroke();

    // fill
    if (pct > 0) {
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, color);
      grad.addColorStop(1, color + "99");
      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + pct * Math.PI * 2);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.stroke();
    }

    // text
    ctx.fillStyle = color;
    ctx.font = `700 ${size * 0.2}px JetBrains Mono, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(Math.round(pct * 100) + "%", cx, cy - 6);

    ctx.fillStyle = "rgba(180,185,210,0.7)";
    ctx.font = `500 ${size * 0.09}px Space Grotesk, sans-serif`;
    ctx.fillText(label, cx, cy + size * 0.17);
  }, [value, max, color, label, size, pct]);

  return <canvas ref={canvasRef} />;
}

/* ─── Attendance Module ─────────────────────────────────────────── */
function AttendanceModule({ t, accent }) {
  const [total, setTotal] = useState("");
  const [attended, setAttended] = useState("");
  const [result, setResult] = useState(null);

  const calculate = () => {
    const T = parseInt(total), A = parseInt(attended);
    if (!T || !A || T <= 0 || A < 0 || A > T) {
      setResult({ error: "Please enter valid class counts." });
      return;
    }
    const pct = (A / T) * 100;
    setResult({ pct: pct.toFixed(1), ok: pct >= 75 });
  };

  const inputStyle = {
    background: t.bg,
    border: `1px solid ${t.border}`,
    borderRadius: 8,
    color: t.text,
    padding: "10px 14px",
    fontSize: 14,
    fontFamily: "Space Grotesk",
    width: "100%",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={{ color: t.label, fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>Total Classes</label>
          <input style={inputStyle} type="number" placeholder="e.g. 60" value={total} onChange={e => setTotal(e.target.value)} />
        </div>
        <div>
          <label style={{ color: t.label, fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>Attended</label>
          <input style={inputStyle} type="number" placeholder="e.g. 50" value={attended} onChange={e => setAttended(e.target.value)} />
        </div>
      </div>
      <button onClick={calculate} style={{ background: t.accent, color: "#fff", border: "none", borderRadius: 8, padding: "11px 20px", fontFamily: "Space Grotesk", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
        Calculate Attendance
      </button>
      {result && (
        <div>
          {result.error ? (
            <div style={{ background: `${t.danger}18`, border: `1px solid ${t.danger}44`, borderRadius: 10, padding: "12px 16px", color: t.danger, fontSize: 14 }}>{result.error}</div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 24, background: result.ok ? `${t.success}12` : `${t.warning}12`, border: `1px solid ${result.ok ? t.success : t.warning}44`, borderRadius: 10, padding: "16px 20px" }}>
              <CircularProgress value={parseFloat(result.pct)} color={result.ok ? t.success : t.warning} label="Attend" size={100} />
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: result.ok ? t.success : t.warning, fontFamily: "JetBrains Mono" }}>{result.pct}%</div>
                <div style={{ fontSize: 13, color: t.muted, marginTop: 4 }}>
                  {result.ok ? "✅ You're above 75% — great!" : "⚠️ Below 75% threshold! Attend more classes."}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── CGPA Module ───────────────────────────────────────────────── */
function CGPAModule({ t }) {
  const emptyRow = () => ({ subject: "", credits: "", grade: "" });
  const [rows, setRows] = useState([emptyRow(), emptyRow(), emptyRow()]);
  const [result, setResult] = useState(null);
  const gradeMap = { "O": 10, "A+": 9, "A": 8, "B+": 7, "B": 6, "C": 5, "F": 0 };

  const update = (i, key, val) => {
    const r = [...rows];
    r[i] = { ...r[i], [key]: val };
    setRows(r);
  };

  const calculate = () => {
    let totalPoints = 0, totalCredits = 0;
    const valid = rows.filter(r => r.subject && r.credits && r.grade && gradeMap[r.grade.toUpperCase()] !== undefined);
    if (valid.length === 0) { setResult({ error: "Fill at least one row correctly." }); return; }
    const processed = valid.map(r => {
      const gp = gradeMap[r.grade.toUpperCase()];
      const cr = parseFloat(r.credits);
      totalPoints += gp * cr;
      totalCredits += cr;
      return { ...r, gp };
    });
    setResult({ rows: processed, sgpa: (totalPoints / totalCredits).toFixed(2), totalCredits });
  };

  const inputStyle = { background: t.bg, border: `1px solid ${t.border}`, borderRadius: 6, color: t.text, padding: "8px 10px", fontSize: 13, fontFamily: "Space Grotesk", width: "100%", outline: "none", boxSizing: "border-box" };
  const gradeOptions = ["O", "A+", "A", "B+", "B", "C", "F"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 8 }}>
        {["Subject", "Credits", "Grade"].map(h => (
          <div key={h} style={{ color: t.label, fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", paddingBottom: 4 }}>{h}</div>
        ))}
        {rows.map((row, i) => (
          <>
            <input key={`s${i}`} style={inputStyle} placeholder={`Subject ${i + 1}`} value={row.subject} onChange={e => update(i, "subject", e.target.value)} />
            <input key={`c${i}`} style={inputStyle} placeholder="3" type="number" value={row.credits} onChange={e => update(i, "credits", e.target.value)} />
            <select key={`g${i}`} style={{ ...inputStyle, cursor: "pointer" }} value={row.grade} onChange={e => update(i, "grade", e.target.value)}>
              <option value="">--</option>
              {gradeOptions.map(g => <option key={g}>{g}</option>)}
            </select>
          </>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => setRows([...rows, emptyRow()])} style={{ flex: 1, background: t.accentSoft, color: t.accent, border: `1px solid ${t.accent}44`, borderRadius: 8, padding: "9px", fontFamily: "Space Grotesk", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>+ Add Subject</button>
        <button onClick={calculate} style={{ flex: 1, background: t.accent, color: "#fff", border: "none", borderRadius: 8, padding: "9px", fontFamily: "Space Grotesk", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Calculate SGPA</button>
      </div>
      {result && (
        result.error ? <div style={{ color: t.danger, fontSize: 13 }}>{result.error}</div> :
        <div style={{ background: t.accentSoft, borderRadius: 10, padding: 16 }}>
          <div style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: t.label, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>SGPA</span>
            <span style={{ color: t.accent, fontSize: 26, fontWeight: 700, fontFamily: "JetBrains Mono" }}>{result.sgpa}</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>{["Subject", "Credits", "Grade", "GP"].map(h => <th key={h} style={{ color: t.muted, textAlign: "left", padding: "4px 8px", fontWeight: 600, borderBottom: `1px solid ${t.border}` }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {result.rows.map((r, i) => (
                <tr key={i}>
                  <td style={{ padding: "5px 8px", color: t.text }}>{r.subject}</td>
                  <td style={{ padding: "5px 8px", color: t.text }}>{r.credits}</td>
                  <td style={{ padding: "5px 8px", color: t.accent, fontWeight: 700 }}>{r.grade.toUpperCase()}</td>
                  <td style={{ padding: "5px 8px", color: t.text, fontFamily: "JetBrains Mono" }}>{r.gp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Todo Module ───────────────────────────────────────────────── */
function TodoModule({ t }) {
  const [tasks, setTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem("sd_tasks") || "[]"); } catch { return []; }
  });
  const [input, setInput] = useState("");

  const save = (arr) => { setTasks(arr); localStorage.setItem("sd_tasks", JSON.stringify(arr)); };
  const add = () => { if (!input.trim()) return; save([...tasks, { id: Date.now(), text: input.trim(), done: false }]); setInput(""); };
  const toggle = (id) => save(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const del = (id) => save(tasks.filter(t => t.id !== id));

  const done = tasks.filter(t => t.done).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          style={{ flex: 1, background: t.bg, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text, padding: "10px 14px", fontSize: 14, fontFamily: "Space Grotesk", outline: "none" }}
          placeholder="Add a new task…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && add()}
        />
        <button onClick={add} style={{ background: t.accent, color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px", fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 18, cursor: "pointer", lineHeight: 1 }}>+</button>
      </div>
      {tasks.length > 0 && (
        <div style={{ fontSize: 12, color: t.muted }}>{done}/{tasks.length} tasks completed</div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto" }}>
        {tasks.length === 0 && <div style={{ color: t.muted, fontSize: 13, textAlign: "center", padding: "20px 0" }}>No tasks yet. Add one above!</div>}
        {tasks.map(task => (
          <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 10, background: t.bg, borderRadius: 8, padding: "10px 12px", border: `1px solid ${t.border}` }}>
            <button onClick={() => toggle(task.id)} style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${task.done ? t.success : t.border}`, background: task.done ? t.success : "transparent", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 0, transition: "all 0.2s" }}>
              {task.done && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}
            </button>
            <span style={{ flex: 1, fontSize: 14, color: task.done ? t.muted : t.text, textDecoration: task.done ? "line-through" : "none", fontFamily: "Space Grotesk" }}>{task.text}</span>
            <button onClick={() => del(task.id)} style={{ background: "none", border: "none", color: t.muted, cursor: "pointer", fontSize: 16, padding: "0 4px", lineHeight: 1 }}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Pomodoro Module ───────────────────────────────────────────── */
function PomodoroModule({ t }) {
  const WORK = 25 * 60, BREAK = 5 * 60;
  const [seconds, setSeconds] = useState(WORK);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState("work");
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);
  const audioCtxRef = useRef(null);

  const playAlert = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [440, 550, 660].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.25 + 0.4);
      osc.start(ctx.currentTime + i * 0.25);
      osc.stop(ctx.currentTime + i * 0.25 + 0.4);
    });
  };

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            playAlert();
            setRunning(false);
            if (phase === "work") { setSessions(n => n + 1); setPhase("break"); return BREAK; }
            else { setPhase("work"); return WORK; }
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, phase]);

  const reset = () => { setRunning(false); setSeconds(phase === "work" ? WORK : BREAK); };
  const switchPhase = (p) => { setRunning(false); setPhase(p); setSeconds(p === "work" ? WORK : BREAK); };

  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  const total = phase === "work" ? WORK : BREAK;
  const pct = ((total - seconds) / total) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      <div style={{ display: "flex", gap: 8 }}>
        {["work", "break"].map(p => (
          <button key={p} onClick={() => switchPhase(p)} style={{ background: phase === p ? t.accent : t.accentSoft, color: phase === p ? "#fff" : t.accent, border: "none", borderRadius: 20, padding: "6px 18px", fontFamily: "Space Grotesk", fontWeight: 600, fontSize: 13, cursor: "pointer", textTransform: "capitalize" }}>
            {p === "work" ? "🍅 Work" : "☕ Break"}
          </button>
        ))}
      </div>
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress value={pct} color={phase === "work" ? t.accent : t.success} label={phase === "work" ? "Focus" : "Break"} size={160} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none" }}>
          <div style={{ fontSize: 32, fontWeight: 700, fontFamily: "JetBrains Mono", color: phase === "work" ? t.accent : t.success, lineHeight: 1 }}>{m}:{s}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => setRunning(r => !r)} style={{ background: running ? t.warning : t.success, color: "#fff", border: "none", borderRadius: 8, padding: "10px 28px", fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
          {running ? "⏸ Pause" : "▶ Start"}
        </button>
        <button onClick={reset} style={{ background: t.accentSoft, color: t.accent, border: `1px solid ${t.accent}44`, borderRadius: 8, padding: "10px 20px", fontFamily: "Space Grotesk", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>⟳ Reset</button>
      </div>
      <div style={{ color: t.muted, fontSize: 13 }}>🍅 Sessions completed: <strong style={{ color: t.text }}>{sessions}</strong></div>
    </div>
  );
}

/* ─── Progress Visualization ────────────────────────────────────── */
function ProgressModule({ t }) {
  const [attendance, setAttendance] = useState(78);
  const [tasksTotal, setTasksTotal] = useState(10);
  const [tasksDone, setTasksDone] = useState(6);
  const [cgpa, setCgpa] = useState(8.2);

  const sliderStyle = { width: "100%", accentColor: t.accent };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 16 }}>
        <div style={{ textAlign: "center" }}>
          <CircularProgress value={attendance} color={attendance >= 75 ? t.success : t.warning} label="Attend" size={110} />
        </div>
        <div style={{ textAlign: "center" }}>
          <CircularProgress value={tasksDone} max={Math.max(tasksTotal, 1)} color={t.accent} label="Tasks" size={110} />
        </div>
        <div style={{ textAlign: "center" }}>
          <CircularProgress value={cgpa} max={10} color="#f0a04b" label="CGPA" size={110} />
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, background: t.bg, borderRadius: 12, padding: 16 }}>
        {[
          { label: "Attendance %", val: attendance, set: setAttendance, min: 0, max: 100 },
          { label: "Tasks Done", val: tasksDone, set: setTasksDone, min: 0, max: tasksTotal },
          { label: "Total Tasks", val: tasksTotal, set: setTasksTotal, min: 1, max: 30 },
          { label: "CGPA (out of 10)", val: cgpa, set: setCgpa, min: 0, max: 10, step: 0.1 },
        ].map(({ label, val, set, min, max, step = 1 }) => (
          <div key={label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: t.label, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
              <span style={{ fontSize: 12, color: t.text, fontFamily: "JetBrains Mono", fontWeight: 700 }}>{val}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={val} onChange={e => set(Number(e.target.value))} style={sliderStyle} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Auth Helpers ──────────────────────────────────────────────── */
const getUsers = () => { try { return JSON.parse(localStorage.getItem("sd_users") || "[]"); } catch { return []; } };
const saveUsers = (u) => localStorage.setItem("sd_users", JSON.stringify(u));
const getSession = () => { try { return JSON.parse(localStorage.getItem("sd_session") || "null"); } catch { return null; } };
const saveSession = (u) => localStorage.setItem("sd_session", JSON.stringify(u));
const clearSession = () => localStorage.removeItem("sd_session");

/* ─── Login / Register Page ─────────────────────────────────────── */
function AuthPage({ t, onLogin }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const inputStyle = {
    background: t.bg,
    border: `1px solid ${t.border}`,
    borderRadius: 10,
    color: t.text,
    padding: "12px 16px",
    fontSize: 15,
    fontFamily: "Space Grotesk",
    width: "100%",
    outline: "none",
    boxSizing: "border-box",
    transition: "border 0.2s",
  };

  const reset = () => { setName(""); setUsername(""); setPassword(""); setConfirmPassword(""); setError(""); setSuccess(""); };

  const handleRegister = () => {
    setError(""); setSuccess("");
    if (!name.trim() || !username.trim() || !password.trim()) { setError("All fields are required."); return; }
    if (username.length < 3) { setError("Username must be at least 3 characters."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    const users = getUsers();
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      setError("Username already exists. Please choose another."); return;
    }
    const newUser = { name: name.trim(), username: username.trim().toLowerCase(), password };
    saveUsers([...users, newUser]);
    setSuccess("Account created successfully! You can now log in.");
    reset();
    setTimeout(() => { setMode("login"); setSuccess(""); }, 1500);
  };

  const handleLogin = () => {
    setError(""); setSuccess("");
    if (!username.trim() || !password.trim()) { setError("Please enter username and password."); return; }
    const users = getUsers();
    const user = users.find(u => u.username === username.trim().toLowerCase() && u.password === password);
    if (!user) { setError("Invalid username or password."); return; }
    saveSession(user);
    onLogin(user);
  };

  return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "Space Grotesk" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: t.accent, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 12 }}>🎒</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: t.text }}>StudentDesk</div>
          <div style={{ fontSize: 13, color: t.muted, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 4 }}>Academic Dashboard</div>
        </div>

        {/* Card */}
        <div style={{ background: t.card, borderRadius: 20, border: `1px solid ${t.border}`, padding: 32, boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}>
          {/* Tab switcher */}
          <div style={{ display: "flex", background: t.bg, borderRadius: 10, padding: 4, marginBottom: 28 }}>
            {["login", "register"].map(m => (
              <button key={m} onClick={() => { setMode(m); reset(); }} style={{
                flex: 1, background: mode === m ? t.accent : "transparent", color: mode === m ? "#fff" : t.muted,
                border: "none", borderRadius: 8, padding: "9px", fontFamily: "Space Grotesk", fontWeight: 600,
                fontSize: 14, cursor: "pointer", transition: "all 0.2s", textTransform: "capitalize"
              }}>
                {m === "login" ? "🔑 Login" : "📝 Register"}
              </button>
            ))}
          </div>

          {/* Error / Success */}
          {error && <div style={{ background: `${t.danger}18`, border: `1px solid ${t.danger}44`, borderRadius: 10, padding: "10px 14px", color: t.danger, fontSize: 13, marginBottom: 16 }}>⚠️ {error}</div>}
          {success && <div style={{ background: `${t.success}18`, border: `1px solid ${t.success}44`, borderRadius: 10, padding: "10px 14px", color: t.success, fontSize: 13, marginBottom: 16 }}>✅ {success}</div>}

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Register-only: Full Name */}
            {mode === "register" && (
              <div>
                <label style={{ color: t.label, fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Full Name</label>
                <input style={inputStyle} placeholder="e.g. Hardik Shah" value={name} onChange={e => setName(e.target.value)} />
              </div>
            )}

            {/* Username */}
            <div>
              <label style={{ color: t.label, fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Username</label>
              <input style={inputStyle} placeholder="e.g. hardik123" value={username} onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key === "Enter" && mode === "login" && handleLogin()} />
            </div>

            {/* Password */}
            <div>
              <label style={{ color: t.label, fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Password</label>
              <div style={{ position: "relative" }}>
                <input style={{ ...inputStyle, paddingRight: 44 }} type={showPass ? "text" : "password"} placeholder="Min. 6 characters"
                  value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && mode === "login" && handleLogin()} />
                <button onClick={() => setShowPass(s => !s)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: t.muted }}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Confirm Password (register only) */}
            {mode === "register" && (
              <div>
                <label style={{ color: t.label, fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Confirm Password</label>
                <input style={inputStyle} type={showPass ? "text" : "password"} placeholder="Re-enter password"
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleRegister()} />
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={mode === "login" ? handleLogin : handleRegister}
              style={{ background: t.accent, color: "#fff", border: "none", borderRadius: 10, padding: "13px", fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 15, cursor: "pointer", marginTop: 4, transition: "opacity 0.2s" }}
            >
              {mode === "login" ? "Login →" : "Create Account →"}
            </button>
          </div>

          {/* Switch mode hint */}
          <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: t.muted }}>
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => { setMode(mode === "login" ? "register" : "login"); reset(); }}
              style={{ color: t.accent, fontWeight: 600, cursor: "pointer" }}>
              {mode === "login" ? "Register here" : "Login here"}
            </span>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: t.muted }}>
          Your data is stored locally on this device 🔒
        </div>
      </div>
    </div>
  );
}

/* ─── Main App ──────────────────────────────────────────────────── */
const TABS = [
  { id: "attendance", label: "Attendance", icon: "📋" },
  { id: "cgpa", label: "CGPA", icon: "🎓" },
  { id: "todo", label: "To-Do List", icon: "✅" },
  { id: "pomodoro", label: "Pomodoro", icon: "🍅" },
  { id: "progress", label: "Progress", icon: "📊" },
];

export default function App() {
  const [theme, setTheme] = useState("dark");
  const [tab, setTab] = useState("attendance");
  const [currentUser, setCurrentUser] = useState(() => getSession());
  const t = THEMES[theme];

  const handleLogin = (user) => setCurrentUser(user);

  const handleLogout = () => {
    clearSession();
    setCurrentUser(null);
  };

  // Show auth page if not logged in
  if (!currentUser) {
    return (
      <>
        <FontLink />
        <AuthPage t={t} onLogin={handleLogin} />
      </>
    );
  }

  return (
    <>
      <FontLink />
      <div style={{ minHeight: "100vh", background: t.bg, color: t.text, fontFamily: "Space Grotesk, sans-serif", transition: "background 0.3s, color 0.3s" }}>
        {/* Header */}
        <header style={{ background: t.surface, borderBottom: `1px solid ${t.border}`, padding: "0 24px", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: t.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🎒</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: t.text, lineHeight: 1.1 }}>StudentDesk</div>
                <div style={{ fontSize: 10, color: t.muted, letterSpacing: "0.08em", textTransform: "uppercase" }}>Academic Dashboard</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* User badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: t.accentSoft, border: `1px solid ${t.border}`, borderRadius: 20, padding: "5px 12px" }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: t.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", fontWeight: 700 }}>
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{currentUser.name.split(" ")[0]}</span>
              </div>
              {/* Theme toggle */}
              <button onClick={() => setTheme(th => th === "dark" ? "light" : "dark")}
                style={{ background: t.accentSoft, border: `1px solid ${t.border}`, borderRadius: 20, padding: "6px 14px", color: t.text, fontFamily: "Space Grotesk", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                {theme === "dark" ? "☀️" : "🌙"}
              </button>
              {/* Logout */}
              <button onClick={handleLogout}
                style={{ background: `${t.danger}18`, border: `1px solid ${t.danger}44`, borderRadius: 20, padding: "6px 14px", color: t.danger, fontFamily: "Space Grotesk", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Welcome Banner */}
        <div style={{ background: t.accentSoft, borderBottom: `1px solid ${t.border}` }}>
          <div style={{ maxWidth: 900, margin: "0 auto", padding: "10px 24px", fontSize: 13, color: t.accent, fontWeight: 500 }}>
            👋 Welcome back, <strong>{currentUser.name}</strong>! Ready to study?
          </div>
        </div>

        {/* Tab Bar */}
        <div style={{ background: t.surface, borderBottom: `1px solid ${t.border}`, overflowX: "auto" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", padding: "0 24px" }}>
            {TABS.map(({ id, label, icon }) => (
              <button key={id} onClick={() => setTab(id)} style={{
                background: "none", border: "none", cursor: "pointer", padding: "14px 16px", fontFamily: "Space Grotesk", fontWeight: tab === id ? 700 : 500, fontSize: 13, color: tab === id ? t.accent : t.muted, borderBottom: `2px solid ${tab === id ? t.accent : "transparent"}`, whiteSpace: "nowrap", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6
              }}>
                <span>{icon}</span> <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <main style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px" }}>
          <div style={{ background: t.card, borderRadius: 16, border: `1px solid ${t.border}`, padding: 28, boxShadow: theme === "dark" ? "0 4px 40px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)" }}>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: t.text }}>
                {TABS.find(x => x.id === tab)?.icon} {TABS.find(x => x.id === tab)?.label}
              </h2>
              <div style={{ width: 40, height: 3, background: t.accent, borderRadius: 4, marginTop: 8 }} />
            </div>
            {tab === "attendance" && <AttendanceModule t={t} accent={t.accent} />}
            {tab === "cgpa" && <CGPAModule t={t} />}
            {tab === "todo" && <TodoModule t={t} />}
            {tab === "pomodoro" && <PomodoroModule t={t} />}
            {tab === "progress" && <ProgressModule t={t} />}
          </div>
        </main>

        {/* Footer */}
        <footer style={{ textAlign: "center", padding: "16px", color: t.muted, fontSize: 12 }}>
          StudentDesk — Student Productivity Dashboard &nbsp;·&nbsp; Built with React + Canvas
        </footer>
      </div>
    </>
  );
}
