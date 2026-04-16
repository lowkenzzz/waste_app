const express = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const { autoAssign } = require("../utils/autoAssign");

function adminRoutes(prisma) {
  const router = express.Router();
  router.use(authenticate, authorize("ADMIN"));

  router.get("/queue", async (_req, res) => {
    try {
      const reports = await prisma.report.findMany({
        where: { status: "NEEDS_REVIEW" },
        include: { student: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      });
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch queue", error: error.message });
    }
  });

  router.get("/reports", async (req, res) => {
    try {
      const where = req.query.status ? { status: req.query.status } : {};
      const reports = await prisma.report.findMany({
        where,
        include: {
          student: { select: { id: true, name: true, email: true } },
          task: { include: { cleaner: { select: { id: true, name: true } } } },
        },
        orderBy: { createdAt: "desc" },
      });
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reports", error: error.message });
    }
  });

  router.patch("/reports/:id/approve", async (req, res) => {
    try {
      const report = await prisma.report.findUnique({ where: { id: req.params.id } });
      if (!report) return res.status(404).json({ message: "Report not found" });
      if (report.status === "DISCARDED" || report.status === "RESOLVED") {
        return res.status(400).json({ message: "Cannot approve this report" });
      }
      await autoAssign(prisma, report.id);
      const updated = await prisma.report.findUnique({
        where: { id: report.id },
        include: { task: true },
      });
      return res.json(updated);
    } catch (error) {
      return res.status(500).json({ message: "Failed to approve report", error: error.message });
    }
  });

  router.patch("/reports/:id/reject", async (req, res) => {
    try {
      const updated = await prisma.report.update({
        where: { id: req.params.id },
        data: { status: "DISCARDED" },
      });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to reject report", error: error.message });
    }
  });

  return router;
}

module.exports = adminRoutes;
