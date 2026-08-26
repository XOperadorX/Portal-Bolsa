// ============================================================
//  ESTADO GLOBAL
// ============================================================
const estado = {
    hp: 100, maxHp: 100,
    mp: 50, maxMp: 50,
    sm: 40, maxSm: 40,
    atk: 15, def: 10, mag: 8,
    lvl: 1, exp: 0, expNext: 100,

    mumu: 0,
    btc: 0,
    poderHash: 1.0,

    itens: [
        { id: 'semente', nome: '🌱 Semente de Milho', preco: 5, qtd: 0 },
        { id: 'ovo', nome: '🥚 Ovo', preco: 3, qtd: 0 },
        { id: 'milho', nome: '🌽 Milho', preco: 8, qtd: 0 },
        { id: 'galinha', nome: '🐔 Galinha', preco: 25, qtd: 0 },
    ],

    inventario: { sementes: 0, milho: 0, ovos: 0, pintinhos: 0, galinhas: 0 },
    plantio: { active: false, stage: 0, progress: 0 },
    incubacao: { active: false, stage: 0, progress: 0 },

    investimentos: {
        selic: { nome: 'SELIC', simbolo: 'SEL', preco: 1.05, qtd: 0, taxa: 0.0000005 },
        acoes: { nome: 'Ações', simbolo: 'BOVA', preco: 50.0, qtd: 0, taxa: 0.0000003 },
        fiis: { nome: 'FIIs', simbolo: 'IFIX', preco: 100.0, qtd: 0, taxa: 0.0000007 },
        cdb: { nome: 'CDB', simbolo: 'CDB', preco: 1.02, qtd: 0, taxa: 0.0000006 },
        poupanca: { nome: 'Poupança', simbolo: 'POUP', preco: 1.01, qtd: 0, taxa: 0.0000004 },
    },

    intervalos: [],
    logBatalha: [],
};

const TAXA_COMPRA_BTC = 10000;
const TAXA_VENDA_BTC = 999;
const PRECO_COMPRA_SM = 12;
const PRECO_VENDA_SM = 8;

// ============================================================
//  RENDERIZAÇÃO
// ============================================================
function atualizarPersonagem() {
    document.getElementById('hpValue').textContent = `${estado.hp}/${estado.maxHp}`;
    document.getElementById('mpValue').textContent = `${estado.mp}/${estado.maxMp}`;
    document.getElementById('smValue').textContent = `${estado.sm}/${estado.maxSm}`;
    document.getElementById('atkValue').textContent = estado.atk;
    document.getElementById('defValue').textContent = estado.def;
    document.getElementById('magValue').textContent = estado.mag;
    document.getElementById('lvlValue').textContent = estado.lvl;
    document.getElementById('expValue').textContent = `${estado.exp} / ${estado.expNext}`;
    document.getElementById('smAtualMercado').textContent = `${estado.sm}/${estado.maxSm}`;
}

function atualizarMercadoUI() {
    const container = document.getElementById('listaMercado');
    container.innerHTML = '';
    estado.itens.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = 'market-item';
        div.innerHTML = `
            <span class="name">${item.nome}</span>
            <span class="price">${item.preco.toFixed(2)} Mumu</span>
            <span class="qty">Qtd: ${item.qtd}</span>
            <div>
                <button class="btn btn-secondary" onclick="comprarItem(${idx})">Comprar</button>
                <button class="btn btn-secondary" onclick="venderItem(${idx})">Vender</button>
            </div>
        `;
        container.appendChild(div);
    });
    document.getElementById('saldoMercado').textContent = estado.mumu.toFixed(2);
    document.getElementById('btcCompra').textContent = TAXA_COMPRA_BTC;
    document.getElementById('btcVenda').textContent = TAXA_VENDA_BTC;
    document.getElementById('btcSaldo').textContent = estado.btc.toFixed(8);
    document.getElementById('smAtualMercado').textContent = `${estado.sm}/${estado.maxSm}`;
    atualizarInvestimentosUI();
}

