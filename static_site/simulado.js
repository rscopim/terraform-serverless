/**
 * CloudTrilhas — Simulado Interativo
 * Lógica do quiz para certificações AWS
 */

let currentQuestion = 0;
let score = 0;
let selectedOption = null;
let answered = false;

function initQuiz() {
  currentQuestion = 0;
  score = 0;
  selectedOption = null;
  answered = false;
  document.getElementById('quizContainer').style.display = 'block';
  document.getElementById('quizResult').style.display = 'none';
  renderQuestion();
}

function renderQuestion() {
  const q = QUIZ_DATA[currentQuestion];
  const total = QUIZ_DATA.length;

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
    btn.onclick = function() { selectOption(index, btn); };
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

  var q = QUIZ_DATA[currentQuestion];
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

  if (currentQuestion < QUIZ_DATA.length - 1) {
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

  var total = QUIZ_DATA.length;
  var percent = Math.round((score / total) * 100);

  document.getElementById('finalScore').textContent = score + '/' + total;
  document.getElementById('finalPercent').textContent = percent + '%';
  document.getElementById('resultFill').style.width = percent + '%';

  var resultIcon = document.getElementById('resultIcon');
  var resultTitle = document.getElementById('resultTitle');
  var resultMessage = document.getElementById('resultMessage');

  if (percent >= 80) {
    resultIcon.textContent = '🎉';
    resultTitle.textContent = 'Excelente!';
    resultMessage.textContent = 'Você está muito bem preparado para o exame. Continue revisando os pontos que errou.';
  } else if (percent >= 60) {
    resultIcon.textContent = '👍';
    resultTitle.textContent = 'Bom resultado!';
    resultMessage.textContent = 'Você está no caminho certo. Revise os domínios onde teve mais dificuldade.';
  } else {
    resultIcon.textContent = '📚';
    resultTitle.textContent = 'Continue estudando!';
    resultMessage.textContent = 'Revise o conteúdo dos módulos e refaça o simulado. A prática leva à aprovação.';
  }
}

function restartQuiz() {
  initQuiz();
}

document.getElementById('confirmBtn').addEventListener('click', confirmAnswer);
document.getElementById('nextBtn').addEventListener('click', nextQuestion);

initQuiz();
