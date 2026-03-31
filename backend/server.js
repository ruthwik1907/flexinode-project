import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.GODADDY_URL,
  "https://flexinode.in",
  "http://localhost:3000"
].filter(Boolean).map(url => url.replace(/\/$/, "")); // Removes trailing slashes

// Database Connection Helper
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return; // Already connected or connecting
  
  return mongoose.connect(process.env.MONGO_URI, {
    dbName: "databaseManagement",
    serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of hanging
  });
};

app.use(
  cors({
    origin(origin, callback) {
      // Allow if no origin (Postman) or if in whitelist
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('chrome-extension://')) {
        return callback(null, true);
      }
      console.log("🚫 CORS Rejected:", origin);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware to ensure DB is connected before any API call
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB Connection Error:", err.message);
    res.status(500).json({ error: "Database connection failed" });
  }
});

const PORT = process.env.PORT || 5000;
const REQUIRED_ENV_VARS = ["MONGO_URI", "ADMIN_PASSWORD"];

for (const variable of REQUIRED_ENV_VARS) {
  if (!process.env[variable]) {
    console.warn(`⚠️ Missing environment variable: ${variable}`);
  }
}

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: process.env.DB_NAME || "databaseManagement",
  })
  .then(() => {
    console.log("✅ MongoDB Connected");
    console.log(`📂 Database Name: ${mongoose.connection.name}`);
  })
  .catch((err) => {
    console.error("❌ DB Error Details:", err.message);
  });

/* ============================
   USER SCHEMA
============================ */
const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  name: { type: String },
  email: { type: String, required: true, unique: true },
  storageGB: { type: Number, default: 0 },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

/* ============================
   PAYMENT SCHEMA
============================ */
const paymentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  gb: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  upiLink: { type: String, required: true },
  status: { type: String, default: "PENDING" },
  createdAt: { type: Date, default: Date.now },
});

const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

/* ============================
   USER ROUTES
============================ */

// 🔹 Create/Get user when they log in with Google
app.post("/api/users", async (req, res) => {
  const { uid, name, email } = req.body;
  if (!uid || !email) {
    return res.status(400).json({ error: "UID and email are required" });
  }

  try {
    let user = await User.findOne({ uid });
    if (!user) {
      user = new User({ uid, name, email });
      await user.save();
      return res.status(201).json({ message: "User created", user });
    }

    return res.json({ message: "User already exists", user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1, _id: -1 });
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 🔹 Get user by UID
app.get("/api/users/:uid", async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 🔹 Update storage
app.put("/api/users/:uid/storage", async (req, res) => {
  const { storageGB } = req.body;

  if (typeof storageGB !== "number") {
    return res.status(400).json({ error: "storageGB must be a number" });
  }

  try {
    const user = await User.findOneAndUpdate(
      { uid: req.params.uid },
      { $inc: { storageGB } },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({ message: "Storage updated", user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ============================
   PAYMENT ROUTES
============================ */

app.post("/api/payments", async (req, res) => {
  const { userId, name, email, gb, totalPrice, upiLink } = req.body;

  if (!userId || !name || !email || !gb || !totalPrice || !upiLink) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const payment = new Payment({ userId, gb, totalPrice, upiLink });
    await payment.save();

    let user = await User.findOne({ uid: userId });
    if (!user) {
      user = new User({ uid: userId, name, email, storageGB: gb });
      await user.save();
    } else {
      user.storageGB += gb;
      await user.save();
    }

    return res.status(201).json({ payment, user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/api/payments", async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1, _id: -1 });
    return res.json(payments);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// admin login route
app.post("/api/admin-login", (req, res) => {
  const { password } = req.body;

  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ error: "ADMIN_PASSWORD is not configured" });
  }

  if (password === process.env.ADMIN_PASSWORD) {
    return res.json({ success: true });
  }

  return res.status(401).json({ error: "Invalid password" });
});

// 🔹 Update payment status manually
app.put("/api/payments/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!payment) return res.status(404).json({ error: "Payment not found" });
    return res.json(payment);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ============================
   HEALTH / ROOT
============================ */
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    message: "API is running",
    allowedOrigins,
    hasAdminPassword: Boolean(process.env.ADMIN_PASSWORD),
    dbState: mongoose.connection.readyState,
  });
});

app.get("/", (_req, res) => {
  res.send("🚀 API is running...");
});

/* ============================
   ERROR HANDLING
============================ */
app.use((err, _req, res, _next) => {
  console.error("❌ Server Error:", err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

/* ============================
   SERVER
============================ */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("✅ Allowed origins:", allowedOrigins);
});
export default app;