function atualizarFazendinhaUI() {
    const inv = estado.inventario;
    document.getElementById('invSementes').textContent = inv.sementes;
    document.getElementById('invMilho').textContent = inv.milho;
    document.getElementById('invOvos').textContent = inv.ovos;
    document.getElementById('invPintinhos').textContent = inv.pintinhos;
    document.getElementById('invGalinhas').textContent = inv.galinhas;

    const plantio = estado.plantio;
    if (plantio.active) {
        const etapas = ['🌱 Semente', '🌿 Crescendo', '🌽 Pronto'];
        document.getElementById('milhoEmoji').textContent = plantio.stage === 2 ? '🌽' : '🌱';
        document.getElementById('milhoStatus').textContent = etapas[plantio.stage];
        document.getElementById('milhoProgress').style.width = plantio.progress + '%';
        document.getElementById('milhoInfo').textContent = plantio.stage === 2 ? 'Pronto para colher!' : `Progresso: ${Math.round(plantio.progress)}%`;
    } else {
        document.getElementById('milhoEmoji').textContent = '🌾';
        document.getElementById('milhoStatus').textContent = 'Vazio';
        document.getElementById('milhoProgress').style.width = '0%';
        document.getElementById('milhoInfo').textContent = 'Clique em Plantar';
    }

    const incub = estado.incubacao;
    if (incub.active) {
        const etapas = ['🥚 Incubando', '🐣 Pintinho', '🐔 Galinha'];
        document.getElementById('galinhaEmoji').textContent = incub.stage === 0 ? '🥚' : (incub.stage === 1 ? '🐣' : '🐔');
        document.getElementById('galinhaStatus').textContent = etapas[incub.stage];
        document.getElementById('galinhaProgress').style.width = incub.progress + '%';
        document.getElementById('galinhaInfo').textContent = incub.stage === 2 ? 'Galinha pronta!' : `Progresso: ${Math.round(incub.progress)}%`;
    } else {
        document.getElementById('galinhaEmoji').textContent = '🥚';
        document.getElementById('galinhaStatus').textContent = 'Chocadeira vazia';
        document.getElementById('galinhaProgress').style.width = '0%';
        document.getElementById('galinhaInfo').textContent = 'Incube um ovo';
    }

    document.getElementById('venderMilhoQtd').textContent = inv.milho;
    document.getElementById('venderOvoQtd').textContent = inv.ovos;
    document.getElementById('venderSementeQtd').textContent = inv.sementes;
    document.getElementById('venderGalinhaQtd').textContent = inv.galinhas;
}

function atualizarInvestimentosUI() {
    document.getElementById('investSaldo').textContent = estado.mumu.toFixed(2);
    document.getElementById('investBtc').textContent = estado.btc.toFixed(8);
    let patrimonio = estado.mumu;
    for (let key in estado.investimentos) {
        const ativo = estado.investimentos[key];
        patrimonio += ativo.preco * ativo.qtd;
    }
    document.getElementById('investPatrimonio').textContent = patrimonio.toFixed(2);

    const container = document.getElementById('listaInvestimentos');
    container.innerHTML = '';
    for (let key in estado.investimentos) {
        const ativo = estado.investimentos[key];
        const div = document.createElement('div');
        div.className = 'invest-card';
        div.innerHTML = `
            <div class="nome">${ativo.nome} (${ativo.simbolo})</div>
            <div class="preco">${ativo.preco.toFixed(2)} Mumu</div>
            <div class="qtd">Qtd: ${ativo.qtd}</div>
            <div class="provento-label">📈 Provento: ${(ativo.taxa * 100).toFixed(4)}% / s</div>
            <div>
                <input type="number" id="invQtd_${key}" value="1" min="0.01" step="0.01">
            </div>
            <div class="flex" style="justify-content:center;">
                <button class="btn btn-invest" onclick="comprarAtivo('${key}')">Comprar</button>
                <button class="btn btn-secondary" onclick="venderAtivo('${key}')">Vender</button>
            </div>
        `;
        container.appendChild(div);
    }
}

function atualizarMineracaoUI() {
    document.getElementById('btcTotal').textContent = estado.btc.toFixed(8);
    document.getElementById('poderMineracao').textContent = `${estado.poderHash.toFixed(1)} MH/s`;
    document.getElementById('btcSaldo').textContent = estado.btc.toFixed(8);
    const passiva = estado.poderHash * 0.00000001;
    document.getElementById('mineracaoPassiva').textContent = passiva.toFixed(8) + ' BTC/s';
}

