(function() {
    'use strict';

    // ============================================================
    // CONFIGURAÇÕES SUPABASE
    // ============================================================
    const SUPABASE_URL = 'https://xrcxvizzdumcxbylmkvn.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_E-g3G3wW4EySbCsXLXp8KQ_FnmERMcD';
    const TABELA = 'Geral';
    const TABELA_ATIVIDADES = 'Atividades';

    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // ============================================================
    // SISTEMA DE NÍVEL - CLASSE COMPLETA
    // ============================================================
    class LevelSystem {
        constructor() {
            // Dados do jogador
            this.nivel = 1;
            this.experiencia = 0;
            this.expProximo = 100;

            // Atributos base
            this.hpMax = 100;
            this.mpMax = 50;
            this.smMax = 100;
            this.ataqueBase = 15;
            this.defesaBase = 10;
            this.magiaBase = 8;

            // Atributos atuais
            this.hp = 100;
            this.mp = 50;
            this.sm = 100;

            // Títulos por nível
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

            // Usuário atual
            this.usuario = null;
            this.supabaseOnline = false;
            this.atividades = [];
            this.totalTreinos = 0;
            this.totalDescansos = 0;
            this.ultimaAtividade = null;
            this.ultimoReset = null;
            this.toastTimer = null;
            this.saveTimeout = null;

            // Bind dos métodos
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
        }

        // ============================================================
        // CÁLCULOS DE ATRIBUTOS POR NÍVEL
        // ============================================================
        getAtaque() {
            return this.ataqueBase + Math.floor(this.nivel * 1.5);
        }

        getDefesa() {
            return this.defesaBase + Math.floor(this.nivel * 1.2);
        }

        getMagia() {
            return this.magiaBase + Math.floor(this.nivel * 1.0);
        }

        getHpMax() {
            return this.hpMax + Math.floor(this.nivel * 6);
        }

        getMpMax() {
            return this.mpMax + Math.floor(this.nivel * 4);
        }

        getSmMax() {
            return this.smMax + Math.floor(this.nivel * 3);
        }

        getTitulo() {
            let titulo = this.titulos[0].titulo;
            for (const t of this.titulos) {
                if (this.nivel >= t.min) titulo = t.titulo;
            }
            return titulo;
        }

        getExpProximo() {
            return Math.floor(100 * Math.pow(1.2, this.nivel - 1));
        }

        // ============================================================
        // LOG DE ATIVIDADES
        // ============================================================
        addLog(mensagem, tipo = 'info') {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            
            this.atividades.unshift({
                time: timeStr,
                msg: mensagem,
                type: tipo,
                timestamp: now.getTime()
            });

            if (this.atividades.length > 50) {
                this.atividades = this.atividades.slice(0, 50);
            }

            this.renderLog();
            
            // Salva no Supabase se estiver online
            if (this.usuario && this.supabaseOnline) {
                this.salvarLog(mensagem, tipo);
            }
        }

        renderLog() {
            const logList = document.getElementById('logList');
            if (!logList) return;

            if (this.atividades.length === 0) {
                logList.innerHTML = `
                    <div class="log-entry">
                        <span class="log-time">--</span>
                        <span class="log-msg" style="color:#6a7a8a;">Aguardando atividades...</span>
                    </div>
                `;
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

        // ============================================================
        // SALVAR LOG NO SUPABASE
        // ============================================================
        async salvarLog(mensagem, tipo) {
            if (!this.usuario || !this.supabaseOnline) return;

            try {
                const { error } = await supabase
                    .from(TABELA_ATIVIDADES)
                    .insert({
                        login: this.usuario.login,
                        mensagem: mensagem,
                        tipo: tipo,
                        nivel: this.nivel,
                        exp: this.experiencia,
                        created_at: new Date().toISOString()
                    });

                if (error) {
                    console.warn('⚠️ Erro ao salvar log:', error);
                }
            } catch (e) {
                console.warn('⚠️ Erro ao salvar log:', e);
            }
        }

        // ============================================================
        // CARREGAR LOGS DO SUPABASE
        // ============================================================
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
                        time: new Date(item.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
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
        // AÇÕES PRINCIPAIS
        // ============================================================
        treinar() {
            if (this.sm < 10) {
                this.mostrarToast('⚡ Stamina insuficiente! Descanse.', 'erro');
                return false;
            }

            this.sm -= 10;
            this.totalTreinos++;

            // Ganho de EXP baseado no nível
            const ganhoBase = 15 + Math.floor(this.nivel * 2);
            const variacao = Math.floor(Math.random() * 15);
            const ganho = ganhoBase + variacao;

            this.experiencia += ganho;

            // Verificar se subiu de nível
            let subiu = false;
            let nivelAntes = this.nivel;
            while (this.experiencia >= this.getExpProximo()) {
                this.experiencia -= this.getExpProximo();
                this.nivel++;
                subiu = true;

                // Recupera atributos ao subir de nível
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
            
            // Salva imediatamente após treinar
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

        // ============================================================
        // CONTROLES DE SM (STAMINA)
        // ============================================================
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
        // SALVAR COM DELAY (evita muitas chamadas)
        // ============================================================
        salvarComDelay() {
            if (this.saveTimeout) {
                clearTimeout(this.saveTimeout);
            }
            this.saveTimeout = setTimeout(() => {
                this.salvar();
                this.salvarStats();
            }, 500);
        }

        // ============================================================
        // GASTAR STAMINA PARA JOGAR (com overlay)
        // ============================================================
        gastarStaminaParaJogar(event) {
            event.preventDefault();
            
            const link = event.currentTarget;
            const gameName = link.getAttribute('data-game-name') || link.getAttribute('data-game') || 'Jogo';
            const gameIcon = link.querySelector('.game-icon')?.textContent || '🎮';
            const href = link.getAttribute('href') || '#';

            // Verifica stamina
            if (this.sm < 10) {
                this.mostrarToast('⚠️ Stamina insuficiente! Descanse primeiro.', 'erro');
                return;
            }

            // ============================================================
            // MOSTRA OVERLAY DE CARREGAMENTO
            // ============================================================
            const loadingOverlay = document.getElementById('gameLoadingOverlay');
            const loadingIcon = document.getElementById('loadingIcon');
            const loadingTitle = document.getElementById('loadingTitle');
            const loadingSub = document.getElementById('loadingSub');
            const loadingStamina = document.getElementById('loadingStamina');
            const loadingProgressFill = document.getElementById('loadingProgressFill');

            if (loadingOverlay) {
                loadingIcon.textContent = gameIcon;
                loadingTitle.textContent = `Entrando em ${gameName}...`;
                loadingSub.textContent = 'Preparando sua aventura';
                loadingStamina.textContent = `⚡ -10 STAMINA (${this.sm} → ${this.sm - 10})`;
                loadingProgressFill.style.width = '0%';
                loadingOverlay.classList.add('active');
            }

            // Anima a barra de progresso
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += Math.random() * 15 + 5;
                if (progress > 95) progress = 95;
                if (loadingProgressFill) {
                    loadingProgressFill.style.width = Math.min(progress, 95) + '%';
                }
                if (loadingSub) {
                    loadingSub.textContent = progress < 30 ? 'Conectando ao servidor...' :
                                              progress < 60 ? 'Carregando dados do jogador...' :
                                              progress < 80 ? 'Preparando a arena...' :
                                              'Quase lá...';
                }
            }, 150);

            // ============================================================
            // GASTA STAMINA E SALVA
            // ============================================================
            const staminaAntes = this.sm;
            this.sm -= 10;
            this.atualizarUI();

            const msg = `🎮 Entrou em ${gameName} (-10 SM: ${staminaAntes} → ${this.sm})`;
            this.addLog(msg, 'info');

            // Salva no Supabase e redireciona
            this.salvar()
                .then(() => this.salvarStats())
                .then(() => {
                    clearInterval(progressInterval);
                    if (loadingProgressFill) loadingProgressFill.style.width = '100%';
                    if (loadingSub) loadingSub.textContent = '✅ Pronto! Redirecionando...';
                    
                    setTimeout(() => {
                        window.location.href = href;
                    }, 600);
                })
                .catch((error) => {
                    console.error('❌ Erro ao salvar:', error);
                    clearInterval(progressInterval);
                    if (loadingSub) loadingSub.textContent = '⚠️ Erro ao salvar, mas continuando...';
                    setTimeout(() => {
                        window.location.href = href;
                    }, 800);
                });
        }

        // ============================================================
        // SALVAR ESTATÍSTICAS NO SUPABASE
        // ============================================================
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
                        updated_at: new Date().toISOString()
                    })
                    .eq('login', this.usuario.login);

                if (error) throw error;
            } catch (e) {
                console.warn('⚠️ Erro ao salvar stats:', e);
            }
        }

        // ============================================================
        // SUPABASE - SALVAR E CARREGAR
        // ============================================================
        async salvar() {
            if (!this.usuario) {
                console.warn('⚠️ Nenhum usuário logado para salvar.');
                return false;
            }

            if (!this.supabaseOnline) {
                console.warn('⚠️ Supabase offline. Dados não salvos.');
                return false;
            }

            try {
                const payload = {
                    nivel: this.nivel,
                    experiencia: this.experiencia,
                    exp_proximo: this.getExpProximo(),
                    lwHp: this.getHpMax(),
                    lwMp: this.getMpMax(),
                    lwSm: this.getSmMax(),
                    lwAtk: this.ataqueBase,
                    lwDef: this.defesaBase,
                    lwMag: this.magiaBase,
                    hp_atual: this.hp,
                    mp_atual: this.mp,
                    sm_atual: this.sm,
                    total_treinos: this.totalTreinos,
                    total_descansos: this.totalDescansos,
                    ultima_atividade: this.ultimaAtividade,
                    ultimo_reset: this.ultimoReset,
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
                        // Usuário não tem dados de nível, criar padrão
                        await this.criarRegistroNivel(usuario);
                        return true;
                    }
                    throw error;
                }

                if (data) {
                    // Carrega dados do nível
                    this.nivel = data.nivel || 1;
                    this.experiencia = data.experiencia || 0;
                    this.hpMax = data.lwhp || data.lwHp || 100;
                    this.mpMax = data.lwmp || data.lwMp || 50;
                    this.smMax = data.lwsm || data.lwSm || 100;
                    this.ataqueBase = data.lwatk || data.lwAtk || 15;
                    this.defesaBase = data.lwdef || data.lwDef || 10;
                    this.magiaBase = data.lwmag || data.lwMag || 8;
                    this.hp = data.hp_atual || this.getHpMax();
                    this.mp = data.mp_atual || this.getMpMax();
                    this.sm = data.sm_atual || this.getSmMax();
                    this.totalTreinos = data.total_treinos || 0;
                    this.totalDescansos = data.total_descansos || 0;
                    this.ultimaAtividade = data.ultima_atividade || null;
                    this.ultimoReset = data.ultimo_reset || null;

                    // Atualiza UI
                    this.atualizarUI();
                    
                    // Carrega logs
                    await this.carregarLogs(usuario.login);
                    
                    return true;
                }

                return false;

            } catch (error) {
                console.error('❌ Erro ao carregar nível:', error);
                // Tenta criar registro
                return await this.criarRegistroNivel(usuario);
            }
        }

        async criarRegistroNivel(usuario) {
            try {
                // Verifica se já existe registro
                const { data: existing } = await supabase
                    .from(TABELA)
                    .select('login')
                    .eq('login', usuario.login)
                    .single();

                if (existing) {
                    // Já existe, apenas carrega novamente
                    return await this.carregar(usuario);
                }

                const payload = {
                    login: usuario.login,
                    nivel: 1,
                    experiencia: 0,
                    exp_proximo: 100,
                    lwhp: 100,
                    lwmp: 50,
                    lwsm: 100,
                    lwatk: 15,
                    lwdef: 10,
                    lwmag: 8,
                    hp_atual: 100,
                    mp_atual: 50,
                    sm_atual: 100,
                    total_treinos: 0,
                    total_descansos: 0,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };

                const { error } = await supabase
                    .from(TABELA)
                    .insert(payload);

                if (error) throw error;

                // Reseta valores
                this.nivel = 1;
                this.experiencia = 0;
                this.hp = 100;
                this.mp = 50;
                this.sm = 100;
                this.hpMax = 100;
                this.mpMax = 50;
                this.smMax = 100;
                this.ataqueBase = 15;
                this.defesaBase = 10;
                this.magiaBase = 8;
                this.totalTreinos = 0;
                this.totalDescansos = 0;
                
                this.atualizarUI();
                this.addLog('🌱 Registro de nível criado!', 'info');

                return true;

            } catch (error) {
                console.error('❌ Erro ao criar registro de nível:', error);
                return false;
            }
        }

        // ============================================================
        // UI
        // ============================================================
        atualizarUI() {
            const expProx = this.getExpProximo();
            const pct = Math.min((this.experiencia / expProx) * 100, 100);

            // Elementos do nível
            const lwNivel = document.getElementById('lwNivel');
            const lwTitulo = document.getElementById('lwTitulo');
            const lwExpFill = document.getElementById('lwExpFill');
            const lwExpAtual = document.getElementById('lwExpAtual');
            const lwExpProx = document.getElementById('lwExpProx');
            const lwHp = document.getElementById('lwHp');
            const lwMp = document.getElementById('lwMp');
            const lwSm = document.getElementById('lwSm');
            const lwAtk = document.getElementById('lwAtk');
            const lwDef = document.getElementById('lwDef');
            const lwMag = document.getElementById('lwMag');

            if (lwNivel) lwNivel.textContent = this.nivel;
            if (lwTitulo) lwTitulo.textContent = this.getTitulo();
            
            if (lwExpFill) {
                lwExpFill.style.width = pct + '%';
                lwExpFill.className = 'lw-fill' + (pct > 75 ? ' high' : '');
            }
            
            if (lwExpAtual) lwExpAtual.textContent = this.experiencia;
            if (lwExpProx) lwExpProx.textContent = expProx;
            
            if (lwHp) lwHp.textContent = `${this.hp}/${this.getHpMax()}`;
            if (lwMp) lwMp.textContent = `${this.mp}/${this.getMpMax()}`;
            
            if (lwSm) {
                lwSm.textContent = `${this.sm}/${this.getSmMax()}`;
                if (this.sm < 20) {
                    lwSm.className = 'sm-c stamina-low';
                } else {
                    lwSm.className = 'sm-c';
                }
            }
            
            if (lwAtk) lwAtk.textContent = this.getAtaque();
            if (lwDef) lwDef.textContent = this.getDefesa();
            if (lwMag) lwMag.textContent = this.getMagia();
        }

        // ============================================================
        // TOAST
        // ============================================================
        mostrarToast(mensagem, tipo = 'info') {
            const toast = document.getElementById('levelToast');
            if (!toast) {
                console.log('[TOAST]', mensagem);
                return;
            }

            const cores = {
                sucesso: '#10b981',
                erro: '#ef4444',
                info: '#3b82f6',
                aviso: '#f59e0b'
            };

            toast.textContent = mensagem;
            toast.style.borderLeftColor = cores[tipo] || '#3b82f6';
            toast.style.display = 'block';
            toast.style.opacity = '1';

            if (this.toastTimer) {
                clearTimeout(this.toastTimer);
            }
            
            this.toastTimer = setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => { 
                    toast.style.display = 'none'; 
                }, 400);
            }, 3000);
        }

        // ============================================================
        // VERIFICAR SUPABASE
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

        // ============================================================
        // CONFIGURAR EVENTOS DOS CARDS DE JOGOS
        // ============================================================
        configurarEventosDosJogos() {
            const gameCards = document.querySelectorAll('.game-card');
            
            gameCards.forEach(card => {
                // Remove eventos antigos para evitar duplicação
                card.removeEventListener('click', this.gastarStaminaParaJogar);
                card.addEventListener('click', this.gastarStaminaParaJogar);
            });
            
            console.log(`🎮 ${gameCards.length} jogos configurados com consumo de stamina`);
        }

        // ============================================================
        // RECUPERAÇÃO AUTOMÁTICA DE STAMINA
        // ============================================================
        iniciarRecuperacaoStamina() {
            setInterval(() => {
                const smMax = this.getSmMax();
                if (this.sm < smMax) {
                    this.sm = Math.min(this.sm + 1, smMax);
                    this.atualizarUI();
                    
                    if (this.usuario && this.supabaseOnline) {
                        this.salvar();
                    }
                }
            }, 30000);
        }
    }

    // ============================================================
    // INSTANCIAR SISTEMA DE NÍVEL
    // ============================================================
    const levelSystem = new LevelSystem();

    // ============================================================
    // CARREGAR DADOS DO USUÁRIO
    // ============================================================
    async function loadUserData() {
        try {
            const usuarioData = localStorage.getItem('usuario_logado');
            
            if (!usuarioData) {
                setFallbackUser();
                return;
            }

            const usuario = JSON.parse(usuarioData);
            if (!usuario.login) {
                setFallbackUser();
                return;
            }

            // Primeiro tenta carregar o nível
            await levelSystem.carregar(usuario);

            // Depois busca o perfil completo
            const { data: profile, error: profileError } = await supabase
                .from(TABELA)
                .select('*')
                .eq('login', usuario.login)
                .single();

            if (profileError && profileError.code !== 'PGRST116') {
                console.warn('⚠️ Erro ao buscar perfil:', profileError);
            }

            // Define o nick e saldo
            const nick = profile?.nome || usuario.nome || usuario.login;
            const balance = profile?.saldo !== undefined && profile.saldo !== null ? profile.saldo : 0;

            document.getElementById('userNick').textContent = nick;
            document.getElementById('headerUser').textContent = nick;
            document.getElementById('userBalance').textContent = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(balance);
            document.getElementById('userAvatar').textContent = nick.charAt(0).toUpperCase();

            levelSystem.addLog(`👋 Bem-vindo, ${nick}!`, 'info');

        } catch (error) {
            console.error('❌ Erro ao carregar perfil:', error);
            setFallbackUser();
        }
    }

    function setFallbackUser() {
        document.getElementById('userNick').textContent = 'Visitante';
        document.getElementById('userBalance').textContent = 'R$ 0,00';
        document.getElementById('userAvatar').textContent = '👤';
        document.getElementById('headerUser').textContent = 'Visitante';
    }

    // ============================================================
    // SALVAR AUTOMATICAMENTE EM INTERVALOS
    // ============================================================
    let saveInterval = null;

    function iniciarSalvamentoAutomatico() {
        saveInterval = setInterval(async () => {
            if (levelSystem.usuario && levelSystem.supabaseOnline) {
                await levelSystem.salvar();
            }
        }, 15000);
    }

    // ============================================================
    // EVENTOS
    // ============================================================
    document.getElementById('btnSair')?.addEventListener('click', function() {
        if (confirm('Tem certeza que deseja sair?')) {
            // Salva antes de sair
            if (levelSystem.usuario && levelSystem.supabaseOnline) {
                levelSystem.salvar();
            }
            localStorage.removeItem('usuario_logado');
            window.location.href = 'login.html';
        }
    });

    document.getElementById('btnReconnectSupabase')?.addEventListener('click', function() {
        levelSystem.verificarConexao();
        levelSystem.mostrarToast('🔄 Verificando conexão...', 'info');
    });

    // ============================================================
    // INICIALIZAÇÃO
    // ============================================================
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🚀 Dashboard carregado!');

        // Verifica conexão
        levelSystem.verificarConexao();
        
        // Carrega dados do usuário
        setTimeout(() => {
            loadUserData();
            setTimeout(() => {
                levelSystem.configurarEventosDosJogos();
            }, 500);
        }, 300);

        // Inicia salvamento automático
        iniciarSalvamentoAutomatico();
        levelSystem.iniciarRecuperacaoStamina();

        // Configurar botões de nível
        document.getElementById('btnTreinar')?.addEventListener('click', () => levelSystem.treinar());
        document.getElementById('btnDescansar')?.addEventListener('click', () => levelSystem.descansar());
        document.getElementById('btnResetLevel')?.addEventListener('click', () => levelSystem.resetar());
        document.getElementById('btnSmGanhar')?.addEventListener('click', () => levelSystem.ganharSm());
        document.getElementById('btnSmGastar')?.addEventListener('click', () => levelSystem.gastarSm());
        document.getElementById('btnSmResetar')?.addEventListener('click', () => levelSystem.resetarSm());

        // Criar toast se não existir
        if (!document.getElementById('levelToast')) {
            const toast = document.createElement('div');
            toast.id = 'levelToast';
            document.body.appendChild(toast);
        }

        // Salva ao fechar a página
        window.addEventListener('beforeunload', () => {
            if (levelSystem.usuario && levelSystem.supabaseOnline) {
                levelSystem.salvar();
            }
            if (saveInterval) {
                clearInterval(saveInterval);
            }
        });
    });

    // ============================================================
    // EXPOR PARA USO GLOBAL
    // ============================================================
    window.levelSystem = levelSystem;

    console.log('📊 Sistema de Nível integrado ao Dashboard!');
    console.log('💾 Salvamento automático a cada 15 segundos');
    console.log('⚡ Cada jogo gasta 10 de STAMINA com overlay!');
    console.log('🔄 Stamina recupera 1 a cada 30 segundos');
    console.log(`👤 Nível: ${levelSystem.nivel} | EXP: ${levelSystem.experiencia}/${levelSystem.getExpProximo()}`);

})();
