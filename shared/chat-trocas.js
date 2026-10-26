import { db, CHAT_TROCAS_CONFIG as CONFIG } from '../config.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export class ChatTrocas {
 constructor({usuario=null,admin=false,cliente=db,root=document,onLoginNecessario=null}) {
  this.onLoginNecessario=onLoginNecessario;
  this.usuario=usuario;this.admin=admin;this.db=cliente;this.root=root;this.token=usuario?.chat_token||null;
  this.ativo=null;this.conversas=[];this.mensagens=[];this.antes=0;this.geracao=0;this.enviando=false;this.destroyed=false;this.loading=false;this.pending=null;
  this.$=id=>root.getElementById(id);this.onFocus=()=>this.atualizar().catch(e=>this.aviso(e.message));this.onVisible=()=>{if(!document.hidden)this.onFocus()};
 }
 async rpc(nome,args={}) {
  const chamar=async token=>{let request=this.db.rpc(nome,{p_token:token,...args});if(typeof request.abortSignal==='function')request=request.abortSignal(AbortSignal.timeout(CONFIG.REQUEST_TIMEOUT_MS));return await request;};
  let {data,error}=await chamar(this.token);
  // O servidor também aceita a sessão Supabase Auth administrativa existente.
  if(this.admin&&this.token&&/Sessão do chat expirada/i.test(error?.message||'')){
   const resposta=await chamar(null);data=resposta.data;error=resposta.error;
   if(!error)this.token=null;
  }
  if(error){if(/Sessão do chat expirada/i.test(error.message||''))this.pedirLogin();throw new Error(error.code==='PGRST202'?'Chat indisponível no servidor. Avise a administração.':/Sessão do chat expirada/i.test(error.message||'')?'A credencial do chat expirou no servidor. A sessão do portal foi mantida.':error.message);}return data;
 }
 pedirLogin(){if(this.onLoginNecessario){this.onLoginNecessario();return;}const link=this.$('chat-login');if(link)link.hidden=false;}
 aviso(texto){this.$('chat-status').textContent=texto;}
 async init() {
  this.$('chat-form')?.addEventListener('submit',e=>{e.preventDefault();this.enviar()});
  this.$('chat-conversas').addEventListener('change',e=>this.selecionar(this.conversas.find(c=>c.id===e.target.value)).catch(err=>this.aviso(err.message)));
  this.$('chat-mais').addEventListener('click',()=>this.carregarHistorico(true).catch(e=>this.aviso(e.message)));
  this.$('comprador')?.addEventListener('input',()=>{clearTimeout(this.nickTimer);this.geracao++;this.ativo=null;this.mensagens=[];this.render();const nick=this.$('comprador').value.trim();this.aviso(nick?'Verificando comprador…':'Informe o nick do comprador para conversar.');if(nick)this.nickTimer=setTimeout(()=>this.abrir(nick),CONFIG.NICK_DELAY_MS);});
  if(!this.token&&!this.admin){this.aviso(this.usuario?.login?'O chat não recebeu uma credencial do servidor nesta sessão. A administração precisa verificar a instalação do chat.':'Conectando ao login do portal…');if(!this.usuario?.login)this.pedirLogin();return;}
  try {await this.atualizar();if(!this.ativo)this.aviso(this.admin?'Selecione uma conversa para consultar.':'Informe o nick do comprador ou selecione uma conversa recebida.');}
  catch(e){this.aviso(e.message);if(!this.token)this.pedirLogin();return;}
  this.poll=setInterval(()=>{if(!document.hidden)this.atualizar().catch(e=>this.aviso(e.message));},CONFIG.POLL_MS);
  window.addEventListener('focus',this.onFocus);document.addEventListener('visibilitychange',this.onVisible);
 }
 async abrir(nick) {
  const gen=this.geracao;if(!this.token){this.aviso(this.usuario?.login?'O chat não recebeu uma credencial do servidor nesta sessão. A administração precisa verificar a instalação do chat.':'Conectando ao login do portal…');if(!this.usuario?.login)this.pedirLogin();return;}
  try {const conversa=await this.rpc(CONFIG.RPC_ABRIR,{p_comprador:nick});if(this.destroyed||gen!==this.geracao)return;await this.selecionar(conversa);await this.atualizarConversas();}
  catch(e){if(gen===this.geracao)this.aviso(e.message);}
 }
 async atualizarConversas(){
  const data=await this.rpc(CONFIG.RPC_CONVERSAS,{p_admin:this.admin,p_busca:this.$('chat-busca')?.value.trim()||''});
  if(this.destroyed)return;this.conversas=data||[];
  this.$('chat-conversas').innerHTML='<option value="">— Conversas '+(this.admin?'dos jogadores':'recebidas e enviadas')+' —</option>'+this.conversas.map(c=>'<option value="'+esc(c.id)+'">'+esc(c.vendedor)+' ↔ '+esc(c.comprador)+'</option>').join('');
  this.$('chat-conversas').value=this.ativo?.id||'';
 }
 async selecionar(conversa){this.geracao++;this.ativo=conversa||null;this.mensagens=[];this.antes=0;this.pending=null;this.render();if(conversa)await this.carregarHistorico();}
 async carregarHistorico(mais=false){
  if(!this.ativo)return;const id=this.ativo.id,gen=this.geracao;
  const data=await this.rpc(CONFIG.RPC_HISTORICO,{p_chat:id,p_antes:mais?this.antes:null});
  if(this.destroyed||this.ativo?.id!==id||gen!==this.geracao)return;
  const novas=data.mensagens||[];
  if(mais){const ids=new Set(this.mensagens.map(m=>m.id));this.mensagens=[...novas.filter(m=>!ids.has(m.id)),...this.mensagens];this.antes=data.antes;}
  else if(this.mensagens.length>100){const ids=new Set(this.mensagens.map(m=>m.id));this.mensagens=[...this.mensagens,...novas.filter(m=>!ids.has(m.id))];}
  else{this.mensagens=novas;this.antes=data.antes;}
  this.render(!mais);this.aviso('Conversa: '+this.ativo.vendedor+' ↔ '+this.ativo.comprador+' · histórico salvo com data e hora.');
 }
 async atualizar(){if(this.loading||this.destroyed)return;this.loading=true;try{await this.atualizarConversas();await this.carregarHistorico();}finally{this.loading=false;}}
 render(scroll=false){
  const lista=this.$('chat-mensagens'),oldTop=lista.scrollTop,oldHeight=lista.scrollHeight,nearEnd=oldHeight-oldTop-lista.clientHeight<80;
  lista.innerHTML=this.mensagens.length?this.mensagens.map(m=>'<article class="chat-msg '+(m.remetente===this.usuario?.login?'minha':'')+'"><header><b>'+esc(m.remetente)+'</b><time datetime="'+esc(m.enviado_em)+'">'+esc(new Date(m.enviado_em).toLocaleString('pt-BR'))+'</time></header><p>'+esc(m.texto)+'</p></article>').join(''):'<p class="chat-vazio">Nenhuma mensagem nesta conversa.</p>';
  if(scroll&&nearEnd)lista.scrollTop=lista.scrollHeight;else if(!scroll&&oldHeight)lista.scrollTop=oldTop+lista.scrollHeight-oldHeight;
  this.$('chat-mais').hidden=!this.antes;
  if(this.$('chat-enviar'))this.$('chat-enviar').disabled=!this.ativo||this.enviando||this.admin;
  if(this.$('chat-texto'))this.$('chat-texto').disabled=!this.ativo||this.enviando||this.admin;
 }
 async enviar(){
  if(this.enviando||!this.ativo||this.admin)return;
  const texto=this.$('chat-texto').value.trim();if(!texto||texto.length>CONFIG.MAX_MENSAGEM)return;
  const id=this.ativo.id,gen=this.geracao;
  if(!this.pending||this.pending.chat!==id||this.pending.texto!==texto)this.pending={chat:id,texto,id:crypto.randomUUID()};
  this.enviando=true;this.render();
  try {await this.rpc(CONFIG.RPC_ENVIAR,{p_chat:id,p_texto:texto,p_id:this.pending.id});if(gen===this.geracao){this.$('chat-texto').value='';this.pending=null;await this.carregarHistorico();}}
  catch(e){if(gen===this.geracao)this.aviso('Mensagem não confirmada: '+e.message);}
  finally{this.enviando=false;this.render();}
 }
 destroy(){this.destroyed=true;this.geracao++;clearInterval(this.poll);clearTimeout(this.nickTimer);window.removeEventListener('focus',this.onFocus);document.removeEventListener('visibilitychange',this.onVisible);}
}
