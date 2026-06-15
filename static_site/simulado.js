/**
 * CloudTrilhas — Simulado Interativo
 * Suporta banco de questões com seleção aleatória a cada reinício.
 *
 * Como usar:
 *   - Defina QUIZ_BANK como array com TODAS as questões disponíveis
 *   - Defina QUIZ_SIZE (opcional) com quantas questões sortear por rodada (padrão: 20)
 *   - O simulado sorteia QUIZ_SIZE questões aleatórias a cada initQuiz()
 */

var QUIZ_SIZE = (typeof QUIZ_SIZE !== 'undefined') ? QUIZ_SIZE : 20;

var currentQuestion = 0;
var score = 0;
var selectedOption = null;
var answered = false;
var activeQuestions = []; // questões sorteadas para a rodada atual

function shuffleArray(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

function pickQuestions() {
  // Suporta tanto QUIZ_BANK (banco grande) quanto QUIZ_DATA (lista fixa legada)
  var bank = (typeof QUIZ_BANK !== 'undefined') ? QUIZ_BANK : QUIZ_DATA;
  var size = Math.min(QUIZ_SIZE, bank.length);
  return shuffleArray(bank).slice(0, size);
}

function initQuiz() {
  currentQuestion = 0;
  score = 0;
  selectedOption = null;
  answered = false;
  activeQuestions = pickQuestions();
  document.getElementById('quizContainer').style.display = 'block';
  document.getElementById('quizResult').style.display = 'none';
  trackSimuladoAccess();
  renderQuestion();
}

function renderQuestion() {
  var q = activeQuestions[currentQuestion];
  var total = activeQuestions.length;

  document.getElementById('questionCounter').textContent = 'Pergunta ' + (currentQuestion + 1) + ' de ' + total;
  document.getElementById('progressFill').style.width = (((currentQuestion + 1) / total) * 100) + '%';
  document.getElementById('scoreDisplay').textContent = 'Score: ' + score + '/' + currentQuestion;
  document.getElementById('questionNumber').textContent = 'Pergunta ' + (currentQuestion + 1);
  document.getElementById('questionText').textContent = q.question;

  var optionsList = document.getElementById('optionsList');
  optionsList.innerHTML = '';
  q.options.forEach(function(option, index) {
    var btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = option;
    btn.onclick = (function(i, b) { return function() { selectOption(i, b); }; })(index, btn);
    optionsList.appendChild(btn);
  });

  selectedOption = null;
  answered = false;
  document.getElementById('confirmBtn').disabled = true;
  document.getElementById('confirmBtn').style.display = 'inline-flex';
  document.getElementById('nextBtn').style.display = 'none';
  document.getElementById('feedback').style.display = 'none';
}

function selectOption(index, btn) {
  if (answered) return;
  document.querySelectorAll('.option-btn').forEach(function(b) { b.classList.remove('selected'); });
  btn.classList.add('selected');
  selectedOption = index;
  document.getElementById('confirmBtn').disabled = false;
}

function confirmAnswer() {
  if (selectedOption === null || answered) return;
  answered = true;

  var q = activeQuestions[currentQuestion];
  var isCorrect = selectedOption === q.correct;
  if (isCorrect) score++;

  var options = document.querySelectorAll('.option-btn');
  options.forEach(function(btn, index) {
    btn.classList.remove('selected');
    if (index === q.correct) {
      btn.classList.add('correct');
    } else if (index === selectedOption && !isCorrect) {
      btn.classList.add('incorrect');
    }
    btn.style.pointerEvents = 'none';
  });

  var feedback = document.getElementById('feedback');
  feedback.style.display = 'block';
  feedback.className = 'question-feedback ' + (isCorrect ? 'correct' : 'incorrect');
  document.getElementById('feedbackIcon').textContent = isCorrect ? '✅' : '❌';
  document.getElementById('feedbackText').textContent = isCorrect ? 'Resposta correta!' : 'Resposta incorreta';
  document.getElementById('feedbackExplanation').textContent = q.explanation;

  document.getElementById('confirmBtn').style.display = 'none';

  if (currentQuestion < activeQuestions.length - 1) {
    document.getElementById('nextBtn').style.display = 'inline-flex';
  } else {
    setTimeout(showResult, 1200);
  }
}

function nextQuestion() {
  currentQuestion++;
  renderQuestion();
}

function showResult() {
  document.getElementById('quizContainer').style.display = 'none';
  document.getElementById('quizResult').style.display = 'block';

  var total = activeQuestions.length;
  var percent = Math.round((score / total) * 100);

  document.getElementById('finalScore').textContent = score + '/' + total;
  document.getElementById('finalPercent').textContent = percent + '%';
  document.getElementById('resultFill').style.width = percent + '%';

  var bank = (typeof QUIZ_BANK !== 'undefined') ? QUIZ_BANK : QUIZ_DATA;
  var bankInfo = bank.length > total
    ? ' (sorteadas de um banco de ' + bank.length + ' questões)'
    : '';

  var resultIcon = document.getElementById('resultIcon');
  var resultTitle = document.getElementById('resultTitle');
  var resultMessage = document.getElementById('resultMessage');

  if (percent >= 80) {
    resultIcon.textContent = '🎉';
    resultTitle.textContent = 'Excelente!';
    resultMessage.textContent = 'Você está muito bem preparado para o exame. Continue revisando os pontos que errou.' + bankInfo;
  } else if (percent >= 60) {
    resultIcon.textContent = '👍';
    resultTitle.textContent = 'Bom resultado!';
    resultMessage.textContent = 'Você está no caminho certo. Revise os domínios onde teve mais dificuldade.' + bankInfo;
  } else {
    resultIcon.textContent = '📚';
    resultTitle.textContent = 'Continue estudando!';
    resultMessage.textContent = 'Revise o conteúdo dos módulos e refaça o simulado. A prática leva à aprovação.' + bankInfo;
  }
}

function restartQuiz() {
  initQuiz();
}

document.getElementById('confirmBtn').addEventListener('click', confirmAnswer);
document.getElementById('nextBtn').addEventListener('click', nextQuestion);

// ===== TRACKING DE ACESSO AOS SIMULADOS (custo zero — usa API existente) =====
// Registra no DynamoDB quando o aluno inicia um simulado
function trackSimuladoAccess() {
  var page = window.location.pathname.split('/').slice(-2).join('/');
  var apiUrl = (typeof API_ENDPOINT !== 'undefined') ? API_ENDPOINT : 'https://eillhz5fkl.execute-api.us-west-2.amazonaws.com/leads';
  try {
    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'simulado-tracking',
        email: 'tracking@cloudtrilhas.internal',
        consent: true,
        material: 'SIMULADO:' + page
      })
    }).catch(function() {});
  } catch(e) {}
}
// ===== FIM TRACKING =====

// Só inicia automaticamente se o quizContainer estiver visível (sem seletor de quantidade)
var qc = document.getElementById('quizContainer');
if (qc && qc.style.display !== 'none') {
  trackSimuladoAccess();
  initQuiz();
}
