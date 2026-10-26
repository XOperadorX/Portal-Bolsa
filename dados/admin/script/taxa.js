import { DEFINICOES_TAXAS, TAXAS_PADRAO, validarTaxas } from '../../../shared/taxas-definicoes.js';
import { TAXAS_API } from '../../../shared/taxas-globais.js';
const $=id=>document.getElementById(id), esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const SESSION='portal_taxas_admin';let sessao=null,registro=null,draft={...TAXAS_PADRAO},admin=false,ocupado=false,integracoes=[];
let usuarioPortal=null;
try {
 const raw=JSON.parse(localStorage.getItem('usuario_logado'));
 const timestamp=Number(localStorage.getItem('session_timestamp'));
 if(raw && (raw.id||raw.login) && timestamp>0 && Date.now()-timestamp>=0 && Date.now()-timestamp<24*60*60*1000) usuarioPortal=raw;
} catch {}
try{sessao=JSON.parse(sessionStorage.getItem(SESSION));}catch{}
if (!sessao?.access_token) {
 try {
  const project=new URL(TAXAS_API.url).hostname.split('.')[0];
  const stored=JSON.parse(localStorage.getItem('sb-'+project+'-auth-token'));
  const candidate=stored?.currentSession || stored?.session || stored;
  if(candidate?.access_token) sessao=candidate;
 } catch {}
}
function atualizarAcesso() {
 $('usuario-taxas').textContent=usuarioPortal?.nome||usuarioPortal?.login||sessao?.user?.email||'Usuário';
}
async function api(path,options={},privado=false){
 const r=await fetch(TAXAS_API.url+path,{signal:AbortSignal.timeout(10000),...options,headers:{apikey:TAXAS_API.chave,...(privado&&sessao?{Authorization:'Bearer '+sessao.access_token}:{}),'Content-Type':'application/json',...options.headers}});
 const data=await r.json().catch(()=>null);if(!r.ok)throw new Error(data?.msg||data?.message||data?.error_description||('HTTP '+r.status));return data;
}
function status(t){$('status').textContent=t;}
function valoresCarregados(){return registro?{...TAXAS_PADRAO,...registro.valores}:TAXAS_PADRAO;}
function taxaDisponivel(d){return !!registro && Object.hasOwn(registro.valores,d.id) && (!d.rpcs||integracoes.some(i=>i.id===d.id&&i.pronto));}
function atualizar(){const alteradas=DEFINICOES_TAXAS.filter(d=>draft[d.id]!==valoresCarregados()[d.id]);$('pendencias').textContent=registro?(alteradas.length?alteradas.length+' alterações pendentes: '+alteradas.map(d=>d.nome).join(', '):'Nenhuma alteração pendente.'):'Padrões de consulta. Configure o banco para publicar.';$('salvar').disabled=!admin||!registro||ocupado||!alteradas.length;$('acesso').textContent=admin?'Administrador':'Consulta';atualizarAcesso();simular();}
function render(){const q=$('busca').value.toLocaleLowerCase('pt-BR'),g=$('grupo').value;
 $('taxas').innerHTML=DEFINICOES_TAXAS.filter(d=>(!g||d.grupo===g)&&(!q||(d.grupo+' '+d.nome+' '+d.procedimento).toLocaleLowerCase('pt-BR').includes(q))).map(d=>`<tr><td><b>${esc(d.nome)}</b><small>${esc(d.grupo)}</small></td><td><input aria-label="${esc(d.nome)}" data-id="${d.id}" type="number" min="${d.min}" max="${d.max}" step="any" value="${draft[d.id]}" ${admin&&!ocupado&&taxaDisponivel(d)?'':'readonly'} title="${taxaDisponivel(d)?'': 'Disponível para consulta; veja os detalhes de configuração abaixo.'}"> ${esc(d.unidade)}</td><td>${esc(d.procedimento)}<small><a href="../../${esc(d.origem)}" target="_blank" rel="noopener">Abrir procedência ↗</a></small></td></tr>`).join('');atualizarConfiguracao();atualizar();}
