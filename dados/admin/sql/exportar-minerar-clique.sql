-- Somente leitura: obtenha a regra atual antes de ajustar o ganho fixo.
select pg_catalog.pg_get_function_identity_arguments(p.oid) as argumentos,
       pg_catalog.pg_get_functiondef(p.oid) as definicao
from pg_catalog.pg_proc p
join pg_catalog.pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname='minerar_clique' and p.prokind='f';
