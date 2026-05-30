const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const COURSE = process.argv[2] || 'docker';

const COURSES = {
  docker: { modules: 7, title: 'Docker: Do Zero ao Avançado', emoji: '🐳', subtitle: 'Conceitos • Imagens • Volumes • Redes • Compose • Segurança • Produção' },
  terraform: { modules: 4, title: 'Terraform AWS: Do Zero ao Avançado', emoji: '🏗️', subtitle: 'VPC • EC2 • RDS • S3 • IAM • State • Produção' },
  'ai-practitioner': { modules: 5, title: 'AWS AI Practitioner (AIF-C01)', emoji: '🤖', subtitle: 'Fundamentos IA/ML • IA Generativa • Modelos de Fundação • IA Responsável • Segurança', prefix: 'dominio' },
  linux: { modules: 5, title: 'Linux: Do Zero ao Avançado', emoji: '🐧', subtitle: 'Terminal • Permissões • Shell Script • Redes • Automação' },
  github: { modules: 9, title: 'Git & GitHub: Do Zero ao Avançado', emoji: '🐙', subtitle: 'Configuração • Branches • Colaboração • Rebase • Actions • Segurança', startAt: 0 },
  kubernetes: { modules: 4, title: 'Kubernetes: Do Zero ao Avançado', emoji: '☸️', subtitle: 'Pods • Deployments • Services • Helm • HPA • GitOps • Produção' },
  redes: { modules: 12, title: 'Redes de Computadores: Do Zero ao Avançado', emoji: '🌐', subtitle: 'Fundamentos • OSI • IP • Switching • Roteamento • Segurança • Automação • Design' },
  python: { modules: 10, title: 'Python: Do Zero ao Avançado', emoji: '🐍', subtitle: 'Fundamentos • OOP • APIs • boto3 • Bedrock • Automação AWS' },
  cloudformation: { modules: 4, title: 'AWS CloudFormation: Do Zero ao Avançado', emoji: '☁️', subtitle: 'Templates • VPC • EC2 • RDS • S3 • Nested Stacks' },
  developer: { modules: 4, title: 'AWS Developer Associate (DVA-C02)', emoji: '💻', subtitle: 'Desenvolvimento • Segurança • Implantação • Troubleshooting', prefix: 'dominio' },
  'solutions-architect-pro': { modules: 7, title: 'AWS SA Professional (SAP-C02)', emoji: '🏛️', subtitle: 'Complexidade • Novas Soluções • Melhoria • Migração • Cenários' },
};

