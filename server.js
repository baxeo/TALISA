import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, "dist");

app.use(cors());
app.use(express.json());

const products = [
  { id: 1, name: "W180", grade: "Premium", largePrice: 9.8, smallPrice: 8.5, stock: 640, status: "Active" },
  { id: 2, name: "W210", grade: "Grade A", largePrice: 9.1, smallPrice: 7.9, stock: 710, status: "Active" },
  { id: 3, name: "W240", grade: "Grade A", largePrice: 8.4, smallPrice: 7.3, stock: 950, status: "Active" },
  { id: 4, name: "W320", grade: "Grade B", largePrice: 7.8, smallPrice: 6.7, stock: 1180, status: "Active" },
  { id: 5, name: "White Whole", grade: "Premium", largePrice: 8.9, smallPrice: 7.8, stock: 580, status: "Low" },
  { id: 6, name: "Scorched", grade: "Grade C", largePrice: 7.1, smallPrice: 6.2, stock: 820, status: "Active" },
];

const customers = [
  { id: 1, name: "Apex Traders", type: "Large Buyer", segment: "Export", lastOrder: "2026-06-20", nextFollowUp: "2026-06-24", priority: "High" },
  { id: 2, name: "Kampala Retailers", type: "Retail Buyer", segment: "Local", lastOrder: "2026-06-17", nextFollowUp: "2026-06-23", priority: "Medium" },
  { id: 3, name: "Nairobi Wholesale Co.", type: "Large Buyer", segment: "Regional", lastOrder: "2026-06-18", nextFollowUp: "2026-06-22", priority: "High" },
  { id: 4, name: "Mwanza Farmers Group", type: "Small Buyer", segment: "Local", lastOrder: "2026-06-16", nextFollowUp: "2026-06-26", priority: "Low" },
  { id: 5, name: "Coastal Nuts Ltd.", type: "Export Buyer", segment: "Export", lastOrder: "2026-06-19", nextFollowUp: "2026-06-25", priority: "High" },
];

const sales = [];

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "BAXEO backend is running" });
});

app.get("/api/products", (req, res) => {
  res.json(products);
});

app.post("/api/products", (req, res) => {
  const { name, grade, largePrice, smallPrice, stock, status } = req.body || {};
  if (!name || !largePrice || !smallPrice) {
    return res.status(400).json({ message: "Name, largePrice, and smallPrice are required" });
  }

  const newProduct = {
    id: products.length ? products[products.length - 1].id + 1 : 1,
    name,
    grade: grade || "Premium",
    largePrice: Number(largePrice),
    smallPrice: Number(smallPrice),
    stock: Number(stock || 0),
    status: status || "Active",
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.get("/api/customers", (req, res) => {
  res.json(customers);
});

app.get("/api/sales", (req, res) => {
  res.json(sales);
});

app.post("/api/sales", (req, res) => {
  const sale = req.body;
  if (!sale || !sale.product || !sale.revenue) {
    return res.status(400).json({ message: "Sale data is incomplete" });
  }

  sales.push({ id: sales.length + 1, ...sale });
  res.status(201).json({ message: "Sale saved" });
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body || {};
  if (username === "admin" && password === "baxeo123") {
    return res.json({ success: true, message: "Login successful" });
  }
  return res.status(401).json({ success: false, message: "Invalid credentials" });
});

app.use(express.static(distPath));

app.get(/^(?!\/api).*/, (req, res) => {
  const indexFile = path.join(distPath, "index.html");
  res.sendFile(indexFile);
});

app.listen(port, () => {
  console.log(`BAXEO backend is running on http://localhost:${port}`);
});