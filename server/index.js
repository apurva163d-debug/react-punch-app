import express from "express";
import cors from "cors";
import couchbase from "couchbase";

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 3001;

// ✅ Connect to Couchbase
const connectToCouchbase = async () => {
  try {
    const cluster = await couchbase.connect(process.env.COUCHBASE_CONNSTR, {
      username: process.env.COUCHBASE_USERNAME,
      password: process.env.COUCHBASE_PASSWORD,
    });
    const bucket = cluster.bucket(process.env.COUCHBASE_BUCKET);
    const collection = bucket.defaultCollection();
    console.log("✅ Connected to Couchbase");
    return { cluster, collection };
  } catch (err) {
    console.error("❌ Couchbase connection failed:", err);
    process.exit(1);
  }
};

const connectionPromise = connectToCouchbase();

// ✅ API to add a punch
app.post("/api/punch", async (req, res) => {
  try {
    const { collection } = await connectionPromise;
    const punch = {
      time: req.body.time,
      createdAt: new Date().toISOString(),
    };
    const key = `punch_${Date.now()}`;
    await collection.upsert(key, punch);
    res.send({ success: true });
  } catch (err) {
    console.error("Error saving punch:", err);
    res.status(500).send({ error: "Failed to save punch" });
  }
});

// ✅ API to fetch punches (simple sample data for now)
app.get("/api/punches", async (req, res) => {
  try {
    // NOTE: Couchbase doesn't have a direct "get all" for key-value collections.
    // You’d normally query using N1QL, but for demo, we'll just return mock data.
    res.send([
      { time: "2025-10-27T09:00:00Z" },
      { time: "2025-10-27T17:00:00Z" },
    ]);
  } catch (err) {
    console.error("Error fetching punches:", err);
    res.status(500).send({ error: "Failed to fetch punches" });
  }
});

import path from "path";
import { fileURLToPath } from "url";

// ✅ Needed for ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Serve static files from React build folder
app.use(express.static(path.join(__dirname, "../client/build")));

// ✅ Handle any route not starting with /api → send React index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));


