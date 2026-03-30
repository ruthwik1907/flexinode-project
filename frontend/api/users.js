import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  await mongoose.connect(process.env.MONGO_URI, {
    dbName: "databaseManagement",
  });

  isConnected = true;
};

const userSchema = new mongoose.Schema({
  uid: String,
  name: String,
  email: String,
  storageGB: Number,
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    try {
      const users = await User.find().sort({ _id: -1 });
      return res.status(200).json(users);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}