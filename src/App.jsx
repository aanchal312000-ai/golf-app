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

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    })();
  }, []);

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

  async function fetchScores() {
    if (!user) return;
    const { data } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", user.id)
      .order("id", { ascending: false })
      .limit(5);

    setScores((data || []).slice(0, 5));
  }

  useEffect(() => {
    fetchScores();
  }, [user]);

  async function handleAddScore() {
    if (!user) return alert("Please login first");

    if (!score || !date) return alert("Enter score and date");

    const n = Number(score);
    if (n < 1 || n > 45) return alert("Score must be between 1 and 45");

    const { data: sameDate } = await supabase
      .from("scores")
      .select("id")
      .eq("user_id", user.id)
      .eq("date", date);

    if (sameDate && sameDate.length > 0) {
      return alert("Score already exists for this date");
    }

    const { data: existing } = await supabase
      .from("scores")
      .select("id")
      .eq("user_id", user.id)
      .order("id", { ascending: true });

    if (existing && existing.length >= 5) {
      await supabase.from("scores").delete().eq("id", existing[0].id);
    }

    await supabase.from("scores").insert([
      { user_id: user.id, score: n, date },
    ]);

    await fetchScores();
    setScore("");
    setDate("");
  }

  return (
    <div style={{ fontFamily: "Arial", background: "#f4f7f6", minHeight: "100vh", padding: "20px" }}>
      <div style={{ maxWidth: "600px", margin: "auto", background: "white", padding: "20px", borderRadius: "10px" }}>

        <h1 style={{ textAlign: "center" }}>⛳ Golf Dashboard</h1>

        <img
          
  src="https://as1.ftcdn.net/v2/jpg/00/70/87/42/1000_F_70874284_v6pRDaeXZ032DyUDw4wROPLzgipw3NQp.jpg"
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

        {/* ACCOUNT */}
        <h2>Account</h2>
        {user ? (
          <div>
            <p>Logged in: {user.email}</p>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <div>
            <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", marginBottom: "10px" }} />
            <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", marginBottom: "10px" }} />
            <button onClick={handleLogin}>Login</button>
            <button onClick={handleSignup} style={{ marginLeft: "10px" }}>Sign Up</button>
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

        {/* PAYMENT (NEW) */}
        <h2>Payment (Demo)</h2>
        <p>Subscription Fee: ₹499/month</p>
        <p>Status: Paid</p>
        <button disabled>Pay Now (Demo)</button>

        <hr />

        {/* CHARITY */}
        <h2>Select Charity</h2>
        <select value={charity} onChange={(e) => setCharity(e.target.value)} style={{ width: "100%", marginBottom: "10px" }}>
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

        {/* LOTTERY / DRAW (NEW) */}
        <h2>Monthly Draw</h2>
        <p>Next Draw Date: 30 April 2026</p>
        <p>Status: Upcoming</p>
        <p>Winners will be selected randomly from eligible users.</p>
        <button disabled>Run Draw (Admin Only)</button>

        <hr />

        {/* SCORE */}
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
          <div key={s.id} style={{ background: "#f0f0f0", padding: "8px", marginBottom: "5px", borderRadius: "5px" }}>
            Score: {s.score} | Date: {s.date}
          </div>
        ))}

        <hr />
        <a href="/admin">Go to Admin Dashboard</a>
      </div>
    </div>
  );
}