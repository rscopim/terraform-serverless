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
  // Suporta pipe simples (cmd | cmd) e redirecionamento (> arquivo).
  function exec(linha) {
    // clear é especial
    if (linha.trim() === 'clear') return '__CLEAR__';

    // Redirecionamento para arquivo: cmd ... > arquivo
    var redirMatch = linha.match(/^(.*?)\s*>\s*(\S+)\s*$/);
    if (redirMatch) {
      var saidaR = execPipe(redirMatch[1]);
      var segsR = resolvePath(redirMatch[2]);
      var nomeR = segsR[segsR.length - 1];
      var paiR = getNode(segsR.slice(0, -1));
      if (!paiR || paiR.type !== 'dir') return 'bash: ' + redirMatch[2] + ': não foi possível criar';
      paiR.children[nomeR] = { type: 'file', name: nomeR, mode: 'rw-r--r--', content: (saidaR || '') + '\n' };
      return '';
    }
    return execPipe(linha);
  }

  // Executa uma cadeia de pipes: cmdA | cmdB | cmdC
  function execPipe(linha) {
    var etapas = linha.split('|').map(function (s) { return s.trim(); });
    var entrada = null;
    var saida = '';
    for (var i = 0; i < etapas.length; i++) {
      saida = execSimples(etapas[i], entrada);
      entrada = saida;
    }
    return saida;
  }

  // Executa um único comando. `stdin` = string vinda do pipe (ou null).
  function execSimples(linha, stdin) {
    var parts = linha.trim().split(/\s+/);
    var cmd = parts[0];
    var args = parts.slice(1);
    if (!cmd) return stdin || '';

    switch (cmd) {
      case 'pwd': return pathStr();
      case 'whoami': return 'aluno';
      case 'echo': return args.join(' ').replace(/^["']|["']$/g, '');
      case 'clear': return '__CLEAR__';
      case 'date': return 'Thu Jan  1 00:00:00 UTC 2026';
      case 'uname': return args.indexOf('-a') !== -1 ? 'Linux cloudtrilhas 6.1.0 x86_64 GNU/Linux' : 'Linux';
      case 'df': return 'Sist.Arq.  Tam  Usado Disp Uso% Montado\n/dev/root   20G   8G    12G  40% /';
      case 'ps': return '  PID TTY          TIME CMD\n    1 ?        00:00:01 systemd\n  842 pts/0    00:00:00 bash\n  999 pts/0    00:00:00 ps';
      case 'env': return 'USER=aluno\nHOME=/home/aluno\nSHELL=/bin/bash\nPATH=/usr/bin:/bin';
      case 'history': return _historico.map(function (h, i) { return '  ' + (i + 1) + '  ' + h; }).join('\n');
      case 'help':
        return 'Comandos: ls, cd, pwd, cat, echo, mkdir, touch, rm, cp, mv, chmod, chown, ln, find, grep, head, tail, wc, sort, uniq, cut, stat, date, df, ps, env, history, uname, whoami, clear, help\nSuporta: pipe ( | ) e redirecionamento ( > arquivo )';

      case 'sort': {
        var srcS = stdin != null ? stdin : (function () { var n = getNode(resolvePath(args[args.length - 1] || '')); return n && n.type === 'file' ? n.content : ''; })();
        var linhasS = srcS.split('\n').filter(function (l) { return l !== ''; });
        linhasS.sort();
        if (args.indexOf('-r') !== -1) linhasS.reverse();
        return linhasS.join('\n');
      }
      case 'uniq': {
        var srcU = stdin != null ? stdin : (function () { var n = getNode(resolvePath(args[args.length - 1] || '')); return n && n.type === 'file' ? n.content : ''; })();
        var linhasU = srcU.split('\n');
        var out = []; var prev = null;
        for (var u = 0; u < linhasU.length; u++) { if (linhasU[u] !== prev) out.push(linhasU[u]); prev = linhasU[u]; }
        return out.filter(function (l) { return l !== ''; }).join('\n');
      }
      case 'cut': {
        // cut -d: -f1  (simplificado)
        var delim = ' '; var campo = 1;
        for (var ci = 0; ci < args.length; ci++) {
          if (args[ci].indexOf('-d') === 0) delim = args[ci].length > 2 ? args[ci].slice(2) : args[++ci];
          if (args[ci] && args[ci].indexOf('-f') === 0) campo = parseInt(args[ci].length > 2 ? args[ci].slice(2) : args[++ci], 10);
        }
        var srcC = stdin != null ? stdin : (function () { var n = getNode(resolvePath(args[args.length - 1] || '')); return n && n.type === 'file' ? n.content : ''; })();
        return srcC.split('\n').filter(function (l) { return l !== ''; }).map(function (l) { return (l.split(delim)[campo - 1] || ''); }).join('\n');
      }
      case 'find': {
        // find <dir> -name <padrão>  (simplificado, sem curingas complexos)
        var base = args[0] && args[0].charAt(0) !== '-' ? args[0] : '.';
        var nameIdx = args.indexOf('-name');
        var padraoF = nameIdx !== -1 ? args[nameIdx + 1].replace(/["'*]/g, '') : '';
        var raiz = getNode(resolvePath(base));
        if (!raiz) return 'find: ' + base + ': inexistente';
        var achados = [];
        (function walk(node, prefixo) {
          if (node.type === 'dir') {
            Object.keys(node.children).forEach(function (k) {
              var filho = node.children[k];
              var caminho = prefixo + '/' + k;
              if (!padraoF || k.indexOf(padraoF) !== -1) achados.push(caminho);
              if (filho.type === 'dir') walk(filho, caminho);
            });
          }
        })(raiz, base === '.' ? '.' : base.replace(/\/$/, ''));
        return achados.join('\n');
      }
      case 'stat': {
        var stNode = getNode(resolvePath(args[0] || ''));
        if (!stNode) return 'stat: ' + args[0] + ': inexistente';
        return '  Arquivo: ' + args[0] + '\n  Tipo: ' + (stNode.type === 'dir' ? 'diretório' : 'arquivo comum') + '\n  Permissões: ' + (stNode.chmod || stNode.mode);
      }
      case 'ln': {
        // ln -s alvo nome  (cria "link" — simulado como cópia marcada)
        var lnArgs = args.filter(function (a) { return a.charAt(0) !== '-'; });
        if (lnArgs.length < 2) return 'ln: uso: ln -s <alvo> <nome>';
        var lnSeg = resolvePath(lnArgs[1]);
        var lnNome = lnSeg[lnSeg.length - 1];
        var lnPai = getNode(lnSeg.slice(0, -1));
        if (!lnPai || lnPai.type !== 'dir') return 'ln: destino inválido';
        lnPai.children[lnNome] = { type: 'file', name: lnNome, mode: 'lrwxrwxrwx', content: '', link: lnArgs[0] };
        return '';
      }
      case 'chown': {
        if (args.length < 2) return 'chown: uso: chown <dono> <arquivo>';
        var cwNode = getNode(resolvePath(args[1]));
        if (!cwNode) return 'chown: ' + args[1] + ': inexistente';
        cwNode.owner = args[0];
        return '';
      }

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
        var flagI = args.indexOf('-i') !== -1;
        var argsG = args.filter(function (a) { return a.charAt(0) !== '-'; });
        var padrao = (argsG[0] || '').replace(/^["']|["']$/g, '');
        var contG;
        if (stdin != null) { contG = stdin; }
        else {
          var gNode = getNode(resolvePath(argsG[1] || ''));
          if (!gNode || gNode.type !== 'file') return 'grep: ' + (argsG[1] || '') + ': inexistente';
          contG = gNode.content;
        }
        return contG.split('\n').filter(function (l) {
          return flagI ? l.toLowerCase().indexOf(padrao.toLowerCase()) !== -1 : l.indexOf(padrao) !== -1;
        }).filter(function (l) { return l !== ''; }).join('\n');
      }

      case 'head': {
        var n = 10; var fa = args;
        if (args[0] === '-n') { n = parseInt(args[1], 10); fa = args.slice(2); }
        var contH;
        if (stdin != null) contH = stdin;
        else { var hNode = getNode(resolvePath(fa[0] || '')); if (!hNode || hNode.type !== 'file') return 'head: ' + (fa[0] || '') + ': inexistente'; contH = hNode.content; }
        return contH.split('\n').slice(0, n).join('\n').replace(/\n$/, '');
      }

      case 'tail': {
        var nt = 10; var fat = args;
        if (args[0] === '-n') { nt = parseInt(args[1], 10); fat = args.slice(2); }
        var contT;
        if (stdin != null) contT = stdin;
        else { var tNode = getNode(resolvePath(fat[0] || '')); if (!tNode || tNode.type !== 'file') return 'tail: ' + (fat[0] || '') + ': inexistente'; contT = tNode.content; }
        var linhas = contT.split('\n').filter(function (l, i, arr) { return i < arr.length - 1 || l !== ''; });
        return linhas.slice(-nt).join('\n');
      }

      case 'wc': {
        var cont;
        if (stdin != null) cont = stdin;
        else { var wNode = getNode(resolvePath(args[args.length - 1] || '')); if (!wNode || wNode.type !== 'file') return 'wc: inexistente'; cont = wNode.content; }
        var semFinal = cont.replace(/\n$/, '');
        var linhasN = semFinal === '' ? 0 : semFinal.split('\n').length;
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
  // Iniciante 18 · Básico 18 · Intermediário 16 · Avançado 10 · Profissional 10
  var EXERCICIOS = [
    // ---- INICIANTE (18) ----
    { nivel: 'Iniciante', titulo: 'Onde estou?', desc: 'Descubra o diretório atual imprimindo o caminho completo.', dica: 'pwd', check: function () { return _lastOut.trim() === '/home/aluno'; } },
    { nivel: 'Iniciante', titulo: 'Listar arquivos', desc: 'Liste os arquivos e pastas do diretório atual.', dica: 'ls', check: function () { return _lastCmd.indexOf('ls') === 0; } },
    { nivel: 'Iniciante', titulo: 'Listar detalhado', desc: 'Liste os arquivos em formato longo (com permissões).', dica: 'ls -l', check: function () { return /^ls\s+-l/.test(_lastCmd); } },
    { nivel: 'Iniciante', titulo: 'Ler um arquivo', desc: 'Mostre o conteúdo do arquivo readme.txt.', dica: 'cat readme.txt', check: function () { return _lastOut.indexOf('Bem-vindo ao sandbox') !== -1; } },
    { nivel: 'Iniciante', titulo: 'Quem sou eu?', desc: 'Descubra o nome do usuário atual.', dica: 'whoami', check: function () { return _lastOut.trim() === 'aluno'; } },
    { nivel: 'Iniciante', titulo: 'Eco', desc: 'Imprima a frase: Ola Linux', dica: 'echo Ola Linux', check: function () { return _lastOut.trim() === 'Ola Linux'; } },
    { nivel: 'Iniciante', titulo: 'Entrar numa pasta', desc: 'Entre no diretório projetos (o caminho deve terminar em /projetos).', dica: 'cd projetos', check: function () { return pathStr() === '/home/aluno/projetos'; } },
    { nivel: 'Iniciante', titulo: 'Subir um nível', desc: 'Estando em /home/aluno, suba um diretório (deve ir para /home).', dica: 'cd ..', check: function () { return pathStr() === '/home'; } },
    { nivel: 'Iniciante', titulo: 'Data e hora', desc: 'Mostre a data e a hora do sistema.', dica: 'date', check: function () { return _lastCmd.indexOf('date') === 0 && _lastOut.indexOf('2026') !== -1; } },
    { nivel: 'Iniciante', titulo: 'Qual sistema?', desc: 'Descubra o nome do sistema operacional.', dica: 'uname', check: function () { return _lastCmd.indexOf('uname') === 0 && _lastOut.indexOf('Linux') !== -1; } },
    { nivel: 'Iniciante', titulo: 'Limpar a tela', desc: 'Limpe a tela do terminal.', dica: 'clear', check: function () { return _lastCmd === 'clear'; } },
    { nivel: 'Iniciante', titulo: 'Pedir ajuda', desc: 'Liste os comandos disponíveis no terminal.', dica: 'help', check: function () { return _lastCmd === 'help'; } },
    { nivel: 'Iniciante', titulo: 'Ler outro arquivo', desc: 'Mostre o conteúdo de notas.txt.', dica: 'cat notas.txt', check: function () { return _lastCmd.indexOf('cat notas.txt') === 0 && _lastOut.indexOf('linha 1') !== -1; } },
    { nivel: 'Iniciante', titulo: 'Ir ao diretório raiz', desc: 'Vá para o diretório raiz do sistema ( / ).', dica: 'cd /', check: function () { return pathStr() === '/'; } },
    { nivel: 'Iniciante', titulo: 'Listar a raiz', desc: 'Estando em /, liste o conteúdo (deve mostrar home, etc, var).', dica: 'ls', check: function () { return pathStr() === '/' && _lastCmd.indexOf('ls') === 0 && _lastOut.indexOf('home') !== -1; } },
    { nivel: 'Iniciante', titulo: 'Caminho absoluto', desc: 'Sem mudar de diretório, leia o arquivo /etc/hosts.', dica: 'cat /etc/hosts', check: function () { return _lastOut.indexOf('localhost') !== -1; } },
    { nivel: 'Iniciante', titulo: 'Voltar pra casa', desc: 'Use o atalho para voltar ao seu diretório home.', dica: 'cd ~   (ou apenas cd)', check: function () { return pathStr() === '/home/aluno' && /^cd(\s+~)?$/.test(_lastCmd); } },
    { nivel: 'Iniciante', titulo: 'Espaço em disco', desc: 'Veja o uso de espaço em disco do sistema.', dica: 'df -h', check: function () { return _lastCmd.indexOf('df') === 0 && _lastOut.indexOf('Uso%') !== -1; } },

    // ---- BÁSICO (18) ----
    { nivel: 'Básico', titulo: 'Criar diretório', desc: 'Crie um diretório chamado backup no diretório atual.', dica: 'mkdir backup', check: function () { return !!getNode(cwd.concat('backup')); } },
    { nivel: 'Básico', titulo: 'Criar arquivo vazio', desc: 'Crie um arquivo vazio chamado log.txt.', dica: 'touch log.txt', check: function () { return !!getNode(cwd.concat('log.txt')); } },
    { nivel: 'Básico', titulo: 'Copiar arquivo', desc: 'Copie readme.txt para readme.bak (esteja em /home/aluno).', dica: 'cp readme.txt readme.bak', check: function () { return !!getNode(['home', 'aluno', 'readme.bak']); } },
    { nivel: 'Básico', titulo: 'Renomear/mover', desc: 'Renomeie notas.txt para anotacoes.txt.', dica: 'mv notas.txt anotacoes.txt', check: function () { return !!getNode(['home', 'aluno', 'anotacoes.txt']) && !getNode(['home', 'aluno', 'notas.txt']); } },
    { nivel: 'Básico', titulo: 'Remover arquivo', desc: 'Remova o arquivo readme.txt.', dica: 'rm readme.txt', check: function () { return !getNode(['home', 'aluno', 'readme.txt']); } },
    { nivel: 'Básico', titulo: 'Criar árvore de pastas', desc: 'Crie a estrutura docs/2026 de uma vez só.', dica: 'mkdir -p docs/2026', check: function () { return !!getNode(cwd.concat(['docs', '2026'])); } },
    { nivel: 'Básico', titulo: 'Escrever em arquivo', desc: 'Crie saudacao.txt com o texto "ola" usando redirecionamento.', dica: 'echo ola > saudacao.txt', check: function () { var n = getNode(cwd.concat('saudacao.txt')); return n && n.type === 'file' && n.content.indexOf('ola') !== -1; } },
    { nivel: 'Básico', titulo: 'Sobrescrever arquivo', desc: 'Sobrescreva saudacao.txt com o texto "tchau".', dica: 'echo tchau > saudacao.txt', check: function () { var n = getNode(cwd.concat('saudacao.txt')); return n && n.content.indexOf('tchau') !== -1; } },
    { nivel: 'Básico', titulo: 'Mover para pasta', desc: 'Crie a pasta arquivo e mova log.txt para dentro dela.', dica: 'mkdir arquivo ; mv log.txt arquivo/log.txt', check: function () { return !!getNode(cwd.concat(['arquivo', 'log.txt'])); } },
    { nivel: 'Básico', titulo: 'Remover diretório', desc: 'Crie a pasta temp e remova-a em seguida (rm -r).', dica: 'mkdir temp ; rm -r temp', check: function () { return _historico.some(function (h) { return h.indexOf('rm') === 0 && h.indexOf('temp') !== -1; }) && !getNode(cwd.concat('temp')); } },
    { nivel: 'Básico', titulo: 'Contar palavras', desc: 'Conte as palavras do arquivo notas.txt.', dica: 'wc -w notas.txt', check: function () { return /^wc\s+-w/.test(_lastCmd) && _lastCmd.indexOf('notas.txt') !== -1; } },
    { nivel: 'Básico', titulo: 'Processos em execução', desc: 'Liste os processos em execução.', dica: 'ps', check: function () { return _lastCmd.indexOf('ps') === 0 && _lastOut.indexOf('systemd') !== -1; } },
    { nivel: 'Básico', titulo: 'Variáveis de ambiente', desc: 'Mostre as variáveis de ambiente.', dica: 'env', check: function () { return _lastCmd.indexOf('env') === 0 && _lastOut.indexOf('HOME=') !== -1; } },
    { nivel: 'Básico', titulo: 'Histórico', desc: 'Veja o histórico de comandos que você já digitou.', dica: 'history', check: function () { return _lastCmd === 'history'; } },
    { nivel: 'Básico', titulo: 'Copiar por caminho absoluto', desc: 'Copie /etc/hosts para o seu diretório home.', dica: 'cp /etc/hosts ~/hosts', check: function () { return !!getNode(['home', 'aluno', 'hosts']); } },
    { nivel: 'Básico', titulo: 'Ordenar conteúdo', desc: 'Ordene alfabeticamente as linhas de notas.txt.', dica: 'sort notas.txt', check: function () { return _lastCmd.indexOf('sort') === 0 && _lastCmd.indexOf('notas.txt') !== -1; } },
    { nivel: 'Básico', titulo: 'Detalhes de um arquivo', desc: 'Veja os detalhes (stat) do arquivo notas.txt.', dica: 'stat notas.txt', check: function () { return _lastCmd.indexOf('stat') === 0 && _lastOut.indexOf('Permiss') !== -1; } },
    { nivel: 'Básico', titulo: 'Link simbólico', desc: 'Crie um link simbólico chamado atalho apontando para notas.txt.', dica: 'ln -s notas.txt atalho', check: function () { var n = getNode(cwd.concat('atalho')); return n && n.link; } },

    // ---- INTERMEDIÁRIO (16) ----
    { nivel: 'Intermediário', titulo: 'Buscar em arquivo', desc: 'Encontre a linha que contém "importante" em notas.txt.', dica: 'grep importante notas.txt', check: function () { return _lastCmd.indexOf('grep') === 0 && _lastOut.indexOf('importante') !== -1; } },
    { nivel: 'Intermediário', titulo: 'Contar linhas', desc: 'Conte quantas linhas tem /var/log/syslog.', dica: 'wc -l /var/log/syslog', check: function () { return _lastCmd.indexOf('wc') === 0 && _lastOut.trim() === '3'; } },
    { nivel: 'Intermediário', titulo: 'Primeiras linhas', desc: 'Mostre as 2 primeiras linhas de /var/log/syslog.', dica: 'head -n 2 /var/log/syslog', check: function () { return _lastCmd.indexOf('head') === 0 && (_lastOut.match(/\n/g) || []).length === 1; } },
    { nivel: 'Intermediário', titulo: 'Permissões numéricas', desc: 'Aplique a permissão 755 ao arquivo notas.txt.', dica: 'chmod 755 notas.txt', check: function () { var n = getNode(['home', 'aluno', 'notas.txt']); return n && n.chmod === '755'; } },
    { nivel: 'Intermediário', titulo: 'Pipe: filtrar e contar', desc: 'Conte quantas linhas de /var/log/syslog contêm "server" usando pipe.', dica: 'cat /var/log/syslog | grep server | wc -l', check: function () { return _lastCmd.indexOf('|') !== -1 && _lastCmd.indexOf('wc') !== -1 && _lastOut.trim() === '3'; } },
    { nivel: 'Intermediário', titulo: 'Buscar ignorando caixa', desc: 'Encontre "error" em /var/log/syslog ignorando maiúsculas/minúsculas.', dica: 'grep -i error /var/log/syslog', check: function () { return /grep\s+-i/.test(_lastCmd) && _lastOut.indexOf('ERROR') !== -1; } },
    { nivel: 'Intermediário', titulo: 'Últimas 2 linhas', desc: 'Mostre as 2 últimas linhas de /var/log/syslog.', dica: 'tail -n 2 /var/log/syslog', check: function () { return _lastCmd.indexOf('tail') === 0 && _lastOut.indexOf('disk full') !== -1 && (_lastOut.match(/\n/g) || []).length === 1; } },
    { nivel: 'Intermediário', titulo: 'Encontrar arquivos', desc: 'Encontre arquivos .txt a partir do seu home (find -name).', dica: 'find . -name "*.txt"', check: function () { return _lastCmd.indexOf('find') === 0 && _lastOut.indexOf('.txt') !== -1; } },
    { nivel: 'Intermediário', titulo: 'Cortar campo', desc: 'De /etc/hosts, extraia o primeiro campo (o IP) com cut.', dica: 'cut -d" " -f1 /etc/hosts', check: function () { return _lastCmd.indexOf('cut') === 0 && _lastOut.indexOf('127.0.0.1') !== -1; } },
    { nivel: 'Intermediário', titulo: 'Redirecionar saída', desc: 'Salve a saída de "ls -l" num arquivo chamado listagem.txt.', dica: 'ls -l > listagem.txt', check: function () { var n = getNode(cwd.concat('listagem.txt')); return n && n.type === 'file' && n.content.length > 0; } },
    { nivel: 'Intermediário', titulo: 'Ordenar decrescente', desc: 'Ordene as linhas de notas.txt em ordem reversa (Z→A).', dica: 'sort -r notas.txt', check: function () { return /sort\s+-r/.test(_lastCmd) && _lastCmd.indexOf('notas.txt') !== -1; } },
    { nivel: 'Intermediário', titulo: 'Remover duplicatas', desc: 'Ordene e remova linhas duplicadas de notas.txt (sort | uniq).', dica: 'sort notas.txt | uniq', check: function () { return _lastCmd.indexOf('sort') === 0 && _lastCmd.indexOf('uniq') !== -1; } },
    { nivel: 'Intermediário', titulo: 'Mudar o dono', desc: 'Altere o dono do arquivo notas.txt para "root".', dica: 'chown root notas.txt', check: function () { var n = getNode(['home', 'aluno', 'notas.txt']); return n && n.owner === 'root'; } },
    { nivel: 'Intermediário', titulo: 'Grep + head', desc: 'Pegue as linhas com "server" e mostre só a primeira (grep | head).', dica: 'grep server /var/log/syslog | head -n 1', check: function () { return _lastCmd.indexOf('|') !== -1 && _lastCmd.indexOf('head') !== -1 && (_lastOut.match(/\n/g) || []).length === 0 && _lastOut.indexOf('server') !== -1; } },
    { nivel: 'Intermediário', titulo: 'Criar e conferir', desc: 'Crie tarefas.txt com "estudar" e confirme com cat.', dica: 'echo estudar > tarefas.txt ; cat tarefas.txt', check: function () { var n = getNode(cwd.concat('tarefas.txt')); return n && n.content.indexOf('estudar') !== -1; } },
    { nivel: 'Intermediário', titulo: 'Contar arquivos .txt', desc: 'Conte quantos arquivos .txt existem a partir do home (find | wc -l).', dica: 'find . -name "*.txt" | wc -l', check: function () { return _lastCmd.indexOf('find') === 0 && _lastCmd.indexOf('wc') !== -1; } },

    // ---- AVANÇADO (10) — com comandos de exemplo ----
    { nivel: 'Avançado', titulo: 'Filtrar erros no log', desc: 'Liste apenas as linhas com "ERROR" em /var/log/syslog.', dica: 'Exemplo: grep ERROR /var/log/syslog', check: function () { return _lastCmd.indexOf('grep') === 0 && _lastOut.indexOf('ERROR') !== -1 && _lastOut.indexOf('systemd') === -1; } },
    { nivel: 'Avançado', titulo: 'Estrutura de projeto', desc: 'Dentro de projetos, crie a pasta app e o arquivo app/main.py.', dica: 'Exemplo: cd projetos ; mkdir app ; touch app/main.py', check: function () { return !!getNode(['home', 'aluno', 'projetos', 'app', 'main.py']); } },
    { nivel: 'Avançado', titulo: 'Relatório em arquivo', desc: 'Gere um relatório com as linhas de erro do syslog salvo em erros.txt.', dica: 'Exemplo: grep ERROR /var/log/syslog > erros.txt', check: function () { var n = getNode(cwd.concat('erros.txt')); return n && n.content.indexOf('ERROR') !== -1; } },
    { nivel: 'Avançado', titulo: 'Pipeline de 3 estágios', desc: 'Conte quantas linhas do syslog contêm "server" (cat | grep | wc).', dica: 'Exemplo: cat /var/log/syslog | grep server | wc -l', check: function () { return (_lastCmd.match(/\|/g) || []).length >= 2 && _lastOut.trim() === '3'; } },
    { nivel: 'Avançado', titulo: 'Backup de arquivo', desc: 'Copie notas.txt para notas.bak.', dica: 'Exemplo: cp notas.txt notas.bak', check: function () { return !!getNode(['home', 'aluno', 'notas.bak']); } },
    { nivel: 'Avançado', titulo: 'Permissão de execução', desc: 'Crie script.sh e dê permissão 700 a ele.', dica: 'Exemplo: touch script.sh ; chmod 700 script.sh', check: function () { var n = getNode(cwd.concat('script.sh')); return n && n.chmod === '700'; } },
    { nivel: 'Avançado', titulo: 'Buscar recursivamente', desc: 'Encontre todos os arquivos main.py a partir do home.', dica: 'Exemplo: find . -name "main.py"', check: function () { return _lastCmd.indexOf('find') === 0 && _lastCmd.indexOf('main.py') !== -1; } },
    { nivel: 'Avançado', titulo: 'Extrair IP do hosts', desc: 'Extraia apenas os IPs de /etc/hosts e salve em ips.txt.', dica: 'Exemplo: cut -d" " -f1 /etc/hosts > ips.txt', check: function () { var n = getNode(cwd.concat('ips.txt')); return n && n.content.indexOf('127.0.0.1') !== -1; } },
    { nivel: 'Avançado', titulo: 'Ordenar e deduplicar', desc: 'Ordene notas.txt, remova duplicatas e salve em limpo.txt.', dica: 'Exemplo: sort notas.txt | uniq > limpo.txt', check: function () { var n = getNode(cwd.concat('limpo.txt')); return n && n.type === 'file'; } },
    { nivel: 'Avançado', titulo: 'Última linha do log', desc: 'Mostre a última linha de /var/log/syslog (o erro de disco).', dica: 'Exemplo: tail -n 1 /var/log/syslog', check: function () { return _lastCmd.indexOf('tail') === 0 && _lastOut.indexOf('disk full') !== -1; } },

    // ---- PROFISSIONAL (10) — com comandos de exemplo ----
    { nivel: 'Profissional', titulo: 'Limpeza recursiva', desc: 'Remova recursivamente todo o diretório projetos.', dica: 'Exemplo: rm -r projetos', check: function () { return !getNode(['home', 'aluno', 'projetos']); } },
    { nivel: 'Profissional', titulo: 'Deploy simulado', desc: 'Crie app/src, coloque server.py dentro e dê permissão 755.', dica: 'Exemplo: mkdir -p app/src ; touch app/src/server.py ; chmod 755 app/src/server.py', check: function () { var n = getNode(cwd.concat(['app', 'src', 'server.py'])); return n && n.chmod === '755'; } },
    { nivel: 'Profissional', titulo: 'Contar erros e salvar', desc: 'Conte as linhas de erro do syslog e salve o número em total_erros.txt.', dica: 'Exemplo: grep ERROR /var/log/syslog | wc -l > total_erros.txt', check: function () { var n = getNode(cwd.concat('total_erros.txt')); return n && n.content.trim().charAt(0) === '1'; } },
    { nivel: 'Profissional', titulo: 'Inventário de arquivos', desc: 'Liste todos os .txt do home e salve em inventario.txt.', dica: 'Exemplo: find . -name "*.txt" > inventario.txt', check: function () { var n = getNode(cwd.concat('inventario.txt')); return n && n.content.indexOf('.txt') !== -1; } },
    { nivel: 'Profissional', titulo: 'Pipeline auditoria', desc: 'Extraia as linhas com "sshd" do syslog e salve em auditoria.txt.', dica: 'Exemplo: grep sshd /var/log/syslog > auditoria.txt', check: function () { var n = getNode(cwd.concat('auditoria.txt')); return n && n.content.indexOf('sshd') !== -1; } },
    { nivel: 'Profissional', titulo: 'Consolidar dados', desc: 'Junte notas.txt ordenado sem duplicatas em consolidado.txt.', dica: 'Exemplo: sort notas.txt | uniq > consolidado.txt', check: function () { var n = getNode(cwd.concat('consolidado.txt')); return n && n.type === 'file'; } },
    { nivel: 'Profissional', titulo: 'Rotina de manutenção', desc: 'Gere erros.txt, crie a pasta manutencao e mova erros.txt para lá.', dica: 'Exemplo: grep ERROR /var/log/syslog > erros.txt ; mkdir manutencao ; mv erros.txt manutencao/erros.txt', check: function () { return !!getNode(cwd.concat(['manutencao', 'erros.txt'])); } },
    { nivel: 'Profissional', titulo: 'Snapshot de configuração', desc: 'Copie /etc/hosts para hosts.snapshot no seu home.', dica: 'Exemplo: cp /etc/hosts ~/hosts.snapshot', check: function () { return !!getNode(['home', 'aluno', 'hosts.snapshot']); } },
    { nivel: 'Profissional', titulo: 'Higienização de temporários', desc: 'Crie tmp1, tmp2, tmp3 e remova todos em um único rm.', dica: 'Exemplo: touch tmp1 tmp2 tmp3 ; rm tmp1 tmp2 tmp3', check: function () { return !getNode(cwd.concat('tmp1')) && !getNode(cwd.concat('tmp2')) && !getNode(cwd.concat('tmp3')) && _historico.some(function (h) { return h.indexOf('touch') === 0 && h.indexOf('tmp1') !== -1; }); } },
    { nivel: 'Profissional', titulo: 'Relatório final', desc: 'Gere relatorio.txt com a contagem de linhas do syslog (wc -l redirecionado).', dica: 'Exemplo: wc -l /var/log/syslog > relatorio.txt', check: function () { var n = getNode(cwd.concat('relatorio.txt')); return n && n.content.indexOf('3') !== -1; } }
  ];

  // ===================== ESTADO DA UI =====================
  var _lastOut = '', _lastCmd = '', _historico = [];
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
    if (_lastCmd) _historico.push(_lastCmd);
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
