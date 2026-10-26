// Catálogo adaptado dos textos fornecidos. Valores em S$ pertencem à economia do projeto.
const equipamento = (nome, slot, preco, dano=0, armadura=0, elemento='fisico', bonus={}, origem='Secondil') => ({nome,categoria:'Equipamentos',slot,preco,elemento,origem,bonusCombate:{...bonus},base:{dano,armadura},grau:Math.max(1,Math.ceil(preco/2))});
export const ITENS_SHAGRILA = [
 equipamento('Conjunto de Equipamentos de Couro Splitblade','corpo',4,0,16,'terra',{resistenciaFisica:8}),
 equipamento('Máscara de Couro Splitblade','cabeca',1,0,6,'terra',{resistenciaFisica:4}),
 equipamento('Espada de Ferro','arma',.25,12), equipamento('Adaga de Ferro','arma',.20,8,0,'fisico',{velocidadeAtaque:10}),
 equipamento('Lança de Ferro','arma',.30,15), equipamento('Martelo de Ferro','arma',.35,19),
 equipamento('Bastão de Madeira','arma',.12,5,0,'ar',{danoElemental:{ar:8}}),
 equipamento('Cajado de Pedra','arma',.18,8,0,'terra',{danoElemental:{terra:10}}),
 equipamento('Vara Fóssil','arma',.22,10,0,'agua',{danoElemental:{agua:10}}),
 equipamento('Escudo de Madeira','escudo',.18,0,10), equipamento('Piqueta','arma',.25,14),
 equipamento('Mercenário Twinblade','arma',.30,12,0,'fisico',{golpeDuplo:5}),
 equipamento('Machado de Mão Goblin','arma',.12,10),
 equipamento('Vorpal Chopper','arma',1.2,22,0,'fisico',{critico:8},'Vorpal Bunny'),
 equipamento('Adagas do Pântano','arma',1.5,24,0,'agua',{critico:5,velocidadeAtaque:12},'Forja de Secondil'),
 equipamento('Togetsu','arma',5,40,0,'ar',{critico:12,golpeDuplo:8},'Artesão Vysache'),
 equipamento('Abelha Império Twinblade','arma',3,30,0,'terra',{golpeDuplo:10,danoElemental:{terra:15}},'Bilac'),
 {...equipamento('Gilta Brille','arma',8,65,0,'terra',{danoElemental:{terra:20}},'Era dos Deuses'),requisitoVit:400},
 equipamento('Colar da Alma Vorpal','colar',4,0,0,'fisico',{danoBoss:15},'Vysache'),
 equipamento('Ritual Medjed Keffiyeh','cabeca',2,0,12,'ar',{evasao:8},'Thirdrema'),
 equipamento('Staring Bird Mask','cabeca',.4,0,4,'ar',{evasao:5}),
 equipamento('Spiked Battlehelm','cabeca',2.5,0,25,'terra',{espinhos:3,resistenciaFisica:8},'Besouro Quádruplo'),
 equipamento('Splitblade Leather Mask','cabeca',1,0,6,'terra',{resistenciaFisica:4}),
 equipamento('Splitblade Leather Overalls','corpo',4,0,16,'terra',{resistenciaFisica:8}),
 {...equipamento('Waist Belt of Life Tide','cintura',2,0,19,'agua',{},'Thirdrema'),vitalidade:19},
 {...equipamento('Excavated Grindsash [Veteran]','cintura',12,0,400,'terra',{},'Eleventar'),vitalidade:400},
 equipamento('Antinomy','arma',20,100,0,'fogo',{danoBoss:25,critico:10},'Psyger-0'),
 equipamento('Inventoria Key','acessorio',10,0,0,'fisico',{achadoRaridade:.2},'Era dos Deuses'),
 equipamento("General Dullahan’s Decapitator",'arma',2,32,0,'fisico',{execucao:true},'General Dullahan'),
 equipamento("Flame General’s Decapitator",'arma',4,44,0,'fogo',{danoElemental:{fogo:20}},'Bilac'),
 equipamento('Lança Sagrada Caledfwlch','arma',25,110,0,'ar',{danoBoss:35},'Armas de herói'),
 equipamento('Pulseira Misteriosa Vorpal','acessorio',4,0,0,'ar',{evasao:10},'Vorpal'),
 equipamento('Adebane de Armadura Especializada Não Padrão','corpo',18,0,100,'terra',{reducaoBoss:20,resistenciaTodos:10},'Wezaemon'),
 equipamento('Tático Não Padrão Avain Suzaku','acessorio',15,20,0,'ar',{velocidadeAtaque:20},'Era dos Deuses'),
 ...[
 ['Bolsa de Néctar Papillon de Armazenamento',.08,'agua'],['Pelo de pólen de abelha dos Trabalhadores do Império',.06,'terra'],
 ['Picada de Abelha Caçadora do Impore',.08,'terra'],['Mandíbula da Abelha Caçadora do Imprécio',.08,'terra'],
 ['Asa furtiva Mimic Mantis',.10,'ar'],['Mimar Braço de Foice Louva-a-Deus',.12,'ar'],
 ['Chifre de Besouro Quádruple',.20,'terra'],['Mandíbula do Besouro Quádruplo',.18,'terra'],
 ['Carapaça de Besouro Quádruplo',.25,'terra'],['Élitron Quad Besouro',.18,'ar']
 ].map(([nome,preco,elemento])=>({nome,preco,elemento,categoria:'Materiais',origem:'Gruta da Floresta Prismática'})),
 ...[
 ['Stone',.02,'terra','Mineração'],['Python Scale',.08,'terra','Serpente Voraz'],['Cabelo Branco',.08,'ar','Serpente Voraz'],
 ['Minério Cinzento',.10,'terra','Deserto do Pântano Dire'],['Fóssil de Marshcoffin',.30,'agua','Marshcoffin'],
 ['Pele de Sapo de Lama',.08,'agua','Sapo de Lama'],['Aroncaleth Hard Lapis',.8,'agua','Escorpião de Cristal'],
 ['Quartzo Amurcidiano',1.2,'terra','Mineração'],['Cristal de Âmbar de Lowenanva',1,'terra','Árvore Brilhante'],
 ['Cristal Estelar Lapisteria',1.5,'ar','Mineração'],['Areia cristalina',.12,'terra','Mineração'],
 ['Barbatana de Firehair de Arctus Regacles',.6,'fogo','Arctus Regalecus']
 ].map(([nome,preco,elemento,origem])=>({nome,preco,elemento,origem,categoria:'Materiais'})),
 ...[
 ['Herb',.01,25,0],['Poção MP',.03,0,30],['Salmão Lifestide',.08,80,20],['Tenda de Salvação',.50,200,60]
 ].map(([nome,preco,heal,mana])=>({nome,preco,heal,mana,categoria:'Consumíveis',elemento:'agua',origem:'Loja do viajante'})),
 ...[
 ['Teletransporte de Coordenadas',.4,'teleporte'],['Boneca de Palha Kármica',.5,'protecao'],
 ['Escalas de Recompensa',100,'recompensa'],['Joia da Lágrima do Renascimento',4000,'renascer'],
 ['Salvamento Divino',4,'reviver'],['Pílula da Força do Mal',3,'pilula'],
 ['Livro de Habilidades Céu Claro',10,'habilidade'],['Água Benta do Santo',.2,'bencao'],
 ['Poção de Habilidade de Ligação',.6,'ligacao'],['Explodindo Ídolo de Terra',.3,'explosao'],
 ['Ídolo Negador de Espadas',.2,'atrair']
 ].map(([nome,preco,acao])=>({nome,preco,acao,categoria:'Especiais',elemento:acao==='explosao'?'fogo':'fisico',origem:'Relíquias e viajantes'})),
 ...[
 ['Mapa',.10],['Colar de Fragmento de ID',1],['Broche da Oração Distante',5],
 ['Tomo da Verdade, O Guardião do Túmulo',5],['Reator de Éter Não Padronizado',8]
 ].map(([nome,preco])=>({nome,preco,categoria:'Relíquias',elemento:'fisico',origem:'Exploração e Wezaemon'}))
];
export const CATALOGO_SHAGRILA = Object.fromEntries(ITENS_SHAGRILA.map(i=>[i.nome,i]));
export const ELEMENTOS_SHAGRILA = {fisico:'⚔️ Físico',fogo:'🔥 Fogo',agua:'💧 Água',ar:'🌪️ Ar',terra:'🌿 Terra'};
export const RECEITAS_SHAGRILA = [
 {item:'Espada de Ferro',materiais:{'Minério Cinzento':5}},
 {item:'Máscara de Couro Splitblade',materiais:{'Pele de Sapo de Lama':2}},
 {item:'Conjunto de Equipamentos de Couro Splitblade',materiais:{'Pele de Sapo de Lama':5}},
 {item:'Adagas do Pântano',materiais:{'Fóssil de Marshcoffin':2,'Minério Cinzento':3}},
 {item:'Spiked Battlehelm',materiais:{'Carapaça de Besouro Quádruplo':3,'Chifre de Besouro Quádruple':1}},
 {item:'Togetsu',materiais:{'Vorpal Chopper':2,'Carapaça de Besouro Quádruplo':2}},
 {item:'Abelha Império Twinblade',materiais:{'Picada de Abelha Caçadora do Impore':3,'Mandíbula da Abelha Caçadora do Imprécio':2}},
 {item:'Flame General’s Decapitator',materiais:{'General Dullahan’s Decapitator':1,'Barbatana de Firehair de Arctus Regacles':2}}
];
export function forjarShagrila(inventario,nome) {
 const receita=RECEITAS_SHAGRILA.find(r=>r.item===nome);
 if(!receita)throw Error('Receita desconhecida');
 for(const [item,qtd] of Object.entries(receita.materiais))if((inventario[item]||0)<qtd)throw Error('Materiais insuficientes: '+item);
 const resultado={...inventario};
 for(const [item,qtd] of Object.entries(receita.materiais)){resultado[item]-=qtd;if(!resultado[item])delete resultado[item];}
 resultado[nome]=(resultado[nome]||0)+1;return resultado;
}
export const SLOTS_SHAGRILA = {
 brinco_esquerdo:'Brinco Esquerdo',brinco_direito:'Brinco Direito',elmo:'Elmo',
 mao_esquerda:'Mão Esquerda',mao_direita:'Mão Direita',pescoco:'Pescoço',
 peitoral:'Peitoral',cintura:'Cintura',calca:'Calça',bota_esquerda:'Bota Esquerda',bota_direita:'Bota Direita'
};
const ALIASES_SLOTS={cabeca:'elmo',corpo:'peitoral',colar:'pescoco',pingente:'pescoco',bota:'bota_esquerda',botas:'bota_esquerda',arma:'mao_direita',escudo:'mao_esquerda',lamina_esquerda:'mao_esquerda',lamina_direita:'mao_direita',manopla_esquerda:'mao_esquerda',manopla_direita:'mao_direita'};
export function normalizarEquipShagrila(equip={},inventario) {
 const resultado={};const devolver=nome=>{if(inventario&&typeof nome==='string'&&nome!=='Nenhum')inventario[nome]=(inventario[nome]||0)+1;};
 for(const [slot,nome]of Object.entries(equip))if(SLOTS_SHAGRILA[slot])resultado[slot]=nome;
 const colocar=(slot,nome)=>{if(!nome||nome==='Nenhum')return;if(!resultado[slot]||resultado[slot]==='Nenhum')resultado[slot]=nome;else devolver(nome);};
 for(const [slot,nome]of Object.entries(equip)) {
  if(SLOTS_SHAGRILA[slot])continue;
  if(slot==='arma'&&nome==='Lâmina Gêmea'){colocar('mao_esquerda','Lâmina Gêmea Esquerda');colocar('mao_direita','Lâmina Gêmea Direita');}
  else if(ALIASES_SLOTS[slot])colocar(ALIASES_SLOTS[slot],nome);
  else if(typeof nome==='object')resultado[slot]=nome;
  else devolver(nome);
 }
 return resultado;
}
export function slotsItemShagrila(item) {
 if(!item?.slot)return [];
 const originais=item.slots||[item.slot];
 return [...new Set(originais.map(s=>ALIASES_SLOTS[s]||s).filter(s=>SLOTS_SHAGRILA[s]))];
}
export function equipamentoShagrila(equip={}) {
 return Object.fromEntries(Object.entries(normalizarEquipShagrila(equip)).map(([slot,item])=>[slot,typeof item==='string'?(CATALOGO_SHAGRILA[item]||item):item]));
}
export function equiparShagrila(p,nome,slot) {
 const item=CATALOGO_SHAGRILA[nome];if(!slotsItemShagrila(item).length||!(p.inventory[nome]>0))throw Error('Equipamento indisponível');
 const permitidos=slotsItemShagrila(item);
 slot=slot||permitidos.find(s=>!p.equip[s]||p.equip[s]==='Nenhum')||permitidos[0];
 if(!permitidos.includes(slot))throw Error('Este item não pode ser equipado neste espaço');
 p.equip=normalizarEquipShagrila(p.equip,p.inventory);
 const vitalidade=p.vit+Object.values(equipamentoShagrila(p.equip)).reduce((s,i)=>s+(i?.vitalidade||0),0);
 if(item.requisitoVit&&vitalidade<item.requisitoVit)throw Error('Requer '+item.requisitoVit+' de vitalidade');
 const anterior=p.equip[slot];p.inventory[nome]--;if(!p.inventory[nome])delete p.inventory[nome];
 if(anterior&&anterior!=='Nenhum')p.inventory[anterior]=(p.inventory[anterior]||0)+1;
 p.equip[slot]=nome;
}
export function resumoItemShagrila(item) {
 const nomes={critico:'crítico',golpeDuplo:'golpe duplo',velocidadeAtaque:'velocidade de ataque',danoBoss:'dano contra chefes',reducaoBoss:'redução de chefes',espinhos:'espinhos',evasao:'evasão',resistenciaFisica:'resistência física',resistenciaTodos:'resistência geral',achadoRaridade:'achado raro'};
 const stats=[];if(item.base?.dano)stats.push('Ataque +'+item.base.dano);if(item.base?.armadura)stats.push('Defesa +'+item.base.armadura);
 if(item.vitalidade)stats.push('Vitalidade +'+item.vitalidade);
 for(const [id,v]of Object.entries(item.bonusCombate||{}))stats.push(typeof v==='object'?Object.entries(v).map(([el,n])=>el+' +'+n+'%').join(', '):typeof v==='boolean'?id:(nomes[id]||id)+' +'+v);
 if(item.heal)stats.push('HP +'+item.heal);if(item.mana)stats.push('MP +'+item.mana);
 return stats.join(' · ')|| (item.categoria==='Materiais'?'Material de coleta e forja':'Relíquia de exploração');
}

