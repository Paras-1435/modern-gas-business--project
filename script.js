// Sample catalog data used across the home featured section and shop listing.
const products = [
  {
    id: "gs-001",
    name: "2 Burner Glass Top Gas Stove",
    category: "gas-stove",
    price: 3299,
    images: [
      "images/2-Burner-Premium-Gas-Stove.jpg",
      "images/2-Burner-Premium-Gas-Stove-2.jpg",
    ],
    description: "Elegant toughened glass stove with brass burners and anti-skid feet."
  },
  {
    id: "gs-002",
    name: "4 Burner Premium Gas Stove",
    category: "gas-stove",
    price: 6899,
    images: [
      "images/4-Burner-Premium-Gas-Stove.jpg",
      "images/4-Burner-Premium-Gas-Stove-2.jpg",
      "images/4-Burner-Premium-Gas-Stove-3.jpg"
    ],
    description: "Designed for large families with high-heat efficiency and sturdy pan supports."
  },
  {
    id: "ind-001",
    name: "Smart Induction Cooktop 2200W",
    category: "induction",
    price: 4499,
    images: [
      "images/smart-induction-cooktop-2200w.jpg",
      "images/smart-induction-cooktop-2200w-2.jpg"
    ],
    description: "Touch controls, multiple presets, and overheat protection for safer cooking."
  },
  {
    id: "ind-002",
    name: "Portable Induction Plate",
    category: "induction",
    price: 2999,
    images: [
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1617098474202-0d0d7f60f3b2?auto=format&fit=crop&w=900&q=80"
    ],
    description: "Compact induction plate ideal for hostels, studios, and backup kitchen use."
  },
  {
    id: "acc-001",
    name: "LPG Gas Regulator Pro",
    category: "accessories",
    price: 599,
    images: [
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?auto=format&fit=crop&w=900&q=80"
    ],
    description: "Durable safety regulator with secure lock for consistent gas flow."
  },
  {
    id: "acc-002",
    name: "Stainless Steel Burner Set",
    category: "accessories",
    price: 899,
    images: [
      "https://images.unsplash.com/photo-1575517111478-7f6afd0973db?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1515705576963-95cad62945b6?auto=format&fit=crop&w=900&q=80"
    ],
    description: "Long-lasting burner set engineered for better flame distribution."
  }
];

// Currency formatting helper for all price rendering.
const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

// Local storage key for cart persistence.
const cartKey = "modernGasCart";
const getCart = () => JSON.parse(localStorage.getItem(cartKey) || "[]");
const saveCart = (cart) => localStorage.setItem(cartKey, JSON.stringify(cart));

const nav = document.querySelector(".site-nav");
const mobileToggle = document.querySelector(".mobile-toggle");
const header = document.querySelector(".site-header");
const cartBtn = document.getElementById("cartBtn");
const cartDrawer = document.getElementById("cartDrawer");
const closeCartBtn = document.getElementById("closeCart");
const cartCount = document.getElementById("cartCount");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");
const sliderTimers = [];
const splashSeenKey = "modernGasSplashSeenV2";

function getProductImages(product) {
  if (Array.isArray(product.images) && product.images.length) return product.images;
  if (product.image) return [product.image];
  return [];
}

function initHeader() {
  if (!mobileToggle || !nav) return;

  mobileToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    mobileToggle.classList.toggle("active", isOpen);
    mobileToggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      mobileToggle.classList.remove("active");
      mobileToggle.setAttribute("aria-expanded", "false");
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 940) {
      nav.classList.remove("open");
      mobileToggle.classList.remove("active");
      mobileToggle.setAttribute("aria-expanded", "false");
    }
  });

  window.addEventListener("scroll", () => {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 10);
  });
}

