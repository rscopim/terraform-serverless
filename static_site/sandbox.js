/**
 * CloudTrilhas — Sandbox Python (Pyodide)
 *
 * Carrega o CPython compilado para WebAssembly (Pyodide) e executa
 * o código do editor 100% no navegador do aluno. Sem backend, sem custo.
 *
 * Captura stdout e stderr e exibe na área de saída.
 */
(function () {
  'use strict';

  var pyodide = null;
  var runBtn = document.getElementById('runBtn');
  var clearBtn = document.getElementById('clearBtn');
  var editor = document.getElementById('codeEditor');
  var output = document.getElementById('output');
  var statusPill = document.getElementById('statusPill');

  // ===== Exemplos didáticos =====
  var EXEMPLOS = {
    ola:
      'print("Olá, mundo! 🐍")\n' +
      'print("Bem-vindo ao sandbox da CloudTrilhas")\n',
    variaveis:
      '# Variáveis e tipos básicos\n' +
      'nome = "Ada"\n' +
      'idade = 36\n' +
      'altura = 1.68\n' +
      'programadora = True\n\n' +
      'print(f"{nome} tem {idade} anos e {altura}m")\n' +
      'print("Tipos:", type(nome), type(idade), type(altura), type(programadora))\n',
    loops:
      '# Laços e listas\n' +
      'linguagens = ["Python", "Go", "Rust", "JavaScript"]\n\n' +
      'for i, lang in enumerate(linguagens, start=1):\n' +
      '    print(f"{i}. {lang}")\n\n' +
      'print("Total:", len(linguagens))\n',
    funcoes:
      '# Funções\n' +
      'def saudacao(nome, formal=False):\n' +
      '    if formal:\n' +
      '        return f"Prezado(a) {nome}, seja bem-vindo(a)."\n' +
      '    return f"E aí, {nome}!"\n\n' +
      'print(saudacao("Maria"))\n' +
      'print(saudacao("Dr. Silva", formal=True))\n',
    dict:
      '# Dicionários\n' +
      'aluno = {"nome": "João", "trilhas": ["Python", "Linux"], "nivel": 3}\n\n' +
      'print("Nome:", aluno["nome"])\n' +
      'print("Trilhas:", ", ".join(aluno["trilhas"]))\n\n' +
      'for chave, valor in aluno.items():\n' +
      '    print(f"  {chave} -> {valor}")\n',
    classes:
      '# Programação Orientada a Objetos\n' +
      'class Conta:\n' +
      '    def __init__(self, dono, saldo=0):\n' +
      '        self.dono = dono\n' +
      '        self.saldo = saldo\n\n' +
      '    def depositar(self, valor):\n' +
      '        self.saldo += valor\n' +
      '        return self.saldo\n\n' +
      '    def __str__(self):\n' +
      '        return f"Conta de {self.dono}: R$ {self.saldo:.2f}"\n\n' +
      'c = Conta("Ana", 100)\n' +
      'c.depositar(50)\n' +
      'print(c)\n',
    excecoes:
      '# Tratamento de exceções\n' +
      'def dividir(a, b):\n' +
      '    try:\n' +
      '        return a / b\n' +
      '    except ZeroDivisionError:\n' +
      '        return "Erro: divisão por zero!"\n' +
      '    finally:\n' +
      '        print(f"Tentativa: {a} / {b}")\n\n' +
      'print(dividir(10, 2))\n' +
      'print(dividir(5, 0))\n',
    comprehension:
      '# List comprehension\n' +
      'numeros = range(1, 11)\n\n' +
      'quadrados = [n**2 for n in numeros]\n' +
      'pares = [n for n in numeros if n % 2 == 0]\n\n' +
      'print("Quadrados:", quadrados)\n' +
      'print("Pares:", pares)\n\n' +
      '# Dict comprehension\n' +
      'mapa = {n: n**2 for n in range(1, 6)}\n' +
      'print("Mapa:", mapa)\n'
  };

  // ===== Carregar exemplos ao clicar =====
  var exampleBtns = document.querySelectorAll('.example-btn');
  for (var i = 0; i < exampleBtns.length; i++) {
    exampleBtns[i].addEventListener('click', function () {
      var chave = this.getAttribute('data-ex');
      if (EXEMPLOS[chave]) {
        editor.value = EXEMPLOS[chave];
        editor.focus();
      }
    });
  }

  // ===== Tab dentro do editor insere 4 espaços =====
  editor.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      var start = this.selectionStart;
      var end = this.selectionEnd;
      this.value = this.value.substring(0, start) + '    ' + this.value.substring(end);
      this.selectionStart = this.selectionEnd = start + 4;
    }
    // Ctrl+Enter executa
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      executar();
    }
  });

  // ===== Limpar =====
  clearBtn.addEventListener('click', function () {
    editor.value = '';
    output.textContent = '';
    editor.focus();
  });

  // ===== Inicializar Pyodide =====
  async function inicializar() {
    try {
      output.innerHTML = '<span class="loader">⏳ Baixando o interpretador Python (Pyodide)... pode levar alguns segundos na primeira vez.</span>';
      pyodide = await loadPyodide();

      // Redireciona stdout/stderr para capturarmos a saída
      await pyodide.runPythonAsync(
        'import sys, io\n' +
        'sys.stdout = io.StringIO()\n' +
        'sys.stderr = io.StringIO()\n'
      );

      runBtn.disabled = false;
      runBtn.textContent = 'Executar ▶';
      statusPill.textContent = 'pronto';
      statusPill.classList.add('ready');
      output.textContent = 'Pronto! Escreva seu código e clique em Executar (ou Ctrl+Enter).';
    } catch (err) {
      output.innerHTML = '<span class="err">Falha ao carregar o Pyodide: ' + escapeHtml(String(err)) + '</span>';
    }
  }

  // ===== Executar o código =====
  async function executar() {
    if (!pyodide) return;
    runBtn.disabled = true;
    runBtn.textContent = 'Executando…';
    output.textContent = '';

    var codigo = editor.value;

    try {
      // Limpa os buffers antes de rodar
      await pyodide.runPythonAsync(
        'sys.stdout = io.StringIO()\n' +
        'sys.stderr = io.StringIO()\n'
      );

      await pyodide.runPythonAsync(codigo);

      var out = await pyodide.runPythonAsync('sys.stdout.getvalue()');
      var err = await pyodide.runPythonAsync('sys.stderr.getvalue()');

      var texto = out || '';
      if (err) {
        output.innerHTML = escapeHtml(texto) + '<span class="err">' + escapeHtml(err) + '</span>';
      } else {
        output.textContent = texto !== '' ? texto : '(sem saída — o código rodou sem print)';
      }
    } catch (e) {
      // Erros de execução Python (traceback)
      var traceback = '';
      try {
        traceback = await pyodide.runPythonAsync('sys.stderr.getvalue()');
      } catch (_) {}
      output.innerHTML = '<span class="err">' + escapeHtml(traceback || String(e)) + '</span>';
    } finally {
      runBtn.disabled = false;
      runBtn.textContent = 'Executar ▶';
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  runBtn.addEventListener('click', executar);

  // ======================================================================
  // EXERCÍCIOS GUIADOS (por categoria)
  // Distribuição pedida: Fundamentos+Intermediário 60%, Avançado 30%, AWS+IA 10%
  // 20 exercícios: 12 / 6 / 2
  // Validação: compara a saída (stdout) com o esperado (exata ou por conter).
  // ======================================================================
  var PY_EX = [
    // ---- FUNDAMENTOS + INTERMEDIÁRIO (12) ----
    { cat: 'Fundamentos', titulo: 'Olá, mundo', desc: 'Imprima exatamente: Olá, CloudTrilhas', starter: '# Imprima: Olá, CloudTrilhas\n', esperado: 'Olá, CloudTrilhas' },
    { cat: 'Fundamentos', titulo: 'Soma simples', desc: 'Imprima o resultado de 7 + 5.', starter: '# Some 7 + 5 e imprima\n', esperado: '12' },
    { cat: 'Fundamentos', titulo: 'Variáveis', desc: 'Crie nome="Ada" e imprima: Olá, Ada', starter: 'nome = "Ada"\n# imprima "Olá, Ada"\n', esperado: 'Olá, Ada' },
    { cat: 'Fundamentos', titulo: 'Média de 3 números', desc: 'Imprima a média de 4, 8 e 6 (deve dar 6.0).', starter: '# média de 4, 8, 6\n', esperado: '6.0' },
    { cat: 'Fundamentos', titulo: 'Par ou ímpar', desc: 'Imprima "par" se 10 for par, senão "impar".', starter: 'n = 10\n# imprima par/impar\n', esperado: 'par' },
    { cat: 'Fundamentos', titulo: 'Loop de 1 a 5', desc: 'Imprima os números de 1 a 5, um por linha.', starter: '# for de 1 a 5\n', esperado: '1\n2\n3\n4\n5' },
    { cat: 'Intermediário', titulo: 'Soma de lista', desc: 'Imprima a soma da lista [10, 20, 30].', starter: 'nums = [10, 20, 30]\n# imprima a soma\n', esperado: '60' },
    { cat: 'Intermediário', titulo: 'Maior da lista', desc: 'Imprima o maior valor de [3, 9, 2, 7].', starter: 'nums = [3, 9, 2, 7]\n# imprima o maior\n', esperado: '9' },
    { cat: 'Intermediário', titulo: 'Dicionário', desc: 'Dado aluno={"nome":"Léo"}, imprima o nome.', starter: 'aluno = {"nome": "Léo"}\n# imprima o nome\n', esperado: 'Léo' },
    { cat: 'Intermediário', titulo: 'List comprehension', desc: 'Imprima a lista dos quadrados de 1 a 5: [1, 4, 9, 16, 25]', starter: '# quadrados de 1 a 5 com list comprehension\n', esperado: '[1, 4, 9, 16, 25]' },
    { cat: 'Intermediário', titulo: 'Função', desc: 'Crie uma função dobro(x) e imprima dobro(21).', starter: '# defina dobro(x) e imprima dobro(21)\n', esperado: '42' },
    { cat: 'Intermediário', titulo: 'Contar pares', desc: 'Imprima quantos números pares há em [1,2,3,4,5,6] (deve dar 3).', starter: 'nums = [1,2,3,4,5,6]\n# conte os pares\n', esperado: '3' },
    // ---- AVANÇADO (6) ----
    { cat: 'Avançado', titulo: 'Classe Conta', desc: 'Crie a classe Conta com saldo inicial 100, deposite 50 e imprima o saldo (150).', starter: '# classe Conta com deposito\n', esperado: '150' },
    { cat: 'Avançado', titulo: 'Tratar exceção', desc: 'Divida 10 por 0 com try/except e imprima "erro" ao capturar.', starter: '# try/except ZeroDivisionError -> imprima erro\n', esperado: 'erro' },
    { cat: 'Avançado', titulo: 'Dict comprehension', desc: 'Imprima {1: 1, 2: 4, 3: 9} usando dict comprehension.', starter: '# dict comprehension: n -> n**2 para 1..3\n', esperado: '{1: 1, 2: 4, 3: 9}' },
    { cat: 'Avançado', titulo: 'Ordenar por chave', desc: 'Ordene [("b",2),("a",1)] pela 1ª posição e imprima [("a", 1), ("b", 2)].', starter: 'dados = [("b",2),("a",1)]\n# ordene por dados[i][0] e imprima\n', esperado: "[('a', 1), ('b', 2)]" },
    { cat: 'Avançado', titulo: 'Generator', desc: 'Some os números de 0 a 9 usando sum(range(10)) e imprima (45).', starter: '# imprima sum(range(10))\n', esperado: '45' },
    { cat: 'Avançado', titulo: 'Decorador simples', desc: 'Use um contador para imprimir "chamado" ao executar uma função (imprima "chamado").', starter: '# crie e chame uma função que imprime "chamado"\n', esperado: 'chamado' },
    // ---- AWS E IA (2) ----
    { cat: 'AWS e IA', titulo: 'Simular resposta de API', desc: 'Crie um dict simulando resposta {"statusCode": 200} e imprima o statusCode (200).', starter: 'resposta = {"statusCode": 200, "body": "ok"}\n# imprima o statusCode\n', esperado: '200' },
    { cat: 'AWS e IA', titulo: 'Nome de bucket S3', desc: 'Monte o nome "meu-projeto-prod" a partir de projeto="meu-projeto" e env="prod" e imprima.', starter: 'projeto = "meu-projeto"\nenv = "prod"\n# monte e imprima "meu-projeto-prod"\n', esperado: 'meu-projeto-prod' }
  ];

  var pyExAtual = null, pyConcluidos = {};

  function pyOutputText() {
    // Texto puro da saída (sem HTML)
    return (output.textContent || '').trim();
  }

  function validarPyExercicio() {
    if (pyExAtual === null) return;
    var ex = PY_EX[pyExAtual];
    var got = pyOutputText();
    var ok = (got === ex.esperado) || (got.indexOf(ex.esperado) !== -1 && ex.esperado.length > 2);
    var fb = document.getElementById('pyExFeedback');
    if (!fb) return;
    if (ok) {
      pyConcluidos[pyExAtual] = true;
      fb.className = 'info-box highlight';
      fb.style.display = 'block';
      fb.innerHTML = '<strong>✅ Exercício concluído!</strong> Saída esperada obtida.';
      renderPyEx();
      try {
        if (window.CloudTrilhasProgress) {
          window.CloudTrilhasProgress.setModule('sandbox-python', 'ex-' + pyExAtual, true);
        }
      } catch (e) {}
    } else {
      fb.className = 'info-box warning';
      fb.style.display = 'block';
      fb.innerHTML = '<strong>Ainda não.</strong> Esperado: <code>' + escapeHtml(ex.esperado) + '</code> — obtido: <code>' + escapeHtml(got || '(vazio)') + '</code>';
    }
  }

  function selecionarPyEx(idx) {
    pyExAtual = idx;
    var ex = PY_EX[idx];
    editor.value = ex.starter;
    var painel = document.getElementById('pyExPainel');
    if (painel) {
      painel.style.display = 'block';
      document.getElementById('pyExCat').textContent = ex.cat;
      document.getElementById('pyExTitulo').textContent = ex.titulo;
      document.getElementById('pyExDesc').textContent = ex.desc;
      var fb = document.getElementById('pyExFeedback');
      if (fb) fb.style.display = 'none';
    }
    renderPyEx();
    editor.focus();
  }

  function renderPyEx() {
    var cont = document.getElementById('pyExList');
    if (!cont) return;
    var cats = ['Fundamentos', 'Intermediário', 'Avançado', 'AWS e IA'];
    var html = '';
    cats.forEach(function (cat) {
      var doCat = PY_EX.map(function (e, i) { return { e: e, i: i }; }).filter(function (o) { return o.e.cat === cat; });
      if (!doCat.length) return;
      var feitos = doCat.filter(function (o) { return pyConcluidos[o.i]; }).length;
      html += '<div class="ex-nivel">' + cat + ' <small>(' + feitos + '/' + doCat.length + ')</small></div>';
      doCat.forEach(function (o) {
        var done = pyConcluidos[o.i] ? '✅' : '▫️';
        var active = (pyExAtual === o.i) ? ' style="border-color:#6366f1;color:#fff"' : '';
        html += '<button class="ex-item" data-ex="' + o.i + '"' + active + '>' + done + ' ' + o.e.titulo + '</button>';
      });
    });
    cont.innerHTML = html;
    var btns = cont.querySelectorAll('.ex-item');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function () { selecionarPyEx(parseInt(this.getAttribute('data-ex'), 10)); });
    }
  }

  // Após cada execução, valida o exercício ativo observando mudanças na saída.
  // (executar() é async; quando o botão volta a ficar habilitado, a saída está pronta.)
  var obs = new MutationObserver(function () {
    if (pyExAtual !== null) {
      setTimeout(validarPyExercicio, 60);
    }
  });
  if (output) obs.observe(output, { childList: true, characterData: true, subtree: true });

  var freeBtn = document.getElementById('pyModoLivreBtn');
  if (freeBtn) freeBtn.addEventListener('click', function () {
    pyExAtual = null;
    var painel = document.getElementById('pyExPainel');
    if (painel) painel.style.display = 'none';
    renderPyEx();
    editor.focus();
  });

  renderPyEx();

  // Start
  inicializar();
})();
