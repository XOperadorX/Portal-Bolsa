// ====================================================================
//  IMPORTAÇÕES
// ====================================================================
import { createClient } from '@supabase/supabase-js';

// ====================================================================
//  CONFIGURAÇÕES - USANDO APENAS A TABELA "Geral"
// ====================================================================
const SUPABASE_URL  = 'https://xrcxvizzdumcxbylmkvn.supabase.co';
const SUPABASE_KEY  = 'sb_publishable_E-g3G3wW4EySbCsXLXp8KQ_FnmERMcD';
const supabase      = createClient(SUPABASE_URL, SUPABASE_KEY);
const TABELA        = 'Geral';
const BRAPI_TOKEN   = 'uFgACspaiXowFi5JF9UhUZ';
const BRAPI_BASE    = 'https://brapi.dev/api';
const MOEDA         = 'Mumu';

// ====================================================================
//  DADOS DO USUÁRIO (definido ANTES de ser usado)
// ====================================================================
const usuarioLogado = localStorage.getItem('usuario_logado');
if (!usuarioLogado) {
    window.location.href = 'login.html';
}

let usuario = null;
try {
    usuario = JSON.parse(usuarioLogado);
    if (!usuario || !usuario.id) {
        throw new Error('Usuário inválido');
    }
    const avatar = document.getElementById('userAvatar');
    avatar.textContent = usuario.nome ? usuario.nome.charAt(0).toUpperCase() : '👤';
    document.getElementById('usuarioLogado').textContent = usuario.nome || usuario.login;
} catch (e) {
    console.error('Erro ao parsear usuário:', e);
    window.location.href = 'login.html';
}

