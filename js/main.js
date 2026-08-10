(function () {
  const CART_KEY = "skiny-cart";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function money(n) {
    return `${n} ر.س`;
  }

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    updateCartCount();
    renderCart();
  }

  function cartCount() {
    return getCart().reduce((sum, item) => sum + item.qty, 0);
  }

  function updateCartCount() {
    $$("[data-cart-count]").forEach((el) => {
      el.textContent = cartCount();
      el.hidden = cartCount() === 0;
    });
  }

  function addToCart(id, qty = 1) {
    const product = PRODUCTS.find((p) => p.id === id);
    if (!product) return;
    const cart = getCart();
    const existing = cart.find((i) => i.id === id);
    if (existing) existing.qty += qty;
    else cart.push({ id, qty });
    saveCart(cart);
    toast(`تمت إضافة «${product.name}» إلى السلة`);
  }

  function setQty(id, qty) {
    let cart = getCart();
    if (qty <= 0) cart = cart.filter((i) => i.id !== id);
    else {
      const item = cart.find((i) => i.id === id);
      if (item) item.qty = qty;
    }
    saveCart(cart);
  }

  function toast(message) {
    let el = $(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add("is-visible");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("is-visible"), 2400);
  }

  function productById(id) {
    return PRODUCTS.find((p) => p.id === id);
  }

  function skinLabel(ids) {
    return ids
      .map((id) => SKIN_TYPES.find((s) => s.id === id)?.label)
      .filter(Boolean)
      .join(" · ");
  }

  function productCard(p) {
    return `
      <article class="product-card" data-product="${p.id}" data-skin="${p.skin.join(" ")}">
        <a class="product-card__media" href="product.html?id=${p.id}">
          <img src="${p.image}" alt="${p.name}" width="640" height="640" loading="lazy">
        </a>
        <div class="product-card__body">
          <span class="badge">${skinLabel(p.skin)}</span>
          <h3><a href="product.html?id=${p.id}">${p.name}</a></h3>
          <p>${p.short}</p>
          <div class="price">${money(p.price)} <small>/ العبوة</small></div>
          <div class="card-actions">
            <button class="btn btn--primary btn--sm" type="button" data-add="${p.id}">إضافة للسلة</button>
            <a class="btn btn--ghost btn--sm" href="product.html?id=${p.id}">عرض التفاصيل</a>
          </div>
        </div>
      </article>
    `;
  }

  function articleCard(a) {
    return `
      <article class="article-card">
        <a class="article-card__media" href="article.html?id=${a.id}">
          <img src="${a.image}" alt="" width="800" height="500" loading="lazy">
        </a>
        <div class="article-card__body">
          <span class="badge">${a.date} · ${a.readTime}</span>
          <h3><a href="article.html?id=${a.id}">${a.title}</a></h3>
          <p>${a.excerpt}</p>
          <a class="btn btn--ghost btn--sm" href="article.html?id=${a.id}">اقرأ المزيد</a>
        </div>
      </article>
    `;
  }

  function renderFeatured() {
    const root = $("[data-featured]");
    if (!root) return;
    root.innerHTML = PRODUCTS.filter((p) => p.featured)
      .slice(0, 4)
      .map((p) => productCard(p))
      .join("");
  }

  function renderCatalog() {
    const root = $("[data-catalog]");
    if (!root) return;
    root.innerHTML = PRODUCTS.map((p) => productCard(p)).join("");
    bindFilters();
  }

  function bindFilters() {
    const buttons = $$("[data-filter]");
    const cards = $$("[data-catalog] .product-card");
    const empty = $("[data-empty]");

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        const type = btn.dataset.filter;
        let visible = 0;
        cards.forEach((card) => {
          const match = type === "all" || card.dataset.skin.includes(type);
          card.classList.toggle("is-hidden", !match);
          if (match) visible += 1;
        });
        empty?.classList.toggle("is-visible", visible === 0);
      });
    });
  }

  function renderHomeArticles() {
    const root = $("[data-home-articles]");
    if (!root) return;
    root.innerHTML = ARTICLES.slice(0, 3).map(articleCard).join("");
  }

  function renderBlog() {
    const root = $("[data-blog]");
    if (!root) return;
    root.innerHTML = ARTICLES.map(articleCard).join("");
  }

  function renderArticlePage() {
    const root = $("[data-article]");
    if (!root) return;
    const id = new URLSearchParams(location.search).get("id");
    const article = ARTICLES.find((a) => a.id === id) || ARTICLES[0];
    document.title = `${article.title} |سكني`;
    root.innerHTML = `
      <div class="article-meta">
        <span>${article.date}</span>
        <span>${article.readTime} قراءة</span>
      </div>
      <h1>${article.title}</h1>
      <div class="article-cover">
        <img src="${article.image}" alt="" width="1200" height="675">
      </div>
      <div class="article-body">
        ${article.body.map((p) => `<p>${p}</p>`).join("")}
      </div>
    `;
  }

  function renderTestimonials() {
    const root = $("[data-reviews]");
    if (!root) return;
    root.innerHTML = TESTIMONIALS.map((t) => {
      const initial = t.name.trim().charAt(0);
      const stars = "★★★★★".slice(0, t.rating) + "☆☆☆☆☆".slice(t.rating);
      return `
        <blockquote class="review-card">
          <div class="stars" aria-label="التقييم ${t.rating} من 5">${stars}</div>
          <p>«${t.text}»</p>
          <footer>
            <div class="avatar" aria-hidden="true">${initial}</div>
            <div>
              <strong>${t.name}</strong>
              <span class="muted">${t.city}</span>
            </div>
          </footer>
        </blockquote>
      `;
    }).join("");
  }

  function openDrawer(sel) {
    $(sel)?.classList.add("is-open");
    $("[data-drawer-overlay]")?.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeDrawers() {
    $$(".cart-drawer, .mobile-nav, .nav-overlay, .drawer-overlay, .modal").forEach((el) => {
      el.classList.remove("is-open");
    });
    document.body.style.overflow = "";
  }

  function renderCart() {
    const list = $("[data-cart-list]");
    const totalEl = $("[data-cart-total]");
    if (!list) return;
    const cart = getCart();
    if (!cart.length) {
      list.innerHTML = `<p class="cart-empty">سلتك فارغة حالياً. تسوّقي منتجات العناية لتبدئي طلبكِ.</p>`;
      if (totalEl) totalEl.textContent = money(0);
      return;
    }
    let total = 0;
    list.innerHTML = cart
      .map((item) => {
        const p = productById(item.id);
        if (!p) return "";
        total += p.price * item.qty;
        return `
          <div class="cart-item">
            <img src="${p.image}" alt="" width="80" height="80">
            <div>
              <h4>${p.name}</h4>
              <div class="muted">${money(p.price)}</div>
              <div class="qty">
                <button type="button" data-qty="${p.id}" data-delta="-1" aria-label="إنقاص">−</button>
                <span>${item.qty}</span>
                <button type="button" data-qty="${p.id}" data-delta="1" aria-label="زيادة">+</button>
              </div>
            </div>
            <button type="button" class="icon-btn" data-remove="${p.id}" aria-label="حذف">✕</button>
          </div>
        `;
      })
      .join("");
    if (totalEl) totalEl.textContent = money(total);
  }

  function renderProductPage() {
    const root = $("[data-product-page]");
    if (!root) return;
    const id = new URLSearchParams(location.search).get("id");
    const p = productById(id) || PRODUCTS[0];
    document.title = `${p.name} | سكني`;
    const related = PRODUCTS.filter(
      (item) => item.id !== p.id && item.skin.some((s) => p.skin.includes(s))
    ).slice(0, 3);

    root.innerHTML = `
      <nav class="breadcrumb" aria-label="مسار التنقل">
        <a href="index.html">الرئيسية</a>
        <span>/</span>
        <a href="products.html">المنتجات</a>
        <span>/</span>
        <span>${p.name}</span>
      </nav>
      <div class="product-detail">
        <div class="product-detail__media">
          <img src="${p.image}" alt="${p.name}" width="900" height="700">
        </div>
        <div class="product-detail__info">
          <span class="badge">${skinLabel(p.skin)}</span>
          <h1>${p.name}</h1>
          <p class="product-rating">★ ${p.rating} <span class="muted">(${p.reviewsCount} تقييم)</span></p>
          <p class="muted">${p.description}</p>
          <p class="price product-detail__price">${money(p.price)} <small>/ ${p.volume}</small></p>
          <dl class="specs">
            <div><dt>الحجم</dt><dd>${p.volume}</dd></div>
            <div><dt>نوع البشرة</dt><dd>${skinLabel(p.skin)}</dd></div>
          </dl>
          <div class="pdp-actions">
            <div class="qty-box">
              <button type="button" data-pdp-delta="-1" aria-label="إنقاص">−</button>
              <input id="pdp-qty" data-pdp-qty type="number" min="1" value="1" aria-label="الكمية">
              <button type="button" data-pdp-delta="1" aria-label="زيادة">+</button>
            </div>
            <button class="btn btn--primary" type="button" data-pdp-add="${p.id}">إضافة للسلة / طلب المنتج</button>
          </div>
          <section class="pdp-block">
            <h2>الفوائد</h2>
            <ul class="benefits-list">${p.benefits.map((b) => `<li>${b}</li>`).join("")}</ul>
          </section>
          <section class="pdp-block">
            <h2>المكونات</h2>
            <div class="chips">${p.ingredients.map((i) => `<span class="chip">${i}</span>`).join("")}</div>
          </section>
          <section class="pdp-block">
            <h2>طريقة الاستخدام</h2>
            <p class="muted">${p.howToUse}</p>
          </section>
        </div>
      </div>
      ${
        related.length
          ? `<section class="section" style="padding-bottom:0">
              <div class="section__head"><h2>منتجات مشابهة</h2></div>
              <div class="grid grid--3">${related.map(productCard).join("")}</div>
            </section>`
          : ""
      }
    `;

    $$("[data-pdp-delta]", root).forEach((btn) => {
      btn.addEventListener("click", () => {
        const input = $("[data-pdp-qty]", root);
        const next = Math.max(1, Number(input.value || 1) + Number(btn.dataset.pdpDelta));
        input.value = next;
      });
    });

    $("[data-pdp-add]", root)?.addEventListener("click", () => {
      const qty = Math.max(1, Number($("[data-pdp-qty]", root)?.value || 1));
      addToCart(p.id, qty);
    });
  }

  function bindUI() {
    $("[data-open-menu]")?.addEventListener("click", () => {
      $(".mobile-nav")?.classList.add("is-open");
      $(".nav-overlay")?.classList.add("is-open");
      document.body.style.overflow = "hidden";
    });

    $("[data-open-cart]")?.addEventListener("click", () => {
      renderCart();
      openDrawer(".cart-drawer");
    });

    $$("[data-close]").forEach((btn) => btn.addEventListener("click", closeDrawers));
    $(".nav-overlay")?.addEventListener("click", closeDrawers);
    $("[data-drawer-overlay]")?.addEventListener("click", closeDrawers);
    $("[data-modal-backdrop]")?.addEventListener("click", closeDrawers);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeDrawers();
    });

    document.addEventListener("click", (e) => {
      const add = e.target.closest("[data-add]");
      if (add) {
        addToCart(add.dataset.add);
        return;
      }
      const remove = e.target.closest("[data-remove]");
      if (remove) {
        setQty(remove.dataset.remove, 0);
        return;
      }
      const qtyBtn = e.target.closest("[data-qty]");
      if (qtyBtn) {
        const item = getCart().find((i) => i.id === qtyBtn.dataset.qty);
        if (!item) return;
        setQty(item.id, item.qty + Number(qtyBtn.dataset.delta));
      }
    });

    $("[data-checkout]")?.addEventListener("click", () => {
      if (!getCart().length) {
        toast("أضيفي منتجاً أولاً لإتمام الطلب");
        return;
      }
      localStorage.removeItem(CART_KEY);
      updateCartCount();
      renderCart();
      closeDrawers();
      toast("تم استلام طلبكِ بنجاح — سنتواصل معكِ قريباً");
    });
  }

  function bindContactForm() {
    const form = $("[data-contact-form]");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.elements.name;
      const email = form.elements.email;
      const message = form.elements.message;
      let ok = true;

      [
        [name, name.value.trim().length >= 2],
        [email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())],
        [message, message.value.trim().length >= 8],
      ].forEach(([input, valid]) => {
        input.closest(".field").classList.toggle("is-invalid", !valid);
        if (!valid) ok = false;
      });

      if (!ok) return;
      form.reset();
      $$(".field.is-invalid", form).forEach((f) => f.classList.remove("is-invalid"));
      $("[data-form-success]")?.classList.add("is-visible");
    });
  }

  function markActiveNav() {
    const page = document.body.dataset.page;
    $$(`[data-nav="${page}"]`).forEach((a) => a.classList.add("is-active"));
  }

  document.addEventListener("DOMContentLoaded", () => {
    markActiveNav();
    renderFeatured();
    renderCatalog();
    renderHomeArticles();
    renderBlog();
    renderArticlePage();
    renderProductPage();
    renderTestimonials();
    bindUI();
    bindContactForm();
    updateCartCount();
    renderCart();
  });
})();
