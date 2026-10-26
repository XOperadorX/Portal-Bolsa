import { equipamentoShagrila, bonusCombateFrontier } from './shagrila-catalogo.js';
import { COMBATE_CONFIG as C } from './combate-config.js';
const NORMALIZADO=Symbol('combate-normalizado');
const AGREGADO=Symbol('atributos-agregados');
const numero=(v,p=0)=>Number.isFinite(Number(v))?Number(v):p;
export const limitar=(v,min,max)=>Math.max(min,Math.min(max,numero(v)));
export const fatorGrau=g=>1+Math.floor((Math.max(1,numero(g,1))-1)/C.intervaloGraus);
export const atributoBase=(valor,bonus=0)=>Math.max(0,numero(valor)*(1+Math.max(-100,numero(bonus))/100));
export const grauDefesa=pecas=>Array.from({length:6},(_,i)=>Math.max(0,numero(pecas?.[i]?.grau??pecas?.[i]))).reduce((a,b)=>a+b,0)/6;
export const achadoEfetivo=bruto=>{const b=Math.max(0,numero(bruto));return limitar(b/(b+1),0,C.limites.achadoEfetivo/100);};
export const tempoAtaque=velocidade=>C.intervaloBaseMs/(1+limitar(velocidade,0,C.limites.velocidadeAtaque)/100);
export const velocidadeMovimento=(base,bonus)=>Math.max(0,numero(base))*(1+limitar(bonus,0,C.limites.movimento)/100);
export const reducaoArmadura=(armadura,grau=1)=>limitar(Math.max(0,numero(armadura))/(Math.max(0,numero(armadura))+C.constanteDefesa*fatorGrau(grau)),0,C.limites.armadura/100);
export const chanceEsquiva=(evasao,grau=1)=>limitar(Math.max(0,numero(evasao))/(Math.max(0,numero(evasao))+C.constanteDefesa*fatorGrau(grau)),0,C.limites.esquiva/100);
export function normalizarAtributos(raw={}) {
 if(raw[NORMALIZADO])return {...raw};
 const a={...raw};
 a.vidaBase=Math.max(1,numero(raw.vidaBase??raw.vidaMaxima??raw.maxHp??raw.max_hp??raw.hp_max??raw.hp,100));
 a.vidaMaxima=Math.max(1,atributoBase(a.vidaBase,raw.vidaPercentual));
 a.vida=limitar(raw.vida??raw.hp??raw.hp_atual??a.vidaMaxima,0,a.vidaMaxima);
 a.dano=atributoBase(raw.dano??raw.atk??raw.str??raw.attackDamage??raw.damage,raw.danoPercentual);
 a.armadura=atributoBase(raw.armadura??raw.def??raw.vit,raw.armaduraBasePercentual);
 a.evasao=Math.max(0,numero(raw.evasao));
 for(const id of ['velocidadeAtaque','movimento','critico','golpeDuplo','danoBoss','reducaoBoss','regeneracao','curaPocao','curaMatar'])a[id]=limitar(raw[id],0,C.limites[id]);
 a.vidaPorGolpe=Math.max(0,numero(raw.vidaPorGolpe));a.espinhos=Math.max(0,numero(raw.espinhos));
 a.grauDefesa=raw.grauDefesa!=null?Math.max(0,numero(raw.grauDefesa)):grauDefesa(raw.pecasDefesa);
 a.grau=Math.max(1,numero(raw.grau,1));a.tipo=raw.tipo==='monstro'?'monstro':'jogador';
 a.elemento=raw.elemento||'fisico';a.boss=!!raw.boss;
 a[NORMALIZADO]=true;return a;
}
export function resistencia(alvo,elemento) {
 const bruto=numero(alvo.resistencias?.[elemento])+numero(alvo.resistenciaTodos)+(elemento==='fisico'?numero(alvo.resistenciaFisica):0);
 return limitar(bruto,0,(elemento==='fisico'?C.limites.resistenciaFisica:C.limites.resistenciaElemental))/100;
}
export function multiplicadorElemento(ataque,defesa) {
 if(!ataque||ataque==='fisico'||!defesa||defesa==='fisico')return 1;
 if(ataque===defesa)return C.elementoIgual;
 return C.elementos[ataque]===defesa?C.vantagemElemental:C.desvantagemElemental;
}
// A sequência é deliberadamente explícita para manter fórmula, registro e simulador iguais.
export function resolverGolpe(atacante,defensor,{rng=Math.random,danoBase}={}) {
 const a=normalizarAtributos(atacante),d=normalizarAtributos(defensor);let dano=danoBase==null?a.dano:atributoBase(danoBase,a.danoPercentual);
 const etapas=[];const registrar=nome=>etapas.push({nome,valor:dano});
 if(a.tipo==='monstro'&&d.tipo==='jogador')dano*=1+Math.max(0,a.grau-d.grauDefesa-C.folgaGrau)*C.aumentoPorGrauExcedente;
 registrar('Grau de defesa');
 if(a.tipo==='monstro'&&d.tipo==='jogador'&&rng()<chanceEsquiva(d.evasao,a.grau))return {dano:0,critico:false,esquivado:true,etapas:[...etapas,{nome:'Esquiva',valor:0}]};
 registrar('Esquiva');
 dano*=1+((a.dominado?2:0)+(a.execucao&&d.vida/d.vidaMaxima<.20?10:0))/100;registrar('Bônus');
 const critico=rng()<a.critico/100;if(critico)dano*=C.multiplicadorCritico;registrar('Crítico');
 if(d.boss&&a.tipo==='jogador')dano*=1+a.danoBoss/100;
 if(a.boss&&d.tipo==='jogador')dano*=1-d.reducaoBoss/100;registrar('Contra boss');
 dano*=multiplicadorElemento(a.elemento,d.elemento)*(1+Math.max(-100,numero(a.danoElemental?.[a.elemento]))/100);registrar('Elemento');
 dano*=1-resistencia(d,a.elemento);registrar('Resistência');
 dano*=1-reducaoArmadura(d.armadura,a.tipo==='monstro'?a.grau:d.grau);registrar('Armadura');
 dano=Math.max(1,Math.round(dano));registrar('Arredonda');
 return {dano,critico,esquivado:false,etapas};
}
export function executarAtaque(atacante,defensor,opcoes={}) {
 const a=normalizarAtributos(atacante),d=normalizarAtributos(defensor),rng=opcoes.rng||Math.random;
 let vidaAtacante=a.vida,vidaDefensor=d.vida,danoTotal=0,reflexao=0,cura=0;const golpes=[];
 if(vidaAtacante<=0||vidaDefensor<=0)return {golpes,danoTotal,vidaAtacante,vidaDefensor,reflexao,cura,matou:false};
 const duplo=a.tipo==='jogador'&&rng()<a.golpeDuplo/100;
 for(let i=0;i<(duplo?2:1);i++) {
  if(vidaAtacante<=0||vidaDefensor<=0)break;
  const golpe=resolverGolpe({...a,vida:vidaAtacante},{...d,vida:vidaDefensor},{...opcoes,rng});
  golpes.push(golpe);if(golpe.esquivado)continue;
  danoTotal+=golpe.dano;vidaDefensor=Math.max(0,vidaDefensor-golpe.dano);
  const espinhos=d.tipo==='jogador'?d.espinhos+(d.perkEspinhos?golpe.dano*.02:0):0;
  reflexao+=espinhos;vidaAtacante=Math.max(0,vidaAtacante-espinhos);
  if(vidaAtacante>0){const curado=Math.min(a.vidaMaxima-vidaAtacante,a.vidaPorGolpe);vidaAtacante+=curado;cura+=curado;}
 }
 const matou=d.vida>0&&vidaDefensor===0;
 if(matou&&vidaAtacante>0){const curado=Math.min(a.vidaMaxima-vidaAtacante,a.vidaMaxima*limitar(a.curaMatar+(a.voraz?1:0),0,C.limites.curaMatar)/100);vidaAtacante+=curado;cura+=curado;}
 let curaDefensor=0;
 if(vidaAtacante===0&&a.vida>0&&vidaDefensor>0){curaDefensor=Math.min(d.vidaMaxima-vidaDefensor,d.vidaMaxima*limitar(d.curaMatar+(d.voraz?1:0),0,C.limites.curaMatar)/100);vidaDefensor+=curaDefensor;}
 return {golpes,danoTotal,vidaAtacante,vidaDefensor,reflexao,cura,curaDefensor,matou,duplo:golpes.length===2};
}
export function dpsFicha(raw) {const a=normalizarAtributos(raw);return a.dano*(1+a.critico/100*(C.multiplicadorCritico-1))*(1+a.golpeDuplo/100)/(tempoAtaque(a.velocidadeAtaque)/1000);}
export function curaPocao(base,bonus=0){return Math.max(0,numero(base))*(1+limitar(bonus,0,C.limites.curaPocao)/100);}
export function regenerarVida(raw,segundos,semDanoMs,emCombate=false){const a=normalizarAtributos(raw);if(a.vida<=0||semDanoMs<C.regeneracaoAposMs)return a.vida;return Math.min(a.vidaMaxima,a.vida+a.vidaBase*a.regeneracao/100*Math.max(0,numero(segundos))*(emCombate?C.regeneracaoEmCombate:1));}
export function limitesExcedidos(raw){
 const itens=Object.entries(C.limites).filter(([id,teto])=>!['armadura','esquiva','achadoEfetivo'].includes(id)&&numero(raw[id])>teto).map(([id,teto])=>({id,bruto:numero(raw[id]),teto}));
 for(const [id,pontos,teto] of [['Redução da armadura',raw.armadura,C.limites.armadura],['Esquiva',raw.evasao,C.limites.esquiva]]){const v=Math.max(0,numero(pontos)),bruto=v/(v+C.constanteDefesa)*100;if(bruto>teto)itens.push({id,bruto,teto});}
 for(const el of ['fogo','agua','ar','terra','fisico']){const bruto=numero(raw.resistencias?.[el])+numero(raw.resistenciaTodos)+(el==='fisico'?numero(raw.resistenciaFisica):0),teto=el==='fisico'?C.limites.resistenciaFisica:C.limites.resistenciaElemental;if(bruto>teto)itens.push({id:'Resistência '+el,bruto,teto});}
 return itens;
}
export function bonusEquipamentos(equip={}) {
 const resultado={};
 for(const peca of Object.values(equip||{})) {
  if(!peca||typeof peca!=='object')continue;
  const bonus=peca.bonusCombate||peca.combate||{};
  for(const [id,v] of Object.entries(bonus)){if(typeof v==='number')resultado[id]=(resultado[id]||0)+v;else if(typeof v==='boolean')resultado[id]=resultado[id]||v;else if(['resistencias','danoElemental'].includes(id)&&v&&typeof v==='object'){resultado[id]??={};for(const [el,n]of Object.entries(v))resultado[id][el]=(resultado[id][el]||0)+numero(n);}}
  for(const id of ['dano','armadura'])if(peca.base?.[id]!=null)resultado[id]=(resultado[id]||0)+atributoBase(peca.base[id],peca.atributosBasePercentual);
 }
 return resultado;
}
// Adapta os nomes existentes sem exigir colunas novas: bônus adicionais ficam em meta.combate.
export function atributosPersonagem(p={}) {
 if(p[AGREGADO])return {...p};
 const dodge=limitar(p.dodge,0,40)/100;
 const equipamentos=equipamentoShagrila(p.equipment||p.equip);
 const equip=bonusEquipamentos(equipamentos);
 const stats={...p,vidaBase:p.vidaBase??p.maxHp??p.max_hp??p.hp_max,maxHp:p.maxHp??p.max_hp??p.hp_max,tipo:p.tipo??(p.team==='ai'?'monstro':'jogador'),boss:!!(p.boss||p.isBoss||p.isLegendary||p.isMythic),dano:p.dano??p.atk??p.str??p.attackDamage??p.damage,armadura:p.armadura??p.def??p.vit,critico:p.critico??p.crit??0,evasao:p.evasao??(60*dodge/(1-dodge)),...p.meta?.combate,...p.combate};
 for(const [id,v] of Object.entries(equip)){if(typeof v==='number')stats[id]=numero(stats[id])+v;else if(typeof v==='boolean')stats[id]=stats[id]||v;else{const atual=stats[id]||{};stats[id]={...atual};for(const [el,n]of Object.entries(v))stats[id][el]=numero(atual[el])+n;}}
 for(const [id,v]of Object.entries(bonusCombateFrontier(p.shagrila||p.meta?.shagrila)))stats[id]=numero(stats[id])+v;
 if(p.bonusCodex){stats.dano=numero(stats.dano)+numero(p.bonusCodex.atk);stats.armadura=numero(stats.armadura)+numero(p.bonusCodex.def);stats.vidaBase=numero(stats.vidaBase??p.maxHp??p.hp_max??p.max_hp,100)+numero(p.bonusCodex.hp);}
 if(!p.elemento&&!p.combate?.elemento&&!p.meta?.combate?.elemento)stats.elemento=(equipamentos.mao_direita||equipamentos.mao_esquerda||equipamentos.arma)?.elemento||'fisico';
 if(!stats.pecasDefesa){const e=equipamentos;const par=(a,b)=>({grau:(numero(a?.grau)+numero(b?.grau))/2});stats.pecasDefesa=[e.elmo||e.cabeca,e.peitoral||e.corpo,e.calca,e.bota_esquerda||e.bota_direita?par(e.bota_esquerda,e.bota_direita):e.botas||e.bota,e.mao_esquerda||e.mao_direita?par(e.mao_esquerda,e.mao_direita):e.luvas,e.pescoco||e.pingente||e.colar];}
 stats[AGREGADO]=true;return stats;
}
export function prepararVidaCombate(ator,stats=atributosPersonagem(ator)) {
 if(!numero(stats.vidaPercentual)&&ator._ultimoMaximoCombate==null&&ator.combate?.vidaBase==null)return stats;
 const descritor=Object.getOwnPropertyDescriptor(ator,'maxHp');
 if(descritor?.get&&!descritor.set)return stats;
 ator.combate??={};
 let base=numero(ator.combate.vidaBase??stats.vidaBase??ator.maxHp??ator.hp,100);
 if(ator._ultimoMaximoCombate!=null&&numero(ator.maxHp)!==ator._ultimoMaximoCombate)base+=numero(ator.maxHp)-ator._ultimoMaximoCombate;
 ator.combate.vidaBase=Math.max(1,base);stats.vidaBase=ator.combate.vidaBase;
 ator.maxHp=Math.max(1,atributoBase(stats.vidaBase,stats.vidaPercentual));ator._ultimoMaximoCombate=ator.maxHp;
 return stats;
}
export function aplicarCombate(atacante,defensor,{danoBase,atributosAtacante={},atributosDefensor={},...opcoes}={}) {
 const a={...atributosPersonagem(atacante),...atributosAtacante},d={...atributosPersonagem(defensor),...atributosDefensor};
 prepararVidaCombate(atacante,a);prepararVidaCombate(defensor,d);
 const resultado=executarAtaque(a,d,{danoBase,...opcoes});atacante.hp=resultado.vidaAtacante;defensor.hp=resultado.vidaDefensor;
 if(resultado.danoTotal>0)defensor.ultimoDanoEm=Date.now();if(resultado.reflexao>0)atacante.ultimoDanoEm=Date.now();atacante.ultimoAtaqueEm=Date.now();
 for(const ator of [atacante,defensor])if(ator.hp<=0&&typeof ator.alive==='boolean')ator.alive=false;
 return resultado;
}
