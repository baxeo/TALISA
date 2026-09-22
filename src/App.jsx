import React, { useState, useMemo, useRef, useEffect } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  Upload, PenLine, Receipt, TrendingUp, ShoppingCart, Wallet,
  Package, Trash2, Plus, ChevronRight, Sparkles, AlertCircle, MessageCircle,
  ArrowRight, CheckCircle2
} from "lucide-react";

// ---------- Design tokens ----------
const COLORS = {
  paper: "#FBF8F2",
  paperEdge: "#E5DFCE",
  ink: "#24261F",
  inkSoft: "#5C5A4D",
  forest: "#1F4D3A",
  forestSoft: "#2E6650",
  amber: "#E2A63B",
  amberSoft: "#F2CD8C",
  alert: "#B5432E",
  sage: "#DCE3D2",
};

const CATEGORY_COLORS = ["#1F4D3A", "#E2A63B", "#7C9885", "#B5432E", "#C9A857", "#3E6259", "#D98B5F"];

const CASHEW_TYPES = ["W180", "W210", "W240", "W320", "White Whole", "Scorched", "Pieces", "Roasted"];
const QUALITY_OPTIONS = ["Premium", "Grade A", "Grade B", "Grade C", "Export Grade"];
const BUYER_TYPES = ["Large Buyer", "Small Buyer", "Retail Buyer", "Export Buyer"];
const SALE_CHANNELS = ["Wholesale", "Retail", "Direct Sales", "Export"];

const SAMPLE_PRODUCTS = [
  { id: 1, name: "W180", grade: "Premium", largePrice: 9.8, smallPrice: 8.5, stock: 640, status: "Active", image: "https://upload.wikimedia.org/wikipedia/commons/2/20/Anacardium_occidentale%2C_the_Cashew_%2817005726289%29.jpg", description: "Large premium cashew kernels with a rich texture and smooth finish suited for premium buyers." },
  { id: 2, name: "W210", grade: "Grade A", largePrice: 9.1, smallPrice: 7.9, stock: 710, status: "Active", image: "https://upload.wikimedia.org/wikipedia/commons/6/67/Anacardium_occidentale_Thailand_2013-05-03wa.JPG", description: "Balanced-size kernels ideal for quality-focused retail and wholesale orders." },
  { id: 3, name: "W240", grade: "Grade A", largePrice: 8.4, smallPrice: 7.3, stock: 950, status: "Active", image: "https://upload.wikimedia.org/wikipedia/commons/d/de/Anacardium_occidentale_Thailand_2013-05-03wb.JPG", description: "A versatile cashew grade that combines value, consistency, and strong market demand." },
  { id: 4, name: "W320", grade: "Grade B", largePrice: 7.8, smallPrice: 6.7, stock: 1180, status: "Active", image: "https://upload.wikimedia.org/wikipedia/commons/2/24/Anacardium_occidentale_from_Margarita_island.jpg", description: "High-volume, affordable cashew option for bulk buyers and repeat regular trade." },
  { id: 5, name: "White Whole", grade: "Premium", largePrice: 8.9, smallPrice: 7.8, stock: 580, status: "Low", image: "https://upload.wikimedia.org/wikipedia/commons/6/64/Cashew_apples.jpg", description: "White whole kernels selected for premium presentation and top-quality nutrition appeal." },
  { id: 6, name: "Scorched", grade: "Grade C", largePrice: 7.1, smallPrice: 6.2, stock: 820, status: "Active", image: "https://upload.wikimedia.org/wikipedia/commons/4/4f/Slivered_Almond%2C_Jumbo_Cashew%2C_Kernel_Pistachio_and_Pecan.JPG", description: "Excellent for cost-effective processing, snacks, and value-driven packaging needs." },
];

const FALLBACK_CASHEW_IMAGE = "https://mwarabunuts.com/assets/cashew-products.png";

const MWARABU_PRODUCTS = [
  { id: "whole-kernels", name: "Whole kernels", grade: "Premium & standard options", largePrice: 0, smallPrice: 0, stock: 0, status: "Sample-led", image: "https://mwarabunuts.com/assets/cashew-products.png", description: "For snacking, gifting, hospitality, and retail applications. Grade and specification are confirmed per available lot." },
  { id: "broken-pieces", name: "Broken & pieces", grade: "Ingredient applications", largePrice: 0, smallPrice: 0, stock: 0, status: "On request", image: "https://mwarabunuts.com/assets/quality-inspection.png", description: "Suitable for confectionery, bakery, nut butter, and food production requirements subject to requested specification." },
  { id: "raw-cashew", name: "Raw cashew nuts", grade: "Seasonal bulk discussions", largePrice: 0, smallPrice: 0, stock: 0, status: "Seasonal", image: "https://mwarabunuts.com/assets/cashew-products.png", description: "Structured sourcing conversations for verified bulk buyers, with origin, season, quantity, and documentation discussed upfront." },
];

const SAMPLE_CUSTOMERS = [
  { id: 1, name: "Apex Traders", type: "Large Buyer", segment: "Export", lastOrder: "2026-06-20", nextFollowUp: "2026-06-24", priority: "High" },
  { id: 2, name: "Kampala Retailers", type: "Retail Buyer", segment: "Local", lastOrder: "2026-06-17", nextFollowUp: "2026-06-23", priority: "Medium" },
  { id: 3, name: "Nairobi Wholesale Co.", type: "Large Buyer", segment: "Regional", lastOrder: "2026-06-18", nextFollowUp: "2026-06-22", priority: "High" },
  { id: 4, name: "Mwanza Farmers Group", type: "Small Buyer", segment: "Local", lastOrder: "2026-06-16", nextFollowUp: "2026-06-26", priority: "Low" },
  { id: 5, name: "Coastal Nuts Ltd.", type: "Export Buyer", segment: "Export", lastOrder: "2026-06-19", nextFollowUp: "2026-06-25", priority: "High" },
];

function generateJuneSample() {
  const rows = [];
  let id = 1;
  const daysInJune = 30;
  for (let day = 1; day <= daysInJune; day++) {
    const date = `2026-06-${String(day).padStart(2, "0")}`;
    const dow = new Date(2026, 5, day).getDay();
    const weekendBoost = dow === 0 || dow === 6 ? 1.5 : 1;
    const numTransactions = Math.round((10 + Math.random() * 8) * weekendBoost);
    for (let t = 0; t < numTransactions; t++) {
      const product = CASHEW_TYPES[Math.floor(Math.random() * CASHEW_TYPES.length)];
      const category = QUALITY_OPTIONS[Math.floor(Math.random() * QUALITY_OPTIONS.length)];
      const buyerType = BUYER_TYPES[Math.floor(Math.random() * BUYER_TYPES.length)];
      const salesChannel = SALE_CHANNELS[Math.floor(Math.random() * SALE_CHANNELS.length)];
      const qty = 5 + Math.floor(Math.random() * 140);
      const basePrice = {
        W180: 9.6, W210: 8.8, W240: 8.1, W320: 7.4,
        "White Whole": 8.5, Scorched: 7.1, Pieces: 6.3, Roasted: 7.9,
      }[product] || 7.2;
      const price = +(basePrice * (0.85 + Math.random() * 0.35)).toFixed(2);
      rows.push({
        id: id++,
        date,
        product,
        category,
        buyerType,
        salesChannel,
        quantity: qty,
        price,
        revenue: +(qty * price).toFixed(2),
      });
    }
  }
  return rows;
}

