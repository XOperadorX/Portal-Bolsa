import { COMBATE_CONFIG as C } from './combate-config.js';
import { atributosPersonagem, normalizarAtributos, dpsFicha, tempoAtaque, chanceEsquiva, reducaoArmadura, achadoEfetivo, limitesExcedidos, regenerarVida, resistencia, prepararVidaCombate } from './combate.js';
const nomes={velocidadeAtaque:'Velocidade de ataque',movimento:'Movimento',critico:'Crítico',golpeDuplo:'Golpe duplo',danoBoss:'Dano contra chefes',reducaoBoss:'Redução de chefes',regeneracao:'Regeneração',curaPocao:'Cura de poções',curaMatar:'Cura ao matar'};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function anexarFichaCombate(getPersonagem,{base='../../',onAlterar=null,flutuante=false}={}) {
 const ficha=document.createElement('details');ficha.className='ficha-combate';ficha.style.cssText='position:relative;z-index:10;max-width:900px;margin:16px auto;padding:12px 16px;background:#111c2c;color:#e7f0fb;border:1px solid #35485d;border-radius:10px;font:14px system-ui;';
 ficha.innerHTML='<summary style="cursor:pointer">⚔️ Dano, defesa e DPS</summary><div class="ficha-valores"></div><a style="color:#91dcd8" href="'+base+'combate.html">Ver atributos, fórmulas e limites ↗</a>';
 if(flutuante)ficha.style.cssText+='position:fixed;bottom:10px;left:10px;max-width:min(340px,90vw);max-height:70vh;overflow:auto;z-index:999;';
 document.body.appendChild(ficha);let ultimo=Date.now();
 const tick=()=>{const agora=Date.now(),dt=Math.min(1,(agora-ultimo)/1000);ultimo=agora;const p=getPersonagem();if(!p)return;
  const maxAnterior=p.maxHp,marcadorAnterior=p._ultimoMaximoCombate;const raw=onAlterar?prepararVidaCombate(p):atributosPersonagem(p),a=normalizarAtributos(raw);
  if(onAlterar&&(p.maxHp!==maxAnterior||p._ultimoMaximoCombate!==marcadorAnterior))onAlterar(p);
  const novaVida=regenerarVida(raw,dt,agora-(p.ultimoDanoEm||0),agora-(p.ultimoAtaqueEm||0)<C.regeneracaoAposMs);
  if(onAlterar&&novaVida>a.vida){p.hp=novaVida;if(onAlterar)onAlterar(p);}
  if(!ficha.open)return;
  const fmt=v=>Number(v).toLocaleString('pt-BR',{maximumFractionDigits:2});
  const linhas=[['Vida máxima',a.vidaMaxima],['Dano básico',a.dano],['DPS esperado',dpsFicha(raw)],['Intervalo entre ataques (s)',tempoAtaque(a.velocidadeAtaque)/1000],['Crítico (%)',a.critico],['Golpe duplo (%)',a.golpeDuplo],['Armadura (%) contra grau 1–2',reducaoArmadura(a.armadura)*100],['Esquiva (%) contra grau 1–2',chanceEsquiva(a.evasao)*100],['Grau de defesa',a.grauDefesa],['Vida por golpe',a.vidaPorGolpe],['Achado efetivo (%)',achadoEfetivo(a.achadoRaridade)*100],['Movimento (%)',a.movimento],['Dano contra boss (%)',a.danoBoss],['Redução de boss (%)',a.reducaoBoss],['Espinhos',a.espinhos],['Cura ao matar (%)',Math.min(5,a.curaMatar+(a.voraz?1:0))],['Regeneração (%/s)',a.regeneracao],['Cura de poções (%)',a.curaPocao],...['fisico','fogo','agua','ar','terra'].map(el=>['Resistência '+el+' (%)',resistencia(a,el)*100])];
  ficha.querySelector('.ficha-valores').innerHTML='<dl style="display:grid;grid-template-columns:1fr auto;gap:6px">'+linhas.map(([k,v])=>'<dt>'+esc(k)+'</dt><dd style="margin:0">'+fmt(v)+'</dd>').join('')+'</dl>'+limitesExcedidos(raw).map(x=>'<p style="color:#f5bd61">'+esc(nomes[x.id]||x.id)+': '+fmt(x.bruto)+' — limite '+fmt(x.teto)+'. O excesso não conta.</p>').join('');
 };
 const timer=setInterval(tick,1000);ficha.addEventListener('toggle',tick);tick();
 const destruir=()=>{clearInterval(timer);ficha.remove();};window.addEventListener('pagehide',destruir,{once:true});return destruir;
}
