/**
 * CloudTrilhas — Progresso do Aluno (client)
 *
 * Camada de acesso ao progresso do aluno. Usa a API /progress autenticada
 * com o access token do Cognito. Mantém um cache em localStorage para
 * funcionar offline e responder rápido, sincronizando com o backend.
 *
 * Requer: config.js (progressEndpoint) e auth.js (CloudTrilhasAuth).
 */
window.CloudTrilhasProgress = (function () {
  'use strict';

  var CACHE_KEY = 'cloudtrilhas_progress_cache';

  function endpoint() {
    return (window.CLOUDTRILHAS_CONFIG && window.CLOUDTRILHAS_CONFIG.progressEndpoint) || '';
  }

  function token() {
    var t = window.CloudTrilhasAuth && window.CloudTrilhasAuth.getTokens();
    return t ? t.accessToken : null;
  }

  function readCache() {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || { trails: {}, quizzes: [] }; }
    catch (e) { return { trails: {}, quizzes: [] }; }
  }

  function writeCache(data) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch (e) {}
  }

  // Busca o progresso do backend (e atualiza o cache). Se falhar, usa o cache.
  async function fetch_() {
    var url = endpoint();
    var tk = token();
    if (!url || !tk) return readCache();
    try {
      var resp = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + tk }
      });
      if (resp.ok) {
        var data = await resp.json();
        writeCache(data);
        return data;
      }
    } catch (e) {}
    return readCache();
  }

  // Marca/desmarca um módulo como concluído (otimista no cache + envia ao backend)
  async function setModule(trail, module, done) {
    var data = readCache();
    data.trails = data.trails || {};
    data.trails[trail] = data.trails[trail] || {};
    if (done) {
      data.trails[trail][module] = { done: true, ts: Math.floor(Date.now() / 1000) };
    } else {
      delete data.trails[trail][module];
    }
    writeCache(data);

    var url = endpoint();
    var tk = token();
    if (!url || !tk) return data;
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + tk, 'Content-Type': 'application/json' },
        body: JSON.stringify({ trail: trail, module: module, done: !!done })
      });
    } catch (e) {}
    return data;
  }

  // Registra o resultado de um simulado
  async function addQuizResult(result) {
    var data = readCache();
    data.quizzes = data.quizzes || [];
    var entry = {
      trail: result.trail || 'desconhecida',
      quiz: result.quiz || '',
      score: result.score || 0,
      total: result.total || 0,
      percent: result.percent || 0,
      ts: Math.floor(Date.now() / 1000)
    };
    data.quizzes.push(entry);
    writeCache(data);

    var url = endpoint();
    var tk = token();
    if (!url || !tk) return data;
    try {
      await fetch(url + '/quiz', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + tk, 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
    } catch (e) {}
    return data;
  }

  // Marca o módulo da página atual como concluído (detecta trilha/módulo pela URL)
  async function markCurrentModuleDone() {
    var parts = window.location.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return;
    var file = parts[parts.length - 1].replace('.html', '');
    var trail = parts[parts.length - 2];
    return setModule(trail, file, true);
  }

  return {
    fetch: fetch_,
    setModule: setModule,
    addQuizResult: addQuizResult,
    markCurrentModuleDone: markCurrentModuleDone,
    readCache: readCache
  };
})();
