/**
 * CloudTrilhas — Trail Gate (Autenticação de Alunos via Cognito)
 *
 * Bloqueia o acesso ao conteúdo das trilhas até o aluno estar autenticado
 * (sessão Cognito válida). Sem sessão → redireciona para login.html com o
 * parâmetro ?redirect apontando de volta para a página atual.
 *
 * É AUTO-SUFICIENTE: carrega dinamicamente config.js e auth.js caso ainda
 * não estejam presentes, então não depende da ordem dos <script> na página.
 * Basta incluir <script src="../trail-gate.js"></script> (ou "trail-gate.js"
 * na raiz) em qualquer página de trilha.
 *
 * Nota de segurança: por ser um site estático, este gate é uma barreira de
 * navegação. O login Cognito é seguro, mas o HTML ainda pode ser baixado por
 * quem tiver a URL exata (ver PLANO — decisão de não usar Lambda@Edge para
 * não impactar o custo do CloudFront).
 */
(function () {
  'use strict';

  // Descobre o prefixo relativo com base no caminho deste próprio script
  function basePrefix() {
    try {
      var scripts = document.getElementsByTagName('script');
      for (var i = 0; i < scripts.length; i++) {
        var src = scripts[i].getAttribute('src') || '';
        if (src.indexOf('trail-gate.js') !== -1) {
          return src.replace('trail-gate.js', '');
        }
      }
    } catch (e) {}
    return '';
  }
  var PREFIX = basePrefix();

  // Esconde o conteúdo imediatamente para evitar "flash" antes da checagem
  var styleHide = document.createElement('style');
  styleHide.id = 'tgHideStyle';
  styleHide.textContent = 'main{visibility:hidden}';
  (document.head || document.documentElement).appendChild(styleHide);

  function revelarConteudo() {
    var s = document.getElementById('tgHideStyle');
    if (s) s.remove();
  }

  function redirecionarParaLogin() {
    var atual = window.location.pathname + window.location.search;
    // login.html está na raiz do site
    var loginUrl = PREFIX + 'login.html?redirect=' + encodeURIComponent(atual);
    window.location.replace(loginUrl);
  }

  // Carrega um script dinamicamente (uma vez)
  function carregarScript(src) {
    return new Promise(function (resolve) {
      // Já carregado?
      var existentes = document.getElementsByTagName('script');
      for (var i = 0; i < existentes.length; i++) {
        var s = existentes[i].getAttribute('src') || '';
        if (s.indexOf(src) !== -1) { resolve(); return; }
      }
      var el = document.createElement('script');
      el.src = PREFIX + src;
      el.onload = function () { resolve(); };
      el.onerror = function () { resolve(); };
      document.head.appendChild(el);
    });
  }

  // Registra o acesso à trilha no backend (analytics), sem bloquear
  function registrarAcesso() {
    try {
      var apiUrl = (window.CLOUDTRILHAS_CONFIG && window.CLOUDTRILHAS_CONFIG.apiEndpoint) || '';
      if (!apiUrl) return;
      var email = window.CloudTrilhasAuth ? window.CloudTrilhasAuth.currentUserEmail() : null;
      var page = window.location.pathname.split('/').filter(Boolean).slice(-2).join('/');
      fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'trail-access', email: email, page: page, consent: true, material: page })
      }).catch(function () {});
    } catch (e) {}
  }

  // Registra progresso do módulo atual (marca como concluído ao abrir)
  async function registrarProgresso() {
    try {
      if (!window.CloudTrilhasProgress) { await carregarScript('progress.js'); }
      if (window.CloudTrilhasProgress && /modulo-/.test(window.location.pathname)) {
        window.CloudTrilhasProgress.markCurrentModuleDone();
      }
    } catch (e) {}
  }

  async function init() {
    // Garante que config.js e auth.js estão carregados
    if (!window.CLOUDTRILHAS_CONFIG) { await carregarScript('config.js'); }
    if (!window.CloudTrilhasAuth) { await carregarScript('auth.js'); }

    // Se mesmo assim faltou o auth (falha de rede), não trava o site
    if (!window.CloudTrilhasAuth) {
      revelarConteudo();
      return;
    }

    try {
      var ok = await window.CloudTrilhasAuth.isAuthenticated();
      if (ok) {
        revelarConteudo();
        registrarAcesso();
        registrarProgresso();
      } else {
        redirecionarParaLogin();
      }
    } catch (e) {
      redirecionarParaLogin();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
