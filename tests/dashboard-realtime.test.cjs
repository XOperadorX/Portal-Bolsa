const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const code=fs.readFileSync('shared/offline-regen.js','utf8').replace('export const','const').replace('export class','class');
const nodes=new Map(),listeners=new Map(),timers=new Map();let interval=0,updates=0,removed=0,onEvent,onStatus,resolveRead;
const now=Date.now();class Clock extends Date{static now(){return now}}
const node=id=>{if(!nodes.has(id))nodes.set(id,{style:{},textContent:'',parentNode:null});return nodes.get(id);};
let row={login:'teste',sm_atual:0,hp_atual:45,mp_atual:12,sm_max:200,hp_max:300,mp_max:80,max_sm:100,max_hp:100,max_mp:50,offline_regen_start:new Date(now-60*60*1000).toISOString()};
let delayed=false;
const supabase={channel(){return {on(_e,filter,fn){assert.equal(filter.filter,'login=eq.teste');onEvent=fn;return this},subscribe(fn){onStatus=fn;return this}}},removeChannel(){removed++},from(){return {select(cols){assert(!cols.includes('senha'));return this},eq(){return this},maybeSingle(){return delayed?new Promise(r=>{resolveRead=r}):Promise.resolve({data:structuredClone(row)})},update(){updates++;return this}}}};
const context={Date:Clock,console,Promise,setInterval:(fn,ms)=>{timers.set(++interval,{fn,ms});return interval},clearInterval:id=>timers.delete(id),clearTimeout(){},document:{hidden:false,getElementById:node,addEventListener:(e,fn)=>listeners.set('doc:'+e,fn),removeEventListener:e=>listeners.delete('doc:'+e)},window:{addEventListener:(e,fn)=>listeners.set('win:'+e,fn),removeEventListener:e=>listeners.delete('win:'+e)}};
vm.createContext(context);vm.runInContext(code+';globalThis.Regen=OfflineRegen;',context);
(async()=>{
 let applied;const regen=new context.Regen({supabase,tabela:'Geral',login:'teste',observarBanco:true,onApply:s=>{applied=s}});
 regen._injetarWidgetSeNecessario=()=>{};regen._widget=node('offlineRegenWidget');
 await regen.init();regen.startAutoTick();assert.equal(applied.sm,0);assert.equal(applied.smMax,200);assert.equal(applied.hpMax,300);assert.equal(node('ogPercent').textContent,'4%');assert.equal(node('ogTimer').textContent,'23:00:00');assert.equal(updates,0);
 regen.tick();assert.equal(regen.sm,0);assert.equal(updates,0);
 onEvent({new:{...row,sm_atual:20,offline_regen_start:new Date(now-12*60*60*1000).toISOString()}});assert.equal(regen.sm,20);assert.equal(node('ogPercent').textContent,'50%');assert.equal(node('ogTimer').textContent,'12:00:00');assert.equal(regen._widget.style.display,'block');
 onEvent({new:{...row,sm_atual:21}});assert.equal(regen._widget.style.display,'none');
 onEvent({new:{...row,sm_atual:20}});assert.equal(regen._widget.style.display,'block');
 onEvent({new:{...row,login:'outro',sm_atual:99}});assert.equal(regen.sm,20);
 delayed=true;const reading=regen.sincronizarDoBanco();onEvent({new:{...row,sm_atual:200,offline_regen_start:null}});resolveRead({data:row});await reading;assert.equal(regen.sm,200);assert.equal(regen.offlineRegenStart,null);assert.equal(regen._widget.style.display,'none');assert.equal(updates,0);
 delayed=false;row={...row,sm_atual:10};await onStatus('SUBSCRIBED');await regen.sincronizarDoBanco();assert.equal(regen.sm,10);
 regen.destroy();assert.equal(removed,1);assert.equal(timers.size,0);assert.equal(listeners.size,0);onEvent({new:row});assert.equal(updates,0);
 const html=fs.readFileSync('dashboard.html','utf8');for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){if(/src\s*=|importmap/.test(m[1]))continue;if(/type="module"/.test(m[1]))new vm.SourceTextModule(m[2]);else new vm.Script(m[2]);}
 assert(html.includes('observarBanco: true'));assert(html.includes('offlineRegen.sincronizarDoBanco()'));
 console.log('OK: Realtime por jogador, atualização de SM/HP/MP e máximos, cronômetro do banco, zero escritas no observador, reconexão, resposta antiga descartada e limpeza ao sair.');
})().catch(e=>{console.error(e);process.exitCode=1});
