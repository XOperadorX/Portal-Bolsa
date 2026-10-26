-- Execute no SQL Editor somente se Geral ainda não estiver na publicação Realtime.
-- Não altera os dados ou as políticas de acesso da tabela.
do $realtime$
begin
 if not exists (select 1 from pg_catalog.pg_publication where pubname='supabase_realtime') then
  raise exception 'Publicação supabase_realtime não encontrada. Configure Realtime no painel Supabase.';
 end if;
 if not exists (select 1 from pg_catalog.pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='Geral') then
  alter publication supabase_realtime add table public."Geral";
 end if;
end;
$realtime$;