function productCard(product) {
  const images = getProductImages(product);
  const hasSlider = images.length > 1;
  const imageMarkup = hasSlider
    ? `
      <div class="product-slider" data-auto="true" data-interval="3200">
        ${images
          .map(
            (src, index) =>
              `<img class="product-thumb slide ${index === 0 ? "active" : ""}" src="${src}" alt="${product.name}" loading="lazy" />`
          )
          .join("")}
        <div class="slider-dots">
          ${images
            .map((_, index) => `<span class="dot ${index === 0 ? "active" : ""}"></span>`)
            .join("")}
        </div>
      </div>
    `
    : `<img class="product-thumb" src="${images[0]}" alt="${product.name}" loading="lazy" />`;

  return `
    <article class="product-card reveal">
      ${imageMarkup}
      <span class="tag">${product.category.replace("-", " ")}</span>
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <div class="price-row">
        <strong>${currency.format(product.price)}</strong>
      </div>
      <div class="card-actions">
        <button class="btn btn-outline" data-view="${product.id}">Details</button>
        <button class="btn btn-primary" data-add="${product.id}">Add to Cart</button>
      </div>
    </article>
  `;
}

function renderFeatured() {
  const featuredGrid = document.getElementById("featuredGrid");
  if (!featuredGrid) return;

  featuredGrid.innerHTML = products.slice(0, 3).map(productCard).join("");
  initProductSliders();
  bindProductActions();
  initReveals();
}

function renderShop(category = "all") {
  const shopGrid = document.getElementById("shopGrid");
  if (!shopGrid) return;

  const filtered =
    category === "all" ? products : products.filter((item) => item.category === category);

  shopGrid.innerHTML = filtered.map(productCard).join("");
  initProductSliders();
  bindProductActions();
  initReveals();
}

function initProductSliders() {
  sliderTimers.forEach((timer) => clearInterval(timer));
  sliderTimers.length = 0;

  const sliders = document.querySelectorAll(".product-slider[data-auto='true']");
  sliders.forEach((slider) => {
    const slides = slider.querySelectorAll(".slide");
    const dots = slider.querySelectorAll(".dot");
    if (slides.length < 2) return;

    let index = 0;
    const interval = Number(slider.dataset.interval) || 3200;

    const showSlide = (nextIndex) => {
      slides.forEach((slide, i) => slide.classList.toggle("active", i === nextIndex));
      dots.forEach((dot, i) => dot.classList.toggle("active", i === nextIndex));
    };

    const timer = setInterval(() => {
      index = (index + 1) % slides.length;
      showSlide(index);
    }, interval);

    sliderTimers.push(timer);
  });
}

function bindFilter() {
  const buttons = document.querySelectorAll(".filter-btn");
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderShop(btn.dataset.filter);
    });
  });
}

let selectedProduct = null;
let modalImageIndex = 0;

function bindProductActions() {
  document.querySelectorAll("[data-add]").forEach((button) => {
    button.addEventListener("click", () => addToCart(button.dataset.add));
  });

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => openModal(button.dataset.view));
  });
}

function addToCart(productId) {
  const item = products.find((product) => product.id === productId);
  if (!item) return;

  const cart = getCart();
  const existing = cart.find((entry) => entry.id === productId);

  if (existing) {
    existing.qty += 1;
  } else {
    const productImages = getProductImages(item);
    cart.push({
      id: item.id,
      name: item.name,
      price: item.price,
      image: productImages[0] || "",
      qty: 1
    });
  }

  saveCart(cart);
  renderCart();
}

function updateQty(productId, diff) {
  let cart = getCart();
  cart = cart
    .map((item) => (item.id === productId ? { ...item, qty: item.qty + diff } : item))
    .filter((item) => item.qty > 0);

  saveCart(cart);
  renderCart();
}

function removeFromCart(productId) {
  const cart = getCart().filter((item) => item.id !== productId);
  saveCart(cart);
  renderCart();
}

