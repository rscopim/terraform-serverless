/**
 * CloudTrilhas — Sandbox Linux (terminal simulado, client-side)
 *
 * Simula um shell Linux com um filesystem em memória. Interpreta comandos
 * comuns e valida exercícios por nível (baseado na trilha Linux).
 * Roda 100% no navegador — sem backend, sem custo.
 *
 * Modos: exercícios guiados (com validação) e prática livre.
 */
(function () {
  'use strict';

  // ===================== FILESYSTEM EM MEMÓRIA =====================
  // Estrutura: nós {type:'dir'|'file', name, children?, content?, mode}
  function novoFS() {
    return {
      type: 'dir', name: '/', mode: 'rwxr-xr-x', children: {
        home: {
          type: 'dir', name: 'home', mode: 'rwxr-xr-x', children: {
            aluno: {
              type: 'dir', name: 'aluno', mode: 'rwxr-xr-x', children: {
                'readme.txt': { type: 'file', name: 'readme.txt', mode: 'rw-r--r--', content: 'Bem-vindo ao sandbox Linux da CloudTrilhas!\n' },
                'notas.txt': { type: 'file', name: 'notas.txt', mode: 'rw-r--r--', content: 'linha 1\nlinha 2 importante\nlinha 3\n' },
                projetos: { type: 'dir', name: 'projetos', mode: 'rwxr-xr-x', children: {} }
              }
            }
          }
        },
        etc: {
          type: 'dir', name: 'etc', mode: 'rwxr-xr-x', children: {
            'hosts': { type: 'file', name: 'hosts', mode: 'rw-r--r--', content: '127.0.0.1 localhost\n' }
          }
        },
        var: {
          type: 'dir', name: 'var', mode: 'rwxr-xr-x', children: {
            log: {
              type: 'dir', name: 'log', mode: 'rwxr-xr-x', children: {
                'syslog': { type: 'file', name: 'syslog', mode: 'rw-r--r--', content: 'Jan 1 00:00:01 server systemd: Started.\nJan 1 00:00:02 server sshd: Accepted.\nJan 1 00:00:03 server kernel: ERROR disk full\n' }
              }
            }
          }
        }
      }
    };
  }

  var fs, cwd; // cwd = array de segmentos, ex: ['home','aluno']

  function reset() {
    fs = novoFS();
    cwd = ['home', 'aluno'];
  }

  function getNode(pathSegs) {
    var node = fs;
    for (var i = 0; i < pathSegs.length; i++) {
      if (node.type !== 'dir' || !node.children[pathSegs[i]]) return null;
      node = node.children[pathSegs[i]];
    }
    return node;
  }

  // Resolve um caminho (absoluto ou relativo) para array de segmentos
  function resolvePath(p) {
    var segs;
    if (p.charAt(0) === '/') {
      segs = p.split('/').filter(Boolean);
    } else if (p === '~' || p.indexOf('~/') === 0) {
      segs = ['home', 'aluno'].concat(p.replace(/^~\/?/, '').split('/').filter(Boolean));
    } else {
      segs = cwd.concat(p.split('/').filter(Boolean));
    }
    var out = [];
    for (var i = 0; i < segs.length; i++) {
      if (segs[i] === '.') continue;
      if (segs[i] === '..') { out.pop(); continue; }
      out.push(segs[i]);
    }
    return out;
  }

  function pathStr() {
    return '/' + cwd.join('/');
  }
  function promptStr() {
    var home = (cwd.length >= 2 && cwd[0] === 'home' && cwd[1] === 'aluno');
    var shown = home ? '~' + (cwd.length > 2 ? '/' + cwd.slice(2).join('/') : '') : pathStr();
    return 'aluno@cloudtrilhas:' + shown + '$ ';
  }

  // ===================== INTERPRETADOR DE COMANDOS =====================
  function exec(linha) {
    var parts = linha.trim().split(/\s+/);
    var cmd = parts[0];
    var args = parts.slice(1);
    if (!cmd) return '';

    switch (cmd) {
      case 'pwd': return pathStr();
      case 'whoami': return 'aluno';
      case 'echo': return args.join(' ').replace(/^["']|["']$/g, '');
      case 'clear': return '__CLEAR__';
      case 'help':
        return 'Comandos: ls, cd, pwd, cat, echo, mkdir, touch, rm, cp, mv, chmod, grep, head, tail, wc, whoami, clear, help';

      case 'ls': {
        var alvo = args.filter(function (a) { return a.charAt(0) !== '-'; })[0];
        var longo = args.indexOf('-l') !== -1 || args.indexOf('-la') !== -1 || args.indexOf('-al') !== -1;
        var todos = /a/.test((args.find(function (a) { return a.charAt(0) === '-'; }) || ''));
        var segs = alvo ? resolvePath(alvo) : cwd;
        var node = getNode(segs);
        if (!node) return 'ls: não foi possível acessar \'' + alvo + '\': arquivo ou diretório inexistente';
        if (node.type === 'file') return node.name;
        var names = Object.keys(node.children);
        if (!names.length) return '';
        if (longo) {
          return names.map(function (n) {
            var c = node.children[n];
            var t = c.type === 'dir' ? 'd' : '-';
            return t + c.mode + ' aluno aluno ' + n;
          }).join('\n');
        }
        return names.join('  ');
      }

      case 'cd': {
        var dest = args[0] || '~';
        var segs = resolvePath(dest);
        var node = getNode(segs);
        if (!node) return 'cd: ' + dest + ': arquivo ou diretório inexistente';
        if (node.type !== 'dir') return 'cd: ' + dest + ': não é um diretório';
        cwd = segs;
        return '';
      }

      case 'cat': {
        if (!args[0]) return 'cat: uso: cat <arquivo>';
        var node = getNode(resolvePath(args[0]));
        if (!node) return 'cat: ' + args[0] + ': arquivo inexistente';
        if (node.type === 'dir') return 'cat: ' + args[0] + ': é um diretório';
        return node.content.replace(/\n$/, '');
      }

      case 'mkdir': {
        if (!args.length) return 'mkdir: uso: mkdir <dir>';
        var alvos = args.filter(function (a) { return a !== '-p'; });
        for (var m = 0; m < alvos.length; m++) {
          var segs = resolvePath(alvos[m]);
          var nome = segs[segs.length - 1];
          var pai = getNode(segs.slice(0, -1));
          if (!pai || pai.type !== 'dir') return 'mkdir: não foi possível criar \'' + alvos[m] + '\'';
          if (pai.children[nome]) return 'mkdir: não foi possível criar \'' + alvos[m] + '\': já existe';
          pai.children[nome] = { type: 'dir', name: nome, mode: 'rwxr-xr-x', children: {} };
        }
        return '';
      }

      case 'touch': {
        if (!args.length) return 'touch: uso: touch <arquivo>';
        for (var t = 0; t < args.length; t++) {
          var segs2 = resolvePath(args[t]);
          var nome2 = segs2[segs2.length - 1];
          var pai2 = getNode(segs2.slice(0, -1));
          if (!pai2 || pai2.type !== 'dir') return 'touch: não foi possível criar \'' + args[t] + '\'';
          if (!pai2.children[nome2]) {
            pai2.children[nome2] = { type: 'file', name: nome2, mode: 'rw-r--r--', content: '' };
          }
        }
        return '';
      }

      case 'rm': {
        var recursivo = args.indexOf('-r') !== -1 || args.indexOf('-rf') !== -1 || args.indexOf('-fr') !== -1;
        var alvosRm = args.filter(function (a) { return a.charAt(0) !== '-'; });
        if (!alvosRm.length) return 'rm: uso: rm [-r] <alvo>';
        for (var r = 0; r < alvosRm.length; r++) {
          var segs3 = resolvePath(alvosRm[r]);
          var nome3 = segs3[segs3.length - 1];
          var pai3 = getNode(segs3.slice(0, -1));
          if (!pai3 || !pai3.children[nome3]) return 'rm: não foi possível remover \'' + alvosRm[r] + '\': inexistente';
          if (pai3.children[nome3].type === 'dir' && !recursivo) return 'rm: não foi possível remover \'' + alvosRm[r] + '\': é um diretório (use -r)';
          delete pai3.children[nome3];
        }
        return '';
      }

      case 'cp': {
        if (args.length < 2) return 'cp: uso: cp <origem> <destino>';
        var oSeg = resolvePath(args[0]);
        var oNode = getNode(oSeg);
        if (!oNode) return 'cp: ' + args[0] + ': inexistente';
        var dSeg = resolvePath(args[1]);
        var dNome = dSeg[dSeg.length - 1];
        var dPai = getNode(dSeg.slice(0, -1));
        if (!dPai || dPai.type !== 'dir') return 'cp: destino inválido';
        dPai.children[dNome] = JSON.parse(JSON.stringify(oNode));
        dPai.children[dNome].name = dNome;
        return '';
      }

      case 'mv': {
        if (args.length < 2) return 'mv: uso: mv <origem> <destino>';
        var moSeg = resolvePath(args[0]);
        var moNode = getNode(moSeg);
        if (!moNode) return 'mv: ' + args[0] + ': inexistente';
        var mdSeg = resolvePath(args[1]);
        var mdNome = mdSeg[mdSeg.length - 1];
        var mdPai = getNode(mdSeg.slice(0, -1));
        if (!mdPai || mdPai.type !== 'dir') return 'mv: destino inválido';
        var origemPai = getNode(moSeg.slice(0, -1));
        mdPai.children[mdNome] = moNode;
        mdPai.children[mdNome].name = mdNome;
        delete origemPai.children[moSeg[moSeg.length - 1]];
        return '';
      }

      case 'chmod': {
        if (args.length < 2) return 'chmod: uso: chmod <modo> <arquivo>';
        var chNode = getNode(resolvePath(args[1]));
        if (!chNode) return 'chmod: ' + args[1] + ': inexistente';
        chNode.chmod = args[0]; // guarda o modo aplicado (ex: 755)
        return '';
      }

      case 'grep': {
        if (args.length < 2) return 'grep: uso: grep <padrão> <arquivo>';
        var padrao = args[0].replace(/^["']|["']$/g, '');
        var gNode = getNode(resolvePath(args[1]));
        if (!gNode || gNode.type !== 'file') return 'grep: ' + args[1] + ': inexistente';
        return gNode.content.split('\n').filter(function (l) { return l.indexOf(padrao) !== -1; }).join('\n');
      }

      case 'head': {
        var n = 10; var fa = args;
        if (args[0] === '-n') { n = parseInt(args[1], 10); fa = args.slice(2); }
        var hNode = getNode(resolvePath(fa[0]));
        if (!hNode || hNode.type !== 'file') return 'head: ' + fa[0] + ': inexistente';
        return hNode.content.split('\n').slice(0, n).join('\n').replace(/\n$/, '');
      }

      case 'tail': {
        var nt = 10; var fat = args;
        if (args[0] === '-n') { nt = parseInt(args[1], 10); fat = args.slice(2); }
        var tNode = getNode(resolvePath(fat[0]));
        if (!tNode || tNode.type !== 'file') return 'tail: ' + fat[0] + ': inexistente';
        var linhas = tNode.content.split('\n').filter(function (l, i, arr) { return i < arr.length - 1 || l !== ''; });
        return linhas.slice(-nt).join('\n');
      }

      case 'wc': {
        var wNode = getNode(resolvePath(args[args.length - 1]));
        if (!wNode || wNode.type !== 'file') return 'wc: inexistente';
        var cont = wNode.content;
        var linhasN = cont.split('\n').length - 1;
        var palavras = cont.split(/\s+/).filter(Boolean).length;
        var bytes = cont.length;
        if (args[0] === '-l') return String(linhasN);
        if (args[0] === '-w') return String(palavras);
        return '  ' + linhasN + '  ' + palavras + '  ' + bytes;
      }

      default:
        return cmd + ': comando não encontrado';
    }
  }

  // ===================== BANCO DE EXERCÍCIOS (por nível) =====================
  // Distribuição pedida: Iniciante 30%, Básico 30%, Intermediário 20%,
  // Avançado 10%, Profissional 10%  → 20 exercícios: 6/6/4/2/2
  var EXERCICIOS = [
    // ---- INICIANTE (6) ----
    { nivel: 'Iniciante', titulo: 'Onde estou?', desc: 'Descubra o diretório atual imprimindo o caminho completo.', dica: 'Comando de 3 letras que significa "print working directory".', check: function () { return _lastOut.trim() === '/home/aluno'; }, requer: 'pwd' },
    { nivel: 'Iniciante', titulo: 'Listar arquivos', desc: 'Liste os arquivos e pastas do diretório atual.', dica: 'ls', check: function () { return _lastCmd.indexOf('ls') === 0; } },
    { nivel: 'Iniciante', titulo: 'Ler um arquivo', desc: 'Mostre o conteúdo do arquivo readme.txt.', dica: 'cat readme.txt', check: function () { return _lastOut.indexOf('Bem-vindo ao sandbox') !== -1; } },
    { nivel: 'Iniciante', titulo: 'Quem sou eu?', desc: 'Descubra o nome do usuário atual.', dica: 'whoami', check: function () { return _lastOut.trim() === 'aluno'; } },
    { nivel: 'Iniciante', titulo: 'Eco', desc: 'Imprima a frase: Ola Linux', dica: 'echo Ola Linux', check: function () { return _lastOut.trim() === 'Ola Linux'; } },
    { nivel: 'Iniciante', titulo: 'Entrar numa pasta', desc: 'Entre no diretório projetos e confirme com pwd (deve terminar em /projetos).', dica: 'cd projetos', check: function () { return pathStr() === '/home/aluno/projetos'; } },

    // ---- BÁSICO (6) ----
    { nivel: 'Básico', titulo: 'Criar diretório', desc: 'Crie um diretório chamado backup no diretório atual.', dica: 'mkdir backup', check: function () { return !!getNode(cwd.concat('backup')); } },
    { nivel: 'Básico', titulo: 'Criar arquivo vazio', desc: 'Crie um arquivo vazio chamado log.txt.', dica: 'touch log.txt', check: function () { return !!getNode(cwd.concat('log.txt')); } },
    { nivel: 'Básico', titulo: 'Copiar arquivo', desc: 'Copie readme.txt para uma cópia chamada readme.bak (esteja em /home/aluno).', dica: 'cp readme.txt readme.bak', check: function () { return !!getNode(['home', 'aluno', 'readme.bak']); } },
    { nivel: 'Básico', titulo: 'Renomear/mover', desc: 'Renomeie notas.txt para anotacoes.txt (mv).', dica: 'mv notas.txt anotacoes.txt', check: function () { return !!getNode(['home', 'aluno', 'anotacoes.txt']) && !getNode(['home', 'aluno', 'notas.txt']); } },
    { nivel: 'Básico', titulo: 'Remover arquivo', desc: 'Remova o arquivo readme.txt.', dica: 'rm readme.txt', check: function () { return !getNode(['home', 'aluno', 'readme.txt']); } },
    { nivel: 'Básico', titulo: 'Voltar ao home', desc: 'De qualquer lugar, volte ao diretório home do usuário.', dica: 'cd ~  (ou cd)', check: function () { return pathStr() === '/home/aluno'; } },

    // ---- INTERMEDIÁRIO (4) ----
    { nivel: 'Intermediário', titulo: 'Buscar em arquivo', desc: 'Encontre a linha que contém a palavra "importante" no arquivo notas.txt.', dica: 'grep importante notas.txt', check: function () { return _lastOut.indexOf('importante') !== -1 && _lastCmd.indexOf('grep') === 0; } },
    { nivel: 'Intermediário', titulo: 'Contar linhas', desc: 'Conte quantas linhas tem o arquivo /var/log/syslog.', dica: 'wc -l /var/log/syslog', check: function () { return _lastCmd.indexOf('wc') === 0 && _lastOut.trim() === '3'; } },
    { nivel: 'Intermediário', titulo: 'Primeiras linhas', desc: 'Mostre as 2 primeiras linhas de /var/log/syslog.', dica: 'head -n 2 /var/log/syslog', check: function () { return _lastCmd.indexOf('head') === 0 && (_lastOut.match(/\n/g) || []).length === 1; } },
    { nivel: 'Intermediário', titulo: 'Permissões', desc: 'Aplique a permissão 755 ao arquivo notas.txt (chmod).', dica: 'chmod 755 notas.txt', check: function () { var n = getNode(['home', 'aluno', 'notas.txt']); return n && n.chmod === '755'; } },

    // ---- AVANÇADO (2) ----
    { nivel: 'Avançado', titulo: 'Filtrar erros no log', desc: 'Liste apenas as linhas com "ERROR" em /var/log/syslog.', dica: 'grep ERROR /var/log/syslog', check: function () { return _lastCmd.indexOf('grep') === 0 && _lastOut.indexOf('ERROR') !== -1 && _lastOut.indexOf('systemd') === -1; } },
    { nivel: 'Avançado', titulo: 'Estrutura de projeto', desc: 'Dentro de projetos, crie a pasta app e, dentro dela, um arquivo main.py.', dica: 'cd projetos; mkdir app; touch app/main.py', check: function () { return !!getNode(['home', 'aluno', 'projetos', 'app', 'main.py']); } },

    // ---- PROFISSIONAL (2) ----
    { nivel: 'Profissional', titulo: 'Últimas linhas do log', desc: 'Mostre a última linha de /var/log/syslog (a que contém o erro de disco).', dica: 'tail -n 1 /var/log/syslog', check: function () { return _lastCmd.indexOf('tail') === 0 && _lastOut.indexOf('disk full') !== -1; } },
    { nivel: 'Profissional', titulo: 'Limpeza recursiva', desc: 'Remova recursivamente todo o diretório projetos.', dica: 'rm -r projetos', check: function () { return !getNode(['home', 'aluno', 'projetos']); } }
  ];

  // ===================== ESTADO DA UI =====================
  var _lastOut = '', _lastCmd = '';
  var termBody, termInput, modoLivre = true, exAtual = null, concluidos = {};

  function print(texto, classe) {
    var div = document.createElement('div');
    if (classe) div.className = classe;
    div.textContent = texto;
    termBody.appendChild(div);
    termBody.scrollTop = termBody.scrollHeight;
  }
  function printPrompt(linha) {
    var div = document.createElement('div');
    div.innerHTML = '<span style="color:#4ade80">' + escapeHtml(promptStr()) + '</span>' + escapeHtml(linha);
    termBody.appendChild(div);
  }
  function escapeHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function atualizarPs() {
    var ps = document.getElementById('termPs');
    if (ps) ps.textContent = promptStr();
  }

  function rodarLinha(linha) {
    printPrompt(linha);
    _lastCmd = linha.trim();
    var saida = exec(linha);
    if (saida === '__CLEAR__') { termBody.innerHTML = ''; _lastOut = ''; atualizarPs(); return; }
    _lastOut = saida;
    if (saida) print(saida);
    atualizarPs();
    if (!modoLivre && exAtual !== null) verificarExercicio();
  }

  function verificarExercicio() {
    var ex = EXERCICIOS[exAtual];
    var ok = false;
    try { ok = ex.check(); } catch (e) { ok = false; }
    if (ok) {
      concluidos[exAtual] = true;
      print('✅ Exercício concluído: ' + ex.titulo, 'ex-ok');
      atualizarListaEx();
      // Integra com o progresso do aluno (se logado)
      try {
        if (window.CloudTrilhasProgress) {
          window.CloudTrilhasProgress.setModule('sandbox-linux', 'ex-' + exAtual, true);
        }
      } catch (e) {}
    }
  }

  // ===================== RENDER =====================
  function atualizarListaEx() {
    var cont = document.getElementById('exList');
    if (!cont) return;
    var niveis = ['Iniciante', 'Básico', 'Intermediário', 'Avançado', 'Profissional'];
    var html = '';
    niveis.forEach(function (nivel) {
      var doNivel = EXERCICIOS.map(function (e, i) { return { e: e, i: i }; }).filter(function (o) { return o.e.nivel === nivel; });
      if (!doNivel.length) return;
      html += '<div class="ex-nivel">' + nivel + ' <small>(' + doNivel.filter(function (o) { return concluidos[o.i]; }).length + '/' + doNivel.length + ')</small></div>';
      doNivel.forEach(function (o) {
        var done = concluidos[o.i] ? '✅' : '▫️';
        var active = (exAtual === o.i) ? ' style="border-color:#6366f1;color:#fff"' : '';
        html += '<button class="ex-item" data-ex="' + o.i + '"' + active + '>' + done + ' ' + o.e.titulo + '</button>';
      });
    });
    cont.innerHTML = html;
    var btns = cont.querySelectorAll('.ex-item');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function () { selecionarExercicio(parseInt(this.getAttribute('data-ex'), 10)); });
    }
  }

  function selecionarExercicio(idx) {
    modoLivre = false;
    exAtual = idx;
    var ex = EXERCICIOS[idx];
    document.getElementById('exPainel').style.display = 'block';
    document.getElementById('exNivel').textContent = ex.nivel;
    document.getElementById('exTitulo').textContent = ex.titulo;
    document.getElementById('exDesc').textContent = ex.desc;
    document.getElementById('exDica').textContent = '💡 Dica: ' + ex.dica;
    document.getElementById('exDica').style.display = 'none';
    atualizarListaEx();
    termInput.focus();
  }

  function modoLivreAtivar() {
    modoLivre = true;
    exAtual = null;
    document.getElementById('exPainel').style.display = 'none';
    atualizarListaEx();
    termInput.focus();
  }

  // ===================== INIT =====================
  function init() {
    reset();
    termBody = document.getElementById('termBody');
    termInput = document.getElementById('termInput');
    if (!termBody || !termInput) return;

    print('CloudTrilhas — Terminal Linux simulado. Digite "help" para ver os comandos.');
    print('Modo atual: prática livre. Escolha um exercício na lateral para praticar guiado.');

    termInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var linha = termInput.value;
        termInput.value = '';
        if (linha.trim()) rodarLinha(linha);
      }
    });

    document.getElementById('modoLivreBtn').addEventListener('click', modoLivreAtivar);
    document.getElementById('resetBtn').addEventListener('click', function () {
      reset(); termBody.innerHTML = ''; concluidos = {};
      print('Ambiente reiniciado.'); atualizarListaEx();
    });
    var dicaBtn = document.getElementById('exDicaBtn');
    if (dicaBtn) dicaBtn.addEventListener('click', function () {
      var d = document.getElementById('exDica');
      d.style.display = d.style.display === 'none' ? 'block' : 'none';
    });

    atualizarListaEx();
    // Foco no terminal ao clicar em qualquer lugar dele
    document.getElementById('terminal').addEventListener('click', function () { termInput.focus(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
