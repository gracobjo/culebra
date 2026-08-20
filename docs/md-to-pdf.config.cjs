module.exports = {
  dest: "Dossier_Socios_Marketplace_Villardeciervos.pdf",
  pdf_options: {
    format: "A4",
    margin: { top: "18mm", right: "14mm", bottom: "18mm", left: "14mm" },
    printBackground: true,
  },
  launch_options: {
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ["--no-sandbox", "--disable-gpu"],
  },
  stylesheet_encoding: "utf-8",
  body_class: "markdown-body",
  css: `
    body { font-family: "Segoe UI", Georgia, serif; font-size: 11pt; line-height: 1.45; color: #1c1917; }
    h1, h2, h3 { color: #065f46; page-break-after: avoid; }
    h1 { font-size: 1.7rem; }
    h2 { font-size: 1.25rem; margin-top: 1.6em; }
    table { border-collapse: collapse; width: 100%; font-size: 0.9em; margin: 1em 0; }
    th, td { border: 1px solid #d6d3d1; padding: 0.35em 0.5em; vertical-align: top; }
    th { background: #ecfdf5; }
    img { max-width: 220px; height: auto; }
    pre, code { font-size: 0.82em; }
    pre { white-space: pre-wrap; page-break-inside: avoid; }
    blockquote { border-left: 3px solid #065f46; margin-left: 0; padding-left: 1em; color: #44403c; }
    a { color: #065f46; }
  `,
};