// ============================================================
//  FUNÇÕES AUXILIARES
// ============================================================
function adicionarLog(tipo, msg) {
    const div = document.getElementById('logBatalha');
    if (div) {
        div.innerHTML += `<div>${msg}</div>`;
        div.scrollTop = div.scrollHeight;
    }
}

function adicionarMoeda() {
    estado.mumu += 1000;
    atualizarMercadoUI();
    atualizarInvestimentosUI();
    adicionarLog('Sistema', '➕ Adicionou 1000 Mumu.');
}

// ============================================================
//  MERCADO
// ============================================================
function atualizarMercado() {
    estado.itens.forEach(item => {
        const variacao = (Math.random() - 0.5) * 2.5;
        item.preco = Math.max(0.5, item.preco + variacao);
        item.preco = Math.round(item.preco * 100) / 100;
    });
    atualizarMercadoUI();
}

function comprarItem(idx) {
    const item = estado.itens[idx];
    if (estado.mumu < item.preco) {
        alert('Saldo insuficiente em Mumu!');
        return;
    }
    if (item.id === 'semente') {
        estado.inventario.sementes++;
    } else if (item.id === 'ovo') {
        estado.inventario.ovos++;
    } else {
        alert('Você só pode comprar Sementes e Ovos no mercado.');
        return;
    }
    estado.mumu -= item.preco;
    item.qtd++;
    atualizarMercadoUI();
    atualizarFazendinhaUI();
    adicionarLog('Mercado', `Comprou ${item.nome} por ${item.preco.toFixed(2)} Mumu.`);
}

function venderItem(idx) {
    const item = estado.itens[idx];
    let nomeItem = '';
    if (item.id === 'semente') {
        if (estado.inventario.sementes <= 0) { alert('Sem sementes.'); return; }
        estado.inventario.sementes--;
        nomeItem = 'Semente';
    } else if (item.id === 'milho') {
        if (estado.inventario.milho <= 0) { alert('Sem milho.'); return; }
        estado.inventario.milho--;
        nomeItem = 'Milho';
    } else if (item.id === 'ovo') {
        if (estado.inventario.ovos <= 0) { alert('Sem ovos.'); return; }
        estado.inventario.ovos--;
        nomeItem = 'Ovo';
    } else if (item.id === 'galinha') {
        if (estado.inventario.galinhas <= 0) { alert('Sem galinhas.'); return; }
        estado.inventario.galinhas--;
        nomeItem = 'Galinha';
    } else {
        alert('Item não pode ser vendido.');
        return;
    }
    const precoVenda = item.preco * 0.7;
    estado.mumu += precoVenda;
    item.qtd++;
    atualizarMercadoUI();
    atualizarFazendinhaUI();
    adicionarLog('Mercado', `Vendeu ${nomeItem} por ${precoVenda.toFixed(2)} Mumu.`);
}

// ============================================================
//  CÂMBIO E STAMINA
// ============================================================
function comprarBTC() {
    if (estado.mumu < TAXA_COMPRA_BTC) {
        alert(`Saldo insuficiente! Precisa de ${TAXA_COMPRA_BTC} Mumu.`);
        return;
    }
    estado.mumu -= TAXA_COMPRA_BTC;
    estado.btc += 1;
    atualizarMercadoUI();
    atualizarMineracaoUI();
    adicionarLog('Mercado', '🔄 Comprou 1 BTC.');
}

function venderBTC() {
    if (estado.btc < 1) {
        alert('Você não tem BTC.');
        return;
    }
    estado.btc -= 1;
    estado.mumu += TAXA_VENDA_BTC;
    atualizarMercadoUI();
    atualizarMineracaoUI();
    adicionarLog('Mercado', '🔄 Vendeu 1 BTC.');
}

function comprarStamina() {
    const qtdInput = document.getElementById('qtdStamina');
    let qtd = parseInt(qtdInput.value) || 1;
    const custo = qtd * PRECO_COMPRA_SM;
    if (estado.mumu < custo) { alert('Saldo insuficiente.'); return; }
    if (estado.sm + qtd > estado.maxSm) {
        alert(`Máximo ${estado.maxSm} SM. Pode comprar no máximo ${estado.maxSm - estado.sm}.`);
        return;
    }
    estado.mumu -= custo;
    estado.sm += qtd;
    atualizarPersonagem();
    atualizarMercadoUI();
    adicionarLog('Mercado', `⚡ Comprou ${qtd} SM.`);
}

