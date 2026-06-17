const storeOrderPhone = "5541984684382";

let products = [
  {
    id: "freshgo",
    name: "Liquidificador Portátil USB 380 ml",
    category: "Casa",
    tag: "Portátil",
    price: 89.9,
    cost: 42,
    margin: "53%",
    rating: 4.9,
    reviews: 342,
    sku: "MLA-MAN-FRESHGO-01",
    image: "assets/img/product-freshgo.svg",
    description:
      "Copo leve com carregamento USB para vitaminas, shakes e bebidas rápidas fora de casa."
  },
  {
    id: "glowcare",
    name: "Escova Facial Elétrica de Silicone",
    category: "Beleza",
    tag: "Cuidados",
    price: 119.9,
    cost: 56,
    margin: "53%",
    rating: 4.8,
    reviews: 221,
    sku: "MLA-MAN-GLOWCARE-02",
    image: "assets/img/product-glowcare.svg",
    description:
      "Acessório compacto para limpeza facial, massagem suave e rotina de skincare mais prática."
  },
  {
    id: "flow-bottle",
    name: "Garrafa Térmica Inox 1L com Alça",
    category: "Casa",
    tag: "Dia a dia",
    price: 79.9,
    cost: 37,
    margin: "54%",
    rating: 4.7,
    reviews: 418,
    sku: "MLA-MAN-FLOW-03",
    image: "assets/img/product-flow-bottle.svg",
    description:
      "Modelo com tampa, alça e acabamento fosco para trabalho, estudos, academia e viagem."
  },
  {
    id: "fitbox",
    name: "Caixa Organizadora Dobrável com Tampa",
    category: "Organização",
    tag: "Organização",
    price: 64.9,
    cost: 29,
    margin: "55%",
    rating: 4.6,
    reviews: 164,
    sku: "MLA-MAN-FITBOX-04",
    image: "assets/img/product-fitbox.svg",
    description:
      "Caixa versátil para armário, lavanderia, quarto infantil e pequenos objetos do dia a dia."
  },
  {
    id: "airbeat",
    name: "Fone Bluetooth Sem Fio com Estojo",
    category: "Tech",
    tag: "Bluetooth",
    price: 99.9,
    cost: 48,
    margin: "52%",
    rating: 4.8,
    reviews: 536,
    sku: "MLA-MAN-AIRBEAT-05",
    image: "assets/img/product-airbeat.svg",
    description:
      "Fone compacto com estojo carregador para música, chamadas e uso diário no celular."
  },
  {
    id: "moonmist",
    name: "Umidificador de Ar USB com LED",
    category: "Casa",
    tag: "Ambiente",
    price: 74.9,
    cost: 34,
    margin: "55%",
    rating: 4.7,
    reviews: 289,
    sku: "MLA-MAN-MOONMIST-06",
    image: "assets/img/product-moonmist.svg",
    description:
      "Modelo decorativo para mesa, quarto ou escritório, com luz LED e alimentação via USB."
  },
  {
    id: "magstand",
    name: "Suporte Magnético 360 para Celular",
    category: "Tech",
    tag: "Ajuste 360",
    price: 54.9,
    cost: 23,
    margin: "58%",
    rating: 4.6,
    reviews: 193,
    sku: "MLA-MAN-MAGSTAND-07",
    image: "assets/img/product-magstand.svg",
    description:
      "Suporte ajustável para celular, ideal para mesa, carro, chamadas de vídeo e gravações."
  },
  {
    id: "petflow",
    name: "Fonte Bebedouro Automático para Pets",
    category: "Pets",
    tag: "Pets",
    price: 149.9,
    cost: 72,
    margin: "52%",
    rating: 4.9,
    reviews: 147,
    sku: "MLA-MAN-PETFLOW-08",
    image: "assets/img/product-petflow.svg",
    description:
      "Bebedouro com circulação contínua para manter a água do pet mais atrativa durante o dia."
  }
];

const fallbackProducts = products.map((product) => ({ ...product }));
const imageBySku = Object.fromEntries(
  fallbackProducts.map((product) => [product.sku, product.image])
);
let productsCsvSignature = "";

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
  return unsafeImage ? imageBySku[row.sku] : csvImage || imageBySku[row.sku] || "assets/img/product-freshgo.svg";
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
    rating: parseNumber(row.avaliacao) || 4.8,
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
    if (state.sort === "rating") return b.rating - a.rating;
    return products.indexOf(a) - products.indexOf(b);
  });
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
      (product) => `
        <article class="product-card">
          <div class="product-image">
            <span class="badge">${product.tag}</span>
            <img src="${product.image}" alt="${product.name}" />
          </div>
          <div class="product-body">
            <span class="product-kicker">${product.category} · ${product.sku}</span>
            <h3 class="product-title">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="rating-row">
              <span>${product.rating.toFixed(1)} / 5</span>
              <span>${product.reviews} avaliações</span>
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
            <button class="button primary" type="button" data-add="${product.id}">Adicionar</button>
            <button class="quick-button" type="button" data-quick="${product.id}" aria-label="Ver detalhes de ${product.name}">Ver</button>
          </div>
        </article>
      `
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
      return `
        <article class="cart-item">
          <img src="${product.image}" alt="${product.name}" />
          <div>
            <h3>${product.name}</h3>
            <p>${product.sku}</p>
            <strong>${money(product.price * item.quantity)}</strong>
            <div class="quantity-row">
              <div class="stepper" aria-label="Quantidade">
                <button type="button" data-quantity="${product.id}" data-amount="-1">-</button>
                <span>${item.quantity}</span>
                <button type="button" data-quantity="${product.id}" data-amount="1">+</button>
              </div>
              <button class="remove-item" type="button" data-remove="${product.id}">Remover</button>
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
  document.querySelector("#quickImage").src = product.image;
  document.querySelector("#quickImage").alt = product.name;
  document.querySelector("#quickSku").textContent = product.sku;
  document.querySelector("#quickTitle").textContent = product.name;
  document.querySelector("#quickDescription").textContent = product.description;
  document.querySelector("#quickRating").textContent = `${product.rating.toFixed(1)} / 5 · ${product.reviews} avaliações`;
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
  const safeItems = items.replace(/\n/g, "<br>");
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

document.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  const quickButton = event.target.closest("[data-quick]");
  const categoryButton = event.target.closest("[data-category]");
  const quantityButton = event.target.closest("[data-quantity]");
  const removeButton = event.target.closest("[data-remove]");
  const closeModal = event.target.closest("[data-close-modal]");
  const closeCheckoutButton = event.target.closest("[data-close-checkout]");

  if (addButton) addToCart(addButton.dataset.add);
  if (quickButton) openQuickView(quickButton.dataset.quick);
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

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCart();
    closeQuickView();
    closeCheckout();
  }
});

async function initStore() {
  await loadProductsFromCsv();
  renderCategories();
  renderProducts();
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
  renderCart();
}

initStore();

setInterval(refreshProductsFromCsv, 60000);
window.addEventListener("focus", refreshProductsFromCsv);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) refreshProductsFromCsv();
});
