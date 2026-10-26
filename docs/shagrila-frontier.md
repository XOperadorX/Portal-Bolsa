# Catálogo de Shangri-La Frontier em Shagrila

Os dois anexos enviados tinham o mesmo conteúdo. A referência original está em [shagrila-itens-referencia.txt](shagrila-itens-referencia.txt). O catálogo reúne 90 entradas sem repetir os títulos duplicados do texto, em equipamentos, materiais, consumíveis, especiais e relíquias.

## Jogar

Abra `jogos/shagrila/shagrila.html`. A seção da loja permite buscar nome, procedência e elemento e filtrar por categoria ou mostrar todos. Cada cartão mostra preço em S$, referência narrativa, atributos efetivos e receitas disponíveis. Os valores, elementos e receitas foram adaptados ao projeto; não representam uma tabela oficial da obra.

Compre pelo cartão e equipe no inventário. Retirar um equipamento devolve a unidade à mochila; trocar a peça devolve a anterior. Não há troca de peças em combate. Gilta Brille exige 400 de vitalidade, somando o personagem e o cinto equipado. A vitalidade dos cintos foi adaptada também em defesa; não altera a coluna base do personagem.

A arma define o elemento ofensivo. A escolha de afinidade define o elemento defensivo. Ciclo: fogo vence ar, ar vence terra, terra vence água e água vence fogo. Ataques físicos permanecem neutros. Bônus de ataque, armadura, resistências e demais atributos usam o motor compartilhado e seus limites.

A forja verifica todos os materiais antes de consumir qualquer unidade. Há oito receitas. A coleta custa 10 SM e exige possuir ou equipar uma Piqueta. Os materiais também podem ser comprados. Sete novos inimigos complementam os encontros anteriores com materiais e armas como recompensa.

## Efeitos adaptados

Os poderes narrativos foram preservados nas descrições. O texto de efeito no cartão informa o comportamento efetivo no jogo:

- Herb, Salmão e Tenda recuperam HP; Poção MP, Salmão e Tenda recuperam MP. Não consomem uma unidade se ambos os recursos aplicáveis já estiverem cheios.
- Teletransporte encerra o encontro sem penalidade. Ídolo Negador inicia um encontro, com custo de stamina.
- Boneca Kármica concede resistência geral para cinco ataques recebidos.
- Joia e Salvamento preparam resgate automático para o próximo golpe fatal; a Joia recupera todo o HP e Salvamento metade. O item é consumido ao preparar. Esta adaptação substitui a janela narrativa de dez segundos. Salvamento tem limite de cinco unidades nas compras desta loja.
- Pílula concede +99% de dano por quinze minutos, com perda de um nível a cada trinta segundos até o mínimo de um. O prazo é persistido e os períodos decorridos são cobrados ao reabrir Shagrila.
- Céu Claro e Ligação são aprendizados únicos com bônus de dano contra chefes e golpe duplo.
- Água Benta causa um ataque de purificação contra mortos-vivos. Ídolo de Terra causa ataque de fogo. Ambos usam o motor de combate e custam 10 SM.
- Escalas de Recompensa é reutilizável e troca S$ 100 por um ponto de força base.
- Colar da Alma Vorpal reduz pela metade a experiência recebida e concede bônus contra chefes. O multiplicador narrativo de pontos de status não foi implementado, pois o jogo atual não possui distribuição de pontos.
- Transformações de Emul, fusão das luas, durabilidade, ocupação de herói, pilotagem, espaço dimensional, reflexão de xamanismo e combinação livre de técnicas permanecem referências narrativas. Os equipamentos relacionados têm os bônus listados no cartão. Relíquias sem ação ativa permanecem itens de coleção com compra e venda.

## Persistência e integração

O catálogo está em `shared/shagrila-catalogo.js`. Itens continuam em `Geral.itens`, nomes dos equipamentos em `Geral.meta.equip` e estados dos efeitos em `Geral.meta.shagrila`. A gravação existente preserva outras chaves de `meta`. Nenhuma tabela ou coluna nova é necessária.

O mercado e a mochila reconhecem a procedência Shagrila; os slots adicionais incluem escudo, colar, cintura e acessório. O motor resolve os nomes dos equipamentos pelo mesmo catálogo, sem gravar seus bônus como atributos base ou duplicá-los a cada carregamento.

## Validação

