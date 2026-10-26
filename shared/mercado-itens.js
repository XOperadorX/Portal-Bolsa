import { ITENS_SHAGRILA, CATALOGO_SHAGRILA, ELEMENTOS_SHAGRILA, SLOTS_SHAGRILA, slotsItemShagrila, resumoItemShagrila, equiparShagrila } from './shagrila-catalogo.js';
import { obterTaxa } from './taxas-globais.js';
const SHAGRILA = [
  ...ITENS_SHAGRILA.map(i=>[i.nome,i.preco]),
  ['Poção', .01], ['Poção Maior', .02], ['Elixir', .04], ['Gema Rara', .06],
  ['Máscara de Lycagon', .16], ['Coração da Tempestade', .18], ['Olho de Ctarnidd', .20],
  ['Escama de Bahamut', .20], ['Fruto de Yggdrasil', .20], ['Máscara do Coelho Vorpal', .20], ['Espada Divina Ashura', .20],
  ['Lâmina Gêmea', .10], ['Máscara do Pássaro', .08]
];
const PRECO_ATIVOS = {PETR4:34.50,VALE3:58.90,ITUB4:31.20,MXRF11:9.90,XPML11:98.40,HGLG11:156,BOVA11:121,IVVB11:330};
const positivo = (valor, padrao) => Number.isFinite(Number(valor)) && Number(valor)>0 ? Number(valor) : padrao;
export function catalogoComplementar(registro = {}) {
  const items = [
    { id:'fert_1', icon:'🧪', name:'Adubo', desc:'Acelera o crescimento', procedencia:'Fazendinha', basePrice:positivo(registro.price_fert,11), type:'fert_qty', amount:1, coluna:'fert_qty' },
    { id:'potion_1', icon:'💚', name:'Poção da fazenda', desc:'Consumível da fazenda', procedencia:'Fazendinha', basePrice:positivo(registro.price_potion,150), type:'potion_qty', amount:1, coluna:'potion_qty' },
    ...[['stock','Milho','🌽',positivo(registro.price,9),'Fazendinha',1],  ['btc','Bitcoin','₿',obterTaxa('btc_compra'),'Mineração',1], ['mumu','MUMU x1000','🐄',.01,'Sistema MUMU',1000], ['poder_hash','Poder de mineração','⛏️',500,'Mineração',1]].map(([coluna,name,icon,basePrice,procedencia,amount])=>({id:'col_'+coluna,name,icon,basePrice,procedencia,desc:'Recurso do jogador',type:coluna,coluna,amount,isFixedPrice:coluna!=='stock',quantidade:Number(registro[coluna]||0)}))
  ];
  const inventario = Array.isArray(registro.itens) ? registro.itens.filter(i=>i?.nome).map(i=>[i.nome, Number(i.quantidade ?? i.qtd ?? 0),i.preco ?? i.preco_atual]) : Object.entries(registro.itens || {}).map(([nome,qtd])=>[nome,qtd]);
  const nomes = new Map(SHAGRILA.map(([nome,preco])=>[nome, {preco,quantidade:0,origem:'Shagrila'}]));
  for(const [nome,qtd,preco] of inventario) {
    const atual=nomes.get(nome) || {preco:positivo(preco,1),quantidade:0,origem:'Inventário compartilhado'};
    atual.quantidade+=Number(qtd)||0; nomes.set(nome,atual);
  }
  for(const [nome,info] of nomes) items.push({id:'inv_'+encodeURIComponent(nome),name:nome,icon:'🎒',desc:'Item do inventário',procedencia:info.origem,basePrice:info.preco,type:'inventario',amount:1,nomeItem:nome,isFixedPrice:true,quantidade:info.quantidade});
  for(const [slot,nome] of Object.entries(registro.meta?.equip || {})) {
    if(typeof nome==='string' && nome.trim() && nome.toLowerCase()!=='nenhum') items.push({id:'equip_'+slot,name:nome,icon:'⚔️',desc:'Equipado: '+slot,procedencia:'Shagrila',basePrice:nomes.get(nome)?.preco || .10,type:'equipado',slot,nomeItem:nome,amount:1,isFixedPrice:true,quantidade:1});
  }
  const ativos=new Map();
  for(const categoria of ['acoes','fiis','etfs','tesouro']) for(const ativo of registro.fazendinha_dados?.bolsa?.[categoria] || []) if(ativo.id) ativos.set(ativo.id,ativo);
  for(const ticker of Object.keys(registro.carteira||{})) if(!ativos.has(ticker)) ativos.set(ticker,{id:ticker,preco:positivo(PRECO_ATIVOS[ticker],positivo(registro.preco_medio_compra?.[ticker],1))});
  for(const [ticker,ativo] of ativos) items.push({id:'ativo_'+encodeURIComponent(ticker),ticker,name:ticker,icon:'📈',desc:ativo.nome || 'Ativo da carteira',procedencia:'Bolsa / Codex',basePrice:positivo(ativo.preco,1),type:'ativo',amount:1,isFixedPrice:true,quantidade:Number(registro.carteira?.[ticker]||0)});
  for(const item of items) if(item.coluna) item.quantidade=Number(registro[item.coluna]||0);
  return items.filter(item=>!cristalForaDoMercado(item));
}
export function adicionarItemInventario(itens, nome, quantidade) {
  if(Array.isArray(itens)) {
    const copia=itens.map(i=>({...i}));
    let restante=quantidade;
    if(quantidade<0) {
      const total=copia.filter(i=>i.nome===nome).reduce((s,i)=>s+Number(i.quantidade??i.qtd??0),0);
      if(total < -quantidade) throw new Error('Quantidade insuficiente');
      for(const item of copia.filter(i=>i.nome===nome)) {
        const atual=Number(item.quantidade??item.qtd??0), retirada=Math.min(atual,-restante);
        item.quantidade=atual-retirada; if('qtd' in item)item.qtd=item.quantidade;
        restante+=retirada; if(!restante)break;
      }
    } else {
      const item=copia.find(i=>i.nome===nome);
      if(item) {item.quantidade=Number(item.quantidade??item.qtd??0)+quantidade;if('qtd' in item)item.qtd=item.quantidade;}
      else copia.push({nome,quantidade});
    }
    return copia.filter(i=>i.nome!==nome || Number(i.quantidade??i.qtd??0)>0);
  }
  const copia={...(itens||{})}, atual=Number(copia[nome]||0);
  if(atual+quantidade<0)throw new Error('Quantidade insuficiente');
  copia[nome]=atual+quantidade;if(!copia[nome])delete copia[nome];return copia;
}
export function precosMercado(item, nivel = 1, mult = .5) {
  const referencia = positivo(item.basePrice,1) * (item.isFixedPrice ? 1 : 1 + Number(nivel)*Number(mult));
  const arredondar = valor => Math.max(.01, Math.round((valor + Number.EPSILON)*100)/100);
  return {referencia:arredondar(referencia),compra:arredondar(referencia*(1+obterTaxa('mercado_compra')/100)),venda:arredondar(referencia*(1-obterTaxa('mercado_venda')/100))};
}
export function quantidadeItem(registro,item) {
  if(item.type==='equipado')return registro.meta?.equip?.[item.slot]===item.name ? 1 : 0;
  if(item.ticker)return Number(registro.carteira?.[item.ticker]||0);
  if(item.coluna)return Number(registro[item.coluna]||0);
  if(item.nomeItem) return Array.isArray(registro.itens) ? registro.itens.filter(i=>i.nome===item.nomeItem).reduce((s,i)=>s+Number(i.quantidade??i.qtd??0),0) : Number(registro.itens?.[item.nomeItem]||0);
  return 0;
}
function cristalForaDoMercado(item={}) {
 return item.coluna==='cristais'||item.type==='cristais'||item.id==='col_cristais'||[item.name,item.nomeItem].some(nome=>String(nome||'').replace('💎','').trim().toLocaleLowerCase('pt-BR')==='cristais');
}
export function negociarItem(registro,item,operacao,preco) {
  if(cristalForaDoMercado(item))throw new Error('Cristais são uma moeda rara doada pelo ADM e não podem ser comprados ou vendidos neste mercado');
  if(!['compra','venda'].includes(operacao) || !Number.isFinite(preco) || preco<=0)throw new Error('Operação inválida');
  const j=structuredClone(registro), quantidade=item.amount || 1, venda=operacao==='venda', sinal=venda?-1:1;
  if(venda && quantidadeItem(j,item)<quantidade)throw new Error('Quantidade insuficiente para vender');
  if(!venda && Number(j.saldo||0)<preco)throw new Error('Saldo insuficiente');
  if(item.type==='equipado' && venda)j.meta.equip[item.slot]='Nenhum';
  else if(item.ticker) {
    j.carteira={...(j.carteira||{})};j.preco_medio_compra={...(j.preco_medio_compra||{})};
    const atual=Number(j.carteira[item.ticker]||0);
    if(!venda)j.preco_medio_compra[item.ticker]=Number(((Number(j.preco_medio_compra[item.ticker]||0)*atual+preco)/(atual+quantidade)).toFixed(2));
    j.carteira[item.ticker]=atual+sinal*quantidade;
    if(j.carteira[item.ticker]===0)delete j.preco_medio_compra[item.ticker];
  } else if(item.coluna)j[item.coluna]=Number(j[item.coluna]||0)+sinal*quantidade;
  else if(item.nomeItem)j.itens=adicionarItemInventario(j.itens,item.nomeItem,sinal*quantidade);
  else throw new Error('Item sem destino de inventário');
  j.saldo=Number((Number(j.saldo||0)+(venda?preco:-preco)).toFixed(2));
  return j;
}

