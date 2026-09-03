// === Configuration ===
        const API_BASE_URL = 'https://eillhz5fkl.execute-api.us-west-2.amazonaws.com';
        const API_URL = `${API_BASE_URL}/analytics`;
        const VISITOR_COUNTER_URL = `${API_BASE_URL}/counter`;
        const COSTS_API_URL = `${API_BASE_URL}/costs`;
        const GOVERNANCE_API_URL = `${API_BASE_URL}/governance`;
        const AUTH_LOGIN_URL = `${API_BASE_URL}/auth/login`;
        const AUTH_LOGOUT_URL = `${API_BASE_URL}/auth/logout`;
        const AUTH_USERS_URL = `${API_BASE_URL}/auth/users`;

        const SESSION_TOKEN_KEY = 'ct_admin_token';
        const SESSION_USER_KEY = 'ct_admin_user';
        const SESSION_EXPIRES_KEY = 'ct_admin_expires_at';

        let timelineChart = null;
        let trailsChart = null;
        let sourcesChart = null;
        let currentPeriod = 7;

        // === Authentication (Amazon Cognito) ===
        function getAuthToken() {
            var t = window.CloudTrilhasAuth && window.CloudTrilhasAuth.getTokens();
            return t ? t.accessToken : '';
        }

        function getAuthenticatedUser() {
            if (!window.CloudTrilhasAuth) return null;
            var email = window.CloudTrilhasAuth.currentUserEmail();
            if (!email) return null;
            return {
                username: email,
                name: email,
                email: email,
                role: window.CloudTrilhasAuth.isAdmin() ? 'ADMIN' : 'VIEWER'
            };
        }

        function isAdminUser() {
            return window.CloudTrilhasAuth && window.CloudTrilhasAuth.isAdmin();
        }

        function configureAccessByRole() {
            // A gestão de usuários agora é feita no console do Amazon Cognito
            // (grupo 'admin'). A seção antiga de admin_auth fica oculta.
            const adminUsersSection = document.getElementById('adminUsersSection');
            if (adminUsersSection) {
                adminUsersSection.classList.add('hidden');
            }
        }

        function getAuthHeaders(includeJson = false) {
            const headers = {};
            const token = getAuthToken();

            if (token) headers.Authorization = `Bearer ${token}`;
            if (includeJson) headers['Content-Type'] = 'application/json';

            return headers;
        }

        function clearSession() {
            if (window.CloudTrilhasAuth) window.CloudTrilhasAuth.logout();
        }

        function showLogin(message = '') {
            clearSession();
            document.getElementById('dashboard').classList.add('hidden');
            document.getElementById('authOverlay').classList.remove('hidden');
            document.getElementById('loadingOverlay').classList.add('hidden');

            const errorEl = document.getElementById('authError');
            errorEl.textContent = message || 'Usuário ou senha inválidos.';
            errorEl.style.display = message ? 'block' : 'none';
            document.getElementById('authPassword').value = '';
            document.getElementById('authUsername').focus();
        }

        function showDashboard(user) {
            document.getElementById('authOverlay').classList.add('hidden');
            document.getElementById('dashboard').classList.remove('hidden');
            document.getElementById('loggedUser').textContent =
                `${user.name || user.username} (${user.role || 'VIEWER'})`;

            configureAccessByRole();
        }

        async function authenticate() {
            const email = document.getElementById('authUsername').value.trim();
            const password = document.getElementById('authPassword').value;
            const errorEl = document.getElementById('authError');
            const button = document.getElementById('loginButton');

            errorEl.style.display = 'none';

            if (!email || !password) {
                errorEl.textContent = 'Informe o e-mail e a senha.';
                errorEl.style.display = 'block';
                return;
            }

            button.disabled = true;
            button.textContent = 'Entrando...';

            try {
                await window.CloudTrilhasAuth.signIn(email, password);

                // Só administradores (grupo 'admin' no Cognito) acessam o dashboard
                if (!window.CloudTrilhasAuth.isAdmin()) {
                    window.CloudTrilhasAuth.logout();
                    throw new Error('Acesso restrito a administradores.');
                }

                showDashboard(getAuthenticatedUser());
                await loadData();
            } catch (error) {
                console.error('Erro de autenticação:', error);
                errorEl.textContent = error.message || 'E-mail ou senha inválidos.';
                errorEl.style.display = 'block';
                document.getElementById('authPassword').value = '';
                document.getElementById('authPassword').focus();
            } finally {
                button.disabled = false;
                button.textContent = 'Entrar';
            }
        }

        async function logout() {
            if (window.CloudTrilhasAuth) window.CloudTrilhasAuth.logout();
            showLogin();
        }

        // === Recuperação de senha (Cognito) ===
        function showRecover() {
            document.getElementById('authOverlay').classList.add('hidden');
            document.getElementById('recoverOverlay').classList.remove('hidden');
        }
        function backToLogin() {
            document.getElementById('recoverOverlay').classList.add('hidden');
            document.getElementById('authOverlay').classList.remove('hidden');
        }
        async function recoverSend() {
            const email = document.getElementById('recEmail').value.trim();
            const msg = document.getElementById('recMsg');
            msg.style.display = 'none';
            if (!email) { msg.textContent = 'Informe o e-mail.'; msg.style.display = 'block'; return; }
            try {
                await window.CloudTrilhasAuth.forgotPassword(email);
                document.getElementById('recStep2').classList.remove('hidden');
                msg.style.color = '#4ade80';
                msg.textContent = 'Código enviado! Verifique seu e-mail.';
                msg.style.display = 'block';
            } catch (e) {
                msg.style.color = '#f87171';
                msg.textContent = e.message || 'Falha ao enviar código.';
                msg.style.display = 'block';
            }
        }
        async function recoverConfirm() {
            const email = document.getElementById('recEmail').value.trim();
            const code = document.getElementById('recCode').value.trim();
            const novo = document.getElementById('recNewPass').value;
            const msg = document.getElementById('recMsg');
            msg.style.display = 'none';
            try {
                await window.CloudTrilhasAuth.confirmForgotPassword(email, code, novo);
                msg.style.color = '#4ade80';
                msg.textContent = 'Senha redefinida! Você já pode entrar.';
                msg.style.display = 'block';
                setTimeout(backToLogin, 1500);
            } catch (e) {
                msg.style.color = '#f87171';
                msg.textContent = e.message || 'Falha ao redefinir senha.';
                msg.style.display = 'block';
            }
        }

        async function authenticatedFetch(url, options = {}) {
            const headers = {
                ...(options.headers || {}),
                ...getAuthHeaders(false)
            };

            const response = await fetch(url, { ...options, headers });

            if (response.status === 401) {
                showLogin('Sua sessão expirou. Entre novamente.');
                throw new Error('Sessão expirada');
            }

            if (response.status === 403) {
                const error = new Error('Você não possui permissão para esta operação.');
                error.status = 403;
                throw error;
            }

            return response;
        }

        document.getElementById('authPassword').addEventListener('keydown', (event) => {
            if (event.key === 'Enter') authenticate();
        });
        document.getElementById('authUsername').addEventListener('keydown', (event) => {
            if (event.key === 'Enter') authenticate();
        });

        async function restoreSession() {
            if (!window.CloudTrilhasAuth) { showLogin(); return; }

            var logado = false;
            try { logado = await window.CloudTrilhasAuth.isAuthenticated(); } catch (e) { logado = false; }

            if (!logado) { showLogin(); return; }

            // Sessão Cognito válida — exige grupo admin para o dashboard
            if (!window.CloudTrilhasAuth.isAdmin()) {
                showLogin('Acesso restrito a administradores. Se você foi adicionado ao grupo admin recentemente, saia e entre novamente para atualizar suas permissões.');
                return;
            }

            try {
                showDashboard(getAuthenticatedUser());
                await loadData();
            } catch (error) {
                console.error('Erro ao restaurar sessão:', error);
                showLogin('Não foi possível restaurar a sessão. Entre novamente.');
            }
        }

        // Liga os links de recuperação de senha
        document.getElementById('forgotLink').addEventListener('click', function (e) { e.preventDefault(); showRecover(); });
        document.getElementById('backToLoginLink').addEventListener('click', function (e) { e.preventDefault(); backToLogin(); });

        restoreSession();

        // === Period Selector ===
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentPeriod = parseInt(btn.dataset.days);
                loadData();
            });
        });

        // === Data Loading ===
        async function loadData() {
            const loading = document.getElementById('loadingOverlay');
            const errorState = document.getElementById('errorState');
            loading.classList.remove('hidden');
            errorState.classList.add('hidden');

            try {
                const response = await authenticatedFetch(`${API_URL}?period=${currentPeriod}`);
                if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                const data = await response.json();
                renderDashboard(data);
                await loadVisitorCounter();
                await loadCosts();
                await loadGovernance();

                if (isAdminUser()) {
                    await loadAdminUsers();
                }
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                document.getElementById('errorMessage').textContent = 
                    `Erro: ${error.message}`;
                errorState.classList.remove('hidden');
            } finally {
                loading.classList.add('hidden');
            }
        }

        function refreshData() {
            loadData();
        }

        // ======================================================
        // Visitor Counter
        // Recupera o total de visitantes registrados.
        // ======================================================
        async function loadVisitorCounter() {
            try {
                const response = await authenticatedFetch(VISITOR_COUNTER_URL);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();

                document.getElementById('visitorCounter').textContent =
                    formatNumber(data.count || 0);

            } catch (error) {
                console.error('Erro ao carregar Visitor Counter:', error);
                document.getElementById('visitorCounter').textContent = '—';
            }
        }

        // === Render Dashboard ===
        function renderDashboard(data) {
            // Timestamp
            document.getElementById('timestamp').textContent = 
                data.generated_at ? new Date(data.generated_at).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR');

            // Summary Cards
            const s = data.summary || {};
            document.getElementById('totalUsers').textContent = formatNumber(s.unique_users || 0);
            document.getElementById('trailAccess').textContent = formatNumber(s.total_trail_access || 0);
            document.getElementById('totalSimulados').textContent = formatNumber(s.total_simulado_access || 0);
            document.getElementById('totalDownloads').textContent = formatNumber(s.total_downloads || 0);

            // Timeline Chart (data.timeline is {date: count} dict)
            const timeline = Object.entries(data.timeline || {}).map(([date, count]) => ({date, count}));
            renderTimelineChart(timeline);

            // Top Trails (data.trails is {page: count} dict)
            const trails = Object.entries(data.trails || {}).slice(0, 10).map(([name, count]) => ({name, count}));
            renderTrailsChart(trails);

            // Sources (data.sources is {source: count} dict)
            const sources = Object.entries(data.sources || {}).map(([source, count]) => ({source, count}));
            renderSourcesChart(sources);

            // Institutions (data.institutions is {name: count} dict)
            const institutions = Object.entries(data.institutions || {}).map(([name, count]) => ({name, count}));
            renderInstitutionsTable(institutions);

            // Simulados (data.simulados is {page: {access, results, avg_score}} dict)
            const simulados = Object.entries(data.simulados || {}).map(([page, d]) => ({
                page, accesses: d.access, results: d.results, avgScore: d.avg_score
            }));
            renderSimuladosTable(simulados);

            // Recent Users (data.recent_users is array)
            renderRecentUsersTable(data.recent_users || []);

            // AWS Costs (if available)
            renderCosts(data.costs || null);
        }

        // === Chart Rendering ===
        function renderTimelineChart(timeline) {
            const ctx = document.getElementById('timelineChart').getContext('2d');
            if (timelineChart) timelineChart.destroy();

            timelineChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: timeline.map(t => formatDate(t.date)),
                    datasets: [{
                        label: 'Acessos',
                        data: timeline.map(t => t.count),
                        borderColor: '#4f46e5',
                        backgroundColor: 'rgba(79, 70, 229, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#4f46e5',
                        pointBorderColor: '#4f46e5',
                        pointRadius: 3,
                        pointHoverRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: '#1e293b',
                            titleColor: '#f1f5f9',
                            bodyColor: '#94a3b8',
                            borderColor: '#334155',
                            borderWidth: 1
                        }
                    },
                    scales: {
                        x: {
                            grid: { color: 'rgba(51,65,85,0.5)' },
                            ticks: { color: '#94a3b8', maxTicksLimit: 10 }
                        },
                        y: {
                            grid: { color: 'rgba(51,65,85,0.5)' },
                            ticks: { color: '#94a3b8' },
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        function renderTrailsChart(trails) {
            const ctx = document.getElementById('trailsChart').getContext('2d');
            if (trailsChart) trailsChart.destroy();

            const colors = [
                '#4f46e5', '#7c3aed', '#2563eb', '#0891b2',
                '#059669', '#d97706', '#dc2626', '#db2777',
                '#4338ca', '#0d9488'
            ];

            trailsChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: trails.map(t => truncateLabel(t.name, 25)),
                    datasets: [{
                        label: 'Acessos',
                        data: trails.map(t => t.count),
                        backgroundColor: colors.slice(0, trails.length),
                        borderRadius: 4,
                        barThickness: 24
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: '#1e293b',
                            titleColor: '#f1f5f9',
                            bodyColor: '#94a3b8',
                            borderColor: '#334155',
                            borderWidth: 1
                        }
                    },
                    scales: {
                        x: {
                            grid: { color: 'rgba(51,65,85,0.5)' },
                            ticks: { color: '#94a3b8' },
                            beginAtZero: true
                        },
                        y: {
                            grid: { display: false },
                            ticks: { color: '#e2e8f0', font: { size: 11 } }
                        }
                    }
                }
            });
        }

        function renderSourcesChart(sources) {
            const ctx = document.getElementById('sourcesChart').getContext('2d');
            if (sourcesChart) sourcesChart.destroy();

            const colors = [
                '#4f46e5', '#7c3aed', '#2563eb', '#0891b2',
                '#059669', '#d97706', '#dc2626', '#db2777'
            ];

            sourcesChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: sources.map(s => s.source),
                    datasets: [{
                        data: sources.map(s => s.count),
                        backgroundColor: colors.slice(0, sources.length),
                        borderColor: '#1e293b',
                        borderWidth: 3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                color: '#e2e8f0',
                                padding: 12,
                                font: { size: 12 }
                            }
                        },
                        tooltip: {
                            backgroundColor: '#1e293b',
                            titleColor: '#f1f5f9',
                            bodyColor: '#94a3b8',
                            borderColor: '#334155',
                            borderWidth: 1
                        }
                    }
                }
            });
        }

        // === Table Rendering ===
        function renderInstitutionsTable(institutions) {
            const tbody = document.getElementById('institutionsTable');
            tbody.innerHTML = institutions.map((inst, i) => `
                <tr>
                    <td><span class="badge badge-purple">${i + 1}</span></td>
                    <td>${escapeHtml(inst.name)}</td>
                    <td>${formatNumber(inst.count)}</td>
                </tr>
            `).join('') || '<tr><td colspan="3" style="text-align:center;color:#94a3b8;">Sem dados</td></tr>';
        }

        function renderSimuladosTable(simulados) {
            const tbody = document.getElementById('simuladosTable');
            tbody.innerHTML = simulados.map(s => `
                <tr>
                    <td>${escapeHtml(s.page || s.name)}</td>
                    <td>${formatNumber(s.accesses || 0)}</td>
                    <td>${formatNumber(s.results || 0)}</td>
                    <td><span class="badge badge-green">${s.avgScore != null ? s.avgScore.toFixed(1) + '%' : '—'}</span></td>
                </tr>
            `).join('') || '<tr><td colspan="4" style="text-align:center;color:#94a3b8;">Sem dados</td></tr>';
        }

        function renderRecentUsersTable(users) {
            const tbody = document.getElementById('recentUsersTable');
            tbody.innerHTML = users.map(u => `
                <tr>
                    <td>${escapeHtml(u.name || 'Anônimo')}</td>
                    <td>${maskEmail(u.email || '')}</td>
                    <td>${escapeHtml(u.page || '—')}</td>
                    <td>${formatDate(u.date)}</td>
                </tr>
            `).join('') || '<tr><td colspan="4" style="text-align:center;color:#94a3b8;">Sem dados</td></tr>';
        }

        // === Utility Functions ===
        function formatNumber(num) {
            if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
            if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
            return num.toLocaleString('pt-BR');
        }

        function formatDate(dateStr) {
            if (!dateStr) return '—';
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return date.toLocaleDateString('pt-BR', { 
                day: '2-digit', month: '2-digit', year: '2-digit' 
            });
        }

        function maskEmail(email) {
            if (!email || !email.includes('@')) return '***';
            const [user, domain] = email.split('@');
            const masked = user.charAt(0) + '***' + user.charAt(user.length - 1);
            return masked + '@' + domain;
        }

        function truncateLabel(str, max) {
            if (!str) return '';
            return str.length > max ? str.substring(0, max) + '...' : str;
        }

        // ======================================================
        // FinOps Dashboard
        // Recupera custos reais da AWS via API /costs.
        // ======================================================
        async function loadCosts() {
            try {
                const response = await authenticatedFetch(COSTS_API_URL);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const costs = await response.json();

                renderCosts(costs);

            } catch (error) {
                console.error('Erro ao carregar custos AWS:', error);
                renderCosts(null);
            }
        }

        // === Costs Rendering ===
        let costsChart = null;

        function renderCosts(costs) {
            const metaEl = document.getElementById('costsMeta');
            const totalEl = document.getElementById('totalCost');
            const tableEl = document.getElementById('costsTable');

            if (!costs || !costs.total) {
                totalEl.textContent = '—';
                tableEl.innerHTML = '<tr><td colspan="2" style="text-align:center;color:#94a3b8;">Módulo de custos pendente de deploy</td></tr>';
                metaEl.textContent = 'Dados indisponíveis — aguardando deploy do módulo de custos';
                return;
            }

            totalEl.textContent = '$' + parseFloat(costs.total).toFixed(2);
            metaEl.textContent = costs.period || 'Mês atual';

            // Services table
            const services = costs.services || {};
            const sorted = Object.entries(services).sort((a, b) => b[1] - a[1]);
            tableEl.innerHTML = sorted.map(([svc, amount]) => `
                <tr>
                    <td>${escapeHtml(svc)}</td>
                    <td>$${parseFloat(amount).toFixed(2)}</td>
                </tr>
            `).join('') || '<tr><td colspan="2" style="text-align:center;color:#94a3b8;">Sem custos</td></tr>';

            // Daily costs chart
            const daily = costs.daily || {};
            const ctx = document.getElementById('costsChart').getContext('2d');
            if (costsChart) costsChart.destroy();

            const entries = Object.entries(daily).sort((a, b) => a[0].localeCompare(b[0]));
            if (entries.length > 0) {
                costsChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: entries.map(([d]) => formatDate(d)),
                        datasets: [{
                            label: 'USD',
                            data: entries.map(([, v]) => parseFloat(v)),
                            backgroundColor: '#f59e0b',
                            borderRadius: 4,
                            barThickness: 16
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            tooltip: { backgroundColor: '#1e293b', titleColor: '#f1f5f9', bodyColor: '#94a3b8', borderColor: '#334155', borderWidth: 1 }
                        },
                        scales: {
                            x: { grid: { color: 'rgba(51,65,85,0.5)' }, ticks: { color: '#94a3b8', maxTicksLimit: 10 } },
                            y: { grid: { color: 'rgba(51,65,85,0.5)' }, ticks: { color: '#94a3b8', callback: v => '$' + v.toFixed(2) }, beginAtZero: true }
                        }
                    }
                });
            }
        }

        // ======================================================
        // Governance Dashboard
        // Recupera o inventário de recursos do CloudTrilhas via API /governance.
        // ======================================================
        async function loadGovernance() {
            try {
                const response = await authenticatedFetch(GOVERNANCE_API_URL);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const governance = await response.json();

                renderGovernance(governance);

            } catch (error) {
                console.error('Erro ao carregar governança AWS:', error);
                renderGovernance(null);
            }
        }

        function renderGovernance(governance) {
            const totalEl = document.getElementById('governanceTotal');
            const compliantEl = document.getElementById('governanceCompliant');
            const pendingEl = document.getElementById('governancePending');
            const tableEl = document.getElementById('governanceTable');
            const metaEl = document.getElementById('governanceMeta');

            if (!governance || !governance.summary) {
                totalEl.textContent = '—';
                compliantEl.textContent = '—';
                pendingEl.textContent = '—';
                tableEl.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#94a3b8;">Dados de governança indisponíveis</td></tr>';
                metaEl.textContent = 'Dados indisponíveis — aguardando retorno da API de governança';
                return;
            }

            const summary = governance.summary;
            const resources = governance.resources || [];

            totalEl.textContent = formatNumber(summary.total || 0);
            compliantEl.textContent = formatNumber(summary.compliant || 0);
            pendingEl.textContent = formatNumber(summary.non_compliant || 0);

            metaEl.textContent = `Projeto: ${summary.project || '—'} | Tags obrigatórias: ${(summary.required_tags || []).join(', ')}`;

            const sortedResources = resources.sort((a, b) => {
                if (a.compliant !== b.compliant) {
                    return a.compliant ? 1 : -1;
                }

                return `${a.service}-${a.name}`.localeCompare(`${b.service}-${b.name}`);
            });

            tableEl.innerHTML = sortedResources.map(resource => {
                const missingTags = resource.missing_tags && resource.missing_tags.length > 0
                    ? resource.missing_tags.join(', ')
                    : '—';

                const statusBadge = resource.compliant
                    ? '<span class="badge badge-green">OK</span>'
                    : '<span class="badge" style="background:rgba(245,158,11,0.2);color:#fbbf24;">Pendente</span>';

                return `
                    <tr>
                        <td>${escapeHtml(formatAwsServiceName(resource.service))}</td>
                        <td>${escapeHtml(resource.name || '—')}</td>
                        <td>${statusBadge}</td>
                        <td>${escapeHtml(missingTags)}</td>
                    </tr>
                `;
            }).join('') || '<tr><td colspan="4" style="text-align:center;color:#94a3b8;">Nenhum recurso encontrado</td></tr>';
        }

        function formatAwsServiceName(service) {
            const names = {
                apigateway: 'API Gateway',
                cloudfront: 'CloudFront',
                dynamodb: 'DynamoDB',
                events: 'EventBridge',
                lambda: 'AWS Lambda',
                logs: 'CloudWatch Logs',
                s3: 'Amazon S3',
                sns: 'Amazon SNS',
                sqs: 'Amazon SQS'
            };

            return names[service] || service;
        }

        function escapeHtml(str) {
            if (!str) return '';
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }

        // ======================================================
        // Admin Users
        // ======================================================
        function setUsersMessage(message, isError = false) {
            const element = document.getElementById('usersMessage');
            element.textContent = message;
            element.style.color = isError ? '#fca5a5' : '#6ee7b7';
        }

        async function loadAdminUsers() {
            if (!isAdminUser()) return;

            const table = document.getElementById('adminUsersTable');

            try {
                const response = await authenticatedFetch(AUTH_USERS_URL);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const data = await response.json();
                const users = data.users || [];

                table.innerHTML = users.map(user => {
                    const statusClass = user.status === 'ACTIVE'
                        ? 'badge-green'
                        : user.status === 'BLOCKED' ? 'badge-red' : 'badge-amber';
                    const nextStatus = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
                    const statusAction = user.status === 'ACTIVE' ? 'Desativar' : 'Ativar';

                    return `
                        <tr>
                            <td>${escapeHtml(user.username)}</td>
                            <td>${escapeHtml(user.name || '—')}</td>
                            <td>${escapeHtml(user.email || '—')}</td>
                            <td><span class="badge badge-purple">${escapeHtml(user.role || 'VIEWER')}</span></td>
                            <td><span class="badge ${statusClass}">${escapeHtml(user.status || 'DISABLED')}</span></td>
                            <td>${formatDateTime(user.last_login)}</td>
                            <td>
                                <div class="table-actions">
                                    <button class="action-btn" onclick="changeUserStatus('${escapeJs(user.username)}','${nextStatus}')">${statusAction}</button>
                                    <button class="action-btn" onclick="changeUserRole('${escapeJs(user.username)}','${escapeJs(user.role || 'VIEWER')}')">Perfil</button>
                                    <button class="action-btn" onclick="resetUserPassword('${escapeJs(user.username)}')">Senha</button>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('') || '<tr><td colspan="7" style="text-align:center;color:#94a3b8;">Nenhum usuário encontrado</td></tr>';
            } catch (error) {
                console.error('Erro ao carregar usuários administrativos:', error);
                table.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#fca5a5;">Não foi possível carregar os usuários</td></tr>';
            }
        }

        async function createAdminUser() {
            const payload = {
                username: document.getElementById('newUsername').value.trim().toLowerCase(),
                name: document.getElementById('newUserName').value.trim(),
                email: document.getElementById('newUserEmail').value.trim().toLowerCase(),
                password: document.getElementById('newUserPassword').value,
                role: document.getElementById('newUserRole').value
            };

            if (!payload.username || !payload.password) {
                setUsersMessage('Usuário e senha são obrigatórios.', true);
                return;
            }

            try {
                const response = await authenticatedFetch(AUTH_USERS_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await response.json().catch(() => ({}));

                if (!response.ok) throw new Error(result.message || 'Falha ao criar usuário.');

                document.getElementById('newUsername').value = '';
                document.getElementById('newUserName').value = '';
                document.getElementById('newUserEmail').value = '';
                document.getElementById('newUserPassword').value = '';
                document.getElementById('newUserRole').value = 'VIEWER';
                setUsersMessage('Usuário criado com sucesso.');
                await loadAdminUsers();
            } catch (error) {
                setUsersMessage(translateAuthError(error.message), true);
            }
        }

        async function updateAdminUser(username, payload) {
            const response = await authenticatedFetch(`${AUTH_USERS_URL}/${encodeURIComponent(username)}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json().catch(() => ({}));

            if (!response.ok) throw new Error(result.message || 'Falha ao atualizar usuário.');
            return result;
        }

        async function changeUserStatus(username, status) {
            if (!confirm(`Confirma alterar ${username} para ${status}?`)) return;

            try {
                await updateAdminUser(username, { status });
                setUsersMessage('Status atualizado com sucesso.');
                await loadAdminUsers();
            } catch (error) {
                setUsersMessage(translateAuthError(error.message), true);
            }
        }

        async function changeUserRole(username, currentRole) {
            const role = prompt('Novo perfil: ADMIN, EDITOR ou VIEWER', currentRole);
            if (!role) return;

            try {
                await updateAdminUser(username, { role: role.trim().toUpperCase() });
                setUsersMessage('Perfil atualizado com sucesso.');
                await loadAdminUsers();
            } catch (error) {
                setUsersMessage(translateAuthError(error.message), true);
            }
        }

        async function resetUserPassword(username) {
            const password = prompt(`Nova senha para ${username}:`);
            if (!password) return;

            try {
                await updateAdminUser(username, { password });
                setUsersMessage('Senha atualizada com sucesso.');
            } catch (error) {
                setUsersMessage(translateAuthError(error.message), true);
            }
        }

        function translateAuthError(message) {
            const translations = {
                'user already exists': 'O usuário já existe.',
                'invalid role': 'Perfil inválido.',
                'invalid status': 'Status inválido.',
                'unauthorized': 'Sessão inválida ou expirada.',
                'admin role required': 'Esta operação exige perfil ADMIN.',
                'Você não possui permissão para esta operação.': 'Esta operação exige perfil ADMIN.',
                'password must have at least 10 characters, uppercase, lowercase and number':
                    'A senha deve ter ao menos 10 caracteres, maiúscula, minúscula e número.'
            };

            return translations[message] || message || 'Não foi possível concluir a operação.';
        }

        function formatDateTime(value) {
            if (!value) return '—';
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return value;
            return date.toLocaleString('pt-BR');
        }

        function escapeJs(value) {
            return String(value || '')
                .replace(/\\/g, '\\\\')
                .replace(/'/g, "\\'")
                .replace(/\r/g, '')
                .replace(/\n/g, '');
        }
