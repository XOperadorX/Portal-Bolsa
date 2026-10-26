-- Execute UMA VEZ no SQL Editor. Depois, jogadores continuam clicando normalmente.
-- Preserva o código, parâmetros e verificações da função existente.
-- Altera somente a atribuição da variável retornada como ganho.
-- Se não reconhecer a estrutura, interrompe sem alterar a função.
begin;
do $ajuste$
declare
 alvo oid;
 definicao text;
 corpo text;
 variavel text;
 ocorrencias integer;
 tipo text;
begin
 select p.oid into alvo from pg_catalog.pg_proc p
 join pg_catalog.pg_namespace n on n.oid=p.pronamespace
 where n.nspname='public' and p.proname='minerar_clique'
 and p.prokind='f' and p.pronargs=1
 and pg_catalog.pg_get_function_identity_arguments(p.oid)='p_login text';
 if alvo is null then raise exception 'Função minerar_clique(p_login text) não encontrada. Execute exportar-minerar-clique.sql e envie a definição.';end if;
 select pg_catalog.pg_get_functiondef(alvo),p.prosrc into definicao,corpo from pg_catalog.pg_proc p where p.oid=alvo;
 select count(*),min(m[1]) into ocorrencias,variavel
 from regexp_matches(corpo, $regex$'ganho'\s*,\s*([a-zA-Z_][a-zA-Z_0-9]*)$regex$,'gi') m;
 if ocorrencias<>1 then raise exception 'Formato do retorno não reconhecido. Nenhuma alteração feita. Execute exportar-minerar-clique.sql e envie o resultado.';end if;
 select count(*) into ocorrencias from regexp_matches(corpo,'\m'||variavel||'\M\s*:=\s*[^;]+;','gi');
 if ocorrencias<>1 then raise exception 'Cálculo do ganho não reconhecido com segurança. Nenhuma alteração feita. Exporte a função.';end if;
 select m[1] into tipo from regexp_matches(corpo,'\m'||variavel||'\M\s+(numeric|decimal|double precision|real)\M','i') m limit 1;
 if tipo is null then raise exception 'Tipo da variável de ganho não reconhecido. Nenhuma alteração feita. Exporte a função.';end if;
 definicao:=regexp_replace(definicao,'\m'||variavel||'\M\s*:=\s*[^;]+;',variavel||' := 0.00000001::numeric;','gi');
 -- Evita arredondar o satoshi para zero em uma variável numeric com escala baixa.
 definicao:=regexp_replace(definicao,'(\m'||variavel||'\M\s+)(numeric|decimal)\s*\([^)]*\)','\1numeric(38,18)','gi');
 execute definicao;
 raise notice 'Ganho por clique atualizado para 0.00000001 BTC. As verificações e permissões da função foram preservadas.';
end;
$ajuste$;
commit;
