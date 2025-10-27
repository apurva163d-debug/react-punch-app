// import express from "express";
// import cors from "cors";
// import couchbase from "couchbase";
// import path from "path";
// import { fileURLToPath } from "url";

// const app = express();
// app.use(express.json());
// app.use(cors());

// const port = process.env.PORT || 3001;

// // Required to resolve __dirname in ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // ✅ Connect to Couchbase
// const connectToCouchbase = async () => {
//   try {
//     const cluster = await couchbase.connect(process.env.COUCHBASE_CONNSTR, {
//       username: process.env.COUCHBASE_USERNAME,
//       password: process.env.COUCHBASE_PASSWORD,
//     });
//     const bucket = cluster.bucket(process.env.COUCHBASE_BUCKET);
//     const collection = bucket.defaultCollection();
//     console.log("✅ Connected to Couchbase");
//     return collection;
//   } catch (err) {
//     console.error("❌ Couchbase connection failed:", err);
//     process.exit(1);
//   }
// };

// let collectionPromise = connectToCouchbase();

// // ✅ API Routes
// app.post("/api/punch", async (req, res) => {
//   try {
//     const collection = await collectionPromise;
//     const punch = { time: req.body.time, createdAt: new Date().toISOString() };
//     const key = `punch_${Date.now()}`;
//     await collection.upsert(key, punch);
//     res.send({ success: true });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send({ error: "Failed to save punch" });
//   }
// });

// app.get("/api/punches", async (req, res) => {
//   try {
//     const collection = await collectionPromise;
//     res.send([{ time: "Sample Data (DB Query to be extended)" }]);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send({ error: "Failed to fetch punches" });
//   }
// });

// // ✅ Serve React build files
// const clientBuildPath = path.join(__dirname, "../client/build");
// app.use(express.static(clientBuildPath));

// // ✅ Fallback to index.html for SPA routing
// app.get("*", (req, res) => {
//   res.sendFile(path.join(clientBuildPath, "index.html"));
// });

// // ✅ Start server
// app.listen(port, () => console.log(`🚀 Server running on port ${port}`));


import express from "express";
import cors from "cors";
import couchbase from "couchbase";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    res.send([{ time: "Sample Data (DB Query to be extended)" }]);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to fetch punches" });
  }
});

// Serve frontend if available
app.use(express.static(path.join(__dirname, "../client/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

app.listen(port, () => console.log(`🚀 Server running on port ${port}`));



