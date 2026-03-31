import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// 1. CRITICAL: JSON Body Parser must be at the top to fix "req.body is undefined"
app.use(express.json());

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.GODADDY_URL,
  "https://flexinode.in",
  "http://localhost:3000"
].filter(Boolean).map(url => url.replace(/\/$/, "")); // Removes trailing slashes

// 2. CORS Setup
app.use(
  cors({
    origin(origin, callback) {
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

// 3. Optimized Database Connection for Serverless
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  
  return mongoose.connect(process.env.MONGO_URI, {
    dbName: process.env.DB_NAME || "databaseManagement",
    serverSelectionTimeoutMS: 5000,
  });
};

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

/* ============================
   SCHEMAS (Using models.Name to prevent re-definition errors)
============================ */
const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  name: { type: String },
  email: { type: String, required: true, unique: true },
  storageGB: { type: Number, default: 0 },
});
const User = mongoose.models.User || mongoose.model("User", userSchema);

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
   ROUTES
============================ */

// Admin Authentication Middleware
const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
    return res.status(403).json({ error: "Unauthorized access. Invalid or missing token." });
  }
  next();
};

// Admin Login
app.post("/api/admin-login", (req, res) => {
  const { password } = req.body;

  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ error: "ADMIN_PASSWORD is not configured" });
  }

  if (password === process.env.ADMIN_PASSWORD) {
    return res.json({ success: true, token: process.env.ADMIN_PASSWORD });
  }

  return res.status(401).json({ error: "Invalid password" });
});

// Create/Get user
app.post("/api/users", async (req, res) => {
  const { uid, name, email } = req.body;
  if (!uid || !email) return res.status(400).json({ error: "UID and email are required" });

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

app.get("/api/users", verifyAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ _id: -1 });
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Create payment
app.post("/api/payments", async (req, res) => {
  const { userId, gb, totalPrice, upiLink } = req.body;

  if (!userId || !gb || !totalPrice || !upiLink) {
    return res.status(400).json({ error: "userId, gb, totalPrice and upiLink are required" });
  }

  try {
    const payment = new Payment({
      userId,
      gb,
      totalPrice,
      upiLink,
      status: "PENDING",
    });

    await payment.save();
    return res.status(201).json({ message: "Payment created", payment });
  } catch (err) {
    console.error("Create payment error:", err);
    return res.status(500).json({ error: err.message || "Failed to create payment" });
  }
});

// Update payment status
app.put("/api/payments/:id", verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "status is required" });
  }

  try {
    const payment = await Payment.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    return res.json(payment);
  } catch (err) {
    console.error("Update payment error:", err);
    return res.status(500).json({ error: err.message || "Failed to update payment" });
  }
});

// Get all payments for admin
app.get("/api/payments", verifyAdmin, async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    return res.json(payments);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Get admin stats
app.get("/api/stats", verifyAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    
    // Calculate total storage distributed
    const users = await User.find({}, "storageGB");
    const totalStorageGB = users.reduce((acc, curr) => acc + (curr.storageGB || 0), 0);

    // Calculate metrics strictly from Payment records
    const payments = await Payment.find();
    let totalRevenue = 0;
    let pendingPayments = 0;

    payments.forEach(payment => {
      if (payment.status === "SUCCESS") {
        totalRevenue += payment.totalPrice;
      } else if (payment.status === "PENDING") {
        pendingPayments++;
      }
    });

    res.json({
      totalUsers,
      totalStorageGB,
      totalRevenue,
      pendingPayments
    });
  } catch (err) {
    console.error("Stats Error:", err);
    res.status(500).json({ error: "Failed to load stats" });
  }
});

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    dbState: mongoose.connection.readyState,
    databaseName: mongoose.connection.name,
    allowedOrigins
  });
});

app.get("/", (req, res) => res.send("🚀 API is running..."));

// Listen (only for local dev, Vercel ignores this)
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
}

export default app;
