require('./carregar-catalogo-shagrila.cjs');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const mochila = fs.readFileSync('jogos/mochila/mochila.html','utf8');
const extract = new Function(mochila.match(/function extrairItens\(d\) \{[\s\S]*?return itens;\s*\}/)[0]+';return extrairItens;')();
const row = { itens:{'Poção':5,'Elixir':2,'Gema Rara':3,'Máscara de Lycagon':1,'Poção Maior':0}, meta:{equip:{arma:'Lâmina Gêmea',cabeca:'Máscara do Pássaro',corpo:'Nenhum',bota:''}}, carteira:{PETR4:2}, stock:4 };
const snapshot=JSON.stringify(row);
const items=extract(row);
for(const [name,qty] of Object.entries(row.itens)) assert.equal(items.find(i=>i.nome===name)?.quantidade,qty||undefined);
assert.equal(items.filter(i=>i.origem==='shagrila_equipado').length,2);
assert.equal(items.find(i=>i.nome==='Lâmina Gêmea').quantidade,1);
assert.equal(items.find(i=>i.nome==='PETR4').quantidade,2);
assert.equal(items.find(i=>i.nome==='Milho').quantidade,4);
assert.equal(JSON.stringify(row),snapshot);
assert.deepEqual(extract(row),items);
assert.equal(extract({itens:[{nome:'Elixir',quantidade:2}],meta:{}})[0].quantidade,2);
assert.equal(extract({}).length,0);
const priceFunction = mochila.slice(mochila.indexOf('function precoVendaUnitario('),mochila.indexOf('function renderResumo('));
const price=new Function(priceFunction+';return precoVendaUnitario;')();
assert.equal(price({origem:'shagrila_equipado'},{}),null);
for(const path of ['jogos/mochila/mochila.html','jogos/shagrila/shagrila.html']) {
 const html=fs.readFileSync(path,'utf8');
 for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
  if(/src\s*=|importmap/.test(m[1]))continue;
  if(/type=['"]module['"]/.test(m[1]))new vm.SourceTextModule(m[2]);else new vm.Script(m[2]);
 }
}
assert.ok(fs.readFileSync('jogos/shagrila/shagrila.html','utf8').includes("localStorage.setItem('portal_bolsa_dados_atualizados'"));
console.log('OK: consumíveis, gemas, lendários, equipamentos, quantidades, itens antigos, inventário vazio e sintaxe.');
