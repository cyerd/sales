// pages/index.js
import { useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import Navbar from "../components/Navbar";

// Dynamically import Chart.js (client-only)
const Chart = dynamic(() => import("chart.js/auto"), { ssr: false });

export default function Home() {
  const [records, setRecords] = useState([]);
  const [formData, setFormData] = useState({
    opening_mpesa: "",
    opening_cash: "",
    total_sales: "",
    closing_mpesa: "",
    closing_cash: "",
    expenses: "",
  });
  const [message, setMessage] = useState("");

  // Fetch records from the API
  const fetchRecords = async () => {
    try {
      const res = await axios.post("/api/process", { action: "fetch_records" });
      if (res.data.status === "success") {
        setRecords(res.data.records);
        updateChart(res.data.records);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Update the Chart.js graph
  const updateChart = (records) => {
    const ctx = document.getElementById("SalesChart").getContext("2d");
    const labels = records.map(record => {
      const date = new Date(record.date);
      return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${date.getFullYear().toString().slice(-2)} ${date
        .getHours()
        .toString()
        .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    });
    const data = records.map(record => record.total_sales);

    if (window.SalesChartInstance) {
      window.SalesChartInstance.destroy();
    }
    window.SalesChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Daily Sales",
          data,
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 2,
          fill: false,
        }],
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/process", { ...formData, action: "submit_form" });
      if (res.data.status === "success") {
        setMessage(res.data.message);
        setFormData({
          opening_mpesa: "",
          opening_cash: "",
          total_sales: "",
          closing_mpesa: "",
          closing_cash: "",
          expenses: "",
        });
        fetchRecords();
      } else {
        setMessage(res.data.message);
      }
    } catch (error) {
      setMessage("Error submitting form");
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-center my-4">Daily Financial Entry</h1>
        {message && <p className="text-center text-green-600">{message}</p>}
        <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-4 rounded shadow mb-8">
          <div className="mb-4">
            <label className="block mb-1">Opening Mpesa</label>
            <input
              type="number"
              step="0.01"
              name="opening_mpesa"
              value={formData.opening_mpesa}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Opening Cash</label>
            <input
              type="number"
              step="0.01"
              name="opening_cash"
              value={formData.opening_cash}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Total Sales</label>
            <input
              type="number"
              step="0.01"
              name="total_sales"
              value={formData.total_sales}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Closing Mpesa</label>
            <input
              type="number"
              step="0.01"
              name="closing_mpesa"
              value={formData.closing_mpesa}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Closing Cash</label>
            <input
              type="number"
              step="0.01"
              name="closing_cash"
              value={formData.closing_cash}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Expenses</label>
            <input
              type="number"
              step="0.01"
              name="expenses"
              value={formData.expenses}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white rounded py-2 hover:bg-blue-600 transition">
            Submit
          </button>
        </form>

        <h2 className="text-2xl font-bold text-center my-4">Existing Records</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Date</th>
                <th className="px-4 py-2 border">Opening Mpesa</th>
                <th className="px-4 py-2 border">Opening Cash</th>
                <th className="px-4 py-2 border">Total Sales</th>
                <th className="px-4 py-2 border">Closing Mpesa</th>
                <th className="px-4 py-2 border">Closing Cash</th>
                <th className="px-4 py-2 border">Expenses</th>
                <th className="px-4 py-2 border">Expected</th>
                <th className="px-4 py-2 border">Available</th>
                <th className="px-4 py-2 border">Unreconciled</th>
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? (
                records.map((record) => {
                  const date = new Date(record.date);
                  const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth()+1).toString().padStart(2, "0")}/${date.getFullYear().toString().slice(-2)} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
                  return (
                    <tr key={record._id}>
                      <td className="px-4 py-2 border">{formattedDate}</td>
                      <td className="px-4 py-2 border">{record.opening_mpesa}</td>
                      <td className="px-4 py-2 border">{record.opening_cash}</td>
                      <td className="px-4 py-2 border">{record.total_sales}</td>
                      <td className="px-4 py-2 border">{record.closing_mpesa}</td>
                      <td className="px-4 py-2 border">{record.closing_cash}</td>
                      <td className="px-4 py-2 border">{record.expenses}</td>
                      <td className="px-4 py-2 border" style={{ color: record.expected > 0 ? "green" : record.expected < 0 ? "red" : "orange" }}>
                        {record.expected}
                      </td>
                      <td className="px-4 py-2 border" style={{ color: record.totalnow > 0 ? "green" : record.totalnow < 0 ? "red" : "orange" }}>
                        {record.totalnow}
                      </td>
                      <td className="px-4 py-2 border" style={{ color: record.expectedDiff > 0 ? "red" : record.expectedDiff < 0 ? "blue" : "orange" }}>
                        {record.expectedDiff}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" className="px-4 py-2 text-center">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <h2 className="text-2xl font-bold text-center my-4">Daily Sales Graph</h2>
        <div className="max-w-3xl mx-auto">
          <canvas id="SalesChart" className="w-full"></canvas>
        </div>
      </div>
    </div>
  );
}
