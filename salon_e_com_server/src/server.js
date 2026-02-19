import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import v1Routes from "./v1/v1.routes.js";
import cron from "node-cron";
import { processMonthlySettlement } from "./v1/services/settlement.service.js";
import http from 'http';
import socketService from './v1/services/socket.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
socketService.init(server);

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadDir)) {
   fs.mkdirSync(uploadDir, { recursive: true });
   console.log(`Created uploads directory at: ${uploadDir}`);
}

/* =======================
   CORS (PRODUCTION ONLY)
======================= */
app.use(
   cors({
      origin: ["https://projectsalonshop.vercel.app", "http://localhost:5173"],        // for the developement
      credentials: true
   })
);

// Preflight
app.options("*", cors());



/* =======================
   MIDDLEWARE
======================= */
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

/* =======================
   DATABASE
======================= */
connectDB();

/* =======================
   ROUTES
======================= */
app.use("/api/v1", v1Routes);

/* =======================
   HEALTH CHECK
======================= */
app.get("/", (req, res) => {
   res.status(200).send("Salon E-Commerce API is running 🚀");
});

/* =======================
   SCHEDULER
======================= */
// Run at 12:00 AM on the 1st of every month
// Run at 12:00 AM on the 1st of every month
cron.schedule("0 0 1 * *", () => {
   processMonthlySettlement();
});

// Run at 12:00 AM every day
cron.schedule("0 0 * * *", async () => {
   const { processExpiredRewards } = await import("./v1/services/reward.service.js"); // Dynamic import to avoid circular dep issues if any
   const count = await processExpiredRewards();
   console.log(`[CRON] Processed reward expiry for ${count} ledgers.`);
});

/* =======================
   ERROR HANDLER
======================= */
app.use((err, req, res, next) => {
   try {
      console.error('[Global Error Handler] Caught error:', err);

      if (res.headersSent) {
         console.error('[Global Error Handler] Headers already sent, delegating to default handler');
         return next(err);
      }

      const statusCode = (err && err.statusCode) ? err.statusCode : 500;
      const message = (err && err.message) ? err.message : 'Internal Server Error';

      res.status(statusCode).json({
         success: false,
         message: message,
         stack: process.env.NODE_ENV === 'production' ? null : (err && err.stack)
      });
   } catch (handlerError) {
      console.error('[Global Error Handler] Error within handler:', handlerError);
      next(handlerError);
   }
});

/* =======================
   SERVER
======================= */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
   console.log(`✅ Server (with WebSockets) running on port ${PORT}`);
});
