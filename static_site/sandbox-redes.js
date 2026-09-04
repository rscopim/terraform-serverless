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
    { n: 7, nome: 'Aplicação', tcpip: 'Aplicação', ex: 'HTTP, HTTPS, DNS, SSH, FTP, SMTP', pdu: 'Dados', papel: 'Interface com o usuário e as aplicações de rede. É onde vivem os protocolos que você usa no dia a dia (navegador, e-mail, etc.).', dispositivo: 'Gateways de aplicação, proxies' },
    { n: 6, nome: 'Apresentação', tcpip: 'Aplicação', ex: 'TLS, SSL, JPEG, ASCII, UTF-8', pdu: 'Dados', papel: 'Traduz, criptografa e comprime os dados para um formato que a aplicação entende. Responsável por codificação e segurança (TLS).', dispositivo: '—' },
    { n: 5, nome: 'Sessão', tcpip: 'Aplicação', ex: 'Sockets, RPC, NetBIOS', pdu: 'Dados', papel: 'Abre, mantém e encerra as sessões (diálogos) entre duas máquinas. Controla quem fala e quando.', dispositivo: '—' },
    { n: 4, nome: 'Transporte', tcpip: 'Transporte', ex: 'TCP, UDP (portas 80, 443, 22...)', pdu: 'Segmento', papel: 'Entrega fim-a-fim entre processos. TCP garante entrega e ordem; UDP é rápido e sem garantia. Usa portas para identificar aplicações.', dispositivo: 'Firewalls (camada 4)' },
    { n: 3, nome: 'Rede', tcpip: 'Internet', ex: 'IP, ICMP, roteamento', pdu: 'Pacote', papel: 'Endereçamento lógico (IP) e roteamento entre redes diferentes. Decide o melhor caminho de uma rede a outra.', dispositivo: 'Roteadores' },
    { n: 2, nome: 'Enlace', tcpip: 'Acesso à Rede', ex: 'Ethernet, MAC, ARP, VLAN', pdu: 'Quadro (Frame)', papel: 'Comunicação dentro da mesma rede local usando endereços físicos (MAC). Detecta erros de transmissão.', dispositivo: 'Switches, bridges' },
    { n: 1, nome: 'Física', tcpip: 'Acesso à Rede', ex: 'Cabos, fibra, sinais, Wi-Fi (rádio)', pdu: 'Bits', papel: 'Transmissão dos bits crus pelo meio físico (elétrico, óptico ou rádio). Define conectores, voltagem e taxa.', dispositivo: 'Hubs, repetidores, cabos' }
  ];
  function renderOSI() {
    var cont = document.getElementById('osiStack');
    if (!cont) return;
    cont.innerHTML = CAMADAS.map(function (c) {
      return '<div class="osi-layer" data-n="' + c.n + '">' +
        '<div class="osi-num">' + c.n + '</div>' +
        '<div class="osi-info"><strong>' + c.nome + '</strong>' +
        '<small>TCP/IP: ' + c.tcpip + ' · PDU: ' + c.pdu + '</small></div></div>';
    }).join('');
  }
  function mostrarDetalheOSI(n) {
    var det = document.getElementById('osiDetalhe');
    if (!det) return;
    var c = null;
    for (var i = 0; i < CAMADAS.length; i++) { if (CAMADAS[i].n === n) { c = CAMADAS[i]; break; } }
    if (!c) { det.style.display = 'none'; return; }
    det.style.display = 'block';
    det.innerHTML =
      '<h4 style="margin:0 0 6px;color:#fff">Camada ' + c.n + ' — ' + c.nome + '</h4>' +
      '<p style="margin:0 0 10px;color:#cbd5e1;font-size:0.88rem">' + c.papel + '</p>' +
      linha('Equivalente TCP/IP', c.tcpip) +
      linha('PDU (unidade de dados)', c.pdu) +
      linha('Protocolos/exemplos', c.ex) +
      linha('Dispositivos típicos', c.dispositivo);
  }

  // ===================== 4. MONTAR REDE (topologia + roteamento) =====================
  // O aluno escolhe 5/10/15/20 dispositivos, o simulador gera sub-redes e o
  // aluno cria as rotas entre elas. Valida se todas as sub-redes ficam
  // alcançáveis a partir do roteador principal.
  var _rede = null; // { tamanho, subnets:[{nome,cidr,rede,prefix}], enlaces:[] }

  function gerarRede(tamanho) {
    // Distribui os dispositivos em N sub-redes /24 dentro de 10.0.x.0/24
    var nSubnets;
    if (tamanho <= 5) nSubnets = 2;
    else if (tamanho <= 10) nSubnets = 3;
    else if (tamanho <= 15) nSubnets = 4;
    else nSubnets = 5;

    var subnets = [];
    for (var i = 0; i < nSubnets; i++) {
      subnets.push({
        nome: 'LAN-' + (i + 1),
        cidr: '10.0.' + i + '.0/24',
        rede: '10.0.' + i + '.0',
        prefix: 24,
        gw: '10.0.' + i + '.1'
      });
    }
    var porSubnet = Math.floor(tamanho / nSubnets);
    var resto = tamanho % nSubnets;
    for (var j = 0; j < subnets.length; j++) {
      subnets[j].hosts = porSubnet + (j < resto ? 1 : 0);
    }
    _rede = { tamanho: tamanho, nSubnets: nSubnets, subnets: subnets, rotas: [] };
    renderRede();
  }

  function renderRede() {
    var cont = document.getElementById('redeMapa');
    var sel = document.getElementById('redeRotaDe');
    var sel2 = document.getElementById('redeRotaPara');
    if (!cont) return;
    if (!_rede) { cont.innerHTML = '<div class="rslin"><span>Escolha um tamanho e clique em "Gerar rede".</span></div>'; return; }

    var html = '<div class="rslin"><span><strong>Roteador central (R1)</strong></span><strong>gateway de todas as LANs</strong></div>';
    _rede.subnets.forEach(function (s) {
      html += '<div class="rslin"><span>🖧 ' + s.nome + ' — ' + s.cidr + '</span><strong>' + s.hosts + ' dispositivo(s) · GW ' + s.gw + '</strong></div>';
    });
    // rotas já criadas
    if (_rede.rotas.length) {
      html += '<div style="margin-top:10px;color:#94a3b8;font-size:0.8rem">Rotas criadas:</div>';
      _rede.rotas.forEach(function (r) {
        html += '<div class="rslin"><span>' + r.de + ' → ' + r.para + '</span><strong>via R1</strong></div>';
      });
    }
    cont.innerHTML = html;

    // popular selects
    if (sel && sel2) {
      var opts = _rede.subnets.map(function (s) { return '<option value="' + s.nome + '">' + s.nome + '</option>'; }).join('');
      sel.innerHTML = opts;
      sel2.innerHTML = opts;
    }
  }

  function addRotaRede() {
    var msg = document.getElementById('redeMsg');
    if (!_rede) { if (msg) msg.textContent = 'Gere uma rede primeiro.'; return; }
    var de = document.getElementById('redeRotaDe').value;
    var para = document.getElementById('redeRotaPara').value;
    if (msg) msg.textContent = '';
    if (de === para) { if (msg) msg.textContent = 'Escolha duas LANs diferentes.'; return; }
    // evita duplicata (rota é bidirecional via R1)
    var existe = _rede.rotas.some(function (r) {
      return (r.de === de && r.para === para) || (r.de === para && r.para === de);
    });
    if (existe) { if (msg) msg.textContent = 'Essa rota já existe.'; return; }
    _rede.rotas.push({ de: de, para: para });
    renderRede();
    verificar();
  }

  function redeConectividade() {
    // Conta quantos pares de LANs estão conectados (direto ou via cadeia por R1).
    // Como todas passam por R1, basta cada LAN ter ao menos uma rota para ser "roteável".
    if (!_rede) return { total: 0, conectadas: 0, completo: false };
    var grafo = {};
    _rede.subnets.forEach(function (s) { grafo[s.nome] = []; });
    _rede.rotas.forEach(function (r) { grafo[r.de].push(r.para); grafo[r.para].push(r.de); });
    // BFS a partir da primeira LAN
    var inicio = _rede.subnets[0].nome;
    var visitados = {}; var fila = [inicio]; visitados[inicio] = true;
    while (fila.length) {
      var atual = fila.shift();
      grafo[atual].forEach(function (v) { if (!visitados[v]) { visitados[v] = true; fila.push(v); } });
    }
    var conectadas = Object.keys(visitados).length;
    return { total: _rede.subnets.length, conectadas: conectadas, completo: conectadas === _rede.subnets.length };
  }

  function testarRede() {
    var out = document.getElementById('redeResult');
    if (!_rede) { if (out) out.innerHTML = '<span class="err">Gere uma rede primeiro.</span>'; return; }
    var c = redeConectividade();
    if (c.completo) {
      out.innerHTML = '✅ Todas as ' + c.total + ' LANs estão conectadas! A rede tem roteamento completo (todas alcançáveis via R1).';
    } else {
      out.innerHTML = '<span class="err">⚠️ ' + c.conectadas + '/' + c.total + ' LANs conectadas. Crie mais rotas até todas se comunicarem.</span>';
    }
    verificar();
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
    { nivel: 'Intermediário', titulo: 'Camada do switch', desc: 'No visualizador OSI, clique na camada em que um switch opera (camada 2 — Enlace).', dica: 'Switch usa MAC → camada 2 (Enlace)', check: function () { return _osiSelecionada === 2; } },
    { nivel: 'Intermediário', titulo: 'Rede pequena (5 dispositivos)', desc: 'No simulador "Montar Rede", gere uma rede de 5 dispositivos.', dica: 'Escolha 5 e clique em Gerar rede', check: function () { return _rede && _rede.tamanho === 5; } },
    // Avançado
    { nivel: 'Avançado', titulo: 'Rota padrão', desc: 'Adicione uma rota padrão (0.0.0.0/0) via 10.0.0.254 e teste o destino 8.8.8.8 — deve usar a rota padrão.', dica: 'Destino 0.0.0.0 prefixo 0; depois teste 8.8.8.8', check: function () { return _ultimaRota && _ultimaRota.prefix === 0; } },
    { nivel: 'Avançado', titulo: 'Longest-prefix match', desc: 'Tendo 10.0.0.0/8 e 10.1.0.0/16 na tabela, teste 10.1.2.3 — a rota mais específica (/16) deve vencer.', dica: 'Adicione as duas rotas e teste 10.1.2.3', check: function () { return _ultimaRota && _ultimaRota.prefix === 16 && intToIp(_ultimaRota.dest) === '10.1.0.0'; } },
    { nivel: 'Avançado', titulo: 'Rede de 10 dispositivos', desc: 'No simulador "Montar Rede", gere uma rede de 10 dispositivos e conecte TODAS as LANs (roteamento completo).', dica: 'Gere com 10, crie rotas entre as LANs e clique em Testar conectividade', check: function () { return _rede && _rede.tamanho === 10 && redeConectividade().completo; } },
    { nivel: 'Avançado', titulo: 'Rede de 15 dispositivos', desc: 'Monte uma rede de 15 dispositivos e obtenha roteamento completo entre todas as LANs.', dica: 'Gere com 15; conecte cada LAN à rede', check: function () { return _rede && _rede.tamanho === 15 && redeConectividade().completo; } },
    // Profissional
    { nivel: 'Profissional', titulo: 'Camada do roteador', desc: 'No visualizador OSI, identifique: um roteador opera na camada 3. Clique na camada Rede (nº 3).', dica: 'Camada 3 = Rede (IP)', check: function () { return _osiSelecionada === 3; } },
    { nivel: 'Profissional', titulo: 'PDU do transporte', desc: 'Identifique a PDU da camada de Transporte clicando nela (camada 4). A PDU é "Segmento".', dica: 'Camada 4 = Transporte = Segmento', check: function () { return _osiSelecionada === 4; } },
    { nivel: 'Profissional', titulo: 'Data center: rede de 20 dispositivos', desc: 'Monte a maior rede (20 dispositivos) e garanta roteamento completo entre todas as sub-redes.', dica: 'Gere com 20; conecte todas as LANs e teste a conectividade', check: function () { return _rede && _rede.tamanho === 20 && redeConectividade().completo; } },
    { nivel: 'Profissional', titulo: 'Segmentação /26', desc: 'Na calculadora, planeje uma sub-rede /26 para 60 hosts (ex.: 192.168.1.0/26).', dica: '/26 = 62 hosts utilizáveis', check: function () { return _ultimoSubnet && _ultimoSubnet.prefixo === 26; } }
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

    // Simulador Montar Rede
    var redeGerarBtn = document.getElementById('redeGerarBtn');
    if (redeGerarBtn) {
      redeGerarBtn.addEventListener('click', function () {
        var tam = parseInt(document.getElementById('redeTamanho').value, 10);
        gerarRede(tam);
        verificar();
      });
      document.getElementById('redeAddRotaBtn').addEventListener('click', function () { addRotaRede(); });
      document.getElementById('redeTestBtn').addEventListener('click', function () { testarRede(); });
      renderRede();
    }

    // Clique nas camadas OSI
    document.getElementById('osiStack').addEventListener('click', function (e) {
      var layer = e.target.closest ? e.target.closest('.osi-layer') : null;
      if (!layer) return;
      _osiSelecionada = parseInt(layer.getAttribute('data-n'), 10);
      var all = document.querySelectorAll('.osi-layer');
      for (var i = 0; i < all.length; i++) all[i].classList.remove('sel');
      layer.classList.add('sel');
      mostrarDetalheOSI(_osiSelecionada);
      verificar();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
