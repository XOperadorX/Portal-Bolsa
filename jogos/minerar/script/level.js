import { createClient } from '@supabase/supabase-js';

// ============================================================
// CONFIGURAÇÕES
// ============================================================
const SUPABASE_URL = 'https://xrcxvizzdumcxbylmkvn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_E-g3G3wW4EySbCsXLXp8KQ_FnmERMcD';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const TABELA = 'Geral';

// ============================================================
// SISTEMA DE NÍVEL - CLASSE PRINCIPAL
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

        // Atributos atuais (podem ser modificados por buffs)
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
    // AÇÕES
    // ============================================================
    treinar() {
        if (this.sm < 10) {
            this.mostrarToast('⚡ Stamina insuficiente! Descanse.', 'erro');
            return false;
        }

        this.sm -= 10;

        // Ganho de EXP baseado no nível
        const ganhoBase = 15 + Math.floor(this.nivel * 2);
        const variacao = Math.floor(Math.random() * 15);
        const ganho = ganhoBase + variacao;

        this.experiencia += ganho;

        // Verificar se subiu de nível
        let subiu = false;
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

        this.salvar();
        return true;
    }

    descansar() {
        const hpRestaurado = Math.floor(this.getHpMax() * 0.4);
        const mpRestaurado = Math.floor(this.getMpMax() * 0.35);
        const smRestaurado = Math.floor(this.getSmMax() * 0.5);

        this.hp = Math.min(this.getHpMax(), this.hp + hpRestaurado);
        this.mp = Math.min(this.getMpMax(), this.mp + mpRestaurado);
        this.sm = Math.min(this.getSmMax(), this.sm + smRestaurado);

        this.atualizarUI();
        this.mostrarToast(`🛌 Descansou! +${hpRestaurado} HP, +${mpRestaurado} MP, +${smRestaurado} SM`, 'sucesso');
        this.salvar();
        return true;
    }

    resetar() {
        if (!confirm('⚠️ Tem certeza que quer resetar seu nível e atributos?')) return false;

        this.nivel = 1;
        this.experiencia = 0;
        this.hp = this.getHpMax();
        this.mp = this.getMpMax();
        this.sm = this.getSmMax();

        this.atualizarUI();
        this.mostrarToast('🔄 Nível resetado para 1!', 'info');
        this.salvar();
        return true;
    }

    // ============================================================
    // CONTROLES DE SM (STAMINA)
    // ============================================================
    ganharSm() {
        const smMax = this.getSmMax();
        const ganho = 50;
        const novoSm = Math.min(smMax, this.sm + ganho);
        const ganhoReal = novoSm - this.sm;
        
        if (ganhoReal <= 0) {
            this.mostrarToast('⚡ SM já está no máximo!', 'aviso');
            return false;
        }

        this.sm = novoSm;
        this.atualizarUI();
        this.mostrarToast(`➕ +${ganhoReal} SM (${this.sm}/${smMax})`, 'sucesso');
        this.salvar();
        return true;
    }

    gastarSm() {
        const gasto = 30;
        
        if (this.sm < gasto) {
            this.mostrarToast('⚡ SM insuficiente!', 'erro');
            return false;
        }

        this.sm -= gasto;
        this.atualizarUI();
        this.mostrarToast(`➖ -${gasto} SM (${this.sm}/${this.getSmMax()})`, 'info');
        this.salvar();
        return true;
    }

    resetarSm() {
        if (!confirm('⚠️ Tem certeza que quer resetar o SM para o máximo?')) return false;

        this.sm = this.getSmMax();
        this.atualizarUI();
        this.mostrarToast(`🔄 SM resetado para ${this.sm}/${this.getSmMax()}`, 'info');
        this.salvar();
        return true;
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
                hp_max: this.getHpMax(),
                mp_max: this.getMpMax(),
                sm_max: this.getSmMax(),
                ataque_base: this.ataqueBase,
                defesa_base: this.defesaBase,
                magia_base: this.magiaBase,
                hp_atual: this.hp,
                mp_atual: this.mp,
                sm_atual: this.sm,
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
                .select('nivel, experiencia, exp_proximo, hp_max, mp_max, sm_max, ataque_base, defesa_base, magia_base, hp_atual, mp_atual, sm_atual')
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
                this.nivel = data.nivel || 1;
                this.experiencia = data.experiencia || 0;
                this.hpMax = data.hp_max || 100;
                this.mpMax = data.mp_max || 50;
                this.smMax = data.sm_max || 100;
                this.ataqueBase = data.ataque_base || 15;
                this.defesaBase = data.defesa_base || 10;
                this.magiaBase = data.magia_base || 8;
                this.hp = data.hp_atual || this.getHpMax();
                this.mp = data.mp_atual || this.getMpMax();
                this.sm = data.sm_atual || this.getSmMax();

                this.atualizarUI();
                return true;
            }

            return false;

        } catch (error) {
            console.error('❌ Erro ao carregar nível:', error);
            return false;
        }
    }

    async criarRegistroNivel(usuario) {
        try {
            const payload = {
                login: usuario.login,
                nivel: 1,
                experiencia: 0,
                exp_proximo: 100,
                hp_max: 100,
                mp_max: 50,
                sm_max: 100,
                ataque_base: 15,
                defesa_base: 10,
                magia_base: 8,
                hp_atual: 100,
                mp_atual: 50,
                sm_atual: 100
            };

            const { error } = await supabase
                .from(TABELA)
                .update(payload)
                .eq('login', usuario.login);

            if (error) throw error;

            this.nivel = 1;
            this.experiencia = 0;
            this.hp = 100;
            this.mp = 50;
            this.sm = 100;
            this.atualizarUI();

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
        const pct = this.experiencia / expProx * 100;

        document.getElementById('levelNumber').textContent = this.nivel;
        document.getElementById('levelTitle').textContent = this.getTitulo();
        document.getElementById('expFill').style.width = Math.min(pct, 100) + '%';
        document.getElementById('expFill').className = 'exp-fill' + (pct > 75 ? ' high' : '');
        document.getElementById('expCurrent').textContent = this.experiencia;
        document.getElementById('expNext').textContent = expProx;

        document.getElementById('statHp').textContent = `${this.hp}/${this.getHpMax()}`;
        document.getElementById('statMp').textContent = `${this.mp}/${this.getMpMax()}`;
        document.getElementById('statSm').textContent = `${this.sm}/${this.getSmMax()}`;
        document.getElementById('statAtk').textContent = this.getAtaque();
        document.getElementById('statDef').textContent = this.getDefesa();
        document.getElementById('statMag').textContent = this.getMagia();
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

        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => { toast.style.display = 'none'; }, 400);
        }, 3000);
    }

    // ============================================================
    // VERIFICAR SUPABASE
    // ============================================================
    async verificarConexao() {
        try {
            const { error } = await supabase.from(TABELA).select('id').limit(1);
            this.supabaseOnline = !error;
            return this.supabaseOnline;
        } catch {
            this.supabaseOnline = false;
            return false;
        }
    }
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================
const levelSystem = new LevelSystem();

