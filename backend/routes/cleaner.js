const express = require("express");
const multer = require("multer");
const path = require("path");
const { authenticate, authorize } = require("../middleware/auth");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
});
const upload = multer({ storage });

function cleanerRoutes(prisma) {
  const router = express.Router();
  router.use(authenticate, authorize("CLEANER"));

  router.get("/tasks", async (req, res) => {
    try {
      const tasks = await prisma.task.findMany({
        where: { cleanerId: req.user.id },
        include: {
          report: {
            include: {
              student: { select: { id: true, name: true, email: true } },
            },
          },
        },
        orderBy: { assignedAt: "desc" },
      });
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks", error: error.message });
    }
  });

  router.post("/tasks/:id/resolve", upload.single("proofImage"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "proofImage is required" });

      const task = await prisma.task.findUnique({
        where: { id: req.params.id },
        include: { report: true },
      });

      if (!task || task.cleanerId !== req.user.id) {
        return res.status(404).json({ message: "Task not found" });
      }

      const updatedTask = await prisma.task.update({
        where: { id: task.id },
        data: { resolvedAt: new Date() },
      });

      await prisma.report.update({
        where: { id: task.reportId },
        data: {
          proofImageUrl: `/uploads/${req.file.filename}`,
          status: "RESOLVED",
        },
      });

      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ message: "Failed to resolve task", error: error.message });
    }
  });

  return router;
}

module.exports = cleanerRoutes;
