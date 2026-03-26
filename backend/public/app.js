const SESSION_KEY = "sultana_admin_session";
// Use same-origin API on Render (avoid hard-coded localhost).
const API_BASE_URL = "/api";
const NEW_BADGE_DAYS = 7;

const fallbackProducts = [
  {
    id: crypto.randomUUID(),
    name: "Robe Satin Nuit",
    category: "robes",
    price: 149.99,
    description: "Robe elegante en satin pour vos soirees speciales.",
    colors: ["Noir", "Dore", "Bordeaux"],
    sizeRange: "36-44",
    defaultImage: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80",
    colorImages: {
      Noir: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80",
      Dore: "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=900&q=80",
      Bordeaux: "https://images.unsplash.com/photo-1566479179817-c0f7f4f9b5f2?auto=format&fit=crop&w=900&q=80",
    },
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: crypto.randomUUID(),
    name: "Pantalon Tailleur Chic",
    category: "pantalon",
    price: 89.5,
    description: "Coupe moderne et confortable pour style professionnel.",
    colors: ["Noir", "Beige"],
    sizeRange: "34-46",
    defaultImage: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=900&q=80",
    colorImages: {
      Noir: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=900&q=80",
      Beige: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80",
    },
    createdAt: Date.now() - 9 * 24 * 60 * 60 * 1000,
  },
  {
    id: crypto.randomUUID(),
    name: "Jupe Plissee Royale",
    category: "jupes",
    price: 72,
    description: "Jupe plissee avec finition premium et taille haute.",
    colors: ["Noir", "Emeraude"],
    sizeRange: "36-42",
    defaultImage: "https://images.unsplash.com/photo-1582142306909-195724d33ffc?auto=format&fit=crop&w=900&q=80",
    colorImages: {
      Noir: "https://images.unsplash.com/photo-1582142306909-195724d33ffc?auto=format&fit=crop&w=900&q=80",
      Emeraude: "https://images.unsplash.com/photo-1549062572-544a64fb0c56?auto=format&fit=crop&w=900&q=80",
    },
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
  },
];

const fallbackAbout = {
  instagram: "https://instagram.com",
  tiktok: "https://tiktok.com",
  maps: "https://maps.google.com",
  phone: "+212 600 000 000",
};

const i18n = {
  fr: {
    navCatalog: "Catalogue",
    navAdmin: "Admin",
    navLang: "العربية",
    aboutTitle: "A propos",
    aboutAdminTitle: "A propos et contacts",
    back: "Retour au catalogue",
    similar: "Articles similaires",
    categoryLabel: "Filtrer par categorie :",
    emptyCategory: "Aucun article pour cette categorie.",
    noSimilar: "Aucun article similaire pour le moment.",
    loginError: "Identifiants admin incorrects.",
    defaultImageRequired: "Veuillez selectionner une image principale.",
    deleteConfirm: 'Supprimer "{name}" ?',
    newBadge: "NOUVEAU",
    currency: "MAD",
  },
  ar: {
    navCatalog: "المنتجات",
    navAdmin: "الادارة",
    navLang: "Français",
    aboutTitle: "حول المتجر",
    aboutAdminTitle: "معلومات التواصل",
    back: "العودة للمنتجات",
    similar: "منتجات مشابهة",
    categoryLabel: "تصفية حسب الفئة:",
    emptyCategory: "لا توجد منتجات في هذه الفئة.",
    noSimilar: "لا توجد منتجات مشابهة حاليا.",
    loginError: "بيانات المدير غير صحيحة.",
    defaultImageRequired: "يرجى اختيار الصورة الرئيسية.",
    deleteConfirm: 'حذف "{name}" ؟',
    newBadge: "جديد",
    currency: "MAD",
  },
};