// ====================================================================
//  TOAST / JANELA FLUTUANTE
// ====================================================================
function mostrarToast(mensagem, tipo = 'erro', titulo = '') {
    const container = document.getElementById('toastContainer');
    
    const tipos = {
        erro: { icon: '❌', title: titulo || 'Erro' },
        sucesso: { icon: '✅', title: titulo || 'Sucesso' },
        atencao: { icon: '⚠️', title: titulo || 'Atenção' }
    };

    const config = tipos[tipo] || tipos.erro;

    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.innerHTML = `
        <span class="toast-icon">${config.icon}</span>
        <div class="toast-content">
            <div class="toast-title">${config.title}</div>
            <div class="toast-message">${mensagem}</div>
        </div>
        <button class="toast-close">✕</button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.classList.add('toast-hide');
        setTimeout(() => toast.remove(), 400);
    });

    container.appendChild(toast);

    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.add('toast-hide');
            setTimeout(() => toast.remove(), 400);
        }
    }, 4000);
}

// ====================================================================
//  ESTADO DO JOGO
// ====================================================================
let saldo                      = 0.00;
let proventosPendentes         = 0.0;
let saldoPoupanca              = 0.00;
let rendimentosPoupancaAcumulados = 0.0;
let apiOnline                  = false;
let verificandoAPI             = false;
let supabaseOnline             = true;
let dadosCarregados            = false;
let selicAtual                 = 10.75;

// RPG - Todos os atributos agora são salvos na tabela Geral
let nivel = 1;
let experiencia = 0;
let exp_proximo = 100;
let hp_max = 100;
let mp_max = 50;
let sm_max = 100;
let hp_atual = 100;
let mp_atual = 50;
let sm_atual = 100;
let ataque_base = 15;
let defesa_base = 10;
let magia_base = 8;

// ====================================================================
//  DADOS DOS ATIVOS
// ====================================================================
const acoes = [
    { ticker: "PETR4", nome: "Petrobras",   tipo: "Ação", preco: 34.50, dividendoUnitario: 0.32, categoria: "Acao" },
    { ticker: "VALE3", nome: "Vale",        tipo: "Ação", preco: 58.90, dividendoUnitario: 0.45, categoria: "Acao" },
    { ticker: "ITUB4", nome: "Itaú",        tipo: "Ação", preco: 31.20, dividendoUnitario: 0.28, categoria: "Acao" }
];

const fiis = [
    { ticker: "MXRF11", nome: "Maxi Renda",    tipo: "FII", preco: 9.90,  dividendoUnitario: 0.11, categoria: "FII" },
    { ticker: "XPML11", nome: "XP Malls",      tipo: "FII", preco: 98.40, dividendoUnitario: 0.92, categoria: "FII" },
    { ticker: "HGLG11", nome: "Hedge Logística", tipo: "FII", preco: 156.00, dividendoUnitario: 1.35, categoria: "FII" }
];

const etfs = [
    { ticker: "BOVA11", nome: "Ibovespa",   tipo: "ETF", preco: 121.00, dividendoUnitario: 0.52, categoria: "ETF" },
    { ticker: "IVVB11", nome: "S&P 500",    tipo: "ETF", preco: 330.00, dividendoUnitario: 2.10, categoria: "ETF" }
];

const tesouros = [
    { ticker: "TESOURO SELIC",   nome: "Tesouro Selic",   tipo: "Tesouro Selic", preco: 100.50, vencimento: "2027", dividendoUnitario: 0, categoria: "Tesouro" },
    { ticker: "TESOURO IPCA+",   nome: "Tesouro IPCA+",   tipo: "Tesouro IPCA+", preco: 280.30, vencimento: "2035", dividendoUnitario: 0, categoria: "Tesouro" },
    { ticker: "TESOURO PREFIXADO", nome: "Prefixado",     tipo: "Prefixado",   preco: 850.00, vencimento: "2031", dividendoUnitario: 0, categoria: "Tesouro" }
];

let todosAtivos = [...acoes, ...fiis, ...etfs, ...tesouros];
let carteira          = {};
let precoMedioCompra  = {};
let proventosPorAtivo = {};
const precoHistorico  = {};

const tickersBrapi = {
    'PETR4': 'PETR4', 'VALE3': 'VALE3', 'ITUB4': 'ITUB4',
    'MXRF11': 'MXRF11', 'XPML11': 'XPML11', 'HGLG11': 'HGLG11',
    'BOVA11': 'BOVA11', 'IVVB11': 'IVVB11'
};

// ====================================================================
//  FUNÇÕES AUXILIARES
// ====================================================================
function formatarMoeda(valor) {
    return `${valor.toFixed(2)} ${MOEDA}`;
}

function getValorInput() {
    let val = parseFloat(document.getElementById("valorPoupanca").value);
    return (isNaN(val) || val <= 0) ? 0 : val;
}

// ====================================================================
//  FUNÇÕES DE REGISTRO (EXTRATO)
// ====================================================================
function registrar(texto, tipo = "operacao") {
    const historicoUl = document.getElementById("historico");
    const li = document.createElement("li");
    const horario = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit', second:'2-digit' });
    li.innerHTML = `<span style="font-weight:500; color: var(--neon-blue);">[${horario}]</span> ${texto}`;
    if (tipo === "provento") {
        li.classList.add("provento-item");
    } else if (tipo === "transferencia") {
        li.classList.add("transferencia-item");
    } else if (tipo === "poupanca") {
        li.classList.add("poupanca-item");
    } else {
        li.style.borderLeft = "3px solid var(--neon-blue)";
        li.style.paddingLeft = "12px";
    }
    historicoUl.prepend(li);
    if (historicoUl.children.length > 70) historicoUl.removeChild(historicoUl.lastChild);
}

// ====================================================================
//  INICIALIZAÇÃO DE ESTRUTURAS
// ====================================================================
function initEstruturas() {
    todosAtivos.forEach(a => {
        carteira[a.ticker]          = 0;
        proventosPorAtivo[a.ticker] = 0;
        precoMedioCompra[a.ticker]  = 0;
        precoHistorico[a.ticker]    = a.preco;
    });
}

// ====================================================================
//  SUPABASE – CRUD (TUDO NA TABELA "Geral")
// ====================================================================
async function carregarDadosDoSupabase() {
    try {
        const userId = usuario.id;
        const { data, error } = await supabase
            .from(TABELA)
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                await criarRegistroInicial(userId);
                return;
            }
            throw error;
        }

        if (data) {
            // ===== FINANCEIRO =====
            saldo              = data.saldo !== null && data.saldo !== undefined ? parseFloat(data.saldo) : 0.00;
            saldoPoupanca      = data.saldo_poupanca !== null && data.saldo_poupanca !== undefined ? parseFloat(data.saldo_poupanca) : 0.00;
            proventosPendentes = data.proventos_pendentes !== null && data.proventos_pendentes !== undefined ? parseFloat(data.proventos_pendentes) : 0.0;

            // ===== CARTEIRA =====
            if (data.carteira) {
                Object.keys(data.carteira).forEach(key => {
                    if (carteira[key] !== undefined) carteira[key] = data.carteira[key] || 0;
                });
            }
            if (data.preco_medio_compra) {
                Object.keys(data.preco_medio_compra).forEach(key => {
                    if (precoMedioCompra[key] !== undefined) precoMedioCompra[key] = data.preco_medio_compra[key] || 0;
                });
            }
            if (data.proventos_por_ativo) {
                Object.keys(data.proventos_por_ativo).forEach(key => {
                    if (proventosPorAtivo[key] !== undefined) proventosPorAtivo[key] = data.proventos_por_ativo[key] || 0;
                });
            }

            // ===== RPG =====
            nivel = data.nivel || 1;
            experiencia = data.experiencia || 0;
            exp_proximo = data.exp_proximo || 100;
            hp_max = data.hp_max || 100;
            mp_max = data.mp_max || 50;
            sm_max = data.sm_max || 40;
            hp_atual = data.hp_atual || 100;
            mp_atual = data.mp_atual || 50;
            sm_atual = data.sm_atual || 100;
            ataque_base = data.ataque_base || 15;
            defesa_base = data.defesa_base || 10;
            magia_base = data.magia_base || 8;

            // ===== SELIC =====
            if (data.selic) {
                selicAtual = parseFloat(data.selic);
            }

            dadosCarregados = true;
            registrar('📂 Dados carregados do Supabase!', 'operacao');
            
            atualizarDisplayRPG();
            
            return true;
        }
        return false;
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        return false;
    }
}

async function criarRegistroInicial(userId) {
    try {
        const estadoInicial = {
            id: userId,
            saldo: 0.00,
            saldo_poupanca: 0.00,
            proventos_pendentes: 0.0,
            carteira: {},
            preco_medio_compra: {},
            proventos_por_ativo: {},
            nivel: 1,
            experiencia: 0,
            exp_proximo: 100,
            hp_max: 100,
            mp_max: 50,
            sm_max: 40,
            hp_atual: 100,
            mp_atual: 50,
            sm_atual: 100,
            ataque_base: 15,
            defesa_base: 10,
            magia_base: 8,
            selic: 10.75
        };

        const { error } = await supabase
            .from(TABELA)
            .insert(estadoInicial);

        if (error) throw error;
        
        saldo = 0.00;
        saldoPoupanca = 0.00;
        proventosPendentes = 0.0;
        dadosCarregados = true;
        
        registrar('📂 Registro inicial criado no Supabase!', 'operacao');
        return true;
    } catch (error) {
        console.error('Erro ao criar registro inicial:', error);
        return false;
    }
}

async function salvarDadosNoSupabase() {
    try {
        const userId = usuario.id;
        const { error } = await supabase
            .from(TABELA)
            .update({
                saldo: parseFloat(saldo.toFixed(2)),
                saldo_poupanca: parseFloat(saldoPoupanca.toFixed(2)),
                proventos_pendentes: parseFloat(proventosPendentes.toFixed(2)),
                carteira: carteira,
                preco_medio_compra: precoMedioCompra,
                proventos_por_ativo: proventosPorAtivo,
                nivel: nivel,
                experiencia: experiencia,
                exp_proximo: exp_proximo,
                hp_max: hp_max,
                mp_max: mp_max,
                sm_max: sm_max,
                hp_atual: hp_atual,
                mp_atual: mp_atual,
                sm_atual: sm_atual,
                ataque_base: ataque_base,
                defesa_base: defesa_base,
                magia_base: magia_base,
                selic: parseFloat(selicAtual.toFixed(2))
            })
            .eq('id', userId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
        return false;
    }
}

// ====================================================================
//  FUNÇÕES RPG
// ====================================================================
function atualizarDisplayRPG() {
    document.getElementById('lwHp').textContent = `${hp_atual}/${hp_max}`;
    document.getElementById('lwMp').textContent = `${mp_atual}/${mp_max}`;
    document.getElementById('lwSm').textContent = `${sm_atual}/${sm_max}`;
    document.getElementById('lwAtk').textContent = ataque_base;
    document.getElementById('lwDef').textContent = defesa_base;
    document.getElementById('lwMag').textContent = magia_base;
}

// ====================================================================
//  STATUS
// ====================================================================
function atualizarStatusInternet(online) {
    const statusEl = document.getElementById('statusInternet');
    const textoEl  = document.getElementById('statusInternetTexto');
    const dotEl    = statusEl.querySelector('.status-dot');
    if (online) {
        statusEl.className = 'status-item status-online';
        textoEl.textContent = '🌐 Net';
        dotEl.className = 'status-dot online';
    } else {
        statusEl.className = 'status-item status-offline';
        textoEl.textContent = '🌐 Net';
        dotEl.className = 'status-dot offline';
    }
}

function atualizarStatusAPI(online, mensagem = null) {
    const statusEl = document.getElementById('statusAPI');
    const textoEl  = document.getElementById('statusAPITexto');
    const dotEl    = statusEl.querySelector('.status-dot');
    if (verificandoAPI) {
        statusEl.className = 'status-item status-checking';
        textoEl.textContent = '📊 API';
        dotEl.className = 'status-dot';
        return;
    }
    if (online) {
        statusEl.className = 'status-item status-online';
        textoEl.textContent = '📊 API';
        dotEl.className = 'status-dot online';
    } else {
        statusEl.className = 'status-item status-offline';
        textoEl.textContent = '📊 API';
        dotEl.className = 'status-dot offline';
    }
}

function atualizarStatusSupabase(online, mensagem = null) {
    const statusEl = document.getElementById('statusSupabase');
    const textoEl  = document.getElementById('statusSupabaseTexto');
    const dotEl    = statusEl.querySelector('.status-dot');
    if (online) {
        statusEl.className = 'status-item status-online';
        textoEl.textContent = '☁️ Supabase';
        dotEl.className = 'status-dot online';
    } else {
        statusEl.className = 'status-item status-offline';
        textoEl.textContent = '☁️ Supabase';
        dotEl.className = 'status-dot offline';
    }
}

// ====================================================================
//  VERIFICAÇÕES DE CONEXÃO
// ====================================================================
async function verificarSupabase() {
    try {
        const { error } = await supabase.from(TABELA).select('id').limit(1);
        if (error) { supabaseOnline = false; atualizarStatusSupabase(false); return false; }
        supabaseOnline = true;
        atualizarStatusSupabase(true);
        return true;
    } catch (error) {
        supabaseOnline = false;
        atualizarStatusSupabase(false);
        return false;
    }
}

async function verificarAPI() {
    if (verificandoAPI) return false;
    verificandoAPI = true;
    atualizarStatusAPI(false);
    try {
        const response = await fetch(`${BRAPI_BASE}/available?token=${BRAPI_TOKEN}`);
        if (response.ok) {
            apiOnline = true;
            atualizarStatusAPI(true);
            return true;
        } else {
            apiOnline = false;
            atualizarStatusAPI(false);
            return false;
        }
    } catch (error) {
        apiOnline = false;
        atualizarStatusAPI(false);
        return false;
    } finally {
        verificandoAPI = false;
    }
}

// ====================================================================
//  BUSCA DE PREÇOS NA API
// ====================================================================
async function buscarPrecosAPI() {
    if (!navigator.onLine) {
        atualizarStatusInternet(false);
        return false;
    }
    atualizarStatusInternet(true);
    const apiOk = await verificarAPI();
    if (!apiOk) return false;

    try {
        const tickersList = Object.values(tickersBrapi).join(',');
        const response = await fetch(`${BRAPI_BASE}/quote/${tickersList}?token=${BRAPI_TOKEN}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            data.results.forEach(item => {
                const ticker = item.symbol;
                const preco = item.regularMarketPrice || item.price || item.close;
                if (preco && preco > 0) {
                    const ativoAcao = acoes.find(a => a.ticker === ticker);
                    if (ativoAcao) { precoHistorico[ativoAcao.ticker] = ativoAcao.preco; ativoAcao.preco = parseFloat(preco.toFixed(2)); }
                    const ativoFII = fiis.find(a => a.ticker === ticker);
                    if (ativoFII) { precoHistorico[ativoFII.ticker] = ativoFII.preco; ativoFII.preco = parseFloat(preco.toFixed(2)); }
                    const ativoETF = etfs.find(a => a.ticker === ticker);
                    if (ativoETF) { precoHistorico[ativoETF.ticker] = ativoETF.preco; ativoETF.preco = parseFloat(preco.toFixed(2)); }
                }
            });
            return true;
        }
        return false;
    } catch (error) {
        console.error('Erro ao buscar dados da API:', error);
        return false;
    }
}

