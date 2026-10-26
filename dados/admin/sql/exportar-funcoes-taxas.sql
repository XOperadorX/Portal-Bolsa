-- Consulta de leitura: execute no SQL Editor e envie o resultado para integrar as taxas.
-- Não altera funções, taxas, saldos ou permissões.
select
  p.proname as funcao,
  pg_catalog.pg_get_function_identity_arguments(p.oid) as argumentos,
  pg_catalog.pg_get_functiondef(p.oid) as definicao
from pg_catalog.pg_proc p
join pg_catalog.pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.prokind = 'f'
  and p.proname in ('criar_troca', 'vender_poder', 'coletar_passiva', 'minerar_offline', 'trocar_mumu_por_saldo', 'desfazer_troca', 'minerar_clique')
order by p.proname, argumentos;
