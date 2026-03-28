import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import multer from "multer";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Cloudinary config ─────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── MongoDB models ────────────────────────────────────────────
const productSchema = new mongoose.Schema({
  id: { type: String, default: () => crypto.randomUUID() },
  name: String,
  price: Number,
  description: String,
  defaultImage: String,
  colorImages: { type: Map, of: String, default: {} },
  colors: [String],
  sizes: [String],
  category: String,
  createdAt: { type: Number, default: () => Date.now() },
}, { strict: false });

const aboutSchema = new mongoose.Schema({
  instagram: { type: String, default: "" },
  tiktok:    { type: String, default: "" },
  maps:      { type: String, default: "" },
  phone:     { type: String, default: "" },
});

const Product = mongoose.model("Product", productSchema);
const About   = mongoose.model("About", aboutSchema);

// ── Auth ──────────────────────────────────────────────────────
const ADMIN = {
  username: process.env.ADMIN_USERNAME,
  password: process.env.ADMIN_PASSWORD,
};
const TOKEN_SECRET = process.env.TOKEN_SECRET;

function makeToken(username) {
  return crypto.createHash("sha256").update(`${username}.${TOKEN_SECRET}`).digest("hex");
}

function authRequired(req, res, next) {
  const token = String(req.headers.authorization || "").replace("Bearer ", "");
  if (token !== makeToken(ADMIN.username)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// ── Multer → Cloudinary ───────────────────────────────────────
const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: "sultanashop", allowed_formats: ["jpg", "jpeg", "png", "webp"] },
});
const upload = multer({ storage });

// ── Express setup ─────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "..", "images")));

// ── Auth route ────────────────────────────────────────────────
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body || {};
  if (username === ADMIN.username && password === ADMIN.password) {
    return res.json({ token: makeToken(username) });
  }
  return res.status(401).json({ error: "Invalid credentials" });
});

// ── Products routes ───────────────────────────────────────────
app.get("/api/products", async (_req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
});

app.post("/api/products", authRequired, upload.any(), async (req, res) => {
  const product = typeof req.body.product === "string"
    ? JSON.parse(req.body.product)
    : req.body;

  if (!product.id) product.id = crypto.randomUUID();
  if (!product.createdAt) product.createdAt = Date.now();

  applyCloudinaryImages(req, product);

  if (!product.defaultImage) {
    return res.status(400).json({ error: "Default image is required" });
  }

  const created = await Product.create(product);
  res.status(201).json(created);
});

app.put("/api/products/:id", authRequired, upload.any(), async (req, res) => {
  const existing = await Product.findOne({ id: req.params.id });
  if (!existing) return res.status(404).json({ error: "Not found" });

  const payload = typeof req.body.product === "string"
    ? JSON.parse(req.body.product)
    : req.body;

  applyCloudinaryImages(req, payload);

  const updated = await Product.findOneAndUpdate(
    { id: req.params.id },
    { ...payload, id: req.params.id, createdAt: existing.createdAt },
    { new: true }
  );
  res.json(updated);
});

app.delete("/api/products/:id", authRequired, async (req, res) => {
  await Product.deleteOne({ id: req.params.id });
  res.json({ ok: true });
});

// ── About routes ──────────────────────────────────────────────
app.get("/api/about", async (_req, res) => {
  let about = await About.findOne();
  if (!about) about = await About.create({});
  res.json(about);
});

app.put("/api/about", authRequired, async (req, res) => {
  const { instagram, tiktok, maps, phone } = req.body || {};
  let about = await About.findOne();
  if (!about) about = new About({});
  Object.assign(about, { instagram, tiktok, maps, phone });
  await about.save();
  res.json(about);
});

// ── Helper ────────────────────────────────────────────────────
function applyCloudinaryImages(req, product) {
  const files = Array.isArray(req.files) ? req.files : [];
  const colorFileMap = req.body?.colorFileMap ? JSON.parse(req.body.colorFileMap) : {};

  const defaultFile = files.find((f) => f.fieldname === "defaultImage");
  if (defaultFile) product.defaultImage = defaultFile.path; // Cloudinary URL

  if (!product.colorImages || typeof product.colorImages !== "object") {
    product.colorImages = {};
  }

  Object.entries(colorFileMap).forEach(([color, fieldName]) => {
    const file = files.find((f) => f.fieldname === fieldName);
    if (file) product.colorImages[color] = file.path; // Cloudinary URL
  });
}

// ── Serve frontend ────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ── Start ─────────────────────────────────────────────────────
const port = process.env.PORT || 4000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(port, () => console.log(`🚀 Sultana running on port ${port}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });