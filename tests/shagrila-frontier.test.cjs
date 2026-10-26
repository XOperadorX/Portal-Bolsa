const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const catalog=require('./carregar-catalogo-shagrila.cjs');
const {ITENS_SHAGRILA,CATALOGO_SHAGRILA,forjarShagrila,equiparShagrila,equipamentoShagrila}=catalog;
assert.equal(new Set(ITENS_SHAGRILA.map(i=>i.nome)).size,ITENS_SHAGRILA.length);
for(const item of ITENS_SHAGRILA){assert(item.preco>0);assert(item.origem);assert(['fisico','ar','agua','fogo','terra'].includes(item.elemento));}
const hero={inventory:{'Espada de Ferro':1,'Adaga de Ferro':1},equip:{arma:'Mercenário Twinblade'},vit:8};
equiparShagrila(hero,'Espada de Ferro');assert.equal(hero.equip.mao_direita,'Espada de Ferro');assert.equal(hero.inventory['Mercenário Twinblade'],1);assert(!hero.inventory['Espada de Ferro']);
assert.throws(()=>equiparShagrila(hero,'Espada de Ferro'),/indisponível/);
hero.inventory['Gilta Brille']=1;assert.throws(()=>equiparShagrila(hero,'Gilta Brille'),/400/);assert.equal(hero.inventory['Gilta Brille'],1);
hero.equip.cintura='Excavated Grindsash [Veteran]';equiparShagrila(hero,'Gilta Brille');assert.equal(hero.equip.mao_direita,'Gilta Brille');
assert.equal(equipamentoShagrila(hero.equip).mao_direita.elemento,'terra');
const inv={'Minério Cinzento':5};const crafted=forjarShagrila(inv,'Espada de Ferro');assert.equal(crafted['Espada de Ferro'],1);assert(!crafted['Minério Cinzento']);assert.equal(inv['Minério Cinzento'],5);
assert.throws(()=>forjarShagrila(inv,'Togetsu'),/insuficientes/);assert.deepEqual(inv,{'Minério Cinzento':5});
const html=fs.readFileSync('jogos/shagrila/shagrila.html','utf8');
const feature=html.slice(html.indexOf('// ==================== CATÁLOGO FRONTIER'),html.indexOf('// ==================== INICIALIZAÇÃO'));
let saves=0;const player={hp:30,maxHp:100,mp:0,maxMp:50,str:10,coins:100,shagrila:{},combate:{},equip:{},inventory:{Herb:2,'Poção MP':1,'Escalas de Recompensa':1,'Livro de Habilidades Céu Claro':2,'Salvamento Divino':1}};
const ctx=vm.createContext({...catalog,currentPlayer:player,currentEnemy:null,window:{},addLog(){},updateUI(){},saveDB(){saves++},atributosPersonagem:()=>({curaPocao:0}),curaPocao:n=>n});
vm.runInContext(feature,ctx);
ctx.usarItemFrontier(CATALOGO_SHAGRILA.Herb);assert.equal(player.hp,55);assert.equal(player.inventory.Herb,1);
ctx.usarItemFrontier(CATALOGO_SHAGRILA['Poção MP']);assert.equal(player.mp,30);assert(!player.inventory['Poção MP']);
ctx.usarItemFrontier(CATALOGO_SHAGRILA['Escalas de Recompensa']);assert.equal(player.str,11);assert.equal(player.coins,0);assert.equal(player.inventory['Escalas de Recompensa'],1);
ctx.usarItemFrontier(CATALOGO_SHAGRILA['Livro de Habilidades Céu Claro']);ctx.usarItemFrontier(CATALOGO_SHAGRILA['Livro de Habilidades Céu Claro']);assert.equal(player.inventory['Livro de Habilidades Céu Claro'],1);assert.equal(catalog.bonusCombateFrontier(player.shagrila).danoBoss,10);
ctx.usarItemFrontier(CATALOGO_SHAGRILA['Salvamento Divino']);assert.equal(player.shagrila.resgate,'reviver');assert(saves>=5);
const C=new Function(fs.readFileSync('shared/combate-config.js','utf8').replace('export const','const')+';return COMBATE_CONFIG;')();
const engineSrc=fs.readFileSync('shared/combate.js','utf8').replace(/^import .*;\s*/gm,'').replaceAll('export const','const').replaceAll('export function','function');
const engine=new Function('C',engineSrc+';return {atributosPersonagem,resolverGolpe};')(C);
const stats=engine.atributosPersonagem({hp:100,maxHp:100,str:10,vit:5,equip:{arma:'Espada de Ferro',cabeca:'Máscara de Couro Splitblade'}});assert.equal(stats.dano,22);assert.equal(stats.armadura,11);assert.equal(stats.resistenciaFisica,4);
const golpe=el=>engine.resolverGolpe({hp:100,maxHp:100,dano:100,elemento:'fogo'},{hp:1000,maxHp:1000,elemento:el},{rng:()=>.99}).dano;assert(golpe('ar')>golpe('agua'));
for(const file of ['jogos/shagrila/shagrila.html','jogos/mochila/mochila.html'])for(const match of fs.readFileSync(file,'utf8').matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)){if(!match[2].trim())continue;if(/type=['"]module['"]/.test(match[1]))new vm.SourceTextModule(match[2]);else new vm.Script(match[2]);}
console.log('OK: '+ITENS_SHAGRILA.length+' itens, equipamentos sem duplicação, requisito de vitalidade, forja atômica, consumíveis, relíquias, elementos, bônus reais e sintaxe.');

const jogador={vit:8,inventory:{'Brinco de Brisa':2,'Bota de Couro':2,'Espada de Ferro':1},equip:{}};
equiparShagrila(jogador,'Brinco de Brisa','brinco_esquerdo');equiparShagrila(jogador,'Brinco de Brisa','brinco_direito');
assert.equal(jogador.equip.brinco_esquerdo,'Brinco de Brisa');assert.equal(jogador.equip.brinco_direito,'Brinco de Brisa');assert(!jogador.inventory['Brinco de Brisa']);
assert.throws(()=>equiparShagrila(jogador,'Espada de Ferro','elmo'),/espaço/);assert.equal(jogador.inventory['Espada de Ferro'],1);
equiparShagrila(jogador,'Bota de Couro','bota_direita');assert.equal(jogador.inventory['Bota de Couro'],1);
const migrado=catalog.normalizarEquipShagrila({cabeca:'Máscara do Pássaro',corpo:'Peitoral de Ferro',bota:'Bota de Couro',colar:'Colar da Alma Vorpal'});
assert.equal(migrado.elmo,'Máscara do Pássaro');assert.equal(migrado.peitoral,'Peitoral de Ferro');assert.equal(migrado.bota_esquerda,'Bota de Couro');assert.equal(migrado.pescoco,'Colar da Alma Vorpal');assert(!migrado.cabeca);
assert.deepEqual(catalog.normalizarEquipShagrila(migrado),migrado);
console.log('OK: lados independentes, unidades reais, compatibilidade por espaço e migração sem duplicação.');

const pares=catalog.migrarInventarioLaminas({'Lâmina Gêmea':2,'Poção':1});assert.equal(pares['Lâmina Gêmea Esquerda'],2);assert.equal(pares['Lâmina Gêmea Direita'],2);assert(!pares['Lâmina Gêmea']);assert.deepEqual(catalog.migrarInventarioLaminas(pares),pares);
const parEquipado=catalog.normalizarEquipShagrila({arma:'Lâmina Gêmea'});assert.equal(parEquipado.mao_esquerda,'Lâmina Gêmea Esquerda');assert.equal(parEquipado.mao_direita,'Lâmina Gêmea Direita');assert(!parEquipado.arma);
const bonusPar=engine.atributosPersonagem({str:10,equip:parEquipado});assert.equal(bonusPar.dano,16);assert.equal(bonusPar.golpeDuplo,2);
assert(!CATALOGO_SHAGRILA['Lâmina Gêmea']);console.log('OK: lâminas separadas, migração idempotente e bônus do par preservado.');

assert.deepEqual(Object.values(catalog.SLOTS_SHAGRILA),['Brinco Esquerdo','Brinco Direito','Elmo','Mão Esquerda','Mão Direita','Pescoço','Peitoral','Cintura','Calça','Bota Esquerda','Bota Direita']);
const devolvidos={};const conversao=catalog.normalizarEquipShagrila({mao_direita:'Espada de Ferro',lamina_direita:'Lâmina Gêmea Direita',escudo:'Escudo de Madeira',manopla_esquerda:'Manopla de Ferro',flechas:'Flechas de Ferro',acessorio:'Inventoria Key',pingente:'Medalha do Viajante'},devolvidos);
assert.equal(conversao.mao_direita,'Espada de Ferro');assert.equal(conversao.mao_esquerda,'Escudo de Madeira');assert.equal(conversao.pescoco,'Medalha do Viajante');assert.equal(devolvidos['Lâmina Gêmea Direita'],1);assert.equal(devolvidos['Manopla de Ferro'],1);assert.equal(devolvidos['Flechas de Ferro'],1);assert.equal(devolvidos['Inventoria Key'],1);
assert.deepEqual(catalog.normalizarEquipShagrila(conversao,devolvidos),conversao);assert.equal(devolvidos['Manopla de Ferro'],1);
console.log('OK: estrutura solicitada, conversão de espaços e devolução de peças excedentes.');
