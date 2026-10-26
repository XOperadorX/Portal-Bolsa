# Dano e defesa no projeto

Referência: dano-defesa-referencia.txt, texto fornecido pelo usuário. Guia interativo: combate.html.

O motor em shared/combate.js é puro, usa percentuais em pontos percentuais (10 significa 10%) e recebe um gerador de aleatoriedade nos testes. Os parâmetros ficam em shared/combate-config.js, reexportado por config.js.

## Padrões confirmados

- Fator do grau = 1 + floor((máximo(1, grau) - 1) / 2). Graus 1–2 usam fator 1; 3–4 usam 2.
- Ciclo elemental: fogo vence ar; ar vence terra; terra vence água; água vence fogo. Vantagem: 1,30; elemento igual: 1,00; demais pares elementais: 0,85. Físico e elemento não informado são neutros.

## Padrões configuráveis para as lacunas do texto

- Folga de grau: 2. Cada grau acima de grau de defesa + folga acrescenta 10% ao golpe do monstro.
- Regeneração começa após 5 segundos sem sofrer dano; em combate usa 20% do valor. Um ataque nos últimos 5 segundos caracteriza combate. Sem atributo de regeneração, não existe cura automática nova.
- O golpe duplo resolve um segundo golpe completo, com nova rolagem de crítico. Não acerta um alvo já morto nem cura por um acerto inexistente.
- Espinhos não geram outro reflexo. Cura não ressuscita um atacante morto.

## Armazenamento e equipamentos

Os campos existentes de HP, ataque e defesa continuam sendo usados. Os atributos novos podem ser salvos em Geral.meta.combate, sem criar novas colunas. Nos jogos que já usam salvamento local, os dados seguem esse salvamento. A ficha do dashboard só consulta e não simula recuperação sobre o banco.

Exemplo de meta.combate (percentuais em pontos percentuais):

```json
{"velocidadeAtaque":18,"critico":12,"golpeDuplo":6,"danoPercentual":20,"evasao":60,"resistencias":{"fogo":20},"resistenciaTodos":5,"resistenciaFisica":10,"espinhos":15,"vidaPorGolpe":4,"curaMatar":2,"regeneracao":1,"curaPocao":30,"danoBoss":20,"reducaoBoss":20,"movimento":20,"achadoRaridade":1,"elemento":"fogo","pecasDefesa":[3,3,3,3,3,0]}
```

Peças em equipment/equip podem fornecer bonusCombate (mesmos nomes dos atributos), base.dano, base.armadura e atributosBasePercentual. Espaços vazios contam como zero no grau de defesa. Atributos de equipamentos existentes como Destreza e Inteligência continuam nas fórmulas-base dos respectivos jogos.

## Integração

Shagrila, RPG Geral, Lyra Azure, Sandbox, Ninos, Torre e Gax usam o motor para os acertos. O tempo de ataque básico usa o intervalo de 1,1 s ajustado pela velocidade. Dano ambiental independente de um atacante, como armadilhas de Lyra, continua sendo ambiental.

A ficha está disponível nesses jogos e nas telas de perfil, nível e dashboard. O guia pode ser aberto pelo menu compartilhado. Arquivos antigos de backup em Todos, GeralZip e cópias não são versões ativas e mantêm as fórmulas históricas.

A implantação muda o balanceamento: o crítico de Shagrila deixa de multiplicar por 2,5, o de Lyra deixa de usar 1,8/2 e a redução arbitrária de dano em chefes de Shagrila é substituída pela sequência comum. Recompensas, moedas e stamina das ações são mantidas.
