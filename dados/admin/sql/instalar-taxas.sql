-- Execute uma vez no SQL Editor do projeto Supabase.
-- A conta administradora usa Supabase Auth e app_metadata.role = 'admin'.
-- Não use user_metadata, cadeado ou valores de localStorage como autorização.
begin;
create table if not exists public.taxas_config (
 id text primary key check(id='global'),
 valores jsonb not null,
 versao bigint not null default 1,
 updated_at timestamptz not null default now(),
 updated_by uuid,
 constraint taxas_valores_validos check(coalesce(jsonb_typeof(valores)='object' AND valores - ARRAY['mercado_compra','mercado_venda','codex_acrescimo','pix_admin','pix_conversao','pix_minimo','pix_limite','planta_taxa','nivel_multiplicador','mochila_desconto','trocas_taxa','poupanca_rendimento','bi_entrada','bi_aluguel','bi_servico','mineracao_mercado','mineracao_base','mineracao_passiva','btc_compra','btc_venda','sm_compra','sm_venda','mumu_saldo','mumu_minimo','usdt_saldo','usdt_minimo','geral_selic','geral_acoes','geral_fiis','geral_cdb','geral_poupanca','shagrila_venda','bolsa_selic','mumu_pacote_10','mumu_pacote_20','mumu_pacote_50','mumu_pacote_100','mumu_pacote_200','mumu_desfazer_desconto'] = '{}'::jsonb AND jsonb_typeof(valores->'mercado_compra') = 'number' AND (valores->>'mercado_compra')::numeric BETWEEN 0 AND 1000
 AND jsonb_typeof(valores->'mercado_venda') = 'number' AND (valores->>'mercado_venda')::numeric BETWEEN 0 AND 100
 AND jsonb_typeof(valores->'codex_acrescimo') = 'number' AND (valores->>'codex_acrescimo')::numeric BETWEEN 0 AND 1000
 AND jsonb_typeof(valores->'pix_admin') = 'number' AND (valores->>'pix_admin')::numeric BETWEEN 0 AND 100
 AND jsonb_typeof(valores->'pix_conversao') = 'number' AND (valores->>'pix_conversao')::numeric BETWEEN 1e-9 AND 1000
 AND jsonb_typeof(valores->'pix_minimo') = 'number' AND (valores->>'pix_minimo')::numeric BETWEEN 1 AND 1000000000000
 AND jsonb_typeof(valores->'pix_limite') = 'number' AND (valores->>'pix_limite')::numeric BETWEEN 0.01 AND 1000000000
 AND jsonb_typeof(valores->'planta_taxa') = 'number' AND (valores->>'planta_taxa')::numeric BETWEEN 0 AND 100
 AND jsonb_typeof(valores->'nivel_multiplicador') = 'number' AND (valores->>'nivel_multiplicador')::numeric BETWEEN 0 AND 100
 AND jsonb_typeof(valores->'mochila_desconto') = 'number' AND (valores->>'mochila_desconto')::numeric BETWEEN 0 AND 100
 AND jsonb_typeof(valores->'trocas_taxa') = 'number' AND (valores->>'trocas_taxa')::numeric BETWEEN 0 AND 100
 AND jsonb_typeof(valores->'poupanca_rendimento') = 'number' AND (valores->>'poupanca_rendimento')::numeric BETWEEN 0 AND 100
 AND jsonb_typeof(valores->'bi_entrada') = 'number' AND (valores->>'bi_entrada')::numeric BETWEEN 0 AND 1000000
 AND jsonb_typeof(valores->'bi_aluguel') = 'number' AND (valores->>'bi_aluguel')::numeric BETWEEN 0 AND 100
 AND jsonb_typeof(valores->'bi_servico') = 'number' AND (valores->>'bi_servico')::numeric BETWEEN 0 AND 100
 AND jsonb_typeof(valores->'mineracao_mercado') = 'number' AND (valores->>'mineracao_mercado')::numeric BETWEEN 0 AND 100
 AND jsonb_typeof(valores->'mineracao_base') = 'number' AND (valores->>'mineracao_base')::numeric BETWEEN 0 AND 100
 AND jsonb_typeof(valores->'mineracao_passiva') = 'number' AND (valores->>'mineracao_passiva')::numeric BETWEEN 0 AND 1
 AND jsonb_typeof(valores->'btc_compra') = 'number' AND (valores->>'btc_compra')::numeric BETWEEN 0.01 AND 1000000000000
 AND jsonb_typeof(valores->'btc_venda') = 'number' AND (valores->>'btc_venda')::numeric BETWEEN 0.01 AND 1000000000000
 AND jsonb_typeof(valores->'sm_compra') = 'number' AND (valores->>'sm_compra')::numeric BETWEEN 0.01 AND 1000000
 AND jsonb_typeof(valores->'sm_venda') = 'number' AND (valores->>'sm_venda')::numeric BETWEEN 0.01 AND 1000000
 AND jsonb_typeof(valores->'mumu_saldo') = 'number' AND (valores->>'mumu_saldo')::numeric BETWEEN 0.000001 AND 1000000000000
 AND jsonb_typeof(valores->'mumu_minimo') = 'number' AND (valores->>'mumu_minimo')::numeric BETWEEN 0 AND 1000000000000
 AND jsonb_typeof(valores->'usdt_saldo') = 'number' AND (valores->>'usdt_saldo')::numeric BETWEEN 0.000001 AND 1000000000000000
 AND jsonb_typeof(valores->'usdt_minimo') = 'number' AND (valores->>'usdt_minimo')::numeric BETWEEN 0.000001 AND 1000000000
 AND jsonb_typeof(valores->'geral_selic') = 'number' AND (valores->>'geral_selic')::numeric BETWEEN 0 AND 1
 AND jsonb_typeof(valores->'geral_acoes') = 'number' AND (valores->>'geral_acoes')::numeric BETWEEN 0 AND 1
 AND jsonb_typeof(valores->'geral_fiis') = 'number' AND (valores->>'geral_fiis')::numeric BETWEEN 0 AND 1
 AND jsonb_typeof(valores->'geral_cdb') = 'number' AND (valores->>'geral_cdb')::numeric BETWEEN 0 AND 1
 AND jsonb_typeof(valores->'geral_poupanca') = 'number' AND (valores->>'geral_poupanca')::numeric BETWEEN 0 AND 1
 AND jsonb_typeof(valores->'shagrila_venda') = 'number' AND (valores->>'shagrila_venda')::numeric BETWEEN 0 AND 100
 AND jsonb_typeof(valores->'bolsa_selic') = 'number' AND (valores->>'bolsa_selic')::numeric BETWEEN 0 AND 1000
 AND jsonb_typeof(valores->'mumu_pacote_10') = 'number' AND (valores->>'mumu_pacote_10')::numeric BETWEEN 0.01 AND 1000000
 AND jsonb_typeof(valores->'mumu_pacote_20') = 'number' AND (valores->>'mumu_pacote_20')::numeric BETWEEN 0.01 AND 1000000
 AND jsonb_typeof(valores->'mumu_pacote_50') = 'number' AND (valores->>'mumu_pacote_50')::numeric BETWEEN 0.01 AND 1000000
 AND jsonb_typeof(valores->'mumu_pacote_100') = 'number' AND (valores->>'mumu_pacote_100')::numeric BETWEEN 0.01 AND 1000000
 AND jsonb_typeof(valores->'mumu_pacote_200') = 'number' AND (valores->>'mumu_pacote_200')::numeric BETWEEN 0.01 AND 1000000
 AND jsonb_typeof(valores->'mumu_desfazer_desconto') = 'number' AND (valores->>'mumu_desfazer_desconto')::numeric BETWEEN 0 AND 100,false))
);
create table if not exists public.taxas_historico (
 id uuid primary key default gen_random_uuid(),
 versao bigint not null,
 anteriores jsonb not null,
 novos jsonb not null,
 updated_at timestamptz not null default now(),
 updated_by uuid not null
);
alter table public.taxas_config enable row level security;
alter table public.taxas_historico enable row level security;
grant usage on schema public to anon, authenticated;
revoke all on public.taxas_config, public.taxas_historico from anon, authenticated;
grant select on public.taxas_config to anon, authenticated;
grant update(valores) on public.taxas_config to authenticated;
grant select, insert on public.taxas_historico to authenticated;
drop policy if exists taxas_leitura on public.taxas_config;
create policy taxas_leitura on public.taxas_config for select to anon,authenticated using(true);
drop policy if exists taxas_admin on public.taxas_config;
create policy taxas_admin on public.taxas_config for update to authenticated
 using((select auth.jwt()->'app_metadata'->>'role')='admin')
 with check((select auth.jwt()->'app_metadata'->>'role')='admin');
