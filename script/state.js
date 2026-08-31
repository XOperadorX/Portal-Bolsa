// ============================================================
// GERENCIADOR DE ESTADO UNIFICADO
// ============================================================

import { supabase } from './supabase.js';
import { CONFIG, ITENS_MERCADO, TITULOS, STAGES, STAGE_ORDER, STAGE_META } from './config.js';

class StateManager {
    constructor() {
        this.usuario = null;
        this.dados = null;
        this._listeners = [];
        this._saveTimeout = null;
        this._isSaving = false;
    }

    // ============================================================
    // LISTENERS
    // ============================================================
    subscribe(listener) {
        this._listeners.push(listener);
        return () => {
            this._listeners = this._listeners.filter(l => l !== listener);
        };
    }

    notify() {
        this._listeners.forEach(l => l(this.dados));
    }

    // ============================================================
    // GETTERS
    // ============================================================
    get isLoggedIn() {
        return this.usuario !== null && this.dados !== null;
    }

    get login() {
        return this.usuario?.login || null;
    }

    get nome() {
        return this.dados?.nome || this.usuario?.nome || 'Visitante';
    }

    get saldo() {
        return this.dados?.saldo || 0;
    }

    get nivel() {
        return this.dados?.nivel || 1;
    }

    get experiencia() {
        return this.dados?.experiencia || 0;
    }

    get hp() {
        return this.dados?.hp || this.dados?.hp_atual || 100;
    }

    get maxHp() {
        return this.dados?.max_hp || this.dados?.hp_max || 100;
    }

    get mp() {
        return this.dados?.mp || this.dados?.mp_atual || 50;
    }

    get maxMp() {
        return this.dados?.max_mp || this.dados?.mp_max || 50;
    }

    get sm() {
        return this.dados?.sm || this.dados?.sm_atual || 100;
    }

    get maxSm() {
        return this.dados?.max_sm || this.dados?.sm_max || 100;
    }

    get atk() {
        return this.dados?.atk || this.dados?.ataque_base || 15;
    }

    get def() {
        return this.dados?.def || this.dados?.defesa_base || 10;
    }

    get mag() {
        return this.dados?.mag || this.dados?.magia_base || 8;
    }

    get seeds() {
        return this.dados?.seeds || 0;
    }

    get planted() {
        return this.dados?.planted || 0;
    }

    get harvested() {
        return this.dados?.harvested || 0;
    }

    get buckets() {
        return this.dados?.buckets || 0;
    }

    get stock() {
        return this.dados?.stock || 0;
    }

    get plotData() {
        return this.dados?.plot_data || [];
    }

    get carteira() {
        return this.dados?.carteira || {};
    }

    get fazendinhaDados() {
        return this.dados?.fazendinha_dados || {};
    }

    get historico() {
        return this.dados?.historico || [];
    }

    get btc() {
        return this.dados?.btc || 0;
    }

    get poderHash() {
        return this.dados?.poder_hash || 1.0;
    }

    get mumu() {
        return this.dados?.mumu || 500;
    }

    // ============================================================
    // FUNÇÕES DE NÍVEL
    // ============================================================
    getExpProximo() {
        const nivel = this.nivel;
        return Math.floor(100 * Math.pow(1.2, nivel - 1));
    }

    getTitulo() {
        let titulo = TITULOS[0].titulo;
        for (const t of TITULOS) {
            if (this.nivel >= t.min) titulo = t.titulo;
        }
        return titulo;
    }

    getProgressoExp() {
        const expProx = this.getExpProximo();
        return Math.min((this.experiencia / expProx) * 100, 100);
    }

    // ============================================================
    // FUNÇÕES DE ATRIBUTOS
    // ============================================================
    getAtaqueTotal() {
        return this.atk + Math.floor(this.nivel * 1.5);
    }

    getDefesaTotal() {
        return this.def + Math.floor(this.nivel * 1.2);
    }

    getMagiaTotal() {
        return this.mag + Math.floor(this.nivel * 1.0);
    }

    getHpMaxTotal() {
        return this.maxHp + Math.floor(this.nivel * 6);
    }

    getMpMaxTotal() {
        return this.maxMp + Math.floor(this.nivel * 4);
    }

    getSmMaxTotal() {
        return this.maxSm + Math.floor(this.nivel * 3);
    }

    // ============================================================
    // AÇÕES DO JOGO
    // ============================================================
    async adicionarExp(quantidade) {
        if (!this.isLoggedIn) return false;

        const novaExp = (this.dados.experiencia || 0) + quantidade;
        let nivelAtual = this.dados.nivel || 1;
        let expRestante = novaExp;

        while (expRestante >= this.getExpProximo()) {
            expRestante -= this.getExpProximo();
            nivelAtual++;
        }

        const atualizacao = {
            nivel: nivelAtual,
            experiencia: expRestante,
            exp_proximo: this.getExpProximo()
        };

        // Recuperar atributos se subiu de nível
        if (nivelAtual > (this.dados.nivel || 1)) {
            atualizacao.hp = this.getHpMaxTotal();
            atualizacao.mp = this.getMpMaxTotal();
            atualizacao.sm = this.getSmMaxTotal();
            atualizacao.hp_atual = this.getHpMaxTotal();
            atualizacao.mp_atual = this.getMpMaxTotal();
            atualizacao.sm_atual = this.getSmMaxTotal();
        }

        const sucesso = await supabase.salvarDadosCompletos(this.login, atualizacao);
        if (sucesso) {
            await this.recarregar();
            await supabase.adicionarHistorico(this.login, `✨ +${quantidade} EXP`, 'exp');
        }
        return sucesso;
    }

