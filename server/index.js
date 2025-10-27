import express from "express";
import cors from "cors";
import couchbase from "couchbase";

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 3001;

// ✅ Couchbase connection
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

let couchbaseObjects = await connectToCouchbase();

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("✅ Server is running fine!");
});

// ✅ Create a punch
app.post("/api/punch", async (req, res) => {
  try {
    const { collection } = couchbaseObjects;
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

// ✅ Get all punches
app.get("/api/punches", async (req, res) => {
  try {
    const { cluster } = couchbaseObjects;
    const query = `
      SELECT time, createdAt 
      FROM \`${process.env.COUCHBASE_BUCKET}\` 
      WHERE META().id LIKE "punch_%" 
      ORDER BY createdAt DESC
      LIMIT 20;
    `;
    const result = await cluster.query(query);
    res.send(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to fetch punches" });
  }
});

app.listen(port, () =>
  console.log(`🚀 Server running on port ${port}`)
);




