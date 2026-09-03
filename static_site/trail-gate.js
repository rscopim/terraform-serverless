/**
 * CloudTrilhas — Trail Gate (Autenticação de Alunos via Cognito)
 *
 * Bloqueia o acesso ao conteúdo das trilhas até o aluno estar autenticado
 * (sessão Cognito válida). Sem sessão → redireciona para login.html com o
 * parâmetro ?redirect apontando de volta para a página atual.
 *
 * COMPORTAMENTO FAIL-CLOSED: nada é liberado sem login. Qualquer falha
 * (auth.js não carregou, config ausente, erro de rede) resulta em bloqueio
 * e redirecionamento para o login — nunca em liberação do conteúdo.
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

  // ===================================================================
  // Gate de ORIGEM: no primeiro acesso a uma trilha, pergunta de onde o
  // aluno esta vindo (instituicao, empresa ou como nos conheceu). Campo
  // livre e OBRIGATORIO. So libera o conteudo apos responder.
  // ===================================================================
  function apiBase() {
    return (window.CLOUDTRILHAS_CONFIG && window.CLOUDTRILHAS_CONFIG.apiEndpoint) || '';
  }

  // Deriva a base da API removendo o caminho final (ex: /leads) -> raiz da API
  function apiRoot() {
    var ep = apiBase();
    if (!ep) return '';
    return ep.replace(/\/[^/]*$/, '');
  }

  function authHeaders() {
    var t = window.CloudTrilhasAuth && window.CloudTrilhasAuth.getTokens();
    var token = t ? t.accessToken : '';
    return token ? { 'Authorization': 'Bearer ' + token } : {};
  }

  function mostrarModalOrigem() {
    return new Promise(function (resolve) {
      var overlay = document.createElement('div');
      overlay.id = 'ctOrigemOverlay';
      overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(2,6,23,0.85);display:flex;align-items:center;justify-content:center;padding:20px;';
      overlay.innerHTML =
        '<div style="width:100%;max-width:440px;background:#0f172a;border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:32px;font-family:Inter,system-ui,sans-serif">' +
        '<h2 style="color:#fff;font-size:1.35rem;margin:0 0 8px">Antes de começar 👋</h2>' +
        '<p style="color:#94a3b8;font-size:0.92rem;margin:0 0 20px">De onde você está vindo? (instituição, empresa ou como nos conheceu)</p>' +
        '<input id="ctOrigemInput" type="text" maxlength="120" placeholder="Ex.: UFRJ, Empresa X, indicação, YouTube…" ' +
        'style="width:100%;padding:13px 14px;background:#0b1120;border:1px solid rgba(255,255,255,0.18);border-radius:10px;color:#fff;font-size:0.95rem;box-sizing:border-box" />' +
        '<p id="ctOrigemErro" style="color:#f87171;font-size:0.82rem;margin:8px 0 0;min-height:16px"></p>' +
        '<button id="ctOrigemBtn" style="width:100%;margin-top:14px;padding:13px;background:#6366f1;border:none;border-radius:10px;color:#fff;font-weight:700;font-size:0.95rem;cursor:pointer">Continuar</button>' +
        '</div>';
      document.body.appendChild(overlay);

      var input = overlay.querySelector('#ctOrigemInput');
      var erro = overlay.querySelector('#ctOrigemErro');
      var btn = overlay.querySelector('#ctOrigemBtn');
      setTimeout(function () { try { input.focus(); } catch (e) {} }, 50);

      async function enviar() {
        var val = (input.value || '').trim();
        if (val.length < 2) {
          erro.textContent = 'Por favor, preencha este campo para continuar.';
          input.focus();
          return;
        }
        btn.disabled = true; btn.textContent = 'Salvando…';
        var name = '';
        try { name = window.CloudTrilhasAuth ? (window.CloudTrilhasAuth.currentUserName && window.CloudTrilhasAuth.currentUserName()) || '' : ''; } catch (e) {}
        try {
          var resp = await fetch(apiRoot() + '/progress/origin', {
            method: 'POST',
            headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()),
            body: JSON.stringify({ origin: val, name: name })
          });
          if (!resp.ok) throw new Error('falha');
          overlay.remove();
          resolve(true);
        } catch (e) {
          btn.disabled = false; btn.textContent = 'Continuar';
          erro.textContent = 'Não foi possível salvar. Tente novamente.';
        }
      }

      btn.addEventListener('click', enviar);
      input.addEventListener('keydown', function (e) { if (e.key === 'Enter') enviar(); });
    });
  }

  // Verifica se o aluno ja informou a origem; se nao, exibe o modal (bloqueante)
  async function garantirOrigem() {
    if (!apiRoot()) return true; // sem API configurada, nao bloqueia
    try {
      var resp = await fetch(apiRoot() + '/progress', { headers: authHeaders() });
      if (!resp.ok) return true; // em caso de erro, nao trava o aluno
      var data = await resp.json();
      var origem = (data && data.origin ? String(data.origin) : '').trim();
      if (origem) return true;
      await mostrarModalOrigem();
      return true;
    } catch (e) {
      return true; // rede indisponivel: nao trava o acesso
    }
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

    // FAIL-CLOSED: qualquer situação que não seja uma sessão Cognito válida
    // e confirmada resulta em bloqueio (redireciona para o login).
    // Nada é liberado sem login — inclusive se auth.js falhar ao carregar.
    if (!window.CloudTrilhasAuth) {
      redirecionarParaLogin();
      return;
    }

    var ok = false;
    try {
      ok = await window.CloudTrilhasAuth.isAuthenticated();
    } catch (e) {
      ok = false;
    }

    if (ok === true) {
      // Exige a "origem" no primeiro acesso antes de liberar o conteúdo
      await garantirOrigem();
      revelarConteudo();
      registrarAcesso();
      registrarProgresso();
    } else {
      redirecionarParaLogin();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