// ====================================================================
//  VARIAÇÃO DE PREÇOS (OFFLINE)
// ====================================================================
function variarPrecosOffline(ativos, min, max, fator = 3.4) {
    ativos.forEach(ativo => {
        let variacaoPerc = (Math.random() - 0.48) * fator;
        let novoPreco = ativo.preco * (1 + variacaoPerc / 100);
        if (novoPreco < min) novoPreco = min;
        if (novoPreco > max) novoPreco = max;
        precoHistorico[ativo.ticker] = ativo.preco;
        ativo.preco = parseFloat(novoPreco.toFixed(2));
    });
}

function variarPrecosOfflineAcoes()   { variarPrecosOffline(acoes, 1.0, 1500, 3.4); renderAcoes(); }
function variarPrecosOfflineFIIs()    { variarPrecosOffline(fiis, 1.0, 500, 3.0); renderFIIs(); }
function variarPrecosOfflineETFs()    { variarPrecosOffline(etfs, 10, 1000, 2.5); renderETFs(); }
function variarPrecosTesouro()        { variarPrecosOffline(tesouros, 50, 1200, 1.3); renderTesouro(); }

// ====================================================================
//  FUNÇÕES DE COMPRA / VENDA (COM TOAST)
// ====================================================================
window.comprarAtivo = async function(ticker) {
    const ativo = todosAtivos.find(a => a.ticker === ticker);
    if (!ativo) return;
    const custo = ativo.preco;
    if (saldo >= custo) {
        saldo -= custo;
        saldo = parseFloat(saldo.toFixed(2));
        const qtdAtual = carteira[ticker] || 0;
        const precoMedAtual = precoMedioCompra[ticker] || 0;
        let novoPrecoMedio = qtdAtual === 0 ? custo : ((precoMedAtual * qtdAtual) + custo) / (qtdAtual + 1);
        carteira[ticker] = qtdAtual + 1;
        precoMedioCompra[ticker] = novoPrecoMedio;
        registrar(`✅ Comprou 1 ${ticker} por ${formatarMoeda(custo)}.`);
        mostrarToast(`Comprou 1 ${ticker} por ${formatarMoeda(custo)}`, 'sucesso', '✅ Compra Realizada');
        await salvarDadosNoSupabase();
        atualizarTudo();
    } else {
        const falta = custo - saldo;
        mostrarToast(`Saldo insuficiente! Faltam ${formatarMoeda(falta)} para comprar ${ticker}.`, 'erro', '❌ Saldo Insuficiente');
        registrar(`❌ Saldo insuficiente para comprar ${ticker}.`);
    }
};

