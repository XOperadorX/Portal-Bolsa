// ============================================================
// SUPABASE UTILITÁRIO UNIFICADO
// ============================================================

import { CONFIG } from './config.js';

export class SupabaseClient {
    constructor() {
        this.url = CONFIG.SUPABASE_URL;
        this.key = CONFIG.SUPABASE_KEY;
        this.tabela = CONFIG.TABELA;
        this.online = false;
        this._cache = {};
    }

    // ============================================================
    // HEADERS
    // ============================================================
    getHeaders(extra = {}) {
        return {
            'apikey': this.key,
            'Authorization': `Bearer ${this.key}`,
            'Content-Type': 'application/json',
            ...extra
        };
    }

    // ============================================================
    // VERIFICAR CONEXÃO
    // ============================================================
    async verificarConexao() {
        try {
            const response = await fetch(`${this.url}/rest/v1/${this.tabela}?select=id&limit=1`, {
                headers: this.getHeaders()
            });
            this.online = response.ok;
            return this.online;
        } catch {
            this.online = false;
            return false;
        }
    }

    // ============================================================
    // BUSCAR USUÁRIO
    // ============================================================
    async buscarUsuario(login) {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/${this.tabela}?login=eq.${encodeURIComponent(login)}`,
                { headers: this.getHeaders() }
            );
            if (!response.ok) return null;
            const data = await response.json();
            return data && data.length > 0 ? data[0] : null;
        } catch (error) {
            console.error('❌ Erro ao buscar usuário:', error);
            return null;
        }
    }

    // ============================================================
    // CRIAR USUÁRIO
    // ============================================================
    async criarUsuario(login, senha, nome = null) {
        try {
            const dados = {
                login: login,
                nome: nome || login,
                senha: senha,
                saldo: 0,
                nivel: 1,
                experiencia: 0,
                hp: 100,
                max_hp: 100,
                mp: 50,
                max_mp: 50,
                sm: 100,
                max_sm: 100,
                atk: 15,
                def: 10,
                mag: 8,
                seeds: 5,
                planted: 0,
                harvested: 0,
                buckets: 0,
                stock: 0,
                plot_data: [],
                carteira: {},
                itens: [],
                fazendinha_dados: { inventario: {}, plantio: { active: false }, incubacao: { active: false } },
                historico: []
            };

            const response = await fetch(`${this.url}/rest/v1/${this.tabela}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(dados)
            });

            return response.ok;
        } catch (error) {
            console.error('❌ Erro ao criar usuário:', error);
            return false;
        }
    }

    // ============================================================
    // AUTENTICAR USUÁRIO
    // ============================================================
    async autenticar(login, senha) {
        try {
            const usuario = await this.buscarUsuario(login);
            if (!usuario) return { success: false, error: 'Usuário não encontrado' };
            if (usuario.senha !== senha) return { success: false, error: 'Senha incorreta' };
            return { success: true, usuario };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ============================================================
    // SALVAR DADOS
    // ============================================================
    async salvarDados(login, dados) {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/${this.tabela}?login=eq.${encodeURIComponent(login)}`,
                {
                    method: 'PATCH',
                    headers: this.getHeaders(),
                    body: JSON.stringify({
                        ...dados,
                        updated_at: new Date().toISOString()
                    })
                }
            );
            return response.ok;
        } catch (error) {
            console.error('❌ Erro ao salvar dados:', error);
            return false;
        }
    }

    // ============================================================
    // SALVAR DADOS COMPLETOS (com merge)
    // ============================================================
    async salvarDadosCompletos(login, novosDados) {
        try {
            // Buscar dados atuais
            const atuais = await this.buscarUsuario(login);
            if (!atuais) return false;

            // Merge dos dados
            const merged = { ...atuais, ...novosDados };
            delete merged.id;
            delete merged.created_at;
            delete merged.updated_at;

            return await this.salvarDados(login, merged);
        } catch (error) {
            console.error('❌ Erro ao salvar dados completos:', error);
            return false;
        }
    }

    // ============================================================
    // ADICIONAR AO HISTÓRICO
    // ============================================================
    async adicionarHistorico(login, mensagem, tipo = 'info') {
        try {
            const usuario = await this.buscarUsuario(login);
            if (!usuario) return false;

            const historico = usuario.historico || [];
            historico.unshift({
                data: new Date().toISOString(),
                mensagem,
                tipo
            });

            if (historico.length > 100) historico.length = 100;

            return await this.salvarDados(login, { historico });
        } catch (error) {
            console.error('❌ Erro ao adicionar histórico:', error);
            return false;
        }
    }

    // ============================================================
    // ATUALIZAR SALDO
    // ============================================================
    async atualizarSaldo(login, valor, motivo = '') {
        try {
            const usuario = await this.buscarUsuario(login);
            if (!usuario) return false;

            const novoSaldo = (usuario.saldo || 0) + valor;
            await this.salvarDados(login, { saldo: novoSaldo });

            if (motivo) {
                await this.adicionarHistorico(login, `💰 ${motivo}: R$ ${valor.toFixed(2)}`, 'financeiro');
            }

            return true;
        } catch (error) {
            console.error('❌ Erro ao atualizar saldo:', error);
            return false;
        }
    }

    // ============================================================
    // ATUALIZAR ITENS DA CARTEIRA
    // ============================================================
    async atualizarCarteira(login, item, quantidade) {
        try {
            const usuario = await this.buscarUsuario(login);
            if (!usuario) return false;

            const carteira = usuario.carteira || {};
            const atual = carteira[item] || 0;
            const novo = atual + quantidade;

            if (novo <= 0) {
                delete carteira[item];
            } else {
                carteira[item] = novo;
            }

            return await this.salvarDados(login, { carteira });
        } catch (error) {
            console.error('❌ Erro ao atualizar carteira:', error);
            return false;
        }
    }

    // ============================================================
    // ATUALIZAR FAZENDINHA
    // ============================================================
    async atualizarFazendinha(login, dadosFazendinha) {
        try {
            const usuario = await this.buscarUsuario(login);
            if (!usuario) return false;

            const fazendinhaDados = usuario.fazendinha_dados || {};
            const merged = { ...fazendinhaDados, ...dadosFazendinha };

            return await this.salvarDados(login, { fazendinha_dados: merged });
        } catch (error) {
            console.error('❌ Erro ao atualizar fazendinha:', error);
            return false;
        }
    }
}

// ============================================================
// INSTÂNCIA ÚNICA
// ============================================================
export const supabase = new SupabaseClient();