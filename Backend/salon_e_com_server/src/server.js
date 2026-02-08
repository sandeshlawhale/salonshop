import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import v1Routes from "./v1/v1.routes.js";

const app = express();

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
   SERVER
======================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
   console.log(`✅ Server running on port ${PORT}`);
});
