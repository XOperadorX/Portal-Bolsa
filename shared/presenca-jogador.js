// Atualiza somente a presença da própria sessão, sem reenviar saldos ou atributos.
export function iniciarPresencaJogador({db,tabela='Geral',aoAtualizar=()=>{},intervalo=60000}) {
 let ocupado=false,encerrado=false;
 async function atualizar(){
  if(encerrado||ocupado||document.hidden)return;
  let usuario,inicio;try{usuario=JSON.parse(localStorage.getItem('usuario_logado'));inicio=Number(localStorage.getItem('session_timestamp'));}catch{return;}
  const idade=Date.now()-inicio;
  if(!usuario?.login||!inicio||idade<0||idade>=24*60*60*1000)return;
  ocupado=true;
  try{
   const agora=new Date().toISOString();
   const {data,error}=await db.from(tabela).update({ultima_vez_online:agora}).eq('login',usuario.login).select('id,ultima_vez_online').maybeSingle();
   if(error)throw error;
   if(data&&!encerrado)aoAtualizar(data);
  }catch(e){console.warn('Não foi possível atualizar a presença:',e.message);}
  finally{ocupado=false;}
 }
 const visivel=()=>{if(!document.hidden)atualizar();};
 const timer=setInterval(atualizar,intervalo);
 document.addEventListener('visibilitychange',visivel);window.addEventListener('focus',atualizar);
 const limpar=()=>{encerrado=true;clearInterval(timer);document.removeEventListener('visibilitychange',visivel);window.removeEventListener('focus',atualizar);window.removeEventListener('pagehide',limpar);};
 window.addEventListener('pagehide',limpar);atualizar();return limpar;
}
