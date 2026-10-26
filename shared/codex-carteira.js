// Migra registros antigos uma única vez, sem alterar o saldo do jogador.
export async function sincronizarCodexNaCarteira(cliente, tabela, registro) {
  const fazendinha = structuredClone(registro.fazendinha_dados || {});
  const carteira = { ...(registro.carteira || {}) };
  const precos = { ...(registro.preco_medio_compra || {}) };
  let alterado = false;
  for (const categoria of ['acoes', 'fiis', 'etfs', 'tesouro']) {
    for (const ativo of fazendinha.bolsa?.[categoria] || []) {
      if (!ativo.id || !ativo.registrado_codex || ativo.carteira_codex_sincronizada) continue;
      // Uma posição já existente não deve ganhar uma unidade duplicada.
      if (!(Number(carteira[ativo.id]) > 0)) {
        const preco = Number(ativo.preco);
        if (!Number.isFinite(preco) || preco < 0) continue;
        carteira[ativo.id] = 1;
        precos[ativo.id] = Number((preco * 1.40).toFixed(2));
      }
      ativo.carteira_codex_sincronizada = true;
      alterado = true;
    }
  }
  if (!alterado) return registro;
  const alteracoes = {
    carteira, preco_medio_compra: precos, fazendinha_dados: fazendinha,
    updated_at: new Date().toISOString()
  };
  let consulta = cliente.from(tabela).update(alteracoes).eq('id', registro.id);
  consulta = registro.updated_at == null ? consulta.is('updated_at', null) : consulta.eq('updated_at', registro.updated_at);
  const { data, error } = await consulta.select('*').maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Os dados mudaram durante a sincronização do Codex. Atualize a página.');
  return data;
}
