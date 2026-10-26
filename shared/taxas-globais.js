import { TAXAS_PADRAO, validarTaxas, DEFINICOES_TAXAS } from './taxas-definicoes.js';
export const TAXAS_API = {url:'https://xrcxvizzdumcxbylmkvn.supabase.co',chave:'sb_publishable_E-g3G3wW4EySbCsXLXp8KQ_FnmERMcD'};
let valores={...TAXAS_PADRAO};
export let estadoTaxas={origem:'padrao',versao:null,erro:null};
export async function carregarTaxasGlobais() {
 try {
  const r=await fetch(TAXAS_API.url+'/rest/v1/taxas_config?id=eq.global&select=valores,versao,updated_at',{headers:{apikey:TAXAS_API.chave},cache:'no-store',signal:AbortSignal.timeout(5000)});
  if(!r.ok)throw new Error('Configuração global indisponível (HTTP '+r.status+')');
  const rows=await r.json();if(!rows[0])throw new Error('Configuração global não instalada');
  const novos=validarTaxas(rows[0].valores, { completarPadroes: true });
  let integracoes=[];
  try { const status=await fetch(TAXAS_API.url+'/rest/v1/taxas_status_integracoes?select=id,pronto',{headers:{apikey:TAXAS_API.chave},cache:'no-store',signal:AbortSignal.timeout(5000)});if(status.ok)integracoes=await status.json(); } catch {}
  for(const d of DEFINICOES_TAXAS) if(d.rpcs && !integracoes.some(i=>i.id===d.id && i.pronto===true))novos[d.id]=TAXAS_PADRAO[d.id];
  valores=novos;estadoTaxas={origem:'banco',versao:rows[0].versao,erro:null};return rows[0];
 }catch(e){estadoTaxas={...estadoTaxas,erro:e.message};return null;}
}
export function obterTaxa(id){if(!(id in TAXAS_PADRAO))throw new Error('Taxa desconhecida: '+id);return valores[id];}
await carregarTaxasGlobais();
