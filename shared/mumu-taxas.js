import { obterTaxa } from './taxas-globais.js';
export function pacotesMumu(taxa=obterTaxa) {
 const desconto=taxa('mumu_desfazer_desconto');
 return [10,20,50,100,200].map(mumu=>({mumu,saldo:taxa('mumu_pacote_'+mumu),desconto,retorno:Math.round(mumu*(1-desconto/100)*100)/100}));
}
