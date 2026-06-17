import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const outputDir = path.join(rootDir, "exports");
const csvPath = path.join(rootDir, "controle-produtos-manual.csv");
const outputPath = path.join(outputDir, "automacao-aliexpress-produtos.xlsx");
const brasilCategoryUrl =
  "https://www.aliexpress.com/ssr/300000455/mKTE5nTsfT?spm=a2g0o.tm1000013488.9089467070.1.58bd31c6mkD2Qb&disableNav=YES&pha_manifest=ssr&_immersiveMode=true";

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"' && inQuotes && next === '"') {
      cell += '"';
      i += 1;
      continue;
    }

    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (ch === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && next === "\n") i += 1;
      row.push(cell);
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += ch;
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  const [headers, ...data] = rows;
  return data.map((items) =>
    Object.fromEntries(headers.map((header, index) => [header, items[index] ?? ""])),
  );
}

function numberValue(value) {
  const parsed = Number(String(value).replace(",", ".").replace("%", ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function excelQuote(value) {
  return String(value ?? "").replaceAll('"', '""');
}

function setColumns(sheet, widths) {
  widths.forEach((width, index) => {
    sheet.getRangeByIndexes(0, index, 1, 1).format.columnWidthPx = width;
  });
}

function styleTitle(range) {
  range.format = {
    fill: "#151827",
    font: { bold: true, color: "#FFFFFF", size: 16 },
  };
}

function styleHeader(range) {
  range.format = {
    fill: "#2F62D6",
    font: { bold: true, color: "#FFFFFF" },
    wrapText: true,
  };
}

function styleSubtle(range) {
  range.format = {
    fill: "#F5F7FB",
    font: { color: "#151827" },
    wrapText: true,
  };
}

const produtos = parseCsv(await fs.readFile(csvPath, "utf8"));

const workbook = Workbook.create();
const painel = workbook.worksheets.add("Painel");
const config = workbook.worksheets.add("Config");
const produtosSheet = workbook.worksheets.add("Produtos");
const buscas = workbook.worksheets.add("Buscas AliExpress");
const automacao = workbook.worksheets.add("Automacao");

for (const sheet of [painel, config, produtosSheet, buscas, automacao]) {
  sheet.showGridLines = false;
}

// Painel
painel.getRange("A1:H1").merge();
painel.getRange("A1:H1").values = [["Automacao AliExpress - Produtos"]];
styleTitle(painel.getRange("A1:H1"));
painel.getRange("A2:H2").merge();
painel.getRange("A2:H2").values = [[
  "Resumo para coletar achadinhos, fotos sem marca e textos limpos para decidir quais produtos entram na loja.",
]];
styleSubtle(painel.getRange("A2:H2"));

painel.getRange("A4:B10").values = [
  ["Indicador", "Valor"],
  ["Produtos preenchidos", ""],
  ["Aprovados", ""],
  ["Para validar", ""],
  ["Margem media", ""],
  ["Maior margem", ""],
  ["Lucro potencial total", ""],
];
styleHeader(painel.getRange("A4:B4"));
painel.getRange("B5:B10").formulas = [
  ['=SUMPRODUCT((Produtos!D6:D205<>"")*1)'],
  ['=SUMPRODUCT((Produtos!A6:A205="Aprovado")*(Produtos!D6:D205<>""))'],
  ['=SUMPRODUCT((Produtos!A6:A205="Para validar")*(Produtos!D6:D205<>""))'],
  ["=IFERROR(AVERAGE(Produtos!P6:P205),0)"],
  ["=IFERROR(MAX(Produtos!P6:P205),0)"],
  ["=IFERROR(SUM(Produtos!O6:O205),0)"],
];
painel.getRange("B8:B9").format.numberFormat = "0.0%";
painel.getRange("B10").format.numberFormat = '"R$" #,##0.00';
painel.getRange("A4:B10").format.borders = { preset: "all", style: "thin", color: "#DDE5EE" };

painel.getRange("D4:H4").merge();
painel.getRange("D4:H4").values = [["Como usar em 5 passos"]];
styleHeader(painel.getRange("D4:H4"));
const painelSteps = [
  "1. Abra a aba Config e ajuste a URL do AliExpress.",
  "2. No Excel, use Dados > Obter Dados > Consulta em Branco.",
  "3. Cole o codigo Power Query da aba Automacao.",
  "4. Carregue o resultado na aba Produtos ou cole os itens manualmente.",
  "5. Marque o status como Aprovado, Reprovado ou Para validar.",
];
painelSteps.forEach((step, index) => {
  const row = 5 + index;
  const range = painel.getRange(`D${row}:H${row}`);
  range.merge();
  range.values = [[step]];
  styleSubtle(range);
  range.format.borders = { preset: "all", style: "thin", color: "#DDE5EE" };
  range.format.rowHeightPx = 28;
});
setColumns(painel, [170, 130, 24, 150, 150, 150, 150, 150]);

// Config
config.getRange("A1:D1").merge();
config.getRange("A1:D1").values = [["Configuracao da coleta"]];
styleTitle(config.getRange("A1:D1"));
config.getRange("A3:B10").values = [
  ["Campo", "Valor"],
  ["URL de coleta", brasilCategoryUrl],
  ["URL recomendada", "Use uma URL de busca/categoria se a home vier personalizada ou bloquear"],
  ["Cotacao USD-BRL", 5.4],
  ["Frete padrao BRL", 0],
  ["Margem minima", 0.5],
  ["Moeda de saida", "BRL"],
  ["Data da planilha", new Date()],
];
styleHeader(config.getRange("A3:B3"));
config.getRange("B6").format.numberFormat = '"R$" #,##0.00';
config.getRange("B7").format.numberFormat = '"R$" #,##0.00';
config.getRange("B8").format.numberFormat = "0%";
config.getRange("B10").format.numberFormat = "yyyy-mm-dd";
config.getRange("A3:B10").format.borders = { preset: "all", style: "thin", color: "#DDE5EE" };
config.tables.add("A3:B10", true, "ConfigTable");
config.getRange("D3:D10").values = [
  ["Observacao"],
  ["URL da categoria Brasil informada para captura local no Excel."],
  ["Para resultados melhores, use categorias ou buscas especificas quando a pagina limitar resultados."],
  ["Ajuste se seus fornecedores cobrarem em USD."],
  ["Use para estimar custo total quando o frete nao vier na coleta."],
  ["Produtos abaixo disso ficam destacados para revisar."],
  ["Padrao do controle da loja."],
  ["Atualize quando refizer a coleta."],
];
styleSubtle(config.getRange("D3:D10"));
config.getRange("D3:D10").format.borders = { preset: "all", style: "thin", color: "#DDE5EE" };
setColumns(config, [170, 430, 24, 420]);

// Produtos
produtosSheet.getRange("A1:X1").merge();
produtosSheet.getRange("A1:X1").values = [["Produtos coletados da categoria Brasil"]];
styleTitle(produtosSheet.getRange("A1:X1"));
produtosSheet.getRange("A2:X3").merge();
produtosSheet.getRange("A2:X3").values = [[
  "Cole aqui os produtos encontrados ou carregue via Power Query. Use Nome limpo site e Status da foto antes de publicar; nao use textos com mencoes ao AliExpress.",
]];
styleSubtle(produtosSheet.getRange("A2:X3"));

const produtoHeaders = [
  "Status",
  "Fonte interna",
  "Categoria",
  "Produto capturado",
  "Nome limpo site",
  "Link Produto",
  "Foto URL",
  "Abrir foto",
  "Status da foto",
  "Loja",
  "Preco fornecedor BRL",
  "Frete BRL",
  "Custo total BRL",
  "Preco venda BRL",
  "Lucro estimado BRL",
  "Margem %",
  "Avaliacao",
  "Pedidos",
  "Envio/Rastreio",
  "Produto base/site",
  "SKU base",
  "Data coleta",
  "Texto com marca?",
  "Observacoes",
];
produtosSheet.getRange("A5:X5").values = [produtoHeaders];
styleHeader(produtosSheet.getRange("A5:X5"));

const rowsCount = 200;
const produtoRows = produtos.map((item) => [
  "Para validar",
    "Fornecedor externo",
    item.categoria,
    item.produto_site,
    "",
    item.link_busca_fornecedor,
    "",
    "",
    "",
    item.fornecedor,
    numberValue(item.custo_alvo_brl),
    "",
    "",
    numberValue(item.preco_venda_brl),
    "",
    "",
    "",
    "",
    "Validar rastreio",
    item.produto_site,
    item.sku,
    new Date(),
    "",
    item.observacoes,
]);
if (produtoRows.length) {
  produtosSheet.getRange(`A6:X${5 + produtoRows.length}`).values = produtoRows;
}
produtosSheet.getRange(`E6:E${5 + rowsCount}`).formulas = Array.from({ length: rowsCount }, (_, i) => {
  const row = i + 6;
  return [
    `=IF(D${row}="","",TRIM(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(D${row},"AliExpress",""),"aliexpress",""),"ALIEXPRESS",""),"Choice","")))`,
  ];
});
produtosSheet.getRange(`H6:H${5 + rowsCount}`).formulas = Array.from({ length: rowsCount }, (_, i) => {
  const row = i + 6;
  return [`=IF(G${row}="","",HYPERLINK(G${row},"Abrir foto"))`];
});
produtosSheet.getRange(`I6:I${5 + rowsCount}`).formulas = Array.from({ length: rowsCount }, (_, i) => {
  const row = i + 6;
  return [
    `=IF(G${row}="","Sem foto",IF(OR(ISNUMBER(SEARCH("logo",G${row})),ISNUMBER(SEARCH("sprite",G${row})),ISNUMBER(SEARCH("aliexpress",G${row}))),"Revisar foto","OK"))`,
  ];
});
produtosSheet.getRange(`M6:M${5 + rowsCount}`).formulas = Array.from({ length: rowsCount }, (_, i) => {
  const row = i + 6;
  return [`=IF(K${row}="","",K${row}+IF(L${row}="",0,L${row}))`];
});
produtosSheet.getRange(`O6:O${5 + rowsCount}`).formulas = Array.from({ length: rowsCount }, (_, i) => {
  const row = i + 6;
  return [`=IF(OR(N${row}="",M${row}=""),"",N${row}-M${row})`];
});
produtosSheet.getRange(`P6:P${5 + rowsCount}`).formulas = Array.from({ length: rowsCount }, (_, i) => {
  const row = i + 6;
  return [`=IF(OR(N${row}="",O${row}=""),"",O${row}/N${row})`];
});
produtosSheet.getRange(`W6:W${5 + rowsCount}`).formulas = Array.from({ length: rowsCount }, (_, i) => {
  const row = i + 6;
  return [
    `=IF(OR(ISNUMBER(SEARCH("aliexpress",D${row})),ISNUMBER(SEARCH("aliexpress",X${row}))),"Revisar mencao","OK")`,
  ];
});
produtosSheet.getRange(`A6:A${5 + rowsCount}`).dataValidation = {
  rule: { type: "list", values: ["Para validar", "Aprovado", "Reprovado", "Comprar teste"] },
};
produtosSheet.getRange(`K6:O${5 + rowsCount}`).format.numberFormat = '"R$" #,##0.00';
produtosSheet.getRange(`P6:P${5 + rowsCount}`).format.numberFormat = "0.0%";
produtosSheet.getRange(`V6:V${5 + rowsCount}`).format.numberFormat = "yyyy-mm-dd";
produtosSheet.getRange(`A5:X${5 + rowsCount}`).format.borders = { preset: "all", style: "thin", color: "#DDE5EE" };
produtosSheet.tables.add(`A5:X${5 + rowsCount}`, true, "ProdutosTable");
produtosSheet.freezePanes.freezeRows(5);
setColumns(produtosSheet, [
  120, 130, 120, 260, 250, 360, 280, 90, 120, 140, 115, 95, 115, 115, 120, 90, 90, 90, 130, 230, 140, 105, 120, 360,
]);

// Buscas
buscas.getRange("A1:J1").merge();
buscas.getRange("A1:J1").values = [["Buscas prontas para AliExpress"]];
styleTitle(buscas.getRange("A1:J1"));
buscas.getRange("A3:J3").values = [[
  "SKU",
  "Produto do site",
  "Categoria",
  "URL de busca",
  "Busca alternativa",
  "Preco venda BRL",
  "Custo alvo BRL",
  "Margem alvo",
  "Abrir busca",
  "Observacoes",
]];
styleHeader(buscas.getRange("A3:J3"));
const buscaRows = produtos.map((item) => [
  item.sku,
  item.produto_site,
  item.categoria,
  item.link_busca_fornecedor,
  item.busca_alternativa,
  numberValue(item.preco_venda_brl),
  numberValue(item.custo_alvo_brl),
  numberValue(item.margem_alvo) / 100,
  "",
  item.observacoes,
]);
buscas.getRange(`A4:J${3 + buscaRows.length}`).values = buscaRows;
buscas.getRange(`I4:I${3 + buscaRows.length}`).formulas = produtos.map((item) => [
  `=HYPERLINK("${excelQuote(item.link_busca_fornecedor)}","Abrir busca")`,
]);
buscas.getRange(`F4:G${3 + buscaRows.length}`).format.numberFormat = '"R$" #,##0.00';
buscas.getRange(`H4:H${3 + buscaRows.length}`).format.numberFormat = "0%";
buscas.getRange(`A3:J${3 + buscaRows.length}`).format.borders = { preset: "all", style: "thin", color: "#DDE5EE" };
buscas.tables.add(`A3:J${3 + buscaRows.length}`, true, "BuscasTable");
buscas.freezePanes.freezeRows(3);
setColumns(buscas, [140, 260, 130, 380, 360, 120, 120, 95, 100, 380]);

// Automacao
automacao.getRange("A1:H1").merge();
automacao.getRange("A1:H1").values = [["Automacao Power Query para AliExpress"]];
styleTitle(automacao.getRange("A1:H1"));
automacao.getRange("A3:H5").merge();
automacao.getRange("A3:H5").values = [[
  "Importante: a home do AliExpress e personalizada, pesada em JavaScript e pode bloquear consultas automaticas. " +
    "O caminho mais estavel e usar uma URL de busca/categoria e revisar os resultados antes de comprar.",
]];
styleSubtle(automacao.getRange("A3:H5"));

const powerQuery = `let
    Config = Excel.CurrentWorkbook(){[Name="ConfigTable"]}[Content],
    Url = Config{[Campo="URL de coleta"]}[Valor],
    Fonte = Web.BrowserContents(Url),
    Cards = Html.Table(
        Fonte,
        {
            {"Produto capturado", "[class*='title'], [class*='name'], a[href*='/item/']", each Text.Trim([Text])},
            {"Preco bruto", "[class*='price']", each Text.Trim([Text])},
            {"Link Produto", "a[href*='/item/']", each [Attributes][href]?},
            {"Foto URL", "img", each [Attributes][src]?},
            {"Foto alternativa", "img", each [Attributes][data-src]?}
        },
        [RowSelector="[class*='card'], [class*='product'], a[href*='/item/']"]
    ),
    SemVazios = Table.SelectRows(Cards, each [Produto capturado] <> null and [Produto capturado] <> ""),
    Links = Table.TransformColumns(
        SemVazios,
        {{"Link Produto", each if _ <> null and Text.StartsWith(_, "//") then "https:" & _ else _, type text}}
    ),
    Fotos = Table.AddColumn(Links, "Foto final", each if [Foto URL] <> null and [Foto URL] <> "" then [Foto URL] else [Foto alternativa], type text),
    FotosNormalizadas = Table.TransformColumns(
        Fotos,
        {{"Foto final", each if _ <> null and Text.StartsWith(_, "//") then "https:" & _ else _, type text}}
    ),
    NomeLimpo = Table.AddColumn(
        FotosNormalizadas,
        "Nome limpo site",
        each Text.Trim(Text.Replace(Text.Replace(Text.Replace([Produto capturado], "AliExpress", ""), "aliexpress", ""), "Choice", "")),
        type text
    ),
    StatusFoto = Table.AddColumn(
        NomeLimpo,
        "Status da foto",
        each if [Foto final] = null or [Foto final] = "" then "Sem foto" else if Text.Contains(Text.Lower([Foto final]), "logo") or Text.Contains(Text.Lower([Foto final]), "sprite") or Text.Contains(Text.Lower([Foto final]), "aliexpress") then "Revisar foto" else "OK",
        type text
    ),
    TextoMarca = Table.AddColumn(
        StatusFoto,
        "Texto com marca?",
        each if Text.Contains(Text.Lower([Produto capturado]), "aliexpress") then "Revisar mencao" else "OK",
        type text
    ),
    Saida = Table.SelectColumns(TextoMarca, {"Produto capturado", "Nome limpo site", "Link Produto", "Foto final", "Status da foto", "Preco bruto", "Texto com marca?"}),
    Renomeado = Table.RenameColumns(Saida, {{"Foto final", "Foto URL"}})
in
    Renomeado`;

const vba = `Sub AtualizarProdutosAliExpress()
    MsgBox "Abra Dados > Consultas e Conexoes e atualize a consulta criada com o codigo Power Query da aba Automacao.", vbInformation
End Sub`;

automacao.getRange("A7:H7").merge();
automacao.getRange("A7:H7").values = [["Codigo Power Query M"]];
styleHeader(automacao.getRange("A7:H7"));
const powerQueryLines = powerQuery.split("\n");
powerQueryLines.forEach((line, index) => {
  const row = 8 + index;
  const range = automacao.getRange(`A${row}:H${row}`);
  range.merge();
  range.values = [[line || " "]];
  range.format = {
    fill: "#F5F7FB",
    font: { color: "#151827", name: "Consolas", size: 9 },
    wrapText: false,
  };
  range.format.rowHeightPx = 19;
});
automacao.getRange(`A8:H${7 + powerQueryLines.length}`).format.borders = {
  preset: "all",
  style: "thin",
  color: "#DDE5EE",
};

const macroStart = 10 + powerQueryLines.length;
automacao.getRange(`A${macroStart}:H${macroStart}`).merge();
automacao.getRange(`A${macroStart}:H${macroStart}`).values = [["Macro opcional para lembrar a atualizacao"]];
styleHeader(automacao.getRange(`A${macroStart}:H${macroStart}`));
automacao.getRange(`A${macroStart + 1}:H${macroStart + 6}`).merge();
automacao.getRange(`A${macroStart + 1}:H${macroStart + 6}`).values = [[vba]];
automacao.getRange(`A${macroStart + 1}:H${macroStart + 6}`).format = {
  fill: "#FFF6D6",
  font: { color: "#151827", name: "Consolas", size: 9 },
  wrapText: true,
};

const stepsStart = macroStart + 8;
automacao.getRange(`A${stepsStart}:H${stepsStart + 5}`).merge();
automacao.getRange(`A${stepsStart}:H${stepsStart + 5}`).values = [[
  "Passos no Excel:\n" +
    "1. Copie o codigo Power Query acima.\n" +
    "2. Va em Dados > Obter Dados > De Outras Fontes > Consulta em Branco.\n" +
    "3. Abra Editor Avancado, cole o codigo e clique em Concluido.\n" +
    "4. Carregue como tabela em uma nova aba, depois copie as linhas boas para Produtos.\n" +
    "5. Se vier vazio, troque Config!B4 por uma URL de busca da aba Buscas AliExpress.",
]];
styleSubtle(automacao.getRange(`A${stepsStart}:H${stepsStart + 5}`));
setColumns(automacao, [120, 120, 120, 120, 120, 120, 120, 120]);

for (const sheet of [painel, config, produtosSheet, buscas, automacao]) {
  const used = sheet.getUsedRange();
  used.format.wrapText = true;
}

await fs.mkdir(outputDir, { recursive: true });

const inspectPainel = await workbook.inspect({
  kind: "table",
  range: "Painel!A1:H12",
  include: "values,formulas",
  tableMaxRows: 15,
  tableMaxCols: 8,
  maxChars: 4000,
});
console.log(inspectPainel.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "formula error scan",
  maxChars: 2000,
});
console.log(errors.ndjson);

for (const sheetName of ["Painel", "Config", "Produtos", "Buscas AliExpress", "Automacao"]) {
  const preview = await workbook.render({ sheetName, autoCrop: "all", scale: 1, format: "png" });
  await fs.writeFile(
    path.join(outputDir, `preview-${sheetName.replaceAll(" ", "-").toLowerCase()}.png`),
    new Uint8Array(await preview.arrayBuffer()),
  );
}

const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(outputPath);
console.log(`SAVED ${outputPath}`);