function venderStamina() {
    const qtdInput = document.getElementById('qtdStamina');
    let qtd = parseInt(qtdInput.value) || 1;
    if (estado.sm < qtd) { alert(`Você só tem ${estado.sm} SM.`); return; }
    estado.sm -= qtd;
    estado.mumu += qtd * PRECO_VENDA_SM;
    atualizarPersonagem();
    atualizarMercadoUI();
    adicionarLog('Mercado', `⚡ Vendeu ${qtd} SM.`);
}

// ============================================================
//  INVESTIMENTOS - COMPRA, VENDA, TROCA E PROVENTOS
// ============================================================
function comprarAtivo(key) {
    const ativo = estado.investimentos[key];
    const qtdInput = document.getElementById(`invQtd_${key}`);
    let qtd = parseFloat(qtdInput.value) || 1;
    const custo = ativo.preco * qtd;
    if (estado.mumu < custo) { alert('Saldo insuficiente.'); return; }
    estado.mumu -= custo;
    ativo.qtd += qtd;
    atualizarMercadoUI();
    atualizarInvestimentosUI();
    adicionarLog('Invest', `Comprou ${qtd} ${ativo.nome}.`);
}

function venderAtivo(key) {
    const ativo = estado.investimentos[key];
    const qtdInput = document.getElementById(`invQtd_${key}`);
    let qtd = parseFloat(qtdInput.value) || 1;
    if (ativo.qtd < qtd) { alert(`Você só tem ${ativo.qtd} ${ativo.nome}.`); return; }
    const valor = ativo.preco * qtd;
    estado.mumu += valor;
    ativo.qtd -= qtd;
    atualizarMercadoUI();
    atualizarInvestimentosUI();
    adicionarLog('Invest', `Vendeu ${qtd} ${ativo.nome}.`);
}

function trocarAtivos() {
    const origemKey = document.getElementById('trocaOrigem').value;
    const destinoKey = document.getElementById('trocaDestino').value;
    if (origemKey === destinoKey) { alert('Escolha ativos diferentes.'); return; }
    const qtdInput = document.getElementById('trocaQuantidade');
    let qtd = parseFloat(qtdInput.value) || 1;
    const ativoOrigem = estado.investimentos[origemKey];
    const ativoDestino = estado.investimentos[destinoKey];
    if (ativoOrigem.qtd < qtd) { alert(`Você só tem ${ativoOrigem.qtd} ${ativoOrigem.nome}.`); return; }
    const valorOrigem = ativoOrigem.preco * qtd;
    const qtdDestino = valorOrigem / ativoDestino.preco;
    ativoOrigem.qtd -= qtd;
    ativoDestino.qtd += qtdDestino;
    atualizarInvestimentosUI();
    adicionarLog('Invest', `🔄 Trocou ${qtd} ${ativoOrigem.nome} por ${qtdDestino.toFixed(4)} ${ativoDestino.nome}.`);
    alert(`Troca: ${qtd} ${ativoOrigem.nome} → ${qtdDestino.toFixed(4)} ${ativoDestino.nome}`);
}

// PROVENTOS DOS INVESTIMENTOS (a cada 10 segundos) - SÓ SE TIVER SALDO > 0
function aplicarProventos() {
    let totalRecebido = 0;
    for (let key in estado.investimentos) {
        const ativo = estado.investimentos[key];
        if (ativo.qtd > 0) {
            const provento = ativo.qtd * ativo.preco * ativo.taxa * 10;
            if (provento > 0.0001) {
                estado.mumu += provento;
                totalRecebido += provento;
            }
        }
    }
    if (totalRecebido > 0) {
        atualizarMercadoUI();
        atualizarInvestimentosUI();
        adicionarLog('Invest', `📈 Proventos: +${totalRecebido.toFixed(4)} Mumu`);
    }
}

// ============================================================
//  MINERAÇÃO PASSIVA (a cada 3 segundos) - SÓ SE PODER > 0 (sempre)
// ============================================================
function mineracaoPassiva() {
    if (estado.poderHash > 0) {
        const ganho = estado.poderHash * 0.00000001 * 3;
        if (ganho > 0) {
            estado.btc += ganho;
            atualizarMineracaoUI();
            atualizarMercadoUI();
            // Log opcional (evitar spam)
        }
    }
}

