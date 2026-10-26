const fs=require('fs'),assert=require('assert/strict');
const src=fs.readFileSync('shared/sessao-chat-admin.js','utf8').replace('export async function','async function');
const resolver=new Function(src+';return sessaoChatAdmin;')();
const storage=o=>({getItem:key=>o[key]||null});
(async()=>{
 const portal=storage({usuario_logado:JSON.stringify({login:'ADM',chat_token:'existente'})});
 const atual=await resolver({},portal,storage({}));assert.equal(atual.usuario.chat_token,'existente');
 let restored=0;const auth={getSession:async()=>({data:{session:{access_token:'atual'}}}),setSession:async()=>{restored++}};
 assert((await resolver({auth},storage({}),storage({}))).sessao);assert.equal(restored,0);
 const saved=storage({portal_taxas_admin:JSON.stringify({access_token:'salvo',refresh_token:'renovar'})});
 const restoredSession=await resolver({auth:{getSession:async()=>({data:{session:null}}),setSession:async tokens=>{assert.equal(tokens.access_token,'salvo');return {data:{session:tokens}}}}},storage({}),saved);assert(restoredSession.sessao);
 const vazio=await resolver({},storage({}),storage({}));assert.equal(vazio.usuario,null);assert.equal(vazio.sessao,null);
 console.log('OK: reutiliza portal, Supabase Auth e sessão administrativa existente sem novo login.');
})().catch(e=>{console.error(e);process.exitCode=1});
