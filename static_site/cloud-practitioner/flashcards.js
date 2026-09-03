/**
 * CloudTrilhas — Flash Cards Cloud Practitioner (lógica de UI)
 * Depende de flashcards-data.js (window.CCP_FLASHCARDS).
 */
(function () {
  'use strict';

  var TODOS = (window.CCP_FLASHCARDS || []).slice();
  var deck = TODOS.slice();
  var idx = 0;

  var elCard = document.getElementById('fcCard');
  var elCat = document.getElementById('fcCat');
  var elService = document.getElementById('fcService');
  var elDesc = document.getElementById('fcDesc');
  var elKey = document.getElementById('fcKey');
  var elCounter = document.getElementById('fcCounter');
  var elCategoria = document.getElementById('fcCategoria');
  var elPrev = document.getElementById('fcPrev');
  var elNext = document.getElementById('fcNext');
  var elArea = document.getElementById('fcArea');
  var elEmpty = document.getElementById('fcEmpty');

  if (!elCard) return;

  // Popula o filtro de categorias (ordem de aparição na planilha)
  function popularCategorias() {
    var vistas = [];
    TODOS.forEach(function (c) { if (vistas.indexOf(c.categoria) === -1) vistas.push(c.categoria); });
    var html = '<option value="">Todas as categorias (' + TODOS.length + ')</option>';
    vistas.forEach(function (cat) {
      var n = TODOS.filter(function (c) { return c.categoria === cat; }).length;
      html += '<option value="' + cat.replace(/"/g, '&quot;') + '">' + cat + ' (' + n + ')</option>';
    });
    elCategoria.innerHTML = html;
  }

  function aplicarFiltro() {
    var cat = elCategoria.value;
    deck = cat ? TODOS.filter(function (c) { return c.categoria === cat; }) : TODOS.slice();
    idx = 0;
    render();
  }

  function embaralhar() {
    for (var i = deck.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = deck[i]; deck[i] = deck[j]; deck[j] = t;
    }
    idx = 0;
    render();
  }

  function virar() {
    elCard.classList.toggle('flipped');
  }

  function desvirar() {
    elCard.classList.remove('flipped');
  }

  function ir(delta) {
    if (!deck.length) return;
    desvirar();
    idx = (idx + delta + deck.length) % deck.length;
    // pequeno atraso para a carta desvirar antes de trocar o conteúdo
    setTimeout(render, elCard.classList.contains('flipped') ? 250 : 0);
  }

  function render() {
    if (!deck.length) {
      elArea.style.display = 'none';
      elEmpty.style.display = 'block';
      elCounter.textContent = '0 / 0';
      return;
    }
    elArea.style.display = '';
    elEmpty.style.display = 'none';

    var c = deck[idx];
    elCat.textContent = c.categoria;
    elService.textContent = c.servico;
    elDesc.textContent = c.oque || '';

    if (c.chave && c.chave.trim()) {
      elKey.className = 'fc-key';
      elKey.textContent = c.chave;
    } else {
      elKey.className = 'fc-key fc-nokey';
      elKey.textContent = 'Sem palavra-chave definida — foque em "para que serve".';
    }

    elCounter.textContent = (idx + 1) + ' / ' + deck.length;
    elPrev.disabled = deck.length <= 1;
    elNext.disabled = deck.length <= 1;
  }

  // Eventos
  elCard.addEventListener('click', virar);
  elPrev.addEventListener('click', function () { ir(-1); });
  elNext.addEventListener('click', function () { ir(1); });
  elCategoria.addEventListener('change', aplicarFiltro);
  document.getElementById('fcShuffle').addEventListener('click', embaralhar);
  document.getElementById('fcReset').addEventListener('click', function () {
    elCategoria.value = '';
    aplicarFiltro();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { ir(1); }
    else if (e.key === 'ArrowLeft') { ir(-1); }
    else if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); virar(); }
  });

  popularCategorias();
  render();
})();
