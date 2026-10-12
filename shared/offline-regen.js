// ============================================================
// OFFLINE REGEN — MÓDULO COMPARTILHADO
// Usado por todos os jogos + dashboard
// ============================================================
// Uso:
//   import { OfflineRegen } from './shared/offline-regen.js';
//   const regen = new OfflineRegen({ supabase, tabela: 'Geral', login });
//   await regen.init();
//   regen.startAutoTick();
//   regen.onSmReduzida(novoSm, smMax);
// ============================================================

export const REGEN_CONFIG = {
    STAMINA_CRITICAL_PCT: 10,                 // % crítica (10% do smMax)
    OFFLINE_FULL_MS: 24 * 60 * 60 * 1000,     // 24h até regeneração total
    TICK_MS: 1000,                            // tick da barra (1s)
    REGEN_ONLINE_INTERVAL_MS: 30 * 1000,      // reservado
    REGEN_ONLINE_PER_TICK: 1                  // reservado
};

export class OfflineRegen {
    /**
     * @param {Object} opts
     * @param {Object} opts.supabase          - cliente Supabase
     * @param {string} opts.tabela            - nome da tabela ('Geral')
     * @param {string} opts.login             - login do usuário
     * @param {HTMLElement} [opts.container]  - onde injetar a barra
     * @param {Function} [opts.onApply]       - callback(dados) quando aplicar mudanças
     */
    constructor(opts) {
        if (!opts || !opts.supabase || !opts.tabela || !opts.login) {
            throw new Error('OfflineRegen: supabase, tabela e login são obrigatórios');
        }
        this.supabase = opts.supabase;
        this.tabela = opts.tabela;
        this.login = opts.login;
        this.container = opts.container || null;
        this.onApply = opts.onApply || null;

        // Estado local
        this.offlineRegenStart = null;
        this.sm = 0;    this.smMax = 100;
        this.hp = 0;    this.hpMax = 100;
        this.mp = 0;    this.mpMax = 100;

        this._tickInterval = null;
        this._autoSaveTimeout = null;
        this._widget = null;
        this._regenCompletaAvisada = false;
        this._destroyed = false;
    }

    // ============================================================
    // INICIALIZAÇÃO
    // ============================================================
    async init() {
        await this._carregarDoBanco();
        this._aplicarRegenOffline();
        this._injetarWidgetSeNecessario();
        this._renderizar();
        return this._snapshot();
    }

    /**
     * Chame quando a SM for reduzida em qualquer ação.
     */
    onSmReduzida(novoSm, smMax) {
        if (typeof novoSm === 'number') this.sm = novoSm;
        if (typeof smMax === 'number') this.smMax = smMax;

        const limiar = this.smMax * (REGEN_CONFIG.STAMINA_CRITICAL_PCT / 100);
        if (this.sm < limiar && !this.offlineRegenStart) {
            this.offlineRegenStart = Date.now();
            this._regenCompletaAvisada = false;
            this._renderizar();
            this._persistir();
        } else {
            this._renderizar();
        }
    }

    /**
     * Chame quando a SM aumentar (descanso, item, admin).
     * ✅ Persiste a limpeza do timer.
     */
    onSmAumentada(novoSm) {
        if (typeof novoSm === 'number') this.sm = novoSm;
        const limiar = this.smMax * (REGEN_CONFIG.STAMINA_CRITICAL_PCT / 100);

        if (this.sm >= limiar && this.offlineRegenStart) {
            this.offlineRegenStart = null;
            this._regenCompletaAvisada = false;
            this._persistir();
        }
        this._renderizar();
    }

    tick() {
        if (this._destroyed) return false;
        const mudou = this._aplicarRegenOffline();
        this._renderizar();
        return mudou;
    }

    startAutoTick() {
        this.stopAutoTick();
        this._tickInterval = setInterval(() => this.tick(), REGEN_CONFIG.TICK_MS);
    }

    stopAutoTick() {
        if (this._tickInterval) {
            clearInterval(this._tickInterval);
            this._tickInterval = null;
        }
    }

    /**
     * Re-renderiza forçado (chamado pelo dashboard quando SM muda por fora).
     */
    render() {
        this._renderizar();
    }

    /**
     * ✅ Também limpa o toast órfão.
     */
    destroy() {
        this._destroyed = true;
        this.stopAutoTick();
        if (this._autoSaveTimeout) clearTimeout(this._autoSaveTimeout);
        if (this._widget && this._widget.parentNode) {
            this._widget.parentNode.removeChild(this._widget);
        }
        const toast = document.getElementById('offlineRegenToast');
        if (toast && toast.parentNode) toast.parentNode.removeChild(toast);
    }

