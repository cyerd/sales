// pages/api/process.js
import { withSession } from "../../lib/session";
import clientPromise from "../../lib/db";
import { ObjectId } from "mongodb";

export default withSession(async (req, res) => {
  // Check if the user is logged in
  if (!req.session.get("user")) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  const { action } = req.body;
  if (!action) {
    return res.status(400).json({ status: "error", message: "Action required" });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    if (action === "submit_form") {
      const {
        opening_mpesa,
        opening_cash,
        total_sales,
        closing_mpesa,
        closing_cash,
        expenses,
      } = req.body;

      const op_mpesa = parseFloat(opening_mpesa);
      const op_cash = parseFloat(opening_cash);
      const total = parseFloat(total_sales);
      const cl_mpesa = parseFloat(closing_mpesa);
      const cl_cash = parseFloat(closing_cash);
      const exp = parseFloat(expenses);

      const profit = total - exp;
      const expected = (op_mpesa + op_cash + total) - exp;
      const totalnow = cl_mpesa + cl_cash;
      const expectedDiff = expected - totalnow;

      const doc = {
        opening_mpesa: op_mpesa,
        opening_cash: op_cash,
        total_sales: total,
        closing_mpesa: cl_mpesa,
        closing_cash: cl_cash,
        expenses: exp,
        profit,
        expected,
        totalnow,
        expectedDiff,
        date: new Date(),
      };

      await db.collection("daily_records").insertOne(doc);
      return res.status(200).json({ status: "success", message: "Record saved successfully!" });
    } else if (action === "fetch_records") {
      const records = await db
        .collection("daily_records")
        .find({})
        .sort({ date: -1 })
        .toArray();
      return res.status(200).json({ status: "success", records });
    } else if (action === "update_unaccounted") {
      const { id, unaccounted } = req.body;
      const updated = await db.collection("daily_records").updateOne(
        { _id: new ObjectId(id) },
        { $set: { expectedDiff: parseFloat(unaccounted) } }
      );
      if (updated.modifiedCount === 1) {
        return res.status(200).json({ status: "success", message: "Record updated successfully!" });
      } else {
        return res.status(400).json({ status: "error", message: "Database update failed." });
      }
    } else {
      return res.status(400).json({ status: "error", message: "Invalid action" });
    }
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
});
