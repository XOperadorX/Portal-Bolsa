export const DEFINICOES_TAXAS = [
  {
    "id": "mercado_compra",
    "grupo": "Mercado",
    "nome": "Acréscimo na compra",
    "padrao": 50,
    "min": 0,
    "max": 1000,
    "unidade": "%",
    "procedimento": "Preço de referência × (1 + percentual/100).",
    "origem": "jogos/mercado/mercado.html"
  },
  {
    "id": "mercado_venda",
    "grupo": "Mercado",
    "nome": "Desconto na venda",
    "padrao": 50,
    "min": 0,
    "max": 100,
    "unidade": "%",
    "procedimento": "Preço de referência × (1 − percentual/100). Retira a quantidade vendida do estoque.",
    "origem": "jogos/mercado/mercado.html"
  },
  {
    "id": "codex_acrescimo",
    "grupo": "Codex",
    "nome": "Acréscimo dos ativos",
    "padrao": 40,
    "min": 0,
    "max": 1000,
    "unidade": "%",
    "procedimento": "Preço do ativo × (1 + percentual/100). Compra registra uma unidade na carteira.",
    "origem": "codex.html"
  },
  {
    "id": "pix_admin",
    "grupo": "Pix",
    "nome": "Taxa administrativa",
    "padrao": 10,
    "min": 0,
    "max": 100,
    "unidade": "%",
    "procedimento": "Descontada do valor bruto convertido antes de registrar o saque.",
    "origem": "jogos/pix/pix.html"
  },
  {
    "id": "pix_conversao",
    "grupo": "Pix",
    "nome": "Conversão por MUMU",
    "padrao": 0.00001,
    "min": 1e-9,
    "max": 1000,
    "unidade": "por MUMU",
    "procedimento": "MUMU solicitado × cotação = valor bruto do Pix.",
    "origem": "jogos/pix/pix.html"
  },
  {
    "id": "pix_minimo",
    "grupo": "Pix",
    "nome": "Mínimo em MUMU",
    "padrao": 1000,
    "min": 1,
    "max": 1000000000000,
    "unidade": "M$",
    "procedimento": "Quantidade mínima para solicitar saque.",
    "origem": "jogos/pix/pix.html"
  },
  {
    "id": "pix_limite",
    "grupo": "Pix",
    "nome": "Limite diário padrão",
    "padrao": 500,
    "min": 0.01,
    "max": 1000000000,
    "unidade": "valor",
    "procedimento": "Limite padrão para contas sem limite individual configurado.",
    "origem": "jogos/pix/pix.html"
  },
  {
    "id": "planta_taxa",
    "grupo": "Fazendinha",
    "nome": "Desconto do milho",
    "padrao": 10,
    "min": 0,
    "max": 100,
    "unidade": "%",
    "procedimento": "Aplica o desconto ao preço por nível antes da venda do milho.",
    "origem": "jogos/planta/planta.html"
  },
  {
    "id": "nivel_multiplicador",
    "grupo": "Fazendinha",
    "nome": "Multiplicador por nível",
    "padrao": 0.5,
    "min": 0,
    "max": 100,
    "unidade": "fator",
    "procedimento": "Preço-base × (1 + nível × multiplicador).",
    "origem": "jogos/planta/planta.html"
  },
  {
    "id": "mochila_desconto",
    "grupo": "Mochila",
    "nome": "Desconto na venda",
    "padrao": 50,
    "min": 0,
    "max": 100,
    "unidade": "%",
    "procedimento": "Preço de referência do recurso × (1 − percentual/100).",
    "origem": "jogos/mochila/mochila.html"
  },
  {
    "id": "trocas_taxa",
    "grupo": "Trocas",
    "nome": "Taxa de negociação",
    "padrao": 5,
    "min": 0,
    "max": 100,
    "unidade": "%",
    "procedimento": "Preço negociado × percentual/100. Aplicada nas trocas entre jogadores.",
    "origem": "jogos/mochila/trocap.html"
  },
  {
    "id": "poupanca_rendimento",
    "grupo": "Bolsa",
    "nome": "Rendimento da poupança",
    "padrao": 0.6,
    "min": 0,
    "max": 100,
    "unidade": "%",
    "procedimento": "Saldo da poupança × percentual/100 em cada ciclo existente do jogo.",
    "origem": "jogos/bolsa/bolsa.html"
  },
  {
    "id": "bi_entrada",
    "grupo": "Banco Imobiliário",
    "nome": "Taxa de entrada",
    "padrao": 1,
    "min": 0,
    "max": 1000000,
    "unidade": "S$",
    "procedimento": "Valor fixo debitado ao entrar no jogo.",
    "origem": "jogos/bi/bi.html"
  },
  {
    "id": "bi_aluguel",
    "grupo": "Banco Imobiliário",
    "nome": "Aluguel de propriedade",
    "padrao": 30,
    "min": 0,
    "max": 100,
    "unidade": "%",
    "procedimento": "Preço da propriedade × percentual/100, arredondado para baixo.",
    "origem": "jogos/bi/bi.html"
  },
  {
    "id": "bi_servico",
    "grupo": "Banco Imobiliário",
    "nome": "Aluguel de serviço",
    "padrao": 25,
    "min": 0,
    "max": 100,
    "unidade": "%",
    "procedimento": "Preço da casa de serviço × percentual/100, arredondado para baixo.",
    "origem": "jogos/bi/bi.html"
  },
  {
    "id": "bi_compra",
    "grupo": "Banco Imobiliário",
    "nome": "Taxa de compra de propriedade",
    "padrao": 0,
    "min": 0,
    "max": 100,
    "unidade": "%",
    "procedimento": "Acrescentada ao preço atualizado pela SELIC na compra de uma propriedade.",
    "origem": "jogos/bi/bi.html"
  },
  {
    "id": "bi_venda",
    "grupo": "Banco Imobiliário",
    "nome": "Taxa de venda de propriedade",
    "padrao": 0,
    "min": 0,
    "max": 100,
    "unidade": "%",
    "procedimento": "Descontada do valor negociado e paga pelo vendedor ao concluir uma venda.",
    "origem": "jogos/bi/bi.html"
  },
  {
    "id": "bi_troca",
    "grupo": "Banco Imobiliário",
    "nome": "Taxa de troca de propriedade",
    "padrao": 0,
    "min": 0,
    "max": 100,
    "unidade": "%",
    "procedimento": "Cobrança de cada participante sobre o valor SELIC da propriedade que entrega na troca.",
    "origem": "jogos/bi/bi.html"
  },
  {
    "id": "bi_imposto",
    "grupo": "Banco Imobiliário",
    "nome": "Acréscimo de imposto das casas",
    "padrao": 0,
    "min": 0,
    "max": 100,
    "unidade": "%",
    "procedimento": "Acrescentado ao valor-base da casa de imposto, após atualização pela SELIC.",
    "origem": "jogos/bi/bi.html"
  },
  {
    "id": "mineracao_mercado",
    "grupo": "Mineração",
    "nome": "Desconto na venda no mercado",
    "padrao": 20,
    "min": 0,
    "max": 100,
    "unidade": "%",
    "procedimento": "Valor bruto do poder de mineração × (1 − percentual/100).",
    "origem": "jogos/minerar/minerar.html"
  },
  {
    "id": "mineracao_base",
    "grupo": "Mineração",
    "nome": "Desconto na venda da base",
    "padrao": 35,
    "min": 0,
    "max": 100,
    "unidade": "%",
    "procedimento": "Valor bruto da base de mineração × (1 − percentual/100).",
    "origem": "jogos/minerar/minerar.html"
  },
  {
    "id": "mineracao_passiva",
    "grupo": "Mineração",
    "nome": "Ganho passivo por poder/segundo",
    "padrao": 1e-8,
    "min": 0,
    "max": 1,
    "unidade": "BTC/s",
    "procedimento": "Poder ativo × taxa × segundos do ciclo.",
    "origem": "jogos/minerar/minerar.html"
  },
  {
    "id": "btc_compra",
    "grupo": "Câmbio do jogo",
    "nome": "Compra de BTC",
    "padrao": 10000,
    "min": 0.01,
    "max": 1000000000000,
    "unidade": "S$",
    "procedimento": "Custo por BTC no mercado da mineração.",
    "origem": "jogos/minerar/mercado.html"
  },
  {
    "id": "btc_venda",
    "grupo": "Câmbio do jogo",
    "nome": "Venda de BTC",
    "padrao": 999,
    "min": 0.01,
    "max": 1000000000000,
    "unidade": "S$",
    "procedimento": "Crédito por BTC vendido no mercado da mineração.",
    "origem": "jogos/minerar/mercado.html"
  },
  {
    "id": "sm_compra",
    "grupo": "Câmbio do jogo",
    "nome": "Compra de SM",
    "padrao": 12,
    "min": 0.01,
    "max": 1000000,
    "unidade": "S$",
    "procedimento": "Custo por unidade de SM.",
    "origem": "jogos/minerar/mercado.html"
  },
  {
    "id": "sm_venda",
    "grupo": "Câmbio do jogo",
    "nome": "Venda de SM",
    "padrao": 8,
    "min": 0.01,
    "max": 1000000,
    "unidade": "S$",
    "procedimento": "Crédito por unidade de SM vendida.",
    "origem": "jogos/minerar/mercado.html"
  },
  {
    "id": "mumu_saldo",
    "grupo": "Saques e conversões",
    "nome": "Saldo por MUMU",
    "padrao": 100,
    "min": 0.000001,
    "max": 1000000000000,
    "unidade": "S$/M$",
    "procedimento": "Saldo solicitado dividido pela cotação = MUMU recebido.",
    "origem": "saque.html"
  },
  {
    "id": "mumu_minimo",
    "grupo": "Saques e conversões",
    "nome": "Saldo mínimo para MUMU",
    "padrao": 50,
    "min": 0,
    "max": 1000000000000,
    "unidade": "S$",
    "procedimento": "Valor mínimo na aba de saque em MUMU.",
    "origem": "saque.html"
  },
  {
    "id": "usdt_saldo",
    "grupo": "Saques e conversões",
    "nome": "Saldo por USDT",
    "padrao": 1000000,
    "min": 0.000001,
    "max": 1000000000000000,
    "unidade": "S$/USDT",
    "procedimento": "Saldo solicitado dividido pela cotação = USDT recebido.",
    "origem": "saque.html"
  },
  {
    "id": "usdt_minimo",
    "grupo": "Saques e conversões",
    "nome": "Saque mínimo em USDT",
    "padrao": 0.01,
    "min": 0.000001,
    "max": 1000000000,
    "unidade": "USDT",
    "procedimento": "O saldo mínimo é esta quantidade multiplicada pela cotação.",
    "origem": "saque.html"
  },
  {
    "id": "geral_selic",
    "grupo": "Investimentos do jogo",
    "nome": "Rendimento: selic",
    "padrao": 5e-7,
    "min": 0,
    "max": 1,
    "unidade": "fator/s",
    "procedimento": "Quantidade × preço × taxa × segundos do ciclo.",
    "origem": "jogos/geral/geral.html"
  },
  {
    "id": "geral_acoes",
    "grupo": "Investimentos do jogo",
    "nome": "Rendimento: acoes",
    "padrao": 3e-7,
    "min": 0,
    "max": 1,
    "unidade": "fator/s",
    "procedimento": "Quantidade × preço × taxa × segundos do ciclo.",
    "origem": "jogos/geral/geral.html"
  },
  {
    "id": "geral_fiis",
    "grupo": "Investimentos do jogo",
    "nome": "Rendimento: fiis",
    "padrao": 7e-7,
    "min": 0,
    "max": 1,
    "unidade": "fator/s",
    "procedimento": "Quantidade × preço × taxa × segundos do ciclo.",
    "origem": "jogos/geral/geral.html"
  },
  {
    "id": "geral_cdb",
    "grupo": "Investimentos do jogo",
    "nome": "Rendimento: cdb",
    "padrao": 6e-7,
    "min": 0,
    "max": 1,
    "unidade": "fator/s",
    "procedimento": "Quantidade × preço × taxa × segundos do ciclo.",
    "origem": "jogos/geral/geral.html"
  },
  {
    "id": "geral_poupanca",
    "grupo": "Investimentos do jogo",
    "nome": "Rendimento: poupanca",
    "padrao": 4e-7,
    "min": 0,
    "max": 1,
    "unidade": "fator/s",
    "procedimento": "Quantidade × preço × taxa × segundos do ciclo.",
    "origem": "jogos/geral/geral.html"
  }
];
DEFINICOES_TAXAS.push({id:'shagrila_venda',grupo:'Shagrila',nome:'Desconto na venda de itens',padrao:50,min:0,max:100,unidade:'%',procedimento:'Preço de loja × (1 − percentual/100), com mínimo de um centavo.',origem:'jogos/shagrila/shagrila.html'});
DEFINICOES_TAXAS.push({id:'bolsa_selic',grupo:'Bolsa',nome:'SELIC global',padrao:10.75,min:0,max:1000,unidade:'% a.a.',procedimento:'Taxa de referência exibida na Bolsa e no Codex. A configuração global publicada prevalece sobre valores individuais.',origem:'jogos/bolsa/bolsa.html'});
DEFINICOES_TAXAS.push(...[{"id": "mumu_pacote_10", "grupo": "Troca MUMU", "nome": "Saldo recebido por 10 MUMU", "padrao": 1.0, "min": 0.01, "max": 1000000, "unidade": "S$", "procedimento": "Pacote de 10 MUMU recebe este saldo. Cotação unitária = saldo / 10.", "origem": "jogos/mumu/mumu.html", "rpcs": ["trocar_mumu_por_saldo", "desfazer_troca"]}, {"id": "mumu_pacote_20", "grupo": "Troca MUMU", "nome": "Saldo recebido por 20 MUMU", "padrao": 2.0, "min": 0.01, "max": 1000000, "unidade": "S$", "procedimento": "Pacote de 20 MUMU recebe este saldo. Cotação unitária = saldo / 20.", "origem": "jogos/mumu/mumu.html", "rpcs": ["trocar_mumu_por_saldo", "desfazer_troca"]}, {"id": "mumu_pacote_50", "grupo": "Troca MUMU", "nome": "Saldo recebido por 50 MUMU", "padrao": 5.0, "min": 0.01, "max": 1000000, "unidade": "S$", "procedimento": "Pacote de 50 MUMU recebe este saldo. Cotação unitária = saldo / 50.", "origem": "jogos/mumu/mumu.html", "rpcs": ["trocar_mumu_por_saldo", "desfazer_troca"]}, {"id": "mumu_pacote_100", "grupo": "Troca MUMU", "nome": "Saldo recebido por 100 MUMU", "padrao": 10.0, "min": 0.01, "max": 1000000, "unidade": "S$", "procedimento": "Pacote de 100 MUMU recebe este saldo. Cotação unitária = saldo / 100.", "origem": "jogos/mumu/mumu.html", "rpcs": ["trocar_mumu_por_saldo", "desfazer_troca"]}, {"id": "mumu_pacote_200", "grupo": "Troca MUMU", "nome": "Saldo recebido por 200 MUMU", "padrao": 20.0, "min": 0.01, "max": 1000000, "unidade": "S$", "procedimento": "Pacote de 200 MUMU recebe este saldo. Cotação unitária = saldo / 200.", "origem": "jogos/mumu/mumu.html", "rpcs": ["trocar_mumu_por_saldo", "desfazer_troca"]}, {"id": "mumu_desfazer_desconto", "grupo": "Troca MUMU", "nome": "Desconto ao desfazer", "padrao": 50, "min": 0, "max": 100, "unidade": "%", "procedimento": "MUMU original × (1 − desconto/100) = MUMU devolvido.", "origem": "jogos/mumu/mumu.html", "rpcs": ["desfazer_troca"]}]);
for (const d of DEFINICOES_TAXAS) {
 const rpcs={trocas_taxa:['criar_troca'],mineracao_mercado:['vender_poder'],mineracao_base:['vender_poder'],mineracao_passiva:['coletar_passiva','minerar_offline']};
 if(rpcs[d.id])d.rpcs=rpcs[d.id];
}
export const TAXAS_PADRAO = Object.fromEntries(DEFINICOES_TAXAS.map(d=>[d.id,d.padrao]));
export function validarTaxas(valores, { completarPadroes = false } = {}) {
 if(!valores || typeof valores !== 'object' || Array.isArray(valores))throw new Error('Configuração inválida');
 const chaves=Object.keys(valores);
 if(chaves.some(id=>!Object.hasOwn(TAXAS_PADRAO,id)))throw new Error('Configuração contém taxas desconhecidas');
 if(completarPadroes && chaves.length) valores={...TAXAS_PADRAO,...valores};
 if(Object.keys(valores).length !== DEFINICOES_TAXAS.length)throw new Error('Configuração incompleta');
 const resultado={};
 for(const d of DEFINICOES_TAXAS){const v=valores[d.id];if(typeof v!=='number' || !Number.isFinite(v) || v<d.min || v>d.max)throw new Error('Valor inválido: '+d.nome);resultado[d.id]=v;}
 return resultado;
}