drop policy if exists taxas_historico_admin on public.taxas_historico;
create policy taxas_historico_admin on public.taxas_historico for select to authenticated using((select auth.jwt()->'app_metadata'->>'role')='admin');
drop policy if exists taxas_historico_inserir on public.taxas_historico;
create policy taxas_historico_inserir on public.taxas_historico for insert to authenticated with check((select auth.jwt()->'app_metadata'->>'role')='admin' AND updated_by=(select auth.uid()));
-- Atualiza instalações anteriores, preservando os valores existentes.
drop trigger if exists taxas_auditoria on public.taxas_config;
alter table public.taxas_config drop constraint if exists taxas_valores_validos;
update public.taxas_config
set valores = '{"mercado_compra":50,"mercado_venda":50,"codex_acrescimo":40,"pix_admin":10,"pix_conversao":0.00001,"pix_minimo":1000,"pix_limite":500,"planta_taxa":10,"nivel_multiplicador":0.5,"mochila_desconto":50,"trocas_taxa":5,"poupanca_rendimento":0.6,"bi_entrada":1,"bi_aluguel":30,"bi_servico":25,"mineracao_mercado":20,"mineracao_base":35,"mineracao_passiva":1e-8,"btc_compra":10000,"btc_venda":999,"sm_compra":12,"sm_venda":8,"mumu_saldo":100,"mumu_minimo":50,"usdt_saldo":1000000,"usdt_minimo":0.01,"geral_selic":5e-7,"geral_acoes":3e-7,"geral_fiis":7e-7,"geral_cdb":6e-7,"geral_poupanca":4e-7,"shagrila_venda":50,"bolsa_selic":10.75,"mumu_pacote_10":1.0,"mumu_pacote_20":2.0,"mumu_pacote_50":5.0,"mumu_pacote_100":10.0,"mumu_pacote_200":20.0,"mumu_desfazer_desconto":50}'::jsonb || valores
where id='global' and not (valores ?& ARRAY['mercado_compra','mercado_venda','codex_acrescimo','pix_admin','pix_conversao','pix_minimo','pix_limite','planta_taxa','nivel_multiplicador','mochila_desconto','trocas_taxa','poupanca_rendimento','bi_entrada','bi_aluguel','bi_servico','mineracao_mercado','mineracao_base','mineracao_passiva','btc_compra','btc_venda','sm_compra','sm_venda','mumu_saldo','mumu_minimo','usdt_saldo','usdt_minimo','geral_selic','geral_acoes','geral_fiis','geral_cdb','geral_poupanca','shagrila_venda','bolsa_selic','mumu_pacote_10','mumu_pacote_20','mumu_pacote_50','mumu_pacote_100','mumu_pacote_200','mumu_desfazer_desconto']);
alter table public.taxas_config add constraint taxas_valores_validos check(coalesce(jsonb_typeof(valores)='object' AND valores - ARRAY['mercado_compra','mercado_venda','codex_acrescimo','pix_admin','pix_conversao','pix_minimo','pix_limite','planta_taxa','nivel_multiplicador','mochila_desconto','trocas_taxa','poupanca_rendimento','bi_entrada','bi_aluguel','bi_servico','mineracao_mercado','mineracao_base','mineracao_passiva','btc_compra','btc_venda','sm_compra','sm_venda','mumu_saldo','mumu_minimo','usdt_saldo','usdt_minimo','geral_selic','geral_acoes','geral_fiis','geral_cdb','geral_poupanca','shagrila_venda','bolsa_selic','mumu_pacote_10','mumu_pacote_20','mumu_pacote_50','mumu_pacote_100','mumu_pacote_200','mumu_desfazer_desconto'] = '{}'::jsonb AND jsonb_typeof(valores->'mercado_compra') = 'number' AND (valores->>'mercado_compra')::numeric BETWEEN 0 AND 1000
 AND jsonb_typeof(valores->'mercado_venda') = 'number' AND (valores->>'mercado_venda')::numeric BETWEEN 0 AND 100
 AND jsonb_typeof(valores->'codex_acrescimo') = 'number' AND (valores->>'codex_acrescimo')::numeric BETWEEN 0 AND 1000
 AND jsonb_typeof(valores->'pix_admin') = 'number' AND (valores->>'pix_admin')::numeric BETWEEN 0 AND 100
 AND jsonb_typeof(valores->'pix_conversao') = 'number' AND (valores->>'pix_conversao')::numeric BETWEEN 1e-9 AND 1000
 AND jsonb_typeof(valores->'pix_minimo') = 'number' AND (valores->>'pix_minimo')::numeric BETWEEN 1 AND 1000000000000
 AND jsonb_typeof(valores->'pix_limite') = 'number' AND (valores->>'pix_limite')::numeric BETWEEN 0.01 AND 1000000000
 AND jsonb_typeof(valores->'planta_taxa') = 'number' AND (valores->>'planta_taxa')::numeric BETWEEN 0 AND 100
 AND jsonb_typeof(valores->'nivel_multiplicador') = 'number' AND (valores->>'nivel_multiplicador')::numeric BETWEEN 0 AND 100
 AND jsonb_typeof(valores->'mochila_desconto') = 'number' AND (valores->>'mochila_desconto')::numeric BETWEEN 0 AND 100
 AND jsonb_typeof(valores->'trocas_taxa') = 'number' AND (valores->>'trocas_taxa')::numeric BETWEEN 0 AND 100
 AND jsonb_typeof(valores->'poupanca_rendimento') = 'number' AND (valores->>'poupanca_rendimento')::numeric BETWEEN 0 AND 100
 AND jsonb_typeof(valores->'bi_entrada') = 'number' AND (valores->>'bi_entrada')::numeric BETWEEN 0 AND 1000000
 AND jsonb_typeof(valores->'bi_aluguel') = 'number' AND (valores->>'bi_aluguel')::numeric BETWEEN 0 AND 100
 AND jsonb_typeof(valores->'bi_servico') = 'number' AND (valores->>'bi_servico')::numeric BETWEEN 0 AND 100
 AND jsonb_typeof(valores->'mineracao_mercado') = 'number' AND (valores->>'mineracao_mercado')::numeric BETWEEN 0 AND 100
 AND jsonb_typeof(valores->'mineracao_base') = 'number' AND (valores->>'mineracao_base')::numeric BETWEEN 0 AND 100
 AND jsonb_typeof(valores->'mineracao_passiva') = 'number' AND (valores->>'mineracao_passiva')::numeric BETWEEN 0 AND 1
 AND jsonb_typeof(valores->'btc_compra') = 'number' AND (valores->>'btc_compra')::numeric BETWEEN 0.01 AND 1000000000000
 AND jsonb_typeof(valores->'btc_venda') = 'number' AND (valores->>'btc_venda')::numeric BETWEEN 0.01 AND 1000000000000
 AND jsonb_typeof(valores->'sm_compra') = 'number' AND (valores->>'sm_compra')::numeric BETWEEN 0.01 AND 1000000
 AND jsonb_typeof(valores->'sm_venda') = 'number' AND (valores->>'sm_venda')::numeric BETWEEN 0.01 AND 1000000
 AND jsonb_typeof(valores->'mumu_saldo') = 'number' AND (valores->>'mumu_saldo')::numeric BETWEEN 0.000001 AND 1000000000000
 AND jsonb_typeof(valores->'mumu_minimo') = 'number' AND (valores->>'mumu_minimo')::numeric BETWEEN 0 AND 1000000000000
 AND jsonb_typeof(valores->'usdt_saldo') = 'number' AND (valores->>'usdt_saldo')::numeric BETWEEN 0.000001 AND 1000000000000000
 AND jsonb_typeof(valores->'usdt_minimo') = 'number' AND (valores->>'usdt_minimo')::numeric BETWEEN 0.000001 AND 1000000000
 AND jsonb_typeof(valores->'geral_selic') = 'number' AND (valores->>'geral_selic')::numeric BETWEEN 0 AND 1
 AND jsonb_typeof(valores->'geral_acoes') = 'number' AND (valores->>'geral_acoes')::numeric BETWEEN 0 AND 1
 AND jsonb_typeof(valores->'geral_fiis') = 'number' AND (valores->>'geral_fiis')::numeric BETWEEN 0 AND 1
 AND jsonb_typeof(valores->'geral_cdb') = 'number' AND (valores->>'geral_cdb')::numeric BETWEEN 0 AND 1
 AND jsonb_typeof(valores->'geral_poupanca') = 'number' AND (valores->>'geral_poupanca')::numeric BETWEEN 0 AND 1
 AND jsonb_typeof(valores->'shagrila_venda') = 'number' AND (valores->>'shagrila_venda')::numeric BETWEEN 0 AND 100
 AND jsonb_typeof(valores->'bolsa_selic') = 'number' AND (valores->>'bolsa_selic')::numeric BETWEEN 0 AND 1000
 AND jsonb_typeof(valores->'mumu_pacote_10') = 'number' AND (valores->>'mumu_pacote_10')::numeric BETWEEN 0.01 AND 1000000
 AND jsonb_typeof(valores->'mumu_pacote_20') = 'number' AND (valores->>'mumu_pacote_20')::numeric BETWEEN 0.01 AND 1000000
 AND jsonb_typeof(valores->'mumu_pacote_50') = 'number' AND (valores->>'mumu_pacote_50')::numeric BETWEEN 0.01 AND 1000000
 AND jsonb_typeof(valores->'mumu_pacote_100') = 'number' AND (valores->>'mumu_pacote_100')::numeric BETWEEN 0.01 AND 1000000
 AND jsonb_typeof(valores->'mumu_pacote_200') = 'number' AND (valores->>'mumu_pacote_200')::numeric BETWEEN 0.01 AND 1000000
 AND jsonb_typeof(valores->'mumu_desfazer_desconto') = 'number' AND (valores->>'mumu_desfazer_desconto')::numeric BETWEEN 0 AND 100,false));
