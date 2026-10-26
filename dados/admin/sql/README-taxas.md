# Ativar a Central de taxas

A página é dados/admin/taxa.html e possui um botão no menu dados/admin/admin.html.

1. No Supabase do projeto, abra SQL Editor e execute instalar-taxas.sql.
2. Em Authentication > Users, crie ou identifique a conta administrativa com e-mail e senha. A conta de jogador da tabela Geral não é automaticamente uma conta do Supabase Auth.
3. No SQL Editor, conceda a função administrativa somente à conta escolhida:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where email = 'SUBSTITUA_PELO_EMAIL_DO_ADMIN';
```

4. Entre na Central de taxas com essa conta. Depois de alterar a função, saia e entre novamente para renovar a sessão.
5. Ajuste os campos e clique em Publicar taxas para todos os jogadores. Recarregue as páginas dos jogos para usar a nova versão.

A leitura das taxas é pública. A atualização exige Supabase Auth com app_metadata.role=admin e é validada por RLS. A sessão do jogo e o campo cadeado não concedem essa permissão. Os campos numéricos são validados também pelo banco, e cada publicação gera histórico e nova versão. Uma edição desatualizada não sobrescreve a versão mais recente.

Sem a estrutura global instalada ou com falha de rede, os jogos continuam com os valores padrão anteriores. A página administrativa informa o erro e não simula sucesso na gravação. Não foi aplicada alteração remota automaticamente.

Taxas de trocas que também forem calculadas dentro de funções SQL do banco precisam usar a mesma configuração em taxas_config. O código dessas funções não está no repositório; confira a regra no banco ao ativar a central.

## Procedimentos calculados no servidor

As funções existentes não foram fornecidas. Antes de liberar os quatro parâmetros indicados como pendentes, ajuste suas fórmulas para consultar:

- criar_troca: public.taxa_global('trocas_taxa') / 100
- vender_poder: public.taxa_global('mineracao_mercado') / 100 e public.taxa_global('mineracao_base') / 100
- coletar_passiva e minerar_offline: public.taxa_global('mineracao_passiva')

A view taxas_status_integracoes verifica a presença dessas leituras no corpo das funções. Enquanto as funções não consultarem a central, os campos ficam desabilitados e os clientes mantêm as taxas antigas para essas operações. Verifique os cálculos reais depois da alteração das funções.

## Conversões da página MUMU

A central inclui cinco valores de saldo por pacote (10, 20, 50, 100 e 200 MUMU) e o desconto percentual ao desfazer. Os padrões mantêm os valores anteriores: S$ 1, 2, 5, 10 e 20, com desconto de 50% no retorno.

Execute a versão atual de instalar-taxas.sql para incluir os seis campos sem sobrescrever taxas existentes. As RPCs trocar_mumu_por_saldo e desfazer_troca precisam consultar os parâmetros mumu_pacote_10, mumu_pacote_20, mumu_pacote_50, mumu_pacote_100, mumu_pacote_200 e mumu_desfazer_desconto. O servidor deve calcular os resultados e validar os valores enviados pelo cliente. Enquanto essa integração não for detectada, a publicação desses parâmetros fica bloqueada e a página usa os padrões anteriores.

A consulta exportar-funcoes-taxas.sql inclui essas duas RPCs. Seus corpos reais ainda precisam ser obtidos do banco antes de preparar a integração; o repositório não presume que aceitam outras cotações. Códigos de resgate são recompensas definidas pelo ADM, sem taxa de conversão nesta página.
