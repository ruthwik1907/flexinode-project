// frontend/api/users.js

import mongoose from "mongoose";

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI NOT FOUND");
  }

  await mongoose.connect(process.env.MONGO_URI);

  isConnected = true;
}

const userSchema = new mongoose.Schema({
  uid: String,
  name: String,
  email: String,
  storageGB: Number,
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default async function handler(req, res) {
  try {
    await connectDB();

    if (req.method === "GET") {
      const users = await User.find().sort({ _id: -1 });
      return res.status(200).json(users);
    }

    return res.status(405).json({ error: "Method not allowed" });

  } catch (err) {
    console.error("ERROR:", err);
    return res.status(500).json({
      error: err.message || "Server crashed",
    });
  }
}