function atualizarConfiguracao(){
 const faltantes=registro?DEFINICOES_TAXAS.filter(d=>!Object.hasOwn(registro.valores,d.id)):[];
 const pendentes=DEFINICOES_TAXAS.filter(d=>d.rpcs&&!integracoes.some(i=>i.id===d.id&&i.pronto));
 $('configuracao-detalhes').hidden=!faltantes.length&&!pendentes.length;
 $('configuracao-resumo').textContent='Configuração do banco · '+(faltantes.length+pendentes.length)+' parâmetros em consulta';
 $('configuracao-texto').textContent=[faltantes.length?'Parâmetros novos ainda não instalados: '+faltantes.map(d=>d.nome).join(', ')+'.':'',pendentes.length?'Funções a integrar: '+[...new Set(pendentes.flatMap(d=>d.rpcs))].join(', ')+'.':''].filter(Boolean).join(' ');
}
function simular(){const b=Number($('base').value)||0,f=v=>Number(v).toLocaleString('pt-BR',{maximumFractionDigits:8});$('simulacao').textContent='Mercado: compra S$ '+f(b*(1+draft.mercado_compra/100))+' · venda S$ '+f(b*(1-draft.mercado_venda/100))+' | Codex: S$ '+f(b*(1+draft.codex_acrescimo/100))+' | Pix: bruto '+f(b*draft.pix_conversao)+' · líquido '+f(b*draft.pix_conversao*(1-draft.pix_admin/100));}
async function carregar(){if(ocupado)return;ocupado=true;atualizar();try{const rows=await api('/rest/v1/taxas_config?id=eq.global&select=*');if(!rows?.[0])throw new Error('Tabela de taxas não instalada');registro=rows[0];draft=validarTaxas(registro.valores, { completarPadroes: true });try{integracoes=await api('/rest/v1/taxas_status_integracoes?select=id,pronto');}catch{integracoes=[];}$('versao').textContent=registro.versao;status('Configuração global carregada. Versão '+registro.versao+'.');}catch(e){status('Não foi possível carregar as taxas globais: '+e.message+'\nConsulte Instalação e procedimentos.');registro=null;}finally{ocupado=false;render();}}
async function validarAdministrador(){admin=false;if(!sessao)return;try{if(Date.now()>=sessao.expires_at*1000){sessao=await api('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:JSON.stringify({refresh_token:sessao.refresh_token})});sessao.expires_at=Math.floor(Date.now()/1000)+sessao.expires_in;sessionStorage.setItem(SESSION,JSON.stringify(sessao));}const user=await api('/auth/v1/user',{},true);admin=user.app_metadata?.role==='admin';if(!admin)throw new Error('Esta conta não tem permissão administrativa para taxas.');await historico();}catch(e){status(e.message);}}
async function historico(){if(!admin)return;try{const rows=await api('/rest/v1/taxas_historico?select=versao,updated_at,anteriores,novos&order=versao.desc&limit=20',{},true);$('historico').innerHTML=rows.length?rows.map(r=>'<p><b>Versão '+esc(r.versao)+'</b> · '+esc(new Date(r.updated_at).toLocaleString('pt-BR'))+'<br>'+DEFINICOES_TAXAS.filter(d=>r.anteriores[d.id]!==r.novos[d.id]).map(d=>esc(d.nome)+': '+esc(r.anteriores[d.id])+' → '+esc(r.novos[d.id])).join(' · ')+'</p>').join(''):'Nenhuma alteração publicada.';}catch(e){$('historico').textContent='Histórico indisponível: '+e.message;}}
$('taxas').addEventListener('input',e=>{if(!e.target.dataset.id)return;draft[e.target.dataset.id]=e.target.value===''?NaN:Number(e.target.value);atualizar();});
$('form-taxas').addEventListener('submit',async e=>{e.preventDefault();if(!admin||!registro||ocupado)return;try{const valoresCompletos=validarTaxas(draft);for(const d of DEFINICOES_TAXAS)if(!Object.hasOwn(registro.valores,d.id)&&draft[d.id]!==valoresCarregados()[d.id])throw new Error('Instale a atualização do banco para alterar: '+d.nome);const valores=Object.fromEntries(Object.keys(registro.valores).map(id=>[id,valoresCompletos[id]]));for(const d of DEFINICOES_TAXAS)if(d.rpcs&&valores[d.id]!==registro.valores[d.id]&&!integracoes.some(i=>i.id===d.id&&i.pronto))throw new Error('Integre primeiro a função do banco: '+d.nome);ocupado=true;render();await validarAdministrador();if(!admin)throw new Error('A sessão administrativa expirou.');const rows=await api('/rest/v1/taxas_config?id=eq.global&versao=eq.'+encodeURIComponent(registro.versao),{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({valores})},true);if(!rows?.length)throw new Error('Outra versão foi publicada. Recarregue os valores antes de salvar.');registro=rows[0];draft=validarTaxas(registro.valores, { completarPadroes: true });$('versao').textContent=registro.versao;status('Taxas publicadas para todos os jogadores. Versão '+registro.versao+'. Recarregue as páginas dos jogos para aplicar.');await historico();}catch(err){status('Não foi possível publicar: '+err.message);}finally{ocupado=false;render();}});
$('recarregar').onclick=()=>{if(registro&&DEFINICOES_TAXAS.some(d=>draft[d.id]!==valoresCarregados()[d.id])&&!confirm('Descartar alterações não publicadas e recarregar?'))return;carregar();};
$('padroes').onclick=()=>{if(!admin)return;draft={...TAXAS_PADRAO};render();};
$('exportar').onclick=()=>{try{const valores=validarTaxas(draft),url=URL.createObjectURL(new Blob([JSON.stringify(valores,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='taxas-projeto.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){status(e.message);}};
for(const grupo of new Set(DEFINICOES_TAXAS.map(d=>d.grupo))){const o=document.createElement('option');o.value=grupo;o.textContent=grupo;$('grupo').appendChild(o);}
$('quantidade').textContent=DEFINICOES_TAXAS.length;$('busca').oninput=render;$('grupo').onchange=render;$('base').oninput=simular;
if (!usuarioPortal && !sessao?.access_token) {
 window.location.replace('../../login.html');
} else {
 await validarAdministrador();
 await carregar();
}
