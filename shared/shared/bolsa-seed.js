// ============================================================
// shared/bolsa-seed.js — Popula a bolsa automaticamente
// ============================================================
import { db, TABELA } from '../config.js';

// ============================================================
// ATIVOS PADRÃO (seed inicial)
// ============================================================
export const ATIVOS_PADRAO = {
  acoes: [
    { id: 'PETR4',  nome: 'Petrobras PN',        preco: 28.50, dy: 12.5, variacao: 0, rentabilidade: 0 },
    { id: 'VALE3',  nome: 'Vale ON',             preco: 62.30, dy: 8.2,  variacao: 0, rentabilidade: 0 },
    { id: 'ITUB4',  nome: 'Itaú Unibanco PN',    preco: 33.80, dy: 6.8,  variacao: 0, rentabilidade: 0 },
    { id: 'BBDC4',  nome: 'Bradesco PN',         preco: 14.20, dy: 7.5,  variacao: 0, rentabilidade: 0 },
    { id: 'ABEV3',  nome: 'Ambev ON',            preco: 12.80, dy: 5.2,  variacao: 0, rentabilidade: 0 },
    { id: 'MGLU3',  nome: 'Magazine Luiza ON',   preco:  8.90, dy: 0.0,  variacao: 0, rentabilidade: 0 },
    { id: 'WEGE3',  nome: 'WEG ON',              preco: 52.10, dy: 1.8,  variacao: 0, rentabilidade: 0 },
    { id: 'BBAS3',  nome: 'Banco do Brasil ON',  preco: 27.40, dy: 9.5,  variacao: 0, rentabilidade: 0 }
  ],
  fiis: [
    { id: 'MXRF11', nome: 'Maxi Renda FII',      preco: 10.15, dy: 11.2, variacao: 0, rentabilidade: 0 },
    { id: 'HGLG11', nome: 'CSHG Logística FII',  preco: 162.30, dy: 7.8, variacao: 0, rentabilidade: 0 },
    { id: 'KNRI11', nome: 'Kinea Renda Imob.',   preco: 145.60, dy: 8.1, variacao: 0, rentabilidade: 0 },
    { id: 'XPML11', nome: 'XP Malls FII',        preco: 108.40, dy: 9.0, variacao: 0, rentabilidade: 0 }
  ],
  etfs: [
    { id: 'BOVA11', nome: 'iShares Ibovespa',    preco: 118.70, dy: 0.0, variacao: 0, rentabilidade: 0 },
    { id: 'SMAL11', nome: 'iShares Small Cap',   preco:  95.20, dy: 0.0, variacao: 0, rentabilidade: 0 },
    { id: 'IVVB11', nome: 'iShares S&P 500',     preco: 320.50, dy: 0.0, variacao: 0, rentabilidade: 0 }
  ],
  tesouro: [
    { id: 'TESOURO_SELIC_2029', nome: 'Tesouro Selic 2029', preco: 14520.00, dy: 10.75, variacao: 0, rentabilidade: 0, vencimento: '01/03/2029' },
    { id: 'TESOURO_IPCA_2035',  nome: 'Tesouro IPCA+ 2035', preco:  3820.00, dy: 6.20,  variacao: 0, rentabilidade: 0, vencimento: '15/05/2035' },
    { id: 'TESOURO_PRE_2029',   nome: 'Tesouro Prefixado 2029', preco: 7850.00, dy: 11.50, variacao: 0, rentabilidade: 0, vencimento: '01/01/2029' }
  ],
  selic: 10.75,
  ultima_atualizacao: null
};

// ============================================================
// VERIFICAR SE A BOLSA ESTÁ VAZIA
// ============================================================
export function bolsaEstaVazia(bolsa) {
  if (!bolsa) return true;
  const total = (bolsa.acoes?.length || 0) 
              + (bolsa.fiis?.length || 0) 
              + (bolsa.etfs?.length || 0) 
              + (bolsa.tesouro?.length || 0);
  return total === 0;
}

