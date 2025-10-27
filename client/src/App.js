import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [punches, setPunches] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPunches = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/punches");
      const data = await res.json();
      setPunches(data);
    } catch (err) {
      console.error("Failed to fetch punches:", err);
    }
    setLoading(false);
  };

  const handlePunch = async () => {
    const time = new Date().toLocaleTimeString();
    await fetch("/api/punch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ time }),
    });
    fetchPunches();
  };

  useEffect(() => {
    fetchPunches();
  }, []);

  return (
    <div className="App">
      <h1>⏱️ React Punch App</h1>
      <button onClick={handlePunch}>Punch Time</button>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {punches.map((p, i) => (
            <li key={i}>
              {p.time} — {p.createdAt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;

