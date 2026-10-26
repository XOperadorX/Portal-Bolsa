# Chat das negociações

1. Execute instalar-chat-trocas.sql no SQL Editor do Supabase do projeto.
2. Saia e entre novamente pelo login.html. O login passa a chamar login_chat, que valida a senha usando a função login_usuario existente e emite uma sessão de chat de 24 horas. Se a instalação ainda não foi feita, o login normal continua funcionando, mas o chat informa que está indisponível.
3. Em jogos/mochila/trocap.html, informe o nick exato de um comprador cadastrado. A conversa abre após a verificação do nick. Compradores respondem pela lista Conversas recebidas e enviadas.
4. O ADM consulta as conversas em dados/admin/chat.html, pelo botão Conversas das trocas do painel. A autorização é verificada no servidor pela sessão de chat e pelo indicador ADM (campo `cadeado` do registro Geral), usado pelos painéis existentes, ou por uma sessão Supabase Auth com app_metadata.role=admin.

As mensagens recebem remetente e data/hora no servidor. O navegador não escolhe outro remetente. O histórico completo é mantido, com páginas de 100 mensagens. O envio usa um identificador único para não duplicar mensagens se uma confirmação falhar e o jogador tentar novamente.

O histórico é espelhado cifrado em Geral.meta.chat_trocas, no registro do vendedor. Há uma cópia cifrada no esquema privado para preservar o histórico caso outro jogo substitua meta. As chaves e as sessões ficam em esquema não exposto à API. As funções só mostram mensagens aos participantes e ao ADM. Elas usam SECURITY DEFINER para autenticar a sessão própria do portal, sem confiar no login ou no papel informado pelo navegador. Não modificam as políticas existentes de Geral.

A consulta de mensagens acontece a cada 4 segundos enquanto a página está visível e ao voltar para a aba. Os intervalos e os nomes das funções ficam no config.js da raiz. Não é preciso ativar Realtime para o chat.

A instalação não apaga conversas e não recria nem altera login_usuario. Antes da execução, confirme que essa função existente aceita login e senha e retorna o objeto JSON com ok e login, como usado pelo login.html.

Validação remota ainda depende de executar o SQL no banco; testes locais usam o cliente Supabase simulado.
