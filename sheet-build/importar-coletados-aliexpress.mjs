import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const collectedPath = path.join(rootDir, "exports", "produtos-coletados-aliexpress.csv");
const downloadsCollectedPath = path.join(os.homedir(), "Downloads", "produtos-coletados-aliexpress.csv");
const dDownloadsCollectedPath = "D:\\Downloads\\produtos-coletados-aliexpress.csv";
const controlPath = path.join(rootDir, "controle-produtos-manual.csv");

const headers = [
  "sku",
  "produto_site",
  "categoria",
  "preco_venda_brl",
  "custo_alvo_brl",
  "margem_alvo",
  "fornecedor",
  "link_busca_fornecedor",
  "busca_alternativa",
  "status",
  "observacoes",
  "foto_url",
];

function normalizeHeader(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/(^_|_$)/g, "");
}

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

  const [rawHeaders = [], ...dataRows] = rows;
  const normalized = rawHeaders.map(normalizeHeader);
  return dataRows.map((items) =>
    Object.fromEntries(normalized.map((header, index) => [header, items[index] || ""])),
  );
}

function csvEscape(value) {
  const text = value == null ? "" : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function cleanText(value) {
  return String(value || "")
    .replace(/aliexpress/gi, "")
    .replace(/choice/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 28);
}

function parseMoney(value) {
  const text = String(value || "")
    .replace(/[^\d,.-]/g, "")
    .trim();
  if (!text) return 0;
  const normalized = text.includes(",") ? text.replace(/\./g, "").replace(",", ".") : text;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value) {
  return value > 0 ? value.toFixed(2) : "";
}

function getValue(row, keys) {
  for (const key of keys) {
    if (row[key]) return row[key];
  }
  return "";
}

function normalizeCollected(row, index) {
  const name = cleanText(
    getValue(row, [
      "nome_limpo_site",
      "produto_capturado",
      "produto_aliexpress",
      "produto_site",
      "produto",
      "nome",
      "title",
    ]),
  );
  const link = getValue(row, ["link_produto", "link_busca_fornecedor", "url", "link"]);
  const photo = getValue(row, ["foto_url", "foto_final", "imagem", "image", "img", "src"]);
  const cost = parseMoney(getValue(row, ["preco_bruto", "preco_fornecedor_brl", "custo_total_brl", "custo_alvo_brl", "preco"]));
  const sale = parseMoney(getValue(row, ["preco_venda_brl", "preco_venda"])) || (cost > 0 ? cost * 2 : 0);
  const skuSeed = slugify(name || link || `PRODUTO-${index + 1}`);

  return {
    sku: `MLA-AE-${String(index + 1).padStart(3, "0")}-${skuSeed.slice(0, 10)}`,
    produto_site: name,
    categoria: getValue(row, ["categoria"]) || "Brasil",
    preco_venda_brl: formatMoney(sale),
    custo_alvo_brl: formatMoney(cost),
    margem_alvo: sale > 0 && cost > 0 ? `${Math.round(((sale - cost) / sale) * 100)}%` : "",
    fornecedor: "Fornecedor externo",
    link_busca_fornecedor: link,
    busca_alternativa: link,
    status: "Para validar",
    observacoes: cleanText(getValue(row, ["observacoes", "descricao", "description"])) || "Validar foto sem logo, prazo, avaliacoes e rastreio antes de publicar.",
    foto_url: /logo|sprite/i.test(photo) ? "" : photo,
  };
}

async function pickCollectedFile() {
  const candidates = [collectedPath, downloadsCollectedPath, dDownloadsCollectedPath];
  const existing = [];

  for (const candidate of candidates) {
    try {
      const stat = await fs.stat(candidate);
      existing.push({ candidate, stat });
    } catch {
      // Ignore missing candidate.
    }
  }

  if (!existing.length) return collectedPath;

  existing.sort((a, b) => {
    const usefulA = a.stat.size > 120 ? 1 : 0;
    const usefulB = b.stat.size > 120 ? 1 : 0;
    if (usefulA !== usefulB) return usefulB - usefulA;
    return b.stat.mtimeMs - a.stat.mtimeMs;
  });

  return existing[0].candidate;
}

const selectedCollectedPath = await pickCollectedFile();
const [controlText, collectedText] = await Promise.all([
  fs.readFile(controlPath, "utf8"),
  fs.readFile(selectedCollectedPath, "utf8"),
]);

const current = parseCsv(controlText);
const collected = parseCsv(collectedText)
  .map(normalizeCollected)
  .filter((product) => product.produto_site && product.preco_venda_brl);

const existingKeys = new Set();
const existingByKey = new Map();
for (const row of current) {
  const key = `${cleanText(row.produto_site).toLowerCase()}|${row.link_busca_fornecedor || ""}`;
  existingKeys.add(key);
  existingByKey.set(key, row);
}
const newProducts = collected.filter((product) => {
  const key = `${product.produto_site.toLowerCase()}|${product.link_busca_fornecedor || ""}`;
  if (existingKeys.has(key)) {
    const existing = existingByKey.get(key);
    if (existing) {
      if (!existing.foto_url && product.foto_url) existing.foto_url = product.foto_url;
      if (!existing.preco_venda_brl && product.preco_venda_brl) existing.preco_venda_brl = product.preco_venda_brl;
      if (!existing.custo_alvo_brl && product.custo_alvo_brl) existing.custo_alvo_brl = product.custo_alvo_brl;
    }
    return false;
  }
  existingKeys.add(key);
  existingByKey.set(key, product);
  return true;
});

const output = [
  headers.join(","),
  ...[...current, ...newProducts].map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
].join("\n");

await fs.writeFile(controlPath, `${output}\n`, "utf8");
console.log(`Arquivo usado: ${selectedCollectedPath}`);
console.log(`Importados ${newProducts.length} produtos novos. Total: ${current.length + newProducts.length}.`);
