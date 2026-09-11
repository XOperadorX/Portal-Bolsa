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
        this._cache = new Map();
        this._cacheTTL = 5000; // ms
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
    // CACHE
    // ============================================================
    _getCache(login) {
        const entry = this._cache.get(login);
        if (!entry) return null;
        if (Date.now() - entry.time > this._cacheTTL) {
            this._cache.delete(login);
            return null;
        }
        return entry.data;
    }

    _setCache(login, data) {
        this._cache.set(login, { data, time: Date.now() });
    }

    _invalidateCache(login) {
        if (login) this._cache.delete(login);
        else this._cache.clear();
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
    async buscarUsuario(login, forcarRefresh = false) {
        if (!forcarRefresh) {
            const cached = this._getCache(login);
            if (cached) return cached;
        }

        try {
            const response = await fetch(
                `${this.url}/rest/v1/${this.tabela}?login=eq.${encodeURIComponent(login)}`,
                { headers: this.getHeaders() }
            );
            if (!response.ok) return null;
            const data = await response.json();
            const usuario = data && data.length > 0 ? data[0] : null;
            if (usuario) this._setCache(login, usuario);
            return usuario;
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
            const usuario = await this.buscarUsuario(login, true);
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

            if (response.ok) {
                this._invalidateCache(login);
            }
            return response.ok;
        } catch (error) {
            console.error('❌ Erro ao salvar dados:', error);
            return false;
        }
    }

    // ============================================================
    // SALVAR DADOS COMPLETOS (com merge PROFUNDO)
    // ============================================================
    async salvarDadosCompletos(login, novosDados) {
        try {
            const atuais = await this.buscarUsuario(login, true);
            if (!atuais) return false;

            // ✅ CORRIGIDO: deep merge para carteira e fazendinha_dados
            const merged = { ...atuais, ...novosDados };

            // Merge profundo de carteira
            if (novosDados.carteira) {
                merged.carteira = { ...(atuais.carteira || {}), ...novosDados.carteira };
            }

            // Merge profundo de fazendinha_dados
            if (novosDados.fazendinha_dados) {
                merged.fazendinha_dados = {
                    ...(atuais.fazendinha_dados || {}),
                    ...novosDados.fazendinha_dados
                };
                // Merge aninhado de inventário se ambos existirem
                if (atuais.fazendinha_dados?.inventario || novosDados.fazendinha_dados.inventario) {
                    merged.fazendinha_dados.inventario = {
                        ...(atuais.fazendinha_dados?.inventario || {}),
                        ...(novosDados.fazendinha_dados.inventario || {})
                    };
                }
            }

            // Merge profundo de preco_medio_compra e proventos_por_ativo (se existirem)
            if (novosDados.preco_medio_compra) {
                merged.preco_medio_compra = {
                    ...(atuais.preco_medio_compra || {}),
                    ...novosDados.preco_medio_compra
                };
            }
            if (novosDados.proventos_por_ativo) {
                merged.proventos_por_ativo = {
                    ...(atuais.proventos_por_ativo || {}),
                    ...novosDados.proventos_por_ativo
                };
            }

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
            const usuario = await this.buscarUsuario(login, true);
            if (!usuario) return false;

            const historico = Array.isArray(usuario.historico) ? [...usuario.historico] : [];
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
            const usuario = await this.buscarUsuario(login, true);
            if (!usuario) return false;

            const novoSaldo = (usuario.saldo || 0) + valor;
            const ok = await this.salvarDados(login, { saldo: novoSaldo });

            if (ok && motivo) {
                await this.adicionarHistorico(login, `💰 ${motivo}: R$ ${valor.toFixed(2)}`, 'financeiro');
            }

            return ok;
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
            const usuario = await this.buscarUsuario(login, true);
            if (!usuario) return false;

            const carteira = { ...(usuario.carteira || {}) };
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
            const usuario = await this.buscarUsuario(login, true);
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