// ============================================================
// POPULAR BOLSA (idempotente — só popula se vazia)
// ============================================================
export async function popularBolsaSeVazia(login) {
  if (!login) return { populado: false, motivo: 'sem_login' };

  try {
    // 1. Buscar estado atual
    const { data, error } = await db
      .from(TABELA)
      .select('fazendinha_dados')
      .eq('login', login)
      .maybeSingle();

    if (error) throw error;
    if (!data) return { populado: false, motivo: 'usuario_nao_encontrado' };

    const fazendinha = data.fazendinha_dados || {};
    const bolsaAtual = fazendinha.bolsa;

    // 2. Se já tem ativos, não popula
    if (!bolsaEstaVazia(bolsaAtual)) {
      return { populado: false, motivo: 'ja_populada', total: contarAtivos(bolsaAtual) };
    }

    // 3. Popular com dados padrão
    const bolsaNova = {
      ...ATIVOS_PADRAO,
      ultima_atualizacao: new Date().toISOString()
    };

    const { error: updateError } = await db
      .from(TABELA)
      .update({
        fazendinha_dados: {
          ...fazendinha,
          bolsa: bolsaNova
        },
        selic: ATIVOS_PADRAO.selic,
        updated_at: new Date().toISOString()
      })
      .eq('login', login);

    if (updateError) throw updateError;

    const total = contarAtivos(bolsaNova);
    console.log(`✅ Bolsa populada com ${total} ativos para ${login}`);

    return { populado: true, total, bolsa: bolsaNova };

  } catch (e) {
    console.error('Erro ao popular bolsa:', e);
    return { populado: false, motivo: 'erro', erro: e.message };
  }
}

// ============================================================
// CONTAR ATIVOS
// ============================================================
export function contarAtivos(bolsa) {
  if (!bolsa) return 0;
  return (bolsa.acoes?.length || 0) 
       + (bolsa.fiis?.length || 0) 
       + (bolsa.etfs?.length || 0) 
       + (bolsa.tesouro?.length || 0);
}

// ============================================================
// FORÇAR RESET (útil para testes)
// ============================================================
export async function resetarBolsa(login) {
  if (!login) return false;

  try {
    const { data } = await db
      .from(TABELA)
      .select('fazendinha_dados')
      .eq('login', login)
      .maybeSingle();

    const fazendinha = data?.fazendinha_dados || {};

    const { error } = await db
      .from(TABELA)
      .update({
        fazendinha_dados: {
          ...fazendinha,
          bolsa: {
            ...ATIVOS_PADRAO,
            ultima_atualizacao: new Date().toISOString()
          }
        },
        updated_at: new Date().toISOString()
      })
      .eq('login', login);

    if (error) throw error;
    console.log('🔄 Bolsa resetada para padrão');
    return true;
  } catch (e) {
    console.error('Erro ao resetar:', e);
    return false;
  }
}

// ============================================================
// GARANTIR ATIVO NO CODEX (auto-registra ao comprar)
// ============================================================
export function garantirRegistroCodex(ativo, categoria) {
  if (ativo.registrado_codex) return ativo;

  const config = {
    acoes:   { raridade: 'raro',    tipo: 'Ação',    base: { atk: 15, def: 10, hp: 100 } },
    fiis:    { raridade: 'epico',   tipo: 'FII',     base: { atk: 30, def: 20, hp: 250 } },
    etfs:    { raridade: 'epico',   tipo: 'ETF',     base: { atk: 30, def: 20, hp: 250 } },
    tesouro: { raridade: 'lendario',tipo: 'Tesouro', base: { atk: 50, def: 35, hp: 500 } }
  }[categoria] || { raridade: 'raro', tipo: 'Ativo', base: { atk: 15, def: 10, hp: 100 } };

  const tier = Math.min(20, Math.max(1, Math.floor((ativo.preco || 10) / 5)));
  const fator = tier / 10;

  ativo.registrado_codex = true;
  ativo.registrado_em = new Date().toISOString();
  ativo.raridade = config.raridade;
  ativo.tipo = config.tipo;
  ativo.tier = tier;
  ativo.bonus = {
    atk: Math.round(config.base.atk * fator),
    def: Math.round(config.base.def * fator),
    hp:  Math.round(config.base.hp  * fator)
  };

  return ativo;
}