const DESCRICOES_ORIGINAIS = {
 "Espada de Ferro": "Uma espada feita de ferro.",
 "Adaga de Ferro": "Uma adaga curta feita de ferro.",
 "Lança de Ferro": "Uma lança longa feita de ferro.",
 "Martelo de Ferro": "Um grande martelo de ferro feito de martelo.",
 "Bastão de Madeira": "Um cajado feito de madeira. Um sorriso, arma direta.",
 "Cajado de Pedra": "Um cajado feito de pedra.",
 "Vara Fóssil": "Uma vara feita de algum tipo de fóssil. Extremamente frágil.",
 "Escudo de Madeira": "Um escudo redondo de madeira.",
 "Piqueta": "Um cabo marrom com uma picareta prateada. Uma ferramenta/arma usada para minerar, porém é muito pesada (como empunhar uma grande espada) e consome um pouco da resistência do jogador.",
 "Bolsa de Néctar Papillon de Armazenamento": "Uma bolsa transparente cheia de néctar de seiva coletado.",
 "Pelo de pólen de abelha dos Trabalhadores do Império": "Um pedaço do pelo de pólen da abelha.",
 "Picada de Abelha Caçadora do Impore": "Um pedaço do ferrão da abelha.",
 "Mandíbula da Abelha Caçadora do Imprécio": "Um pedaço da mandíbula da abelha.",
 "Asa furtiva Mimic Mantis": "Um pedaço da asa da louva-a-deus.",
 "Mimar Braço de Foice Louva-a-Deus": "Um pedaço do braço de foice da louva-a-deus.",
 "Chifre de Besouro Quádruple": "Um enorme pedaço do chifre do besouro.",
 "Mandíbula do Besouro Quádruplo": "Uma peça em forma de crescente da mandíbula.",
 "Carapaça de Besouro Quádruplo": "Uma parte plana da armadura de carapaça do besouro.",
 "Élitron Quad Besouro": "Um enorme pedaço da asa do besouro.",
 "Mercenário Twinblade": "A arma que Sunraku inicialmente equipou ao criar seu personagem.",
 "Machado de Mão Goblin": "O Machado de Mão dos Duendes (ゴブリンの手斧 Goburin no Teono) é uma arma contundente que pode ser lançada por um duende. A arma em si não tem alta durabilidade e vende por um valor muito baixo.",
 "Helicópteros Vorpal": "O Helicóptero Vorpal (致命の包丁 [ヴォーパルチョッパー] Vōparu Choppā) é uma queda rara do raro monstro Vorpal Bunny. O efeito especial da arma está dando bônus ao dano crítico.",
 "Adagas do Pântano": "As Adagas do Pântano (湖沼の短剣 Koshō no Tanken) é uma arma fabricável no armeiro em Secondil. Para forjá-lo, o jogador deve coletar um raro minério fóssil de Marshcoffin. O efeito especial da arma reduz pela metade a redução de durabilidade por um tempo após um acerto crítico.",
 "Faca de arremesso": "Como Sunraku é um trabalho de combate corpo a corpo, ele foi traumatizado pela Águia Tóxica desde a quinta rodada do Treinamento Prático do Coliseu Vorpal e precisava de um item consumível, que permitisse arremessar uma faca nos inimigos à distância.",
 "Togetsu": "Togetsu Crescente/Decadente foi ascendido (recriado) pelo Divino Artesão Vysache ao infundir a Concha do Besouro Quádruplo com Vorpal Choppers. Em um acerto crítico enquanto luta contra um oponente de nível mais alto, Enfraquecimento causa dsdasddces, mas em vez disso aumenta a barra de fusão das duas armas. Uma vez alcançado um certo ponto no medidor, os dois podem se combinar para formar a Lua Gêmea. Twin Moon aumenta as chances e o poder de um crítico com base na diferença entre o nível do usuário e inimigos de nível mais alto.",
 "Abelha Império Twinblade": "Uma espada gêmea feita de materiais da Rainha Abelha do Império pelas mãos de Bilac. A espada da direita tem o efeito 'Veneno Corrosivo', contaminando e destruindo a área atingida",
 "Colar da Alma Vorpal": "Os pontos de experiência que você ganha serão reduzidos pela metade, mas os pontos de status que você ganhará ao subir de nível serão multiplicados por 2,5 vezes. Um colar de mandamento criado pelos Vysache. Não pode ser removido sem a permissão do rei.",
 "Festa Mejor Keffiyeh": "A mysterious white hood. Previously, despite its high price, it wasn't a very strong piece of equipment, and since you couldn't use both arms, it was just a joke piece of equipment. However, its popularity exploded due to rumors of a white cloth ghost seen at Third Dream. A certain peddler NPC sells it on rare occasions, but the price has risen modestly since its popularity exploded.",
 "Staring Bird Mask": "The mask Sunraku chose to hide his face when creating his own avatar.",
 "Spiked Battlehelm": "Head equipment made from Quad Beetle material. There is a collision detection in the corner, and attacks and parries are possible. It has extremely good impact resistance, and even a half-hearted attack won't even scratch it. There is also a legend that even when it was trampled by a giant beast, the armor remained unharmed (aside from the wearer). If there were to be a situation where this would be shattered, it would be a force too great for humans to handle.",
 "Splitblade Leather Mask": "Leather mask made from Mud Frog skin. Grants slash resistance.",
 "Splitblade Leather Overalls": "Leather clothing made from Mud Frog skin. Grants slash resistance. Overalls and the mask costed 4,000 mahni",
 "Waist Belt of Life Tide": "Purchased from an armor shop in Thirdrema. Endurance (VIT) is increased by +19",
 "Excavated Grindsash Veteran": "Purchased from an armor shop in Eleventar, Endurance (VIT) is increased by +400",
 "Antinomy": "A unique weapon owned by Psyger-0. It has two forms: the ominous jet-black great sword ``Satan El, and the pure white great sword ``Satan, the Emperor. When the jet-black greatsword is on, Saiga-0's body is white, giving it the appearance of a platinum holy knight, and when the pure-white greatsword is on, it is dyed black, giving it the impression of a demon lord.",
 "Inventoria Key": "A special bracelet-shaped accessory that was both the key and the door to the storage space, and was only carried by a few people even in the age of the gods. Even if the wearer is killed by the player, this accessory and the items in the storage space will not be looted. There is no capacity limit to the storage space, and non-living objects up to 50m in length and width can be stored.",
 "General Dullahan's Decapitator": "A drop item from General Dullahan. This long sword was once powerful, but now it has decayed and can only cut flesh with brute force. When attacking the target's neck, the damage is super effective.",
 "Flame General's Decapitator": "New beheading sword reworked by Bilac from the beheading sword of General Dullahan",
 "Lança Sagrada Caledfwlch": "Uma das únicas cinco \"armas de herói\" na Fronteira Shangri-La. Possuir essa arma desbloqueia o \"herói\" como uma ocupação especial (trabalho).",
 "Pulseira Misteriosa Vorpal": "Permite que Emul se transforme em um avatar humano.",
 "Adebane de Armadura Especializada Não Padrão": "Um equipamento especializado armazenado dentro do Inventaria obtido ao derrotar Wezaemon, o Guardião do Túmulo",
 "Suzaku Tático Aviário Não Padrão": "Pássaro robô que pode ser controlado/comunicado usando a armadura especial não padrão Adebane. Também requer o Reator de Éter Não Padrão.",
 "Stone": "A Pedra (石 Yishi) é apenas uma pedra comum, sem nada de especial.",
 "Python Scale": "Item drop ao derrotar a Serpente Voraz.",
 "Minério Cinzento": "O Minério Cinzento (灰色の鉱石 Haiiro no Kouseki), assemelha-se a um objeto cinza em forma de diamante. Um ferreiro precisa de 5 ou 6 peças para fabricar uma boa arma, ela confere resistência mágica ao equipamento.",
 "Fóssil de Marshcoffin": "O Fóssil de Marshcoffin (マーシュコフィン化石 Māshukofin Kaseki), assemelha-se a um objeto fóssil cristalizado semelhante ao verde. É um item raro necessário para criar Adagas do Pântano. Provavelmente já fez parte de algum monstro, há muito tempo.",
 "Pele de Sapo de Lama": "A Pele do Sapo de Lama (泥カエルの皮 Doro Kaeru no Kawa) é um item obtido após derrotar o Sapo de Lama, e com ele, você pode criar equipamentos como \"Couro Splitblade e Máscara de Couro Splitblade.\"",
 "Cristal de Âmbar de Lowenanva": "Âmbar é feito a partir da seiva endurecida de uma árvore extinta chamada \"Árvore Brilhante\". Muito raramente, poderes e criaturas mágicas antigas são selados dentro do âmbar, e um joalheiro habilidoso pode reviver o poder antigo selado no mundo moderno. Comumente conhecido como \"Brilho Âmbar\"",
 "Cristal Estelar Lapisteria": "Uma joia que ostenta a beleza de um item como se estivesse solidificado em um céu estrelado. Tem a característica de que quanto mais estrelas brilham dentro da gema, maior a quantidade de poder mágico que ela acumula. Comumente conhecida como \"A primeira estrela no dossel\"",
 "Arctus Regalecus Barbatana de Cabelo de Chama": "Item drop ao derrotar Arctus Regalecus",
 "Teletransporte de Coordenadas": "Parece uma caixa redonda preta com um selo prateado no topo. Possível uso para teletransportar o jogador para uma coordenada específica.",
 "Boneca de Palha Kármica": "Item Consumível: Aplicado a si mesmo ao esmagá-lo. Possui a habilidade de refletir o xamanismo. Se alguém expor algo dentro do núcleo da boneca de palha, isso resulta em morte instantânea. No entanto, ele só pode refletir até cinco debuffs.",
 "Herb": "Item Consumível: Recuperar uma pequena quantidade de Pontos de Vida",
 "Poção MP": "Item Consumível: Recupera seus Pontos de Mana",
 "Mapa": "Permite que os jogadores visualizem os mapas de Shangri-La",
 "Escala de Recompensa": "Um item único pertencente à empresa NPC \"Golden Scales\". Ao colocar os itens no \"Prato de Oferendas\" à esquerda, você pode receber vários benefícios do \"Prato de Bênção\" à direita, dependendo do preço. Para pontos de status, a taxa é 100.000 mahni = 1 ponto. Pode ser concedido a pessoas além do usuário. É um item único da classe mais alta, e seus benefícios têm prioridade sobre a anulação de buffs causada pela \"Maldição de Lycaon\".",
 "Colar de Fragmento de ID": "Um colar que Emuru usa como talismã. Um item com um mistério oculto.",
 "Joia da Lágrima do Renascimento": "Um item que revive o jogador com recuperação total quando usado dentro de 10 segundos após seu HP atingir 0. O preço é de 4 milhões de mani, que é um dos maiores entre os itens consumíveis.",
 "Salvamento Divino": "Um item que revive o jogador com metade do HP quando usado dentro de 10 segundos após o HP chegar a 0. O número máximo de itens que uma pessoa pode possuir é 5.",
 "Pílula da Força do Mal": "Por 15 minutos, o jogador que a usar pode ganhar atributos equivalentes ao nível máximo (99). No entanto, o usuário deve pagar por efeitos colaterais, como cores aparecendo invertidas e o nível diminuindo em 1 a cada 30 segundos.",
 "Livro de Habilidades Céu Claro": "Um meio de armazenamento que registra as técnicas secretas de esgrima empunhadas por Wezaemon, o guardião do túmulo. Ao carregá-lo no equipamento da Era dos Deuses, o usuário poderá aprender Seiten-ryu/Clear Sky.",
 "Salmão Lifestide": "Um salmão que vive nas correntes da vida. Aqueles que comerem seu corpo recuperarão sua força física, e seus ovos se tornarão excelentes catalisadores mágicos. Há vida até na grande terra, e a vida do sangue circula.",
 "Tenda de Salvação": "Uma tenda verde com uma lanterninha dentro e estilo como uma grande cabana. Usado para jogadores terem Pontos de Salvamento quando não estão em cidades para se hospedarem em estalagens. Usado principalmente na natureza e/ou em masmorras. Podem não ser os mais confortáveis, mas ajudam em emergências. No entanto, eles são caros e têm um número limitado de usos.",
 "Água Benta do Santo": "É a água benta na qual a Santa do Amor, Eristella, colocou seu coração em fazer. Enfraquece monstros mortos-vivos.",
 "Poção de Habilidade Combine": "Um meio de armazenamento que permite ao jogador combinar/conectar habilidades entre si.",
 "Alfinete de Flores das Orações Passadas": "Um acessório obtido por Arthur Pencilgon como recompensa por lutar contra Wezaemon, o Guardião do Túmulo",
 "Tomo da Verdade, O Guardião do Túmulo": "Um tomo obtido por Arthur Pencilgon como recompensa por lutar contra Wezaemon, o Guardião do Túmulo",
 "Reator de Éter Não Substando": "Uma ferramenta da civilização da Era dos Deuses que serve como fonte de energia para as aeronaves táticas e blindagem especialmente reforçada alinhada no espaço de armazenamento do Inventário de Chaves de Armazenamento. Oikatzo o obteve como recompensa pela batalha contra Wezaemon, o Guardião do Túmulo, mas foi danificado. Reparos exigem o trabalho de Artesão Divino.",
 "Explodindo Ídolo de Terra": "Uma pequena autopartícula que raramente é produzida por golems naturais. Os ídolos produzidos pelo Golem Cannonball causam pequenas explosões quando recebem um impacto forte. Quando a dança do ídolo de argila atinge seu auge, uma chama é produzida da terra.",
 "Ídolo Negador de Espadas": "Isso atrai fortemente a atenção de certos monstros. Quanto mais o Ídolo Negador da Espada os rejeita, mais ele atrai seu interesse.",
 "Vorpal Chopper": "O Helicóptero Vorpal (致命の包丁 [ヴォーパルチョッパー] Vōparu Choppā) é uma queda rara do raro monstro Vorpal Bunny. O efeito especial da arma está dando bônus ao dano crítico.",
 "Ritual Medjed Keffiyeh": "A mysterious white hood. Previously, despite its high price, it wasn't a very strong piece of equipment, and since you couldn't use both arms, it was just a joke piece of equipment. However, its popularity exploded due to rumors of a white cloth ghost seen at Third Dream. A certain peddler NPC sells it on rare occasions, but the price has risen modestly since its popularity exploded.",
 "Tático Não Padrão Avain Suzaku": "Pássaro robô que pode ser controlado/comunicado usando a armadura especial não padrão Adebane. Também requer o Reator de Éter Não Padrão.",
 "Barbatana de Firehair de Arctus Regacles": "Item drop ao derrotar Arctus Regalecus",
 "Broche da Oração Distante": "Um acessório obtido por Arthur Pencilgon como recompensa por lutar contra Wezaemon, o Guardião do Túmulo",
 "Reator de Éter Não Padronizado": "Uma ferramenta da civilização da Era dos Deuses que serve como fonte de energia para as aeronaves táticas e blindagem especialmente reforçada alinhada no espaço de armazenamento do Inventário de Chaves de Armazenamento. Oikatzo o obteve como recompensa pela batalha contra Wezaemon, o Guardião do Túmulo, mas foi danificado. Reparos exigem o trabalho de Artesão Divino.",
 "Poção de Habilidade de Ligação": "Um meio de armazenamento que permite ao jogador combinar/conectar habilidades entre si.",
 "General Dullahan’s Decapitator": "A drop item from General Dullahan. This long sword was once powerful, but now it has decayed and can only cut flesh with brute force. When attacking the target's neck, the damage is super effective.",
 "Flame General’s Decapitator": "New beheading sword reworked by Bilac from the beheading sword of General Dullahan"
};
for(const item of ITENS_SHAGRILA)item.descricao=DESCRICOES_ORIGINAIS[item.nome]||item.descricao;

