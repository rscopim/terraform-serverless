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

  // ===== Exemplos didáticos (com ramificações por tema) =====
  // Estrutura: grupos → cada grupo tem vários exemplos (código).
  var GRUPOS_EXEMPLOS = [
    {
      grupo: '👋 Básico', itens: [
        { id: 'ola', nome: 'Olá, mundo', code: 'print("Olá, mundo! 🐍")\nprint("Bem-vindo ao sandbox da CloudTrilhas")\n' },
        { id: 'variaveis', nome: 'Variáveis e tipos', code: '# Variáveis e tipos básicos\nnome = "Ada"\nidade = 36\naltura = 1.68\nprogramadora = True\n\nprint(f"{nome} tem {idade} anos e {altura}m")\nprint("Tipos:", type(nome), type(idade), type(altura), type(programadora))\n' },
        { id: 'operadores', nome: 'Operadores', code: '# Operadores aritméticos\na, b = 17, 5\nprint("Soma:", a + b)\nprint("Divisão:", a / b)\nprint("Divisão inteira:", a // b)\nprint("Resto:", a % b)\nprint("Potência:", a ** 2)\n' },
        { id: 'input', nome: 'Entrada simulada', code: '# Sem input() real no sandbox — simule com variável\nnome = "Bia"  # troque aqui\nprint(f"Bem-vinda, {nome}!")\n' }
      ]
    },
    {
      grupo: '🔤 Strings', itens: [
        { id: 'str_metodos', nome: 'Métodos de string', code: 's = "cloud trilhas"\nprint(s.upper())\nprint(s.title())\nprint(s.replace("cloud", "AWS"))\nprint("Tem \'trilhas\'?", "trilhas" in s)\n' },
        { id: 'str_fatias', nome: 'Fatiamento (slicing)', code: 's = "cloudtrilhas"\nprint(s[:5])     # cloud\nprint(s[5:])     # trilhas\nprint(s[::-1])   # invertido\nprint(len(s), "caracteres")\n' },
        { id: 'str_split', nome: 'split e join', code: 'csv = "ana,leo,bia"\nnomes = csv.split(",")\nprint(nomes)\nprint(" | ".join(nomes))\n' },
        { id: 'str_format', nome: 'Formatação', code: 'preco = 1234.5\nprint(f"R$ {preco:,.2f}")\nprint(f"{42:05d}")     # zero à esquerda\nprint(f"{0.256:.1%}")  # porcentagem\n' }
      ]
    },
    {
      grupo: '📋 Listas & Dicionários', itens: [
        { id: 'loops', nome: 'Laços e listas', code: '# Laços e listas\nlinguagens = ["Python", "Go", "Rust", "JavaScript"]\n\nfor i, lang in enumerate(linguagens, start=1):\n    print(f"{i}. {lang}")\n\nprint("Total:", len(linguagens))\n' },
        { id: 'dict', nome: 'Dicionários', code: '# Dicionários\naluno = {"nome": "João", "trilhas": ["Python", "Linux"], "nivel": 3}\n\nprint("Nome:", aluno["nome"])\nprint("Trilhas:", ", ".join(aluno["trilhas"]))\n\nfor chave, valor in aluno.items():\n    print(f"  {chave} -> {valor}")\n' },
        { id: 'comprehension', nome: 'List/Dict comprehension', code: '# Comprehensions\nnumeros = range(1, 11)\nquadrados = [n**2 for n in numeros]\npares = [n for n in numeros if n % 2 == 0]\nprint("Quadrados:", quadrados)\nprint("Pares:", pares)\nmapa = {n: n**2 for n in range(1, 6)}\nprint("Mapa:", mapa)\n' },
        { id: 'set', nome: 'Conjuntos (set)', code: 'a = {1, 2, 3, 4}\nb = {3, 4, 5, 6}\nprint("União:", a | b)\nprint("Interseção:", a & b)\nprint("Diferença:", a - b)\n' }
      ]
    },
    {
      grupo: '⚙️ Funções & POO', itens: [
        { id: 'funcoes', nome: 'Funções', code: '# Funções\ndef saudacao(nome, formal=False):\n    if formal:\n        return f"Prezado(a) {nome}, seja bem-vindo(a)."\n    return f"E aí, {nome}!"\n\nprint(saudacao("Maria"))\nprint(saudacao("Dr. Silva", formal=True))\n' },
        { id: 'lambda', nome: 'Lambda, map e filter', code: 'nums = [1, 2, 3, 4, 5]\ndobro = list(map(lambda x: x * 2, nums))\npares = list(filter(lambda x: x % 2 == 0, nums))\nprint("Dobro:", dobro)\nprint("Pares:", pares)\n' },
        { id: 'classes', nome: 'Classes (POO)', code: '# Programação Orientada a Objetos\nclass Conta:\n    def __init__(self, dono, saldo=0):\n        self.dono = dono\n        self.saldo = saldo\n\n    def depositar(self, valor):\n        self.saldo += valor\n        return self.saldo\n\n    def __str__(self):\n        return f"Conta de {self.dono}: R$ {self.saldo:.2f}"\n\nc = Conta("Ana", 100)\nc.depositar(50)\nprint(c)\n' },
        { id: 'heranca', nome: 'Herança', code: 'class Animal:\n    def falar(self):\n        return "..."\n\nclass Cachorro(Animal):\n    def falar(self):\n        return "Au au!"\n\nclass Gato(Animal):\n    def falar(self):\n        return "Miau!"\n\nfor bicho in [Cachorro(), Gato()]:\n    print(bicho.falar())\n' }
      ]
    },
    {
      grupo: '🛡️ Erros & Módulos', itens: [
        { id: 'excecoes', nome: 'Tratar exceções', code: '# Tratamento de exceções\ndef dividir(a, b):\n    try:\n        return a / b\n    except ZeroDivisionError:\n        return "Erro: divisão por zero!"\n    finally:\n        print(f"Tentativa: {a} / {b}")\n\nprint(dividir(10, 2))\nprint(dividir(5, 0))\n' },
        { id: 'json', nome: 'JSON', code: 'import json\ndados = {"nome": "Ana", "ativo": True, "trilhas": ["py", "aws"]}\ntexto = json.dumps(dados)\nprint("JSON:", texto)\nde_volta = json.loads(texto)\nprint("Nome:", de_volta["nome"])\n' },
        { id: 'datetime', nome: 'Datas', code: 'from datetime import date, timedelta\nhoje = date(2026, 1, 1)\nprint("Hoje:", hoje)\nprint("Daqui a 10 dias:", hoje + timedelta(days=10))\n' },
        { id: 'collections', nome: 'Counter', code: 'from collections import Counter\ntexto = "banana"\ncontagem = Counter(texto)\nprint(contagem)\nprint("Mais comum:", contagem.most_common(1))\n' }
      ]
    }
  ];

  // Índice rápido id -> code
  var EXEMPLOS = {};
  GRUPOS_EXEMPLOS.forEach(function (g) { g.itens.forEach(function (it) { EXEMPLOS[it.id] = it.code; }); });

  // Renderiza os exemplos como grupos expansíveis (ramificações)
  function renderExemplos() {
    var cont = document.getElementById('exemplosLista');
    if (!cont) return;
    var html = '';
    GRUPOS_EXEMPLOS.forEach(function (g, gi) {
      html += '<div class="ex-nivel" style="cursor:pointer" data-grupo="' + gi + '">▸ ' + g.grupo + '</div>';
      html += '<div class="ex-grupo-itens" data-grupo-itens="' + gi + '" style="display:none">';
      g.itens.forEach(function (it) {
        html += '<button class="ex-item" data-ex="' + it.id + '">📄 ' + it.nome + '</button>';
      });
      html += '</div>';
    });
    cont.innerHTML = html;

    // toggle dos grupos
    var cabecalhos = cont.querySelectorAll('[data-grupo]');
    for (var i = 0; i < cabecalhos.length; i++) {
      cabecalhos[i].addEventListener('click', function () {
        var gi = this.getAttribute('data-grupo');
        var alvo = cont.querySelector('[data-grupo-itens="' + gi + '"]');
        var aberto = alvo.style.display !== 'none';
        alvo.style.display = aberto ? 'none' : 'block';
        this.textContent = (aberto ? '▸ ' : '▾ ') + this.textContent.slice(2);
      });
    }
    // carregar exemplo
    var itens = cont.querySelectorAll('.ex-item[data-ex]');
    for (var j = 0; j < itens.length; j++) {
      itens[j].addEventListener('click', function () {
        var chave = this.getAttribute('data-ex');
        if (EXEMPLOS[chave]) { editor.value = EXEMPLOS[chave]; editor.focus(); }
      });
    }
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
    // ================= FUNDAMENTOS (30) =================
    { cat: 'Fundamentos', titulo: 'Olá, mundo', desc: 'Imprima exatamente: Olá, CloudTrilhas', starter: '# Imprima: Olá, CloudTrilhas\n', esperado: 'Olá, CloudTrilhas' },
    { cat: 'Fundamentos', titulo: 'Soma simples', desc: 'Imprima o resultado de 7 + 5.', starter: '# Some 7 + 5 e imprima\n', esperado: '12' },
    { cat: 'Fundamentos', titulo: 'Subtração', desc: 'Imprima o resultado de 20 - 8.', starter: '# 20 - 8\n', esperado: '12' },
    { cat: 'Fundamentos', titulo: 'Multiplicação', desc: 'Imprima 6 vezes 7.', starter: '# 6 * 7\n', esperado: '42' },
    { cat: 'Fundamentos', titulo: 'Divisão inteira', desc: 'Imprima a divisão inteira de 17 por 5 (use //).', starter: '# 17 // 5\n', esperado: '3' },
    { cat: 'Fundamentos', titulo: 'Resto (módulo)', desc: 'Imprima o resto de 17 dividido por 5 (use %).', starter: '# 17 % 5\n', esperado: '2' },
    { cat: 'Fundamentos', titulo: 'Potência', desc: 'Imprima 2 elevado a 10 (use **).', starter: '# 2 ** 10\n', esperado: '1024' },
    { cat: 'Fundamentos', titulo: 'Variável de texto', desc: 'Crie nome="Ada" e imprima: Olá, Ada', starter: 'nome = "Ada"\n# imprima "Olá, Ada"\n', esperado: 'Olá, Ada' },
    { cat: 'Fundamentos', titulo: 'Concatenar strings', desc: 'Junte "Cloud" + "Trilhas" e imprima CloudTrilhas.', starter: 'a = "Cloud"\nb = "Trilhas"\n# imprima a junção\n', esperado: 'CloudTrilhas' },
    { cat: 'Fundamentos', titulo: 'f-string', desc: 'Com idade=36, imprima: Tenho 36 anos', starter: 'idade = 36\n# use f-string\n', esperado: 'Tenho 36 anos' },
    { cat: 'Fundamentos', titulo: 'Tamanho da string', desc: 'Imprima o número de caracteres de "python" (use len).', starter: '# len("python")\n', esperado: '6' },
    { cat: 'Fundamentos', titulo: 'Maiúsculas', desc: 'Imprima "aws" em maiúsculas (use .upper()).', starter: 's = "aws"\n# imprima em maiúsculas\n', esperado: 'AWS' },
    { cat: 'Fundamentos', titulo: 'Minúsculas', desc: 'Imprima "LINUX" em minúsculas (use .lower()).', starter: 's = "LINUX"\n# imprima em minúsculas\n', esperado: 'linux' },
    { cat: 'Fundamentos', titulo: 'Converter para int', desc: 'Converta "42" para número e imprima o dobro (84).', starter: 's = "42"\n# converta e imprima o dobro\n', esperado: '84' },
    { cat: 'Fundamentos', titulo: 'Média de 3 números', desc: 'Imprima a média de 4, 8 e 6 (deve dar 6.0).', starter: '# média de 4, 8, 6\n', esperado: '6.0' },
    { cat: 'Fundamentos', titulo: 'Booleano', desc: 'Imprima se 10 é maior que 3 (deve dar True).', starter: '# 10 > 3\n', esperado: 'True' },
    { cat: 'Fundamentos', titulo: 'Par ou ímpar', desc: 'Imprima "par" se 10 for par, senão "impar".', starter: 'n = 10\n# imprima par/impar\n', esperado: 'par' },
    { cat: 'Fundamentos', titulo: 'Maior de dois', desc: 'Imprima o maior entre 15 e 23.', starter: 'a, b = 15, 23\n# imprima o maior\n', esperado: '23' },
    { cat: 'Fundamentos', titulo: 'Loop de 1 a 5', desc: 'Imprima os números de 1 a 5, um por linha.', starter: '# for de 1 a 5\n', esperado: '1\n2\n3\n4\n5' },
    { cat: 'Fundamentos', titulo: 'Contagem regressiva', desc: 'Imprima de 3 a 1, um por linha (3, 2, 1).', starter: '# contagem regressiva 3..1\n', esperado: '3\n2\n1' },
    { cat: 'Fundamentos', titulo: 'Soma de 1 a 10', desc: 'Imprima a soma dos números de 1 a 10 (55).', starter: '# some 1 até 10\n', esperado: '55' },
    { cat: 'Fundamentos', titulo: 'While', desc: 'Use while para imprimir 0, 1, 2 (um por linha).', starter: 'i = 0\n# while até 2\n', esperado: '0\n1\n2' },
    { cat: 'Fundamentos', titulo: 'Primeiro item da lista', desc: 'Imprima o 1º item de ["a","b","c"].', starter: 'itens = ["a", "b", "c"]\n# imprima o primeiro\n', esperado: 'a' },
    { cat: 'Fundamentos', titulo: 'Último item da lista', desc: 'Imprima o último item de [10, 20, 30] (use índice -1).', starter: 'nums = [10, 20, 30]\n# imprima o último\n', esperado: '30' },
    { cat: 'Fundamentos', titulo: 'Adicionar à lista', desc: 'Comece com [1,2], adicione 3 e imprima [1, 2, 3].', starter: 'l = [1, 2]\n# adicione 3 e imprima\n', esperado: '[1, 2, 3]' },
    { cat: 'Fundamentos', titulo: 'Tamanho da lista', desc: 'Imprima quantos itens há em [5, 6, 7, 8].', starter: '# len da lista\n', esperado: '4' },
    { cat: 'Fundamentos', titulo: 'Fatia de string', desc: 'De "cloudtrilhas", imprima os 5 primeiros caracteres (cloud).', starter: 's = "cloudtrilhas"\n# imprima s[:5]\n', esperado: 'cloud' },
    { cat: 'Fundamentos', titulo: 'Substituir texto', desc: 'Em "eu amo java", troque java por python e imprima.', starter: 's = "eu amo java"\n# use replace\n', esperado: 'eu amo python' },
    { cat: 'Fundamentos', titulo: 'input simulado', desc: 'Com nome="Bia", imprima: Bem-vinda, Bia!', starter: 'nome = "Bia"\n# imprima "Bem-vinda, Bia!"\n', esperado: 'Bem-vinda, Bia!' },
    { cat: 'Fundamentos', titulo: 'Arredondar', desc: 'Imprima 3.14159 arredondado para 2 casas (use round → 3.14).', starter: '# round(3.14159, 2)\n', esperado: '3.14' },

    // ================= INTERMEDIÁRIO (30) =================
    { cat: 'Intermediário', titulo: 'Soma de lista', desc: 'Imprima a soma da lista [10, 20, 30].', starter: 'nums = [10, 20, 30]\n# imprima a soma\n', esperado: '60' },
    { cat: 'Intermediário', titulo: 'Maior da lista', desc: 'Imprima o maior valor de [3, 9, 2, 7].', starter: 'nums = [3, 9, 2, 7]\n# imprima o maior\n', esperado: '9' },
    { cat: 'Intermediário', titulo: 'Menor da lista', desc: 'Imprima o menor valor de [3, 9, 2, 7].', starter: 'nums = [3, 9, 2, 7]\n# imprima o menor\n', esperado: '2' },
    { cat: 'Intermediário', titulo: 'Ordenar lista', desc: 'Imprima [1, 2, 3, 5] a partir de [5, 2, 3, 1] (use sorted).', starter: 'nums = [5, 2, 3, 1]\n# imprima ordenado\n', esperado: '[1, 2, 3, 5]' },
    { cat: 'Intermediário', titulo: 'Inverter lista', desc: 'Imprima [3, 2, 1] a partir de [1, 2, 3].', starter: 'nums = [1, 2, 3]\n# imprima invertido\n', esperado: '[3, 2, 1]' },
    { cat: 'Intermediário', titulo: 'Dicionário: ler valor', desc: 'Dado aluno={"nome":"Léo"}, imprima o nome.', starter: 'aluno = {"nome": "Léo"}\n# imprima o nome\n', esperado: 'Léo' },
    { cat: 'Intermediário', titulo: 'Dicionário: chaves', desc: 'Imprima a lista de chaves de {"a":1,"b":2} → como lista: [\'a\', \'b\'].', starter: 'd = {"a": 1, "b": 2}\n# imprima list(d.keys())\n', esperado: "['a', 'b']" },
    { cat: 'Intermediário', titulo: 'Dicionário: somar valores', desc: 'Some os valores de {"x":10,"y":20} e imprima 30.', starter: 'd = {"x": 10, "y": 20}\n# some os valores\n', esperado: '30' },
    { cat: 'Intermediário', titulo: 'List comprehension', desc: 'Imprima os quadrados de 1 a 5: [1, 4, 9, 16, 25]', starter: '# quadrados de 1 a 5\n', esperado: '[1, 4, 9, 16, 25]' },
    { cat: 'Intermediário', titulo: 'Filtrar pares', desc: 'Com list comprehension, imprima os pares de 1 a 10: [2, 4, 6, 8, 10]', starter: '# pares de 1 a 10\n', esperado: '[2, 4, 6, 8, 10]' },
    { cat: 'Intermediário', titulo: 'Função dobro', desc: 'Crie dobro(x) e imprima dobro(21).', starter: '# defina dobro(x) e imprima dobro(21)\n', esperado: '42' },
    { cat: 'Intermediário', titulo: 'Função com default', desc: 'Crie saudar(nome, saud="Oi") e imprima saudar("Ana") → Oi, Ana', starter: '# def saudar(nome, saud="Oi")\n', esperado: 'Oi, Ana' },
    { cat: 'Intermediário', titulo: 'Contar pares', desc: 'Imprima quantos pares há em [1,2,3,4,5,6] (3).', starter: 'nums = [1,2,3,4,5,6]\n# conte os pares\n', esperado: '3' },
    { cat: 'Intermediário', titulo: 'Fatorial', desc: 'Calcule e imprima o fatorial de 5 (120).', starter: '# fatorial de 5\n', esperado: '120' },
    { cat: 'Intermediário', titulo: 'Fibonacci', desc: 'Imprima os 6 primeiros de Fibonacci: [0, 1, 1, 2, 3, 5]', starter: '# gere os 6 primeiros de Fibonacci\n', esperado: '[0, 1, 1, 2, 3, 5]' },
    { cat: 'Intermediário', titulo: 'String → lista', desc: 'De "a,b,c", crie a lista [\'a\', \'b\', \'c\'] (use split).', starter: 's = "a,b,c"\n# split por vírgula\n', esperado: "['a', 'b', 'c']" },
    { cat: 'Intermediário', titulo: 'Lista → string', desc: 'Junte ["a","b","c"] em "a-b-c" (use join).', starter: 'l = ["a", "b", "c"]\n# join com hífen\n', esperado: 'a-b-c' },
    { cat: 'Intermediário', titulo: 'Contar caracteres', desc: 'Conte quantas vezes "a" aparece em "banana" (3).', starter: 's = "banana"\n# conte os "a"\n', esperado: '3' },
    { cat: 'Intermediário', titulo: 'enumerate', desc: 'Imprima "0:a", "1:b", "2:c" (um por linha) usando enumerate em ["a","b","c"].', starter: 'itens = ["a", "b", "c"]\n# use enumerate\n', esperado: '0:a\n1:b\n2:c' },
    { cat: 'Intermediário', titulo: 'zip', desc: 'Com nomes=["Ana","Léo"] e idades=[20,30], imprima "Ana-20" e "Léo-30" (um por linha).', starter: 'nomes = ["Ana", "Léo"]\nidades = [20, 30]\n# use zip\n', esperado: 'Ana-20\nLéo-30' },
    { cat: 'Intermediário', titulo: 'map', desc: 'Use map para dobrar [1,2,3] e imprima [2, 4, 6].', starter: 'nums = [1, 2, 3]\n# use map + list\n', esperado: '[2, 4, 6]' },
    { cat: 'Intermediário', titulo: 'filter', desc: 'Use filter para pegar os >2 de [1,2,3,4] e imprima [3, 4].', starter: 'nums = [1, 2, 3, 4]\n# use filter + list\n', esperado: '[3, 4]' },
    { cat: 'Intermediário', titulo: 'Set (únicos)', desc: 'De [1,1,2,2,3], imprima quantos valores únicos há (3).', starter: 'nums = [1, 1, 2, 2, 3]\n# use set + len\n', esperado: '3' },
    { cat: 'Intermediário', titulo: 'Tupla', desc: 'Crie ponto=(3,4) e imprima a soma das coordenadas (7).', starter: 'ponto = (3, 4)\n# some as coordenadas\n', esperado: '7' },
    { cat: 'Intermediário', titulo: 'Verificar pertence', desc: 'Imprima se "py" está em "python" (True).', starter: '# "py" in "python"\n', esperado: 'True' },
    { cat: 'Intermediário', titulo: 'Máximo com key', desc: 'De ["aa","bbbb","cc"], imprima a string mais longa (bbbb).', starter: 'palavras = ["aa", "bbbb", "cc"]\n# use max com key=len\n', esperado: 'bbbb' },
    { cat: 'Intermediário', titulo: 'Somar dígitos', desc: 'Some os dígitos de 123 e imprima 6.', starter: 'n = 123\n# some os dígitos\n', esperado: '6' },
    { cat: 'Intermediário', titulo: 'Palíndromo', desc: 'Imprima se "arara" é palíndromo (True).', starter: 's = "arara"\n# compare com o invertido\n', esperado: 'True' },
    { cat: 'Intermediário', titulo: 'Dicionário de contagem', desc: 'Conte as letras de "aab" e imprima {\'a\': 2, \'b\': 1}.', starter: 's = "aab"\n# monte um dict de contagem\n', esperado: "{'a': 2, 'b': 1}" },
    { cat: 'Intermediário', titulo: 'FizzBuzz (parcial)', desc: 'Para 3, imprima "Fizz"; a lógica: múltiplo de 3 → Fizz.', starter: 'n = 3\n# imprima Fizz se múltiplo de 3\n', esperado: 'Fizz' },

    // ================= AVANÇADO (20) =================
    { cat: 'Avançado', titulo: 'Classe Conta', desc: 'Classe Conta com saldo 100, deposite 50 e imprima o saldo (150).', starter: '# classe Conta com deposito\n', esperado: '150' },
    { cat: 'Avançado', titulo: 'Herança', desc: 'Classe Animal com falar(); Cachorro herda e imprime "au". Imprima "au".', starter: '# Animal -> Cachorro; imprima "au"\n', esperado: 'au' },
    { cat: 'Avançado', titulo: '__str__', desc: 'Classe Ponto(1,2) com __str__ que retorna "(1, 2)". Imprima o objeto.', starter: '# classe Ponto com __str__\n', esperado: '(1, 2)' },
    { cat: 'Avançado', titulo: 'Tratar exceção', desc: 'Divida 10 por 0 com try/except e imprima "erro" ao capturar.', starter: '# try/except ZeroDivisionError\n', esperado: 'erro' },
    { cat: 'Avançado', titulo: 'Exceção customizada', desc: 'Crie SaldoError(Exception), levante e capture, imprimindo "sem saldo".', starter: '# raise/except de exceção própria\n', esperado: 'sem saldo' },
    { cat: 'Avançado', titulo: 'Dict comprehension', desc: 'Imprima {1: 1, 2: 4, 3: 9} usando dict comprehension.', starter: '# n -> n**2 para 1..3\n', esperado: '{1: 1, 2: 4, 3: 9}' },
    { cat: 'Avançado', titulo: 'Ordenar por chave', desc: 'Ordene [("b",2),("a",1)] pela 1ª posição e imprima [(\'a\', 1), (\'b\', 2)].', starter: 'dados = [("b",2),("a",1)]\n# sorted por dados[i][0]\n', esperado: "[('a', 1), ('b', 2)]" },
    { cat: 'Avançado', titulo: 'Ordenar por valor', desc: 'Ordene {"a":3,"b":1} por valor e imprima [(\'b\', 1), (\'a\', 3)].', starter: 'd = {"a": 3, "b": 1}\n# sorted por valor\n', esperado: "[('b', 1), ('a', 3)]" },
    { cat: 'Avançado', titulo: 'Generator sum', desc: 'Some os números de 0 a 9 com sum(range(10)) e imprima (45).', starter: '# sum(range(10))\n', esperado: '45' },
    { cat: 'Avançado', titulo: 'Função geradora', desc: 'Crie um generator que produz 1,2,3; imprima list() dele → [1, 2, 3].', starter: '# def gen(): yield ...\n', esperado: '[1, 2, 3]' },
    { cat: 'Avançado', titulo: 'Decorador', desc: 'Decorador que imprime "antes" e depois chama a função (imprima "antes").', starter: '# defina um decorador simples\n', esperado: 'antes' },
    { cat: 'Avançado', titulo: 'lambda', desc: 'Crie uma lambda soma = lambda a,b: a+b e imprima soma(4,5) → 9.', starter: '# use lambda\n', esperado: '9' },
    { cat: 'Avançado', titulo: 'reduce', desc: 'Use functools.reduce para multiplicar [1,2,3,4] e imprima 24.', starter: 'from functools import reduce\n# multiplique a lista\n', esperado: '24' },
    { cat: 'Avançado', titulo: 'Contador (Counter)', desc: 'Use collections.Counter em "aab" e imprima o mais comum como (\'a\', 2).', starter: 'from collections import Counter\n# most_common(1)[0]\n', esperado: "('a', 2)" },
    { cat: 'Avançado', titulo: 'defaultdict', desc: 'Agrupe [("f","maçã"),("f","pera")] por chave e imprima a lista de "f": [\'maçã\', \'pera\'].', starter: 'from collections import defaultdict\ndados = [("f","maçã"),("f","pera")]\n# agrupe e imprima d["f"]\n', esperado: "['maçã', 'pera']" },
    { cat: 'Avançado', titulo: 'JSON', desc: 'Converta {"ok": True} para string JSON e imprima {"ok": true}.', starter: 'import json\n# json.dumps\n', esperado: '{"ok": true}' },
    { cat: 'Avançado', titulo: 'Datas', desc: 'Some 10 dias a 2026-01-01 e imprima 2026-01-11.', starter: 'from datetime import date, timedelta\n# date(2026,1,1) + 10 dias\n', esperado: '2026-01-11' },
    { cat: 'Avançado', titulo: 'Regex', desc: 'Extraia os números de "abc123" e imprima 123 (use re).', starter: 'import re\ntexto = "abc123"\n# re.search por \\d+\n', esperado: '123' },
    { cat: 'Avançado', titulo: 'args/kwargs', desc: 'Crie soma(*args) que soma tudo; imprima soma(1,2,3,4) → 10.', starter: '# def soma(*args)\n', esperado: '10' },
    { cat: 'Avançado', titulo: 'Compreensão aninhada', desc: 'Achate [[1,2],[3,4]] em [1, 2, 3, 4] com list comprehension.', starter: 'matriz = [[1, 2], [3, 4]]\n# achate a matriz\n', esperado: '[1, 2, 3, 4]' },

    // ================= AWS E IA (exercícios extras) =================
    { cat: 'AWS e IA', titulo: 'Resposta de API', desc: 'Crie resposta {"statusCode": 200} e imprima o statusCode (200).', starter: 'resposta = {"statusCode": 200, "body": "ok"}\n# imprima o statusCode\n', esperado: '200' },
    { cat: 'AWS e IA', titulo: 'Nome de bucket S3', desc: 'Monte "meu-projeto-prod" de projeto e env e imprima.', starter: 'projeto = "meu-projeto"\nenv = "prod"\n# monte e imprima\n', esperado: 'meu-projeto-prod' },
    { cat: 'AWS e IA', titulo: 'Evento Lambda', desc: 'De um evento {"Records":[{"s3":{"object":{"key":"foto.jpg"}}}]}, imprima "foto.jpg".', starter: 'evento = {"Records":[{"s3":{"object":{"key":"foto.jpg"}}}]}\n# extraia a key\n', esperado: 'foto.jpg' },
    { cat: 'AWS e IA', titulo: 'Prompt de IA', desc: 'Monte um prompt "Resuma: texto aqui" a partir de texto="texto aqui" e imprima.', starter: 'texto = "texto aqui"\n# monte o prompt\n', esperado: 'Resuma: texto aqui' }
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
  renderExemplos();

  // ======================================================================
  // SIMULADOR DE CÓDIGO DE IA (AWS e IA) — interação simulada
  // O aluno "monta" uma chamada a um modelo de IA (estilo Amazon Bedrock)
  // escolhendo o modelo, a tarefa e o prompt. Geramos o código Python
  // correspondente (boto3) e simulamos a resposta do modelo — tudo no
  // navegador, sem AWS real, sem custo.
  // ======================================================================
  var RESPOSTAS_IA = {
    resumir: function (txt) {
      var base = (txt || '').trim() || 'Este é um texto de exemplo sobre computação em nuvem e serverless.';
      var primeira = base.split(/[.!?]/)[0];
      return 'Resumo: ' + primeira.slice(0, 90) + '. (gerado pelo modelo)';
    },
    traduzir: function (txt) {
      return 'Translation: "' + (txt || 'Olá, mundo') + '" → (English) "Hello, world" (simulado)';
    },
    sentimento: function (txt) {
      var t = (txt || '').toLowerCase();
      var pos = /(bom|ótimo|excelente|amei|gostei|feliz|top)/.test(t);
      var neg = /(ruim|péssimo|odiei|triste|horrível|lento)/.test(t);
      var s = pos && !neg ? 'POSITIVO' : (neg && !pos ? 'NEGATIVO' : 'NEUTRO');
      return 'Sentimento detectado: ' + s + ' (confiança 0.92)';
    },
    chatbot: function (txt) {
      return 'Assistente: Entendi sua pergunta "' + (txt || 'olá') + '". Como posso ajudar com sua trilha de estudos hoje?';
    },
    codigo: function (txt) {
      return '```python\n# ' + (txt || 'função de exemplo') + '\ndef exemplo():\n    return "gerado pela IA"\n```';
    }
  };

  var MODELOS_IA = {
    'anthropic.claude-3-haiku': 'Claude 3 Haiku (rápido e barato)',
    'anthropic.claude-3-5-sonnet': 'Claude 3.5 Sonnet (equilíbrio)',
    'amazon.titan-text': 'Amazon Titan Text',
    'meta.llama3': 'Meta Llama 3'
  };

  function gerarCodigoIA(modelo, tarefa, prompt) {
    var tarefaTexto = {
      resumir: 'Resuma o texto a seguir em uma frase:',
      traduzir: 'Traduza o texto a seguir para inglês:',
      sentimento: 'Classifique o sentimento (positivo/negativo/neutro) do texto:',
      chatbot: 'Responda como um assistente virtual amigável:',
      codigo: 'Gere um código Python para:'
    }[tarefa] || 'Tarefa:';

    var promptCompleto = tarefaTexto + ' ' + prompt;
    return '' +
      'import boto3\n' +
      'import json\n\n' +
      '# Cliente do Amazon Bedrock (IA generativa gerenciada da AWS)\n' +
      'bedrock = boto3.client("bedrock-runtime", region_name="us-west-2")\n\n' +
      'prompt = """' + promptCompleto + '"""\n\n' +
      'corpo = {\n' +
      '    "messages": [{"role": "user", "content": prompt}],\n' +
      '    "max_tokens": 300,\n' +
      '    "temperature": 0.5\n' +
      '}\n\n' +
      'resposta = bedrock.invoke_model(\n' +
      '    modelId="' + modelo + '",\n' +
      '    body=json.dumps(corpo)\n' +
      ')\n\n' +
      'resultado = json.loads(resposta["body"].read())\n' +
      'print(resultado["content"][0]["text"])\n';
  }

  function initSimuladorIA() {
    var gerarBtn = document.getElementById('iaGerarBtn');
    if (!gerarBtn) return; // seção não presente

    // popular modelos
    var selModelo = document.getElementById('iaModelo');
    selModelo.innerHTML = Object.keys(MODELOS_IA).map(function (k) {
      return '<option value="' + k + '">' + MODELOS_IA[k] + '</option>';
    }).join('');

    gerarBtn.addEventListener('click', function () {
      var modelo = document.getElementById('iaModelo').value;
      var tarefa = document.getElementById('iaTarefa').value;
      var prompt = document.getElementById('iaPrompt').value.trim() || 'Explique o que é computação em nuvem.';

      // 1) mostra o código Python gerado (joga no editor para o aluno ver/rodar a lógica)
      var codigo = gerarCodigoIA(modelo, tarefa, prompt);
      var saidaCod = document.getElementById('iaCodigo');
      if (saidaCod) saidaCod.textContent = codigo;

      // 2) simula a resposta do modelo com "digitação" progressiva
      var respostaFn = RESPOSTAS_IA[tarefa] || RESPOSTAS_IA.chatbot;
      var texto = respostaFn(prompt);
      var alvo = document.getElementById('iaResposta');
      if (!alvo) return;
      alvo.textContent = '';
      var i = 0;
      var timer = setInterval(function () {
        alvo.textContent += texto.charAt(i);
        i++;
        if (i >= texto.length) clearInterval(timer);
      }, 12);
    });

    // botão para copiar o código gerado para o editor principal e executar a lógica base
    var usarBtn = document.getElementById('iaUsarNoEditor');
    if (usarBtn) usarBtn.addEventListener('click', function () {
      var cod = document.getElementById('iaCodigo').textContent;
      if (cod) {
        // versão executável no sandbox (sem AWS real): simula a chamada
        editor.value = '# Código gerado pelo Simulador de IA (versão executável, sem AWS real)\n' +
          'def invoke_model_simulado(prompt):\n' +
          '    # No mundo real, isto chamaria o Amazon Bedrock via boto3.\n' +
          '    return "[resposta simulada do modelo para]: " + prompt\n\n' +
          'prompt = "' + (document.getElementById('iaPrompt').value.trim().replace(/"/g, '\\"') || 'Explique cloud') + '"\n' +
          'print(invoke_model_simulado(prompt))\n';
        editor.focus();
      }
    });
  }
  initSimuladorIA();

  // Start
  inicializar();
})();
