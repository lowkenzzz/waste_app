const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function authRoutes(prisma) {
  const router = express.Router();

  router.post("/register", async (req, res) => {
    try {
      const { email, password, name, role = "STUDENT" } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ message: "email, password, and name are required" });
      }

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return res.status(409).json({ message: "Email already registered" });

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { email, password: hashedPassword, name, role },
      });

      return res.status(201).json({ id: user.id, email: user.email, role: user.role, name: user.name });
    } catch (error) {
      return res.status(500).json({ message: "Registration failed", error: error.message });
    }
  });

  router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "email and password are required" });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(401).json({ message: "Invalid credentials" });

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ message: "Invalid credentials" });

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: "12h" },
      );

      return res.json({ token });
    } catch (error) {
      return res.status(500).json({ message: "Login failed", error: error.message });
    }
  });

  return router;
}

module.exports = authRoutes;