window.venderAtivo = async function(ticker) {
    const qtdAtual = carteira[ticker] || 0;
    if (qtdAtual > 0) {
        const ativo = todosAtivos.find(a => a.ticker === ticker);
        if (!ativo) return;
        const valorVenda = ativo.preco;
        saldo += valorVenda;
        saldo = parseFloat(saldo.toFixed(2));
        carteira[ticker] = qtdAtual - 1;
        if (carteira[ticker] === 0) delete precoMedioCompra[ticker];
        registrar(`📉 Vendeu 1 ${ticker} por ${formatarMoeda(valorVenda)}.`);
        mostrarToast(`Vendeu 1 ${ticker} por ${formatarMoeda(valorVenda)}`, 'sucesso', '💰 Venda Realizada');
        await salvarDadosNoSupabase();
        atualizarTudo();
    } else {
        mostrarToast(`Você não possui ${ticker} para vender.`, 'atencao', '⚠️ Sem Saldo do Ativo');
        registrar(`⚠️ Você não possui ${ticker} para vender.`);
    }
};

// ====================================================================
//  FUNÇÕES DE POUPANÇA
// ====================================================================
function aplicarPoupanca() {
    let valorAplicar = getValorInput();
    if (valorAplicar <= 0) {
        mostrarToast('Digite um valor válido para aplicar (maior que zero).', 'atencao', '⚠️ Valor Inválido');
        registrar(`⚠️ Digite um valor válido para aplicar (maior que zero).`, "operacao");
        return;
    }
    if (saldo >= valorAplicar) {
        saldo -= valorAplicar;
        saldo = parseFloat(saldo.toFixed(2));
        saldoPoupanca += valorAplicar;
        saldoPoupanca = parseFloat(saldoPoupanca.toFixed(2));
        registrar(`🏦 APLICAÇÃO POUPANÇA: ${formatarMoeda(valorAplicar)} transferidos do Saldo para a Poupança.`, "poupanca");
        mostrarToast(`${formatarMoeda(valorAplicar)} aplicado na Poupança!`, 'sucesso', '📈 Aplicação Realizada');
        salvarDadosNoSupabase();
        atualizarTudo();
    } else {
        const falta = valorAplicar - saldo;
        mostrarToast(`Saldo insuficiente! Faltam ${formatarMoeda(falta)} para aplicar.`, 'erro', '❌ Saldo Insuficiente');
        registrar(`❌ Saldo insuficiente para aplicar ${formatarMoeda(valorAplicar)}.`, "operacao");
    }
}

