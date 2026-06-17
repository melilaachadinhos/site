const storeOrderPhone = "5541984684382";

let products = [];

const fallbackProducts = [];
const imageBySku = {};
let productsCsvSignature = "";
const reviewsStorageKey = "meli-la-product-reviews-v1";

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  const [headers = [], ...dataRows] = rows;
  return dataRows.map((items) =>
    Object.fromEntries(
      headers.map((header, index) => [normalizeHeader(header), items[index] || ""])
    )
  );
}

function normalizeHeader(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/(^_|_$)/g, "");
}

function parseNumber(value) {
  const normalized = String(value || "")
    .replace(/[R$\s%]/g, "")
    .trim();
  const parsed = Number(
    normalized.includes(",")
      ? normalized.replace(/\./g, "").replace(",", ".")
      : normalized
  );
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeCategory(category) {
  const value = String(category || "Achadinhos").trim();
  const aliases = {
    Organizacao: "Organização",
    tecnologia: "Tech",
    Tecnologia: "Tech"
  };
  return aliases[value] || value;
}

function cleanProductText(value) {
  return String(value || "")
    .replace(/aliexpress/gi, "")
    .replace(/choice/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function imageFromRow(row) {
  const csvImage =
    row.foto_url ||
    row.imagem ||
    row.image ||
    row.foto ||
    row.foto_produto ||
    "";
  const unsafeImage = /logo|sprite/i.test(csvImage);
  return safeImageUrl(
    unsafeImage ? imageBySku[row.sku] : csvImage || imageBySku[row.sku] || "assets/img/meli-la-logo.png"
  );
}

function mapCsvProduct(row, index) {
  const name = cleanProductText(
    row.produto_site ||
      row.nome_limpo_site ||
      row.produto_capturado ||
      row.produto_aliexpress ||
      row.produto ||
      row.nome ||
      ""
  );
  const sku = row.sku || row.sku_base || `MLA-CSV-${String(index + 1).padStart(3, "0")}`;
  return {
    id: slugify(sku || name) || `csv-${index + 1}`,
    name: name || "Produto sem nome",
    category: normalizeCategory(row.categoria),
    tag: normalizeCategory(row.categoria),
    price: parseNumber(row.preco_venda_brl || row.preco_venda || row.preco || row.valor),
    cost: parseNumber(
      row.custo_alvo_brl ||
        row.custo_total_brl ||
        row.custo ||
        row.preco_fornecedor_brl ||
        row.preco_fornecedor
    ),
    margin: row.margem_alvo || row.margem || row.margem_percentual || "",
    rating: parseNumber(row.avaliacao),
    reviews: parseNumber(row.pedidos) || 0,
    sku,
    image: imageFromRow(row),
    description:
      cleanProductText(row.observacoes || row.descricao || row.description) ||
      "Produto selecionado para a vitrine da loja."
  };
}

async function loadProductsFromCsv() {
  try {
    const response = await fetch(`controle-produtos-manual.csv?v=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error("CSV indisponivel");

    const csvText = await response.text();
    const nextSignature = csvText.trim();
    if (nextSignature === productsCsvSignature) return false;

    const csvProducts = parseCsv(csvText)
      .filter(
        (row) =>
          row.produto_site ||
          row.nome_limpo_site ||
          row.produto_capturado ||
          row.produto ||
          row.nome
      )
      .map(mapCsvProduct)
      .filter((product) => product.name && product.price > 0);

    if (csvProducts.length) {
      products = csvProducts;
      productsCsvSignature = nextSignature;
      return true;
    }
  } catch (error) {
    if (!products.length) products = fallbackProducts;
  }
  return false;
}

const state = {
  category: "Todos",
  search: "",
  sort: "featured",
  cart: []
};

const formatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

const productGrid = document.querySelector("#productGrid");
const categoryTabs = document.querySelector("#categoryTabs");
const searchInput = document.querySelector("#searchInput");
const sortSelect = document.querySelector("#sortSelect");
const cartDrawer = document.querySelector("#cartDrawer");
const cartItems = document.querySelector("#cartItems");
const cartEmpty = document.querySelector("#cartEmpty");
const cartSubtotal = document.querySelector("#cartSubtotal");
const cartCount = document.querySelector("#cartCount");
const quickView = document.querySelector("#quickView");
const checkoutView = document.querySelector("#checkoutView");
const manualCheckoutForm = document.querySelector("#manualCheckoutForm");
const orderResult = document.querySelector("#orderResult");
const reviewView = document.querySelector("#reviewView");
const reviewForm = document.querySelector("#reviewForm");
const reviewList = document.querySelector("#reviewList");
const reviewProductId = document.querySelector("#reviewProductId");
const reviewProductName = document.querySelector("#reviewProductName");
const heroProductImage = document.querySelector("#heroProductImage");
const heroProductTitle = document.querySelector("#heroProductTitle");
const heroProductDescription = document.querySelector("#heroProductDescription");
const heroProductPrice = document.querySelector("#heroProductPrice");
const proofProductCount = document.querySelector("#proofProductCount");
const proofRating = document.querySelector("#proofRating");
const dateFormatter = new Intl.DateTimeFormat("pt-BR");

function money(value) {
  return formatter.format(value);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeImageUrl(value) {
  const url = String(value || "").trim();
  if (/^(https?:)?\/\//i.test(url) || /^assets\//i.test(url)) return url;
  return "assets/img/meli-la-logo.png";
}

function readReviewStore() {
  try {
    return JSON.parse(localStorage.getItem(reviewsStorageKey)) || {};
  } catch (error) {
    return {};
  }
}

function writeReviewStore(store) {
  try {
    localStorage.setItem(reviewsStorageKey, JSON.stringify(store));
  } catch (error) {
    return false;
  }
  return true;
}

function getProductReviews(productId) {
  const store = readReviewStore();
  return Array.isArray(store[productId]) ? store[productId] : [];
}

function getReviewStats(product) {
  const userReviews = getProductReviews(product.id);
  const baseCount = Number(product.reviews) || 0;
  const baseRating = Number(product.rating) || 0;
  const baseTotal = baseCount && baseRating ? baseRating * baseCount : 0;
  const userTotal = userReviews.reduce(
    (total, review) => total + (Number(review.rating) || 0),
    0
  );
  const count = baseCount + userReviews.length;

  return {
    rating: count ? (baseTotal + userTotal) / count : 0,
    count,
    userCount: userReviews.length
  };
}

function formatReviewCount(count) {
  if (!count) return "Sem avalia\u00e7\u00f5es";
  return `${count} ${count === 1 ? "avalia\u00e7\u00e3o" : "avalia\u00e7\u00f5es"}`;
}

function formatRatingLabel(stats) {
  return stats.count ? `${stats.rating.toFixed(1)} / 5` : "Novo";
}

function getCategories() {
  return ["Todos", ...new Set(products.map((product) => product.category))];
}

function renderCategories() {
  categoryTabs.innerHTML = getCategories()
    .map(
      (category) => `
        <button class="tab-button ${category === state.category ? "active" : ""}" type="button" data-category="${category}">
          ${category}
        </button>
      `
    )
    .join("");
}

function getFilteredProducts() {
  const term = state.search.trim().toLowerCase();
  const filtered = products.filter((product) => {
    const matchesCategory = state.category === "Todos" || product.category === state.category;
    const matchesSearch = [product.name, product.category, product.sku, product.description]
      .join(" ")
      .toLowerCase()
      .includes(term);
    return matchesCategory && matchesSearch;
  });

  return filtered.sort((a, b) => {
    if (state.sort === "price-asc") return a.price - b.price;
    if (state.sort === "price-desc") return b.price - a.price;
    if (state.sort === "rating") return getReviewStats(b).rating - getReviewStats(a).rating;
    return products.indexOf(a) - products.indexOf(b);
  });
}

function updateStoreHighlights() {
  if (proofProductCount) proofProductCount.textContent = String(products.length);

  const reviewed = products.map(getReviewStats).filter((stats) => stats.count);
  if (proofRating) {
    const totalRating = reviewed.reduce((total, stats) => total + stats.rating, 0);
    proofRating.textContent = reviewed.length
      ? (totalRating / reviewed.length).toFixed(1)
      : "Novo";
  }

  const featured = products[0];
  if (!featured) return;

  if (heroProductImage) {
    heroProductImage.src = safeImageUrl(featured.image);
    heroProductImage.alt = featured.name;
  }
  if (heroProductTitle) heroProductTitle.textContent = featured.name;
  if (heroProductDescription) heroProductDescription.textContent = featured.description;
  if (heroProductPrice) heroProductPrice.textContent = money(featured.price);
}

function renderProducts() {
  const filteredProducts = getFilteredProducts();

  if (!filteredProducts.length) {
    productGrid.innerHTML = `
      <article class="product-card">
        <div class="product-body">
          <p class="product-kicker">Sem resultados</p>
          <h3 class="product-title">Nenhum produto encontrado</h3>
          <p class="product-description">Tente outro termo de busca ou categoria.</p>
        </div>
      </article>
    `;
    return;
  }

  productGrid.innerHTML = filteredProducts
    .map(
      (product) => {
        const stats = getReviewStats(product);
        const safeId = escapeHtml(product.id);
        const safeName = escapeHtml(product.name);
        const safeCategory = escapeHtml(product.category);
        const safeSku = escapeHtml(product.sku);
        const safeTag = escapeHtml(product.tag);
        const safeImage = escapeHtml(safeImageUrl(product.image));
        const safeDescription = escapeHtml(product.description);
        return `
        <article class="product-card">
          <div class="product-image">
            <span class="badge">${safeTag}</span>
            <img src="${safeImage}" alt="${safeName}" />
          </div>
          <div class="product-body">
            <span class="product-kicker">${safeCategory} · ${safeSku}</span>
            <h3 class="product-title">${safeName}</h3>
            <p class="product-description">${safeDescription}</p>
            <div class="rating-row">
              <span>${formatRatingLabel(stats)}</span>
              <span>${formatReviewCount(stats.count)}</span>
            </div>
            <div class="price-row">
              <div>
                <strong>${money(product.price)}</strong>
                <span>Preço final</span>
              </div>
            </div>
            <div class="stock-row">
              <span>Pedido acompanhado</span>
              <span>Produto selecionado</span>
            </div>
          </div>
          <div class="product-actions">
            <button class="button primary" type="button" data-add="${safeId}">Adicionar</button>
            <button class="quick-button" type="button" data-quick="${safeId}" aria-label="Ver detalhes de ${safeName}">Ver</button>
            <button class="quick-button review-button" type="button" data-review="${safeId}" aria-label="Avaliar ${safeName}">Avaliar</button>
          </div>
        </article>
      `;
      }
    )
    .join("");
}

function addToCart(productId) {
  const found = state.cart.find((item) => item.id === productId);
  if (found) {
    found.quantity += 1;
  } else {
    state.cart.push({ id: productId, quantity: 1 });
  }
  renderCart();
  openCart();
}

function changeQuantity(productId, amount) {
  const found = state.cart.find((item) => item.id === productId);
  if (!found) return;
  found.quantity += amount;
  if (found.quantity <= 0) {
    state.cart = state.cart.filter((item) => item.id !== productId);
  }
  renderCart();
}

function removeItem(productId) {
  state.cart = state.cart.filter((item) => item.id !== productId);
  renderCart();
}

function getCartProduct(item) {
  return products.find((product) => product.id === item.id);
}

function getSubtotal() {
  return state.cart.reduce((total, item) => {
    const product = getCartProduct(item);
    return total + product.price * item.quantity;
  }, 0);
}

function renderCart() {
  state.cart = state.cart.filter((item) => getCartProduct(item));
  const totalQuantity = state.cart.reduce((total, item) => total + item.quantity, 0);
  cartCount.textContent = totalQuantity;
  cartSubtotal.textContent = money(getSubtotal());
  cartEmpty.style.display = state.cart.length ? "none" : "grid";
  cartItems.style.display = state.cart.length ? "grid" : "none";

  cartItems.innerHTML = state.cart
    .map((item) => {
      const product = getCartProduct(item);
      const safeName = escapeHtml(product.name);
      const safeSku = escapeHtml(product.sku);
      const safeImage = escapeHtml(safeImageUrl(product.image));
      const safeId = escapeHtml(product.id);
      return `
        <article class="cart-item">
          <img src="${safeImage}" alt="${safeName}" />
          <div>
            <h3>${safeName}</h3>
            <p>${safeSku}</p>
            <strong>${money(product.price * item.quantity)}</strong>
            <div class="quantity-row">
              <div class="stepper" aria-label="Quantidade">
                <button type="button" data-quantity="${safeId}" data-amount="-1">-</button>
                <span>${item.quantity}</span>
                <button type="button" data-quantity="${safeId}" data-amount="1">+</button>
              </div>
              <button class="remove-item" type="button" data-remove="${safeId}">Remover</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function openCart() {
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("drawer-open");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("drawer-open");
}

function openQuickView(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;
  const stats = getReviewStats(product);
  document.querySelector("#quickImage").src = safeImageUrl(product.image);
  document.querySelector("#quickImage").alt = product.name;
  document.querySelector("#quickSku").textContent = product.sku;
  document.querySelector("#quickTitle").textContent = product.name;
  document.querySelector("#quickDescription").textContent = product.description;
  document.querySelector("#quickRating").textContent = `${formatRatingLabel(stats)} · ${formatReviewCount(stats.count)}`;
  document.querySelector("#quickMargin").textContent = "Produto selecionado";
  document.querySelector("#quickPrice").textContent = money(product.price);
  document.querySelector("#quickAdd").dataset.add = product.id;
  quickView.classList.add("open");
  quickView.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeQuickView() {
  quickView.classList.remove("open");
  quickView.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function renderReviewList(product) {
  if (!reviewList) return;
  const reviews = getProductReviews(product.id);
  const stats = getReviewStats(product);

  reviewList.innerHTML = `
    <div class="review-summary">
      <strong>${formatRatingLabel(stats)}</strong>
      <span>${formatReviewCount(stats.count)}</span>
    </div>
    ${
      reviews.length
        ? reviews
            .map(
              (review) => `
                <article class="review-item">
                  <div>
                    <strong>${escapeHtml(review.name || "Cliente")}</strong>
                    <span>${Number(review.rating).toFixed(1)} / 5 · ${escapeHtml(dateFormatter.format(new Date(review.date)))}</span>
                  </div>
                  <p>${escapeHtml(review.comment)}</p>
                </article>
              `
            )
            .join("")
        : '<p class="empty-reviews">Ainda não há avaliações deste produto.</p>'
    }
  `;
}

function openReviewView(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product || !reviewView || !reviewForm) return;

  reviewForm.reset();
  reviewProductId.value = product.id;
  reviewProductName.textContent = `${product.name} · ${product.sku}`;
  renderReviewList(product);
  reviewView.classList.add("open");
  reviewView.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeReviewView() {
  if (!reviewView) return;
  reviewView.classList.remove("open");
  reviewView.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function openCheckout() {
  if (!state.cart.length) return;
  checkoutView.classList.add("open");
  checkoutView.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeCheckout() {
  checkoutView.classList.remove("open");
  checkoutView.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function getCartSummaryLines() {
  return state.cart.map((item) => {
    const product = getCartProduct(item);
    return `${item.quantity}x ${product.name} (${product.sku}) - ${money(product.price * item.quantity)}`;
  });
}

function buildStoreOrderMessage(orderId, data) {
  return [
    `Olá, quero finalizar meu pedido meli.la achadinhos: ${orderId}`,
    "",
    `Cliente: ${data.name}`,
    `E-mail: ${data.email}`,
    `WhatsApp: ${data.phone}`,
    `Entrega: ${data.address}, ${data.city} - ${data.state}, CEP ${data.zip}`,
    data.notes ? `Complemento: ${data.notes}` : "",
    "",
    "Itens:",
    ...getCartSummaryLines(),
    "",
    `Total: ${money(getSubtotal())}`,
    "",
    "Por favor, confirme prazo estimado e próximos passos."
  ]
    .filter(Boolean)
    .join("\n");
}

function submitManualOrder(event) {
  event.preventDefault();
  const items = state.cart
    .map((item) => {
      const product = getCartProduct(item);
      return `- ${item.quantity}x ${product.name} (${product.sku}) ${money(product.price * item.quantity)}`;
    })
    .join("\n");
  const data = Object.fromEntries(new FormData(manualCheckoutForm).entries());
  const orderId = `MLA-${Date.now().toString().slice(-6)}`;
  const address = `${data.address}, ${data.city} - ${data.state}, CEP ${data.zip}`;
  const safeItems = escapeHtml(items).replace(/\n/g, "<br>");
  const storeMessage = buildStoreOrderMessage(orderId, data);
  const storeOrderUrl = `https://wa.me/${storeOrderPhone}?text=${encodeURIComponent(storeMessage)}`;

  orderResult.classList.add("show");
  orderResult.innerHTML = `
    <strong>Resumo do pedido ${orderId} gerado.</strong>
    <span>Cliente: ${escapeHtml(data.name)} · ${escapeHtml(data.email)} · ${escapeHtml(data.phone)}</span>
    <span>Entrega: ${escapeHtml(address)}</span>
    <span>Itens:<br>${safeItems}</span>
    <span>Total do pedido: ${money(getSubtotal())}</span>
    <a class="order-whatsapp" href="${storeOrderUrl}" target="_blank" rel="noopener">Enviar pedido para atendimento</a>
    <span>Após enviar, nossa equipe confirma prazo estimado e acompanhamento do pedido pelo WhatsApp.</span>
  `;

}

function submitReview(event) {
  event.preventDefault();
  if (!reviewForm || !reviewProductId) return;

  const data = new FormData(reviewForm);
  const productId = reviewProductId.value;
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  const rating = Math.min(5, Math.max(1, Number(data.get("rating")) || 5));
  const name = cleanProductText(data.get("name")).slice(0, 40) || "Cliente";
  const comment = cleanProductText(data.get("comment")).slice(0, 240);
  if (!comment) return;

  const store = readReviewStore();
  const productReviews = Array.isArray(store[productId]) ? store[productId] : [];
  store[productId] = [
    {
      rating,
      name,
      comment,
      date: new Date().toISOString()
    },
    ...productReviews
  ].slice(0, 40);

  if (!writeReviewStore(store)) return;

  reviewForm.reset();
  reviewProductId.value = productId;
  renderReviewList(product);
  renderProducts();
  updateStoreHighlights();
}

document.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  const quickButton = event.target.closest("[data-quick]");
  const reviewButton = event.target.closest("[data-review]");
  const categoryButton = event.target.closest("[data-category]");
  const quantityButton = event.target.closest("[data-quantity]");
  const removeButton = event.target.closest("[data-remove]");
  const closeModal = event.target.closest("[data-close-modal]");
  const closeCheckoutButton = event.target.closest("[data-close-checkout]");
  const closeReviewButton = event.target.closest("[data-close-review]");

  if (addButton) addToCart(addButton.dataset.add);
  if (quickButton) openQuickView(quickButton.dataset.quick);
  if (reviewButton) openReviewView(reviewButton.dataset.review);
  if (categoryButton) {
    state.category = categoryButton.dataset.category;
    renderCategories();
    renderProducts();
  }
  if (quantityButton) {
    changeQuantity(quantityButton.dataset.quantity, Number(quantityButton.dataset.amount));
  }
  if (removeButton) removeItem(removeButton.dataset.remove);
  if (closeModal) closeQuickView();
  if (closeCheckoutButton) closeCheckout();
  if (closeReviewButton) closeReviewView();
});

searchInput.addEventListener("input", (event) => {
  state.search = event.target.value;
  renderProducts();
});

sortSelect.addEventListener("change", (event) => {
  state.sort = event.target.value;
  renderProducts();
});

document.querySelector("#openCart").addEventListener("click", openCart);
document.querySelector("#closeCart").addEventListener("click", closeCart);
document.querySelector("#closeCartBackdrop").addEventListener("click", closeCart);
document.querySelector("#checkoutButton").addEventListener("click", openCheckout);
manualCheckoutForm.addEventListener("submit", submitManualOrder);
if (reviewForm) reviewForm.addEventListener("submit", submitReview);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCart();
    closeQuickView();
    closeCheckout();
    closeReviewView();
  }
});

async function initStore() {
  await loadProductsFromCsv();
  renderCategories();
  renderProducts();
  updateStoreHighlights();
  renderCart();
}

async function refreshProductsFromCsv() {
  const changed = await loadProductsFromCsv();
  if (!changed) return;

  if (!getCategories().includes(state.category)) {
    state.category = "Todos";
  }

  renderCategories();
  renderProducts();
  updateStoreHighlights();
  renderCart();
}

initStore();

setInterval(refreshProductsFromCsv, 60000);
window.addEventListener("focus", refreshProductsFromCsv);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) refreshProductsFromCsv();
});
