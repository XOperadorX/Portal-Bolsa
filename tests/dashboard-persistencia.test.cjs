const fs=require('node:fs'),assert=require('node:assert/strict');
const src=fs.readFileSync('shared/dashboard-persistencia.js','utf8').replace('export async function','async function');
const entrada=new Function(src+';return registrarEntradaJogo;')();
function cliente({sm=100,fail=false,conflict=false}={}){let payload,phase='read',filters=[];const q={select(){return this},eq(k,v){filters.push([k,v]);return this},is(k,v){filters.push([k,v]);return this},single:async()=>({data:{login:'teste',sm_atual:sm,updated_at:'versao1'}}),update(p){phase='update';payload=p;return this},maybeSingle:async()=>fail?{error:Error('Falha de rede')}:{data:conflict?null:{login:'teste',sm_atual:payload.sm_atual,sm:payload.sm,updated_at:'versao2'}}};return {from:()=>q,get payload(){return payload},filters};}
(async()=>{const db=cliente();const result=await entrada({db,tabela:'Geral',login:'teste'});assert.equal(result.custo,50);assert.equal(result.registro.sm_atual,50);assert(!('saldo'in db.payload));assert(db.filters.some(([k,v])=>k==='updated_at'&&v==='versao1'));
for(const options of [{fail:true},{conflict:true},{sm:4}])await assert.rejects(()=>entrada({db:cliente(options),tabela:'Geral',login:'teste'}));
const odd=await entrada({db:cliente({sm:11}),tabela:'Geral',login:'teste'});assert.equal(odd.custo,5);assert.equal(odd.registro.sm_atual,6);
console.log('OK: confirmação de gravação, valor do banco, proteção contra conflito, falha e stamina insuficiente.');})().catch(e=>{console.error(e);process.exitCode=1});