export function detalhesItemMercado(item) {
 const origem=CATALOGO_SHAGRILA[item.nomeItem||item.name];
 if(origem)return {descricao:origem.descricao||resumoItemShagrila(origem),atributos:resumoItemShagrila(origem),elemento:ELEMENTOS_SHAGRILA[origem.elemento]||'Não se aplica',slots:slotsItemShagrila(origem),espacos:slotsItemShagrila(origem).map(s=>SLOTS_SHAGRILA[s]).join(' / ')};
 const efeitos={'Poção':'Recupera 30 HP','Poção Maior':'Recupera 70 HP','Elixir':'Recupera 150 HP',stamina:'Recupera 10 SM ao usar',fert_qty:'Acelera o crescimento da plantação',potion_qty:'Consumível da fazenda',seed:'Sementes para plantar',bucket:'Rega e acelera o crescimento'};
 return {descricao:item.desc||'Item do inventário compartilhado',atributos:efeitos[item.name]||efeitos[item.type]||({'seeds':'Sementes para plantar','buckets':'Rega e acelera o crescimento'})[item.type]||(item.type==='ativo'?'Ativo financeiro: não concede atributos de equipamento':'Sem bônus de combate cadastrado'),elemento:'Não se aplica',slots:[],espacos:''};
}
export function equiparItemMercado(registro,item,slot) {
 if(item.type!=='inventario'||!slotsItemShagrila(CATALOGO_SHAGRILA[item.nomeItem]).length)throw Error('Este item não é um equipamento disponível na mochila');
 const inventario={};
 if(Array.isArray(registro.itens)){for(const i of registro.itens)if(i?.nome)inventario[i.nome]=(inventario[i.nome]||0)+Number(i.quantidade??i.qtd??0);}
 else Object.assign(inventario,registro.itens||{});
 const p={inventory:{...inventario},equip:{...registro.meta?.equip},vit:Number(registro.defesa_base||0)};
 equiparShagrila(p,item.nomeItem,slot);
 let itens=registro.itens;
 for(const nome of new Set([...Object.keys(inventario),...Object.keys(p.inventory)])){
  const diferenca=(p.inventory[nome]||0)-(inventario[nome]||0);
  if(diferenca)itens=adicionarItemInventario(itens,nome,diferenca);
 }
 return {...registro,itens,meta:{...registro.meta,equip:p.equip}};
}