// ============================================================
//  PERSONAGEM E ATAQUE
// ============================================================
function treinar() {
    if (estado.sm < 10) { alert('Stamina baixa!'); return; }
    estado.sm -= 10;
    const ganho = 15 + Math.floor(Math.random() * 20);
    estado.exp += ganho;
    while (estado.exp >= estado.expNext) {
        estado.exp -= estado.expNext;
        estado.lvl++;
        estado.expNext = Math.floor(estado.expNext * 1.4) + 20;
        estado.atk += 2 + Math.floor(Math.random() * 4);
        estado.def += 1 + Math.floor(Math.random() * 3);
        estado.mag += 1 + Math.floor(Math.random() * 3);
        estado.maxHp += 8 + Math.floor(Math.random() * 10);
        estado.maxMp += 5 + Math.floor(Math.random() * 8);
        estado.maxSm += 4 + Math.floor(Math.random() * 6);
        estado.hp = estado.maxHp;
        estado.mp = estado.maxMp;
        estado.sm = estado.maxSm;
        alert(`🎉 Subiu para nível ${estado.lvl}!`);
    }
    atualizarPersonagem();
    atualizarMercadoUI();
    adicionarLog('Batalha', `Treinou +${ganho} EXP.`);
}

function descansar() {
    estado.hp = Math.min(estado.maxHp, estado.hp + 30);
    estado.mp = Math.min(estado.maxMp, estado.mp + 20);
    estado.sm = Math.min(estado.maxSm, estado.sm + 25);
    atualizarPersonagem();
    atualizarMercadoUI();
    adicionarLog('Batalha', '🛌 Descansou.');
}

let inimigoAtual = { nome: 'Slime', hp: 20, maxHp: 20, atk: 5, def: 2 };

function novoInimigo() {
    const nomes = ['Slime', 'Goblin', 'Lobo', 'Urso', 'Dragão Jr'];
    const nome = nomes[Math.floor(Math.random() * nomes.length)];
    const base = 15 + estado.lvl * 4;
    inimigoAtual = {
        nome,
        hp: base + Math.floor(Math.random() * 20),
        maxHp: base + Math.floor(Math.random() * 20),
        atk: 4 + estado.lvl * 2 + Math.floor(Math.random() * 6),
        def: 2 + estado.lvl + Math.floor(Math.random() * 4)
    };
    document.getElementById('inimigoNome').textContent = nome;
    document.getElementById('inimigoHp').textContent = `HP: ${inimigoAtual.hp}/${inimigoAtual.maxHp}`;
    document.getElementById('danoCausado').textContent = '0';
    adicionarLog('Batalha', `👾 Apareceu ${nome}!`);
}

function atacar() {
    if (estado.sm < 5) { alert('Sem stamina!'); return; }
    estado.sm -= 5;
    const dano = Math.max(1, estado.atk - inimigoAtual.def + Math.floor(Math.random() * 8));
    inimigoAtual.hp -= dano;
    document.getElementById('danoCausado').textContent = dano;
    document.getElementById('inimigoHp').textContent = `HP: ${Math.max(0, inimigoAtual.hp)}/${inimigoAtual.maxHp}`;
    adicionarLog('Batalha', `💥 Causou ${dano} em ${inimigoAtual.nome}.`);
    if (inimigoAtual.hp <= 0) {
        const expGanha = 20 + estado.lvl * 5;
        estado.exp += expGanha;
        if (Math.random() < 0.3) { estado.mumu += 5; }
        adicionarLog('Batalha', `🏆 ${inimigoAtual.nome} derrotado! +${expGanha} EXP.`);
        novoInimigo();
        while (estado.exp >= estado.expNext) {
            estado.exp -= estado.expNext;
            estado.lvl++;
            estado.expNext = Math.floor(estado.expNext * 1.4) + 20;
            estado.atk += 2 + Math.floor(Math.random() * 4);
            estado.def += 1 + Math.floor(Math.random() * 3);
            estado.mag += 1 + Math.floor(Math.random() * 3);
            estado.maxHp += 8 + Math.floor(Math.random() * 10);
            estado.maxMp += 5 + Math.floor(Math.random() * 8);
            estado.maxSm += 4 + Math.floor(Math.random() * 6);
            estado.hp = estado.maxHp;
            estado.mp = estado.maxMp;
            estado.sm = estado.maxSm;
            alert(`🎉 Subiu para nível ${estado.lvl}!`);
        }
        atualizarPersonagem();
        atualizarMercadoUI();
    } else {
        const danoInimigo = Math.max(1, inimigoAtual.atk - estado.def + Math.floor(Math.random() * 4));
        estado.hp = Math.max(0, estado.hp - danoInimigo);
        adicionarLog('Batalha', `💢 ${inimigoAtual.nome} causou ${danoInimigo}.`);
        if (estado.hp <= 0) {
            alert('💀 Derrotado! Recupere-se.');
            estado.hp = Math.floor(estado.maxHp * 0.5);
            estado.mp = Math.floor(estado.maxMp * 0.5);
            estado.sm = Math.floor(estado.maxSm * 0.5);
        }
        atualizarPersonagem();
        atualizarMercadoUI();
    }
    document.getElementById('inimigoHp').textContent = `HP: ${Math.max(0, inimigoAtual.hp)}/${inimigoAtual.maxHp}`;
}

