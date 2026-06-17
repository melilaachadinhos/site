(() => {
  const seen = new Set();

  function absoluteUrl(value) {
    if (!value) return "";
    if (value.startsWith("//")) return `https:${value}`;
    try {
      return new URL(value, location.href).href;
    } catch {
      return "";
    }
  }

  function cleanText(value) {
    return String(value || "")
      .replace(/AliExpress/gi, "")
      .replace(/\bChoice\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function csvEscape(value) {
    const text = value == null ? "" : String(value);
    return /[",\n\r;]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  }

  function findCard(anchor) {
    let node = anchor;
    for (let depth = 0; node && depth < 8; depth += 1) {
      const text = node.innerText || "";
      const images = node.querySelectorAll ? node.querySelectorAll("img").length : 0;
      if (text.length > 30 && images > 0) return node;
      node = node.parentElement;
    }
    return anchor;
  }

  function getImage(card) {
    const candidates = Array.from(card.querySelectorAll("img"))
      .map((img) =>
        absoluteUrl(
          img.currentSrc ||
            img.src ||
            img.getAttribute("data-src") ||
            img.getAttribute("data-lazy-src") ||
            img.getAttribute("srcset")?.split(",")?.[0]?.trim()?.split(" ")?.[0] ||
            "",
        ),
      )
      .filter(Boolean)
      .filter((url) => !/logo|sprite|avatar|profile|store|ae01\.alicdn\.com\/kf\/S/i.test(url));

    return candidates[0] || "";
  }

  function getPrice(text) {
    const patterns = [
      /R\$\s*[\d.]+,\d{2}/i,
      /US\s*\$?\s*[\d,.]+/i,
      /\$\s*[\d,.]+/i,
      /BRL\s*[\d,.]+/i,
    ];
    for (const pattern of patterns) {
      const found = text.match(pattern);
      if (found) return found[0].replace(/\s+/g, " ").trim();
    }
    return "";
  }

  function getTitle(anchor, card, price) {
    const titleCandidates = [
      anchor.getAttribute("title"),
      anchor.getAttribute("aria-label"),
      ...Array.from(card.querySelectorAll("[title], h1, h2, h3, [class*='title'], [class*='name']")).map(
        (el) => el.getAttribute("title") || el.innerText,
      ),
      anchor.innerText,
      card.innerText?.split("\n")?.find((line) => line.length > 20),
    ];

    return cleanText(
      titleCandidates
        .map(cleanText)
        .find((value) => value && value.length > 8 && !value.includes(price) && !/comprar|cart|entrar/i.test(value)) ||
        "",
    );
  }

  const rows = Array.from(document.querySelectorAll("a[href*='/item/'], a[href*='item/']"))
    .map((anchor, index) => {
      const link = absoluteUrl(anchor.getAttribute("href"));
      if (!link || seen.has(link)) return null;
      seen.add(link);

      const card = findCard(anchor);
      const text = cleanText(card.innerText || anchor.innerText || "");
      const price = getPrice(text);
      const title = getTitle(anchor, card, price) || `Produto coletado ${index + 1}`;
      const image = getImage(card);

      return {
        "Produto capturado": title,
        "Nome limpo site": title,
        "Link Produto": link,
        "Foto URL": image,
        "Preco bruto": price,
        "Texto com marca?": /aliexpress/i.test(title) ? "Revisar mencao" : "OK",
        "Status da foto": image ? "OK" : "Sem foto",
        Observacoes: "Validar foto, prazo, avaliacoes e rastreio antes de publicar.",
      };
    })
    .filter(Boolean)
    .filter((row) => row["Produto capturado"] && row["Link Produto"]);

  const headers = [
    "Produto capturado",
    "Nome limpo site",
    "Link Produto",
    "Foto URL",
    "Preco bruto",
    "Texto com marca?",
    "Status da foto",
    "Observacoes",
  ];

  const csv = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "produtos-coletados-aliexpress.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  console.log(`Coleta finalizada: ${rows.length} produtos exportados.`);
})();
