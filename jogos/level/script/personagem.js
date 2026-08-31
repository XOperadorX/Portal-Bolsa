// ============================================================
// CONFIGURAÇÕES SUPABASE
// ============================================================
const SUPABASE_URL = 'https://xrcxvizzdumcxbylmkvn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_E-g3G3wW4EySbCsXLXp8KQ_FnmERMcD';
const TABELA = 'Geral';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================
// ESTADO DO SISTEMA
// ============================================================
const state = {
    // Dados do usuário
    usuario: null,
    id: null,
    login: '',

    // Financeiro
    saldo: 0,
    btc: 0,
    poderHash: 1.0,

    // Atributos do personagem
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    sm: 100,
    maxSm: 100,
    atk: 15,
    def: 10,
    mag: 8,

    // Nível e EXP
    nivel: 1,
    experiencia: 0,
    expProximo: 100,

    // Itens
    itens: [],

    // Títulos por nível
    titulos: [
        { min: 1, titulo: '🌱 Iniciante' },
        { min: 5, titulo: '🌿 Aprendiz' },
        { min: 10, titulo: '⚔️ Guerreiro' },
        { min: 20, titulo: '🛡️ Mestre' },
        { min: 35, titulo: '🏆 Lendário' },
        { min: 50, titulo: '👑 Herói' },
        { min: 75, titulo: '⚡ Deus da Guerra' },
        { min: 100, titulo: '🌟 Imortal' },
    ],

    // Controle de toast
    toastTimer: null,
};

// ============================================================
// FUNÇÕES DE CÁLCULO
// ============================================================
function getAtaque() {
    return state.atk + Math.floor(state.nivel * 1.5);
}

function getDefesa() {
    return state.def + Math.floor(state.nivel * 1.2);
}

function getMagia() {
    return state.mag + Math.floor(state.nivel * 1.0);
}

function getHpMax() {
    return state.maxHp + Math.floor(state.nivel * 6);
}

function getMpMax() {
    return state.maxMp + Math.floor(state.nivel * 4);
}

function getSmMax() {
    return state.maxSm + Math.floor(state.nivel * 3);
}

function getExpProximo() {
    return Math.floor(100 * Math.pow(1.2, state.nivel - 1));
}

function getTitulo() {
    let titulo = state.titulos[0].titulo;
    for (const t of state.titulos) {
        if (state.nivel >= t.min) titulo = t.titulo;
    }
    return titulo;
}

