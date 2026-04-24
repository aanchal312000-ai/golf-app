import { useState, useEffect } from "react";
import { supabase } from "./supabase";

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [score, setScore] = useState("");
  const [date, setDate] = useState("");
  const [scores, setScores] = useState([]);

  // 🔐 Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };
    getUser();
  }, []);

  // 🔐 Login
  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) alert(error.message);
    else window.location.reload();
  }

  // 🆕 Signup
  async function handleSignup() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) alert(error.message);
    else alert("Signup successful! Now login.");
  }

  // 🔓 Logout
  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    window.location.reload();
  }

  // 📊 Fetch scores (ONLY current user)
  async function fetchScores() {
    if (!user) return;

    const { data } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    setScores(data || []);
  }

  useEffect(() => {
    fetchScores();
  }, [user]);

  // ➕ Add Score
  async function handleAddScore() {
    if (!user) {
      alert("Please login first");
      return;
    }

    if (!score || !date) {
      alert("Enter score and date");
      return;
    }

    if (Number(score) < 1 || Number(score) > 45) {
      alert("Score must be between 1 and 45");
      return;
    }

    // ❌ Prevent duplicate date
    const { data: sameDate } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", date);

    if (sameDate && sameDate.length > 0) {
      alert("Score already exists for this date");
      return;
    }

    // 📊 Get existing
    const { data: existing } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: true });

    // 🧹 Keep only last 5
    if (existing && existing.length >= 5) {
      await supabase
        .from("scores")
        .delete()
        .eq("id", existing[0].id);
    }

    await supabase.from("scores").insert([
      {
        user_id: user.id,
        score: Number(score),
        date: date,
      },
    ]);

    setScore("");
    setDate("");
    fetchScores();
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

        {/* Image */}
        <img
          src="https://images.unsplash.com/photo-1599058917212-d750089bc07e"
          alt="golf"
          style={{
            width: "100%",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        />

        <p style={{ textAlign: "center" }}>
          Track scores • Support charities • Win rewards
        </p>

        <hr />

        {/* LOGIN */}
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
            <button
              onClick={handleSignup}
              style={{ marginLeft: "10px" }}
            >
              Sign Up
            </button>
          </div>
        )}

        <hr />

        {/* SCORE */}
        <h2>Add Score</h2>

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

export default App;