create or replace function public.registrar_alteracao_taxas() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
 new.versao:=old.versao+1;new.updated_at:=now();new.updated_by:=auth.uid();
 insert into public.taxas_historico(versao,anteriores,novos,updated_by)
 values(new.versao,old.valores,new.valores,auth.uid());
 return new;
end;$$;
drop trigger if exists taxas_auditoria on public.taxas_config;
create trigger taxas_auditoria before update on public.taxas_config for each row execute function public.registrar_alteracao_taxas();
insert into public.taxas_config(id,valores) values('global','{"mercado_compra":50,"mercado_venda":50,"codex_acrescimo":40,"pix_admin":10,"pix_conversao":0.00001,"pix_minimo":1000,"pix_limite":500,"planta_taxa":10,"nivel_multiplicador":0.5,"mochila_desconto":50,"trocas_taxa":5,"poupanca_rendimento":0.6,"bi_entrada":1,"bi_aluguel":30,"bi_servico":25,"mineracao_mercado":20,"mineracao_base":35,"mineracao_passiva":1e-8,"btc_compra":10000,"btc_venda":999,"sm_compra":12,"sm_venda":8,"mumu_saldo":100,"mumu_minimo":50,"usdt_saldo":1000000,"usdt_minimo":0.01,"geral_selic":5e-7,"geral_acoes":3e-7,"geral_fiis":7e-7,"geral_cdb":6e-7,"geral_poupanca":4e-7,"shagrila_venda":50,"bolsa_selic":10.75,"mumu_pacote_10":1.0,"mumu_pacote_20":2.0,"mumu_pacote_50":5.0,"mumu_pacote_100":10.0,"mumu_pacote_200":20.0,"mumu_desfazer_desconto":50}'::jsonb) on conflict(id) do nothing;
-- A função é chamada pelos procedimentos existentes após sua integração.
create or replace function public.taxa_global(p_chave text) returns numeric
language sql stable security invoker set search_path='' as $taxa_global$
 select (valores->>p_chave)::numeric from public.taxas_config where id='global';
