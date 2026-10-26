const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const html=fs.readFileSync('jogos/mochila/trocap.html','utf8');
assert(!html.includes('menu-slot'));assert(!html.includes('renderMenu'));assert(html.includes("from '../../config.js'"));
for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){if(/src\s*=|importmap/.test(m[1]))continue;if(/type="module"/.test(m[1]))new vm.SourceTextModule(m[2]);else new vm.Script(m[2]);}
new vm.SourceTextModule(fs.readFileSync('config.js','utf8'));
const boot=html.slice(html.indexOf('let paginaIniciada = false;'),html.indexOf('function bindEventos()'));
async function startup(ready,logged=true,fail=false){
 const calls=[],nodes={};let callback;
 const ctx={chatTrocas:null,window:{addEventListener(){},location:{replace:url=>calls.push('login:'+url)}},ChatTrocas:class{async init(){}destroy(){}aviso(){}},document:{readyState:ready,addEventListener(_e,fn){callback=fn}},usuarioLogado:logged?{login:'teste'}:null,$:id=>nodes[id]??(nodes[id]={}),bindEventos:()=>calls.push('eventos'),identificarUsuario:()=>calls.push('sessao'),iniciarMonitorStatus:()=>calls.push('status'),async carregarMochilaESaldo(){if(fail)throw Error('falhou');calls.push('mochila')},carregar:()=>calls.push('trocas'),inscreverRealtime:()=>calls.push('realtime'),render:()=>calls.push('render'),atualizarStatus:(v)=>calls.push('online:'+v)};
 vm.createContext(ctx);vm.runInContext(boot+';globalThis.iniciar=iniciarPagina;',ctx);
 if(callback)await callback();else await new Promise(setImmediate);
 await ctx.iniciar();return {calls,nodes};
}
const check=html.slice(html.indexOf('async function verificarSupabase()'),html.indexOf('function iniciarMonitorStatus()'));
async function health(status){let state,url;const ctx={SUPABASE_URL:'https://example.invalid',SUPABASE_KEY:'public',TABELA:'Geral',TROCAS_CONFIG:{REQUEST_TIMEOUT_MS:5000},AbortSignal,fetch:async u=>{url=u;return {ok:status===200,status}},atualizarStatus:v=>{state=v}};vm.createContext(ctx);vm.runInContext(check+';globalThis.check=verificarSupabase;',ctx);await ctx.check();return {state,url};}
(async()=>{
 for(const ready of ['loading','complete'])assert.deepEqual((await startup(ready)).calls,['eventos','sessao','status','mochila','trocas','realtime']);
 assert((await startup('complete',false)).calls.some(c=>c.startsWith('login:../../login.html?retorno=')));
 assert(!html.includes('Entrar pelo login do portal'));assert(!html.includes('login.html?chat=1'));
 const failed=await startup('complete',true,true);assert(failed.calls.includes('online:false'));assert(failed.nodes['#erro'].textContent.includes('falhou'));
 assert.equal((await health(200)).state,true);assert.equal((await health(401)).state,false);assert.equal((await health(403)).state,false);assert.equal((await health(500)).state,false);assert((await health(200)).url.includes('select=id&limit=0'));
 console.log('OK: início antes/depois do DOM, sem duplicação, sessão ausente, falha de início, HTTP 200/401/403/500, configuração única e menu removido.');
})().catch(e=>{console.error(e);process.exitCode=1});