function renderCart() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.qty * item.price, 0);

  if (cartCount) cartCount.textContent = totalItems;
  if (cartTotal) cartTotal.textContent = currency.format(totalPrice);

  if (!cartItems) return;

  if (!cart.length) {
    cartItems.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  cartItems.innerHTML = cart
    .map(
      (item) => `
      <div class="cart-item">
        <img class="cart-item-thumb" src="${item.image || ""}" alt="${item.name}" loading="lazy" />
        <div>
          <strong>${item.name}</strong>
          <small>${currency.format(item.price)} each</small>
        </div>
        <div>
          <div class="qty-row">
            <button data-dec="${item.id}">-</button>
            <span>${item.qty}</span>
            <button data-inc="${item.id}">+</button>
          </div>
          <button class="btn btn-outline" style="margin-top:6px;padding:4px 8px;" data-remove="${item.id}">Remove</button>
        </div>
      </div>
    `
    )
    .join("");

  document.querySelectorAll("[data-inc]").forEach((btn) =>
    btn.addEventListener("click", () => updateQty(btn.dataset.inc, 1))
  );

  document.querySelectorAll("[data-dec]").forEach((btn) =>
    btn.addEventListener("click", () => updateQty(btn.dataset.dec, -1))
  );

  document.querySelectorAll("[data-remove]").forEach((btn) =>
    btn.addEventListener("click", () => removeFromCart(btn.dataset.remove))
  );
}

function bindCart() {
  if (cartBtn && cartDrawer) {
    cartBtn.addEventListener("click", () => cartDrawer.classList.add("open"));
  }

  if (closeCartBtn && cartDrawer) {
    closeCartBtn.addEventListener("click", () => cartDrawer.classList.remove("open"));
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      if (!getCart().length) {
        alert("Your cart is empty.");
        return;
      }

      alert("Thank you! Your order has been received.");
      saveCart([]);
      renderCart();
      if (cartDrawer) cartDrawer.classList.remove("open");
    });
  }
}

function openModal(productId) {
  const modal = document.getElementById("productModal");
  if (!modal) return;

  const item = products.find((product) => product.id === productId);
  if (!item) return;

  selectedProduct = item;
  modalImageIndex = 0;
  renderModalGallery(item);
  document.getElementById("modalName").textContent = item.name;
  document.getElementById("modalDesc").textContent = item.description;
  document.getElementById("modalCategory").textContent = item.category.replace("-", " ");
  document.getElementById("modalPrice").textContent = currency.format(item.price);
  modal.classList.add("show");
}

function renderModalGallery(product) {
  const images = getProductImages(product);
  const modalImage = document.getElementById("modalImage");
  const thumbs = document.getElementById("modalThumbs");
  if (!modalImage || !thumbs || !images.length) return;

  const setActiveImage = (index) => {
    modalImageIndex = index;
    modalImage.src = images[index];
    modalImage.alt = `${product.name} image ${index + 1}`;
    thumbs.querySelectorAll("button").forEach((btn, i) => {
      btn.classList.toggle("active", i === index);
    });
  };

  thumbs.innerHTML = images
    .map(
      (src, index) => `
      <button type="button" data-thumb-index="${index}" class="${index === 0 ? "active" : ""}" aria-label="View image ${index + 1}">
        <img src="${src}" alt="${product.name} thumbnail ${index + 1}" loading="lazy" />
      </button>
    `
    )
    .join("");

  thumbs.querySelectorAll("[data-thumb-index]").forEach((button) => {
    button.addEventListener("click", () => {
      setActiveImage(Number(button.dataset.thumbIndex));
    });
  });

  modalImage.onclick = () => openLightbox(images[modalImageIndex], product.name);
  setActiveImage(0);
}

function openLightbox(src, productName) {
  const lightbox = document.getElementById("imageLightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  if (!lightbox || !lightboxImage) return;

  lightboxImage.src = src;
  lightboxImage.alt = `${productName} full image`;
  lightbox.classList.add("show");
}

function closeLightbox() {
  const lightbox = document.getElementById("imageLightbox");
  if (lightbox) lightbox.classList.remove("show");
}

function closeModal() {
  const modal = document.getElementById("productModal");
  if (modal) modal.classList.remove("show");
}

function bindModal() {
  const modal = document.getElementById("productModal");
  const closeBtn = document.getElementById("closeModal");
  const addBtn = document.getElementById("modalAddToCart");
  const lightbox = document.getElementById("imageLightbox");
  const closeLightboxBtn = document.getElementById("closeLightbox");

  if (!modal) return;

  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  if (addBtn) {
    addBtn.addEventListener("click", () => {
      if (selectedProduct) {
        addToCart(selectedProduct.id);
        closeModal();
      }
    });
  }

  if (closeLightboxBtn) {
    closeLightboxBtn.addEventListener("click", closeLightbox);
  }

  if (lightbox) {
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeLightbox();
      closeModal();
    }
  });
}

