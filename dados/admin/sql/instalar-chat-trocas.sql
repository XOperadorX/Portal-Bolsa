-- Instale no SQL Editor. Reutiliza login_usuario para autenticar, sem alterar sua função.
-- As mensagens são espelhadas cifradas em Geral.meta.chat_trocas para não expor conversas em consultas públicas de perfil.
begin;
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;
create schema if not exists portal_chat_privado;
revoke all on schema portal_chat_privado from public,anon,authenticated;
create table if not exists portal_chat_privado.chave(id boolean primary key default true check(id), segredo text not null);
insert into portal_chat_privado.chave(id,segredo) values(true,gen_random_uuid()::text||gen_random_uuid()::text) on conflict do nothing;
create table if not exists portal_chat_privado.sessoes(token_hash text primary key, usuario_id integer not null references public."Geral"(id),expira_em timestamptz not null);
create index if not exists chat_sessoes_usuario on portal_chat_privado.sessoes(usuario_id);
create table if not exists portal_chat_privado.conversas(
 id uuid primary key default gen_random_uuid(), vendedor_id integer not null references public."Geral"(id),comprador_id integer not null references public."Geral"(id),
 historico bytea,criado_em timestamptz not null default now(),atualizado_em timestamptz not null default now(),
 unique(vendedor_id,comprador_id),check(vendedor_id<>comprador_id)
);
revoke all on all tables in schema portal_chat_privado from public,anon,authenticated;
alter table portal_chat_privado.chave enable row level security;
alter table portal_chat_privado.sessoes enable row level security;
alter table portal_chat_privado.conversas enable row level security;

create or replace function portal_chat_privado.cifrar(p_texto text) returns bytea language plpgsql security invoker set search_path='' as $fn$
declare ns text; chave text; resultado bytea;
begin
 select n.nspname into ns from pg_catalog.pg_extension e join pg_catalog.pg_namespace n on n.oid=e.extnamespace where e.extname='pgcrypto';
 select segredo into chave from portal_chat_privado.chave where id;
 execute format('select %I.pgp_sym_encrypt($1,$2)',ns) into resultado using p_texto,chave;
 return resultado;
end;$fn$;
create or replace function portal_chat_privado.decifrar(p_dados bytea) returns jsonb language plpgsql security invoker set search_path='' as $fn$
declare ns text; chave text; resultado text;
begin
 if p_dados is null then return '[]'::jsonb;end if;
 select n.nspname into ns from pg_catalog.pg_extension e join pg_catalog.pg_namespace n on n.oid=e.extnamespace where e.extname='pgcrypto';
 select segredo into chave from portal_chat_privado.chave where id;
 execute format('select %I.pgp_sym_decrypt($1,$2)',ns) into resultado using p_dados,chave;
 return resultado::jsonb;
end;$fn$;

-- O token não é um login informado pelo navegador: é emitido somente após a validação da senha no login_usuario existente.
create or replace function public.login_chat(p_login text,p_senha text) returns jsonb language plpgsql security definer set search_path='' as $fn$
declare resultado jsonb; token text; uid integer;
begin
 resultado:=to_jsonb(public.login_usuario(p_login,p_senha));
 if coalesce((resultado->>'ok')::boolean,false) is not true then return resultado;end if;
 select id into uid from public."Geral" where login=resultado->>'login' and not coalesce(bloqueado,false);
 if uid is null then raise exception 'Usuário indisponível';end if;
 token:=gen_random_uuid()::text||gen_random_uuid()::text;
 delete from portal_chat_privado.sessoes where expira_em<now();
 insert into portal_chat_privado.sessoes values(encode(sha256(convert_to(token,'UTF8')),'hex'),uid,now()+interval '24 hours');
 return resultado||jsonb_build_object('chat_token',token);
end;$fn$;
create or replace function portal_chat_privado.autor(p_token text) returns integer language plpgsql security invoker set search_path='' as $fn$
declare uid integer;
begin
 select s.usuario_id into uid from portal_chat_privado.sessoes s join public."Geral" g on g.id=s.usuario_id
 where s.token_hash=encode(sha256(convert_to(p_token,'UTF8')),'hex') and s.expira_em>now() and not coalesce(g.bloqueado,false);
 if uid is null then raise exception 'Sessão do chat expirada. Entre novamente pelo login do portal.';end if;
 return uid;
end;$fn$;
create or replace function portal_chat_privado.administrador(p_token text) returns boolean language plpgsql security invoker set search_path='' as $fn$
begin
 if auth.uid() is not null and auth.jwt()->'app_metadata'->>'role'='admin' then return true;end if;
 if p_token is null then return false;end if;
 return coalesce((select cadeado from public."Geral" where id=portal_chat_privado.autor(p_token)),false);
end;$fn$;

create or replace function public.chat_trocas_abrir(p_token text,p_comprador text) returns jsonb language plpgsql security definer set search_path='' as $fn$
declare vendedor integer; comprador integer; cid uuid;
begin
 vendedor:=portal_chat_privado.autor(p_token);
 select id into comprador from public."Geral" where login=btrim(p_comprador) and not coalesce(bloqueado,false);
 if comprador is null then raise exception 'Nick do comprador não encontrado';end if;
 if vendedor=comprador then raise exception 'Informe o nick de outro jogador';end if;
 insert into portal_chat_privado.conversas(vendedor_id,comprador_id) values(vendedor,comprador) on conflict do nothing;
 select id into cid from portal_chat_privado.conversas where vendedor_id=vendedor and comprador_id=comprador;
 return jsonb_build_object('id',cid,'vendedor', (select login from public."Geral" where id=vendedor),'comprador',btrim(p_comprador));