const el = {
  catalogSection: document.getElementById("catalogSection"),
  aboutSection: document.getElementById("aboutSection"),
  detailSection: document.getElementById("detailSection"),
  adminSection: document.getElementById("adminSection"),
  showCatalogBtn: document.getElementById("showCatalogBtn"),
  showAboutBtn: document.getElementById("showAboutBtn"),
  showAdminBtn: document.getElementById("showAdminBtn"),
  languageToggleBtn: document.getElementById("languageToggleBtn"),
  categoryFilter: document.getElementById("categoryFilter"),
  productsGrid: document.getElementById("productsGrid"),
  aboutTitle: document.getElementById("aboutTitle"),
  aboutLinks: document.getElementById("aboutLinks"),
  productDetail: document.getElementById("productDetail"),
  similarProducts: document.getElementById("similarProducts"),
  backToCatalogBtn: document.getElementById("backToCatalogBtn"),
  adminAuthBox: document.getElementById("adminAuthBox"),
  adminDashboard: document.getElementById("adminDashboard"),
  adminLoginForm: document.getElementById("adminLoginForm"),
  adminUsername: document.getElementById("adminUsername"),
  adminPassword: document.getElementById("adminPassword"),
  productForm: document.getElementById("productForm"),
  adminProductsBody: document.getElementById("adminProductsBody"),
  productId: document.getElementById("productId"),
  name: document.getElementById("name"),
  category: document.getElementById("category"),
  price: document.getElementById("price"),
  description: document.getElementById("description"),
  sizeRange: document.getElementById("sizeRange"),
  colors: document.getElementById("colors"),
  defaultImageFile: document.getElementById("defaultImageFile"),
  colorImageFields: document.getElementById("colorImageFields"),
  resetFormBtn: document.getElementById("resetFormBtn"),
  logoutBtn: document.getElementById("logoutBtn"),
  aboutAdminTitle: document.getElementById("aboutAdminTitle"),
  aboutForm: document.getElementById("aboutForm"),
  aboutInstagram: document.getElementById("aboutInstagram"),
  aboutTiktok: document.getElementById("aboutTiktok"),
  aboutMaps: document.getElementById("aboutMaps"),
  aboutPhone: document.getElementById("aboutPhone"),
};

let state = {
  products: [],
  about: { ...fallbackAbout },
  selectedCategory: "all",
  selectedProductId: null,
  selectedColor: null,
  language: "fr",
  authToken: null,
};

async function apiGet(path) {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed`);
  return res.json();
}

async function apiPost(path, body, auth = false) {
  const isFormData = body instanceof FormData;
  const headers = isFormData ? {} : { "Content-Type": "application/json" };
  if (auth && state.authToken) headers.Authorization = `Bearer ${state.authToken}`;
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: isFormData ? body : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed`);
  return res.json();
}

