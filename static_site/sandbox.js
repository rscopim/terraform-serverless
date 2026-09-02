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

  // Start
  inicializar();
})();
