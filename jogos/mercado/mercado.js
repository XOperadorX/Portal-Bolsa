// ============================================================
// 🌾 MERCADO COMPLETO - mercado.js
// Compra, Venda e Troca de Itens usando Supabase
// ✅ INTEGRADO com session.js, login.js e dashboard.js
// ============================================================

import { obterUsuarioSessao, sessaoValida, limparSessao, agendarExpiracaoSessao } from './session.js';

// ==================== CONFIGURAÇÃO SUPABASE ====================
const SUPABASE_URL = 'https://xrcxvizzdumcxbylmkvn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_E-g3G3wW4EySbCsXLXp8KQ_FnmERMcD';
const TABELA = 'Geral';

// ==================== ESTADO GLOBAL ====================
let supabaseClient = null;
let usuarioAtual = null;
let todosJogadores = [];

// ==================== ITENS DO MERCADO ====================
const ITENS_DISPONIVEIS = [
    { id: 'semente_trigo',   nome: 'Semente de Trigo',   icone: '🌾', preco: 10.00,  sub: 'Semente básica',        tipo: 'semente',   stockMax: 999 },
    { id: 'semente_milho',   nome: 'Semente de Milho',   icone: '🌽', preco: 25.00,  sub: 'Semente intermediária', tipo: 'semente',   stockMax: 999 },
    { id: 'semente_cenoura', nome: 'Semente de Cenoura', icone: '🥕', preco: 40.00,  sub: 'Semente avançada',      tipo: 'semente',   stockMax: 999 },
    { id: 'semente_tomate',  nome: 'Semente de Tomate',  icone: '🍅', preco: 60.00,  sub: 'Semente premium',       tipo: 'semente',   stockMax: 999 },
    { id: 'semente_batata',  nome: 'Semente de Batata',  icone: '🥔', preco: 80.00,  sub: 'Semente rara',          tipo: 'semente',   stockMax: 999 },
    { id: 'fertilizante',    nome: 'Fertilizante',       icone: '💧', preco: 15.00,  sub: 'Acelera crescimento',   tipo: 'consumivel', stockMax: 999 },
    { id: 'pocao_energia',   nome: 'Poção de Energia',   icone: '⚡', preco: 50.00,  sub: 'Recupera stamina',      tipo: 'consumivel', stockMax: 999 },
    { id: 'pocao_vida',      nome: 'Poção de Vida',      icone: '❤️', preco: 75.00,  sub: 'Recupera HP',           tipo: 'consumivel', stockMax: 999 },
    { id: 'pocao_mana',      nome: 'Poção de Mana',      icone: '🔮', preco: 75.00,  sub: 'Recupera MP',           tipo: 'consumivel', stockMax: 999 },
    { id: 'cadeado',         nome: 'Cadeado',            icone: '🔒', preco: 200.00, sub: 'Protege sua conta',     tipo: 'especial',   stockMax: 1   },
    { id: 'buckets',         nome: 'Balde Extra',        icone: '🪣', preco: 150.00, sub: '+1 capacidade',         tipo: 'upgrade',    stockMax: 10  },
    { id: 'poder_hash',      nome: 'Poder de Hash',      icone: '⛏️', preco: 500.00, sub: '+1 poder de mineração', tipo: 'upgrade',    stockMax: 10  },
    { id: 'btc',             nome: 'Bitcoin',            icone: '₿',  preco: 1000.00, sub: 'Criptomoeda',          tipo: 'recurso',    stockMax: 999 },
    { id: 'mumu',            nome: 'Mumu Coin',          icone: '🐄', preco: 100.00, sub: 'Moeda do jogo',         tipo: 'recurso',    stockMax: 999 }
];

const TITULOS_NIVEL = [
    '🌱 Iniciante', '🌿 Aprendiz', '🍀 Cultivador', '🌾 Fazendeiro',
    '🌳 Agricultor', '🏆 Mestre Rural', '👑 Lenda do Campo', '⚡ Deus da Colheita'
];

// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🌾 Mercado carregado');

    // ✅ 1. VERIFICAR SESSÃO (24h)
    if (!sessaoValida()) {
        console.warn('⚠️ Sessão inválida/expirada. Redirecionando para login...');
        limparSessao();
        window.location.href = '../../login.html';
        return;
    }

    // ✅ 2. Agendar expiração automática
    agendarExpiracaoSessao(() => {
        alert('⏰ Sessão expirada! Faça login novamente.');
        window.location.href = '../../login.html';
    });

    // ✅ 3. Configurar eventos (Sair, Reconectar)
    configurarEventos();

    // ✅ 4. Carregar Supabase
    await carregarSupabase();

    // ✅ 5. Inicializar dados
    await inicializar();
});

// ==================== CONFIGURAR EVENTOS ====================
function configurarEventos() {
    // Botão reconectar
    const btnReconnect = document.getElementById('btnReconnectSupabase');
    if (btnReconnect) {
        btnReconnect.addEventListener('click', async () => {
            atualizarStatusSupabase('checking');
            await testarConexao();
        });
    }

    // ✅ Botão Sair
    const btnSair = document.getElementById('btnSair');
    if (btnSair) {
        btnSair.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja sair?')) {
                limparSessao();
                window.location.href = '../../login.html';
            }
        });
    }
}