$taxa_global$;
revoke all on function public.taxa_global(text) from public;
grant execute on function public.taxa_global(text) to anon,authenticated;
create or replace view public.taxas_status_integracoes with (security_invoker=true) as
select item.id, not exists (
 select 1 from unnest(item.funcoes) as nome(funcao)
 where not exists (
  select 1 from pg_catalog.pg_proc p join pg_catalog.pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname=nome.funcao
  and p.prosrc like '%taxa_global%' and p.prosrc like '%' || item.id || '%'
 )
) as pronto
from (values
 ('trocas_taxa',array['criar_troca']),
 ('mineracao_mercado',array['vender_poder']),
 ('mineracao_base',array['vender_poder']),
 ('mineracao_passiva',array['coletar_passiva','minerar_offline']),
 ('mumu_pacote_10',array['trocar_mumu_por_saldo','desfazer_troca']),
 ('mumu_pacote_20',array['trocar_mumu_por_saldo','desfazer_troca']),
 ('mumu_pacote_50',array['trocar_mumu_por_saldo','desfazer_troca']),
 ('mumu_pacote_100',array['trocar_mumu_por_saldo','desfazer_troca']),
 ('mumu_pacote_200',array['trocar_mumu_por_saldo','desfazer_troca']),
 ('mumu_desfazer_desconto',array['desfazer_troca'])
) as item(id,funcoes);
grant select on public.taxas_status_integracoes to anon,authenticated;
commit;
-- Para conceder acesso, configure app_metadata.role="admin" na conta do Supabase Auth
-- usando uma operação administrativa no servidor. Faça login novamente depois da alteração.
