// ============================================================
// DASHBOARD — SISTEMA DE NÍVEL (SCHEMA PADRONIZADO)
// + LOGIN DIRETO NA TABELA "Geral" (sem Supabase Auth)
// + REGENERAÇÃO DE STAMINA OFFLINE (proporcional até 24h / 100% após 24h)
// ============================================================
(function() {
    'use strict';

    const SUPABASE_URL = 'https://xrcxvizzdumcxbylmkvn.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_E-g3G3wW4EySbCsXLXp8KQ_FnmERMcD';
    const TABELA = 'Geral';
    const TABELA_ATIVIDADES = 'Atividades';

    // ==================== SESSÃO (24 HORAS) ====================
    const SESSION_DURATION = 24 * 60 * 60 * 1000;
    const SESSION_KEY = 'usuario_logado';
    const SESSION_TIMESTAMP_KEY = 'session_timestamp';

    // ==================== REGENERAÇÃO DE STAMINA ====================
    const STAMINA_REGEN_INTERVAL   = 30 * 1000;   // online: +1 SM a cada 30s
    const STAMINA_REGEN_PER_TICK   = 1;           // quantidade por tick
    const OFFLINE_MAX_MS           = 24 * 60 * 60 * 1000; // 24h

    function limparSessao() {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(SESSION_TIMESTAMP_KEY);
    }

    function sessaoValida() {
        const timestamp = localStorage.getItem(SESSION_TIMESTAMP_KEY);
        const usuario = localStorage.getItem(SESSION_KEY);
        if (!timestamp || !usuario) return false;
        const loginTime = parseInt(timestamp, 10);
        if (isNaN(loginTime)) return false;
        return (Date.now() - loginTime) < SESSION_DURATION;
    }

    // Cliente Supabase (usa o global do CDN)
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    class LevelSystem {
        constructor() {
            this.nivel = 1;
            this.experiencia = 0;

            this.hpMax = 100;
            this.mpMax = 50;
            this.smMax = 100;
            this.ataqueBase = 15;
            this.defesaBase = 10;
            this.magiaBase = 8;

            this.hp = 100;
            this.mp = 50;
            this.sm = 100;

            this.saldo = 0;
            this.btc = 0;
            this.poderHash = 1.0;

            this.titulos = [
                { min: 1, titulo: '🌱 Iniciante' },
                { min: 5, titulo: '🌿 Aprendiz' },
                { min: 10, titulo: '⚔️ Guerreiro' },
                { min: 20, titulo: '🛡️ Mestre' },
                { min: 35, titulo: '🏆 Lendário' },
                { min: 50, titulo: '👑 Herói' },
                { min: 75, titulo: '⚡ Deus da Guerra' },
                { min: 100, titulo: '🌟 Imortal' },
            ];

            this.usuario = null;          // { login, nome, email }
            this.supabaseOnline = false;
            this.atividades = [];
            this.totalTreinos = 0;
            this.totalDescansos = 0;
            this.ultimaAtividade = null;
            this.ultimoReset = null;
            this.toastTimer = null;
            this.saveTimeout = null;
            this.mineracaoInterval = null;
            this.staminaInterval = null;
            this._processandoJogo = false;
            this.ultimaVezOnline = Date.now();

            // binds
            this.treinar = this.treinar.bind(this);
            this.descansar = this.descansar.bind(this);
            this.resetar = this.resetar.bind(this);
            this.salvar = this.salvar.bind(this);
            this.carregar = this.carregar.bind(this);
            this.atualizarUI = this.atualizarUI.bind(this);
            this.ganharSm = this.ganharSm.bind(this);
            this.gastarSm = this.gastarSm.bind(this);
            this.resetarSm = this.resetarSm.bind(this);
            this.addLog = this.addLog.bind(this);
            this.salvarLog = this.salvarLog.bind(this);
            this.carregarLogs = this.carregarLogs.bind(this);
            this.gastarStaminaParaJogar = this.gastarStaminaParaJogar.bind(this);
            this.configurarEventosDosJogos = this.configurarEventosDosJogos.bind(this);
            this.minerar = this.minerar.bind(this);
            this.upgradeMineracao = this.upgradeMineracao.bind(this);
            this.verificarAdmin = this.verificarAdmin.bind(this);
            this.aplicarRegeneracaoOffline = this.aplicarRegeneracaoOffline.bind(this);
            this.loadUserData = this.loadUserData.bind(this);
        }

        getAtaque()  { return this.ataqueBase + Math.floor(this.nivel * 1.5); }
        getDefesa()  { return this.defesaBase + Math.floor(this.nivel * 1.2); }
        getMagia()   { return this.magiaBase  + Math.floor(this.nivel * 1.0); }
        getHpMax()   { return this.hpMax + Math.floor(this.nivel * 6); }
        getMpMax()   { return this.mpMax + Math.floor(this.nivel * 4); }
        getSmMax()   { return this.smMax + Math.floor(this.nivel * 3); }

        calcularExpProximo(nivel = this.nivel) {
            return Math.floor(100 * Math.pow(1.2, nivel - 1));
        }

        getExpProximo() {
            return this.calcularExpProximo(this.nivel);
        }

        getTitulo() {
            let titulo = this.titulos[0].titulo;
            for (const t of this.titulos) {
                if (this.nivel >= t.min) titulo = t.titulo;
            }
            return titulo;
        }

        // ============================================================
        // REGENERAÇÃO OFFLINE DE STAMINA
        // ============================================================
        aplicarRegeneracaoOffline(timestampUltimaVez) {
            if (!timestampUltimaVez) return;

            const agora = Date.now();
            const offlineMs = agora - timestampUltimaVez;
            if (offlineMs <= 0) return;

            const smMax = this.getSmMax();

            if (this.sm >= smMax) {
                this.ultimaVezOnline = agora;
                return;
            }

            let smGanho = 0;

            if (offlineMs >= OFFLINE_MAX_MS) {
                smGanho = smMax - this.sm;
                console.log(`⏰ Offline ≥ 24h → stamina restaurada ao máximo (+${smGanho})`);
            } else {
                const intervalos = Math.floor(offlineMs / STAMINA_REGEN_INTERVAL);
                smGanho = intervalos * STAMINA_REGEN_PER_TICK;
                if (smGanho <= 0) {
                    this.ultimaVezOnline = agora;
                    return;
                }
                console.log(`⏰ Offline por ${Math.round(offlineMs / 1000 / 60)} min → +${smGanho} SM`);
            }

            const smAntes = this.sm;
            this.sm = Math.min(smMax, this.sm + smGanho);
            this.ultimaVezOnline = agora;

            if (this.sm > smAntes) {
                this.addLog(`⚡ Regenerou +${this.sm - smAntes} SM offline (${this.sm}/${smMax})`, 'info');
                this.atualizarUI();
            }
        }

        // ============================================================
        // ADMIN
        // ============================================================
        async verificarAdmin() {
            const btnAdmin = document.getElementById('btnAdmin');
            if (!btnAdmin) return;

            try {
                if (!this.usuario || !this.usuario.login || !this.supabaseOnline) {
                    btnAdmin.style.display = 'none';
                    btnAdmin.classList.remove('visivel');
                    return;
                }

                const { data, error } = await supabase
                    .from(TABELA)
                    .select('cadeado')
                    .eq('login', this.usuario.login)
                    .maybeSingle();

                if (error) {
                    btnAdmin.style.display = 'none';
                    btnAdmin.classList.remove('visivel');
                    return;
                }

                if (data && data.cadeado === true) {
                    btnAdmin.style.display = 'inline-flex';
                    btnAdmin.classList.add('visivel');
                    console.log('👑 ADMIN LIBERADO para', this.usuario.login);
                } else {
                    btnAdmin.style.display = 'none';
                    btnAdmin.classList.remove('visivel');
                }
            } catch (e) {
                btnAdmin.style.display = 'none';
                btnAdmin.classList.remove('visivel');
            }
        }

        // ============================================================
        // LOGS
        // ============================================================
        addLog(mensagem, tipo = 'info') {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('pt-BR', {
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            });

            this.atividades.unshift({
                time: timeStr, msg: mensagem, type: tipo, timestamp: now.getTime()
            });

            if (this.atividades.length > 50) this.atividades = this.atividades.slice(0, 50);

            this.renderLog();

            if (this.usuario && this.supabaseOnline) this.salvarLog(mensagem, tipo);
        }

        renderLog() {
            const logList = document.getElementById('logList');
            if (!logList) return;

            if (this.atividades.length === 0) {
                logList.innerHTML = `
                    <div class="log-entry">
                        <span class="log-time">--</span>
                        <span class="log-msg" style="color:#6a7a8a;">Aguardando atividades...</span>
                    </div>`;
                return;
            }

            logList.innerHTML = this.atividades.map(log => `
                <div class="log-entry">
                    <span class="log-time">${log.time}</span>
                    <span class="log-msg">${log.msg}</span>
                    <span class="log-badge">${log.type.toUpperCase()}</span>
                </div>
            `).join('');
        }

        async salvarLog(mensagem, tipo) {
            if (!this.usuario || !this.supabaseOnline) return;
            try {
                const { error } = await supabase.from(TABELA_ATIVIDADES).insert({
                    login: this.usuario.login,
                    mensagem, tipo,
                    nivel: this.nivel,
                    exp: this.experiencia,
                    created_at: new Date().toISOString()
                });
                if (error) console.warn('⚠️ Erro ao salvar log:', error);
            } catch (e) {
                console.warn('⚠️ Erro ao salvar log:', e);
            }
        }

        async carregarLogs(login) {
            if (!login || !this.supabaseOnline) return;
            try {
                const { data, error } = await supabase
                    .from(TABELA_ATIVIDADES)
                    .select('*')
                    .eq('login', login)
                    .order('created_at', { ascending: false })
                    .limit(30);

                if (error) throw error;

                if (data && data.length > 0) {
                    this.atividades = data.map(item => ({
                        time: new Date(item.created_at).toLocaleTimeString('pt-BR', {
                            hour: '2-digit', minute: '2-digit', second: '2-digit'
                        }),
                        msg: item.mensagem,
                        type: item.tipo || 'info',
                        timestamp: new Date(item.created_at).getTime()
                    }));
                    this.renderLog();
                }
            } catch (e) {
                console.warn('⚠️ Erro ao carregar logs:', e);
            }
        }

        // ============================================================
        // AÇÕES DE NÍVEL
        // ============================================================
        treinar() {
            if (this.sm < 10) {
                this.mostrarToast('⚡ Stamina insuficiente! Descanse.', 'erro');
                return false;
            }

            this.sm -= 10;
            this.totalTreinos++;

            const ganhoBase = 15 + Math.floor(this.nivel * 2);
            const variacao = Math.floor(Math.random() * 15);
            const ganho = ganhoBase + variacao;

            this.experiencia += ganho;

            let subiu = false;
            while (this.experiencia >= this.calcularExpProximo(this.nivel)) {
                this.experiencia -= this.calcularExpProximo(this.nivel);
                this.nivel++;
                subiu = true;

                this.hp = this.getHpMax();
                this.mp = this.getMpMax();
                this.sm = this.getSmMax();

                this.mostrarToast(`🎉 SUBIU PARA NÍVEL ${this.nivel}!`, 'sucesso');
            }

            this.atualizarUI();

            if (!subiu) {
                this.mostrarToast(`💪 Treinou! +${ganho} EXP (${this.experiencia}/${this.getExpProximo()})`, 'info');
            }

            this.addLog(`🏋️ Treinou +${ganho} EXP (Nível ${this.nivel})`, 'info');
            this.salvarComDelay();
            return true;
        }

        descansar() {
            const hpRestaurado = Math.floor(this.getHpMax() * 0.4);
            const mpRestaurado = Math.floor(this.getMpMax() * 0.35);
            const smRestaurado = Math.floor(this.getSmMax() * 0.5);

            this.hp = Math.min(this.getHpMax(), this.hp + hpRestaurado);
            this.mp = Math.min(this.getMpMax(), this.mp + mpRestaurado);
            this.sm = Math.min(this.getSmMax(), this.sm + smRestaurado);
            this.totalDescansos++;

            this.atualizarUI();
            this.mostrarToast(`🛌 Descansou! +${hpRestaurado} HP, +${mpRestaurado} MP, +${smRestaurado} SM`, 'sucesso');
            this.addLog(`🛌 Descansou (+${hpRestaurado} HP, +${mpRestaurado} MP, +${smRestaurado} SM)`, 'info');
            this.salvarComDelay();
            return true;
        }

        resetar() {
            if (!confirm('⚠️ Tem certeza que quer resetar seu nível e atributos?')) return false;

            this.nivel = 1;
            this.experiencia = 0;
            this.hp = this.getHpMax();
            this.mp = this.getMpMax();
            this.sm = this.getSmMax();
            this.ultimoReset = new Date().toISOString();

            this.atualizarUI();
            this.mostrarToast('🔄 Nível resetado para 1!', 'info');
            this.addLog('🔄 Nível resetado para 1', 'info');
            this.salvarComDelay();
            return true;
        }

        ganharSm() {
            const smMax = this.getSmMax();
            const ganho = 10;
            const novoSm = Math.min(smMax, this.sm + ganho);
            const ganhoReal = novoSm - this.sm;

            if (ganhoReal <= 0) {
                this.mostrarToast('⚡ SM já está no máximo!', 'aviso');
                return false;
            }

            this.sm = novoSm;
            this.atualizarUI();
            this.mostrarToast(`➕ +${ganhoReal} SM (${this.sm}/${smMax})`, 'sucesso');
            this.addLog(`➕ +${ganhoReal} SM (${this.sm}/${smMax})`, 'info');
            this.salvarComDelay();
            return true;
        }

        gastarSm() {
            const gasto = 10;
            if (this.sm < gasto) {
                this.mostrarToast('⚡ SM insuficiente!', 'erro');
                return false;
            }
            this.sm -= gasto;
            this.atualizarUI();
            this.mostrarToast(`➖ -${gasto} SM (${this.sm}/${this.getSmMax()})`, 'info');
            this.addLog(`➖ -${gasto} SM (${this.sm}/${this.getSmMax()})`, 'info');
            this.salvarComDelay();
            return true;
        }

        resetarSm() {
            if (!confirm('⚠️ Tem certeza que quer resetar o SM para o máximo?')) return false;
            this.sm = this.getSmMax();
            this.atualizarUI();
            this.mostrarToast(`🔄 SM resetado para ${this.sm}/${this.getSmMax()}`, 'info');
            this.addLog(`🔄 SM resetado para ${this.sm}/${this.getSmMax()}`, 'info');
            this.salvarComDelay();
            return true;
        }

        // ============================================================
        // SALVAMENTO
        // ============================================================
        salvarComDelay() {
            if (this.saveTimeout) clearTimeout(this.saveTimeout);
            this.saveTimeout = setTimeout(() => {
                this.salvar();
                this.salvarStats();
            }, 500);
        }

        async gastarStaminaParaJogar(event) {
            event.preventDefault();
            event.stopPropagation();

            const link = event.currentTarget;
            const gameName = link.getAttribute('data-game-name')
                          || link.getAttribute('data-game')
                          || 'Jogo';
            const gameIcon = link.querySelector('.game-icon')?.textContent || '🎮';
            const href = link.getAttribute('href') || '#';

            if (this._processandoJogo) return;
            this._processandoJogo = true;

            if (this.sm < 10) {
                this.mostrarToast('⚠️ Stamina insuficiente! Descanse primeiro.', 'erro');
                this._processandoJogo = false;
                return;
            }

            const loadingOverlay = document.getElementById('gameLoadingOverlay');
            const loadingIcon = document.getElementById('loadingIcon');
            const loadingTitle = document.getElementById('loadingTitle');
            const loadingSub = document.getElementById('loadingSub');
            const loadingStamina = document.getElementById('loadingStamina');
            const loadingProgressFill = document.getElementById('loadingProgressFill');

            if (loadingOverlay) {
                if (loadingIcon) loadingIcon.textContent = gameIcon;
                if (loadingTitle) loadingTitle.textContent = `Entrando em ${gameName}...`;
                if (loadingSub) loadingSub.textContent = 'Preparando sua aventura';
                if (loadingStamina) loadingStamina.textContent = `⚡ -10 STAMINA (${this.sm} → ${this.sm - 10})`;
                if (loadingProgressFill) loadingProgressFill.style.width = '0%';
                loadingOverlay.classList.add('active');
            }

            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += Math.random() * 15 + 5;
                if (progress > 95) progress = 95;
                if (loadingProgressFill) loadingProgressFill.style.width = Math.min(progress, 95) + '%';
                if (loadingSub) {
                    loadingSub.textContent =
                        progress < 30 ? 'Conectando ao servidor...' :
                        progress < 60 ? 'Carregando dados do jogador...' :
                        progress < 80 ? 'Preparando a arena...' :
                                        'Quase lá...';
                }
            }, 150);

            const staminaAntes = this.sm;
            this.sm -= 10;
            this.ultimaVezOnline = Date.now();
            this.atualizarUI();

            const msg = `🎮 Entrou em ${gameName} (-10 SM: ${staminaAntes} → ${this.sm})`;
            this.addLog(msg, 'info');

            try {
                if (this.usuario && this.supabaseOnline) {
                    const { error } = await supabase
                        .from(TABELA)
                        .update({
                            sm_atual: this.sm,
                            ultima_vez_online: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        })
                        .eq('login', this.usuario.login);

                    if (error) console.error('❌ Erro ao salvar SM no Supabase:', error);
                }
            } catch (e) {
                console.error('❌ Exceção ao salvar SM:', e);
            }

            clearInterval(progressInterval);
            if (loadingProgressFill) loadingProgressFill.style.width = '100%';
            if (loadingSub) loadingSub.textContent = '✅ Pronto! Redirecionando...';

            setTimeout(() => {
                this._processandoJogo = false;
                window.location.href = href;
            }, 600);
        }

        async salvarStats() {
            if (!this.usuario || !this.supabaseOnline) return;
            try {
                const { error } = await supabase
                    .from(TABELA)
                    .update({
                        total_treinos: this.totalTreinos,
                        total_descansos: this.totalDescansos,
                        ultima_atividade: this.ultimaAtividade,
                        ultimo_reset: this.ultimoReset,
                        ultima_vez_online: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .eq('login', this.usuario.login);
                if (error) throw error;
            } catch (e) {
                console.warn('⚠️ Erro ao salvar stats:', e);
            }
        }

        async salvar() {
            if (!this.usuario) return false;
            if (!this.supabaseOnline) return false;

            try {
                this.ultimaVezOnline = Date.now();

                const payload = {
                    nivel: this.nivel,
                    experiencia: this.experiencia,
                    exp_proximo: this.getExpProximo(),
                    max_hp: this.getHpMax(),
                    max_mp: this.getMpMax(),
                    max_sm: this.getSmMax(),
                    atk: this.ataqueBase,
                    def: this.defesaBase,
                    mag: this.magiaBase,
                    hp_atual: this.hp,
                    mp_atual: this.mp,
                    sm_atual: this.sm,
                    hp: this.hp,
                    mp: this.mp,
                    sm: this.sm,
                    btc: this.btc,
                    poder_hash: this.poderHash,
                    total_treinos: this.totalTreinos,
                    total_descansos: this.totalDescansos,
                    ultima_atividade: this.ultimaAtividade,
                    ultimo_reset: this.ultimoReset,
                    ultima_vez_online: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };

                const { error } = await supabase
                    .from(TABELA)
                    .update(payload)
                    .eq('login', this.usuario.login);

                if (error) throw error;
                return true;
            } catch (error) {
                console.error('❌ Erro ao salvar nível:', error);
                return false;
            }
        }

        // ============================================================
        // CARREGAMENTO
        // ============================================================
        async carregar(usuario) {
            this.usuario = usuario;

            try {
                const { data, error } = await supabase
                    .from(TABELA)
                    .select('*')
                    .eq('login', usuario.login)
                    .single();

                if (error) {
                    if (error.code === 'PGRST116') {
                        return await this.criarRegistroNivel(usuario);
                    }
                    throw error;
                }

                if (data) {
                    this.nivel = data.nivel || 1;
                    this.experiencia = data.experiencia || 0;
                    this.hpMax = data.max_hp ?? data.lwhp ?? 100;
                    this.mpMax = data.max_mp ?? data.lwmp ?? 50;
                    this.smMax = data.max_sm ?? data.lwsm ?? 100;
                    this.ataqueBase = data.atk ?? data.lwatk ?? 15;
                    this.defesaBase = data.def ?? data.lwdef ?? 10;
                    this.magiaBase = data.mag ?? data.lwmag ?? 8;
                    this.hp = data.hp_atual ?? data.hp ?? this.getHpMax();
                    this.mp = data.mp_atual ?? data.mp ?? this.getMpMax();
                    this.sm = data.sm_atual ?? data.sm ?? this.getSmMax();
                    this.totalTreinos = data.total_treinos || 0;
                    this.totalDescansos = data.total_descansos || 0;
                    this.ultimaAtividade = data.ultima_atividade || null;
                    this.ultimoReset = data.ultimo_reset || null;
                    this.saldo = parseFloat(data.saldo) || 0;
                    this.btc = parseFloat(data.btc) || 0;
                    this.poderHash = parseFloat(data.poder_hash) || 1.0;

                    // Regeneração offline
                    const timestampUltimaVez =
                        data.ultima_vez_online ||
                        data.ultima_coleta    ||
                        data.ultima_atividade ||
                        data.updated_at;

                    this.aplicarRegeneracaoOffline(
                        timestampUltimaVez ? new Date(timestampUltimaVez).getTime() : null
                    );

                    this.atualizarUI();
                    await this.carregarLogs(usuario.login);

                    this.salvarComDelay();

                    return true;
                }

                return false;
            } catch (error) {
                console.error('❌ Erro ao carregar nível:', error);
                return await this.criarRegistroNivel(usuario);
            }
        }

        async criarRegistroNivel(usuario) {
            try {
                const { data: existing, error: errSelect } = await supabase
                    .from(TABELA)
                    .select('login')
                    .eq('login', usuario.login)
                    .maybeSingle();

                if (errSelect) return false;
                if (existing) { this.usuario = usuario; return true; }

                const payload = {
                    login: usuario.login,
                    nivel: 1, experiencia: 0, exp_proximo: 100,
                    max_hp: 100, max_mp: 50, max_sm: 100,
                    atk: 15, def: 10, mag: 8,
                    hp_atual: 100, mp_atual: 50, sm_atual: 100,
                    hp: 100, mp: 50, sm: 100,
                    saldo: 0, btc: 0, poder_hash: 1.0,
                    total_treinos: 0, total_descansos: 0,
                    ultima_vez_online: new Date().toISOString(),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };

                const { error } = await supabase.from(TABELA).insert(payload);
                if (error) throw error;

                this.nivel = 1; this.experiencia = 0;
                this.hp = 100; this.mp = 50; this.sm = 100;
                this.hpMax = 100; this.mpMax = 50; this.smMax = 100;
                this.ataqueBase = 15; this.defesaBase = 10; this.magiaBase = 8;
                this.totalTreinos = 0; this.totalDescansos = 0;
                this.saldo = 0; this.btc = 0; this.poderHash = 1.0;
                this.ultimaVezOnline = Date.now();

                this.atualizarUI();
                this.addLog('🌱 Registro de nível criado!', 'info');
                return true;
            } catch (error) {
                console.error('❌ Erro ao criar registro de nível:', error);
                return false;
            }
        }

        // ============================================================
        // MINERAÇÃO
        // ============================================================
        minerar() {
            if (!this.usuario) {
                this.mostrarToast('❌ Faça login primeiro!', 'erro');
                return;
            }
            const ganho = (0.0000001 + Math.random() * 0.000001) * this.poderHash;
            this.btc += ganho;
            this.atualizarUI();
            this.addLog(`⛏️ Minerou +${ganho.toFixed(8)} BTC`, 'info');
            this.salvarComDelay();
        }

        upgradeMineracao() {
            if (!this.usuario) {
                this.mostrarToast('❌ Faça login primeiro!', 'erro');
                return;
            }
            if (this.btc < 10) {
                this.mostrarToast('❌ Precisa de 10 BTC.', 'erro');
                return;
            }
            this.btc -= 10;
            this.poderHash += 0.5;
            this.atualizarUI();
            this.addLog(`⬆️ Upgrade mineração para ${this.poderHash.toFixed(1)} MH/s`, 'info');
            this.mostrarToast(`✅ Upgrade realizado! Poder: ${this.poderHash.toFixed(1)} MH/s`, 'sucesso');
            this.salvarComDelay();
        }

        iniciarMineracaoPassiva() {
            if (this.mineracaoInterval) clearInterval(this.mineracaoInterval);
            this.mineracaoInterval = setInterval(() => {
                if (!this.usuario) return;
                if (this.poderHash > 0) {
                    const ganho = this.poderHash * 0.00000001 * 3;
                    if (ganho > 0) {
                        this.btc += ganho;
                        this.atualizarUI();
                    }
                }
            }, 3000);
        }

        // ============================================================
        // UI
        // ============================================================
        atualizarUI() {
            const expProx = this.getExpProximo();
            const pct = Math.min((this.experiencia / expProx) * 100, 100);
            const $ = id => document.getElementById(id);

            if ($('lwNivel')) $('lwNivel').textContent = this.nivel;
            if ($('lwTitulo')) $('lwTitulo').textContent = this.getTitulo();

            if ($('lwExpFill')) {
                $('lwExpFill').style.width = pct + '%';
                $('lwExpFill').className = 'lw-fill' + (pct > 75 ? ' high' : '');
            }

            if ($('lwExpAtual')) $('lwExpAtual').textContent = this.experiencia;
            if ($('lwExpProx')) $('lwExpProx').textContent = expProx;

            if ($('lwHp')) $('lwHp').textContent = `${this.hp}/${this.getHpMax()}`;
            if ($('lwMp')) $('lwMp').textContent = `${this.mp}/${this.getMpMax()}`;

            if ($('lwSm')) {
                $('lwSm').textContent = `${this.sm}/${this.getSmMax()}`;
                $('lwSm').className = this.sm < 20 ? 'sm-c stamina-low' : 'sm-c';
            }

            if ($('lwAtk')) $('lwAtk').textContent = this.getAtaque();
            if ($('lwDef')) $('lwDef').textContent = this.getDefesa();
            if ($('lwMag')) $('lwMag').textContent = this.getMagia();

            if ($('saldo')) {
                $('saldo').textContent = new Intl.NumberFormat('pt-BR', {
                    style: 'currency', currency: 'BRL'
                }).format(this.saldo || 0);
            }
            if ($('btcTotal')) $('btcTotal').textContent = (this.btc || 0).toFixed(8);

            if ($('userAvatar') && this.usuario) {
                $('userAvatar').textContent = this.usuario.login
                    ? this.usuario.login.charAt(0).toUpperCase()
                    : '👤';
            }
            const nick = $('nomeJogador') || $('userNick');
            if (nick && this.usuario) {
                nick.textContent = this.usuario.nome || this.usuario.login;
            }
            if ($('headerUser') && this.usuario) {
                $('headerUser').textContent = this.usuario.nome || this.usuario.login;
            }
        }

        mostrarToast(mensagem, tipo = 'info') {
            const toast = document.getElementById('levelToast');
            if (!toast) { console.log('[TOAST]', mensagem); return; }

            const cores = {
                sucesso: '#10b981', erro: '#ef4444',
                info: '#3b82f6', aviso: '#f59e0b'
            };

            toast.textContent = mensagem;
            toast.style.borderLeftColor = cores[tipo] || '#3b82f6';
            toast.style.display = 'block';
            toast.style.opacity = '1';

            if (this.toastTimer) clearTimeout(this.toastTimer);
            this.toastTimer = setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => { toast.style.display = 'none'; }, 400);
            }, 3000);
        }

        // ============================================================
        // CONEXÃO
        // ============================================================
        async verificarConexao() {
            try {
                const { error } = await supabase.from(TABELA).select('login').limit(1);
                this.supabaseOnline = !error;

                const dot = document.getElementById('supabaseDot');
                const status = document.getElementById('supabaseStatus');

                if (this.supabaseOnline) {
                    if (dot) dot.className = 'dot online';
                    if (status) { status.className = 'value online'; status.textContent = 'Online'; }
                } else {
                    if (dot) dot.className = 'dot offline';
                    if (status) { status.className = 'value offline'; status.textContent = 'Erro'; }
                }
                return this.supabaseOnline;
            } catch {
                this.supabaseOnline = false;
                const dot = document.getElementById('supabaseDot');
                const status = document.getElementById('supabaseStatus');
                if (dot) dot.className = 'dot offline';
                if (status) { status.className = 'value offline'; status.textContent = 'Falha'; }
                return false;
            }
        }

        configurarEventosDosJogos() {
            const gameCards = document.querySelectorAll('.game-card');
            gameCards.forEach(card => {
                card.removeEventListener('click', this.gastarStaminaParaJogar);
                card.addEventListener('click', this.gastarStaminaParaJogar);
            });
            console.log(`🎮 ${gameCards.length} jogos configurados com consumo de stamina`);
        }

        iniciarRecuperacaoStamina() {
            if (this.staminaInterval) clearInterval(this.staminaInterval);
            this.staminaInterval = setInterval(() => {
                const smMax = this.getSmMax();
                if (this.sm < smMax) {
                    this.sm = Math.min(this.sm + STAMINA_REGEN_PER_TICK, smMax);
                    this.ultimaVezOnline = Date.now();
                    this.atualizarUI();
                    if (this.usuario && this.supabaseOnline) this.salvar();
                } else {
                    this.ultimaVezOnline = Date.now();
                }
            }, STAMINA_REGEN_INTERVAL);
        }

        // ============================================================
        // CARREGAR DADOS DO USUÁRIO — VIA SESSÃO LOCAL (SEM AUTH)
        // ============================================================
        async loadUserData() {
            try {
                // 1) Lê dados da sessão local
                const raw = localStorage.getItem(SESSION_KEY);
                if (!raw) {
                    console.warn('⚠️ Sessão local inexistente.');
                    this.setFallbackUser();
                    return false;
                }

                let sessao;
                try {
                    sessao = JSON.parse(raw);
                } catch {
                    console.warn('⚠️ Sessão local corrompida.');
                    this.setFallbackUser();
                    return false;
                }

                if (!sessao?.login) {
                    console.warn('⚠️ Sessão sem login.');
                    this.setFallbackUser();
                    return false;
                }

                // 2) Busca perfil atualizado na tabela Geral
                const { data: profile, error } = await supabase
                    .from(TABELA)
                    .select('*')
                    .eq('login', sessao.login)
                    .maybeSingle();

                if (error || !profile) {
                    console.error('❌ Perfil não encontrado:', error);
                    this.setFallbackUser();
                    return false;
                }

                const usuario = {
                    login: profile.login,
                    nome: profile.nome || profile.login,
                    email: profile.email || sessao.email
                };

                this.usuario = usuario;
                localStorage.setItem(SESSION_KEY, JSON.stringify({
                    ...sessao,
                    ...usuario
                }));

                await this.carregar(usuario);

                const nick = profile.nome || usuario.login;
                this.saldo = profile.saldo ?? 0;

                this.atualizarUI();
                this.addLog(`👋 Bem-vindo, ${nick}!`, 'info');
                this.iniciarMineracaoPassiva();

                await this.verificarAdmin();
                return true;
            } catch (error) {
                console.error('❌ Erro ao carregar perfil:', error);
                this.setFallbackUser();
                return false;
            }
        }

        setFallbackUser() {
            const nick = document.getElementById('userNick');
            const saldo = document.getElementById('saldo');
            const avatar = document.getElementById('userAvatar');
            const headerUser = document.getElementById('headerUser');

            if (nick) nick.textContent = 'Visitante';
            if (saldo) saldo.textContent = 'R$ 0,00';
            if (avatar) avatar.textContent = '👤';
            if (headerUser) headerUser.textContent = 'Visitante';
        }
    }

    const levelSystem = new LevelSystem();
    let saveInterval = null;

    function iniciarSalvamentoAutomatico() {
        saveInterval = setInterval(async () => {
            if (levelSystem.usuario && levelSystem.supabaseOnline) {
                await levelSystem.salvar();
            }
        }, 15000);
    }

    // ============================================================
    // VERIFICAÇÃO DE SESSÃO — APENAS LOCAL (24h)
    // ============================================================
    async function verificarSessao() {
        const timestamp = localStorage.getItem(SESSION_TIMESTAMP_KEY);
        const usuarioLogado = localStorage.getItem(SESSION_KEY);

        if (!timestamp || !usuarioLogado) {
            console.warn('⚠️ Sessão inexistente. Redirecionando...');
            window.location.href = 'login.html';
            return false;
        }

        const loginTime = parseInt(timestamp, 10);
        const decorrido = Date.now() - loginTime;

        if (decorrido >= SESSION_DURATION) {
            console.warn('⏰ Sessão expirada (24h). Redirecionando...');
            limparSessao();
            window.location.href = 'login.html';
            return false;
        }

        const restante = SESSION_DURATION - decorrido;
        console.log(`⏰ Sessão válida por mais ${Math.round(restante / 1000 / 60)} minutos`);

        setTimeout(() => {
            console.warn('⏰ Sessão expirou. Redirecionando...');
            limparSessao();
            window.location.href = 'login.html';
        }, restante);

        return true;
    }

    // ============================================================
    // INICIALIZAÇÃO
    // ============================================================
    document.addEventListener('DOMContentLoaded', async function() {
        console.log('🚀 Dashboard carregado!');

        if (!(await verificarSessao())) return;

        levelSystem.verificarConexao();

        setTimeout(async () => {
            await levelSystem.loadUserData();
            setTimeout(() => {
                levelSystem.configurarEventosDosJogos();
            }, 500);
        }, 300);

        iniciarSalvamentoAutomatico();
        levelSystem.iniciarRecuperacaoStamina();

        // Botões
        const btnTreinar = document.getElementById('btnTreinar');
        const btnDescansar = document.getElementById('btnDescansar');
        const btnResetLevel = document.getElementById('btnResetLevel');
        const btnSmGanhar = document.getElementById('btnSmGanhar');
        const btnSmGastar = document.getElementById('btnSmGastar');
        const btnSmResetar = document.getElementById('btnSmResetar');
        const btnMinerar = document.getElementById('btnMinerar');
        const btnUpgrade = document.getElementById('btnUpgrade');
        const btnSair = document.getElementById('btnSair');
        const btnReconnect = document.getElementById('btnReconnectSupabase');

        if (btnTreinar) btnTreinar.addEventListener('click', levelSystem.treinar);
        if (btnDescansar) btnDescansar.addEventListener('click', levelSystem.descansar);
        if (btnResetLevel) btnResetLevel.addEventListener('click', levelSystem.resetar);
        if (btnSmGanhar) btnSmGanhar.addEventListener('click', levelSystem.ganharSm);
        if (btnSmGastar) btnSmGastar.addEventListener('click', levelSystem.gastarSm);
        if (btnSmResetar) btnSmResetar.addEventListener('click', levelSystem.resetarSm);
        if (btnMinerar) btnMinerar.addEventListener('click', levelSystem.minerar);
        if (btnUpgrade) btnUpgrade.addEventListener('click', levelSystem.upgradeMineracao);

        // ============================================================
        // LOGOUT — APENAS LOCAL (SEM SUPABASE AUTH)
        // ============================================================
        if (btnSair) {
            const novoBtnSair = btnSair.cloneNode(true);
            btnSair.parentNode.replaceChild(novoBtnSair, btnSair);

            novoBtnSair.addEventListener('click', async function() {
                if (!confirm('Tem certeza que deseja sair?')) return;

                try {
                    if (levelSystem.usuario && levelSystem.supabaseOnline) {
                        await levelSystem.salvar();
                    }
                } catch (e) {
                    console.warn('Erro ao salvar antes de sair:', e);
                } finally {
                    limparSessao();
                    window.location.href = 'login.html';
                }
            });
        }

        if (btnReconnect) {
            btnReconnect.addEventListener('click', function() {
                levelSystem.verificarConexao().then(() => {
                    levelSystem.verificarAdmin();
                });
                levelSystem.mostrarToast('🔄 Verificando conexão...', 'info');
            });
        }

        if (!document.getElementById('levelToast')) {
            const toast = document.createElement('div');
            toast.id = 'levelToast';
            document.body.appendChild(toast);
        }

        window.addEventListener('beforeunload', () => {
            if (levelSystem.usuario && levelSystem.supabaseOnline) {
                levelSystem.salvar();
            }
            if (saveInterval) clearInterval(saveInterval);
            if (levelSystem.mineracaoInterval) clearInterval(levelSystem.mineracaoInterval);
            if (levelSystem.staminaInterval) clearInterval(levelSystem.staminaInterval);
        });
    });

    window.levelSystem = levelSystem;

    console.log('📊 Dashboard integrado com login direto na tabela "Geral" + sessão 24h + regeneração offline de stamina!');
})();