// ==================== CARREGAR SUPABASE ====================
async function carregarSupabase() {
    return new Promise((resolve) => {
        if (window.supabase) {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.onload = () => {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ Supabase carregado');
            resolve();
        };
        script.onerror = () => {
            console.error('❌ Falha ao carregar Supabase');
            atualizarStatusSupabase('offline');
            resolve();
        };
        document.head.appendChild(script);
    });
}

// ==================== INICIALIZAR ====================
async function inicializar() {
    atualizarStatusSupabase('checking');

    const conectado = await testarConexao();
    if (!conectado) {
        mostrarToast('❌ Sem conexão com o servidor');
        return;
    }

    // ✅ Pegar usuário da sessão unificada (session.js)
    const usuarioSessao = obterUsuarioSessao();
    if (!usuarioSessao || !usuarioSessao.login) {
        mostrarToast('⚠️ Nenhum usuário logado');
        setTimeout(() => { window.location.href = '../../login.html'; }, 1500);
        return;
    }

    console.log('👤 Sessão encontrada:', usuarioSessao.login);

    await carregarUsuario(usuarioSessao.login);
    await carregarTodosJogadores();
    await verificarAdmin();
    renderizarMercado();
    await carregarInventario();
}

// ==================== TESTAR CONEXÃO ====================
async function testarConexao() {
    if (!supabaseClient) {
        atualizarStatusSupabase('offline');
        return false;
    }
    try {
        const { error } = await supabaseClient.from(TABELA).select('id').limit(1);
        if (error) throw error;
        atualizarStatusSupabase('online');
        return true;
    } catch (err) {
        console.error('Erro na conexão:', err);
        atualizarStatusSupabase('offline');
        return false;
    }
}

// ==================== ATUALIZAR STATUS ====================
function atualizarStatusSupabase(status) {
    const dot = document.getElementById('supabaseDot');
    const txt = document.getElementById('supabaseStatus');
    if (!dot || !txt) return;

    dot.className = 'dot ' + status;
    txt.className = 'value ' + status;
    const labels = { online: 'Online', offline: 'Offline', checking: 'Verificando...' };
    txt.textContent = labels[status] || status;
}

// ==================== CARREGAR USUÁRIO ====================
async function carregarUsuario(login) {
    try {
        const { data, error } = await supabaseClient
            .from(TABELA)
            .select('*')
            .eq('login', login)
            .single();

        if (error) throw error;

        usuarioAtual = data;
        if (!Array.isArray(usuarioAtual.itens)) usuarioAtual.itens = [];

        console.log('👤 Usuário carregado:', usuarioAtual.nome || usuarioAtual.login);
        atualizarUIUsuario();
        atualizarUILevel();
    } catch (err) {
        console.error('Erro ao carregar usuário:', err);
        mostrarToast('❌ Erro ao carregar dados do usuário');
    }
}

// ==================== VERIFICAR ADMIN (igual dashboard) ====================
async function verificarAdmin() {
    const btnAdmin = document.getElementById('btnAdmin');
    if (!btnAdmin || !usuarioAtual) return;

    try {
        if (usuarioAtual.cadeado === true) {
            btnAdmin.style.display = 'inline-flex';
            btnAdmin.classList.add('visivel');
            console.log('👑 ADMIN LIBERADO para', usuarioAtual.login);
        } else {
            btnAdmin.style.display = 'none';
            btnAdmin.classList.remove('visivel');
        }
    } catch (e) {
        btnAdmin.style.display = 'none';
    }
}

// ==================== CARREGAR TODOS JOGADORES ====================
async function carregarTodosJogadores() {
    try {
        const { data, error } = await supabaseClient
            .from(TABELA)
            .select('id, nome, login, nivel, seeds, itens')
            .neq('id', usuarioAtual?.id || 0)
            .order('nivel', { ascending: false })
            .limit(100);

        if (error) throw error;
        todosJogadores = data || [];
        console.log(`👥 ${todosJogadores.length} jogadores carregados`);
    } catch (err) {
        console.error('Erro ao carregar jogadores:', err);
        todosJogadores = [];
    }
}

// ==================== ATUALIZAR UI DO USUÁRIO ====================
function atualizarUIUsuario() {
    if (!usuarioAtual) return;

    const nome = usuarioAtual.nome || usuarioAtual.login || 'Jogador';
    const inicial = nome.charAt(0).toUpperCase();
    const saldo = parseFloat(usuarioAtual.saldo || 0);
    const seeds = parseInt(usuarioAtual.seeds || 0);

    const avatar = document.getElementById('userAvatar');
    if (avatar) avatar.textContent = inicial;

    const userName = document.getElementById('userName');
    if (userName) userName.textContent = nome;

    const balanceDisplay = document.getElementById('userBalanceDisplay');
    if (balanceDisplay) balanceDisplay.textContent = `💰 R$ ${formatarMoeda(saldo)}`;

    const seedsDisplay = document.getElementById('userSeedsDisplay');
    if (seedsDisplay) seedsDisplay.textContent = `🌰 ${seeds} sementes`;

    const headerSaldo = document.getElementById('headerSaldo');
    if (headerSaldo) headerSaldo.textContent = formatarMoeda(saldo);

    const seedsEl = document.getElementById('seeds');
    if (seedsEl) seedsEl.textContent = seeds;

    const marketSaldo = document.getElementById('marketSaldo');
    if (marketSaldo) marketSaldo.textContent = `R$ ${formatarMoeda(saldo)}`;

    const marketSeeds = document.getElementById('marketSeeds');
    if (marketSeeds) marketSeeds.textContent = seeds;
}

// ==================== ATUALIZAR UI DO LEVEL ====================
function atualizarUILevel() {
    if (!usuarioAtual) return;

    const nivel = parseInt(usuarioAtual.nivel || 1);
    const exp = parseFloat(usuarioAtual.experiencia || usuarioAtual.exp || 0);
    const expProx = parseFloat(usuarioAtual.exp_proximo || usuarioAtual.exp_next || 100);

    setText('lwNivel', nivel);

    const lwTitulo = document.getElementById('lwTitulo');
    if (lwTitulo) {
        const idx = Math.min(Math.floor(nivel / 5), TITULOS_NIVEL.length - 1);
        lwTitulo.textContent = TITULOS_NIVEL[idx];
    }

    const pct = expProx > 0 ? Math.min((exp / expProx) * 100, 100) : 0;
    const lwExpFill = document.getElementById('lwExpFill');
    if (lwExpFill) lwExpFill.style.width = pct + '%';

    setText('lwExpAtual', Math.floor(exp));
    setText('lwExpProx', Math.floor(expProx));

    const hp = parseFloat(usuarioAtual.hp || usuarioAtual.hp_atual || 100);
    const hpMax = parseFloat(usuarioAtual.max_hp || usuarioAtual.hp_max || 100);
    const mp = parseFloat(usuarioAtual.mp || usuarioAtual.mp_atual || 50);
    const mpMax = parseFloat(usuarioAtual.max_mp || usuarioAtual.mp_max || 50);
    const sm = parseFloat(usuarioAtual.sm || usuarioAtual.sm_atual || 100);
    const smMax = parseFloat(usuarioAtual.max_sm || usuarioAtual.sm_max || 100);
    const atk = parseFloat(usuarioAtual.atk || usuarioAtual.ataque_base || 0);
    const def = parseFloat(usuarioAtual.def || usuarioAtual.defesa_base || 0);
    const mag = parseFloat(usuarioAtual.mag || usuarioAtual.magia_base || 0);

    setText('lwHp', `${Math.floor(hp)}/${Math.floor(hpMax)}`);
    setText('lwMp', `${Math.floor(mp)}/${Math.floor(mpMax)}`);
    setText('lwSm', `${Math.floor(sm)}/${Math.floor(smMax)}`);
    setText('lwAtk', Math.floor(atk));
    setText('lwDef', Math.floor(def));
    setText('lwMag', Math.floor(mag));
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

// ==================== RENDERIZAR MERCADO ====================
function renderizarMercado() {
    const grid = document.getElementById('marketGrid');
    if (!grid) return;
    grid.innerHTML = '';

    // Filtro por categoria
    const filtro = document.createElement('div');
    filtro.style.cssText = 'grid-column: 1 / -1; display:flex; gap:8px; flex-wrap:wrap; margin-bottom:12px;';
    filtro.innerHTML = `
        <button type="button" class="btn btn-buy" data-filtro="todos">Todos</button>
        <button type="button" class="btn btn-buy" data-filtro="semente">🌱 Sementes</button>
        <button type="button" class="btn btn-buy" data-filtro="consumivel">💧 Consumíveis</button>
        <button type="button" class="btn btn-buy" data-filtro="upgrade">🪣 Upgrades</button>
        <button type="button" class="btn btn-buy" data-filtro="especial">🔒 Especiais</button>
        <button type="button" class="btn btn-buy" data-filtro="recurso">💎 Recursos</button>
    `;
    grid.appendChild(filtro);

    const container = document.createElement('div');
    container.style.cssText = 'display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:16px; grid-column: 1 / -1;';
    grid.appendChild(container);

    ITENS_DISPONIVEIS.forEach(item => {
        const card = document.createElement('div');
        card.className = 'market-item';
        card.dataset.tipo = item.tipo;
        card.innerHTML = `
            <div class="item-header">
                <div class="item-icon">${item.icone}</div>
                <div>
                    <div class="item-name">${item.nome}</div>
                    <div class="item-sub">${item.sub}</div>
                </div>
            </div>
            <div class="item-price">R$ ${formatarMoeda(item.preco)} <span>/ unidade</span></div>
            <div class="item-price" style="color:var(--neon-green); font-size:0.8rem;">
                Venda: R$ ${formatarMoeda(item.preco * 0.7)}
            </div>
            <div class="item-stock">Estoque: <strong>∞</strong> | Limite: <strong>${item.stockMax}</strong></div>
            <div class="item-actions">
                <div class="qty-group">
                    <input type="number" class="qty-input" id="qty_${item.id}" value="1" min="1" max="${item.stockMax}">
                </div>
                <button type="button" class="btn btn-buy" data-id="${item.id}">
                    <i class="fas fa-shopping-cart"></i> Comprar
                </button>
                <button type="button" class="btn btn-sell" data-id="${item.id}">
                    <i class="fas fa-coins"></i> Vender
                </button>
                <button type="button" class="btn btn-trade" data-id="${item.id}">
                    <i class="fas fa-exchange-alt"></i> Trocar
                </button>
            </div>
        `;
        container.appendChild(card);
    });

    filtro.querySelectorAll('[data-filtro]').forEach(btn => {
        btn.addEventListener('click', () => {
            const f = btn.dataset.filtro;
            container.querySelectorAll('.market-item').forEach(el => {
                el.style.display = (f === 'todos' || el.dataset.tipo === f) ? '' : 'none';
            });
        });
    });

    container.querySelectorAll('.btn-buy').forEach(btn => {
        btn.addEventListener('click', () => comprarItem(btn.dataset.id));
    });
    container.querySelectorAll('.btn-sell').forEach(btn => {
        btn.addEventListener('click', () => venderItem(btn.dataset.id));
    });
    container.querySelectorAll('.btn-trade').forEach(btn => {
        btn.addEventListener('click', () => abrirTroca(btn.dataset.id));
    });
}

// ==================== COMPRAR ITEM ====================
async function comprarItem(itemId) {
    if (!usuarioAtual) { mostrarToast('❌ Usuário não carregado'); return; }

    const item = ITENS_DISPONIVEIS.find(i => i.id === itemId);
    if (!item) { mostrarToast('❌ Item não encontrado'); return; }

    const qty = parseInt(document.getElementById(`qty_${itemId}`)?.value || 1);
    if (isNaN(qty) || qty < 1) { mostrarToast('⚠️ Quantidade inválida'); return; }
    if (qty > item.stockMax) { mostrarToast(`⚠️ Limite máximo: ${item.stockMax}`); return; }

    const custoTotal = item.preco * qty;
    const saldoAtual = parseFloat(usuarioAtual.saldo || 0);

    if (saldoAtual < custoTotal) {
        mostrarToast(`❌ Saldo insuficiente. Necessário: R$ ${formatarMoeda(custoTotal)}`);
        return;
    }

    try {
        const novoSaldo = saldoAtual - custoTotal;
        const itensAtuais = Array.isArray(usuarioAtual.itens) ? [...usuarioAtual.itens] : [];
        const idx = itensAtuais.findIndex(i => i.id === itemId);

        if (idx >= 0) itensAtuais[idx].qtd = (itensAtuais[idx].qtd || 0) + qty;
        else itensAtuais.push({ id: itemId, nome: item.nome, icone: item.icone, qtd: qty, tipo: item.tipo });

        let novasSeeds = parseInt(usuarioAtual.seeds || 0);
        if (item.tipo === 'semente') novasSeeds += qty;

        const { error } = await supabaseClient.from(TABELA).update({
            saldo: novoSaldo,
            itens: itensAtuais,
            seeds: novasSeeds,
            updated_at: new Date().toISOString()
        }).eq('id', usuarioAtual.id);

        if (error) throw error;

        usuarioAtual.saldo = novoSaldo;
        usuarioAtual.itens = itensAtuais;
        usuarioAtual.seeds = novasSeeds;

        atualizarUIUsuario();
        await carregarInventario();
        mostrarToast(`✅ Comprou ${qty}x ${item.nome} por R$ ${formatarMoeda(custoTotal)}`);
    } catch (err) {
        console.error('Erro na compra:', err);
        mostrarToast('❌ Erro ao processar compra');
    }
}

// ==================== VENDER ITEM ====================
async function venderItem(itemId) {
    if (!usuarioAtual) { mostrarToast('❌ Usuário não carregado'); return; }

    const item = ITENS_DISPONIVEIS.find(i => i.id === itemId);
    if (!item) { mostrarToast('❌ Item não encontrado'); return; }

    const qty = parseInt(document.getElementById(`qty_${itemId}`)?.value || 1);
    if (isNaN(qty) || qty < 1) { mostrarToast('⚠️ Quantidade inválida'); return; }

    const itensAtuais = Array.isArray(usuarioAtual.itens) ? [...usuarioAtual.itens] : [];
    const idx = itensAtuais.findIndex(i => i.id === itemId);

    if (idx < 0 || (itensAtuais[idx].qtd || 0) < qty) {
        mostrarToast(`❌ Você não tem ${qty}x ${item.nome} no estoque`);
        return;
    }

    const valorVenda = item.preco * 0.7 * qty;
    const saldoAtual = parseFloat(usuarioAtual.saldo || 0);

    try {
        itensAtuais[idx].qtd -= qty;
        if (itensAtuais[idx].qtd <= 0) itensAtuais.splice(idx, 1);

        const novoSaldo = saldoAtual + valorVenda;
        let novasSeeds = parseInt(usuarioAtual.seeds || 0);
        if (item.tipo === 'semente') novasSeeds = Math.max(0, novasSeeds - qty);

        const { error } = await supabaseClient.from(TABELA).update({
            saldo: novoSaldo,
            itens: itensAtuais,
            seeds: novasSeeds,
            updated_at: new Date().toISOString()
        }).eq('id', usuarioAtual.id);

        if (error) throw error;

        usuarioAtual.saldo = novoSaldo;
        usuarioAtual.itens = itensAtuais;
        usuarioAtual.seeds = novasSeeds;

        atualizarUIUsuario();
        await carregarInventario();
        mostrarToast(`✅ Vendeu ${qty}x ${item.nome} por R$ ${formatarMoeda(valorVenda)}`);
    } catch (err) {
        console.error('Erro na venda:', err);
        mostrarToast('❌ Erro ao processar venda');
    }
}

// ==================== ABRIR MODAL DE TROCA ====================
function abrirTroca(itemId) {
    const item = ITENS_DISPONIVEIS.find(i => i.id === itemId);
    if (!item || !usuarioAtual) return;

    const temItem = (usuarioAtual.itens || []).find(i => i.id === itemId);

    const modal = document.createElement('div');
    modal.id = 'modalTroca';
    modal.style.cssText = `
        position: fixed; inset: 0; background: rgba(0,0,0,0.85);
        display: flex; justify-content: center; align-items: center;
        z-index: 10000; padding: 20px; backdrop-filter: blur(4px);
    `;

    const opcoesJogadores = todosJogadores.map(j =>
        `<option value="${j.id}">${j.nome || j.login} (Nv.${j.nivel || 0})</option>`
    ).join('');

    modal.innerHTML = `
        <div style="background:var(--bg-card); border:1px solid rgba(0,255,136,0.15); border-radius:20px; padding:24px; max-width:500px; width:100%; box-shadow:var(--shadow-card);">
            <h3 style="font-family:'Orbitron',monospace; color:var(--neon-green); margin-bottom:16px;">
                <i class="fas fa-exchange-alt"></i> Trocar ${item.icone} ${item.nome}
            </h3>

            <label style="display:block; font-size:0.8rem; color:var(--text-muted); margin-bottom:6px;">Jogador destino:</label>
            <select id="tradePlayer" style="width:100%; padding:10px; background:var(--bg-input); border:1px solid rgba(0,255,136,0.1); border-radius:10px; color:var(--text-primary); font-family:'Rajdhani'; margin-bottom:14px;">
                <option value="">-- Selecione --</option>
                ${opcoesJogadores}
            </select>

            <label style="display:block; font-size:0.8rem; color:var(--text-muted); margin-bottom:6px;">Quantidade a enviar (você tem: ${temItem?.qtd || 0}):</label>
            <input type="number" id="tradeQty" value="1" min="1" max="${temItem?.qtd || 1}" style="width:100%; padding:10px; background:var(--bg-input); border:1px solid rgba(0,255,136,0.1); border-radius:10px; color:var(--text-primary); font-family:'Share Tech Mono'; margin-bottom:14px;">

            <label style="display:block; font-size:0.8rem; color:var(--text-muted); margin-bottom:6px;">Pedir em troca (opcional):</label>
            <select id="tradeRequestItem" style="width:100%; padding:10px; background:var(--bg-input); border:1px solid rgba(0,255,136,0.1); border-radius:10px; color:var(--text-primary); font-family:'Rajdhani'; margin-bottom:10px;">
                <option value="">-- Nada --</option>
                ${ITENS_DISPONIVEIS.map(i => `<option value="${i.id}">${i.icone} ${i.nome}</option>`).join('')}
            </select>
            <input type="number" id="tradeRequestQty" value="0" min="0" placeholder="Qtd pedida" style="width:100%; padding:10px; background:var(--bg-input); border:1px solid rgba(0,255,136,0.1); border-radius:10px; color:var(--text-primary); font-family:'Share Tech Mono'; margin-bottom:10px;">

            <label style="display:block; font-size:0.8rem; color:var(--text-muted); margin-bottom:6px;">Ou pedir saldo (R$):</label>
            <input type="number" id="tradeRequestSaldo" value="0" min="0" step="0.01" style="width:100%; padding:10px; background:var(--bg-input); border:1px solid rgba(0,255,136,0.1); border-radius:10px; color:var(--text-primary); font-family:'Share Tech Mono'; margin-bottom:16px;">

            <div style="display:flex; gap:10px; justify-content:flex-end;">
                <button type="button" id="btnCancelarTroca" class="btn" style="background:rgba(255,68,68,0.1); color:#ff8888; border:1px solid rgba(255,68,68,0.2);">Cancelar</button>
                <button type="button" id="btnConfirmarTroca" class="btn btn-buy">Confirmar Troca</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.getElementById('btnCancelarTroca').onclick = () => modal.remove();
    document.getElementById('btnConfirmarTroca').onclick = () => confirmarTroca(itemId, modal);
}

// ==================== CONFIRMAR TROCA ====================
async function confirmarTroca(itemId, modal) {
    const destinoId = parseInt(document.getElementById('tradePlayer').value);
    const qty = parseInt(document.getElementById('tradeQty').value || 0);
    const requestItemId = document.getElementById('tradeRequestItem').value;
    const requestQty = parseInt(document.getElementById('tradeRequestQty').value || 0);
    const requestSaldo = parseFloat(document.getElementById('tradeRequestSaldo').value || 0);

    if (!destinoId) { mostrarToast('⚠️ Selecione um jogador'); return; }
    if (qty < 1) { mostrarToast('⚠️ Quantidade inválida'); return; }

    const item = ITENS_DISPONIVEIS.find(i => i.id === itemId);
    if (!item) return;

    const itensAtuais = Array.isArray(usuarioAtual.itens) ? [...usuarioAtual.itens] : [];
    const idx = itensAtuais.findIndex(i => i.id === itemId);

    if (idx < 0 || (itensAtuais[idx].qtd || 0) < qty) {
        mostrarToast(`❌ Você não tem ${qty}x ${item.nome}`);
        return;
    }

    try {
        const { data: destino, error: errDest } = await supabaseClient
            .from(TABELA).select('*').eq('id', destinoId).single();
        if (errDest) throw errDest;

        if (requestItemId && requestQty > 0) {
            const itemPedido = ITENS_DISPONIVEIS.find(i => i.id === requestItemId);
            const itensDestino = Array.isArray(destino.itens) ? [...destino.itens] : [];
            const idxPed = itensDestino.findIndex(i => i.id === requestItemId);

            if (idxPed < 0 || (itensDestino[idxPed].qtd || 0) < requestQty) {
                mostrarToast(`❌ ${destino.nome || destino.login} não tem ${requestQty}x ${itemPedido?.nome}`);
                return;
            }
        }

        if (requestSaldo > 0 && parseFloat(destino.saldo || 0) < requestSaldo) {
            mostrarToast(`❌ ${destino.nome || destino.login} não tem R$ ${formatarMoeda(requestSaldo)}`);
            return;
        }

        // === EXECUTAR TROCA ===
        itensAtuais[idx].qtd -= qty;
        if (itensAtuais[idx].qtd <= 0) itensAtuais.splice(idx, 1);

        if (requestItemId && requestQty > 0) {
            const idxRec = itensAtuais.findIndex(i => i.id === requestItemId);
            const itemPedido = ITENS_DISPONIVEIS.find(i => i.id === requestItemId);
            if (idxRec >= 0) itensAtuais[idxRec].qtd = (itensAtuais[idxRec].qtd || 0) + requestQty;
            else itensAtuais.push({ id: requestItemId, nome: itemPedido.nome, icone: itemPedido.icone, qtd: requestQty, tipo: itemPedido.tipo });
        }

        let novoSaldoRemetente = parseFloat(usuarioAtual.saldo || 0);
        if (requestSaldo > 0) novoSaldoRemetente += requestSaldo;

        let novasSeedsRemetente = parseInt(usuarioAtual.seeds || 0);
        if (item.tipo === 'semente') novasSeedsRemetente = Math.max(0, novasSeedsRemetente - qty);
        if (requestItemId) {
            const itemPedido = ITENS_DISPONIVEIS.find(i => i.id === requestItemId);
            if (itemPedido?.tipo === 'semente') novasSeedsRemetente += requestQty;
        }

        const itensDestino = Array.isArray(destino.itens) ? [...destino.itens] : [];
        const idxDestItem = itensDestino.findIndex(i => i.id === itemId);

        if (idxDestItem >= 0) itensDestino[idxDestItem].qtd = (itensDestino[idxDestItem].qtd || 0) + qty;
        else itensDestino.push({ id: itemId, nome: item.nome, icone: item.icone, qtd: qty, tipo: item.tipo });

        if (requestItemId && requestQty > 0) {
            const idxRem = itensDestino.findIndex(i => i.id === requestItemId);
            if (idxRem >= 0) {
                itensDestino[idxRem].qtd -= requestQty;
                if (itensDestino[idxRem].qtd <= 0) itensDestino.splice(idxRem, 1);
            }
        }

        let novoSaldoDestino = parseFloat(destino.saldo || 0);
        if (requestSaldo > 0) novoSaldoDestino -= requestSaldo;

        let novasSeedsDestino = parseInt(destino.seeds || 0);
        if (item.tipo === 'semente') novasSeedsDestino += qty;
        if (requestItemId) {
            const itemPedido = ITENS_DISPONIVEIS.find(i => i.id === requestItemId);
            if (itemPedido?.tipo === 'semente') novasSeedsDestino = Math.max(0, novasSeedsDestino - requestQty);
        }

        const [updRem, updDest] = await Promise.all([
            supabaseClient.from(TABELA).update({
                itens: itensAtuais, saldo: novoSaldoRemetente, seeds: novasSeedsRemetente,
                updated_at: new Date().toISOString()
            }).eq('id', usuarioAtual.id),
            supabaseClient.from(TABELA).update({
                itens: itensDestino, saldo: novoSaldoDestino, seeds: novasSeedsDestino,
                updated_at: new Date().toISOString()
            }).eq('id', destinoId)
        ]);

        if (updRem.error) throw updRem.error;
        if (updDest.error) throw updDest.error;

        usuarioAtual.itens = itensAtuais;
        usuarioAtual.saldo = novoSaldoRemetente;
        usuarioAtual.seeds = novasSeedsRemetente;

        atualizarUIUsuario();
        await carregarInventario();
        await carregarTodosJogadores();

        modal.remove();
        mostrarToast(`✅ Troca realizada com ${destino.nome || destino.login}!`);
    } catch (err) {
        console.error('Erro na troca:', err);
        mostrarToast('❌ Erro ao processar troca');
    }
}

// ==================== CARREGAR INVENTÁRIO ====================
async function carregarInventario() {
    const grid = document.getElementById('inventoryGrid');
    if (!grid) return;

    if (!usuarioAtual) {
        grid.innerHTML = '<span style="color:var(--text-muted); font-size:0.8rem;">Carregando...</span>';
        return;
    }

    const itens = Array.isArray(usuarioAtual.itens) ? usuarioAtual.itens : [];

    if (itens.length === 0) {
        grid.innerHTML = '<span style="color:var(--text-muted); font-size:0.8rem;">Estoque vazio</span>';
        return;
    }

    grid.innerHTML = '';
    itens.forEach(item => {
        const el = document.createElement('div');
        el.className = 'inv-item';
        el.style.cursor = 'pointer';
        el.title = 'Clique para trocar';
        el.innerHTML = `${item.icone || '📦'} ${item.nome || item.id} <span class="qty">x${item.qtd || 0}</span>`;
        el.onclick = () => {
            const itemMercado = ITENS_DISPONIVEIS.find(i => i.id === item.id);
            if (itemMercado) abrirTroca(item.id);
            else mostrarToast('⚠️ Este item não pode ser trocado');
        };
        grid.appendChild(el);
    });
}

// ==================== UTILITÁRIOS ====================
function formatarMoeda(valor) {
    return parseFloat(valor || 0).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function mostrarToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => toast.classList.remove('show'), 3000);
}