function buildDailySalesReport(rows) {
  const byDate = {};

  rows.forEach((row) => {
    const key = row.date;
    if (!byDate[key]) {
      byDate[key] = { date: key, revenue: 0, quantity: 0, orders: 0, buyers: new Set() };
    }
    byDate[key].revenue += row.revenue || 0;
    byDate[key].quantity += row.quantity || 0;
    byDate[key].orders += 1;
    if (row.buyerType) byDate[key].buyers.add(row.buyerType);
  });

  return Object.values(byDate)
    .map((entry) => ({
      date: entry.date,
      revenue: +entry.revenue.toFixed(2),
      quantity: entry.quantity,
      orders: entry.orders,
      buyers: entry.buyers.size,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function buildPricingRows(products) {
  return products.map((product) => ({
    ...product,
    margin: +(((product.largePrice - product.smallPrice) / product.largePrice) * 100).toFixed(1),
  }));
}

// ---------- Preprocessing ----------
function preprocess(rows) {
  if (!rows.length) return null;

  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
  const totalTransactions = rows.length;
  const avgOrderValue = totalRevenue / totalTransactions;
  const totalUnits = rows.reduce((s, r) => s + r.quantity, 0);

  const byDate = {};
  rows.forEach((r) => {
    byDate[r.date] = (byDate[r.date] || 0) + r.revenue;
  });
  const dailyTrend = Object.keys(byDate).sort().map((date) => ({
    date: date.slice(8, 10),
    revenue: +byDate[date].toFixed(2),
  }));

  const byCategory = {};
  rows.forEach((r) => {
    byCategory[r.category] = (byCategory[r.category] || 0) + r.revenue;
  });
  const categoryBreakdown = Object.keys(byCategory)
    .map((cat) => ({ name: cat, value: +byCategory[cat].toFixed(2) }))
    .sort((a, b) => b.value - a.value);

  const byProduct = {};
  rows.forEach((r) => {
    if (!byProduct[r.product]) byProduct[r.product] = { revenue: 0, units: 0 };
    byProduct[r.product].revenue += r.revenue;
    byProduct[r.product].units += r.quantity;
  });
  const topProducts = Object.entries(byProduct)
    .map(([name, v]) => ({ name, revenue: +v.revenue.toFixed(2), units: v.units }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  const byDow = [0, 0, 0, 0, 0, 0, 0];
  const dowCount = [0, 0, 0, 0, 0, 0, 0];
  rows.forEach((r) => {
    const d = new Date(r.date).getDay();
    byDow[d] += r.revenue;
    dowCount[d] += 1;
  });
  const dowLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dowBreakdown = dowLabels.map((label, i) => ({
    name: label,
    revenue: +byDow[i].toFixed(2),
  }));
  const peakDayIdx = byDow.indexOf(Math.max(...byDow));

  return {
    totalRevenue, totalTransactions, avgOrderValue, totalUnits,
    dailyTrend, categoryBreakdown, topProducts, dowBreakdown,
    peakDay: dowLabels[peakDayIdx],
    topCategory: categoryBreakdown[0]?.name || "—",
  };
}

// ---------- Small UI atoms ----------
function KpiTag({ icon: Icon, label, value, sub, accent }) {
  return (
    <div style={{
      background: "#fff",
      border: `1px solid ${COLORS.paperEdge}`,
      borderRadius: 4,
      padding: "18px 20px",
      position: "relative",
      boxShadow: "0 1px 0 rgba(36,38,31,0.04)",
    }}>
      <div style={{
        position: "absolute", top: 14, right: 14, width: 8, height: 8,
        borderRadius: "50%", background: COLORS.paper, border: `1px solid ${COLORS.paperEdge}`,
      }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <Icon size={15} color={accent || COLORS.forest} strokeWidth={2} />
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: "0.08em",
          textTransform: "uppercase", color: COLORS.inkSoft, fontWeight: 600,
        }}>{label}</span>
      </div>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: 26, fontWeight: 700,
        color: COLORS.ink, fontVariantNumeric: "tabular-nums", lineHeight: 1,
      }}>{value}</div>
      {sub && <div style={{
        fontFamily: "'Inter', sans-serif", fontSize: 12, color: COLORS.inkSoft, marginTop: 6,
      }}>{sub}</div>}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 20,
      textTransform: "uppercase", letterSpacing: "0.03em", color: COLORS.ink,
      marginBottom: 14, display: "flex", alignItems: "center", gap: 10,
    }}>
      {children}
      <div style={{ flex: 1, height: 1, background: COLORS.paperEdge }} />
    </div>
  );
}

// ---------- Main App ----------
export default function SupermarketDashboard() {
  const isHostedWebsite = window.location.hostname !== "localhost"
    && window.location.hostname !== "127.0.0.1";
  const isPublicWebsite = import.meta.env.VITE_PUBLIC_SITE_ONLY === "true"
    || isHostedWebsite
    || window.location.pathname === "/website"
    || window.location.pathname === "/website/";
  const [rows, setRows] = useState([]);
  const [inputMode, setInputMode] = useState("upload");
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState("");
  const [view, setView] = useState(isPublicWebsite ? "storefront" : "overview");
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [products, setProducts] = useState(SAMPLE_PRODUCTS);
  const [customers, setCustomers] = useState(SAMPLE_CUSTOMERS);
  const [newProduct, setNewProduct] = useState({ name: "", grade: "Premium", largePrice: "", smallPrice: "", stock: "" });
  const [editingProductId, setEditingProductId] = useState(null);
  const [newCustomer, setNewCustomer] = useState({ name: "", type: BUYER_TYPES[0], segment: "Local", phone: "", email: "", nextFollowUp: "", priority: "Medium", notes: "" });
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [storefrontCategory, setStorefrontCategory] = useState("All products");
  const [backendStatus, setBackendStatus] = useState("checking");
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function loadBackendData() {
      try {
        const [productsRes, customersRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/customers"),
        ]);

        setBackendStatus(productsRes.ok && customersRes.ok ? "connected" : "offline");

        if (productsRes.ok) {
          const backendProducts = await productsRes.json();
          if (Array.isArray(backendProducts) && backendProducts.length > 0) {
            setProducts(backendProducts);
          }
        }

        if (customersRes.ok) {
          const backendCustomers = await customersRes.json();
          if (Array.isArray(backendCustomers) && backendCustomers.length > 0) {
            setCustomers(backendCustomers);
          }
        }
      } catch (err) {
        setBackendStatus("offline");
      }
    }

    loadBackendData();
  }, []);

  const [manualForm, setManualForm] = useState({
    date: "2026-06-01",
    product: "",
    category: QUALITY_OPTIONS[0],
    buyerType: BUYER_TYPES[0],
    salesChannel: SALE_CHANNELS[0],
    quantity: 10,
    price: "",
  });

  const stats = useMemo(() => preprocess(rows), [rows]);
  const dailyReport = useMemo(() => buildDailySalesReport(rows), [rows]);
  const pricingRows = useMemo(() => buildPricingRows(products), [products]);
  const publicProducts = isPublicWebsite ? MWARABU_PRODUCTS : SAMPLE_PRODUCTS;
  const storefrontCategories = ["All products", ...Array.from(new Set(publicProducts.map((product) => product.grade)))];
  const storefrontProducts = storefrontCategory === "All products"
    ? publicProducts
    : publicProducts.filter((product) => product.grade === storefrontCategory);

  function normalizeRow(r, idx) {
    const quantity = Number(r.quantity ?? r.qty ?? r.kg ?? 1) || 1;
    const price = Number(r.price ?? r.unit_price ?? r.unitPrice ?? 0) || 0;
    return {
      id: idx,
      date: String(r.date || r.Date || "2026-06-01").slice(0, 10),
      product: String(r.product || r.productType || r.cashewType || r.item || "Unknown item"),
      category: String(r.category || r.grade || r.quality || "Uncategorized"),
      buyerType: String(r.buyerType || r.customerType || r.buyer || BUYER_TYPES[0]),
      salesChannel: String(r.salesChannel || r.channel || r.market || SALE_CHANNELS[0]),
      quantity,
      price,
      revenue: r.revenue ? Number(r.revenue) : +(quantity * price).toFixed(2),
    };
  }

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setParseError("");
    setFileName(file.name);
    const ext = file.name.split(".").pop().toLowerCase();

    if (ext === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (res) => {
          try {
            const cleaned = res.data.map(normalizeRow).filter((r) => r.product !== "Unknown item" || r.revenue > 0);
            setRows(cleaned);
          } catch (err) {
            setParseError("Couldn't read that file. Check that it has date, product, category, quantity and price columns.");
          }
        },
        error: () => setParseError("Couldn't read that file. Try re-exporting it as CSV."),
      });
    } else if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const wb = XLSX.read(evt.target.result, { type: "binary" });
          const sheet = wb.Sheets[wb.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(sheet);
          setRows(json.map(normalizeRow));
        } catch (err) {
          setParseError("Couldn't read that spreadsheet. Check the first sheet has date, product, category, quantity and price columns.");
        }
      };
      reader.readAsBinaryString(file);
    } else {
      setParseError("Unsupported file type. Upload a .csv or .xlsx file.");
    }
  }

  function addManualRow() {
    if (!manualForm.product || !manualForm.price) return;
    const quantity = Number(manualForm.quantity) || 1;
    const price = Number(manualForm.price) || 0;
    setRows((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        date: manualForm.date,
        product: manualForm.product,
        category: manualForm.category,
        buyerType: manualForm.buyerType,
        salesChannel: manualForm.salesChannel,
        quantity,
        price,
        revenue: +(quantity * price).toFixed(2),
      },
    ]);
    setManualForm((f) => ({ ...f, product: "", price: "" }));
  }

  function loadSample() {
    setRows(generateJuneSample());
    setFileName("June 2026 sample data");
    setParseError("");
    setView("overview");
  }

  function clearAll() {
    setRows([]);
    setFileName("");
    setParseError("");
  }

  function handleAdminLogin() {
    setAdminError("");
    if (loginForm.username === "admin" && loginForm.password === "baxeo123") {
      setAdminLoggedIn(true);
      setLoginForm({ username: "", password: "" });
      return;
    }

    fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: loginForm.username, password: loginForm.password }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Login failed");
        setAdminLoggedIn(true);
        setLoginForm({ username: "", password: "" });
      })
      .catch(() => {
        setAdminError("Invalid username or password.");
      });
  }

  function submitProductToBackend(payload) {
    return fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  function submitSaleToBackend(payload) {
    return fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  function addProduct() {
    if (!newProduct.name || !newProduct.largePrice || !newProduct.smallPrice) {
      setAdminError("Product name and both buyer prices are required.");
      return;
    }
    const payload = {
      name: newProduct.name,
      grade: newProduct.grade,
      largePrice: Number(newProduct.largePrice),
      smallPrice: Number(newProduct.smallPrice),
      stock: Number(newProduct.stock || 0),
      status: "Active",
    };

    const request = editingProductId
      ? fetch(`/api/products/${editingProductId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : submitProductToBackend(payload);

    request.then((res) => {
      if (!res.ok) return;
      return res.json();
    }).then((newItem) => {
      if (!newItem) return;
      setProducts((prev) => editingProductId ? prev.map((product) => product.id === editingProductId ? newItem : product) : [...prev, newItem]);
      setEditingProductId(null);
    }).catch(() => {
      setAdminError("Could not save the product. Check that the backend is running.");
    });

    setNewProduct({ name: "", grade: "Premium", largePrice: "", smallPrice: "", stock: "" });
  }

  function orderOnWhatsApp(product) {
    const brand = "Mwarabu Nuts";
    const message = `Hello ${brand}, I would like to request information about ${product.name} cashews. Please share the available sample, specification, and commercial terms.`;
    const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || (isPublicWebsite ? "255712935493" : "256700000000");
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  async function addCustomer() {
    if (!newCustomer.name || !newCustomer.phone || !newCustomer.email) return;
    try {
      const response = await fetch(editingCustomerId ? `/api/customers/${editingCustomerId}` : "/api/customers", {
        method: editingCustomerId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCustomer),
      });
      if (!response.ok) return;
      const savedCustomer = await response.json();
      setCustomers((prev) => editingCustomerId ? prev.map((customer) => customer.id === editingCustomerId ? savedCustomer : customer) : [...prev, savedCustomer]);
      setEditingCustomerId(null);
      setNewCustomer({ name: "", type: BUYER_TYPES[0], segment: "Local", phone: "", email: "", nextFollowUp: "", priority: "Medium", notes: "" });
    } catch (error) {
      setBackendStatus("offline");
    }
  }

  function editCustomer(customer) {
    setEditingCustomerId(customer.id);
    setNewCustomer({ name: customer.name || "", type: customer.type || BUYER_TYPES[0], segment: customer.segment || "Local", phone: customer.phone || "", email: customer.email || "", nextFollowUp: customer.nextFollowUp || "", priority: customer.priority || "Medium", notes: customer.notes || "" });
  }

  function editProduct(product) {
    setEditingProductId(product.id);
    setNewProduct({ name: product.name, grade: product.grade, largePrice: product.largePrice, smallPrice: product.smallPrice, stock: product.stock });
  }

  async function deleteProduct(productId) {
    const response = await fetch(`/api/products/${productId}`, { method: "DELETE" });
    if (!response.ok) return;
    setProducts((prev) => prev.filter((product) => product.id !== productId));
  }

  async function deleteCustomer(customerId) {
    try {
      const response = await fetch(`/api/customers/${customerId}`, { method: "DELETE" });
      if (!response.ok) return;
      setCustomers((prev) => prev.filter((customer) => customer.id !== customerId));
    } catch (error) {
      setBackendStatus("offline");
    }
  }

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      background: COLORS.paper,
      minHeight: "100%",
      color: COLORS.ink,
      padding: "0 0 60px 0",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');
        * { box-sizing: border-box; }
        input, select, button { font-family: 'Inter', sans-serif; }
        ::selection { background: ${COLORS.amberSoft}; }
        .zigzag-bottom {
          clip-path: polygon(
            0% 0%, 100% 0%, 100% 92%,
            97% 100%, 94% 92%, 91% 100%, 88% 92%, 85% 100%, 82% 92%, 79% 100%,
            76% 92%, 73% 100%, 70% 92%, 67% 100%, 64% 92%, 61% 100%, 58% 92%,
            55% 100%, 52% 92%, 49% 100%, 46% 92%, 43% 100%, 40% 92%, 37% 100%,
            34% 92%, 31% 100%, 28% 92%, 25% 100%, 22% 92%, 19% 100%, 16% 92%,
            13% 100%, 10% 92%, 7% 100%, 4% 92%, 1% 100%, 0% 92%
          );
        }
        .tab-btn { transition: all 0.15s ease; cursor: pointer; }
        .row-hover:hover { background: ${COLORS.sage}22; }
        .storefront-hero { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 28px; align-items: center; }
        .storefront-hero-image { min-height: 330px; border-radius: 10px; background: linear-gradient(135deg, rgba(31,77,58,0.1), rgba(226,166,59,0.15)), url('https://mwarabunuts.com/assets/cashew-products.png') center/cover; }
        .storefront-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
        .storefront-trust { display: grid; grid-template-columns: 1.2fr 1fr 1fr; gap: 14px; }
        .storefront-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .storefront-card:hover { transform: translateY(-3px); box-shadow: 0 14px 28px rgba(31,77,58,0.12) !important; }
        .storefront-category { overflow-x: auto; scrollbar-width: none; }
        .storefront-category::-webkit-scrollbar { display: none; }
        @media (max-width: 760px) {
          .storefront-hero { grid-template-columns: 1fr; gap: 18px; }
          .storefront-hero-image { min-height: 220px; order: -1; }
          .storefront-grid { grid-template-columns: 1fr; }
          .storefront-trust { grid-template-columns: 1fr; }
          .storefront-heading { font-size: 42px !important; }
          .storefront-actions { flex-direction: column; align-items: stretch !important; }
          .storefront-actions button { width: 100%; justify-content: center; }
        }
      `}</style>

      <div style={{ background: COLORS.forest, paddingBottom: 26, paddingTop: 34 }} className="zigzag-bottom">
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <Receipt size={20} color={COLORS.amber} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: COLORS.amber, letterSpacing: "0.15em", textTransform: "uppercase" }}>MWARABU NUTS</span>
            {!isPublicWebsite && <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, border: `1px solid ${backendStatus === "connected" ? "#9BC5A8" : "#D7B27A"}`, color: backendStatus === "connected" ? "#D9F1DE" : COLORS.amberSoft, borderRadius: 999, padding: "5px 9px", fontSize: 10, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: backendStatus === "connected" ? "#7BD18D" : COLORS.amber }} />
              {backendStatus === "connected" ? "Frontend + backend connected" : backendStatus === "checking" ? "Checking backend" : "Frontend demo mode"}
            </span>}
          </div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 44, textTransform: "uppercase", letterSpacing: "0.01em", color: "#fff", margin: "4px 0 8px 0" }}>{isPublicWebsite ? "Premium cashews from Tanzania" : "MWARABU NUTS SALES INSIGHT"}</h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: COLORS.sage, maxWidth: 560, lineHeight: 1.5 }}>
            {isPublicWebsite ? "Quality cashew kernels for retail, wholesale, and export buyers." : "Track daily sales, customer buying behavior, and product performance — upload a file or enter data manually — and monitor revenue, top sellers, repeat buyers, and sales trends in one clear dashboard."}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px" }}>
        {!isPublicWebsite && <div style={{ marginTop: 28, marginBottom: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { key: "overview", label: "Overview" },
            { key: "customers", label: "Customers" },
            { key: "pricing", label: "Pricing" },
            { key: "storefront", label: "Website" },
            { key: "admin", label: "Admin" },
          ].map((tab) => (
            <button
              key={tab.key}
              className="tab-btn"
              onClick={() => setView(tab.key)}
              style={{
                padding: "9px 16px",
                borderRadius: 4,
                border: `1px solid ${view === tab.key ? COLORS.forest : COLORS.paperEdge}`,
                background: view === tab.key ? COLORS.forest : "#fff",
                color: view === tab.key ? "#fff" : COLORS.inkSoft,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>}

        {view === "overview" && (
          <>
            <div style={{ marginTop: 20, marginBottom: 36 }}>
              <SectionLabel>1. Bring in your data</SectionLabel>

              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {[
                  { key: "upload", label: "Upload a file", icon: Upload },
                  { key: "manual", label: "Enter by hand", icon: PenLine },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    className="tab-btn"
                    onClick={() => setInputMode(tab.key)}
                    style={{
                      display: "flex", alignItems: "center", gap: 7,
                      padding: "9px 16px", borderRadius: 4,
                      border: `1px solid ${inputMode === tab.key ? COLORS.forest : COLORS.paperEdge}`,
                      background: inputMode === tab.key ? COLORS.forest : "#fff",
                      color: inputMode === tab.key ? "#fff" : COLORS.inkSoft,
                      fontSize: 13, fontWeight: 600,
                    }}
                  >
                    <tab.icon size={14} /> {tab.label}
                  </button>
                ))}
                <button
                  className="tab-btn"
                  onClick={loadSample}
                  style={{
                    display: "flex", alignItems: "center", gap: 7,
                    padding: "9px 16px", borderRadius: 4, marginLeft: "auto",
                    border: `1px solid ${COLORS.amber}`, background: COLORS.amberSoft,
                    color: COLORS.ink, fontSize: 13, fontWeight: 600,
                  }}
                >
                  <Sparkles size={14} /> Load June 2026 sample
                </button>
              </div>

              <div style={{ background: "#fff", border: `1px solid ${COLORS.paperEdge}`, borderRadius: 6, padding: 22 }}>
                {inputMode === "upload" ? (
                  <div>
                    <div onClick={() => fileInputRef.current?.click()} style={{ border: `1.5px dashed ${COLORS.paperEdge}`, borderRadius: 6, padding: "28px 20px", textAlign: "center", cursor: "pointer", background: COLORS.paper }}>
                      <Upload size={22} color={COLORS.forest} style={{ marginBottom: 8 }} />
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Click to choose a .csv or .xlsx file</div>
                      <div style={{ fontSize: 12, color: COLORS.inkSoft }}>Expected columns: date, cashew_type, grade, buyer_type, sales_channel, quantity_kg, price_per_kg</div>
                      <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFile} style={{ display: "none" }} />
                    </div>
                    {fileName && !parseError && <div style={{ marginTop: 12, fontSize: 13, color: COLORS.forest, fontWeight: 600 }}>✓ Loaded "{fileName}" — {rows.length} rows</div>}
                    {parseError && <div style={{ marginTop: 12, fontSize: 13, color: COLORS.alert, display: "flex", alignItems: "center", gap: 6 }}><AlertCircle size={14} /> {parseError}</div>}
                  </div>
                ) : (
                  <div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1.2fr 1.2fr 1fr 0.9fr auto", gap: 10, alignItems: "end" }}>
                      <Field label="Date"><input type="date" value={manualForm.date} onChange={(e) => setManualForm((f) => ({ ...f, date: e.target.value }))} style={inputStyle} /></Field>
                      <Field label="Cashew Type"><input type="text" placeholder="e.g. W320" value={manualForm.product} onChange={(e) => setManualForm((f) => ({ ...f, product: e.target.value }))} style={inputStyle} /></Field>
                      <Field label="Grade"><select value={manualForm.category} onChange={(e) => setManualForm((f) => ({ ...f, category: e.target.value }))} style={inputStyle}>{QUALITY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}</select></Field>
                      <Field label="Buyer Type"><select value={manualForm.buyerType} onChange={(e) => setManualForm((f) => ({ ...f, buyerType: e.target.value }))} style={inputStyle}>{BUYER_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}</select></Field>
                      <Field label="Channel"><select value={manualForm.salesChannel} onChange={(e) => setManualForm((f) => ({ ...f, salesChannel: e.target.value }))} style={inputStyle}>{SALE_CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}</select></Field>
                      <Field label="Qty (kg)"><input type="number" min="1" value={manualForm.quantity} onChange={(e) => setManualForm((f) => ({ ...f, quantity: e.target.value }))} style={inputStyle} /></Field>
                      <Field label="Price/kg"><input type="number" min="0" step="0.01" placeholder="0.00" value={manualForm.price} onChange={(e) => setManualForm((f) => ({ ...f, price: e.target.value }))} style={inputStyle} /></Field>
                      <button onClick={addManualRow} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", borderRadius: 4, border: "none", background: COLORS.forest, color: "#fff", fontSize: 13, fontWeight: 600, height: 38 }}><Plus size={14} /> Add</button>
                    </div>
                    <div style={{ marginTop: 14, fontSize: 13, color: COLORS.inkSoft }}>{rows.length} row{rows.length !== 1 ? "s" : ""} entered so far</div>
                  </div>
                )}

                {rows.length > 0 && (
                  <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
                    <button onClick={clearAll} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: COLORS.alert, fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}><Trash2 size={13} /> Clear all data</button>
                  </div>
                )}
              </div>
            </div>

            {stats ? (
              <div>
                <SectionLabel>2. Analysis</SectionLabel>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
                  <KpiTag icon={Wallet} label="Total Revenue" value={`$${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} sub="all rows loaded" />
                  <KpiTag icon={ShoppingCart} label="Transactions" value={stats.totalTransactions.toLocaleString()} sub={`${stats.totalUnits.toLocaleString()} kg sold`} />
                  <KpiTag icon={TrendingUp} label="Avg. Order Value" value={`$${stats.avgOrderValue.toFixed(2)}`} accent={COLORS.amber} sub="per transaction" />
                  <KpiTag icon={Package} label="Top Category" value={stats.topCategory} accent={COLORS.forestSoft} sub={`Busiest day: ${stats.peakDay}`} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, marginBottom: 16 }}>
                  <ChartCard title="Revenue trend"><ResponsiveContainer width="100%" height={260}><LineChart data={stats.dailyTrend} margin={{ top: 6, right: 12, left: -14, bottom: 0 }}><CartesianGrid stroke={COLORS.paperEdge} vertical={false} /><XAxis dataKey="date" tick={{ fontSize: 11, fill: COLORS.inkSoft }} axisLine={{ stroke: COLORS.paperEdge }} tickLine={false} /><YAxis tick={{ fontSize: 11, fill: COLORS.inkSoft }} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltipStyle} formatter={(v) => [`$${v}`, "Revenue"]} labelFormatter={(l) => `June ${l}`} /><Line type="monotone" dataKey="revenue" stroke={COLORS.forest} strokeWidth={2.4} dot={false} /></LineChart></ResponsiveContainer></ChartCard>
                  <ChartCard title="Revenue by grade"><ResponsiveContainer width="100%" height={260}><PieChart><Pie data={stats.categoryBreakdown} dataKey="value" nameKey="name" cx="50%" cy="48%" innerRadius={52} outerRadius={82} paddingAngle={2}>{stats.categoryBreakdown.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}</Pie><Tooltip contentStyle={tooltipStyle} formatter={(v) => [`$${v}`, "Revenue"]} /><Legend wrapperStyle={{ fontSize: 11 }} /></PieChart></ResponsiveContainer></ChartCard>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <ChartCard title="Top-selling cashew types"><ResponsiveContainer width="100%" height={240}><BarChart data={stats.topProducts} layout="vertical" margin={{ top: 4, right: 20, left: 10, bottom: 0 }}><CartesianGrid stroke={COLORS.paperEdge} horizontal={false} /><XAxis type="number" tick={{ fontSize: 11, fill: COLORS.inkSoft }} axisLine={{ stroke: COLORS.paperEdge }} tickLine={false} /><YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11.5, fill: COLORS.ink }} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltipStyle} formatter={(v) => [`$${v}`, "Revenue"]} /><Bar dataKey="revenue" fill={COLORS.amber} radius={[0, 3, 3, 0]} /></BarChart></ResponsiveContainer></ChartCard>
                  <ChartCard title="Sales by day of week"><ResponsiveContainer width="100%" height={240}><BarChart data={stats.dowBreakdown} margin={{ top: 4, right: 12, left: -14, bottom: 0 }}><CartesianGrid stroke={COLORS.paperEdge} vertical={false} /><XAxis dataKey="name" tick={{ fontSize: 11, fill: COLORS.inkSoft }} axisLine={{ stroke: COLORS.paperEdge }} tickLine={false} /><YAxis tick={{ fontSize: 11, fill: COLORS.inkSoft }} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltipStyle} formatter={(v) => [`$${v}`, "Revenue"]} /><Bar dataKey="revenue" radius={[3, 3, 0, 0]}>{stats.dowBreakdown.map((_, i) => <Cell key={i} fill={COLORS.forestSoft} />)}</Bar></BarChart></ResponsiveContainer></ChartCard>
                </div>

                <div style={{ marginTop: 16 }}>
                  <ChartCard title="Daily sales report table">
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                          <tr style={{ background: COLORS.paper, color: COLORS.inkSoft }}>
                            <th style={tableHeadStyle}>Date</th>
                            <th style={tableHeadStyle}>Revenue</th>
                            <th style={tableHeadStyle}>Qty (kg)</th>
                            <th style={tableHeadStyle}>Orders</th>
                            <th style={tableHeadStyle}>Buyer groups</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dailyReport.length ? dailyReport.map((item) => (
                            <tr key={item.date} className="row-hover" style={{ borderBottom: `1px solid ${COLORS.paperEdge}` }}>
                              <td style={tableCellStyle}>{item.date}</td>
                              <td style={tableCellStyle}>${item.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td style={tableCellStyle}>{item.quantity}</td>
                              <td style={tableCellStyle}>{item.orders}</td>
                              <td style={tableCellStyle}>{item.buyers}</td>
                            </tr>
                          )) : <tr><td colSpan="5" style={{ ...tableCellStyle, textAlign: "center", padding: "18px" }}>No sales data loaded.</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  </ChartCard>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "50px 20px", border: `1px dashed ${COLORS.paperEdge}`, borderRadius: 6, background: "#fff" }}>
                <Receipt size={26} color={COLORS.paperEdge} style={{ marginBottom: 10 }} />
                <div style={{ fontSize: 14, color: COLORS.inkSoft }}>No data yet. Upload a file, enter a few rows, or load the June 2026 sample above.</div>
              </div>
            )}
          </>
        )}

        {view === "customers" && (
          <div style={{ marginTop: 24 }}>
            <div style={{ background: "#fff", border: `1px solid ${COLORS.paperEdge}`, borderRadius: 6, padding: 18, marginBottom: 18 }}>
              <SectionLabel>{editingCustomerId ? "Edit Customer Record" : "Add Customer Record"}</SectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr 1fr 1fr auto", gap: 10, alignItems: "end" }}>
                <Field label="Customer name"><input value={newCustomer.name} onChange={(e) => setNewCustomer((form) => ({ ...form, name: e.target.value }))} placeholder="Company or buyer name" style={inputStyle} /></Field>
                <Field label="Buyer type"><select value={newCustomer.type} onChange={(e) => setNewCustomer((form) => ({ ...form, type: e.target.value }))} style={inputStyle}>{BUYER_TYPES.map((type) => <option key={type}>{type}</option>)}</select></Field>
                <Field label="Segment"><select value={newCustomer.segment} onChange={(e) => setNewCustomer((form) => ({ ...form, segment: e.target.value }))} style={inputStyle}>{["Local", "Regional", "Export"].map((segment) => <option key={segment}>{segment}</option>)}</select></Field>
                <Field label="Phone"><input required value={newCustomer.phone} onChange={(e) => setNewCustomer((form) => ({ ...form, phone: e.target.value }))} placeholder="+255..." style={inputStyle} /></Field>
                <Field label="Email"><input required type="email" value={newCustomer.email} onChange={(e) => setNewCustomer((form) => ({ ...form, email: e.target.value }))} placeholder="buyer@email.com" style={inputStyle} /></Field>
                <Field label="Follow-up"><input type="date" value={newCustomer.nextFollowUp} onChange={(e) => setNewCustomer((form) => ({ ...form, nextFollowUp: e.target.value }))} style={inputStyle} /></Field>
                <button onClick={addCustomer} style={{ padding: "10px 14px", border: "none", background: COLORS.forest, color: "#fff", borderRadius: 4, fontWeight: 600, height: 38 }}><Plus size={14} /> {editingCustomerId ? "Save" : "Add"}</button>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 18 }}>
            <div style={{ background: "#fff", border: `1px solid ${COLORS.paperEdge}`, borderRadius: 6, padding: 18 }}>
              <SectionLabel>Customer Database</SectionLabel>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead><tr style={{ background: COLORS.paper, color: COLORS.inkSoft }}><th style={tableHeadStyle}>Customer</th><th style={tableHeadStyle}>Buyer type</th><th style={tableHeadStyle}>Segment</th><th style={tableHeadStyle}>Phone</th><th style={tableHeadStyle}>Next follow-up</th><th style={tableHeadStyle}>Action</th></tr></thead>
                  <tbody>{customers.map((customer) => <tr key={customer.id} className="row-hover" style={{ borderBottom: `1px solid ${COLORS.paperEdge}` }}><td style={tableCellStyle}>{customer.name}</td><td style={tableCellStyle}>{customer.type}</td><td style={tableCellStyle}>{customer.segment}</td><td style={tableCellStyle}>{customer.phone || "-"}</td><td style={tableCellStyle}>{customer.nextFollowUp || "-"}</td><td style={tableCellStyle}><button onClick={() => editCustomer(customer)} style={{ border: "none", background: "none", color: COLORS.forest, cursor: "pointer", fontSize: 12, marginRight: 8 }}>Edit</button><button onClick={() => deleteCustomer(customer.id)} style={{ border: "none", background: "none", color: COLORS.alert, cursor: "pointer", fontSize: 12 }}>Remove</button></td></tr>)}</tbody>
                </table>
              </div>
            </div>
            <div style={{ background: "#fff", border: `1px solid ${COLORS.paperEdge}`, borderRadius: 6, padding: 18 }}>
              <SectionLabel>Customer Follow-up</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{customers.map((customer) => <div key={customer.id} style={{ border: `1px solid ${COLORS.paperEdge}`, borderRadius: 6, padding: 12, background: COLORS.paper }}><div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}><strong style={{ fontSize: 14 }}>{customer.name}</strong><span style={{ fontSize: 11, background: customer.priority === "High" ? "#FDE7D8" : customer.priority === "Medium" ? "#EAF3E5" : "#F0F0F0", color: COLORS.ink, borderRadius: 999, padding: "4px 8px" }}>{customer.priority}</span></div><div style={{ marginTop: 8, fontSize: 12, color: COLORS.inkSoft }}>Next follow-up: {customer.nextFollowUp} • Buyer type: {customer.type}</div></div>)}</div>
            </div>
          </div>
          </div>
        )}

        {view === "pricing" && (
          <div style={{ marginTop: 24 }}>
            <SectionLabel>Pricing Management</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
              {pricingRows.map((product) => (
                <div key={product.id} style={{ background: "#fff", border: `1px solid ${COLORS.paperEdge}`, borderRadius: 6, padding: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{product.name}</div>
                    <span style={{ fontSize: 11, background: product.status === "Low" ? "#FDE7D8" : "#EAF3E5", padding: "4px 8px", borderRadius: 999 }}>{product.status}</span>
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.inkSoft, marginBottom: 8 }}>Grade: {product.grade}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div style={{ background: COLORS.paper, border: `1px solid ${COLORS.paperEdge}`, borderRadius: 6, padding: 10 }}>
                      <div style={{ fontSize: 11, color: COLORS.inkSoft, textTransform: "uppercase", letterSpacing: "0.06em" }}>Large buyer</div>
                      <div style={{ fontSize: 22, fontWeight: 700, marginTop: 5 }}>${product.largePrice.toFixed(2)}</div>
                    </div>
                    <div style={{ background: COLORS.paper, border: `1px solid ${COLORS.paperEdge}`, borderRadius: 6, padding: 10 }}>
                      <div style={{ fontSize: 11, color: COLORS.inkSoft, textTransform: "uppercase", letterSpacing: "0.06em" }}>Small buyer</div>
                      <div style={{ fontSize: 22, fontWeight: 700, marginTop: 5 }}>${product.smallPrice.toFixed(2)}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 10, fontSize: 12, color: COLORS.inkSoft }}>Stock: {product.stock} kg • Discount gap: {product.margin}%</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === "storefront" && (
          <div style={{ marginTop: 24 }}>
            <div className="storefront-hero" style={{ background: COLORS.forest, color: "#fff", borderRadius: 12, padding: 28, marginBottom: 24, overflow: "hidden" }}>
              <div>
                <div style={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: COLORS.amber }}>MWARABU NUTS · TANZANIA</div>
              <h2 className="storefront-heading" style={{ fontSize: 56, lineHeight: 0.94, margin: "12px 0 16px", fontFamily: "'Barlow Condensed', sans-serif", maxWidth: 530 }}>{isPublicWebsite ? "Tanzania's cashew story, ready for global business." : "Harvested with care. Delivered with confidence."}</h2>
              <p style={{ margin: 0, maxWidth: 560, color: COLORS.sage, lineHeight: 1.6 }}>{isPublicWebsite ? "Connect directly for whole kernels, broken pieces, and seasonal raw cashew discussions. Start with a clear sample and a structured buyer requirement." : "Premium Tanzanian cashews for retail, wholesale, and export buyers. Choose your grade and speak directly with our sales team."}</p>
              <div className="storefront-actions" style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 22 }}>
                <button onClick={() => document.getElementById("mwarabu-products")?.scrollIntoView({ behavior: "smooth" })} style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 16px", background: COLORS.amber, color: COLORS.ink, border: "none", borderRadius: 5, fontWeight: 700 }}>Explore products <ArrowRight size={15} /></button>
                <button onClick={() => orderOnWhatsApp({ name: isPublicWebsite ? "a Mwarabu Nuts sample" : "Mwarabu Nuts cashew products" })} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 15px", background: "transparent", color: "#fff", border: `1px solid ${COLORS.sage}`, borderRadius: 5, fontWeight: 700 }}><MessageCircle size={16} /> {isPublicWebsite ? "Request a sample" : "WhatsApp us"}</button>
              </div>
              </div>
              <div className="storefront-hero-image" aria-label="Mwarabu Nuts cashew products" />
            </div>

            <div id="mwarabu-products" style={{ marginBottom: 14 }}><SectionLabel>{isPublicWebsite ? "The product desk" : "Shop the harvest"}</SectionLabel><div style={{ color: COLORS.inkSoft, fontSize: 13, marginTop: -8 }}>{isPublicWebsite ? "Buy with clarity. Start with a sample, then discuss the commercial next step." : "Every grade is packed for quality, consistency, and reliable supply."}</div></div>
            <div className="storefront-category" style={{ display: "flex", gap: 8, marginBottom: 18, paddingBottom: 4 }}>
              {storefrontCategories.map((category) => <button key={category} onClick={() => setStorefrontCategory(category)} style={{ whiteSpace: "nowrap", padding: "9px 13px", borderRadius: 999, border: `1px solid ${storefrontCategory === category ? COLORS.forest : COLORS.paperEdge}`, background: storefrontCategory === category ? COLORS.forest : "#fff", color: storefrontCategory === category ? "#fff" : COLORS.inkSoft, fontSize: 12, fontWeight: 700 }}>{category}</button>)}
            </div>

            <div className="storefront-grid">
              {storefrontProducts.map((product) => (
                <div key={product.id} className="storefront-card" style={{ background: "#fff", border: `1px solid ${COLORS.paperEdge}`, borderRadius: 10, overflow: "hidden", boxShadow: "0 8px 20px rgba(0,0,0,0.04)" }}>
                  <img src={product.image} alt={`${product.name} cashew product`} onError={(event) => { event.currentTarget.src = FALLBACK_CASHEW_IMAGE; }} style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }} />
                  <div style={{ padding: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                      <h3 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>{product.name}</h3>
                      <span style={{ fontSize: 10, letterSpacing: "0.08em", background: product.status === "Low" ? "#FDE7D8" : "#EAF3E5", padding: "6px 8px", borderRadius: 999, color: COLORS.ink }}>{product.status}</span>
                    </div>
                    <div style={{ marginTop: 8, fontSize: 12, color: COLORS.inkSoft, textTransform: "uppercase", letterSpacing: "0.05em" }}>{product.grade}</div>
                    <p style={{ color: COLORS.inkSoft, lineHeight: 1.6, margin: "12px 0" }}>{product.description}</p>

                    {isPublicWebsite ? (
                      <div style={{ background: COLORS.paper, border: `1px solid ${COLORS.paperEdge}`, borderRadius: 8, padding: 12, marginTop: 10, color: COLORS.inkSoft, fontSize: 13, lineHeight: 1.5 }}>Availability, grade, specification, and commercial terms are confirmed per inquiry.</div>
                    ) : <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
                      <div style={{ background: COLORS.paper, border: `1px solid ${COLORS.paperEdge}`, borderRadius: 8, padding: 10 }}>
                        <div style={{ fontSize: 11, color: COLORS.inkSoft, textTransform: "uppercase", letterSpacing: "0.06em" }}>Large buyer</div>
                        <div style={{ fontSize: 22, fontWeight: 700, marginTop: 5 }}>${product.largePrice.toFixed(2)}</div>
                      </div>
                      <div style={{ background: COLORS.paper, border: `1px solid ${COLORS.paperEdge}`, borderRadius: 8, padding: 10 }}>
                        <div style={{ fontSize: 11, color: COLORS.inkSoft, textTransform: "uppercase", letterSpacing: "0.06em" }}>Small buyer</div>
                        <div style={{ fontSize: 22, fontWeight: 700, marginTop: 5 }}>${product.smallPrice.toFixed(2)}</div>
                      </div>
                    </div>}

                    <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: `1px solid ${COLORS.paperEdge}` }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: COLORS.inkSoft }}><CheckCircle2 size={14} color={COLORS.forestSoft} /> {isPublicWebsite ? "Request a sample" : `In stock: ${product.stock} kg`}</span>
                      <button onClick={() => orderOnWhatsApp(product)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 12px", background: COLORS.forest, color: "#fff", border: "none", borderRadius: 6, fontWeight: 600 }}><MessageCircle size={14} /> {isPublicWebsite ? "Discuss" : "Order"}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="storefront-trust" style={{ marginTop: 24 }}>
              <div style={{ background: COLORS.forest, color: "#fff", borderRadius: 10, padding: 20 }}>
                <div style={{ color: COLORS.amber, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em" }}>{isPublicWebsite ? "Mwarabu Nuts trade desk" : "Built for serious buyers"}</div>
                <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, margin: "8px 0" }}>{isPublicWebsite ? "See it. Review it. Then discuss the order." : "Reliable supply. Clear pricing. Direct contact."}</h3>
                <p style={{ color: COLORS.sage, lineHeight: 1.55, fontSize: 13, margin: 0 }}>{isPublicWebsite ? "Share product, preferred grade, volume, destination, packaging, and target timing. Align on a sample before a commercial commitment." : "Ask about bulk volumes, export requirements, packaging, delivery, and current availability through WhatsApp."}</p>
              </div>
              <div style={{ background: "#fff", border: `1px solid ${COLORS.paperEdge}`, borderRadius: 10, padding: 20 }}><CheckCircle2 color={COLORS.forestSoft} size={20} /><h3 style={{ margin: "10px 0 6px", fontSize: 17 }}>{isPublicWebsite ? "Tanzania origin" : "Wholesale & export"}</h3><p style={{ margin: 0, color: COLORS.inkSoft, fontSize: 13, lineHeight: 1.5 }}>{isPublicWebsite ? "Local presence, direct communication, and global ambition for serious cashew buyers." : "Large-buyer pricing for traders, distributors, processors, and export partners."}</p></div>
              <div style={{ background: "#fff", border: `1px solid ${COLORS.paperEdge}`, borderRadius: 10, padding: 20 }}><MessageCircle color={COLORS.forestSoft} size={20} /><h3 style={{ margin: "10px 0 6px", fontSize: 17 }}>{isPublicWebsite ? "Trade inquiry" : "Fast response"}</h3><p style={{ margin: 0, color: COLORS.inkSoft, fontSize: 13, lineHeight: 1.5 }}>{isPublicWebsite ? "WhatsApp +255 712 935 493 or email trade@mwarabunuts.com." : "Send your preferred grade and quantity. Our sales team will confirm the next steps."}</p></div>
            </div>
            <div style={{ marginTop: 18, padding: "18px 0 8px", borderTop: `1px solid ${COLORS.paperEdge}`, display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", color: COLORS.inkSoft, fontSize: 12 }}>
              <span><strong style={{ color: COLORS.ink }}>MWARABU NUTS</strong> · {isPublicWebsite ? "Cashew sourcing · Wholesale · Retail" : "Premium cashew supply"}</span>
              {isPublicWebsite ? <span><a href="https://www.instagram.com/mwarabu_nuts/" target="_blank" rel="noreferrer" style={{ color: COLORS.forest }}>Instagram</a> · <a href="mailto:trade@mwarabunuts.com" style={{ color: COLORS.forest }}>trade@mwarabunuts.com</a> · <a href="https://www.cashew.go.tz/" target="_blank" rel="noreferrer" style={{ color: COLORS.forest }}>Cashewnut Board</a></span> : <span>Instagram-ready product catalogue · Orders via WhatsApp</span>}
            </div>
          </div>
        )}

        {view === "admin" && (
          <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "0.9fr 1.4fr", gap: 18 }}>
            {!adminLoggedIn ? (
              <div style={{ background: "#fff", border: `1px solid ${COLORS.paperEdge}`, borderRadius: 6, padding: 24 }}>
                <SectionLabel>Admin Login</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <Field label="Username"><input type="text" value={loginForm.username} onChange={(e) => setLoginForm((f) => ({ ...f, username: e.target.value }))} style={inputStyle} /></Field>
                  <Field label="Password"><input type="password" value={loginForm.password} onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))} style={inputStyle} /></Field>
                  <button onClick={handleAdminLogin} style={{ padding: "10px 16px", border: "none", background: COLORS.forest, color: "#fff", borderRadius: 4, fontWeight: 600 }}>Login</button>
                  {adminError && <div style={{ color: COLORS.alert, fontSize: 12 }}>{adminError}</div>}
                </div>
              </div>
            ) : (
              <div style={{ background: "#fff", border: `1px solid ${COLORS.paperEdge}`, borderRadius: 6, padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><SectionLabel>{editingProductId ? "Edit Product" : "Product Management"}</SectionLabel><button onClick={() => setAdminLoggedIn(false)} style={{ border: "none", background: "none", color: COLORS.inkSoft, cursor: "pointer", fontSize: 12 }}>Log out</button></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr auto", gap: 10, alignItems: "end" }}>
                  <Field label="Name"><input type="text" value={newProduct.name} onChange={(e) => setNewProduct((f) => ({ ...f, name: e.target.value }))} style={inputStyle} /></Field>
                  <Field label="Grade"><select value={newProduct.grade} onChange={(e) => setNewProduct((f) => ({ ...f, grade: e.target.value }))} style={inputStyle}>{QUALITY_OPTIONS.map((grade) => <option key={grade} value={grade}>{grade}</option>)}</select></Field>
                  <Field label="Large buyer"><input type="number" step="0.01" value={newProduct.largePrice} onChange={(e) => setNewProduct((f) => ({ ...f, largePrice: e.target.value }))} style={inputStyle} /></Field>
                  <Field label="Small buyer"><input type="number" step="0.01" value={newProduct.smallPrice} onChange={(e) => setNewProduct((f) => ({ ...f, smallPrice: e.target.value }))} style={inputStyle} /></Field>
                  <Field label="Stock"><input type="number" value={newProduct.stock} onChange={(e) => setNewProduct((f) => ({ ...f, stock: e.target.value }))} style={inputStyle} /></Field>
                  <button onClick={addProduct} style={{ padding: "10px 14px", border: "none", background: COLORS.forest, color: "#fff", borderRadius: 4, fontWeight: 600, height: 38 }}>{editingProductId ? "Save" : "Add"}</button>
                </div>
                {adminError && <div style={{ marginTop: 10, color: COLORS.alert, fontSize: 12 }}>{adminError}</div>}
              </div>
            )}

            <div style={{ background: "#fff", border: `1px solid ${COLORS.paperEdge}`, borderRadius: 6, padding: 18 }}>
              <SectionLabel>Current Product List</SectionLabel>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: COLORS.paper, color: COLORS.inkSoft }}>
                      <th style={tableHeadStyle}>Product</th>
                      <th style={tableHeadStyle}>Grade</th>
                      <th style={tableHeadStyle}>Large</th>
                      <th style={tableHeadStyle}>Small</th>
                      <th style={tableHeadStyle}>Stock</th>
                      <th style={tableHeadStyle}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="row-hover" style={{ borderBottom: `1px solid ${COLORS.paperEdge}` }}>
                        <td style={tableCellStyle}>{product.name}</td>
                        <td style={tableCellStyle}>{product.grade}</td>
                        <td style={tableCellStyle}>${product.largePrice.toFixed(2)}</td>
                        <td style={tableCellStyle}>${product.smallPrice.toFixed(2)}</td>
                        <td style={tableCellStyle}>{product.stock} kg</td>
                        <td style={tableCellStyle}><button onClick={() => editProduct(product)} style={{ border: "none", background: "none", color: COLORS.forest, cursor: "pointer", fontSize: 12, marginRight: 8 }}>Edit</button><button onClick={() => deleteProduct(product.id)} style={{ border: "none", background: "none", color: COLORS.alert, cursor: "pointer", fontSize: 12 }}>Remove</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{
        fontSize: 10.5, fontWeight: 600, color: COLORS.inkSoft, textTransform: "uppercase",
        letterSpacing: "0.06em", marginBottom: 5,
      }}>{label}</div>
      {children}
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div style={{
      background: "#fff", border: `1px solid ${COLORS.paperEdge}`, borderRadius: 6, padding: "18px 18px 8px 18px",
    }}>
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 16,
        textTransform: "uppercase", letterSpacing: "0.02em", marginBottom: 6, color: COLORS.ink,
      }}>{title}</div>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "8px 10px", borderRadius: 4,
  border: `1px solid ${COLORS.paperEdge}`, fontSize: 13, background: "#fff", color: COLORS.ink,
  height: 38,
};

const tooltipStyle = {
  background: "#fff", border: `1px solid ${COLORS.paperEdge}`, borderRadius: 4,
  fontSize: 12, fontFamily: "'Inter', sans-serif",
};
