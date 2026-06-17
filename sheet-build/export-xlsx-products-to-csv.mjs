import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const xlsxPath = path.join(rootDir, "exports", "automacao-aliexpress-produtos.xlsx");
const csvPath = path.join(rootDir, "controle-produtos-manual.csv");

const outputHeaders = [
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

function money(value) {
  if (value == null || value === "") return "";
  const number = Number(String(value).replace(/[R$\s]/g, "").replace(",", "."));
  return Number.isFinite(number) ? number.toFixed(2) : "";
}

function percent(value) {
  if (value == null || value === "") return "";
  if (typeof value === "number") return `${Math.round(value * 100)}%`;
  return String(value).includes("%") ? String(value) : `${value}%`;
}

function rowObject(headers, row) {
  return Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""]));
}

const input = await FileBlob.load(xlsxPath);
const workbook = await SpreadsheetFile.importXlsx(input);
const sheet = workbook.worksheets.getItem("Produtos");
const values = sheet.getRange("A5:X205").values;
const [headers, ...rows] = values;

const products = rows
  .map((row) => rowObject(headers, row))
  .filter((row) => row["Produto capturado"] || row["Nome limpo site"] || row["Produto base/site"])
  .map((row, index) => {
    const name = cleanText(row["Nome limpo site"] || row["Produto capturado"] || row["Produto base/site"]);
    const sku = row["SKU base"] || `MLA-CSV-${String(index + 1).padStart(3, "0")}`;
    const status = row.Status || "Para validar";
    return {
      sku,
      produto_site: name,
      categoria: row.Categoria || "Achadinhos",
      preco_venda_brl: money(row["Preco venda BRL"]),
      custo_alvo_brl: money(row["Custo total BRL"] || row["Preco fornecedor BRL"]),
      margem_alvo: percent(row["Margem %"]),
      fornecedor: "Fornecedor externo",
      link_busca_fornecedor: row["Link Produto"] || "",
      busca_alternativa: row["Link Produto"] || "",
      status,
      observacoes: cleanText(row.Observacoes || row["Envio/Rastreio"] || "Validar produto, prazo, avaliacoes e rastreio antes de publicar."),
      foto_url: row["Foto URL"] || "",
    };
  });

const csv = [
  outputHeaders.join(","),
  ...products.map((product) => outputHeaders.map((header) => csvEscape(product[header])).join(",")),
].join("\n");

await fs.writeFile(csvPath, `${csv}\n`, "utf8");
console.log(`Exported ${products.length} products to ${csvPath}`);