function resgatarPoupanca() {
    let valorResgate = getValorInput();
    if (valorResgate <= 0) {
        mostrarToast('Digite um valor válido para resgatar (maior que zero).', 'atencao', '⚠️ Valor Inválido');
        registrar(`⚠️ Digite um valor válido para resgatar (maior que zero).`, "operacao");
        return;
    }
    if (saldoPoupanca >= valorResgate) {
        saldoPoupanca -= valorResgate;
        saldo += valorResgate;
        saldo = parseFloat(saldo.toFixed(2));
        saldoPoupanca = parseFloat(saldoPoupanca.toFixed(2));
        registrar(`🏦 RESGATE POUPANÇA: ${formatarMoeda(valorResgate)} transferidos da Poupança para o Saldo.`, "poupanca");
        mostrarToast(`${formatarMoeda(valorResgate)} resgatado da Poupança!`, 'sucesso', '🏧 Resgate Realizado');
        salvarDadosNoSupabase();
        atualizarTudo();
    } else {
        const falta = valorResgate - saldoPoupanca;
        mostrarToast(`Saldo na poupança insuficiente! Faltam ${formatarMoeda(falta)}.`, 'erro', '❌ Saldo Insuficiente');
        registrar(`❌ Saldo insuficiente na poupança para resgatar ${formatarMoeda(valorResgate)}.`, "operacao");
    }
}

function renderPoupanca() {
    if (saldoPoupanca > 0) {
        const taxa = 0.006;
        const rendimento = saldoPoupanca * taxa;
        saldoPoupanca = parseFloat((saldoPoupanca + rendimento).toFixed(2));
        rendimentosPoupancaAcumulados += rendimento;
        rendimentosPoupancaAcumulados = parseFloat(rendimentosPoupancaAcumulados.toFixed(2));
        registrar(`🏦 POUPANÇA RENDEU 0,6%! Rendimento de ${formatarMoeda(rendimento)}.`, "poupanca");
        if (rendimento > 0.01) {
            mostrarToast(`Rendimento de ${formatarMoeda(rendimento)} na Poupança!`, 'sucesso', '💰 Rendimento Creditado');
        }
        salvarDadosNoSupabase();
        atualizarTudo();
    }
}

// ====================================================================
//  FUNÇÕES DE PROVENTOS
// ====================================================================
function distribuirProventos(ativos, nomeCategoria) {
    let total = 0, detalhes = [];
    for (let ticker in carteira) {
        const qtd = carteira[ticker];
        if (qtd > 0) {
            const ativo = ativos.find(a => a.ticker === ticker);
            if (ativo && ativo.dividendoUnitario > 0) {
                const valor = ativo.dividendoUnitario * qtd;
                if (valor > 0) {
                    total += valor;
                    if (!proventosPorAtivo[ticker]) proventosPorAtivo[ticker] = 0;
                    proventosPorAtivo[ticker] += valor;
                    proventosPendentes += valor;
                    detalhes.push(`${qtd} ${ticker} → ${formatarMoeda(valor)}`);
                }
            }
        }
    }
    if (total > 0) {
        registrar(`${nomeCategoria}: ${detalhes.join(' · ')} | Total: ${formatarMoeda(total)}`, "provento");
        if (total > 0.01) {
            mostrarToast(`${nomeCategoria}: ${formatarMoeda(total)} em proventos recebidos!`, 'sucesso', '🎁 Proventos Creditados');
        }
        salvarDadosNoSupabase();
    }
    atualizarCarteira();
    atualizarPatrimonio();
}

function transferirProventosParaSaldo() {
    if (proventosPendentes > 0) {
        const valor = proventosPendentes;
        saldo += valor;
        saldo = parseFloat(saldo.toFixed(2));
        registrar(`💸 TRANSFERÊNCIA: ${formatarMoeda(valor)} em proventos foi para o Saldo.`, "transferencia");
        mostrarToast(`${formatarMoeda(valor)} transferido para o Saldo!`, 'sucesso', '💰 Proventos Transferidos');
        proventosPendentes = 0;
        salvarDadosNoSupabase();
        atualizarTudo();
    } else {
        mostrarToast('Nenhum provento acumulado para transferir.', 'atencao', '⚠️ Sem Proventos');
        registrar(`⚠️ Nenhum provento acumulado.`, "operacao");
    }
}

// ====================================================================
//  RENDERIZAÇÃO DAS TABELAS
// ====================================================================
function calcularMetricas(ativo) {
    const precoAntigo = precoHistorico[ativo.ticker] || ativo.preco;
    const variacao = precoAntigo > 0 ? ((ativo.preco - precoAntigo) / precoAntigo) * 100 : 0;
    const dyAnual = ativo.dividendoUnitario > 0 ? (ativo.dividendoUnitario / ativo.preco) * 100 * 12 : 0;
    const rentabilidade = variacao + (dyAnual / 12);
    return { variacao, dyAnual, rentabilidade };
}

