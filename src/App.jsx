import { useState, useEffect } from "react";
import { supabase } from "./supabase";

function App() {
  const [user, setUser] = useState(null);
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

  // ➕ Add Score (LAST 5 LOGIC IMPLEMENTED)
  async function handleAddScore() {
    if (!user) {
      alert("Please login first");
      return;
    }

    // get existing scores
    const { data: existing } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: true });

    // if 5 already exist → delete oldest
    if (existing && existing.length >= 5) {
      await supabase
        .from("scores")
        .delete()
        .eq("id", existing[0].id);
    }

    // insert new score
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
    <div style={{ padding: "30px" }}>
      <h1>Golf Dashboard</h1>

      {/* LOGIN INFO */}
      <h2>Login Status</h2>
      <p>{user ? `Logged in: ${user.email}` : "Not logged in"}</p>

      <hr />

      {/* SUBSCRIPTION (STATIC FOR NOW) */}
      <h2>Subscription Status</h2>
      <p>Status: Active</p>
      <p>Plan: Monthly Subscription</p>
      <p>Renewal Date: 30 April 2026</p>

      <hr />

      {/* SCORE ENTRY */}
      <h2>Add Golf Score</h2>

      <input
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

      {/* LAST 5 SCORES */}
      <h2>Last 5 Scores</h2>

      {scores.map((s) => (
        <div key={s.id}>
          <p>
            Score: {s.score} | Date: {s.date}
          </p>
        </div>
      ))}

      <hr />

      {/* ADMIN LINK */}
      <a href="/admin">Go to Admin Dashboard</a>
    </div>
  );
}

export default App;