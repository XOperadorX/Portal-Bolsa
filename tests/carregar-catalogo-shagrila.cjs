const fs=require('node:fs');
const src=fs.readFileSync('shared/shagrila-catalogo.js','utf8').replaceAll('export const','const').replaceAll('export function','function');
const catalogo=new Function(src+';return {ITENS_SHAGRILA,CATALOGO_SHAGRILA,equipamentoShagrila,equiparShagrila,forjarShagrila,RECEITAS_SHAGRILA,bonusCombateFrontier,SLOTS_SHAGRILA,slotsItemShagrila,normalizarEquipShagrila,resumoItemShagrila,ELEMENTOS_SHAGRILA,migrarInventarioLaminas};')();
Object.assign(globalThis,catalogo);
module.exports=catalogo;