function renderAcoes() {
    let html = "";
    acoes.forEach(a => {
        const { variacao, dyAnual, rentabilidade } = calcularMetricas(a);
        const variacaoClass = variacao >= 0 ? 'indicator-green' : 'indicator-red';
        html += `<tr>
            <td style="font-weight:600; color: var(--neon-blue);">${a.ticker}</td>
            <td style="color: var(--neon-green);">${a.preco.toFixed(2)}</td>
            <td><span class="metric-cell ${rentabilidade >= 0 ? 'indicator-green' : 'indicator-red'}">${rentabilidade.toFixed(2)}%</span></td>
            <td><span class="metric-cell" style="color: #f59e0b;">${dyAnual.toFixed(2)}%</span></td>
            <td><span class="metric-cell ${variacaoClass}">${variacao.toFixed(2)}%</span></td>
            <td><button class="buy" onclick="comprarAtivo('${a.ticker}')">Comprar 1</button></td>
            <td><button class="sell" onclick="venderAtivo('${a.ticker}')">Vender 1</button></td>
        </tr>`;
    });
    document.getElementById("tabelaAcoes").innerHTML = html;
}

function renderFIIs() {
    let html = "";
    fiis.forEach(a => {
        const { variacao, dyAnual, rentabilidade } = calcularMetricas(a);
        const variacaoClass = variacao >= 0 ? 'indicator-green' : 'indicator-red';
        html += `<tr>
            <td style="font-weight:600; color: var(--neon-blue);">${a.ticker}</td>
            <td style="color: var(--neon-green);">${a.preco.toFixed(2)}</td>
            <td><span class="metric-cell ${rentabilidade >= 0 ? 'indicator-green' : 'indicator-red'}">${rentabilidade.toFixed(2)}%</span></td>
            <td><span class="metric-cell" style="color: #f59e0b;">${dyAnual.toFixed(2)}%</span></td>
            <td><span class="metric-cell ${variacaoClass}">${variacao.toFixed(2)}%</span></td>
            <td><button class="buy" onclick="comprarAtivo('${a.ticker}')">Comprar 1</button></td>
            <td><button class="sell" onclick="venderAtivo('${a.ticker}')">Vender 1</button></td>
        </tr>`;
    });
    document.getElementById("tabelaFIIs").innerHTML = html;
}

function renderETFs() {
    let html = "";
    etfs.forEach(a => {
        const { variacao, dyAnual, rentabilidade } = calcularMetricas(a);
        const variacaoClass = variacao >= 0 ? 'indicator-green' : 'indicator-red';
        html += `<tr>
            <td style="font-weight:600; color: var(--neon-blue);">${a.ticker}</td>
            <td style="color: var(--neon-green);">${a.preco.toFixed(2)}</td>
            <td><span class="metric-cell ${rentabilidade >= 0 ? 'indicator-green' : 'indicator-red'}">${rentabilidade.toFixed(2)}%</span></td>
            <td><span class="metric-cell" style="color: #f59e0b;">${dyAnual.toFixed(2)}%</span></td>
            <td><span class="metric-cell ${variacaoClass}">${variacao.toFixed(2)}%</span></td>
            <td><button class="buy" onclick="comprarAtivo('${a.ticker}')">Comprar 1</button></td>
            <td><button class="sell" onclick="venderAtivo('${a.ticker}')">Vender 1</button></td>
        </tr>`;
    });
    document.getElementById("tabelaETFs").innerHTML = html;
}

function renderTesouro() {
    let html = "";
    tesouros.forEach(a => {
        const { variacao, rentabilidade } = calcularMetricas(a);
        const variacaoClass = variacao >= 0 ? 'indicator-green' : 'indicator-red';
        html += `<tr>
            <td style="font-weight:600; color: var(--neon-blue);">${a.ticker}</td>
            <td style="color: #8a99ad;">${a.vencimento}</td>
            <td style="color: #f59e0b;">${a.preco.toFixed(2)}</td>
            <td><span class="metric-cell ${rentabilidade >= 0 ? 'indicator-green' : 'indicator-red'}">${rentabilidade.toFixed(2)}%</span></td>
            <td><span class="metric-cell ${variacaoClass}">${variacao.toFixed(2)}%</span></td>
            <td><button class="buy" onclick="comprarAtivo('${a.ticker}')">Comprar 1</button></td>
            <td><button class="sell" onclick="venderAtivo('${a.ticker}')">Vender 1</button></td>
        </tr>`;
    });
    document.getElementById("tabelaTesouro").innerHTML = html;
}