end;$fn$;
create or replace function public.chat_trocas_conversas(p_token text default null,p_admin boolean default false,p_busca text default '') returns jsonb language plpgsql security definer set search_path='' as $fn$
declare uid integer; resultado jsonb;
begin
 if p_admin then if not portal_chat_privado.administrador(p_token) then raise exception 'Acesso administrativo necessário';end if;
 else uid:=portal_chat_privado.autor(p_token);end if;
 select coalesce(jsonb_agg(t),'[]'::jsonb) into resultado from (
 select c.id,v.login as vendedor,b.login as comprador,c.criado_em,c.atualizado_em
 from portal_chat_privado.conversas c join public."Geral" v on v.id=c.vendedor_id join public."Geral" b on b.id=c.comprador_id
 where (p_admin or uid in(c.vendedor_id,c.comprador_id)) and (p_busca='' or v.login ilike '%'||p_busca||'%' or b.login ilike '%'||p_busca||'%')
 order by c.atualizado_em desc,c.id limit 100) t;
 return resultado;
end;$fn$;
create or replace function public.chat_trocas_historico(p_token text,p_chat uuid,p_antes integer default null) returns jsonb language plpgsql security definer set search_path='' as $fn$
declare c portal_chat_privado.conversas%rowtype;uid integer;mensagens jsonb;fim integer;resultado jsonb;
begin
 select * into c from portal_chat_privado.conversas where id=p_chat;
 if not found then raise exception 'Conversa não encontrada';end if;
 if not portal_chat_privado.administrador(p_token) then uid:=portal_chat_privado.autor(p_token);if uid not in(c.vendedor_id,c.comprador_id) then raise exception 'Esta conversa pertence a outros jogadores';end if;end if;
 mensagens:=portal_chat_privado.decifrar(c.historico);fim:=least(coalesce(p_antes,jsonb_array_length(mensagens)),jsonb_array_length(mensagens));
 select coalesce(jsonb_agg(e.msg order by e.ord),'[]'::jsonb) into resultado from jsonb_array_elements(mensagens) with ordinality e(msg,ord) where e.ord<=fim and e.ord>greatest(0,fim-100);
 return jsonb_build_object('mensagens',resultado,'antes',greatest(0,fim-100),'total',jsonb_array_length(mensagens));
end;$fn$;
create or replace function public.chat_trocas_enviar(p_token text,p_chat uuid,p_texto text,p_id uuid) returns jsonb language plpgsql security definer set search_path='' as $fn$
declare c portal_chat_privado.conversas%rowtype;uid integer;mensagens jsonb;msg jsonb;cifrado bytea;horario timestamptz;
begin
 uid:=portal_chat_privado.autor(p_token);
 if p_texto is null or length(btrim(p_texto))=0 or length(p_texto)>2000 then raise exception 'Escreva uma mensagem de até 2000 caracteres';end if;
 if p_id is null then raise exception 'Identificador da mensagem ausente';end if;
 select * into c from portal_chat_privado.conversas where id=p_chat for update;
 if not found or uid not in(c.vendedor_id,c.comprador_id) then raise exception 'Conversa indisponível para este jogador';end if;
 mensagens:=portal_chat_privado.decifrar(c.historico);
 select e into msg from jsonb_array_elements(mensagens) e where e->>'id'=p_id::text;
 if msg is not null then return msg;end if;
 horario:=clock_timestamp();
 msg:=jsonb_build_object('id',p_id,'remetente',(select login from public."Geral" where id=uid),'texto',btrim(p_texto),'enviado_em',horario);
 mensagens:=mensagens||jsonb_build_array(msg);cifrado:=portal_chat_privado.cifrar(mensagens::text);
 update portal_chat_privado.conversas set historico=cifrado,atualizado_em=horario where id=c.id;
 update public."Geral" set meta=jsonb_set(coalesce(meta,'{}'::jsonb),'{chat_trocas}',coalesce(meta->'chat_trocas','{}'::jsonb)||jsonb_build_object(c.id::text,jsonb_build_object('vendedor_id',c.vendedor_id,'comprador_id',c.comprador_id,'atualizado_em',horario,'historico_cifrado',encode(cifrado,'hex')))),updated_at=horario where id=c.vendedor_id;
 return msg;
end;$fn$;
revoke all on all functions in schema portal_chat_privado from public,anon,authenticated;
revoke all on function public.login_chat(text,text),public.chat_trocas_abrir(text,text),public.chat_trocas_conversas(text,boolean,text),public.chat_trocas_historico(text,uuid,integer),public.chat_trocas_enviar(text,uuid,text,uuid) from public,anon,authenticated;
grant execute on function public.login_chat(text,text),public.chat_trocas_abrir(text,text),public.chat_trocas_conversas(text,boolean,text),public.chat_trocas_historico(text,uuid,integer),public.chat_trocas_enviar(text,uuid,text,uuid) to anon,authenticated;
notify pgrst,'reload schema';
commit;
