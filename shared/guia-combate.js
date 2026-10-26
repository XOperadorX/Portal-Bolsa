import { COMBATE_CONFIG as C } from './combate-config.js';
import { resolverGolpe,dpsFicha,tempoAtaque,limitesExcedidos } from './combate.js';
const atributos=[
 ['Vida','Quanto dano você aguenta.','vida máxima = vida base × (1 + Vida%/100)','1.000 de vida com +10% = 1.100.'],
 ['Dano','Dano básico da arma e dos atributos.','dano = (base + dano fixo) × (1 + Dano%/100)','100 com +20% = 120.'],
 ['Dano por elemento','Bônus para fogo, água, ar ou terra.','dano elemental = dano × (1 + bônus do elemento/100)','100 de fogo com +10% = 110.'],
 ['Velocidade de ataque','Diminui o tempo entre ataques.','1,1 s ÷ (1 + velocidade/100)','Teto: +80%.'],
 ['Crítico','Chance de causar mais dano.','golpe crítico = dano × 1,5','Teto: 30%.'],
 ['Golpe duplo','Chance de repetir um golpe completo.','chance = mínimo(bruto, 20)%','Vida por golpe também cura no segundo acerto.'],
 ['Armadura','Reduz o dano depois das resistências.','armadura ÷ (armadura + 60 × fator do grau)','Teto de redução: 75%.'],
 ['Grau de defesa','Média das seis peças defensivas.','soma dos graus ÷ 6','Espaços vazios contam 0.'],
 ['Evasão','Chance de esquivar um golpe de monstro.','evasão ÷ (evasão + 60 × fator do grau)','Teto: 40%.'],
 ['Resistência','Reduz o dano do elemento recebido.','dano × (1 − resistência/100)','Teto: elemental 50%; físico 30%.'],
 ['Espinhos','Reflete dano ao monstro que acertou.','espinhos fixos + 2% do recebido com o perk','O reflexo não reflete novamente.'],
 ['Vida por golpe','Cura fixa em cada acerto.','cura = mínimo(vida faltante, vida por golpe)','Valor 4: golpe duplo pode curar 8.'],
 ['Cura ao matar','Recupera vida ao derrotar um monstro.','vida máxima × cura ao matar/100','Teto: 5%. Voraz acrescenta 1%.'],
 ['Regeneração','Cura por segundo após o atraso sem dano.','vida base × regeneração/100 × segundos','Teto: 1,5%/s. Em combate usa o fator configurado.'],
 ['Cura de poção','Amplia a cura das poções.','cura base × (1 + bônus/100)','200 com +30% = 260. Teto: +80%.'],
 ['Dano contra boss','Aumenta o golpe contra chefes.','dano × (1 + bônus/100)','Teto: +75%.'],
 ['Dano recebido de boss','Reduz o golpe de chefes.','dano × (1 − redução/100)','Teto: −30%.'],
 ['Movimento','Aumenta a velocidade de deslocamento.','velocidade base × (1 + bônus/100)','Teto: +35%.'],
 ['Achado de raridade','Melhora a raridade com retorno decrescente.','efetivo = bruto ÷ (bruto + 1)','Bruto 1 vale +50%. Efetivo limitado a +100%.'],
 ['Atributos da base','Amplia o dano ou a armadura da própria peça.','base da peça × (1 + bônus/100)','Uma peça com 100 de armadura e +10% passa a 110.']
];
const $=id=>document.getElementById(id),fmt=v=>Number(v).toLocaleString('pt-BR',{maximumFractionDigits:3});
$('lista-atributos').innerHTML=atributos.map(([nome,desc,formula,exemplo])=>'<details><summary>'+nome+'</summary><p>'+desc+'</p><p class="formula">'+formula+'</p><small>'+exemplo+'</small></details>').join('');
const nomes={velocidadeAtaque:'Velocidade de ataque',movimento:'Movimento',critico:'Crítico',golpeDuplo:'Golpe duplo',armadura:'Redução por armadura',esquiva:'Esquiva',resistenciaElemental:'Resistência elemental',resistenciaFisica:'Resistência física',danoBoss:'Dano contra boss',reducaoBoss:'Redução de boss',regeneracao:'Regeneração por segundo',curaPocao:'Cura de poção',curaMatar:'Cura ao matar',achadoEfetivo:'Achado efetivo'};
$('lista-tetos').innerHTML=Object.entries(C.limites).map(([id,n])=>'<tr><td>'+nomes[id]+'</td><td>'+fmt(n)+'%</td></tr>').join('');
function atualizar(){
 const n=id=>Math.max(0,Number($(id).value)||0),elemento=$('sim-elemento').value;
 const a={hp:1000,maxHp:1000,dano:n('sim-dano'),velocidadeAtaque:n('sim-velocidade'),critico:n('sim-critico'),golpeDuplo:n('sim-duplo'),elemento};
 const d={tipo:'monstro',hp:10000,maxHp:10000,armadura:n('sim-armadura'),grau:Math.max(1,n('sim-grau')),elemento:$('sim-alvo').value,resistencias:{[elemento]:n('sim-resistencia')}};
 const resultado=resolverGolpe(a,d,{rng:()=> $('sim-forcar').checked?0:1});
 $('sim-metricas').innerHTML='<p>Dano do golpe no alvo<strong>'+fmt(resultado.dano)+'</strong></p><p>DPS esperado da ficha<strong>'+fmt(dpsFicha(a))+'</strong></p><p>Intervalo entre ataques<strong>'+fmt(tempoAtaque(a.velocidadeAtaque)/1000)+' s</strong></p>';
 $('sim-etapas').innerHTML=resultado.etapas.map(e=>'<tr><td>'+e.nome+'</td><td>'+fmt(e.valor)+'</td></tr>').join('');
 $('sim-excesso').textContent=limitesExcedidos(a).map(e=>(nomes[e.id]||e.id)+': excede o teto de '+e.teto+'%.').join(' ');
}
$('sim-form').addEventListener('submit',e=>e.preventDefault());$('sim-form').addEventListener('input',atualizar);atualizar();
