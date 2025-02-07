// pages/api/login.js
import { withSession } from "../../lib/session";
import clientPromise from "../../lib/db";
import bcrypt from "bcryptjs";

export default withSession(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Missing credentials" });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection("users").findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Set session with user info
    req.session.set("user", {
      id: user._id,
      username: user.username,
      role: user.role,
    });
    await req.session.save();

    res.status(200).json({
      message: "Login successful",
      user: { username: user.username, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});