    // ============================================================
    // NÚCLEO — REGENERAÇÃO
    // ============================================================
    _aplicarRegenOffline() {
        const agora = Date.now();
        const limiar = this.smMax * (REGEN_CONFIG.STAMINA_CRITICAL_PCT / 100);

        // SM saudável → limpa regen se estava ativa
        if (this.sm >= limiar) {
            if (this.offlineRegenStart) {
                this.offlineRegenStart = null;
                this._persistir();
                this._renderizar();
            }
            return false;
        }

        if (!this.offlineRegenStart) return false;

        const decorrido = agora - this.offlineRegenStart;
        const progresso = Math.min(decorrido / REGEN_CONFIG.OFFLINE_FULL_MS, 1);

        let mudou = false;

        if (progresso < 1) {
            const smAlvo = Math.min(this.smMax, Math.ceil(this.smMax * progresso));
            if (smAlvo > this.sm) {
                this.sm = smAlvo;
                mudou = true;
            }
        } else {
            const precisaRestaurar =
                this.sm < this.smMax ||
                this.hp < this.hpMax ||
                this.mp < this.mpMax;

            this.sm = this.smMax;
            this.hp = this.hpMax;
            this.mp = this.mpMax;

            if (precisaRestaurar && !this._regenCompletaAvisada) {
                this._regenCompletaAvisada = true;
                this._notificarCompleto();
            }

            this.offlineRegenStart = null;
            this._renderizar();
            this._persistir();

            if (this.onApply) this.onApply(this._snapshot());
            return true;
        }

        if (mudou) {
            this._agendarPersistencia();
            if (this.onApply) this.onApply(this._snapshot());
        }
        return mudou;
    }

