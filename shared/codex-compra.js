import { obterTaxa } from './taxas-globais.js';
import { db, TABELA, calcularBonusAtivo } from '../config.js';

export async function registrarAtivoNoCodex(login, categoria, ativoId) {
  const { data: atual, error: erroLeitura } = await db.from(TABELA)
    .select('*').eq('login', login).single();
  if (erroLeitura) throw erroLeitura;
  const fazendinha = atual.fazendinha_dados || {};
  const bolsa = fazendinha.bolsa || {};
  const ativo = (bolsa[categoria] || []).find(a => a.id === ativoId);
  if (!ativo) throw new Error('Ativo não encontrado');
  if (ativo.registrado_codex) return { jaRegistrado: true, ativo };

  const custo = Number((Number(ativo.preco) * (1 + obterTaxa('codex_acrescimo') / 100)).toFixed(2));
  const saldo = Number(atual.saldo || 0);
  if (!Number.isFinite(custo) || custo <= 0) throw new Error('Preço do ativo inválido');
  if (saldo < custo) throw new Error('Saldo S$ insuficiente para comprar este ativo');

  const carteira = { ...(atual.carteira || {}) };
  const precos = { ...(atual.preco_medio_compra || {}) };
  const quantidade = Number(carteira[ativoId] || 0);
  precos[ativoId] = Number(((Number(precos[ativoId] || 0) * quantidade + custo) / (quantidade + 1)).toFixed(2));
  carteira[ativoId] = quantidade + 1;
  const calc = calcularBonusAtivo(ativo.preco, categoria);
  Object.assign(ativo, {
    carteira_codex_sincronizada: true, registrado_codex: true, registrado_em: new Date().toISOString(),
    tier: calc.tier, raridade: calc.raridade, bonus: calc.bonus, tipo: calc.tipo
  });
  bolsa.ultima_atualizacao = new Date().toISOString();

  // Compra, saldo e registro são gravados juntos. O filtro evita confirmar dados desatualizados.
  let consulta = db.from(TABELA).update({
    saldo: Number((saldo - custo).toFixed(2)), carteira, preco_medio_compra: precos,
    fazendinha_dados: { ...fazendinha, bolsa }, updated_at: bolsa.ultima_atualizacao
  }).eq('login', login).eq('saldo', atual.saldo);
  consulta = atual.updated_at == null ? consulta.is('updated_at', null) : consulta.eq('updated_at', atual.updated_at);
  const { data: salvo, error } = await consulta.select('id').maybeSingle();
  if (error) throw error;
  if (!salvo) throw new Error('Seus dados mudaram. Atualize a página e tente novamente.');
  return { jaRegistrado: false, ativo, custo };
}

