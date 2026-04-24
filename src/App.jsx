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

  // 📊 Fetch scores
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

  // ➕ Add Score (FINAL CORRECT LOGIC)
  async function handleAddScore() {
    if (!user) {
      alert("Please login first");
      return;
    }

    // ✅ VALIDATION
    if (!score || !date) {
      alert("Please enter score and date");
      return;
    }

    if (Number(score) < 1 || Number(score) > 45) {
      alert("Score must be between 1 and 45");
      return;
    }

    // ❌ Duplicate date check
    const { data: sameDate } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", date);

    if (sameDate && sameDate.length > 0) {
      alert("Score already exists for this date");
      return;
    }

    // 📊 Existing scores
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

    // ➕ Insert new
    const { error } = await supabase.from("scores").insert([
      {
        user_id: user.id,
        score: Number(score),
        date: date,
      },
    ]);

    if (error) {
      alert("Error adding score");
      return;
    }

    setScore("");
    setDate("");
    fetchScores();
  }

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "600px",
        margin: "auto",
        fontFamily: "Arial",
      }}
    >
      <h1>Golf Dashboard</h1>
      <p>
        Track your golf scores, support charities, and participate in rewards.
      </p>

      {/* LOGIN */}
      <h2>Login</h2>

      {user ? (
        <div>
          <p>Logged in: {user.email}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div>
          <input
            type="email"
            placeholder="Enter email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <br /><br />

          <input
            type="password"
            placeholder="Enter password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <br /><br />

          <button onClick={handleLogin}>Login</button>
          <button onClick={handleSignup} style={{ marginLeft: "10px" }}>
            Sign Up
          </button>
        </div>
      )}

      <hr />

      {/* SUBSCRIPTION */}
      <h2>Subscription Status</h2>
      <p>Status: Active</p>
      <p>Plan: Monthly Subscription</p>
      <p>Renewal Date: 30 April 2026</p>

      <hr />

      {/* CHARITY */}
      <h2>Charity</h2>
      <p>Save Children - Helping kids</p>
      <p>Green Earth - Environment support</p>
      <p>Health Aid - Medical help</p>

      <hr />

      {/* SCORE ENTRY */}
      <h2>Add Golf Score</h2>

      <input
        type="number"
        min="1"
        max="45"
        placeholder="Score (1-45)"
        value={score}
        onChange={(e) => setScore(e.target.value)}
      />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <button onClick={handleAddScore}>Add Score</button>

      <hr />

      {/* SCORES */}
      <h2>Last 5 Scores</h2>

      {scores.length === 0 && <p>No scores added yet</p>}

      {scores.map((s) => (
        <div key={s.id}>
          <p>
            Score: {s.score} | Date: {s.date}
          </p>
        </div>
      ))}

      <hr />

      {/* ADMIN */}
      <a href="/admin">Go to Admin Dashboard</a>
    </div>
  );
}

export default App;