// Verificar conexão
await levelSystem.verificarConexao();

// Carregar usuário logado
const usuarioLogado = localStorage.getItem('usuario_logado');
if (usuarioLogado) {
    try {
        const usuario = JSON.parse(usuarioLogado);
        await levelSystem.carregar(usuario);
    } catch (e) {
        console.error('Erro ao carregar usuário:', e);
    }
}

// Event listeners
document.getElementById('btnTreinar')?.addEventListener('click', levelSystem.treinar);
document.getElementById('btnDescansar')?.addEventListener('click', levelSystem.descansar);
document.getElementById('btnResetLevel')?.addEventListener('click', levelSystem.resetar);

// Event listeners para controles de SM
document.getElementById('btnSmGanhar')?.addEventListener('click', levelSystem.ganharSm);
document.getElementById('btnSmGastar')?.addEventListener('click', levelSystem.gastarSm);
document.getElementById('btnSmResetar')?.addEventListener('click', levelSystem.resetarSm);

// Exportar para uso global
window.levelSystem = levelSystem;

// Criar toast se não existir
if (!document.getElementById('levelToast')) {
    const toast = document.createElement('div');
    toast.id = 'levelToast';
    document.body.appendChild(toast);
}

console.log('📊 Sistema de Nível carregado!');
console.log(`👤 Nível: ${levelSystem.nivel} | EXP: ${levelSystem.experiencia}/${levelSystem.getExpProximo()}`);


// level.js - Adicione estas funções no final do arquivo

// ============================================================
// FUNÇÕES GLOBAIS PARA ACESSO AO SISTEMA DE NÍVEL
// ============================================================

/**
 * Obtém o sistema de nível atual
 */
export function getLevelSystem() {
    return levelSystem;
}

/**
 * Atualiza a UI do nível e sincroniza com os dados do personagem
 */
