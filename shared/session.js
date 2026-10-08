// ============================================================
// shared/session.js — Módulo único de sessão
// ============================================================
export const SESSION_KEY           = 'usuario_logado';
export const SESSION_TIMESTAMP_KEY = 'session_timestamp';
export const SESSION_DURATION      = 24 * 60 * 60 * 1000;

/**
 * Salva a sessão do usuário no localStorage
 */
export function salvarSessao(usuario) {
  if (!usuario || !usuario.login) {
    throw new Error('Usuário inválido');
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(usuario));
  localStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString());
}

/**
 * Verifica se a sessão é válida (< 24h)
 */
export function sessaoValida() {
  const ts = localStorage.getItem(SESSION_TIMESTAMP_KEY);
  const u  = localStorage.getItem(SESSION_KEY);
  if (!ts || !u) return false;
  const t = parseInt(ts, 10);
  if (isNaN(t)) return false;
  return (Date.now() - t) < SESSION_DURATION;
}

/**
 * Retorna o usuário logado ou null
 */
export function obterUsuario() {
  if (!sessaoValida()) return null;
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

/**
 * Remove a sessão
 */
export function limparSessao() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_TIMESTAMP_KEY);
}

/**
 * Retorna o tempo restante em ms
 */
export function tempoRestanteSessao() {
  const ts = localStorage.getItem(SESSION_TIMESTAMP_KEY);
  if (!ts) return 0;
  const t = parseInt(ts, 10);
  if (isNaN(t)) return 0;
  return Math.max(0, SESSION_DURATION - (Date.now() - t));
}

/**
 * Redireciona se não houver sessão válida
 */
export function exigirSessao(redirectUrl = 'login.html') {
  if (!sessaoValida()) {
    limparSessao();
    window.location.href = redirectUrl;
    return null;
  }
  return obterUsuario();
}