import express from "express";
import cors from "cors";
import couchbase from "couchbase";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 3001;

// --- Couchbase Connection ---
const connectToCouchbase = async () => {
  try {
    const cluster = await couchbase.connect(process.env.COUCHBASE_CONNSTR, {
      username: process.env.COUCHBASE_USERNAME,
      password: process.env.COUCHBASE_PASSWORD,
    });
    const bucket = cluster.bucket(process.env.COUCHBASE_BUCKET);
    const collection = bucket.defaultCollection();
    console.log("✅ Connected to Couchbase");
    return collection;
  } catch (err) {
    console.error("❌ Couchbase connection failed:", err);
    process.exit(1);
  }
};
let collectionPromise = connectToCouchbase();

// --- API ROUTES ---
app.post("/api/punch", async (req, res) => {
  try {
    const collection = await collectionPromise;
    const punch = { time: req.body.time, createdAt: new Date().toISOString() };
    const key = `punch_${Date.now()}`;
    await collection.upsert(key, punch);
    res.send({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to save punch" });
  }
});

app.get("/api/punches", async (req, res) => {
  try {
    // TODO: replace with proper N1QL query later
    res.send([{ time: "Sample Data (DB Query to be extended)" }]);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to fetch punches" });
  }
});

// --- Serve React Build ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientBuildPath = path.join(__dirname, "../client/build");

app.use(express.static(clientBuildPath));

// Fallback: all routes except /api/* go to React app
app.get("*", (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

// --- Start Server ---
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));

