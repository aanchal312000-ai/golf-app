import { useState, useEffect } from "react";
import { supabase } from "./supabase";

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [score, setScore] = useState("");
  const [date, setDate] = useState("");
  const [scores, setScores] = useState([]);

  // Charity + subscription (UI-level)
  const [charity, setCharity] = useState("Save Children");
  const [percentage, setPercentage] = useState(10);

  // 🔐 get current user
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    })();
  }, []);

  // 🔐 auth handlers
  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return alert(error.message);
    const { data } = await supabase.auth.getUser();
    setUser(data?.user || null);
  }

  async function handleSignup() {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return alert(error.message);
    alert("Signup successful! Now login.");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setScores([]);
  }

  // 📊 fetch scores (latest first) — LIMIT to 5 at DB + UI
  async function fetchScores() {
    if (!user) return;
    const { data, error } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", user.id)
      .order("id", { ascending: false })
      .limit(5); // DB-level safety

    if (error) return alert("Error fetching scores");
    setScores((data || []).slice(0, 5)); // UI safety
  }

  useEffect(() => {
    fetchScores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ➕ add score (strict, race-safe)
  async function handleAddScore() {
    if (!user) return alert("Please login first");

    // validations
    if (!score || !date) return alert("Enter score and date");
    const n = Number(score);
    if (Number.isNaN(n) || n < 1 || n > 45) {
      return alert("Score must be between 1 and 45");
    }

    // prevent duplicate date per user
    const { data: sameDate, error: dupErr } = await supabase
      .from("scores")
      .select("id")
      .eq("user_id", user.id)
      .eq("date", date);

    if (dupErr) return alert("Error checking duplicate");
    if (sameDate && sameDate.length > 0) {
      return alert("Score already exists for this date");
    }

    // get current count (oldest first by id)
    const { data: existing, error: existErr } = await supabase
      .from("scores")
      .select("id")
      .eq("user_id", user.id)
      .order("id", { ascending: true });

    if (existErr) return alert("Error loading existing scores");

    // if already 5, delete oldest FIRST and await it
    if (existing && existing.length >= 5) {
      const oldestId = existing[0].id;
      const { error: delErr } = await supabase
        .from("scores")
        .delete()
        .eq("id", oldestId);
      if (delErr) return alert("Error deleting oldest score");
    }

    // now insert
    const { error: insErr } = await supabase.from("scores").insert([
      { user_id: user.id, score: n, date },
    ]);
    if (insErr) return alert("Error adding score");

    // refresh from DB (authoritative)
    await fetchScores();

    // reset inputs
    setScore("");
    setDate("");
  }

  return (
    <div
      style={{
        fontFamily: "Arial",
        background: "#f4f7f6",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          margin: "auto",
          background: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ textAlign: "center" }}>⛳ Golf Dashboard</h1>

        <img
          src="https://images.unsplash.com/photo-1599058917212-d750089bc07e"
          alt="golf"
          style={{ width: "100%", borderRadius: "10px", marginBottom: "20px" }}
        />

        <p style={{ textAlign: "center" }}>
          Track scores • Support charities • Win rewards
        </p>

        <hr />

        {/* ACCOUNT */}
        <h2>Account</h2>
        {user ? (
          <div>
            <p>Logged in: {user.email}</p>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <div>
            <input
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", marginBottom: "10px" }}
            />
            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", marginBottom: "10px" }}
            />
            <button onClick={handleLogin}>Login</button>
            <button onClick={handleSignup} style={{ marginLeft: "10px" }}>
              Sign Up
            </button>
          </div>
        )}

        <hr />

        {/* SUBSCRIPTION */}
        <h2>Subscription</h2>
        <p>Status: Active</p>
        <p>Plan: Monthly</p>
        <p>Next Billing: 30 April 2026</p>
        <p>Contribution: {percentage}% to charity</p>

        <hr />

        {/* CHARITY */}
        <h2>Select Charity</h2>
        <select
          value={charity}
          onChange={(e) => setCharity(e.target.value)}
          style={{ width: "100%", marginBottom: "10px" }}
        >
          <option>Save Children</option>
          <option>Green Earth</option>
          <option>Health Aid</option>
        </select>

        <input
          type="number"
          min="10"
          max="100"
          value={percentage}
          onChange={(e) => setPercentage(e.target.value)}
          style={{ width: "100%", marginBottom: "10px" }}
        />

        <p>
          You are contributing <b>{percentage}%</b> to <b>{charity}</b>
        </p>

        <hr />

        {/* ADD SCORE */}
        <h2>Add Golf Score</h2>
        <input
          type="number"
          min="1"
          max="45"
          placeholder="Score (1-45)"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          style={{ width: "100%", marginBottom: "10px" }}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ width: "100%", marginBottom: "10px" }}
        />
        <button onClick={handleAddScore}>Add Score</button>

        <hr />

        {/* SCORES */}
        <h2>Your Last 5 Scores</h2>
        {scores.length === 0 && <p>No scores yet</p>}
        {scores.map((s) => (
          <div
            key={s.id}
            style={{
              background: "#f0f0f0",
              padding: "8px",
              marginBottom: "5px",
              borderRadius: "5px",
            }}
          >
            Score: {s.score} | Date: {s.date}
          </div>
        ))}

        <hr />
        <a href="/admin">Go to Admin Dashboard</a>
      </div>
    </div>
  );
}