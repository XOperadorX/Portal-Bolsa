// Grava somente a alteração da ação; nunca reenvia saldos ou atributos do dashboard.
export async function registrarEntradaJogo({db,tabela,login,minimo=10}) {
 if(!login)throw Error('Sessão inválida. Entre novamente.');
 const colunas='login,sm_atual,sm,sm_max,max_sm,updated_at';
 const {data:antes,error:erroLeitura}=await db.from(tabela).select(colunas).eq('login',login).single();
 if(erroLeitura)throw erroLeitura;if(!antes)throw Error('Jogador não encontrado.');
 const stamina=Number(antes.sm_atual??antes.sm);
 if(!Number.isFinite(stamina)||stamina<minimo)throw Error('Stamina insuficiente para entrar no jogo.');
 const custo=Math.max(1,Math.floor(stamina*.5)),agora=new Date().toISOString();
 let query=db.from(tabela).update({sm_atual:stamina-custo,sm:stamina-custo,ultima_vez_online:agora,updated_at:agora}).eq('login',login);
 query=antes.updated_at==null?query.is('updated_at',null):query.eq('updated_at',antes.updated_at);
 const {data:salvo,error}=await query.select(colunas).maybeSingle();
 if(error)throw error;
 if(!salvo)throw Error('Seus dados mudaram em outra tela. Atualize e tente novamente.');
 return {antes:stamina,custo,registro:salvo};
}
