// config-module.js — adaptador ESM para a configuração global em config.js

if (!globalThis.PORTAL_CONFIG) {
  const carregarScript = (src) => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Não foi possível carregar ${src}`));
    document.head.appendChild(script);
  });

  await carregarScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
  await carregarScript(new URL('./config.js', import.meta.url).href);
}

const { SUPABASE_URL, SUPABASE_KEY, db } = globalThis.PORTAL_CONFIG;
export { SUPABASE_URL, SUPABASE_KEY, db };

/* ============================================================
   TABELAS — GERAL
============================================================ */
export const TABELA             = 'Geral';
export const TABELA_ATIVIDADES  = 'Atividades';
export const TABELA_TROCAS      = 'Trocas';
export const TABELA_TAXAS       = 'Trocas_Taxas';

/* ============================================================
   TABELAS — LOJA / CARGOS
============================================================ */
export const TABELA_CARGOS         = 'cargos';
export const TABELA_COMPRAS        = 'compras';
export const TABELA_USUARIO_CARGOS = 'usuario_cargos';

/* ============================================================
   TABELAS — MINERAÇÃO
============================================================ */
export const TABELA_MINERACAO_CONFIG     = 'mineracao_config';
export const TABELA_MINERACAO_HISTORICO  = 'mineracao_historico';
export const TABELA_HISTORICO_MINERACAO  = 'historico_mineracao';

/* ============================================================
   TABELAS — CONTEÚDO / SUPORTE
============================================================ */
export const TABELA_NOTICIAS         = 'noticias';
export const TABELA_SUPORTE_TICKETS  = 'suporte_tickets';

/* ============================================================
   TAXAS
============================================================ */
export const TAXA_PERCENTUAL = 0.05;

/* ============================================================
   SÍMBOLOS DAS MOEDAS
============================================================ */
export const SIMB = {
  saldo: 'S$',
  mumu:  'M$',
  usdt:  'US$'
};

/* ============================================================
   TAXAS DE CONVERSÃO
============================================================ */

/* MUMU — S$ 100,00 = M$ 1,00 (S$ 1,00 = M$ 0,01) */
export const TAXA_MUMU = {
  reais_por_mumu: 100,        // S$ 100,00 = M$ 1,00
  saldo_minimo: 50            // S$ 50,00 = M$ 0,50
};

/* USDT — US$ 0,01 = S$ 10.000,00 (S$ 1.000.000,00 = US$ 1,00) */
export const TAXA_USDT = {
  saldo_por_dolar: 1000000,   // S$ 1.000.000,00 = US$ 1,00
  minimo_dolares: 0.01,
  saldo_minimo: 10000         // S$ 10.000,00 = US$ 0,01
};

/* ============================================================
   CONFIG — SESSÃO
============================================================ */
export const SESSION_KEY           = 'usuario_logado';
export const SESSION_TIMESTAMP_KEY = 'session_timestamp';
export const SESSION_DURATION      = 24 * 60 * 60 * 1000;  // 24h

/* ============================================================
   CONFIG — REGENERAÇÃO OFFLINE
============================================================ */
export const REGEN_CONFIG = {
  STAMINA_CRITICAL_PCT: 10,                 // % crítica (10% do smMax)
  OFFLINE_FULL_MS: 24 * 60 * 60 * 1000,     // 24h
  TICK_MS: 1000,                            // tick da barra (1s)
  REGEN_ONLINE_INTERVAL_MS: 30 * 1000,      // reservado
  REGEN_ONLINE_PER_TICK: 1                  // reservado
};

/* ============================================================
   CONFIG — STATUS DAS TROCAS
============================================================ */
export const STATUS_TROCA = {
  aguardando:           { txt: 'Aguardando pagamento', cls: 'warn' },
  pagamento_confirmado: { txt: 'Pagamento confirmado', cls: 'info' },
  concluida:            { txt: 'Concluída',            cls: 'ok'   },
  cancelada:            { txt: 'Cancelada',            cls: 'err'  }
};

/* ============================================================
   HELPERS DE FORMATAÇÃO
============================================================ */

/** Formata valor com símbolo do saldo — "S$ 1.234,56" */
export function fmtSaldo(v) {
  const n = Number(v || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `${SIMB.saldo} ${n}`;
}

/** Formata valor com símbolo do MUMU — "M$ 12,34" */
export function fmtMumu(v) {
  const n = Number(v || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `${SIMB.mumu} ${n}`;
}

/** Formata valor com símbolo do USDT — "US$ 8,75" */
export function fmtUsdt(v) {
  const n = Number(v || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `${SIMB.usdt} ${n}`;
}

/** Formata data/hora pt-BR — "12/10/2026 15:30" */
export function fmtData(v) {
  if (!v) return '—';
  try {
    return new Date(v).toLocaleString('pt-BR');
  } catch {
    return String(v);
  }
}

/** Escapa HTML para evitar XSS */
export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

/* ============================================================
   LISTA DE TABELAS (útil para validação/debug)
============================================================ */
export const TABELAS = {
  Geral:              TABELA,
  Atividades:         TABELA_ATIVIDADES,
  Trocas:             TABELA_TROCAS,
  TrocasTaxas:        TABELA_TAXAS,
  Cargos:             TABELA_CARGOS,
  Compras:            TABELA_COMPRAS,
  UsuarioCargos:      TABELA_USUARIO_CARGOS,
  MineracaoConfig:    TABELA_MINERACAO_CONFIG,
  MineracaoHistorico: TABELA_MINERACAO_HISTORICO,
  HistoricoMineracao: TABELA_HISTORICO_MINERACAO,
  Noticias:           TABELA_NOTICIAS,
  SuporteTickets:     TABELA_SUPORTE_TICKETS
};












// ============================================================
// ESTRUTURA PADRÃO DA BOLSA
// ============================================================
export const BOLSA_PADRAO = {
  acoes: [],
  fiis: [],
  etfs: [],
  tesouro: [],
  selic: 10.75,
  ultima_atualizacao: null
};

// ============================================================
// MAPEAMENTO DE RARIDADE POR CATEGORIA
// ============================================================
export const RARIDADE_MAP = {
  acoes: { raridade: 'raro', tipo: 'Ação', tier_base: 3 },
  fiis: { raridade: 'epico', tipo: 'FII', tier_base: 5 },
  etfs: { raridade: 'epico', tipo: 'ETF', tier_base: 5 },
  tesouro: { raridade: 'lendario', tipo: 'Tesouro', tier_base: 8 }
};

// ============================================================
// BÔNUS BASE POR RARIDADE
// ============================================================
export const BONUS_BASE = {
  raro: { atk: 15, def: 10, hp: 100 },
  epico: { atk: 30, def: 20, hp: 250 },
  lendario: { atk: 50, def: 35, hp: 500 }
};

// ============================================================
// CALCULAR BÔNUS DO ATIVO
// ============================================================
export function calcularBonusAtivo(preco, categoria) {
  const config = RARIDADE_MAP[categoria] || RARIDADE_MAP.acoes;
  const base = BONUS_BASE[config.raridade] || BONUS_BASE.raro;
  
  // Tier baseado no preço (1-20)
  const tier = Math.min(20, Math.max(1, Math.floor(preco / 5)));
  const fator = tier / 10;
  
  return {
    tier,
    raridade: config.raridade,
    tipo: config.tipo,
    bonus: {
      atk: Math.round(base.atk * fator),
      def: Math.round(base.def * fator),
      hp: Math.round(base.hp * fator)
    }
  };
}

// ============================================================
// CARREGAR BOLSA UNIFICADA
// ============================================================
export async function carregarBolsa(login) {
  const { data, error } = await db
    .from(TABELA)
    .select('fazendinha_dados, itens, carteira, preco_medio_compra, proventos_por_ativo, selic')
    .eq('login', login)
    .maybeSingle();

  if (error) throw error;
  if (!data) return { bolsa: BOLSA_PADRAO, itens: [], carteira: {}, precos: {}, proventos: {} };

  const fazendinha = data.fazendinha_dados || {};
  const bolsa = fazendinha.bolsa || BOLSA_PADRAO;

  return {
    bolsa: {
      acoes: Array.isArray(bolsa.acoes) ? bolsa.acoes : [],
      fiis: Array.isArray(bolsa.fiis) ? bolsa.fiis : [],
      etfs: Array.isArray(bolsa.etfs) ? bolsa.etfs : [],
      tesouro: Array.isArray(bolsa.tesouro) ? bolsa.tesouro : [],
      selic: bolsa.selic ?? data.selic ?? 10.75,
      ultima_atualizacao: bolsa.ultima_atualizacao || null
    },
    itens: Array.isArray(data.itens) ? data.itens : [],
    carteira: data.carteira || {},
    precos: data.preco_medio_compra || {},
    proventos: data.proventos_por_ativo || {},
    selic: data.selic ?? 10.75
  };
}

// ============================================================
// SALVAR BOLSA UNIFICADA
// ============================================================
export async function salvarBolsa(login, bolsa) {
  // Garantir estrutura
  const bolsaFinal = {
    acoes: Array.isArray(bolsa.acoes) ? bolsa.acoes : [],
    fiis: Array.isArray(bolsa.fiis) ? bolsa.fiis : [],
    etfs: Array.isArray(bolsa.etfs) ? bolsa.etfs : [],
    tesouro: Array.isArray(bolsa.tesouro) ? bolsa.tesouro : [],
    selic: bolsa.selic ?? 10.75,
    ultima_atualizacao: new Date().toISOString()
  };

  const { data: atual } = await db
    .from(TABELA)
    .select('fazendinha_dados')
    .eq('login', login)
    .maybeSingle();

  const fazendinhaAtual = atual?.fazendinha_dados || {};

  const { error } = await db
    .from(TABELA)
    .update({
      fazendinha_dados: {
        ...fazendinhaAtual,
        bolsa: bolsaFinal
      },
      selic: bolsaFinal.selic,
      updated_at: new Date().toISOString()
    })
    .eq('login', login);

  if (error) throw error;
  return bolsaFinal;
}

// ============================================================
// ATUALIZAR PREÇO DE UM ATIVO (e sincronizar Codex)
// ============================================================
export async function atualizarPrecoAtivo(login, categoria, ativoId, novoPreco) {
  const dados = await carregarBolsa(login);
  const bolsa = dados.bolsa;
  const lista = bolsa[categoria] || [];
  
  const ativo = lista.find(a => a.id === ativoId);
  if (!ativo) throw new Error(`Ativo ${ativoId} não encontrado em ${categoria}`);

  ativo.preco = novoPreco;
  ativo.atualizado_em = new Date().toISOString();

  // Recalcular bônus se registrado no codex
  if (ativo.registrado_codex) {
    const calc = calcularBonusAtivo(novoPreco, categoria);
    ativo.tier = calc.tier;
    ativo.raridade = calc.raridade;
    ativo.bonus = calc.bonus;
  }

  await salvarBolsa(login, bolsa);
  return ativo;
}

// ============================================================
// REGISTRAR ATIVO NO CODEX (dentro do próprio ativo)
// ============================================================
export async function registrarAtivoNoCodex(login, categoria, ativoId) {
  const dados = await carregarBolsa(login);
  const bolsa = dados.bolsa;
  const lista = bolsa[categoria] || [];
  
  const ativo = lista.find(a => a.id === ativoId);
  if (!ativo) throw new Error(`Ativo ${ativoId} não encontrado`);

  if (ativo.registrado_codex) {
    return { jaRegistrado: true, ativo };
  }

  const calc = calcularBonusAtivo(ativo.preco, categoria);
  
  ativo.registrado_codex = true;
  ativo.registrado_em = new Date().toISOString();
  ativo.tier = calc.tier;
  ativo.raridade = calc.raridade;
  ativo.bonus = calc.bonus;
  ativo.tipo = calc.tipo;

  await salvarBolsa(login, bolsa);
  return { jaRegistrado: false, ativo };
}

// ============================================================
// LISTAR ITENS DO CODEX (gerados a partir da bolsa)
// ============================================================
export function listarItensCodex(bolsa) {
  const itens = [];
  const categorias = ['acoes', 'fiis', 'etfs', 'tesouro'];

  for (const cat of categorias) {
    const lista = bolsa[cat] || [];
    for (const ativo of lista) {
      if (ativo.registrado_codex) {
        itens.push({
          id_item: `bolsa_${ativo.id}`,
          nome: `${ativo.nome} (${ativo.id})`,
          tipo_peca: ativo.tipo || RARIDADE_MAP[cat]?.tipo || 'Ativo',
          raridade: ativo.raridade || 'raro',
          tier: ativo.tier || 3,
          categoria: cat,
          bonus: ativo.bonus || { atk: 0, def: 0, hp: 0 },
          conjunto: {
            id_conjunto: `bolsa_${cat}_conj`,
            nome_conjunto: `Carteira ${RARIDADE_MAP[cat]?.tipo || cat}`
          },
          registrado_em: ativo.registrado_em,
          preco_atual: ativo.preco
        });
      }
    }
  }

  return itens;
}

// ============================================================
// RESUMO DE BÔNUS
// ============================================================
export function calcularResumoBonus(bolsa) {
  const itens = listarItensCodex(bolsa);
  
  const total = itens.reduce((acc, item) => ({
    atk: acc.atk + (item.bonus?.atk || 0),
    def: acc.def + (item.bonus?.def || 0),
    hp: acc.hp + (item.bonus?.hp || 0)
  }), { atk: 0, def: 0, hp: 0 });

  const conjuntos = {};
  for (const item of itens) {
    const cid = item.conjunto?.id_conjunto;
    if (cid) conjuntos[cid] = (conjuntos[cid] || 0) + 1;
  }

  return {
    totalItens: itens.length,
    bonus: total,
    conjuntos,
    conjuntosCompletos: Object.values(conjuntos).filter(q => q >= 7).length,
    conjuntosUnicos: Object.keys(conjuntos).length
  };
}
// Monitor de conexão da página de trocas.
export const TROCAS_CONFIG = Object.freeze({ STATUS_INTERVAL_MS: 30000, REQUEST_TIMEOUT_MS: 5000 });

export const CHAT_TROCAS_CONFIG = Object.freeze({
 POLL_MS: 4000, NICK_DELAY_MS: 600, MAX_MENSAGEM: 2000, REQUEST_TIMEOUT_MS: 10000,
 RPC_ABRIR:'chat_trocas_abrir', RPC_CONVERSAS:'chat_trocas_conversas',
 RPC_HISTORICO:'chat_trocas_historico', RPC_ENVIAR:'chat_trocas_enviar'
});

export { COMBATE_CONFIG } from './shared/combate-config.js';