function atualizarCarteira() {
    const tbody = document.getElementById("carteira");
    let html = "";
    const tickersComPosse = Object.keys(carteira).filter(t => carteira[t] > 0);

    if (saldoPoupanca > 0) {
        const rendimentoPerc = (saldoPoupanca - rendimentosPoupancaAcumulados) > 0 ?
            ((rendimentosPoupancaAcumulados / (saldoPoupanca - rendimentosPoupancaAcumulados)) * 100) : 0;
        html += `<tr style="background: rgba(0, 255, 102, 0.05);">
            <td style="font-weight:700; color: var(--neon-green);">🏦 POUPANÇA</td>
            <td>${saldoPoupanca.toFixed(2)}</td>
            <td>---</td>
            <td style="color: var(--neon-green);">${formatarMoeda(saldoPoupanca)}</td>
            <td style="color: #f59e0b;">${formatarMoeda(rendimentosPoupancaAcumulados)}</td>
            <td><span class="indicator-green">${rendimentoPerc.toFixed(2)}%</span></td>
            <td>---</td>
        </tr>`;
    }

    for (let ticker of tickersComPosse) {
        const qtd = carteira[ticker];
        const ativo = todosAtivos.find(a => a.ticker === ticker);
        if (ativo) {
            const valorAtualTotal = ativo.preco * qtd;
            const precoMed = precoMedioCompra[ticker] || ativo.preco;
            const dividendosAteAgora = proventosPorAtivo[ticker] || 0;
            const rentabilidadeAtivo = precoMed > 0 ? ((ativo.preco - precoMed) / precoMed) * 100 : 0;
            const rentabilidadeClass = rentabilidadeAtivo >= 0 ? 'indicator-green' : 'indicator-red';
            html += `<tr>
                <td style="font-weight:600; color: var(--neon-blue);">${ticker}</td>
                <td>${qtd}</td>
                <td>${formatarMoeda(precoMed)}</td>
                <td style="color: var(--neon-green);">${formatarMoeda(valorAtualTotal)}</td>
                <td style="color: #f59e0b;">${formatarMoeda(dividendosAteAgora)}</td>
                <td><span class="metric-cell ${rentabilidadeClass}">${rentabilidadeAtivo.toFixed(2)}%</span></td>
                <td>
                    <button class="btn-carteira-comprar" onclick="comprarAtivo('${ticker}')">+1 Compra</button>
                    <button class="btn-carteira-vender" onclick="venderAtivo('${ticker}')">-1 Venda</button>
                </td>
            </tr>`;
        }
    }

    tbody.innerHTML = html;
    document.getElementById("carteiraVaziaMsg").style.display = (tickersComPosse.length === 0 && saldoPoupanca <= 0) ? "block" : "none";
}

function atualizarPatrimonio() {
    let patrimonioInvestimentos = 0;
    let totalCustoInvestido = 0;

    for (let ticker in carteira) {
        const qtd = carteira[ticker];
        if (qtd > 0) {
            const ativo = todosAtivos.find(a => a.ticker === ticker);
            if (ativo) patrimonioInvestimentos += ativo.preco * qtd;
            const precoMed = precoMedioCompra[ticker] || 0;
            totalCustoInvestido += precoMed * qtd;
        }
    }

    const patrimonioTotal = patrimonioInvestimentos + saldoPoupanca;

    document.getElementById("saldo").innerHTML = `${saldo.toFixed(2)} <span class="moeda-simbolo">${MOEDA}</span>`;
    document.getElementById("patrimonio").innerHTML = `${patrimonioTotal.toFixed(2)} <span class="moeda-simbolo">${MOEDA}</span>`;
    document.getElementById("investido").innerHTML = `${totalCustoInvestido.toFixed(2)} <span class="moeda-simbolo">${MOEDA}</span>`;
    document.getElementById("proventosAcumulados").innerHTML = `${proventosPendentes.toFixed(2)} <span class="moeda-simbolo">${MOEDA}</span>`;
    document.getElementById("saldoPoupanca").innerHTML = `${saldoPoupanca.toFixed(2)} <span class="moeda-simbolo">${MOEDA}</span>`;
    
    document.getElementById("userSaldoDisplay").textContent = `${saldo.toFixed(2)} ${MOEDA}`;
}

function atualizarTudo() {
    renderAcoes();
    renderFIIs();
    renderETFs();
    renderTesouro();
    atualizarCarteira();
    atualizarPatrimonio();
    atualizarDisplayRPG();
}

// ====================================================================
//  SAIR
// ====================================================================
function sair() {
    if (confirm('Tem certeza que deseja sair?')) {
        localStorage.removeItem('usuario_logado');
        window.location.href = 'login.html';
    }
}

// ====================================================================
//  SELIC
// ====================================================================
function atualizarDisplaySelicBolsa(valor) {
    const display    = document.getElementById('selicDisplayBolsa');
    const indicador  = document.getElementById('selicIndicadorBolsa');
    const impacto    = document.getElementById('selicImpactoBolsa');
    const estrategia = document.getElementById('selicEstrategiaBolsa');
    const badge      = document.getElementById('selicBadge');

    display.textContent = `${valor.toFixed(2)}%`;
    badge.textContent = `📈 SELIC: ${valor.toFixed(2)}%`;

    let classificacao = 'Média';
    let classe = 'selic-media';
    let impactoTexto = '⚖️ Mercado estável';
    let impactoClasse = 'impacto-neutral';
    let estrategiaTexto = '🔍 Aguardar';

    if (valor >= 13.0) {
        classificacao = 'ALTA';
        classe = 'selic-alta';
        impactoTexto = '📉 FIIs em QUEDA - Oportunidade de COMPRA!';
        impactoClasse = 'impacto-compra';
        estrategiaTexto = '🛒 COMPRAR FIIs';
    } else if (valor >= 10.5) {
        classificacao = 'Média';
        classe = 'selic-media';
        impactoTexto = '⚖️ Mercado neutro';
        impactoClasse = 'impacto-neutral';
        estrategiaTexto = '🔍 Observar';
    } else if (valor >= 8.0) {
        classificacao = 'Média-Baixa';
        classe = 'selic-media';
        impactoTexto = '📈 FIIs em SUBIDA - Momento de COLHER!';
        impactoClasse = 'impacto-venda';
        estrategiaTexto = '💰 VENDER/COLHER';
    } else {
        classificacao = 'BAIXA';
        classe = 'selic-baixa';
        impactoTexto = '🚀 FIIs em ALTA - Hora de VENDER!';
        impactoClasse = 'impacto-venda';
        estrategiaTexto = '💸 COLHER LUCROS';
    }

    indicador.textContent = classificacao;
    indicador.className = `selic-indicador ${classe}`;
    impacto.textContent = impactoTexto;
    impacto.className = `selic-impacto ${impactoClasse}`;
    estrategia.textContent = estrategiaTexto;
}

