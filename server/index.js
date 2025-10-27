import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import couchbase from "couchbase";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Couchbase connection
let cluster, bucket, collection;
const connectToCouchbase = async () => {
  try {
    cluster = await couchbase.connect(process.env.COUCHBASE_CONN_STR, {
      username: process.env.COUCHBASE_USERNAME,
      password: process.env.COUCHBASE_PASSWORD,
    });
    bucket = cluster.bucket(process.env.COUCHBASE_BUCKET);
    collection = bucket.defaultCollection();
    console.log("✅ Connected to Couchbase");
  } catch (err) {
    console.error("❌ Couchbase connection error:", err);
  }
};
connectToCouchbase();

// API: Save punch-in
app.post("/api/punchin", async (req, res) => {
  try {
    const { time } = req.body;
    const id = `punch_${Date.now()}`;
    await collection.insert(id, { time });
    res.status(200).send({ success: true });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// API: Get all punches
app.get("/api/punchin", async (req, res) => {
  try {
    const query = `SELECT META().id, time FROM \`${process.env.COUCHBASE_BUCKET}\``;
    const result = await cluster.query(query);
    res.status(200).send(result.rows);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// --- NEW: Serve React build files ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientBuildPath = path.join(__dirname, "../client/build");

app.use(express.static(clientBuildPath));

// Fallback: for any route not starting with /api, send React index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

// --- Start server ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

