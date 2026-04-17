const express = require("express");
const multer = require("multer");
const path = require("path");
const { analyzeImage } = require("../utils/roboflow");
const { autoAssign } = require("../utils/autoAssign");
const { authenticate, authorize } = require("../middleware/auth");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
});

const upload = multer({ storage });

function reportRoutes(prisma) {
  const router = express.Router();

  router.post(
    "/",
    authenticate,
    authorize("STUDENT"),
    upload.single("image"),
    async (req, res) => {
      try {
        const { gpsLat, gpsLng } = req.body;
        if (!req.file || gpsLat === undefined || gpsLng === undefined) {
          return res.status(400).json({ message: "image, gpsLat and gpsLng are required" });
        }

        const report = await prisma.report.create({
          data: {
            studentId: req.user.id,
            imageUrl: `/uploads/${req.file.filename}`,
            gpsLat: Number(gpsLat),
            gpsLng: Number(gpsLng),
            status: "PENDING",
          },
        });

        res.status(201).json(report);

        analyzeImage(req.file.path)
          .then(async ({ confidenceScore }) => {
            let nextStatus = "NEEDS_REVIEW";
            if (confidenceScore < 40) {
              nextStatus = "DISCARDED";
            } else if (confidenceScore >= 70) {
              nextStatus = "ASSIGNED";
            }

            const updated = await prisma.report.update({
              where: { id: report.id },
              data: {
                confidenceScore,
                status: nextStatus,
              },
            });

            if (updated.status === "ASSIGNED") {
              await autoAssign(prisma, report.id);
            }
          })
          .catch(async () => {
            await prisma.report.update({
              where: { id: report.id },
              data: { status: "NEEDS_REVIEW" },
            });
          });
      } catch (error) {
        res.status(500).json({ message: "Failed to create report", error: error.message });
      }
    },
  );

  router.get("/mine", authenticate, authorize("STUDENT"), async (req, res) => {
    try {
      const reports = await prisma.report.findMany({
        where: { studentId: req.user.id },
        orderBy: { createdAt: "desc" },
      });
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reports", error: error.message });
    }
  });

  router.get("/:id", authenticate, async (req, res) => {
    try {
      const report = await prisma.report.findUnique({
        where: { id: req.params.id },
        include: {
          task: {
            include: { cleaner: { select: { id: true, name: true, email: true } } },
          },
          student: { select: { id: true, name: true, email: true } },
        },
      });
      if (!report) return res.status(404).json({ message: "Report not found" });
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch report", error: error.message });
    }
  });

  return router;
}

module.exports = reportRoutes;