async function apiPut(path, body, auth = false) {
  const isFormData = body instanceof FormData;
  const headers = isFormData ? {} : { "Content-Type": "application/json" };
  if (auth && state.authToken) headers.Authorization = `Bearer ${state.authToken}`;
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "PUT",
    headers,
    body: isFormData ? body : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PUT ${path} failed`);
  return res.json();
}

async function apiDelete(path, auth = false) {
  const headers = {};
  if (auth && state.authToken) headers.Authorization = `Bearer ${state.authToken}`;
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error(`DELETE ${path} failed`);
  return res.json();
}

function t(key) {
  return i18n[state.language][key];
}

function isNewProduct(product) {
  const age = Date.now() - Number(product.createdAt || 0);
  return age <= NEW_BADGE_DAYS * 24 * 60 * 60 * 1000;
}

function getFilteredProducts() {
  if (state.selectedCategory === "all") return state.products;
  return state.products.filter((p) => p.category === state.selectedCategory);
}

function productCardTemplate(product) {
  return `
    <article class="product-card" data-id="${product.id}">
      ${isNewProduct(product) ? `<span class="new-badge">${t("newBadge")}</span>` : ""}
      <img src="${product.defaultImage}" alt="${product.name}" />
      <div class="card-body">
        <h4>${product.name}</h4>
        <p>${product.description}</p>
        <p>${state.language === "fr" ? "Tailles" : "المقاسات"}: ${product.sizeRange}</p>
        <p>${state.language === "fr" ? "Couleurs" : "الالوان"}: ${product.colors.join(", ")}</p>
        <span class="price">${product.price.toFixed(2)} ${t("currency")}</span>
      </div>
    </article>
  `;
}

function renderCatalog() {
  const products = getFilteredProducts();
  if (!products.length) {
    el.productsGrid.innerHTML = `<p>${t("emptyCategory")}</p>`;
    return;
  }
  el.productsGrid.innerHTML = products.map(productCardTemplate).join("");
}

function renderAbout() {
  el.aboutLinks.innerHTML = `
    <a class="about-link" href="${state.about.instagram}" target="_blank" rel="noreferrer">Instagram</a>
    <a class="about-link" href="${state.about.tiktok}" target="_blank" rel="noreferrer">TikTok</a>
    <a class="about-link" href="${state.about.maps}" target="_blank" rel="noreferrer">Google Maps</a>
    <a class="about-link" href="tel:${state.about.phone.replace(/\s/g, "")}">${state.about.phone}</a>
  `;
}

function showSection(section) {
  el.catalogSection.classList.add("hidden");
  el.aboutSection.classList.add("hidden");
  el.detailSection.classList.add("hidden");
  el.adminSection.classList.add("hidden");
  section.classList.remove("hidden");
}

function setActiveNav(target) {
  el.showCatalogBtn.classList.toggle("active", target === "catalog");
  el.showAboutBtn.classList.toggle("active", target === "about");
  el.showAdminBtn.classList.toggle("active", target === "admin");
}

function renderProductDetail(productId) {
  const product = state.products.find((p) => p.id === productId);
  if (!product) return;
  state.selectedProductId = product.id;
  state.selectedColor = state.selectedColor || product.colors[0];
  const image = product.colorImages[state.selectedColor] || product.defaultImage;

  el.productDetail.innerHTML = `
    <div class="detail-grid">
      <img src="${image}" alt="${product.name}" />
      <div>
        <h2>${product.name}</h2>
        <p>${product.description}</p>
        <p><strong>${state.language === "fr" ? "Categorie" : "الفئة"}:</strong> ${product.category}</p>
        <p><strong>${state.language === "fr" ? "Prix" : "السعر"}:</strong> ${product.price.toFixed(2)} ${t("currency")}</p>
        <p><strong>${state.language === "fr" ? "Tailles" : "المقاسات"}:</strong> ${product.sizeRange}</p>
        <div class="color-picker">
          ${product.colors
            .map(
              (color) => `
            <button class="color-btn ${state.selectedColor === color ? "active" : ""}" data-color="${color}">
              ${color}
            </button>`
            )
            .join("")}
        </div>
      </div>
    </div>
  `;

  const similar = state.products.filter((p) => p.category === product.category && p.id !== product.id);
  el.similarProducts.innerHTML = similar.length
    ? similar.map(productCardTemplate).join("")
    : `<p>${t("noSimilar")}</p>`;
}

function renderAdminTable() {
  el.adminProductsBody.innerHTML = state.products
    .map(
      (p) => `
      <tr>
        <td>${p.name}</td>
        <td>${p.category}</td>
        <td>${p.price.toFixed(2)} ${t("currency")}</td>
        <td>
          <div class="action-buttons">
            <button class="ghost-btn" data-action="edit" data-id="${p.id}">Modifier</button>
            <button class="danger-btn" data-action="delete" data-id="${p.id}">Supprimer</button>
          </div>
        </td>
      </tr>
    `
    )
    .join("");
}

function resetForm() {
  el.productForm.reset();
  el.productId.value = "";
  renderColorImageFields([]);
}

function fillForm(product) {
  el.productId.value = product.id;
  el.name.value = product.name;
  el.category.value = product.category;
  el.price.value = product.price;
  el.description.value = product.description;
  el.sizeRange.value = product.sizeRange;
  el.colors.value = product.colors.join(",");
  renderColorImageFields(product.colors);
}

function getColorsFromInput() {
  return el.colors.value
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
}

function renderColorImageFields(colors) {
  if (!colors.length) {
    el.colorImageFields.innerHTML = `<p class="hint">Ecris les couleurs puis choisis une image pour chaque couleur.</p>`;
    return;
  }

  el.colorImageFields.innerHTML = colors
    .map(
      (color, idx) => `
        <div class="color-image-row">
          <label>${color}</label>
          <input type="file" accept="image/*" data-color="${color}" data-index="${idx}" class="color-image-input" />
        </div>
      `
    )
    .join("");
}

function buildProductFormData() {
  const colors = el.colors.value
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  const existing = state.products.find((p) => p.id === el.productId.value);
  const productPayload = {
    id: el.productId.value || crypto.randomUUID(),
    name: el.name.value.trim(),
    category: el.category.value,
    price: Number(el.price.value),
    description: el.description.value.trim(),
    sizeRange: el.sizeRange.value.trim(),
    colors,
    defaultImage: existing?.defaultImage || "",
    colorImages: existing?.colorImages || {},
    createdAt: el.productId.value
      ? state.products.find((p) => p.id === el.productId.value)?.createdAt || Date.now()
      : Date.now(),
  };

  const formData = new FormData();
  const defaultImageFile = el.defaultImageFile.files[0];
  if (!productPayload.defaultImage && !defaultImageFile) {
    alert(t("defaultImageRequired"));
    return null;
  }
  if (defaultImageFile) {
    formData.append("defaultImage", defaultImageFile);
  }

  const colorFileMap = {};
  const colorInputs = document.querySelectorAll(".color-image-input");
  colorInputs.forEach((input) => {
    const file = input.files[0];
    if (!file) return;
    const fieldName = `colorFile_${input.dataset.index}`;
    formData.append(fieldName, file);
    colorFileMap[input.dataset.color] = fieldName;
  });

  formData.append("colorFileMap", JSON.stringify(colorFileMap));
  formData.append("product", JSON.stringify(productPayload));
  return formData;
}

function fillAboutForm() {
  el.aboutInstagram.value = state.about.instagram || "";
  el.aboutTiktok.value = state.about.tiktok || "";
  el.aboutMaps.value = state.about.maps || "";
  el.aboutPhone.value = state.about.phone || "";
}

function applyLanguage() {
  document.documentElement.lang = state.language;
  document.documentElement.dir = state.language === "ar" ? "rtl" : "ltr";
  el.showCatalogBtn.textContent = t("navCatalog");
  el.showAboutBtn.textContent = t("aboutTitle");
  el.showAdminBtn.textContent = t("navAdmin");
  el.languageToggleBtn.textContent = t("navLang");
  el.aboutTitle.textContent = t("aboutTitle");
  el.aboutAdminTitle.textContent = t("aboutAdminTitle");
  el.backToCatalogBtn.textContent = t("back");
  const similarTitle = document.querySelector(".similar-wrap h3");
  if (similarTitle) similarTitle.textContent = t("similar");
  const filterLabel = document.querySelector('label[for="categoryFilter"]');
  if (filterLabel) filterLabel.textContent = t("categoryLabel");
}

function setAdminAuthUI() {
  const authed = localStorage.getItem(SESSION_KEY) === "true";
  el.adminAuthBox.classList.toggle("hidden", authed);
  el.adminDashboard.classList.toggle("hidden", !authed);
}

function bindEvents() {
  el.showCatalogBtn.addEventListener("click", () => {
    setActiveNav("catalog");
    showSection(el.catalogSection);
  });

  el.showAboutBtn.addEventListener("click", () => {
    setActiveNav("about");
    showSection(el.aboutSection);
  });

  el.showAdminBtn.addEventListener("click", () => {
    setActiveNav("admin");
    showSection(el.adminSection);
    setAdminAuthUI();
  });

  el.languageToggleBtn.addEventListener("click", () => {
    state.language = state.language === "fr" ? "ar" : "fr";
    applyLanguage();
    renderCatalog();
    renderAbout();
    renderAdminTable();
    if (state.selectedProductId) renderProductDetail(state.selectedProductId);
  });

  el.categoryFilter.addEventListener("change", (e) => {
    state.selectedCategory = e.target.value;
    renderCatalog();
  });

  el.productsGrid.addEventListener("click", (e) => {
    const card = e.target.closest(".product-card");
    if (!card) return;
    state.selectedColor = null;
    renderProductDetail(card.dataset.id);
    showSection(el.detailSection);
  });

  el.backToCatalogBtn.addEventListener("click", () => {
    setActiveNav("catalog");
    showSection(el.catalogSection);
  });

  el.productDetail.addEventListener("click", (e) => {
    const btn = e.target.closest(".color-btn");
    if (!btn || !state.selectedProductId) return;
    state.selectedColor = btn.dataset.color;
    renderProductDetail(state.selectedProductId);
  });

  el.similarProducts.addEventListener("click", (e) => {
    const card = e.target.closest(".product-card");
    if (!card) return;
    state.selectedColor = null;
    renderProductDetail(card.dataset.id);
  });

  el.adminLoginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const result = await apiPost("/auth/login", {
        username: el.adminUsername.value.trim(),
        password: el.adminPassword.value.trim(),
      });
      state.authToken = result.token;
      sessionStorage.setItem("sultana_token", state.authToken);
      localStorage.setItem(SESSION_KEY, "true");
      setAdminAuthUI();
      renderAdminTable();
      fillAboutForm();
      return;
    } catch (_) {
      alert(t("loginError"));
    }
  });

  el.logoutBtn.addEventListener("click", () => {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem("sultana_token");
    state.authToken = null;
    setAdminAuthUI();
  });

  el.productForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = buildProductFormData();
    if (!formData) return;

    const productId = el.productId.value;
    const exists = state.products.some((p) => p.id === productId);
    if (exists) await apiPut(`/products/${productId}`, formData, true);
    else await apiPost("/products", formData, true);
    state.products = await apiGet("/products");
    renderCatalog();
    renderAdminTable();
    resetForm();
  });

  el.adminProductsBody.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    const product = state.products.find((p) => p.id === id);
    if (!product) return;

    if (action === "edit") {
      fillForm(product);
    }
    if (action === "delete") {
      const ok = confirm(t("deleteConfirm").replace("{name}", product.name));
      if (!ok) return;
      await apiDelete(`/products/${id}`, true);
      state.products = await apiGet("/products");
      renderCatalog();
      renderAdminTable();
      if (state.selectedProductId === id) showSection(el.catalogSection);
    }
  });

  el.resetFormBtn.addEventListener("click", () => resetForm());
  el.colors.addEventListener("input", () => {
    renderColorImageFields(getColorsFromInput());
  });

  el.aboutForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      instagram: el.aboutInstagram.value.trim(),
      tiktok: el.aboutTiktok.value.trim(),
      maps: el.aboutMaps.value.trim(),
      phone: el.aboutPhone.value.trim(),
    };
    await apiPut("/about", payload, true);
    state.about = await apiGet("/about");
    renderAbout();
  });
}

async function initData() {
  try {
    state.products = await apiGet("/products");
    state.about = await apiGet("/about");
  } catch (_) {
    state.products = fallbackProducts;
    state.about = fallbackAbout;
  }
}

async function init() {
  state.authToken = sessionStorage.getItem("sultana_token");
  await initData();
  bindEvents();
  applyLanguage();
  renderCatalog();
  renderAbout();
  setAdminAuthUI();
  renderAdminTable();
  fillAboutForm();
  renderColorImageFields([]);
  showSection(el.catalogSection);
}

init();
