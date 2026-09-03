/**
 * CloudTrilhas — Simulado Interativo
 * Suporta banco de questões com seleção aleatória a cada reinício.
 * Requer identificação do aluno (nome + email) antes de iniciar.
 */

var QUIZ_SIZE = (typeof QUIZ_SIZE !== 'undefined') ? QUIZ_SIZE : 20;

var currentQuestion = 0;
var score = 0;
var selectedOption = null;
var answered = false;
var activeQuestions = [];

// ===== DADOS DO ALUNO (preenchidos no formulário) =====
var quizUserName = '';
var quizUserEmail = '';
// ===== FIM DADOS DO ALUNO =====

function shuffleArray(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

function pickQuestions() {
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

  // ===== REGISTRA RESULTADO DO SIMULADO =====
  trackSimuladoResult(score, total);
  // ===== FIM REGISTRO =====

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
    resultMessage.textContent = 'Você está muito bem preparado. Continue revisando os pontos que errou.' + bankInfo;
  } else if (percent >= 60) {
    resultIcon.textContent = '👍';
    resultTitle.textContent = 'Bom resultado!';
    resultMessage.textContent = 'Você está no caminho certo. Revise os domínios onde teve mais dificuldade.' + bankInfo;
  } else {
    resultIcon.textContent = '📚';
    resultTitle.textContent = 'Continue estudando!';
    resultMessage.textContent = 'Revise o conteúdo dos módulos e refaça o simulado.' + bankInfo;
  }
}

function restartQuiz() {
  initQuiz();
}

document.getElementById('confirmBtn').addEventListener('click', confirmAnswer);
document.getElementById('nextBtn').addEventListener('click', nextQuestion);

// ===== FORMULÁRIO DE IDENTIFICAÇÃO DO ALUNO =====
function createUserForm() {
  var container = document.querySelector('.section.container');
  if (!container) return;

  var formDiv = document.createElement('div');
  formDiv.id = 'quizUserForm';
  formDiv.style.cssText = 'max-width:420px;margin:0 auto;text-align:center;';
  formDiv.innerHTML =
    '<div style="background:#fff;border:1px solid var(--gray-200);border-radius:16px;padding:32px;box-shadow:0 8px 30px rgba(0,0,0,0.08)">' +
    '<div style="font-size:2rem;margin-bottom:12px">👤</div>' +
    '<h2 style="font-size:1.3rem;font-weight:800;margin-bottom:6px;color:var(--gray-900)">Identifique-se para iniciar</h2>' +
    '<p style="color:var(--gray-500);font-size:0.86rem;margin-bottom:24px">Preencha seus dados para acessar o simulado e registrar seu desempenho.</p>' +
    '<form id="quizIdentForm" style="display:grid;gap:12px;text-align:left">' +
    '<div style="display:grid;gap:4px"><label style="font-weight:700;font-size:0.84rem;color:var(--gray-700)">Nome</label>' +
    '<input type="text" id="quizNameInput" placeholder="Seu nome completo" required style="width:100%;padding:11px 14px;border:1.5px solid var(--gray-200);border-radius:10px;font-size:0.9rem;background:var(--gray-50)">' +
    '</div>' +
    '<div style="display:grid;gap:4px"><label style="font-weight:700;font-size:0.84rem;color:var(--gray-700)">E-mail</label>' +
    '<input type="email" id="quizEmailInput" placeholder="seu@email.com" required style="width:100%;padding:11px 14px;border:1.5px solid var(--gray-200);border-radius:10px;font-size:0.9rem;background:var(--gray-50)">' +
    '</div>' +
    '<button type="submit" style="margin-top:8px;cursor:pointer;background:linear-gradient(135deg,#4f46e5,#06b6d4);color:#fff;padding:13px;border:none;border-radius:10px;font-size:0.9rem;font-weight:700;box-shadow:0 4px 14px rgba(79,70,229,0.25)">Acessar Simulado →</button>' +
    '</form>' +
    '</div>';

  // Insere antes do quizSetup (simulados AWS) ou quizContainer (testes)
  var quizSetup = document.getElementById('quizSetup');
  var quizContainer = document.getElementById('quizContainer');
  var target = quizSetup || quizContainer;

  if (target) {
    target.parentNode.insertBefore(formDiv, target);
    if (quizSetup) quizSetup.style.display = 'none';
    if (quizContainer) quizContainer.style.display = 'none';
  }

  document.getElementById('quizIdentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    quizUserName = document.getElementById('quizNameInput').value.trim();
    quizUserEmail = document.getElementById('quizEmailInput').value.trim();

    if (!quizUserName || !quizUserEmail) return;

    // Salva no localStorage para próximas vezes
    localStorage.setItem('cloudtrilhas_user_name', quizUserName);
    localStorage.setItem('cloudtrilhas_user_email', quizUserEmail);

    // Esconde formulário
    formDiv.style.display = 'none';

    // Mostra seletor ou inicia quiz
    if (quizSetup) {
      quizSetup.style.display = 'block';
    } else if (quizContainer) {
      quizContainer.style.display = 'block';
      initQuiz();
    }
  });
}

