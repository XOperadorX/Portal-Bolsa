// Percentuais são expressos em pontos percentuais: 10 significa 10%.
export const COMBATE_CONFIG = Object.freeze({
 intervaloBaseMs:1100, multiplicadorCritico:1.5, constanteDefesa:60,
 limites:Object.freeze({velocidadeAtaque:80,movimento:35,critico:30,golpeDuplo:20,armadura:75,esquiva:40,resistenciaElemental:50,resistenciaFisica:30,danoBoss:75,reducaoBoss:30,regeneracao:1.5,curaPocao:80,curaMatar:5,achadoEfetivo:100}),
 elementos:Object.freeze({fogo:'ar',ar:'terra',terra:'agua',agua:'fogo'}),
 vantagemElemental:1.30, elementoIgual:1, desvantagemElemental:.85,
 folgaGrau:2, aumentoPorGrauExcedente:.10, intervaloGraus:2,
 regeneracaoAposMs:5000, regeneracaoEmCombate:.20
});