export async function syncLevelWithCharacter(personagemData) {
    if (!levelSystem) return;
    
    // Atualiza atributos do level system com os dados do personagem
    if (personagemData) {
        levelSystem.hp = personagemData.hp || levelSystem.hp;
        levelSystem.mp = personagemData.mp || levelSystem.mp;
        levelSystem.sm = personagemData.sm || levelSystem.sm;
        levelSystem.hpMax = personagemData.max_hp || levelSystem.getHpMax();
        levelSystem.mpMax = personagemData.max_mp || levelSystem.getMpMax();
        levelSystem.smMax = personagemData.max_sm || levelSystem.getSmMax();
        levelSystem.ataqueBase = personagemData.atk || levelSystem.ataqueBase;
        levelSystem.defesaBase = personagemData.def || levelSystem.defesaBase;
        levelSystem.magiaBase = personagemData.mag || levelSystem.magiaBase;
        
        if (personagemData.nivel) levelSystem.nivel = personagemData.nivel;
        if (personagemData.experiencia !== undefined) levelSystem.experiencia = personagemData.experiencia;
    }
    
    levelSystem.atualizarUI();
}

/**
 * Renderiza o componente de nível em um container
 */
export function renderLevelComponent(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Verifica se o componente já existe
    if (container.querySelector('.level-system-container')) return;
    
    // Importa o HTML do componente
    const levelHTML = `
        <div class="level-system-container" id="levelSystem">
            <div class="level-header">
                <div class="level-badge">
                    <span class="level-number" id="levelNumber">1</span>
                    <div>
                        <div class="level-label">Nível</div>
                        <div class="level-title" id="levelTitle">🌱 Iniciante</div>
                    </div>
                </div>
                <div class="exp-container">
                    <div class="exp-bar">
                        <div class="exp-fill" id="expFill" style="width: 0%;"></div>
                    </div>
                    <div class="exp-text">
                        <span class="exp-current" id="expCurrent">0</span>
                        <span>/ <span class="exp-next" id="expNext">100</span> EXP</span>
                    </div>
                </div>
            </div>

            <div class="stats-grid" id="statsGrid">
                <span class="stat-pill">
                    <span class="stat-icon">❤️</span>
                    HP <span class="stat-value hp" id="statHp">100/100</span>
                </span>
                <span class="stat-pill">
                    <span class="stat-icon">💧</span>
                    MP <span class="stat-value mp" id="statMp">50/50</span>
                </span>
                <span class="stat-pill">
                    <span class="stat-icon">⚡</span>
                    SM <span class="stat-value sm" id="statSm">40/40</span>
                </span>
                <span class="stat-pill">
                    <span class="stat-icon">⚔️</span>
                    ATK <span class="stat-value atk" id="statAtk">15</span>
                </span>
                <span class="stat-pill">
                    <span class="stat-icon">🛡️</span>
                    DEF <span class="stat-value def" id="statDef">10</span>
                </span>
                <span class="stat-pill">
                    <span class="stat-icon">🔮</span>
                    MAG <span class="stat-value mag" id="statMag">8</span>
                </span>
            </div>
            
            <div class="level-actions">
                <button class="btn-level btn-treinar" id="btnTreinar">🏋️ Treinar (+EXP)</button>
                <button class="btn-level btn-descansar" id="btnDescansar">🛌 Descansar</button>
                <button class="btn-level btn-reset" id="btnResetLevel">🔄 Resetar Nível</button>
            </div>

            <div class="sm-actions">
                <button class="btn-sm btn-sm-ganhar" id="btnSmGanhar">➕ Ganhar 50 SM</button>
                <button class="btn-sm btn-sm-gastar" id="btnSmGastar">➖ Gastar 30 SM</button>
                <button class="btn-sm btn-sm-resetar" id="btnSmResetar">🔄 Resetar SM</button>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('afterbegin', levelHTML);
    
    // Importa o CSS dinamicamente se não estiver presente
    if (!document.querySelector('link[href="style/level.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'style/level.css';
        document.head.appendChild(link);
    }
    
    // Cria o toast se não existir
    if (!document.getElementById('levelToast')) {
        const toast = document.createElement('div');
        toast.id = 'levelToast';
        document.body.appendChild(toast);
    }
    
    // Re-inicializa os event listeners
    setTimeout(() => {
        document.getElementById('btnTreinar')?.addEventListener('click', () => levelSystem.treinar());
        document.getElementById('btnDescansar')?.addEventListener('click', () => levelSystem.descansar());
        document.getElementById('btnResetLevel')?.addEventListener('click', () => levelSystem.resetar());
        document.getElementById('btnSmGanhar')?.addEventListener('click', () => levelSystem.ganharSm());
        document.getElementById('btnSmGastar')?.addEventListener('click', () => levelSystem.gastarSm());
        document.getElementById('btnSmResetar')?.addEventListener('click', () => levelSystem.resetarSm());
    }, 100);
}

// Exporta o sistema para uso global
window.levelSystem = levelSystem;
window.renderLevelComponent = renderLevelComponent;
window.syncLevelWithCharacter = syncLevelWithCharacter;
window.getLevelSystem = getLevelSystem;

console.log('📊 Sistema de Nível carregado e pronto para uso!');