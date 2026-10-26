const fs=require('fs'),assert=require('assert/strict'),vm=require('vm');
const src=fs.readFileSync('shared/mumu-taxas.js','utf8').replace(/^import .*;\s*/gm,'').replace('export function','function');
const pacotes=new Function(src+';return pacotesMumu;')();
const taxas={mumu_pacote_10:1,mumu_pacote_20:2,mumu_pacote_50:5,mumu_pacote_100:10,mumu_pacote_200:20,mumu_desfazer_desconto:50};
assert.deepEqual(pacotes(id=>taxas[id]).map(p=>[p.saldo,p.retorno]),[[1,5],[2,10],[5,25],[10,50],[20,100]]);
taxas.mumu_pacote_10=2;taxas.mumu_desfazer_desconto=25;assert.equal(pacotes(id=>taxas[id])[0].saldo,2);assert.equal(pacotes(id=>taxas[id])[0].retorno,7.5);
const html=fs.readFileSync('jogos/mumu/mumu.html','utf8');for(const m of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)){if(!m[2].trim())continue;if(m[1].includes('module'))new vm.SourceTextModule(m[2]);else new vm.Script(m[2]);}
assert(html.includes('document.readyState'));assert(html.includes('Cotação: 1 MUMU'));assert(!html.includes('Você recebe 50% do valor original.'));
const sql=fs.readFileSync('dados/admin/sql/instalar-taxas.sql','utf8');for(const id of Object.keys(taxas)){assert(sql.includes(id));assert(sql.includes("jsonb_typeof(valores->'"+id+"')"));}
console.log('OK: cinco pacotes, desconto configurável, valores exibidos e enviados, inicialização e definição SQL.');
