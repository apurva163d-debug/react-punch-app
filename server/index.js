import express from "express";
import cors from "cors";
import couchbase from "couchbase";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Define port for Render
const port = process.env.PORT || 3001;

// ✅ Fix __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

let dbPromise = connectToCouchbase();

// ✅ POST route — Save a punch
app.post("/api/punch", async (req, res) => {
  try {
    const { collection } = await dbPromise;
    const punch = {
      time: req.body.time,
      createdAt: new Date().toISOString(),
    };
    const key = `punch_${Date.now()}`;
    await collection.upsert(key, punch);
    res.send({ success: true });
  } catch (err) {
    console.error("❌ Error saving punch:", err);
    res.status(500).send({ error: "Failed to save punch" });
  }
});

// ✅ GET route — Fetch all punches
app.get("/api/punches", async (req, res) => {
  try {
    const { cluster } = await dbPromise;
    const bucketName = process.env.COUCHBASE_BUCKET;

    const query = `SELECT META().id, time, createdAt FROM \`${bucketName}\``;
    const result = await cluster.query(query);

    res.send(result.rows);
  } catch (err) {
    console.error("❌ Error fetching punches:", err);
    res.status(500).send({ error: "Failed to fetch punches" });
  }
});

// ✅ Serve React frontend build
app.use(express.static(path.join(__dirname, "../client/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

// ✅ Start server
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));