    async adicionarSaldo(valor, motivo = '') {
        if (!this.isLoggedIn) return false;

        const novoSaldo = (this.dados.saldo || 0) + valor;
        const sucesso = await supabase.salvarDados(this.login, { saldo: novoSaldo });
        if (sucesso) {
            await this.recarregar();
            if (motivo) {
                await supabase.adicionarHistorico(this.login, `💰 ${motivo}: R$ ${valor.toFixed(2)}`, 'financeiro');
            }
        }
        return sucesso;
    }

    async adicionarItem(item, quantidade) {
        if (!this.isLoggedIn) return false;

        const carteira = this.dados.carteira || {};
        const atual = carteira[item] || 0;
        const novo = atual + quantidade;

        if (novo <= 0) {
            delete carteira[item];
        } else {
            carteira[item] = novo;
        }

        const sucesso = await supabase.salvarDados(this.login, { carteira });
        if (sucesso) {
            await this.recarregar();
        }
        return sucesso;
    }

    async atualizarFazendinha(dados) {
        if (!this.isLoggedIn) return false;

        const fazendinhaDados = this.dados.fazendinha_dados || {};
        const merged = { ...fazendinhaDados, ...dados };

        const sucesso = await supabase.salvarDados(this.login, { fazendinha_dados: merged });
        if (sucesso) {
            await this.recarregar();
        }
        return sucesso;
    }

    async atualizarPlotData(plotData) {
        if (!this.isLoggedIn) return false;
        const sucesso = await supabase.salvarDados(this.login, { plot_data: plotData });
        if (sucesso) {
            await this.recarregar();
        }
        return sucesso;
    }

    // ============================================================
    // CARREGAR E SALVAR
    // ============================================================
    async carregar(login) {
        const usuario = await supabase.buscarUsuario(login);
        if (!usuario) return false;

        this.usuario = { login: usuario.login, nome: usuario.nome };
        this.dados = usuario;
        this.notify();
        return true;
    }

    async recarregar() {
        if (!this.usuario) return false;
        return await this.carregar(this.usuario.login);
    }

    async salvar(dadosParciais) {
        if (!this.isLoggedIn) return false;

        if (this._saveTimeout) {
            clearTimeout(this._saveTimeout);
        }

        return new Promise((resolve) => {
            this._saveTimeout = setTimeout(async () => {
                const sucesso = await supabase.salvarDadosCompletos(this.login, dadosParciais);
                if (sucesso) {
                    await this.recarregar();
                }
                resolve(sucesso);
            }, 300);
        });
    }

    // ============================================================
    // AUTENTICAÇÃO
    // ============================================================
    async login(login, senha) {
        const result = await supabase.autenticar(login, senha);
        if (result.success) {
            this.usuario = { login: result.usuario.login, nome: result.usuario.nome };
            this.dados = result.usuario;
            this.notify();
            
            // Salvar no localStorage
            localStorage.setItem('usuario_logado', JSON.stringify(this.usuario));
            
            await supabase.adicionarHistorico(login, '👋 Login realizado', 'auth');
            return true;
        }
        return false;
    }

    async logout() {
        if (this.isLoggedIn) {
            await supabase.adicionarHistorico(this.login, '👋 Logout', 'auth');
        }
        this.usuario = null;
        this.dados = null;
        localStorage.removeItem('usuario_logado');
        this.notify();
    }

    carregarDoLocalStorage() {
        try {
            const data = localStorage.getItem('usuario_logado');
            if (data) {
                const usuario = JSON.parse(data);
                this.usuario = usuario;
                return true;
            }
        } catch (e) {}
        return false;
    }

    // ============================================================
    // MÉTODOS DE UTILIDADE
    // ============================================================
    getItensDaCarteira() {
        const carteira = this.carteira;
        return Object.entries(carteira)
            .filter(([_, qtd]) => qtd > 0)
            .map(([nome, quantidade]) => ({ nome, quantidade }));
    }

    getItensDaFazendinha() {
        const fd = this.fazendinhaDados;
        const inventario = fd.inventario || {};
        return Object.entries(inventario)
            .filter(([_, qtd]) => qtd > 0)
            .map(([nome, quantidade]) => {
                const item = ITENS_MERCADO.find(i => i.id === nome);
                return { nome: item?.nome || nome, quantidade, id: nome };
            });
    }

    getTodosItens() {
        const carteira = this.getItensDaCarteira();
        const fazendinha = this.getItensDaFazendinha();
        const todos = [...carteira, ...fazendinha];
        
        // Agrupar por nome
        const agrupado = {};
        todos.forEach(item => {
            if (agrupado[item.nome]) {
                agrupado[item.nome].quantidade += item.quantidade;
            } else {
                agrupado[item.nome] = { ...item };
            }
        });
        
        return Object.values(agrupado);
    }

    getItemEmoji(nome) {
        const item = ITENS_MERCADO.find(i => i.nome === nome);
        return item?.emoji || '📦';
    }

    getItemPreco(nome) {
        const item = ITENS_MERCADO.find(i => i.nome === nome);
        return item?.precoBase || 10;
    }
}

// ============================================================
// INSTÂNCIA ÚNICA
// ============================================================
export const state = new StateManager();