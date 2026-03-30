import mongoose from "mongoose";

let isConnected = false;

// 🔌 Connect to MongoDB
async function connectDB() {
  if (isConnected) return;

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI not set in environment variables");
  }

  await mongoose.connect(process.env.MONGO_URI, {
    dbName: process.env.DB_NAME || "databaseManagement",
  });

  isConnected = true;
}

// 📦 User Schema
const userSchema = new mongoose.Schema({
  uid: { type: String, required: true },
  name: String,
  email: { type: String, required: true },
  storageGB: { type: Number, default: 0 },
});

// Prevent model overwrite in Vercel
const User = mongoose.models.User || mongoose.model("User", userSchema);

// 🚀 API Handler
export default async function handler(req, res) {
  try {
    await connectDB();

    // 🔹 GET → Fetch users
    if (req.method === "GET") {
      const users = await User.find().sort({ _id: -1 });
      return res.status(200).json(users);
    }

    // 🔹 POST → Create user (optional)
    if (req.method === "POST") {
      const { uid, name, email } = req.body;

      if (!uid || !email) {
        return res.status(400).json({ error: "UID and email required" });
      }

      let user = await User.findOne({ uid });

      if (!user) {
        user = new User({ uid, name, email });
        await user.save();
        return res.status(201).json(user);
      }

      return res.status(200).json(user);
    }

    return res.status(405).json({ error: "Method not allowed" });

  } catch (err) {
    console.error("❌ USERS API ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}