export function bonusCombateFrontier(estado={},agora=Date.now()) {
 const bonus={};if(estado.pilulaAte>agora)bonus.danoPercentual=99;
 if(estado.habilidade)bonus.danoBoss=10;if(estado.ligacao)bonus.golpeDuplo=5;
 if(estado.protecao>0)bonus.resistenciaTodos=10;return bonus;
}

const NOVOS_EQUIPAMENTOS = [
 equipamento('Lâmina Gêmea Esquerda','lamina_esquerda',.05,3,0,'fisico',{golpeDuplo:1}),
 equipamento('Lâmina Gêmea Direita','lamina_direita',.05,3,0,'fisico',{golpeDuplo:1}),
 equipamento('Máscara do Pássaro','elmo',.08,0,3,'ar',{evasao:2}),
 {...equipamento('Brinco de Brisa','brinco_esquerdo',.30,0,0,'ar',{evasao:3}),slots:['brinco_esquerdo','brinco_direito']},
 {...equipamento('Brinco de Chama','brinco_esquerdo',.35,0,0,'fogo',{danoElemental:{fogo:5}}),slots:['brinco_esquerdo','brinco_direito']},
 equipamento('Elmo de Ferro','elmo',.40,0,12),
 {...equipamento('Manopla de Ferro','manopla_esquerda',.25,2,5),slots:['manopla_esquerda','manopla_direita']},
 equipamento('Medalha do Viajante','pingente',.45,0,0,'terra',{resistenciaTodos:3}),
 equipamento('Peitoral de Ferro','peitoral',.65,0,22),
 equipamento('Arco de Madeira','arma',.30,10,0,'ar',{critico:3}),
 equipamento('Machado de Ferro','arma',.40,20),
 equipamento('Flechas de Ferro','flechas',.12,3),
 equipamento('Calça de Couro','calca',.30,0,9,'terra',{resistenciaFisica:2}),
 {...equipamento('Bota de Couro','bota_esquerda',.20,0,4,'terra',{movimento:3}),slots:['bota_esquerda','bota_direita']}
];
for(const item of NOVOS_EQUIPAMENTOS){item.descricao='Equipamento adaptado de Shagrila. '+resumoItemShagrila(item)+'. Espaço: '+slotsItemShagrila(item).map(s=>SLOTS_SHAGRILA[s]).join(' ou ');ITENS_SHAGRILA.push(item);CATALOGO_SHAGRILA[item.nome]=item;}

export function migrarInventarioLaminas(inventario={}) {
 const copia={...inventario},pares=Number(copia['Lâmina Gêmea']||0);
 if(pares>0){for(const nome of ['Lâmina Gêmea Esquerda','Lâmina Gêmea Direita'])copia[nome]=(Number(copia[nome])||0)+pares;delete copia['Lâmina Gêmea'];}
 return copia;
}
