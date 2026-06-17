/**
 * CloudTrilhas — Trail Gate (Identificação de Usuário)
 * 
 * Componente reutilizável que bloqueia acesso ao conteúdo de trilhas
 * até o usuário se identificar. Dados são salvos no localStorage
 * e enviados ao backend para registro no DynamoDB.
 * 
 * Uso: Incluir este script em qualquer página de módulo/trilha.
 * <script src="../trail-gate.js"></script> (ou src="trail-gate.js" na raiz)
 * 
 * O script deve ser carregado ANTES de config.js e app.js.
 */

(function() {
  'use strict';

  var STORAGE_KEY = 'cloudtrilhas_trail_user';

  // ===== VERIFICAR SE USUÁRIO JÁ ESTÁ IDENTIFICADO =====
  function getSavedUser() {
    try {
      var data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        var parsed = JSON.parse(data);
        if (parsed.name && parsed.email && parsed.source && parsed.institution) {
          return parsed;
        }
      }
    } catch(e) {}
    return null;
  }

  function saveUser(userData) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    } catch(e) {}
  }

  // ===== ENVIAR DADOS AO BACKEND =====
  function sendToBackend(userData) {
    var apiUrl = '';
    try {
      if (window.CLOUDTRILHAS_CONFIG && window.CLOUDTRILHAS_CONFIG.apiEndpoint) {
        apiUrl = window.CLOUDTRILHAS_CONFIG.apiEndpoint;
      }
    } catch(e) {}

    // Fallback para URL hardcoded (mesmo padrão do simulado.js)
    if (!apiUrl) {
      apiUrl = 'https://eillhz5fkl.execute-api.us-west-2.amazonaws.com/leads';
    }

    var page = window.location.pathname.split('/').filter(Boolean).slice(-2).join('/');

    try {
      fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'trail-access',
          name: userData.name,
          email: userData.email,
          source: userData.source,
          institution: userData.institution,
          page: page,
          consent: true,
          material: page
        })
      }).catch(function() {});
    } catch(e) {}
  }

  // ===== CRIAR OVERLAY DO FORMULÁRIO =====
  function createGateOverlay() {
    // Esconde o conteúdo principal
    var mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.style.display = 'none';
    }

    // Cria overlay
    var overlay = document.createElement('div');
    overlay.id = 'trailGateOverlay';
    overlay.innerHTML = '' +
      '<div class="trail-gate-backdrop">' +
      '  <div class="trail-gate-card">' +
      '    <div class="trail-gate-icon">🎓</div>' +
      '    <h2 class="trail-gate-title">Antes de iniciar esta trilha</h2>' +
      '    <p class="trail-gate-desc">Preencha seus dados para que possamos entender melhor nosso público e aprimorar nossos conteúdos.</p>' +
      '    <form id="trailGateForm" class="trail-gate-form">' +
      '      <div class="trail-gate-field">' +
      '        <label for="tgName">Nome Completo *</label>' +
      '        <input type="text" id="tgName" placeholder="Seu nome completo" required autocomplete="name" />' +
      '      </div>' +
      '      <div class="trail-gate-field">' +
      '        <label for="tgEmail">E-mail *</label>' +
      '        <input type="email" id="tgEmail" placeholder="seu@email.com" required autocomplete="email" />' +
      '      </div>' +
      '      <div class="trail-gate-field">' +
      '        <label for="tgSource">Como nos conheceu? *</label>' +
      '        <select id="tgSource" required>' +
      '          <option value="">Selecione...</option>' +
      '          <option value="LinkedIn">LinkedIn</option>' +
      '          <option value="Instagram">Instagram</option>' +
      '          <option value="Indicação de amigo">Indicação de amigo</option>' +
      '          <option value="Escola da Nuvem">Escola da Nuvem</option>' +
      '          <option value="AWS Community">AWS Community</option>' +
      '          <option value="Evento">Evento</option>' +
      '          <option value="Google">Google</option>' +
      '          <option value="Outro">Outro</option>' +
      '        </select>' +
      '      </div>' +
      '      <div class="trail-gate-field">' +
      '        <label for="tgInstitution">Instituição que indicou *</label>' +
      '        <input type="text" id="tgInstitution" placeholder="Ex: Escola da Nuvem, Empresa, Universidade..." required />' +
      '      </div>' +
      '      <p class="trail-gate-error" id="tgError"></p>' +
      '      <button type="submit" class="trail-gate-btn">Acessar Conteúdo →</button>' +
      '    </form>' +
      '  </div>' +
      '</div>';

    // Insere após o header
    var header = document.querySelector('header');
    if (header && header.nextSibling) {
      header.parentNode.insertBefore(overlay, header.nextSibling);
    } else {
      document.body.appendChild(overlay);
    }

    // Event listener do formulário
    document.getElementById('trailGateForm').addEventListener('submit', function(e) {
      e.preventDefault();

      var name = document.getElementById('tgName').value.trim();
      var email = document.getElementById('tgEmail').value.trim();
      var source = document.getElementById('tgSource').value;
      var institution = document.getElementById('tgInstitution').value.trim();
      var errorEl = document.getElementById('tgError');

      // Validações
      if (!name || !email || !source || !institution) {
        errorEl.textContent = 'Todos os campos são obrigatórios.';
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errorEl.textContent = 'Por favor, insira um e-mail válido.';
        return;
      }

      errorEl.textContent = '';

      var userData = {
        name: name,
        email: email,
        source: source,
        institution: institution,
        created_at: new Date().toISOString()
      };

      // Salvar no localStorage
      saveUser(userData);

      // Enviar ao backend (assíncrono, não bloqueia)
      sendToBackend(userData);

      // Também salva nos campos do simulado (compatibilidade)
      if (typeof window !== 'undefined') {
        localStorage.setItem('cloudtrilhas_user_name', name);
        localStorage.setItem('cloudtrilhas_user_email', email);
      }

      // Remover overlay e mostrar conteúdo
      unlockContent();
    });
  }

  function unlockContent() {
    var overlay = document.getElementById('trailGateOverlay');
    if (overlay) {
      overlay.remove();
    }
    var mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.style.display = '';
    }
  }

  // ===== INICIALIZAÇÃO =====
  function init() {
    var user = getSavedUser();
    if (user) {
      // Já identificado — acesso liberado
      // Registra acesso silenciosamente
      sendToBackend(user);
      return;
    }

    // Não identificado — bloquear conteúdo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createGateOverlay);
    } else {
      createGateOverlay();
    }
  }

  init();
})();