// ============================================================
// TOAST
// ============================================================
function mostrarToast(mensagem, tipo = 'info') {
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
    toast.classList.add('show');

    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ============================================================
// UI - ATUALIZAÇÃO
// ============================================================
function atualizarUI() {
    const expProx = getExpProximo();
    const pct = state.experiencia / expProx * 100;

    // Avatar e nome
    const avatar = document.getElementById('userAvatar');
    const nick = document.getElementById('nomeJogador');
    const saldo = document.getElementById('saldosaldo');

    nick.textContent = state.login || 'Desconectado';
    avatar.textContent = state.login ? state.login.charAt(0).toUpperCase() : '👤';
    saldo.textContent = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(state.saldo);

    // Nível
    document.getElementById('levelNumber').textContent = state.nivel;
    document.getElementById('levelTitle').textContent = getTitulo();

    // EXP
    document.getElementById('expFill').style.width = Math.min(pct, 100) + '%';
    document.getElementById('expFill').className = 'exp-fill' + (pct > 75 ? ' high' : '');
    document.getElementById('expCurrent').textContent = state.experiencia;
    document.getElementById('expNext').textContent = expProx;

    // Atributos
    document.getElementById('statHp').textContent = `${state.hp}/${getHpMax()}`;
    document.getElementById('statMp').textContent = `${state.mp}/${getMpMax()}`;
    document.getElementById('statSm').textContent = `${state.sm}/${getSmMax()}`;
    document.getElementById('statAtk').textContent = getAtaque();
    document.getElementById('statDef').textContent = getDefesa();
    document.getElementById('statMag').textContent = getMagia();

    // Recursos extras
    document.getElementById('poderHash').textContent = `${state.poderHash.toFixed(1)} MH/s`;
    document.getElementById('qtdItens').textContent = state.itens.reduce((sum, item) => sum + (item.qtd || 0), 0);
    document.getElementById('btcValue').textContent = state.btc.toFixed(8);
}

// ============================================================
// SUPABASE - SALVAR
// ============================================================
async function salvarNoBanco() {
    if (!state.id) return;

    try {
        const payload = {
            saldo: state.saldo,
            btc: state.btc,
            poder_hash: state.poderHash,
            hp: state.hp,
            max_hp: getHpMax(),
            mp: state.mp,
            max_mp: getMpMax(),
            sm: state.sm,
            max_sm: getSmMax(),
            atk: state.atk,
            def: state.def,
            mag: state.mag,
            nivel: state.nivel,
            experiencia: state.experiencia,
            exp_next: getExpProximo(),
            itens: state.itens,
            updated_at: new Date().toISOString()
        };

        const { error } = await supabase
            .from(TABELA)
            .update(payload)
            .eq('id', state.id);

        if (error) throw error;
        return true;

    } catch (error) {
        console.error('❌ Erro ao salvar:', error);
        return false;
    }
}

// ============================================================
// SUPABASE - CARREGAR
// ============================================================
async function carregarDadosDoUsuario(login) {
    try {
        const { data, error } = await supabase
            .from(TABELA)
            .select('*')
            .eq('login', login)
            .single();

        if (error) throw error;

        if (data) {
            state.id = data.id;
            state.login = data.login;
            state.saldo = parseFloat(data.saldo) || 0;
            state.btc = parseFloat(data.btc) || 0;
            state.poderHash = parseFloat(data.poder_hash) || 1.0;

            state.hp = parseFloat(data.hp) || 100;
            state.maxHp = parseFloat(data.max_hp) || 100;
            state.mp = parseFloat(data.mp) || 50;
            state.maxMp = parseFloat(data.max_mp) || 50;
            state.sm = parseFloat(data.sm) || 100;
            state.maxSm = parseFloat(data.max_sm) || 100;
            state.atk = parseFloat(data.atk) || 15;
            state.def = parseFloat(data.def) || 10;
            state.mag = parseFloat(data.mag) || 8;

            state.nivel = data.nivel || 1;
            state.experiencia = parseFloat(data.experiencia) || 0;
            state.expProximo = parseFloat(data.exp_next) || 100;
            state.itens = data.itens || [];

            atualizarUI();
            return true;
        }
        return false;

    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        mostrarToast('❌ Erro ao carregar dados', 'erro');
        return false;
    }
}

// ============================================================
// AÇÕES DO SISTEMA DE NÍVEL
// ============================================================
function treinar() {
    if (state.sm < 10) {
        mostrarToast('⚡ Stamina insuficiente! Descanse.', 'erro');
        return false;
    }

    state.sm -= 10;

    const ganhoBase = 15 + Math.floor(state.nivel * 2);
    const variacao = Math.floor(Math.random() * 15);
    const ganho = ganhoBase + variacao;

    state.experiencia += ganho;

    let subiu = false;
    const expProx = getExpProximo();

    while (state.experiencia >= expProx) {
        state.experiencia -= expProx;
        state.nivel++;
        subiu = true;

        state.hp = getHpMax();
        state.mp = getMpMax();
        state.sm = getSmMax();

        mostrarToast(`🎉 SUBIU PARA NÍVEL ${state.nivel}!`, 'sucesso');
    }

    atualizarUI();

    if (!subiu) {
        mostrarToast(`💪 Treinou! +${ganho} EXP (${state.experiencia}/${getExpProximo()})`, 'info');
    }

    salvarNoBanco();
    return true;
}

function descansar() {
    const hpRestaurado = Math.floor(getHpMax() * 0.4);
    const mpRestaurado = Math.floor(getMpMax() * 0.35);
    const smRestaurado = Math.floor(getSmMax() * 0.5);

    state.hp = Math.min(getHpMax(), state.hp + hpRestaurado);
    state.mp = Math.min(getMpMax(), state.mp + mpRestaurado);
    state.sm = Math.min(getSmMax(), state.sm + smRestaurado);

    atualizarUI();
    mostrarToast(`🛌 Descansou! +${hpRestaurado} HP, +${mpRestaurado} MP, +${smRestaurado} SM`, 'sucesso');
    salvarNoBanco();
    return true;
}

function resetarNivel() {
    if (!confirm('⚠️ Tem certeza que quer resetar seu nível e atributos?')) return false;

    state.nivel = 1;
    state.experiencia = 0;
    state.hp = getHpMax();
    state.mp = getMpMax();
    state.sm = getSmMax();

    atualizarUI();
    mostrarToast('🔄 Nível resetado para 1!', 'info');
    salvarNoBanco();
    return true;
}

// ============================================================
// CONTROLES DE SM
// ============================================================
function ganharSm() {
    const smMax = getSmMax();
    const ganho = 50;
    const novoSm = Math.min(smMax, state.sm + ganho);
    const ganhoReal = novoSm - state.sm;

    if (ganhoReal <= 0) {
        mostrarToast('⚡ SM já está no máximo!', 'aviso');
        return false;
    }

    state.sm = novoSm;
    atualizarUI();
    mostrarToast(`➕ +${ganhoReal} SM (${state.sm}/${smMax})`, 'sucesso');
    salvarNoBanco();
    return true;
}

function gastarSm() {
    const gasto = 30;

    if (state.sm < gasto) {
        mostrarToast('⚡ SM insuficiente!', 'erro');
        return false;
    }

    state.sm -= gasto;
    atualizarUI();
    mostrarToast(`➖ -${gasto} SM (${state.sm}/${getSmMax()})`, 'info');
    salvarNoBanco();
    return true;
}

function resetarSm() {
    if (!confirm('⚠️ Tem certeza que quer resetar o SM para o máximo?')) return false;

    state.sm = getSmMax();
    atualizarUI();
    mostrarToast(`🔄 SM resetado para ${state.sm}/${getSmMax()}`, 'info');
    salvarNoBanco();
    return true;
}

// ============================================================
// VERIFICAÇÃO DE LOGIN
// ============================================================
function verificarLogin() {
    const usuarioLogado = localStorage.getItem('usuario_logado');

    if (!usuarioLogado) {
        mostrarToast('❌ Faça login primeiro!', 'erro');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return null;
    }

    try {
        const user = JSON.parse(usuarioLogado);
        if (!user || !user.login) {
            localStorage.removeItem('usuario_logado');
            mostrarToast('❌ Sessão inválida!', 'erro');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            return null;
        }
        return user;
    } catch (e) {
        localStorage.removeItem('usuario_logado');
        mostrarToast('❌ Sessão inválida!', 'erro');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return null;
    }
}

// ============================================================
// ATUALIZAÇÃO PERIÓDICA
// ============================================================
async function carregarDadosAtualizados() {
    if (!state.id) return;

    try {
        const { data, error } = await supabase
            .from(TABELA)
            .select('saldo, btc, poder_hash, hp, mp, sm, atk, def, mag, nivel, experiencia, exp_next, itens')
            .eq('id', state.id)
            .single();

        if (error) throw error;

        state.saldo = parseFloat(data.saldo) || 0;
        state.btc = parseFloat(data.btc) || 0;
        state.poderHash = parseFloat(data.poder_hash) || 1.0;
        state.hp = parseFloat(data.hp) || 100;
        state.mp = parseFloat(data.mp) || 50;
        state.sm = parseFloat(data.sm) || 100;
        state.atk = parseFloat(data.atk) || 15;
        state.def = parseFloat(data.def) || 10;
        state.mag = parseFloat(data.mag) || 8;
        state.nivel = data.nivel || 1;
        state.experiencia = parseFloat(data.experiencia) || 0;
        state.itens = data.itens || [];

        atualizarUI();
    } catch (error) {
        console.error('Erro ao atualizar dados:', error);
    }
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================
async function init() {
    const user = verificarLogin();
    if (!user) return;

    const carregado = await carregarDadosDoUsuario(user.login);
    if (!carregado) {
        mostrarToast('❌ Erro ao carregar dados', 'erro');
        return;
    }

    // Configura botão de login
    const btnLogin = document.getElementById('btnLogin');
    btnLogin.textContent = '🏠 Voltar';
    btnLogin.onclick = function() {
        window.location.href = 'index.html';
    };

    // Event listeners dos botões
    document.getElementById('btnTreinar').addEventListener('click', treinar);
    document.getElementById('btnDescansar').addEventListener('click', descansar);
    document.getElementById('btnResetLevel').addEventListener('click', resetarNivel);
    document.getElementById('btnSmGanhar').addEventListener('click', ganharSm);
    document.getElementById('btnSmGastar').addEventListener('click', gastarSm);
    document.getElementById('btnSmResetar').addEventListener('click', resetarSm);

    // Atualização periódica (a cada 15 segundos)
    setInterval(() => {
        if (state.id) carregarDadosAtualizados();
    }, 15000);

    mostrarToast(`✅ Bem-vindo, ${state.login}!`, 'sucesso');
}

// ============================================================
// INICIALIZAR QUANDO O DOM ESTIVER PRONTO
// ============================================================
document.addEventListener('DOMContentLoaded', init);