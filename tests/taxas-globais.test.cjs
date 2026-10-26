const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const definitions=fs.readFileSync('shared/taxas-definicoes.js','utf8');
const {DEFINICOES_TAXAS,TAXAS_PADRAO,validarTaxas}=new Function(definitions.replaceAll('export const','const').replaceAll('export function','function')+';return {DEFINICOES_TAXAS,TAXAS_PADRAO,validarTaxas};')();
assert.equal(DEFINICOES_TAXAS.length,39);assert.deepEqual(validarTaxas(TAXAS_PADRAO),TAXAS_PADRAO);
assert.throws(()=>validarTaxas({...TAXAS_PADRAO,pix_admin:101}),/inválido/);assert.throws(()=>validarTaxas({...TAXAS_PADRAO,mercado_compra:'50'}),/inválido/);assert.throws(()=>validarTaxas({}),/incompleta/);assert.throws(()=>validarTaxas({...TAXAS_PADRAO,pix_admin:NaN}),/inválido/);
const antigo={...TAXAS_PADRAO,mercado_compra:75};for(const id of Object.keys(antigo))if(id.startsWith('mumu_pacote_')||id==='mumu_desfazer_desconto')delete antigo[id];delete antigo.shagrila_venda;delete antigo.bolsa_selic;
const compativel=validarTaxas(antigo,{completarPadroes:true});assert.equal(compativel.mercado_compra,75);assert.equal(compativel.shagrila_venda,50);assert.equal(compativel.bolsa_selic,10.75);assert.equal(Object.keys(antigo).length,31);assert.throws(()=>validarTaxas({...antigo,pix_admin:'10'},{completarPadroes:true}),/inválido/);
const runtime=fs.readFileSync('shared/taxas-globais.js','utf8').replace(/^import .*;\s*/gm,'').replaceAll('export const','const').replaceAll('export let','let').replaceAll('export async function','async function').replaceAll('export function','function');
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
async function loader(fetch){return new AsyncFunction('fetch','TAXAS_PADRAO','validarTaxas','DEFINICOES_TAXAS',runtime+';return {obterTaxa,carregarTaxasGlobais,get estado(){return estadoTaxas}};')(fetch,TAXAS_PADRAO,validarTaxas,DEFINICOES_TAXAS);}
const page=fs.readFileSync('dados/admin/script/taxa.js','utf8').replace(/^import .*;\s*/gm,'');
async function adminPage(role='admin', local=null, initialValues=TAXAS_PADRAO){
 if(local===null)local={'sb-example-auth-token':JSON.stringify({access_token:'test-token',expires_at:Math.floor(Date.now()/1000)+3600}),usuario_logado:JSON.stringify({id:1,nome:'ADM',login:'admin'}),session_timestamp:String(Date.now())};
 let redirected=null;
 const nodes=new Map(),store=new Map();let patched=0,conflict=false,values={...initialValues},version=1,lastPatch;
 const node=id=>{if(!nodes.has(id))nodes.set(id,{value:'',innerHTML:'',textContent:'',hidden:false,disabled:false,events:{},addEventListener(name,fn){this.events[name]=fn},appendChild(){},click(){}});return nodes.get(id);};
 node('base').value='100';node('email').value='admin@example.invalid';node('senha').value='senha-de-teste';
 const context={window:{location:{replace:url=>{redirected=url}}},AbortSignal,DEFINICOES_TAXAS,TAXAS_PADRAO,validarTaxas,TAXAS_API:{url:'https://example.invalid',chave:'public'},document:{getElementById:node,createElement:()=>node('generated')},localStorage:{getItem:k=>local[k]??null},sessionStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},URL,Blob,confirm:()=>true,setTimeout:()=>0,async fetch(url,options){
  if(url.includes('/auth/v1/token'))return {ok:true,json:async()=>({access_token:'test-token',refresh_token:'refresh',expires_in:3600})};
  if(url.includes('/auth/v1/user'))return {ok:true,json:async()=>({app_metadata:{role}})};
  if(url.includes('/taxas_historico'))return {ok:true,json:async()=>[]};
  if(options?.method==='PATCH'){patched++;lastPatch={url,options};if(conflict)return {ok:true,json:async()=>[]};values=JSON.parse(options.body).valores;version++;}
  return {ok:true,json:async()=>[{valores:values,versao:version}]};
 }};
 vm.createContext(context);await new vm.Script('(async()=>{'+page+'})()').runInContext(context);
 return {node,get redirected(){return redirected},get patched(){return patched},get values(){return values},get lastPatch(){return lastPatch},set conflict(v){conflict=v}};
}
(async()=>{
 const changed={...TAXAS_PADRAO,mercado_compra:80,pix_admin:12.5};
 const online=await loader(async()=>({ok:true,json:async()=>[{valores:changed,versao:2}]}));assert.equal(online.obterTaxa('mercado_compra'),80);assert.equal(online.estado.origem,'banco');
 const legado=await loader(async()=>({ok:true,json:async()=>[{valores:antigo,versao:1}]}));assert.equal(legado.obterTaxa('mercado_compra'),75);assert.equal(legado.obterTaxa('bolsa_selic'),10.75);assert.equal(legado.estado.origem,'banco');
 const offline=await loader(async()=>{throw Error('offline')});assert.equal(offline.obterTaxa('mercado_compra'),50);assert.equal(offline.estado.origem,'padrao');
 const awaiting=await loader(async()=>({ok:true,json:async()=>[{valores:{...changed,trocas_taxa:30},versao:2}]}));assert.equal(awaiting.obterTaxa('trocas_taxa'),5);
 const ready=await loader(async url=>({ok:true,json:async()=>url.includes('taxas_status_integracoes')?[{id:'trocas_taxa',pronto:true}]:[{valores:{...changed,trocas_taxa:30},versao:2}]}));assert.equal(ready.obterTaxa('trocas_taxa'),30);
 const invalid=await loader(async()=>({ok:true,json:async()=>[{valores:{},versao:9}]}));assert.equal(invalid.obterTaxa('pix_admin'),10);
 const logged=await adminPage('admin',{'sb-example-auth-token':JSON.stringify({access_token:'existing-token',refresh_token:'refresh',expires_at:Math.floor(Date.now()/1000)+3600})});assert.equal(logged.node('acesso').textContent,'Administrador');assert.equal(logged.node('acesso').textContent,'Administrador');
 const portal=await adminPage('jogador',{usuario_logado:JSON.stringify({id:1,login:'jogador',cadeado:true}),session_timestamp:String(Date.now())});assert.equal(portal.node('usuario-taxas').textContent,'jogador');assert.equal(portal.node('acesso').textContent,'Consulta');assert.equal(portal.node('salvar').disabled,true);assert.equal(portal.redirected,null);
 const expired=await adminPage('jogador',{usuario_logado:JSON.stringify({id:1,login:'jogador'}),session_timestamp:String(Date.now()-25*60*60*1000)});assert.equal(expired.redirected,'../../login.html');
 const p=await adminPage();assert(p.node('salvar').disabled);assert.equal(p.node('usuario-taxas').textContent,'ADM');assert.equal(p.node('acesso').textContent,'Administrador');
 p.node('taxas').events.input({target:{dataset:{id:'mercado_compra'},value:'80'}});await p.node('form-taxas').events.submit({preventDefault(){}});
 assert.equal(p.values.mercado_compra,80);assert.equal(p.patched,1);assert(p.lastPatch.url.includes('versao=eq.1'));assert.equal(p.lastPatch.options.headers.Authorization,'Bearer test-token');assert(p.node('status').textContent.includes('Taxas publicadas'));
 p.conflict=true;p.node('taxas').events.input({target:{dataset:{id:'pix_admin'},value:'20'}});await p.node('form-taxas').events.submit({preventDefault(){}});assert(p.node('status').textContent.includes('Outra versão'));assert.equal(p.values.pix_admin,10);
 const pending=await adminPage();pending.node('taxas').events.input({target:{dataset:{id:'trocas_taxa'},value:'30'}});await pending.node('form-taxas').events.submit({preventDefault(){}});assert.equal(pending.patched,0);assert(pending.node('status').textContent.includes('Integre primeiro'));
 const oldPage=await adminPage('admin',null,antigo);assert.equal(oldPage.node('pendencias').textContent,'Nenhuma alteração pendente.');assert.equal(oldPage.node('status').textContent,'Configuração global carregada. Versão 1.');assert(!oldPage.node('taxas').innerHTML.includes('Integração necessária'));assert(oldPage.node('configuracao-texto').textContent.includes('SELIC global'));oldPage.node('taxas').events.input({target:{dataset:{id:'mercado_compra'},value:'80'}});await oldPage.node('form-taxas').events.submit({preventDefault(){}});assert.equal(oldPage.values.mercado_compra,80);assert.equal(Object.keys(oldPage.values).length,31);
 const denied=await adminPage('jogador');await denied.node('form-taxas').events.submit({preventDefault(){}});assert.equal(denied.patched,0);assert(denied.node('salvar').disabled);
 const sql=fs.readFileSync('dados/admin/sql/instalar-taxas.sql','utf8');assert(sql.includes('enable row level security'));assert(sql.includes("auth.jwt()->'app_metadata'->>'role'"));assert(sql.includes('grant update(valores)'));assert(!sql.toLowerCase().includes('security definer'));for(const def of DEFINICOES_TAXAS)assert(sql.includes("valores->'"+def.id+"'"));
 console.log('OK: 39 taxas, validação, leitura global, padrões offline, publicação administrativa, bloqueio de não administrador, conflito de versão e estrutura de permissões SQL.');
})().catch(e=>{console.error(e);process.exitCode=1});