// ============================================================
//  MINERAÇÃO (CLIQUE)
// ============================================================
function minerar() {
    const ganho = (0.0000001 + Math.random() * 0.000001) * estado.poderHash;
    estado.btc += ganho;
    atualizarMineracaoUI();
    atualizarMercadoUI();
    const log = document.getElementById('logMineracao');
    if (log) {
        log.innerHTML += `<div>⛏️ +${ganho.toFixed(8)} BTC</div>`;
        log.scrollTop = log.scrollHeight;
    }
}

function upgradeMineracao() {
    if (estado.btc < 10) { alert('Precisa de 10 BTC.'); return; }
    estado.btc -= 10;
    estado.poderHash += 0.5;
    atualizarMineracaoUI();
    atualizarMercadoUI();
    const log = document.getElementById('logMineracao');
    if (log) log.innerHTML += `<div>⬆️ Upgrade! Poder ${estado.poderHash.toFixed(1)} MH/s</div>`;
}

// ============================================================
//  FAZENDINHA
// ============================================================
function plantarMilho() {
    if (estado.plantio.active) { alert('Já há plantação.'); return; }
    if (estado.inventario.sementes <= 0) { alert('Sem sementes.'); return; }
    estado.inventario.sementes--;
    estado.plantio.active = true;
    estado.plantio.stage = 0;
    estado.plantio.progress = 0;
    atualizarFazendinhaUI();
    adicionarLog('Fazenda', '🌱 Plantou semente.');
    const interval = setInterval(() => {
        if (!estado.plantio.active) { clearInterval(interval); return; }
        estado.plantio.progress += 1 + Math.random() * 2;
        if (estado.plantio.progress >= 100) {
            estado.plantio.progress = 100;
            estado.plantio.stage = 2;
            clearInterval(interval);
            adicionarLog('Fazenda', '🌽 Milho pronto!');
        } else if (estado.plantio.progress >= 50 && estado.plantio.stage < 1) {
            estado.plantio.stage = 1;
        }
        atualizarFazendinhaUI();
    }, 800);
    estado.intervalos.push(interval);
}

function colherMilho() {
    if (!estado.plantio.active || estado.plantio.stage < 2) { alert('Não está pronto.'); return; }
    const colhido = 1 + Math.floor(Math.random() * 2);
    estado.inventario.milho += colhido;
    estado.plantio.active = false;
    estado.plantio.stage = 0;
    estado.plantio.progress = 0;
    atualizarFazendinhaUI();
    adicionarLog('Fazenda', `🧺 Colheu ${colhido} milho.`);
}

function incubarOvo() {
    if (estado.incubacao.active) { alert('Já há ovo incubando.'); return; }
    if (estado.inventario.ovos <= 0) { alert('Sem ovos.'); return; }
    estado.inventario.ovos--;
    estado.incubacao.active = true;
    estado.incubacao.stage = 0;
    estado.incubacao.progress = 0;
    atualizarFazendinhaUI();
    adicionarLog('Fazenda', '🥚 Ovo incubando.');
    const interval = setInterval(() => {
        if (!estado.incubacao.active) { clearInterval(interval); return; }
        estado.incubacao.progress += 1 + Math.random() * 1.5;
        if (estado.incubacao.progress >= 100) {
            estado.incubacao.progress = 100;
            estado.incubacao.stage = 1;
            clearInterval(interval);
            estado.inventario.pintinhos++;
            estado.incubacao.active = false;
            adicionarLog('Fazenda', '🐣 Nasceu pintinho!');
            atualizarFazendinhaUI();
        } else {
            atualizarFazendinhaUI();
        }
    }, 1000);
    estado.intervalos.push(interval);
}

