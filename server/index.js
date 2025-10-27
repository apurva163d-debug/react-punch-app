import express from "express";
import cors from "cors";
import couchbase from "couchbase";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json());
app.use(cors());

// Support for ES modules (__dirname replacement)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 3001;

// Couchbase connection
let cluster, bucket, collection;
const connectToCouchbase = async () => {
  try {
    cluster = await couchbase.connect(process.env.COUCHBASE_CONNSTR, {
      username: process.env.COUCHBASE_USERNAME,
      password: process.env.COUCHBASE_PASSWORD,
    });
    bucket = cluster.bucket(process.env.COUCHBASE_BUCKET);
    collection = bucket.defaultCollection();
    console.log("✅ Connected to Couchbase");
  } catch (err) {
    console.error("❌ Couchbase connection failed:", err);
    process.exit(1);
  }
};
connectToCouchbase();

// API routes
app.post("/api/punch", async (req, res) => {
  try {
    const punch = {
      time: req.body.time,
      createdAt: new Date().toISOString(),
    };
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
    // Example static data (replace later with N1QL query)
    res.send([{ time: "Sample Data (replace with DB query)" }]);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to fetch punches" });
  }
});

// Serve React frontend (after build)
const clientBuildPath = path.join(__dirname, "../client/build");
app.use(express.static(clientBuildPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
