const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const authRoutes = require("./routes/auth");
const reportRoutes = require("./routes/reports");
const adminRoutes = require("./routes/admin");
const cleanerRoutes = require("./routes/cleaner");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes(prisma));
app.use("/api/reports", reportRoutes(prisma));
app.use("/api/admin", adminRoutes(prisma));
app.use("/api/cleaner", cleanerRoutes(prisma));

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