async function generatePDF(courseName) {
  const config = COURSES[courseName];
  if (!config) { console.error(`Curso "${courseName}" não encontrado.`); process.exit(1); }

  const modulesDir = path.join(__dirname, 'static_site', courseName);
  const outputDir = path.join(__dirname, 'static_site', 'materiais');
  const outputFile = path.join(outputDir, `${courseName}-do-zero-ao-avancado.pdf`);
  if (courseName === 'terraform') {
    var outputFileFinal = path.join(outputDir, 'terraform-aws-do-zero-ao-avancado.pdf');
  } else if (courseName === 'ai-practitioner') {
    var outputFileFinal = path.join(outputDir, 'aws-ai-practitioner-do-zero-ao-avancado.pdf');
  } else if (courseName === 'github') {
    var outputFileFinal = path.join(outputDir, 'git-github-do-zero-ao-avancado.pdf');
  } else if (courseName === 'developer') {
    var outputFileFinal = path.join(outputDir, 'aws-developer-associate-do-zero-ao-avancado.pdf');
  } else if (courseName === 'solutions-architect-pro') {
    var outputFileFinal = path.join(outputDir, 'aws-sa-professional-do-zero-ao-avancado.pdf');
  } else {
    var outputFileFinal = outputFile;
  }

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const modules = [];
  const filePrefix = config.prefix || 'modulo';
  const startAt = config.startAt || 1;
  for (let i = startAt; i < startAt + config.modules; i++) {
    const num = i.toString().padStart(2, '0');
    const filePath = path.join(modulesDir, `${filePrefix}-${num}.html`);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf-8');
      const mainMatch = content.match(/<main>([\s\S]*?)<\/main>/);
      if (mainMatch) modules.push(mainMatch[1]);
    }
  }

  const combinedHTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 11pt; line-height: 1.6; color: #1a1a2e; padding: 40px; }
    h1 { font-size: 24pt; font-weight: 800; margin-bottom: 8px; color: #1a1a2e; }
    h2 { font-size: 16pt; font-weight: 700; margin: 28px 0 12px; color: #1a1a2e; border-bottom: 2px solid #6366f1; padding-bottom: 6px; }
    h3 { font-size: 13pt; font-weight: 700; margin: 20px 0 10px; color: #374151; }
    p { margin-bottom: 10px; color: #4b5563; }
    code { font-family: 'Consolas', 'Courier New', monospace; font-size: 9.5pt; background: #f1f5f9; padding: 2px 5px; border-radius: 3px; }
    pre { background: #1e293b; color: #e2e8f0; padding: 14px; border-radius: 8px; margin: 10px 0; overflow-x: auto; page-break-inside: avoid; }
    pre code { background: none; padding: 0; color: #e2e8f0; font-size: 8.5pt; line-height: 1.5; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 9.5pt; page-break-inside: avoid; }
    th { background: #f1f5f9; padding: 8px 10px; text-align: left; font-weight: 700; border-bottom: 2px solid #e2e8f0; }
    td { padding: 7px 10px; border-bottom: 1px solid #e2e8f0; }
    .pill { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 4px 12px; border-radius: 20px; font-size: 10pt; font-weight: 700; }
    .cover { text-align: center; padding: 140px 40px; page-break-after: always; }
    .cover h1 { font-size: 32pt; margin-bottom: 12px; }
    .cover p { font-size: 12pt; color: #6b7280; }
    .module-break { page-break-before: always; }
    .training-hero { background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); color: white; padding: 24px; border-radius: 12px; margin-bottom: 20px; }
    .training-hero h1 { color: white; font-size: 18pt; }
    .training-hero p { color: #c7d2fe; }
    .info-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; margin: 10px 0; font-size: 9.5pt; }
    .info-box strong { color: #6366f1; }
    .topic-block { margin-bottom: 24px; }
    .command-grid { display: block; }
    .command-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; margin-bottom: 10px; page-break-inside: avoid; }
    .command-header { margin-bottom: 6px; }
    .command-header code { font-size: 11pt; font-weight: 700; color: #6366f1; background: none; }
    .cmd-tag { display: inline-block; background: #eff6ff; color: #6366f1; padding: 2px 6px; border-radius: 10px; font-size: 7.5pt; font-weight: 700; text-transform: uppercase; margin-left: 6px; }
    .styled-table { width: 100%; }
    .styled-table th { background: #f1f5f9; }
    footer, header, nav, .nav-actions, .hero-actions, .learning-section, .module-progress, .footer, .resource-grid, .inline-download-form { display: none !important; }
    @page { margin: 1.8cm; }
  </style>
</head>
<body>
  <div class="cover">
    <span class="pill">${config.emoji} ${courseName.charAt(0).toUpperCase() + courseName.slice(1)}</span>
    <h1>${config.title}</h1>
    <p>Curso completo com ${config.modules} módulos</p>
    <p style="margin-top:20px;font-size:10pt;">${config.subtitle}</p>
    <p style="margin-top:48px;font-size:9pt;color:#9ca3af;">CloudTrilhas — cloudtrilhas.com.br</p>
    <p style="font-size:9pt;color:#9ca3af;">Por Ricardo Simines Scopim</p>
  </div>
  ${modules.map((content, i) => `<div class="${i > 0 ? 'module-break' : ''}">${content}</div>`).join('\n')}
</body>
</html>`;

  console.log(`Generating PDF for: ${config.title}`);
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setContent(combinedHTML, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.pdf({
    path: outputFileFinal,
    format: 'A4',
    printBackground: true,
    margin: { top: '18mm', bottom: '18mm', left: '14mm', right: '14mm' },
    displayHeaderFooter: true,
    headerTemplate: `<div style="font-size:7.5pt;color:#9ca3af;width:100%;text-align:center;padding:0 40px;">CloudTrilhas — ${config.title}</div>`,
    footerTemplate: '<div style="font-size:7.5pt;color:#9ca3af;width:100%;text-align:center;padding:0 40px;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
  });
  await browser.close();
  console.log(`✅ PDF gerado: ${outputFileFinal}`);
}

generatePDF(COURSE).catch(console.error);
