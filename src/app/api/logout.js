// pages/api/logout.js
import { withSession } from "../../lib/session";

export default withSession(async (req, res) => {
  req.session.destroy();
  res.status(200).json({ message: "Logged out" });
});
