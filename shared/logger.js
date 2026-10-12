// ============================================================
// shared/logger.js — Logger centralizado
// ============================================================
// Uso:
//   import { log } from './shared/logger.js';
//   log.info('Usuário logado:', user.login);   // só em DEV
//   log.warn('Atenção');                       // só em DEV
//   log.error('Falha na API:', err);           // SEMPRE
// ============================================================

/* Detecta se está em ambiente de desenvolvimento */
const DEV = (() => {
  try {
    const h = window.location.hostname;
    const p = window.location.protocol;

    // file:// = dev
    if (p === 'file:') return true;

    // localhost / 127.0.0.1 / 0.0.0.0
    if (h === 'localhost' || h === '127.0.0.1' || h === '0.0.0.0') return true;

    // IPs de rede local
    if (/^192\.168\./.test(h)) return true;
    if (/^10\./.test(h)) return true;
    if (/^172\.(1[6-9]|2[0-9]|3[01])\./.test(h)) return true;

    // ?debug=1 força modo dev
    if (new URLSearchParams(window.location.search).has('debug')) return true;

    return false;
  } catch {
    return true;
  }
})();

/* Prefixo com timestamp */
function ts() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `[${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}]`;
}

export const log = {
  /** Debug — SÓ em dev */
  debug(...args) {
    if (!DEV) return;
    console.log(`%c🐛 ${ts()}`, 'color:#a855f7', ...args);
  },

  /** Info — SÓ em dev */
  info(...args) {
    if (!DEV) return;
    console.log(`%cℹ️ ${ts()}`, 'color:#3b82f6', ...args);
  },

  /** Aviso — SÓ em dev */
  warn(...args) {
    if (!DEV) return;
    console.warn(`%c⚠️ ${ts()}`, 'color:#f59e0b', ...args);
  },

  /** Erro — SEMPRE (mesmo em produção) */
  error(...args) {
    console.error(`%c❌ ${ts()}`, 'color:#ef4444', ...args);
  },

  /** Sucesso — SÓ em dev */
  success(...args) {
    if (!DEV) return;
    console.log(`%c✅ ${ts()}`, 'color:#10b981', ...args);
  },

  /** Grupo de logs */
  group(titulo, fn) {
    if (!DEV) { if (fn) fn(); return; }
    console.group(`📁 ${ts()} ${titulo}`);
    try { if (fn) fn(); } finally { console.groupEnd(); }
  },

  /** Tabela formatada */
  table(dados) {
    if (!DEV) return;
    console.table(dados);
  },

  /** Expor se está em modo DEV */
  get isDev() { return DEV; }
};

export default log;