function bindForms() {
  const forms = document.querySelectorAll("form[data-validate]");

  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const message = form.querySelector(".form-msg");

      if (!form.checkValidity()) {
        if (message) {
          message.textContent = "Please fill all required fields correctly.";
          message.className = "form-msg error";
        }
        form.reportValidity();
        return;
      }

      if (message) {
        message.textContent = "Thank you. Your request has been submitted successfully.";
        message.className = "form-msg success";
      }
      form.reset();
    });
  });
}

function initReveals() {
  // Lightweight scroll-reveal animation similar to AOS behavior.
  const elements = document.querySelectorAll(".reveal");
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
        }
      });
    },
    { threshold: 0.2 }
  );

  elements.forEach((el) => observer.observe(el));
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    });
  });
}

function ensureNavbarLogoMark() {
  const brand = document.querySelector(".logo");
  if (!brand) return null;

  let mark = brand.querySelector(".logo-mark");
  if (!mark) {
    mark = document.createElement("img");
    mark.className = "logo-mark";
    mark.src = "images/modern-gas-logo.png";
    mark.alt = "Modern Gas Appliances logo";
    mark.loading = "eager";
    brand.prepend(mark);
  }

  return mark;
}

function initSplashScreen() {
  const navbarLogoMark = ensureNavbarLogoMark();
  if (!navbarLogoMark) return;

  const navEntry = performance.getEntriesByType("navigation")[0];
  const isReloadNavigation =
    navEntry?.type === "reload" ||
    (performance.navigation && performance.navigation.type === 1);
  if (!isReloadNavigation && localStorage.getItem(splashSeenKey) === "1") return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const splash = document.createElement("div");
  splash.className = "splash-screen";
  splash.innerHTML = `
    <div class="splash-inner">
      <div class="splash-glow"></div>
      <img class="splash-logo" src="images/modern-gas-logo.png" alt="Modern Gas Appliances Logo" />
      <h2>Modern Gas Appliances</h2>
      <p>Retail | Wholesale | Repair | Induction</p>
      <div class="splash-bar"><span></span></div>
    </div>
  `;

  document.body.appendChild(splash);
  document.body.classList.add("splash-lock");
  if (!isReloadNavigation) localStorage.setItem(splashSeenKey, "1");

  requestAnimationFrame(() => splash.classList.add("show"));

  const splashLogo = splash.querySelector(".splash-logo");
  const visibleDuration = prefersReducedMotion ? 700 : 1700;

  setTimeout(() => {
    if (!splashLogo || prefersReducedMotion) {
      splash.classList.add("hide");
      document.body.classList.remove("splash-lock");
      setTimeout(() => splash.remove(), 450);
      return;
    }

    const from = splashLogo.getBoundingClientRect();
    const to = navbarLogoMark.getBoundingClientRect();
    const tx = to.left + to.width / 2 - (from.left + from.width / 2);
    const ty = to.top + to.height / 2 - (from.top + from.height / 2);
    const ts = Math.max(0.14, to.width / Math.max(from.width, 1));

    splashLogo.style.setProperty("--tx", `${tx}px`);
    splashLogo.style.setProperty("--ty", `${ty}px`);
    splashLogo.style.setProperty("--ts", `${ts}`);
    splash.classList.add("to-nav");

    setTimeout(() => {
      splash.classList.add("hide");
      document.body.classList.remove("splash-lock");
      setTimeout(() => splash.remove(), 420);
    }, 760);
  }, visibleDuration);
}

function init() {
  ensureNavbarLogoMark();
  initSplashScreen();
  initHeader();
  bindCart();
  renderCart();
  renderFeatured();
  renderShop();
  bindFilter();
  bindModal();
  bindForms();
  initReveals();
  initSmoothScroll();
}

document.addEventListener("DOMContentLoaded", init);
