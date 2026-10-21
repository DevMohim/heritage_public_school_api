import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import "dotenv/config";

import studentsRoutes from "./routes/students.js";
import teachersRoutes from "./routes/teachers.js";

const app = express();
const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is not set");
}

const client = new MongoClient(uri);
const dbPromise = client
  .connect()
  .then(() => client.db("School-Management-DB"));

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server running successfully");
});

// MongoDB connect হওয়ার পর collections attach করে routes চালু হবে
// TEMP DEBUG: TLS diagnostics for MongoDB connectivity (REMOVE AFTER DEBUG)
import tls from "node:tls";
import net from "node:net";
app.get("/debug-tls", (req, res) => {
  const uri = process.env.MONGODB_URI || "";
  const hostMatch = uri.match(/@([^:/\s]+)[:/]/);
  const host = hostMatch ? hostMatch[1] : "unknown";
  const maskedUri = uri.startsWith("mongodb") ? `mongodb://****@${host}:${uri.includes(":27017") ? "27017" : "default"}` : `[INVALID: len=${uri.length}]`;
  const tcp = (port, targetHost = host) =>
    new Promise((resolve) => {
      const start = Date.now();
      const sock = net.connect({ host: targetHost, port, timeout: 6000 }, () => {
        resolve({ test: `tcp-${targetHost}:${port}`, ok: true, ms: Date.now() - start, remote: sock.remoteAddress });
        sock.destroy();
      });
      sock.on("error", (e) => resolve({ test: `tcp-${targetHost}:${port}`, ok: false, code: e.code, ms: Date.now() - start }));
      sock.on("timeout", () => { sock.destroy(); resolve({ test: `tcp-${targetHost}:${port}`, ok: false, code: "TIMEOUT", ms: Date.now() - start }); });
    });
  const tlsTest = (port, targetHost = host, opts = {}) =>
    new Promise((resolve) => {
      const start = Date.now();
      const sock = tls.connect({ host: targetHost, port, servername: targetHost, timeout: 6000, ...opts }, () => {
        const cert = sock.getPeerCertificate();
        resolve({ test: `tls-${targetHost}:${port}${opts.maxVersion ? "-" + opts.maxVersion : ""}`, ok: true, ms: Date.now() - start, remote: sock.remoteAddress, issuer: cert && cert.issuer && cert.issuer.O, authorized: sock.authorized, authError: String(sock.authorizationError || "") });
        sock.end();
      });
      sock.on("error", (e) => resolve({ test: `tls-${targetHost}:${port}${opts.maxVersion ? "-" + opts.maxVersion : ""}`, ok: false, code: e.code, ms: Date.now() - start }));
      sock.on("timeout", () => { sock.destroy(); resolve({ test: `tls-${targetHost}:${port}${opts.maxVersion ? "-" + opts.maxVersion : ""}`, ok: false, code: "TIMEOUT", ms: Date.now() - start }); });
    });
  Promise.all([
    tcp(27017),
    tcp(27017, "www.google.com"),
    tcp(443, "www.google.com"),
    tlsTest(27017),
    tlsTest(27017, host, { minVersion: "TLSv1.2", maxVersion: "TLSv1.2" }),
    tlsTest(27017),
    tlsTest(27017, "www.google.com"),
    fetch("https://www.google.com").then((r) => ({ test: "google", ok: true, status: r.status })).catch((e) => ({ test: "google", ok: false, error: e.message })),
  ]).then((results) => res.json({ node: process.version, host, maskedUri, results }));
});

app.use(async (req, res, next) => {
  try {
    const db = await dbPromise;
    app.locals.studentsCollection = db.collection("Students");
    app.locals.teachersCollection = db.collection("Teachers");
    next();
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    res.status(500).json({ message: "Database connection failed" });
  }
});

app.use("/students", studentsRoutes);
app.use("/teachers", teachersRoutes);

// Unknown route handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong", error: err.message });
});

// লোকাল development-এ server চালু রাখুন
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Server running on port ${port}`));
}

export default app;
