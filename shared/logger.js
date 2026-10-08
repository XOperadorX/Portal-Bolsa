import { log } from './shared/logger.js';
log.info('Usuário logado:', user.login);  // só aparece em dev
log.error('Falha na API:', err);          // sempre aparece