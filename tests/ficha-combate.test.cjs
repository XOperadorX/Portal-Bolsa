require('./carregar-catalogo-shagrila.cjs');
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const conf=fs.readFileSync('shared/combate-config.js','utf8').replace('export const','const');const C=new Function(conf+';return COMBATE_CONFIG;')();
const raw=fs.readFileSync('shared/combate.js','utf8');const names=[...raw.matchAll(/export (?:function|const) (\w+)/g)].map(m=>m[1]);
const helpers=new Function('C',raw.replace(/^import .*;\s*/gm,'').replaceAll('export const','const').replaceAll('export function','function')+';return {'+names.join(',')+'};')(C);
const code=fs.readFileSync('shared/ficha-combate.js','utf8').replace(/^import .*;\s*/gm,'').replace('export function','function');
function create(onAlterar){let time=Date.now(),tick,cleaned=false;class Clock extends Date{static now(){return time}}
 const slot={innerHTML:''},element={style:{cssText:''},open:true,innerHTML:'',addEventListener(){},querySelector:()=>slot,remove(){cleaned=true}};
 const hero={hp:50,maxHp:100,dano:10,combate:{regeneracao:1,critico:99,vidaPercentual:10}};
 const ctx=vm.createContext({...helpers,C,Date:Clock,document:{createElement:()=>element,body:{appendChild(){}}},setInterval:fn=>{tick=fn;return 1},clearInterval(){},window:{addEventListener(){}}});
 vm.runInContext(code+';globalThis.mount=anexarFichaCombate;',ctx);const dispose=ctx.mount(()=>hero,{onAlterar});return {hero,slot,dispose,get cleaned(){return cleaned},advance(){time+=1000;tick()}};
}
const readonly=create(null);readonly.advance();assert.equal(readonly.hero.hp,50);assert.equal(readonly.hero.maxHp,100);assert(readonly.slot.innerHTML.includes('Crítico'));assert(readonly.slot.innerHTML.includes('O excesso não conta'));readonly.dispose();assert(readonly.cleaned);
let saves=0;const active=create(()=>saves++);assert(Math.abs(active.hero.maxHp-110)<1e-6);active.advance();assert.equal(active.hero.hp,51);assert(saves>0);active.dispose();
console.log('OK: ficha com limites em âmbar, perfil em consulta sem alterar HP/máximo, regeneração e vida percentual nos jogos ativos e limpeza.');
