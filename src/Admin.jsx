import { useEffect, useState } from "react";
import { supabase } from "./supabase";

function Admin() {
  const [scores, setScores] = useState([]);
  const [charities, setCharities] = useState([]);

  async function fetchAdminData() {
    const { data: scoresData } = await supabase
      .from("scores")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: charitiesData } = await supabase
      .from("charities")
      .select("*");

    setScores(scoresData || []);
    setCharities(charitiesData || []);
  }

  useEffect(() => {
    fetchAdminData();
  }, []);

  return (
    <div style={{ padding: "30px" }}>
      <h1>Admin Dashboard</h1>

      <h2>All Scores</h2>

      {scores.map((item) => (
        <div key={item.id}>
          <p>
            User ID: {item.user_id} | Score: {item.score} | Date: {item.date}
          </p>
        </div>
      ))}

      <hr />

      <h2>Charity Management</h2>

      {charities.map((charity) => (
        <div key={charity.id}>
          <p>
            {charity.name} — {charity.description}
          </p>
        </div>
      ))}
    </div>
  );
}

export default Admin;