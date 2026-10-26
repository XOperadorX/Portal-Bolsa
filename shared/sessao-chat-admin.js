// Reaproveita credenciais existentes. A autorização continua nas RPCs do banco.
export async function sessaoChatAdmin(db,storage=localStorage,temporario=sessionStorage) {
 let usuario=null,sessao=null;
 try{usuario=JSON.parse(storage.getItem('usuario_logado'));}catch{}
 if(db.auth?.getSession){
  try{const {data,error}=await db.auth.getSession();if(!error)sessao=data?.session;}catch{}
 }
 if(!sessao&&db.auth?.setSession){
  let salva=null;try{salva=JSON.parse(temporario.getItem('portal_taxas_admin'));}catch{}
  if(salva?.access_token&&salva?.refresh_token){
   try{const {data,error}=await db.auth.setSession({access_token:salva.access_token,refresh_token:salva.refresh_token});if(!error)sessao=data?.session;}catch{}
  }
 }
 return {usuario:usuario?.login?usuario:null,sessao};
}
