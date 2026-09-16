// ============================================================
// GERENCIADOR DE SESSÃO — EXPIRAÇÃO EM 24 HORAS
// ============================================================

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 horas em ms
const SESSION_KEY = 'usuario_logado';
const SESSION_TIMESTAMP_KEY = 'session_timestamp';

/**
 * Salva os dados do usuário com timestamp de login
 */
export function salvarSessao(usuario) {
    const agora = Date.now();
    localStorage.setItem(SESSION_KEY, JSON.stringify(usuario));
    localStorage.setItem(SESSION_TIMESTAMP_KEY, agora.toString());
}

/**
 * Verifica se a sessão ainda é válida (menos de 24h)
 * @returns {boolean} true se válida, false se expirada/inexistente
 */
export function sessaoValida() {
    const timestamp = localStorage.getItem(SESSION_TIMESTAMP_KEY);
    const usuario = localStorage.getItem(SESSION_KEY);

    if (!timestamp || !usuario) return false;

    const loginTime = parseInt(timestamp, 10);
    if (isNaN(loginTime)) return false;

    const agora = Date.now();
    const decorrido = agora - loginTime;

    if (decorrido >= SESSION_DURATION) {
        // Sessão expirada — limpa tudo
        limparSessao();
        return false;
    }

    return true;
}

/**
 * Retorna o usuário logado se a sessão for válida
 * @returns {object|null}
 */
export function obterUsuarioSessao() {
    if (!sessaoValida()) return null;

    try {
        const data = localStorage.getItem(SESSION_KEY);
        return data ? JSON.parse(data) : null;
    } catch {
        limparSessao();
        return null;
    }
}

/**
 * Remove todos os dados da sessão
 */
export function limparSessao() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_TIMESTAMP_KEY);
}

/**
 * Retorna quanto tempo resta da sessão em milissegundos
 */
export function tempoRestanteSessao() {
    const timestamp = localStorage.getItem(SESSION_TIMESTAMP_KEY);
    if (!timestamp) return 0;

    const loginTime = parseInt(timestamp, 10);
    const agora = Date.now();
    const restante = SESSION_DURATION - (agora - loginTime);

    return Math.max(0, restante);
}

/**
 * Agenda o logout automático para quando a sessão expirar
 * @param {function} callback - função chamada ao expirar
 */
export function agendarExpiracaoSessao(callback) {
    const restante = tempoRestanteSessao();

    if (restante <= 0) {
        limparSessao();
        if (callback) callback();
        return;
    }

    // Agenda logout para o momento exato da expiração
    setTimeout(() => {
        limparSessao();
        if (callback) callback();
    }, restante);

    console.log(`⏰ Sessão expira em ${Math.round(restante / 1000 / 60)} minutos`);
}

/**
 * Renova o timestamp da sessão (opcional — mantém logado enquanto ativo)
 * Chame isso se quiser que a sessão renove a cada atividade
 */
export function renovarSessao() {
    if (sessaoValida()) {
        localStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString());
    }
}