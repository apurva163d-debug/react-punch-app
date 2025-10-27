import express from "express";
import cors from "cors";
import couchbase from "couchbase";

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 3001;

// connect to couchbase
const connectToCouchbase = async () => {
  try {
    const cluster = await couchbase.connect(process.env.COUCHBASE_CONNSTR, {
      username: process.env.COUCHBASE_USERNAME,
      password: process.env.COUCHBASE_PASSWORD,
    });
    const bucket = cluster.bucket(process.env.COUCHBASE_BUCKET);
    const collection = bucket.defaultCollection();

    console.log("✅ Connected to Couchbase");
    return { cluster, bucket, collection };
  } catch (err) {
    console.error("❌ Couchbase connection failed:", err);
    process.exit(1);
  }
};

let dbPromise = connectToCouchbase();

// save a punch
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

// get punches (temporary mock data)
app.get("/api/punches", async (req, res) => {
  try {
    const { cluster, bucket } = await dbPromise;

    // use a sample database query (replace with your bucket name)
    const query = `SELECT META().id, time, createdAt FROM \`${bucket.name}\` LIMIT 10;`;
    const result = await cluster.query(query);

    res.send(result.rows);
  } catch (err) {
    console.error("❌ Error fetching punches:", err);
    res.status(500).send({ error: "Failed to fetch punches" });
  }
});

// default route for testing
app.get("/", (req, res) => {
  res.send("✅ Server is running fine!");
});

app.listen(port, () => console.log(`🚀 Server running on port ${port}`));



