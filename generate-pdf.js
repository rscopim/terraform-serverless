const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function generateDockerPDF() {
  const modulesDir = path.join(__dirname, 'static_site', 'docker');
  const outputDir = path.join(__dirname, 'static_site', 'materiais');
  const outputFile = path.join(outputDir, 'docker-do-zero-ao-avancado.pdf');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Read all module HTML files in order
  const modules = [];
  for (let i = 1; i <= 7; i++) {
    const filePath = path.join(modulesDir, `modulo-0${i}.html`);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf-8');
      // Extract only the main content (between <main> and </main>)
      const mainMatch = content.match(/<main>([\s\S]*?)<\/main>/);
      if (mainMatch) {
        modules.push(mainMatch[1]);
      }
    }
  }

  // Build combined HTML for PDF
  const combinedHTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 11pt; line-height: 1.6; color: #1a1a2e; padding: 40px; }
    h1 { font-size: 28pt; font-weight: 800; margin-bottom: 8px; color: #1a1a2e; }
    h2 { font-size: 18pt; font-weight: 700; margin: 32px 0 12px; color: #1a1a2e; border-bottom: 2px solid #6366f1; padding-bottom: 6px; }
    h3 { font-size: 14pt; font-weight: 700; margin: 24px 0 10px; color: #374151; }
    p { margin-bottom: 10px; color: #4b5563; }
    code { font-family: 'Consolas', 'Courier New', monospace; font-size: 9.5pt; background: #f1f5f9; padding: 2px 5px; border-radius: 3px; }
    pre { background: #1e293b; color: #e2e8f0; padding: 16px; border-radius: 8px; margin: 12px 0; overflow-x: auto; page-break-inside: avoid; }
    pre code { background: none; padding: 0; color: #e2e8f0; font-size: 9pt; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 10pt; page-break-inside: avoid; }
    th { background: #f1f5f9; padding: 8px 12px; text-align: left; font-weight: 700; border-bottom: 2px solid #e2e8f0; }
    td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
    .pill { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 4px 12px; border-radius: 20px; font-size: 10pt; font-weight: 700; }
    .cover { text-align: center; padding: 120px 40px; page-break-after: always; }
    .cover h1 { font-size: 36pt; margin-bottom: 16px; }
    .cover p { font-size: 14pt; color: #6b7280; }
    .module-break { page-break-before: always; }
    .training-hero { background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 24px; }
    .training-hero h1 { color: white; font-size: 20pt; }
    .training-hero p { color: #c7d2fe; }
    .info-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px 16px; margin: 12px 0; }
    .info-box strong { color: #6366f1; }
    .topic-block { margin-bottom: 28px; }
    .command-grid { display: block; }
    .command-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px; page-break-inside: avoid; }
    .command-header { margin-bottom: 8px; }
    .command-header code { font-size: 12pt; font-weight: 700; color: #6366f1; background: none; }
    .cmd-tag { display: inline-block; background: #eff6ff; color: #6366f1; padding: 2px 8px; border-radius: 12px; font-size: 8pt; font-weight: 700; text-transform: uppercase; margin-left: 8px; }
    footer, header, nav, .nav-actions, .hero-actions, .learning-section, .module-progress, .footer, .resource-grid, .inline-download-form { display: none !important; }
    @page { margin: 2cm; }
  </style>
</head>
<body>
  <div class="cover">
    <span class="pill">🐳 Docker</span>
    <h1>Docker: Do Zero ao Avançado</h1>
    <p>Curso completo com 7 módulos</p>
    <p style="margin-top:24px;font-size:11pt;">Conceitos • Imagens • Volumes • Redes • Compose • Segurança • Produção</p>
    <p style="margin-top:48px;font-size:10pt;color:#9ca3af;">CloudTrilhas — cloudtrilhas.com.br</p>
    <p style="font-size:10pt;color:#9ca3af;">Por Ricardo Simines Scopim</p>
  </div>
  ${modules.map((content, i) => `<div class="${i > 0 ? 'module-break' : ''}">${content}</div>`).join('\n')}
</body>
</html>`;

  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  console.log('Loading HTML content...');
  await page.setContent(combinedHTML, { waitUntil: 'networkidle0', timeout: 60000 });

  console.log('Generating PDF...');
  await page.pdf({
    path: outputFile,
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
    displayHeaderFooter: true,
    headerTemplate: '<div style="font-size:8pt;color:#9ca3af;width:100%;text-align:center;padding:0 40px;">CloudTrilhas — Docker: Do Zero ao Avançado</div>',
    footerTemplate: '<div style="font-size:8pt;color:#9ca3af;width:100%;text-align:center;padding:0 40px;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
  });

  await browser.close();
  console.log(`✅ PDF gerado com sucesso: ${outputFile}`);
}

generateDockerPDF().catch(console.error);