function alimentarGalinha() {
    if (estado.inventario.pintinhos <= 0) { alert('Sem pintinhos.'); return; }
    if (estado.inventario.milho <= 0) { alert('Sem milho.'); return; }
    estado.inventario.milho--;
    estado.inventario.pintinhos--;
    estado.inventario.galinhas++;
    atualizarFazendinhaUI();
    adicionarLog('Fazenda', '🌽 Pintinho virou galinha!');
}

function producaoOvos() {
    if (estado.inventario.galinhas > 0) {
        const ovos = Math.floor(estado.inventario.galinhas * (0.5 + Math.random() * 0.5));
        if (ovos > 0) {
            estado.inventario.ovos += ovos;
            adicionarLog('Fazenda', `🐔 Galinhas produziram ${ovos} ovos.`);
            atualizarFazendinhaUI();
        }
    }
}

function venderProducao() {
    const inv = estado.inventario;
    if (inv.milho + inv.ovos + inv.sementes + inv.galinhas === 0) { alert('Nada para vender.'); return; }
    let total = 0;
    if (inv.milho > 0) {
        const preco = estado.itens.find(i => i.id === 'milho').preco * 0.7;
        total += inv.milho * preco;
        inv.milho = 0;
    }
    if (inv.ovos > 0) {
        const preco = estado.itens.find(i => i.id === 'ovo').preco * 0.7;
        total += inv.ovos * preco;
        inv.ovos = 0;
    }
    if (inv.sementes > 0) {
        const preco = estado.itens.find(i => i.id === 'semente').preco * 0.7;
        total += inv.sementes * preco;
        inv.sementes = 0;
    }
    if (inv.galinhas > 0) {
        const preco = estado.itens.find(i => i.id === 'galinha').preco * 0.7;
        total += inv.galinhas * preco;
        inv.galinhas = 0;
    }
    estado.mumu += total;
    atualizarMercadoUI();
    atualizarFazendinhaUI();
    adicionarLog('Fazenda', `💰 Vendeu produção por ${total.toFixed(2)} Mumu.`);
    alert(`Vendeu por ${total.toFixed(2)} Mumu!`);
}

// ============================================================
//  FLUTUAÇÃO DOS INVESTIMENTOS
// ============================================================
function flutuarInvestimentos() {
    for (let key in estado.investimentos) {
        const ativo = estado.investimentos[key];
        const variacao = (Math.random() - 0.5) * 0.08;
        ativo.preco = Math.max(0.1, ativo.preco * (1 + variacao));
        ativo.preco = Math.round(ativo.preco * 100) / 100;
    }
    atualizarInvestimentosUI();
}

// ============================================================
//  NAVEGAÇÃO POR ABAS
// ============================================================
document.querySelectorAll('#mainMenu button').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('#mainMenu button').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const tabId = this.dataset.tab;
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        if (tabId === 'tabInvestimentos') atualizarInvestimentosUI();
        if (tabId === 'tabMineracao') atualizarMineracaoUI();
    });
});

// ============================================================
//  INICIALIZAÇÃO
// ============================================================
function init() {
    atualizarPersonagem();
    atualizarMercadoUI();
    atualizarMineracaoUI();
    atualizarFazendinhaUI();
    atualizarInvestimentosUI();
    novoInimigo();

    // Flutuação do mercado
    setInterval(() => { atualizarMercado(); }, 8000);
    // Flutuação dos investimentos
    setInterval(() => { flutuarInvestimentos(); }, 5000);
    // Proventos dos investimentos (só com saldo)
    setInterval(() => { aplicarProventos(); }, 10000);
    // Mineração passiva
    setInterval(() => { mineracaoPassiva(); }, 3000);
    // Produção de ovos
    setInterval(() => { producaoOvos(); }, 30000);

    adicionarLog('Batalha', 'Bem-vindo ao MM World!');
    const logMineracao = document.getElementById('logMineracao');
    if (logMineracao) logMineracao.innerHTML = '<div>⛏️ Pronto para minerar!</div>';
}

init();