async function carregarSelicDoSupabase() {
    try {
        const { data, error } = await supabase
            .from(TABELA)
            .select('selic')
            .eq('id', usuario.id)
            .single();

        if (error) {
            const { data: dataAdmin, error: errorAdmin } = await supabase
                .from(TABELA)
                .select('selic')
                .limit(1)
                .single();
            
            if (errorAdmin) return 10.75;
            return dataAdmin?.selic ?? 10.75;
        }
        
        return data?.selic ?? 10.75;
    } catch (error) {
        console.error('Erro ao carregar SELIC:', error);
        return 10.75;
    }
}

// ====================================================================
//  INICIALIZAÇÃO
// ====================================================================
initEstruturas();

await carregarDadosDoSupabase();

if (!dadosCarregados) {
    const precosAcoes = [34.50, 58.90, 31.20];
    acoes.forEach((a, idx) => a.preco = precosAcoes[idx]);
    const precosFIIs = [9.90, 98.40, 156.00];
    fiis.forEach((a, idx) => a.preco = precosFIIs[idx]);
    const precosETFs = [121.00, 330.00];
    etfs.forEach((a, idx) => a.preco = precosETFs[idx]);
    tesouros[0].preco = 100.50;
    tesouros[1].preco = 280.30;
    tesouros[2].preco = 850.00;
}

document.getElementById("valorPoupanca").value = "10.00";
atualizarStatusInternet(navigator.onLine);
await verificarSupabase();
await verificarAPI();
if (navigator.onLine && apiOnline) await buscarPrecosAPI();

atualizarTudo();

document.getElementById("historico").innerHTML = "";
registrar(`🚀 Jogo iniciado com SALDO DE ${formatarMoeda(saldo)}!`);
registrar(`👤 Usuário: ${usuario.nome || usuario.login}`);
registrar("💰 Ações: proventos a cada 60s | FIIs: 30s | ETFs: 90s");
registrar("🏦 Poupança: rende 0,6% a cada 60s. Boa sorte!");
if (supabaseOnline) registrar("☁️ Supabase disponível para salvar seu progresso!");

const selicSalva = await carregarSelicDoSupabase();
if (selicSalva !== null && selicSalva !== undefined) {
    selicAtual = selicSalva;
}
atualizarDisplaySelicBolsa(selicAtual);

// ====================================================================
//  EVENT LISTENERS
// ====================================================================
document.getElementById("btnSair").addEventListener("click", sair);
document.getElementById("btnTransferirProventos").addEventListener("click", transferirProventosParaSaldo);
document.getElementById("btnAplicarPoupanca").addEventListener("click", aplicarPoupanca);
document.getElementById("btnResgatarPoupanca").addEventListener("click", resgatarPoupanca);

window.addEventListener('online', async () => {
    atualizarStatusInternet(true);
    registrar('🌐 Conexão restaurada!');
    await verificarSupabase();
    await verificarAPI();
    if (apiOnline) { await buscarPrecosAPI(); atualizarTudo(); }
});

window.addEventListener('offline', () => {
    atualizarStatusInternet(false);
    apiOnline = false;
    atualizarStatusAPI(false);
    registrar('📡 Modo offline ativado.');
});

// ====================================================================
//  INTERVALOS
// ====================================================================
setInterval(() => {
    if (navigator.onLine && apiOnline) {
        buscarPrecosAPI().then(() => atualizarTudo());
    } else {
        variarPrecosOfflineAcoes();
        variarPrecosOfflineFIIs();
        variarPrecosOfflineETFs();
        variarPrecosTesouro();
        atualizarCarteira();
        atualizarPatrimonio();
    }
}, 30000);

setInterval(() => {
    if (!navigator.onLine || !apiOnline) {
        variarPrecosOfflineAcoes();
        variarPrecosOfflineFIIs();
        variarPrecosOfflineETFs();
        variarPrecosTesouro();
        atualizarCarteira();
        atualizarPatrimonio();
    }
}, 10000);

setInterval(() => {
    distribuirProventos(acoes, '📈 AÇÕES');
}, 60000);

setInterval(() => {
    distribuirProventos(fiis, '🏢 FIIs');
}, 30000);

setInterval(() => {
    distribuirProventos(etfs, '📊 ETFs');
}, 90000);

setInterval(renderPoupanca, 60000);
setInterval(() => { atualizarCarteira(); atualizarPatrimonio(); }, 5000);
setInterval(async () => { await verificarSupabase(); }, 60000);

setInterval(async () => {
    const selicSalva = await carregarSelicDoSupabase();
    if (selicSalva !== null && selicSalva !== undefined && selicSalva !== selicAtual) {
        selicAtual = selicSalva;
        atualizarDisplaySelicBolsa(selicAtual);
    }
}, 30000);