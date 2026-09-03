/**
 * CloudTrilhas — Autenticação de alunos via Amazon Cognito
 *
 * Fala diretamente com a API do Cognito (cognito-idp) por fetch, sem SDK.
 * Fluxos: cadastro (SignUp), confirmação por código (ConfirmSignUp),
 * login (InitiateAuth USER_PASSWORD_AUTH), renovação de token (REFRESH_TOKEN_AUTH),
 * logout e verificação de sessão.
 *
 * Requer window.CLOUDTRILHAS_CONFIG.cognito = { region, userPoolId, clientId }
 * (gerado pelo config.js via Terraform).
 */
window.CloudTrilhasAuth = (function () {
  'use strict';

  var TOKENS_KEY = 'cloudtrilhas_auth_tokens';

  function cfg() {
    var c = (window.CLOUDTRILHAS_CONFIG && window.CLOUDTRILHAS_CONFIG.cognito) || {};
    return c;
  }

  function endpoint() {
    var region = cfg().region || 'us-west-2';
    return 'https://cognito-idp.' + region + '.amazonaws.com/';
  }

  // Chamada genérica à API do Cognito
  async function callCognito(target, body) {
    var resp = await fetch(endpoint(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-amz-json-1.1',
        'X-Amz-Target': 'AWSCognitoIdentityProviderService.' + target
      },
      body: JSON.stringify(body)
    });

    var data = {};
    try { data = await resp.json(); } catch (e) {}

    if (!resp.ok) {
      var msg = data.message || data.__type || 'Erro na autenticação';
      var err = new Error(traduzErro(data.__type, msg));
      err.code = data.__type;
      throw err;
    }
    return data;
  }

  // Traduz códigos de erro comuns do Cognito para português
  function traduzErro(code, fallback) {
    var mapa = {
      'UsernameExistsException': 'Este e-mail já está cadastrado.',
      'InvalidPasswordException': 'Senha fraca: use ao menos 8 caracteres, com maiúscula, minúscula e número.',
      'UserNotConfirmedException': 'Conta ainda não confirmada. Verifique o código enviado ao seu e-mail.',
      'CodeMismatchException': 'Código de verificação incorreto.',
      'ExpiredCodeException': 'Código expirado. Solicite um novo.',
      'NotAuthorizedException': 'E-mail ou senha incorretos.',
      'UserNotFoundException': 'E-mail ou senha incorretos.',
      'LimitExceededException': 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
      'InvalidParameterException': 'Dados inválidos. Verifique os campos.'
    };
    return mapa[code] || fallback;
  }

  // ===== Cadastro =====
  async function signUp(nome, email, senha) {
    return callCognito('SignUp', {
      ClientId: cfg().clientId,
      Username: email,
      Password: senha,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'name', Value: nome }
      ]
    });
  }

  // ===== Confirmar cadastro com código do e-mail =====
  async function confirmSignUp(email, codigo) {
    return callCognito('ConfirmSignUp', {
      ClientId: cfg().clientId,
      Username: email,
      ConfirmationCode: codigo
    });
  }

  // ===== Reenviar código de confirmação =====
  async function resendCode(email) {
    return callCognito('ResendConfirmationCode', {
      ClientId: cfg().clientId,
      Username: email
    });
  }

  // ===== Login =====
  async function signIn(email, senha) {
    var data = await callCognito('InitiateAuth', {
      ClientId: cfg().clientId,
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: { USERNAME: email, PASSWORD: senha }
    });
    if (data.AuthenticationResult) {
      saveTokens(data.AuthenticationResult, email);
    }
    return data;
  }

  // ===== Recuperação de senha =====
  async function forgotPassword(email) {
    return callCognito('ForgotPassword', {
      ClientId: cfg().clientId,
      Username: email
    });
  }

  async function confirmForgotPassword(email, codigo, novaSenha) {
    return callCognito('ConfirmForgotPassword', {
      ClientId: cfg().clientId,
      Username: email,
      ConfirmationCode: codigo,
      Password: novaSenha
    });
  }

  // ===== Cookie de sessão (lido pela CloudFront Function no edge) =====
  // Marca presença de sessão para o gate no edge. Não guarda o token em si.
  function setSessionCookie(maxAgeSeconds) {
    try {
      var secure = location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = 'ct_session=1; Path=/; Max-Age=' + maxAgeSeconds +
        '; SameSite=Lax' + secure;
    } catch (e) {}
  }

  function clearSessionCookie() {
    try {
      document.cookie = 'ct_session=; Path=/; Max-Age=0; SameSite=Lax';
    } catch (e) {}
  }

  // ===== Tokens =====
  function saveTokens(authResult, email) {
    var tokens = {
      idToken: authResult.IdToken,
      accessToken: authResult.AccessToken,
      refreshToken: authResult.RefreshToken,
      email: email || null,
      expiresAt: Date.now() + (authResult.ExpiresIn || 3600) * 1000
    };
    // preserva refreshToken em renovações (Cognito não o reenvia)
    if (!tokens.refreshToken) {
      var prev = getTokens();
      if (prev && prev.refreshToken) tokens.refreshToken = prev.refreshToken;
      if (prev && prev.email) tokens.email = tokens.email || prev.email;
    }
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
    // Cookie de sessão para o gate no edge (validade alinhada ao refresh token)
    setSessionCookie(30 * 24 * 3600);
  }

  function getTokens() {
    try { return JSON.parse(localStorage.getItem(TOKENS_KEY)); }
    catch (e) { return null; }
  }

  async function refreshSession() {
    var tokens = getTokens();
    if (!tokens || !tokens.refreshToken) return false;
    try {
      var data = await callCognito('InitiateAuth', {
        ClientId: cfg().clientId,
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        AuthParameters: { REFRESH_TOKEN: tokens.refreshToken }
      });
      if (data.AuthenticationResult) {
        saveTokens(data.AuthenticationResult, tokens.email);
        return true;
      }
    } catch (e) {
      logout();
    }
    return false;
  }

  // Sessão válida? (renova se expirou)
  async function isAuthenticated() {
    var tokens = getTokens();
    if (!tokens || !tokens.accessToken) { clearSessionCookie(); return false; }
    if (Date.now() < tokens.expiresAt - 60000) {
      setSessionCookie(30 * 24 * 3600); // mantém o cookie de sessão vivo
      return true;
    }
    var renovado = await refreshSession(); // tenta renovar
    if (!renovado) clearSessionCookie();
    return renovado;
  }

  function currentUserEmail() {
    var t = getTokens();
    return t ? t.email : null;
  }

  // Decodifica o payload do idToken (JWT) sem validar assinatura (só leitura de claims)
  function decodeIdToken() {
    var t = getTokens();
    if (!t || !t.idToken) return null;
    try {
      var payload = t.idToken.split('.')[1];
      payload = payload.replace(/-/g, '+').replace(/_/g, '/');
      // padding
      while (payload.length % 4) { payload += '='; }
      return JSON.parse(atob(payload));
    } catch (e) {
      return null;
    }
  }

  // Retorna a lista de grupos Cognito do usuário (cognito:groups)
  function currentUserGroups() {
    var claims = decodeIdToken();
    if (!claims) return [];
    var g = claims['cognito:groups'];
    if (!g) return [];
    return Array.isArray(g) ? g : [g];
  }

  // O usuário pertence ao grupo 'admin'?
  function isAdmin() {
    return currentUserGroups().indexOf('admin') !== -1;
  }

  function logout() {
    localStorage.removeItem(TOKENS_KEY);
    clearSessionCookie();
  }

  return {
    signUp: signUp,
    confirmSignUp: confirmSignUp,
    resendCode: resendCode,
    signIn: signIn,
    forgotPassword: forgotPassword,
    confirmForgotPassword: confirmForgotPassword,
    refreshSession: refreshSession,
    isAuthenticated: isAuthenticated,
    currentUserEmail: currentUserEmail,
    currentUserGroups: currentUserGroups,
    isAdmin: isAdmin,
    logout: logout,
    getTokens: getTokens
  };
})();