// Verifica se já tem dados salvos
function checkSavedUser() {
  var savedName = localStorage.getItem('cloudtrilhas_user_name');
  var savedEmail = localStorage.getItem('cloudtrilhas_user_email');

  if (savedName && savedEmail) {
    quizUserName = savedName;
    quizUserEmail = savedEmail;
    return true;
  }
  return false;
}
// ===== FIM FORMULÁRIO DE IDENTIFICAÇÃO =====

// ===== TRACKING DE ACESSO AOS SIMULADOS =====
function trackSimuladoAccess() {
  // Only track when explicitly called (on quiz start), not on page load
  var page = window.location.pathname.split('/').slice(-2).join('/');
  var apiUrl = (window.CLOUDTRILHAS_CONFIG && window.CLOUDTRILHAS_CONFIG.apiEndpoint)
    ? window.CLOUDTRILHAS_CONFIG.apiEndpoint + '/leads'
    : null;
  if (!apiUrl) return;
  try {
    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'simulado-access',
        page: page,
        name: quizUserName || 'anonymous',
        email: quizUserEmail || 'tracking@cloudtrilhas.internal',
        consent: true,
        material: page
      })
    }).catch(function() {});
  } catch(e) {}
}

function trackSimuladoResult(scoreVal, totalVal) {
  var page = window.location.pathname.split('/').slice(-2).join('/');
  var trail = window.location.pathname.split('/').filter(Boolean).slice(-2)[0] || page;
  var percentVal = totalVal ? Math.round((scoreVal / totalVal) * 100) : 0;

  // Salva no dashboard do aluno (progresso persistente, se logado)
  try {
    if (window.CloudTrilhasProgress) {
      window.CloudTrilhasProgress.addQuizResult({
        trail: trail,
        quiz: page,
        score: scoreVal,
        total: totalVal,
        percent: percentVal
      });
    }
  } catch (e) {}

  var apiUrl = (window.CLOUDTRILHAS_CONFIG && window.CLOUDTRILHAS_CONFIG.apiEndpoint)
    ? window.CLOUDTRILHAS_CONFIG.apiEndpoint + '/leads'
    : null;
  if (!apiUrl) return;
  try {
    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'simulado-result',
        page: page,
        name: quizUserName || 'anonymous',
        email: quizUserEmail || 'tracking@cloudtrilhas.internal',
        consent: true,
        material: page,
        score: scoreVal,
        total: totalVal
      })
    }).catch(function() {});
  } catch(e) {}
}
// ===== FIM TRACKING =====

// ===== INICIALIZAÇÃO =====
// A identificação agora vem do Cognito (o aluno já está logado para acessar
// a trilha). Não pedimos mais nome/e-mail — usamos a sessão automaticamente.
(function iniciarSimulado() {
  // Preenche identidade a partir da sessão Cognito, se disponível
  try {
    if (window.CloudTrilhasAuth) {
      var email = window.CloudTrilhasAuth.currentUserEmail();
      if (email) {
        quizUserEmail = email;
        quizUserName = email.split('@')[0];
      }
    }
  } catch (e) {}

  // Fallback: reaproveita dados locais antigos, se houver
  if (!quizUserEmail) { checkSavedUser(); }

  // Mostra o seletor de tamanho (quizSetup) ou inicia direto (quizContainer),
  // sem exigir formulário de identificação.
  var quizSetup = document.getElementById('quizSetup');
  var quizContainer = document.getElementById('quizContainer');
  if (quizSetup) {
    quizSetup.style.display = 'block';
  } else if (quizContainer && quizContainer.style.display !== 'none') {
    initQuiz();
  }
})();
// ===== FIM INICIALIZAÇÃO =====
