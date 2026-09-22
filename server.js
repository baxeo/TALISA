import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, "dist");
const dataPath = path.join(__dirname, "data");
const customersPath = path.join(dataPath, "customers.json");
const productsPath = path.join(dataPath, "products.json");

app.use(cors());
app.use(express.json());

const sales = [];

function readProducts() {
  try {
    return JSON.parse(fs.readFileSync(productsPath, "utf8"));
  } catch (error) {
    return [];
  }
}

function writeProducts(productList) {
  fs.mkdirSync(dataPath, { recursive: true });
  fs.writeFileSync(productsPath, `${JSON.stringify(productList, null, 2)}\n`);
}

function readCustomers() {
  try {
    return JSON.parse(fs.readFileSync(customersPath, "utf8"));
  } catch (error) {
    return [];
  }
}

function writeCustomers(customerList) {
  fs.mkdirSync(dataPath, { recursive: true });
  fs.writeFileSync(customersPath, `${JSON.stringify(customerList, null, 2)}\n`);
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Mwarabu Nuts backend is running" });
});

app.get("/api/products", (req, res) => {
  res.json(readProducts());
});

app.post("/api/products", (req, res) => {
  const { name, grade, largePrice, smallPrice, stock, status } = req.body || {};
  if (!name || !largePrice || !smallPrice) {
    return res.status(400).json({ message: "Name, largePrice, and smallPrice are required" });
  }

  const products = readProducts();
  const newProduct = {
    id: products.length ? Math.max(...products.map((product) => product.id)) + 1 : 1,
    name,
    grade: grade || "Premium",
    largePrice: Number(largePrice),
    smallPrice: Number(smallPrice),
    stock: Number(stock || 0),
    status: status || "Active",
  };

  products.push(newProduct);
  writeProducts(products);
  res.status(201).json(newProduct);
});

app.put("/api/products/:id", (req, res) => {
  const products = readProducts();
  const productIndex = products.findIndex((product) => product.id === Number(req.params.id));
  if (productIndex === -1) return res.status(404).json({ message: "Product not found" });

  products[productIndex] = { ...products[productIndex], ...req.body, id: products[productIndex].id };
  writeProducts(products);
  res.json(products[productIndex]);
});

app.delete("/api/products/:id", (req, res) => {
  const products = readProducts();
  const remainingProducts = products.filter((product) => product.id !== Number(req.params.id));
  if (remainingProducts.length === products.length) return res.status(404).json({ message: "Product not found" });

  writeProducts(remainingProducts);
  res.status(204).end();
});

app.get("/api/customers", (req, res) => {
  res.json(readCustomers());
});

app.post("/api/customers", (req, res) => {
  const { name, type, segment, phone, email, nextFollowUp, priority, notes } = req.body || {};
  if (!name || !type || !segment) {
    return res.status(400).json({ message: "Name, buyer type, and segment are required" });
  }

  const customers = readCustomers();
  const newCustomer = {
    id: customers.length ? Math.max(...customers.map((customer) => customer.id)) + 1 : 1,
    name: String(name).trim(),
    type,
    segment,
    phone: phone || "",
    email: email || "",
    lastOrder: "",
    nextFollowUp: nextFollowUp || "",
    priority: priority || "Medium",
    notes: notes || "",
  };

  customers.push(newCustomer);
  writeCustomers(customers);
  res.status(201).json(newCustomer);
});

app.put("/api/customers/:id", (req, res) => {
  const customers = readCustomers();
  const customerIndex = customers.findIndex((customer) => customer.id === Number(req.params.id));
  if (customerIndex === -1) return res.status(404).json({ message: "Customer not found" });

  customers[customerIndex] = { ...customers[customerIndex], ...req.body, id: customers[customerIndex].id };
  writeCustomers(customers);
  res.json(customers[customerIndex]);
});

app.delete("/api/customers/:id", (req, res) => {
  const customers = readCustomers();
  const remainingCustomers = customers.filter((customer) => customer.id !== Number(req.params.id));
  if (remainingCustomers.length === customers.length) return res.status(404).json({ message: "Customer not found" });

  writeCustomers(remainingCustomers);
  res.status(204).end();
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
  console.log(`Mwarabu Nuts backend is running on http://localhost:${port}`);
});