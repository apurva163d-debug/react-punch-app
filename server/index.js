import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve the built React files
const clientBuildPath = path.join(__dirname, "../client/build");
app.use(express.static(clientBuildPath));

// API routes
app.post("/api/punch", async (req, res) => {
  // ...your Couchbase insert logic
});

app.get("/api/punches", async (req, res) => {
  // ...your fetch logic
});

// Catch-all → send React index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

app.listen(port, () => console.log(`🚀 Server running on port ${port}`));





