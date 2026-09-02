/**
 * CloudTrilhas — Dashboard do Aluno
 *
 * Exige login (Cognito). Mostra: resumo, progresso por trilha, histórico de
 * simulados AWS e gráfico de evolução da pontuação (Chart.js).
 */
(function () {
  'use strict';

  // Definição das trilhas e total de módulos (para calcular % de conclusão)
  var TRILHAS = [
    { id: 'linux', nome: '🐧 Linux', total: 5, url: 'linux.html' },
    { id: 'docker', nome: '🐳 Docker', total: 7, url: 'docker.html' },
    { id: 'terraform', nome: '🏗️ Terraform', total: 4, url: 'terraform.html' },
    { id: 'python', nome: '🐍 Python', total: 10, url: 'python.html' },
    { id: 'redes', nome: '🌐 Redes', total: 8, url: 'redes.html' },
    { id: 'github', nome: '🐙 Git & GitHub', total: 9, url: 'github.html' },
    { id: 'cloud-practitioner', nome: '☁️ AWS Cloud Practitioner', total: 4, url: 'cloud-practitioner.html' },
    { id: 'ai-practitioner', nome: '🤖 AWS AI Practitioner', total: 5, url: 'ai-practitioner.html' },
    { id: 'developer', nome: '💻 AWS Developer', total: 4, url: 'developer.html' },
    { id: 'solutions-architect', nome: '🏛️ AWS SA Associate', total: 4, url: 'solutions-architect.html' },
    { id: 'solutions-architect-pro', nome: '🏛️ AWS SA Professional', total: 7, url: 'solutions-architect-pro.html' }
  ];

  // Trilhas consideradas "AWS" (para a seção de simulados)
  var TRILHAS_AWS = ['cloud-practitioner', 'ai-practitioner', 'developer', 'solutions-architect', 'solutions-architect-pro'];

  function el(id) { return document.getElementById(id); }

  function contarConcluidos(trailData) {
    if (!trailData) return 0;
    return Object.keys(trailData).filter(function (k) { return trailData[k] && trailData[k].done; }).length;
  }

  function classeScore(pct) {
    if (pct >= 80) return 'high';
    if (pct >= 60) return 'mid';
    return 'low';
  }

  function renderResumo(data) {
    var totalModulos = 0, concluidos = 0;
    TRILHAS.forEach(function (t) {
      totalModulos += t.total;
      concluidos += Math.min(contarConcluidos(data.trails[t.id]), t.total);
    });
    var pctGeral = totalModulos ? Math.round((concluidos / totalModulos) * 100) : 0;
    var totalQuizzes = (data.quizzes || []).length;
    var melhorScore = 0;
    (data.quizzes || []).forEach(function (q) { if (q.percent > melhorScore) melhorScore = q.percent; });

    el('statCards').innerHTML =
      card(pctGeral + '%', 'Progresso geral') +
      card(concluidos + '/' + totalModulos, 'Módulos concluídos') +
      card(totalQuizzes, 'Simulados realizados') +
      card(totalQuizzes ? melhorScore + '%' : '—', 'Melhor pontuação');
  }

  function card(num, lbl) {
    return '<div class="dash-stat"><div class="num">' + num + '</div><div class="lbl">' + lbl + '</div></div>';
  }

  function renderTrilhas(data) {
    var html = '';
    TRILHAS.forEach(function (t) {
      var feitos = Math.min(contarConcluidos(data.trails[t.id]), t.total);
      var pct = t.total ? Math.round((feitos / t.total) * 100) : 0;
      html +=
        '<div class="trail-row">' +
        '  <div class="top">' +
        '    <a class="name" href="' + t.url + '" style="text-decoration:none">' + t.nome + '</a>' +
        '    <span class="pct">' + pct + '%</span>' +
        '  </div>' +
        '  <div class="bar"><span style="width:' + pct + '%"></span></div>' +
        '  <div class="meta">' + feitos + ' de ' + t.total + ' módulos concluídos</div>' +
        '</div>';
    });
    el('trailsList').innerHTML = html;
  }

  function renderSimulados(data) {
    var quizzesAws = (data.quizzes || []).filter(function (q) {
      var trail = (q.trail || '').toLowerCase();
      return TRILHAS_AWS.some(function (t) { return trail.indexOf(t) !== -1; }) ||
             trail.indexOf('aws') !== -1 || trail.indexOf('practitioner') !== -1 ||
             trail.indexOf('architect') !== -1 || trail.indexOf('developer') !== -1;
    });

    // Se não há simulados AWS, mostra todos os simulados como fallback
    var lista = quizzesAws.length ? quizzesAws : (data.quizzes || []);

    if (!lista.length) {
      el('chartEmpty').style.display = 'block';
      el('scoreChart').style.display = 'none';
      el('quizHistory').innerHTML = '<div class="dash-empty">Nenhum simulado registrado ainda.</div>';
      return;
    }

    // Ordena por data
    lista = lista.slice().sort(function (a, b) { return (a.ts || 0) - (b.ts || 0); });

    // Gráfico de evolução
    renderChart(lista);

    // Tabela de histórico (mais recentes primeiro)
    var rows = lista.slice().reverse().map(function (q) {
      var d = new Date((q.ts || 0) * 1000);
      var data_ = d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      var cls = classeScore(q.percent || 0);
      return '<tr>' +
        '<td>' + data_ + '</td>' +
        '<td>' + escapeHtml(q.trail || '—') + '</td>' +
        '<td>' + (q.score || 0) + '/' + (q.total || 0) + '</td>' +
        '<td><span class="badge-score ' + cls + '">' + (q.percent || 0) + '%</span></td>' +
        '</tr>';
    }).join('');

    el('quizHistory').innerHTML =
      '<table class="quiz-table"><thead><tr>' +
      '<th>Data</th><th>Simulado</th><th>Acertos</th><th>Pontuação</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table>';
  }

  var chartInstance = null;
  function renderChart(lista) {
    var ctx = el('scoreChart');
    if (!ctx || !window.Chart) return;
    el('chartEmpty').style.display = 'none';
    ctx.style.display = 'block';

    var labels = lista.map(function (q) {
      var d = new Date((q.ts || 0) * 1000);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    });
    var valores = lista.map(function (q) { return q.percent || 0; });

    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Pontuação (%)',
          data: valores,
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79,70,229,0.12)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: '#4f46e5'
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true, max: 100, ticks: { callback: function (v) { return v + '%'; } } }
        },
        plugins: { legend: { display: true } }
      }
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function logout(e) {
    e.preventDefault();
    if (window.CloudTrilhasAuth) window.CloudTrilhasAuth.logout();
    window.location.href = 'index.html';
  }

  async function init() {
    // Gate: exige login
    if (!window.CloudTrilhasAuth) {
      window.location.replace('login.html?redirect=/dashboard.html');
      return;
    }
    var logado = await window.CloudTrilhasAuth.isAuthenticated();
    if (!logado) {
      window.location.replace('login.html?redirect=/dashboard.html');
      return;
    }

    var email = window.CloudTrilhasAuth.currentUserEmail();
    if (email) el('dashWelcome').textContent = 'Olá, ' + email + ' — acompanhe sua evolução abaixo.';

    var lo = el('navLogout'), loM = el('navLogoutMobile');
    if (lo) lo.addEventListener('click', logout);
    if (loM) loM.addEventListener('click', logout);

    var data = await window.CloudTrilhasProgress.fetch();
    data.trails = data.trails || {};
    data.quizzes = data.quizzes || [];

    renderResumo(data);
    renderTrilhas(data);
    renderSimulados(data);

    el('dashLoading').style.display = 'none';
    el('dashContent').style.display = 'block';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
