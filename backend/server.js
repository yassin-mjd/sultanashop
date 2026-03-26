import express from "express";
import cors from "cors";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PRODUCTS_FILE = path.join(__dirname, "data", "products.json");
const ABOUT_FILE = path.join(__dirname, "data", "about.json");
const UPLOADS_DIR = path.join(__dirname, "uploads");

const ADMIN = {
  username: "yassine",
  password: "monnvconte9957",
};
const TOKEN_SECRET = "sultana-simple-secret";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(UPLOADS_DIR));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomUUID()}${ext}`);
  },
});
const upload = multer({ storage });

async function readJson(file, fallback) {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw);
  } catch (_) {
    return fallback;
  }
}

async function writeJson(file, value) {
  await fs.writeFile(file, JSON.stringify(value, null, 2), "utf8");
}

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

function fileUrl(req, filename) {
  return `${req.protocol}://${req.get("host")}/uploads/${filename}`;
}

function parseProductPayload(req) {
  if (typeof req.body.product === "string") {
    return JSON.parse(req.body.product);
  }
  return req.body || {};
}

function applyUploadedImages(req, product) {
  const files = Array.isArray(req.files) ? req.files : [];
  const colorFileMapRaw = req.body?.colorFileMap;
  const colorFileMap = colorFileMapRaw ? JSON.parse(colorFileMapRaw) : {};

  const defaultImageFile = files.find((f) => f.fieldname === "defaultImage");
  if (defaultImageFile) {
    product.defaultImage = fileUrl(req, defaultImageFile.filename);
  }

  if (!product.colorImages || typeof product.colorImages !== "object") {
    product.colorImages = {};
  }

  Object.entries(colorFileMap).forEach(([color, fieldName]) => {
    const colorFile = files.find((f) => f.fieldname === fieldName);
    if (colorFile) {
      product.colorImages[color] = fileUrl(req, colorFile.filename);
    }
  });
}

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body || {};
  if (username === ADMIN.username && password === ADMIN.password) {
    return res.json({ token: makeToken(username) });
  }
  return res.status(401).json({ error: "Invalid credentials" });
});

app.get("/api/products", async (_req, res) => {
  const products = await readJson(PRODUCTS_FILE, []);
  res.json(products);
});

app.post("/api/products", authRequired, upload.any(), async (req, res) => {
  const products = await readJson(PRODUCTS_FILE, []);
  const product = parseProductPayload(req);
  if (!product.id) product.id = crypto.randomUUID();
  if (!product.createdAt) product.createdAt = Date.now();
  applyUploadedImages(req, product);
  if (!product.defaultImage) {
    return res.status(400).json({ error: "Default image is required" });
  }
  products.unshift(product);
  await writeJson(PRODUCTS_FILE, products);
  res.status(201).json(product);
});

app.put("/api/products/:id", authRequired, upload.any(), async (req, res) => {
  const products = await readJson(PRODUCTS_FILE, []);
  const idx = products.findIndex((p) => p.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: "Not found" });
  const keepCreatedAt = products[idx].createdAt;
  const payload = parseProductPayload(req);
  const next = {
    ...products[idx],
    ...payload,
    id: req.params.id,
    createdAt: keepCreatedAt,
  };
  applyUploadedImages(req, next);
  products[idx] = next;
  await writeJson(PRODUCTS_FILE, products);
  return res.json(products[idx]);
});

app.delete("/api/products/:id", authRequired, async (req, res) => {
  const products = await readJson(PRODUCTS_FILE, []);
  const next = products.filter((p) => p.id !== req.params.id);
  await writeJson(PRODUCTS_FILE, next);
  res.json({ ok: true });
});

app.get("/api/about", async (_req, res) => {
  const about = await readJson(ABOUT_FILE, {
    instagram: "",
    tiktok: "",
    maps: "",
    phone: "",
  });
  res.json(about);
});

app.put("/api/about", authRequired, async (req, res) => {
  const payload = req.body || {};
  const about = {
    instagram: payload.instagram || "",
    tiktok: payload.tiktok || "",
    maps: payload.maps || "",
    phone: payload.phone || "",
  };
  await writeJson(ABOUT_FILE, about);
  res.json(about);
});

const port = 4000;
await fs.mkdir(UPLOADS_DIR, { recursive: true });
app.listen(port, () => {
  console.log(`Sultana backend running on http://localhost:${port}`);
});