`tests/shagrila-frontier.test.cjs` cobre unicidade, categorias, preços, requisitos, troca de equipamento sem duplicação, forja sem consumo parcial, efeitos de itens, elementos e bônus no combate. Testes locais não comprovam gravação remota ou aparência no navegador.

## Espaços de equipamento

A ficha tem Brinco Esquerdo, Brinco Direito, Elmo, Manopla Esquerda, Manopla Direita, Medalha ou Pingente, Peitoral, Arma (Espada, Arco ou Machado), Escudo, Flechas, Calça, Bota Esquerda e Bota Direita. Cintura e Acessório continuam disponíveis para os itens anteriores.

Cada espaço lista somente peças compatíveis que existem no inventário. Brincos, manoplas e botas podem ser colocados no lado escolhido; para equipar nos dois lados são necessárias duas unidades. O botão no inventário escolhe primeiro um espaço compatível vazio. Também é possível escolher explicitamente o espaço na ficha. A troca devolve a peça anterior ao inventário.

Os nomes antigos de cabeça, corpo, colar e bota são convertidos para os espaços novos ao carregar. Uma bota antiga representa uma unidade, colocada à esquerda. Nenhuma segunda unidade é criada automaticamente.

O Poder de Combate é um indicador local: ataque × (1 + crítico/100 × 0,5) × (1 + golpe duplo/100) × 10 + armadura × 5 + HP máximo/10, arredondado. Ele considera os atributos efetivos e os limites do motor. Não é saldo, recompensa ou dano adicional.

O catálogo inclui peças básicas para os espaços novos, além de arco, machado e flechas. Seus bônus são somados apenas quando equipados; não há consumo de flechas por disparo nesta versão.

## Equipar pelo Mercado

Os cartões de `jogos/mercado/mercado.html` mostram a descrição, os atributos efetivos e o elemento do catálogo compartilhado. Recursos e ativos sem efeito de combate exibem essa informação e “Não se aplica” no elemento.

Equipamentos de Shagrila disponíveis no inventário têm seleção do espaço e botão Equipar. A operação consome uma unidade da mochila, devolve a peça anterior e salva `meta.equip`, sem cobrar saldo. Os requisitos de vitalidade e a compatibilidade usam a mesma função de Shagrila. Sem conexão, durante outra gravação ou sem estoque, o controle fica desabilitado. Se a gravação falhar, o estado local é restaurado.

## Lâminas e atributos no inventário

O inventário mostra atributos, elemento e espaços compatíveis de cada equipamento. Consumíveis exibem sua recuperação; materiais informam sua finalidade.

Lâmina Gêmea foi substituída por Lâmina Gêmea Esquerda e Lâmina Gêmea Direita, com espaços próprios. Cada lado concede +3 de ataque e +1 de golpe duplo; o par mantém o bônus anterior de +6 e +2. Cada lado tem referência de S$ 0,05.

Ao carregar Shagrila, cada par antigo no inventário se transforma em uma lâmina de cada lado. O par antigo equipado também é separado. A conversão é idempotente: recarregar não cria outros pares. As mudanças são gravadas pelo salvamento existente do jogo.

## Estrutura atual dos equipamentos

A ficha segue esta ordem: Poder de Combate, Brinco Esquerdo, Brinco Direito, Elmo, Mão Esquerda, Mão Direita, Pescoço, Peitoral, Cintura, Calça, Bota Esquerda e Bota Direita.

Armas, lâminas e manoplas ocupam os espaços das mãos; escudos ocupam a esquerda. Medalhas e colares ocupam Pescoço. Os espaços separados anteriores foram removidos. Peças que disputam o mesmo espaço são devolvidas ao inventário durante a conversão; flechas e acessórios sem espaço compatível também ficam no inventário. Cada mão comporta uma peça por vez. Os bônus continuam sendo aplicados somente às peças equipadas.

## Cristais

Cristais (`Geral.cristais`) são uma moeda rara concedida pelo ADM. Foram retirados da compra e venda do Mercado, inclusive da lógica de negociação. O Mercado também não inclui essa coluna nas suas gravações. O saldo existente, a consulta no Player, a conquista Cristalino e os demais usos disponíveis permanecem preservados. Essa regra trata da moeda Cristais; materiais como Cristal Estelar Lapisteria continuam sendo itens do catálogo.
