/**
 * CloudTrilhas — Sandbox Redes (simuladores interativos, client-side)
 *
 * Três ferramentas de prática de redes, 100% no navegador (custo zero):
 *  1. Calculadora de Subnet / CIDR
 *  2. Simulador de Tabela de Roteamento (longest-prefix match)
 *  3. Visualizador do modelo OSI / TCP-IP
 * Mais exercícios guiados (com validação) e modo livre.
 */
(function () {
  'use strict';

  // ===================== UTILITÁRIOS DE IP =====================
  function ipToInt(ip) {
    var p = ip.trim().split('.');
    if (p.length !== 4) return null;
    var n = 0;
    for (var i = 0; i < 4; i++) {
      var o = parseInt(p[i], 10);
      if (isNaN(o) || o < 0 || o > 255) return null;
      n = (n * 256) + o;
    }
    return n >>> 0;
  }
  function intToIp(n) {
    return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
  }
  function maskFromPrefix(p) {
    if (p === 0) return 0;
    return (0xFFFFFFFF << (32 - p)) >>> 0;
  }
  function prefixFromMask(maskInt) {
    var c = 0, m = maskInt;
    for (var i = 0; i < 32; i++) { if (m & 0x80000000) c++; m = (m << 1) >>> 0; }
    return c;
  }

  // ===================== 1. CALCULADORA DE SUBNET =====================
  function calcularSubnet() {
    var ipStr = document.getElementById('subIp').value.trim();
    var pfxStr = document.getElementById('subPrefix').value.trim();
    var out = document.getElementById('subOut');

    var ip = ipToInt(ipStr);
    var prefix = parseInt(pfxStr, 10);
    if (ip === null) { out.innerHTML = '<span class="err">IP inválido. Ex: 192.168.1.10</span>'; return null; }
    if (isNaN(prefix) || prefix < 0 || prefix > 32) { out.innerHTML = '<span class="err">Prefixo inválido (0–32).</span>'; return null; }

    var mask = maskFromPrefix(prefix);
    var network = (ip & mask) >>> 0;
    var broadcast = (network | (~mask >>> 0)) >>> 0;
    var totalHosts = prefix >= 31 ? (prefix === 32 ? 1 : 2) : Math.pow(2, 32 - prefix);
    var usableHosts = prefix >= 31 ? (prefix === 32 ? 1 : 2) : (totalHosts - 2);
    var firstHost = prefix >= 31 ? network : (network + 1) >>> 0;
    var lastHost = prefix >= 31 ? broadcast : (broadcast - 1) >>> 0;

    var resultado = {
      rede: intToIp(network), broadcast: intToIp(broadcast),
      mascara: intToIp(mask), prefixo: prefix,
      primeiro: intToIp(firstHost), ultimo: intToIp(lastHost),
      hosts: usableHosts
    };

    out.innerHTML =
      linha('Endereço de rede', resultado.rede + '/' + prefix) +
      linha('Máscara', resultado.mascara) +
      linha('Broadcast', resultado.broadcast) +
      linha('Faixa utilizável', resultado.primeiro + ' — ' + resultado.ultimo) +
      linha('Hosts utilizáveis', resultado.hosts.toLocaleString('pt-BR')) +
      linha('Classe', classeIp(ip)) +
      linha('Tipo', ehPrivado(ip) ? 'Privado (RFC 1918)' : 'Público');

    _ultimoSubnet = resultado;
    return resultado;
  }
  function linha(k, v) {
    return '<div class="rslin"><span>' + k + '</span><strong>' + v + '</strong></div>';
  }
  function classeIp(ip) {
    var first = (ip >>> 24) & 255;
    if (first < 128) return 'A'; if (first < 192) return 'B';
    if (first < 224) return 'C'; if (first < 240) return 'D (multicast)';
    return 'E (reservado)';
  }
  function ehPrivado(ip) {
    var a = (ip >>> 24) & 255, b = (ip >>> 16) & 255;
    return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
  }
  var _ultimoSubnet = null;

  // ===================== 2. TABELA DE ROTEAMENTO =====================
  var rotas = [];
  function addRota() {
    var destStr = document.getElementById('rtDest').value.trim();
    var pfxStr = document.getElementById('rtPrefix').value.trim();
    var gw = document.getElementById('rtGw').value.trim();
    var msg = document.getElementById('rtMsg');
    msg.textContent = '';

    var dest = ipToInt(destStr);
    var prefix = parseInt(pfxStr, 10);
    if (dest === null && destStr !== '0.0.0.0') { msg.textContent = 'Destino inválido.'; return; }
    if (isNaN(prefix) || prefix < 0 || prefix > 32) { msg.textContent = 'Prefixo inválido.'; return; }
    var d = dest === null ? 0 : dest;
    rotas.push({ dest: (d & maskFromPrefix(prefix)) >>> 0, prefix: prefix, gw: gw || 'direto' });
    renderRotas();
    document.getElementById('rtDest').value = '';
    document.getElementById('rtPrefix').value = '';
    document.getElementById('rtGw').value = '';
  }
  function renderRotas() {
    var tb = document.getElementById('rtTable');
    if (!rotas.length) { tb.innerHTML = '<div class="rslin"><span>Nenhuma rota. 0.0.0.0/0 é a rota padrão.</span></div>'; return; }
    // ordena por prefixo desc (para exibir a ordem de preferência)
    var ord = rotas.slice().sort(function (a, b) { return b.prefix - a.prefix; });
    tb.innerHTML = ord.map(function (r) {
      return '<div class="rslin"><span>' + intToIp(r.dest) + '/' + r.prefix + '</span><strong>via ' + r.gw + '</strong></div>';
    }).join('');
  }
  function testarRota() {
    var alvoStr = document.getElementById('rtTest').value.trim();
    var out = document.getElementById('rtResult');
    var alvo = ipToInt(alvoStr);
    if (alvo === null) { out.innerHTML = '<span class="err">IP de destino inválido.</span>'; return null; }
    // longest-prefix match
    var melhor = null;
    for (var i = 0; i < rotas.length; i++) {
      var r = rotas[i];
      var m = maskFromPrefix(r.prefix);
      if (((alvo & m) >>> 0) === r.dest) {
        if (!melhor || r.prefix > melhor.prefix) melhor = r;
      }
    }
    if (!melhor) {
      out.innerHTML = '<span class="err">Sem rota para ' + alvoStr + ' (nem rota padrão). Pacote descartado.</span>';
      _ultimaRota = null;
      return null;
    }
    out.innerHTML = '✅ ' + alvoStr + ' → rota <strong>' + intToIp(melhor.dest) + '/' + melhor.prefix + '</strong> via <strong>' + melhor.gw + '</strong> (longest-prefix match)';
    _ultimaRota = melhor;
    return melhor;
  }
  var _ultimaRota = null;

  // ===================== 3. VISUALIZADOR OSI / TCP-IP =====================
  var CAMADAS = [
    { n: 7, nome: 'Aplicação', tcpip: 'Aplicação', ex: 'HTTP, DNS, SSH, FTP', pdu: 'Dados' },
    { n: 6, nome: 'Apresentação', tcpip: 'Aplicação', ex: 'TLS, SSL, JPEG, ASCII', pdu: 'Dados' },
    { n: 5, nome: 'Sessão', tcpip: 'Aplicação', ex: 'Sockets, RPC, NetBIOS', pdu: 'Dados' },
    { n: 4, nome: 'Transporte', tcpip: 'Transporte', ex: 'TCP, UDP (portas)', pdu: 'Segmento' },
    { n: 3, nome: 'Rede', tcpip: 'Internet', ex: 'IP, ICMP, roteadores', pdu: 'Pacote' },
    { n: 2, nome: 'Enlace', tcpip: 'Acesso à Rede', ex: 'Ethernet, MAC, switches', pdu: 'Quadro (Frame)' },
    { n: 1, nome: 'Física', tcpip: 'Acesso à Rede', ex: 'Cabos, sinais, hubs', pdu: 'Bits' }
  ];
  function renderOSI() {
    var cont = document.getElementById('osiStack');
    if (!cont) return;
    cont.innerHTML = CAMADAS.map(function (c) {
      return '<div class="osi-layer" data-n="' + c.n + '">' +
        '<div class="osi-num">' + c.n + '</div>' +
        '<div class="osi-info"><strong>' + c.nome + '</strong>' +
        '<small>TCP/IP: ' + c.tcpip + ' · PDU: ' + c.pdu + ' · ' + c.ex + '</small></div></div>';
    }).join('');
  }

  // ===================== BANCO DE EXERCÍCIOS =====================
  // Distribuição por dificuldade (proporcional à trilha de Redes)
  var EX = [
    // Básico
    { nivel: 'Básico', titulo: 'Endereço de rede', desc: 'Na calculadora, descubra o endereço de rede de 192.168.10.50/24.', dica: 'IP 192.168.10.50, prefixo 24', check: function () { return _ultimoSubnet && _ultimoSubnet.rede === '192.168.10.0' && _ultimoSubnet.prefixo === 24; } },
    { nivel: 'Básico', titulo: 'Broadcast', desc: 'Descubra o broadcast de 10.0.0.1/8.', dica: 'IP 10.0.0.1, prefixo 8', check: function () { return _ultimoSubnet && _ultimoSubnet.broadcast === '10.255.255.255'; } },
    { nivel: 'Básico', titulo: 'IP privado', desc: 'Verifique que 172.16.5.4/16 é um endereço privado (calcule na ferramenta).', dica: 'Classe B privada: 172.16–172.31', check: function () { return _ultimoSubnet && _ultimoSubnet.rede === '172.16.0.0'; } },
    // Intermediário
    { nivel: 'Intermediário', titulo: 'Quantos hosts?', desc: 'Calcule quantos hosts utilizáveis tem uma /26 (use qualquer IP, ex 192.168.1.0/26).', dica: '2^(32-26) - 2 = 62', check: function () { return _ultimoSubnet && _ultimoSubnet.prefixo === 26 && _ultimoSubnet.hosts === 62; } },
    { nivel: 'Intermediário', titulo: 'Sub-rede /30', desc: 'Calcule uma /30 (típica de links ponto-a-ponto). Use 10.0.0.0/30. Deve dar 2 hosts.', dica: 'IP 10.0.0.0 prefixo 30', check: function () { return _ultimoSubnet && _ultimoSubnet.prefixo === 30 && _ultimoSubnet.hosts === 2; } },
    { nivel: 'Intermediário', titulo: 'Adicionar rota', desc: 'Na tabela de roteamento, adicione a rota 192.168.1.0/24 via 10.0.0.1.', dica: 'Destino 192.168.1.0, prefixo 24, gateway 10.0.0.1', check: function () { return rotas.some(function (r) { return intToIp(r.dest) === '192.168.1.0' && r.prefix === 24; }); } },
    // Avançado
    { nivel: 'Avançado', titulo: 'Rota padrão', desc: 'Adicione uma rota padrão (0.0.0.0/0) via 10.0.0.254 e teste o destino 8.8.8.8 — deve usar a rota padrão.', dica: 'Destino 0.0.0.0 prefixo 0; depois teste 8.8.8.8', check: function () { return _ultimaRota && _ultimaRota.prefix === 0; } },
    { nivel: 'Avançado', titulo: 'Longest-prefix match', desc: 'Tendo 10.0.0.0/8 e 10.1.0.0/16 na tabela, teste 10.1.2.3 — a rota mais específica (/16) deve vencer.', dica: 'Adicione as duas rotas e teste 10.1.2.3', check: function () { return _ultimaRota && _ultimaRota.prefix === 16 && intToIp(_ultimaRota.dest) === '10.1.0.0'; } },
    // Profissional
    { nivel: 'Profissional', titulo: 'Camada do roteador', desc: 'No visualizador OSI, identifique: um roteador opera na camada 3. Clique na camada Rede (nº 3).', dica: 'Camada 3 = Rede (IP)', check: function () { return _osiSelecionada === 3; } },
    { nivel: 'Profissional', titulo: 'PDU do transporte', desc: 'Identifique a PDU da camada de Transporte clicando nela (camada 4). A PDU é "Segmento".', dica: 'Camada 4 = Transporte = Segmento', check: function () { return _osiSelecionada === 4; } }
  ];
  var _osiSelecionada = null;
  var exAtual = null, concluidos = {}, modoLivre = true;

  function verificar() {
    if (modoLivre || exAtual === null) return;
    var ex = EX[exAtual];
    var ok = false;
    try { ok = ex.check(); } catch (e) { ok = false; }
    var fb = document.getElementById('exFeedback');
    if (ok && fb) {
      concluidos[exAtual] = true;
      fb.className = 'info-box highlight';
      fb.style.display = 'block';
      fb.innerHTML = '<strong>✅ Exercício concluído!</strong>';
      renderExList();
      try {
        if (window.CloudTrilhasProgress) window.CloudTrilhasProgress.setModule('sandbox-redes', 'ex-' + exAtual, true);
      } catch (e) {}
    }
  }

  function renderExList() {
    var cont = document.getElementById('exList');
    if (!cont) return;
    var niveis = ['Básico', 'Intermediário', 'Avançado', 'Profissional'];
    var html = '';
    niveis.forEach(function (nivel) {
      var doN = EX.map(function (e, i) { return { e: e, i: i }; }).filter(function (o) { return o.e.nivel === nivel; });
      if (!doN.length) return;
      html += '<div class="ex-nivel">' + nivel + ' <small>(' + doN.filter(function (o) { return concluidos[o.i]; }).length + '/' + doN.length + ')</small></div>';
      doN.forEach(function (o) {
        var done = concluidos[o.i] ? '✅' : '▫️';
        var active = (exAtual === o.i) ? ' style="border-color:#6366f1;color:#fff"' : '';
        html += '<button class="ex-item" data-ex="' + o.i + '"' + active + '>' + done + ' ' + o.e.titulo + '</button>';
      });
    });
    cont.innerHTML = html;
    var btns = cont.querySelectorAll('.ex-item');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function () { selecionar(parseInt(this.getAttribute('data-ex'), 10)); });
    }
  }

  function selecionar(idx) {
    modoLivre = false; exAtual = idx;
    var ex = EX[idx];
    var painel = document.getElementById('exPainel');
    painel.style.display = 'block';
    document.getElementById('exNivel').textContent = ex.nivel;
    document.getElementById('exTitulo').textContent = ex.titulo;
    document.getElementById('exDesc').textContent = ex.desc;
    document.getElementById('exDica').textContent = '💡 ' + ex.dica;
    document.getElementById('exDica').style.display = 'none';
    document.getElementById('exFeedback').style.display = 'none';
    renderExList();
  }

  function modoLivreAtivar() {
    modoLivre = true; exAtual = null;
    document.getElementById('exPainel').style.display = 'none';
    renderExList();
  }

  // ===================== INIT =====================
  function init() {
    if (!document.getElementById('subOut')) return;
    renderOSI();
    renderRotas();
    renderExList();

    document.getElementById('subCalcBtn').addEventListener('click', function () { calcularSubnet(); verificar(); });
    document.getElementById('rtAddBtn').addEventListener('click', function () { addRota(); verificar(); });
    document.getElementById('rtTestBtn').addEventListener('click', function () { testarRota(); verificar(); });
    document.getElementById('modoLivreBtn').addEventListener('click', modoLivreAtivar);
    var dicaBtn = document.getElementById('exDicaBtn');
    if (dicaBtn) dicaBtn.addEventListener('click', function () {
      var d = document.getElementById('exDica');
      d.style.display = d.style.display === 'none' ? 'block' : 'none';
    });
    document.getElementById('rtClearBtn').addEventListener('click', function () {
      rotas = []; renderRotas(); document.getElementById('rtResult').innerHTML = '';
    });

    // Clique nas camadas OSI
    document.getElementById('osiStack').addEventListener('click', function (e) {
      var layer = e.target.closest ? e.target.closest('.osi-layer') : null;
      if (!layer) return;
      _osiSelecionada = parseInt(layer.getAttribute('data-n'), 10);
      var all = document.querySelectorAll('.osi-layer');
      for (var i = 0; i < all.length; i++) all[i].classList.remove('sel');
      layer.classList.add('sel');
      verificar();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