    _notificarCompleto() {
        const toast = document.getElementById('offlineRegenToast');
        if (toast) {
            toast.textContent = '🌟 Recuperação total concluída! HP, MP e SM restaurados.';
            toast.style.display = 'block';
            toast.style.opacity = '1';
            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => { toast.style.display = 'none'; }, 400);
            }, 4000);
        }
        console.log('🌟 [OfflineRegen] Recuperação completa — HP/MP/SM ao máximo');
    }

    // ============================================================
    // PERSISTÊNCIA
    // ============================================================
    async _carregarDoBanco() {
        const { data, error } = await this.supabase
            .from(this.tabela)
            .select('sm_atual, sm, max_sm, hp_atual, hp, max_hp, mp_atual, mp, max_mp, offline_regen_start')
            .eq('login', this.login)
            .maybeSingle();

        if (error || !data) {
            console.warn('⚠️ [OfflineRegen] Não foi possível carregar:', error);
            return;
        }

        this.smMax = data.max_sm ?? 100;
        this.hpMax = data.max_hp ?? 100;
        this.mpMax = data.max_mp ?? 50;

        this.sm = data.sm_atual ?? data.sm ?? this.smMax;
        this.hp = data.hp_atual ?? data.hp ?? this.hpMax;
        this.mp = data.mp_atual ?? data.mp ?? this.mpMax;

        const ts = data.offline_regen_start;
        this.offlineRegenStart = ts ? new Date(ts).getTime() : null;

        const limiar = this.smMax * (REGEN_CONFIG.STAMINA_CRITICAL_PCT / 100);
        if (this.sm >= limiar) {
            this.offlineRegenStart = null;
        }
    }

    _agendarPersistencia() {
        if (this._autoSaveTimeout) clearTimeout(this._autoSaveTimeout);
        this._autoSaveTimeout = setTimeout(() => this._persistir(), 800);
    }

    async _persistir() {
        const payload = {
            sm_atual: this.sm, sm: this.sm,
            hp_atual: this.hp, hp: this.hp,
            mp_atual: this.mp, mp: this.mp,
            offline_regen_start: this.offlineRegenStart
                ? new Date(this.offlineRegenStart).toISOString()
                : null,
            updated_at: new Date().toISOString()
        };
        try {
            const { error } = await this.supabase
                .from(this.tabela)
                .update(payload)
                .eq('login', this.login);
            if (error) console.warn('⚠️ [OfflineRegen] Erro ao persistir:', error);
        } catch (e) {
            console.warn('⚠️ [OfflineRegen] Exceção ao persistir:', e);
        }
    }

    // ============================================================
    // UI — WIDGET
    // ============================================================
    _injetarWidgetSeNecessario() {
        if (document.getElementById('offlineRegenWidget')) {
            this._widget = document.getElementById('offlineRegenWidget');
            return;
        }

        const html = `
            <div class="offline-regen-widget" id="offlineRegenWidget" style="display:none;">
                <div class="og-header">
                    <div class="og-icon">⏳</div>
                    <div class="og-info">
                        <div class="og-title">Recuperação Total em Andamento</div>
                        <div class="og-sub" id="ogSub">Sua stamina está crítica. Aguarde para restaurar tudo.</div>
                    </div>
                    <div class="og-timer" id="ogTimer">--:--:--</div>
                </div>
                <div class="og-bar">
                    <div class="og-fill" id="ogFill" style="width:0%">
                        <div class="og-shine"></div>
                    </div>
                </div>
                <div class="og-footer">
                    <span id="ogPercent">0%</span>
                    <span id="ogHint">Ao completar 24h, HP, MP e SM serão restaurados ao máximo</span>
                </div>
            </div>
            <div id="offlineRegenToast" style="
                position:fixed;bottom:20px;left:50%;transform:translateX(-50%);
                background:rgba(10,11,16,0.95);color:#fff;padding:12px 24px;
                border-radius:12px;font-weight:600;font-size:0.9rem;
                border-left:4px solid #10b981;z-index:9999;display:none;
                opacity:0;transition:opacity .4s;box-shadow:0 8px 32px rgba(0,0,0,.5);
            "></div>
        `;

        // ✅ Prioriza #offlineRegenSlot e insere DENTRO dele
        const anchor = this.container
            || document.getElementById('offlineRegenSlot')
            || document.querySelector('main')
            || document.querySelector('.container')
            || document.body.firstChild;

        const isSlot = anchor && anchor.id === 'offlineRegenSlot';

        const wrapper = document.createElement('div');
        wrapper.innerHTML = html.trim();
        const nodes = Array.from(wrapper.children);

        if (isSlot) {
            nodes.forEach(n => anchor.appendChild(n));
        } else if (anchor && anchor.parentNode) {
            nodes.forEach(n => anchor.parentNode.insertBefore(n, anchor));
        } else {
            nodes.forEach(n => document.body.appendChild(n));
        }

        this._widget = document.getElementById('offlineRegenWidget');
    }

    _renderizar() {
        const widget = this._widget || document.getElementById('offlineRegenWidget');
        if (!widget) return;

        const limiar = this.smMax * (REGEN_CONFIG.STAMINA_CRITICAL_PCT / 100);
        const deveMostrar = this.sm < limiar && !!this.offlineRegenStart;

        if (!deveMostrar) {
            widget.style.display = 'none';
            return;
        }

        widget.style.display = 'block';

        const progresso = this._calcularProgresso();
        const pct = Math.floor(progresso * 100);

        const fill = document.getElementById('ogFill');
        if (fill) fill.style.width = pct + '%';

        const ogPercent = document.getElementById('ogPercent');
        if (ogPercent) ogPercent.textContent = pct + '%';

        const restanteMs = Math.max(
            0,
            REGEN_CONFIG.OFFLINE_FULL_MS - (Date.now() - this.offlineRegenStart)
        );
        const ogTimer = document.getElementById('ogTimer');
        if (ogTimer) ogTimer.textContent = this._formatarTempo(restanteMs);

        const ogSub = document.getElementById('ogSub');
        if (ogSub) {
            if (pct < 30)      ogSub.textContent = '⚠️ Stamina crítica! Continue offline para recuperar.';
            else if (pct < 70) ogSub.textContent = '⏳ Recuperando energia... mantenha-se offline.';
            else               ogSub.textContent = '✨ Quase lá! Sua recuperação total está próxima.';
        }

        const ogHint = document.getElementById('ogHint');
        if (ogHint) {
            ogHint.textContent = pct < 100
                ? 'Ao completar 24h, HP, MP e SM serão restaurados ao máximo'
                : 'Recuperação completa!';
        }
    }

    _calcularProgresso() {
        if (!this.offlineRegenStart) return 0;
        const decorrido = Date.now() - this.offlineRegenStart;
        return Math.min(decorrido / REGEN_CONFIG.OFFLINE_FULL_MS, 1);
    }

    _formatarTempo(ms) {
        if (ms <= 0) return '00:00:00';
        const totalSeg = Math.floor(ms / 1000);
        const h = String(Math.floor(totalSeg / 3600)).padStart(2, '0');
        const m = String(Math.floor((totalSeg % 3600) / 60)).padStart(2, '0');
        const s = String(totalSeg % 60).padStart(2, '0');
        return `${h}:${m}:${s}`;
    }

    _snapshot() {
        return {
            sm: this.sm, smMax: this.smMax,
            hp: this.hp, hpMax: this.hpMax,
            mp: this.mp, mpMax: this.mpMax,
            offlineRegenStart: this.offlineRegenStart,
            progresso: this._calcularProgresso()
        };
    }
}