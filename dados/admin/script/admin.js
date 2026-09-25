import { createClient } from '@supabase/supabase-js';

// ==================== VERIFICAÇÃO DE LOGIN ====================
const usuarioLogado = localStorage.getItem('usuario_logado');
if (!usuarioLogado) {
    window.location.href = 'login.html';
}

let usuario = null;
try {
    usuario = JSON.parse(usuarioLogado);
    document.getElementById('usuarioLogadoNav').textContent = usuario.nome || usuario.login || 'ADM';
} catch (e) {
    window.location.href = 'login.html';
}

// ==================== CONFIGURAÇÕES ====================
const SUPABASE_URL = 'https://xrcxvizzdumcxbylmkvn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_E-g3G3wW4EySbCsXLXp8KQ_FnmERMcD';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const TABELA = 'Geral';
const MOEDA = 'Mumu';

let supabaseOnline = false;
let usuariosCache = [];
let selicAtual = 10.75;
let codigosCache = [];

// ==================== FUNÇÕES UTILITÁRIAS ====================
function mostrarMensagem(texto, tipo = 'info') {
    const el = document.getElementById('mensagem');
    el.textContent = texto;
    el.className = `mensagem show mensagem-${tipo}`;
    setTimeout(() => {
        el.className = 'mensagem';
    }, 5000);
}

function formatarMoeda(valor) {
    return `${Number(valor || 0).toFixed(2)} ${MOEDA}`;
}

function formatarBtc(valor) {
    return `${Number(valor || 0).toFixed(8)} BTC`;
}

function atualizarStatusSupabase(online, mensagem = null) {
    const textoNav = document.getElementById('statusSupabaseTextoNav');
    if (online) {
        textoNav.textContent = mensagem || 'Online';
        textoNav.style.color = '#00ff66';
    } else {
        textoNav.textContent = mensagem || 'Offline';
        textoNav.style.color = '#ef4444';
    }
}

// ==================== FUNÇÕES SELIC ====================
function atualizarDisplaySelic(valor) {
    const display = document.getElementById('selicDisplay');
    const indicador = document.getElementById('selicIndicador');
    const impactoTexto = document.getElementById('selicImpactoTexto');
    const impactoDetalhe = document.getElementById('selicImpactoDetalhe');
    const estrategia = document.getElementById('selicEstrategia');
    const estrategiaDetalhe = document.getElementById('selicEstrategiaDetalhe');

    display.textContent = `${valor.toFixed(2)}%`;

    let classificacao = 'Média';
    let classe = 'selic-media';
    let impacto = '⚖️ Impacto Neutro';
    let impactoClasse = 'impacto-neutral';
    let detalhe = 'Mercado estável, sem grandes movimentos.';
    let estrategiaTexto = '🔍 Aguardar';
    let estrategiaDetalheTexto = 'Analise o mercado antes de agir.';

    if (valor >= 13.0) {
        classificacao = 'ALTA';
        classe = 'selic-alta';
        impacto = '📉 FIIs em QUEDA';
        impactoClasse = 'impacto-compra';
        detalhe = 'SELIC alta → FIIs caem. Ótimo momento para COMPRAR cotas baratas!';
        estrategiaTexto = '🛒 COMPRAR FIIs';
        estrategiaDetalheTexto = 'Aproveite as cotas descontadas para acumular posições.';
    } else if (valor >= 10.5) {
        classificacao = 'Média';
        classe = 'selic-media';
        impacto = '⚖️ Impacto Neutro';
        impactoClasse = 'impacto-neutral';
        detalhe = 'SELIC moderada. Mercado sem grandes oportunidades.';
        estrategiaTexto = '🔍 Observar';
        estrategiaDetalheTexto = 'Acompanhe os movimentos do mercado.';
    } else if (valor >= 8.0) {
        classificacao = 'Média-Baixa';
        classe = 'selic-media';
        impacto = '📈 FIIs em SUBIDA';
        impactoClasse = 'impacto-venda';
        detalhe = 'SELIC baixa → FIIs sobem. Momento de COLHER lucros!';
        estrategiaTexto = '💰 VENDER FIIs';
        estrategiaDetalheTexto = 'Aproveite a alta para realizar lucros e proteger o capital.';
    } else {
        classificacao = 'BAIXA';
        classe = 'selic-baixa';
        impacto = '🚀 FIIs em ALTA';
        impactoClasse = 'impacto-venda';
        detalhe = 'SELIC muito baixa → FIIs valorizados. Hora de VENDER e colher!';
        estrategiaTexto = '💸 COLHER LUCROS';
        estrategiaDetalheTexto = 'Mercado aquecido, momento de vender posições.';
    }

    indicador.textContent = classificacao;
    indicador.className = `selic-indicador ${classe}`;
    impactoTexto.textContent = impacto;
    impactoDetalhe.textContent = detalhe;
    impactoDetalhe.className = `selic-impacto ${impactoClasse}`;
    estrategia.textContent = estrategiaTexto;
    estrategiaDetalhe.textContent = estrategiaDetalheTexto;
}

async function salvarSelicNoSupabase(valor) {
    try {
        const { data: existingData, error: checkError } = await supabase
            .from(TABELA)
            .select('id')
            .eq('id', 1)
            .single();

        if (checkError && checkError.code === 'PGRST116') {
            const { error: insertError } = await supabase
                .from(TABELA)
                .insert({ id: 1, selic: valor, updated_at: new Date().toISOString() });
            if (insertError) {
                console.error('Erro ao criar registro SELIC:', insertError);
                return false;
            }
        } else {
            const { error: updateError } = await supabase
                .from(TABELA)
                .update({ selic: valor, updated_at: new Date().toISOString() })
                .eq('id', 1);
            if (updateError) {
                console.error('Erro ao atualizar SELIC:', updateError);
                return false;
            }
        }
        return true;
    } catch (error) {
        console.error('Erro ao salvar SELIC:', error);
        return false;
    }
}

async function carregarSelicDoSupabase() {
    try {
        const { data, error } = await supabase
            .from(TABELA)
            .select('selic')
            .eq('id', 1)
            .single();
            
        if (error) {
            if (error.code === 'PGRST116') {
                return null;
            }
            console.warn('Erro ao carregar SELIC:', error);
            return null;
        }
        return data?.selic ?? null;
    } catch (error) {
        console.error('Erro ao carregar SELIC:', error);
        return null;
    }
}

async function atualizarSelic(valor) {
    if (valor < 0) valor = 0;
    if (valor > 25) valor = 25;
    selicAtual = valor;
    document.getElementById('selicInput').value = valor;
    atualizarDisplaySelic(valor);

    const sucesso = await salvarSelicNoSupabase(valor);
    if (sucesso) {
        mostrarMensagem(`✅ SELIC atualizada para ${valor.toFixed(2)}% e salva no Supabase!`, 'sucesso');
    } else {
        mostrarMensagem(`⚠️ SELIC atualizada localmente, mas falha ao salvar no Supabase.`, 'erro');
    }
}

// ==================== SUPABASE - USUÁRIOS ====================
async function verificarSupabase() {
    try {
        const { data, error } = await supabase
            .from(TABELA)
            .select('id')
            .limit(1);
        if (error) {
            supabaseOnline = false;
            atualizarStatusSupabase(false, 'Erro');
            return false;
        }
        supabaseOnline = true;
        atualizarStatusSupabase(true, 'Online');
        return true;
    } catch (error) {
        supabaseOnline = false;
        atualizarStatusSupabase(false, 'Erro');
        return false;
    }
}

async function buscarUsuarios(filtro = null) {
    try {
        let query = supabase
            .from(TABELA)
            .select('id, nome, login, saldo, saldo_poupanca, sm_atual, btc, mumu, bloqueado')
            .not('login', 'is', null);

        if (filtro) {
            query = query.or(`login.ilike.%${filtro}%,nome.ilike.%${filtro}%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Erro ao buscar usuários:', error);
            mostrarMensagem('❌ Erro ao buscar usuários: ' + error.message, 'erro');
            return [];
        }

        usuariosCache = data || [];
        return usuariosCache;
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('❌ Erro ao buscar usuários.', 'erro');
        return [];
    }
}

async function buscarUsuarioPorId(id) {
    try {
        const { data, error } = await supabase
            .from(TABELA)
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            mostrarMensagem('❌ Usuário não encontrado.', 'erro');
            return null;
        }
        return data;
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('❌ Erro ao buscar usuário.', 'erro');
        return null;
    }
}

// ============ NOVO: atualizar MUMU (não saldo) ============
async function atualizarMumu(id, novoMumu) {
    try {
        const { data, error } = await supabase
            .from(TABELA)
            .update({ mumu: novoMumu, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Erro ao atualizar Mumu:', error);
        throw error;
    }
}

async function atualizarSmAtual(id, valor) {
    try {
        const { data, error } = await supabase
            .from(TABELA)
            .update({ sm_atual: valor, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Erro ao atualizar SM Atual:', error);
        throw error;
    }
}

async function atualizarBtc(id, valor) {
    try {
        const { data, error } = await supabase
            .from(TABELA)
            .update({ btc: valor, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Erro ao atualizar BTC:', error);
        throw error;
    }
}

async function atualizarBloqueio(id, bloqueado) {
    try {
        const { data, error } = await supabase
            .from(TABELA)
            .update({ bloqueado: bloqueado, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Erro ao atualizar bloqueio:', error);
        throw error;
    }
}

// ==================== DELETAR USUÁRIO ====================
async function deletarUsuario(id, login) {
    const confirmacao1 = confirm(`⚠️ ATENÇÃO!\n\nTem certeza que deseja DELETAR o usuário "${login}" (ID: ${id})?\n\nEsta ação é IRREVERSÍVEL!`);
    
    if (!confirmacao1) return;
    
    const confirmacao2 = prompt(`🔴 CONFIRMAÇÃO FINAL\n\nDigite "DELETAR" (em maiúsculas) para confirmar a exclusão de "${login}":`);
    
    if (confirmacao2 !== 'DELETAR') {
        mostrarMensagem('❌ Exclusão cancelada. Você digitou "' + (confirmacao2 || 'nada') + '" em vez de "DELETAR".', 'erro');
        return;
    }

    try {
        const usuario = await buscarUsuarioPorId(id);
        if (!usuario) {
            mostrarMensagem('❌ Usuário não encontrado.', 'erro');
            return;
        }

        const { error } = await supabase
            .from(TABELA)
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Erro ao deletar usuário:', error);
            mostrarMensagem('❌ Erro ao deletar usuário: ' + error.message, 'erro');
            return;
        }

        console.log(`🗑️ Usuário deletado: ID ${id} | Login: ${login}`);

        mostrarMensagem(`🗑️ Usuário "${login}" (ID: ${id}) deletado com sucesso!`, 'sucesso');
        
        document.getElementById('cardResultados').style.display = 'none';
        await carregarDados();
        
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('❌ Erro ao deletar usuário.', 'erro');
    }
}

// ==================== FUNÇÕES DE UI ====================
function renderizarUsuarioDetalhes(usuario) {
    const container = document.getElementById('detalhesUsuario');
    const card = document.getElementById('cardResultados');

    if (!usuario) {
        card.style.display = 'none';
        return;
    }

    const estaBloqueado = usuario.bloqueado === true;

    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; background: #1a1f2f; padding: 20px; border-radius: 16px; border: 1px solid #2a2f45;">
            <div>
                <p style="font-size: 0.8rem; color: #8a99ad;">ID</p>
                <p style="font-size: 1.2rem; font-weight: 700; color: var(--neon-blue);">#${usuario.id}</p>
            </div>
            <div>
                <p style="font-size: 0.8rem; color: #8a99ad;">Nome</p>
                <p style="font-size: 1.2rem; font-weight: 600; color: #fff;">${usuario.nome || '—'}</p>
            </div>
            <div>
                <p style="font-size: 0.8rem; color: #8a99ad;">Login</p>
                <p style="font-size: 1.2rem; font-weight: 600; color: #fff;">${usuario.login}</p>
            </div>
            <div>
                <p style="font-size: 0.8rem; color: #8a99ad;">Senha</p>
                <p style="font-size: 1.2rem; font-weight: 600; color: #fbbf24; font-family: 'Courier New', monospace;">${usuario.senha || '—'}</p>
            </div>
            <div>
                <p style="font-size: 0.8rem; color: #8a99ad;">Mumu</p>
                <p style="font-size: 1.4rem; font-weight: 700; color: var(--neon-green);">${formatarMoeda(usuario.mumu || 0)}</p>
            </div>
            <div>
                <p style="font-size: 0.8rem; color: #8a99ad;">Saldo</p>
                <p style="font-size: 1.4rem; font-weight: 700; color: #22d3ee;">${formatarMoeda(usuario.saldo || 0)}</p>
            </div>
            <div>
                <p style="font-size: 0.8rem; color: #8a99ad;">Poupança</p>
                <p style="font-size: 1.4rem; font-weight: 700; color: #f59e0b;">${formatarMoeda(usuario.saldo_poupanca || 0)}</p>
            </div>
            <div>
                <p style="font-size: 0.8rem; color: #8a99ad;">SM Atual</p>
                <div style="display: flex; gap: 8px; align-items: center; margin-top: 4px;">
                    <input type="number" id="smAtualDetalhe_${usuario.id}" class="quantidade-input" style="width: 100px; font-size: 1rem; padding: 6px 10px;" step="1" value="${usuario.sm_atual ?? 0}">
                    <button class="acao-botoes" style="background:#a78bfa; color:#fff; border:none; border-radius:20px; padding:6px 12px; font-weight:700; cursor:pointer; font-size:0.75rem;" onclick="window.salvarSmAtualDetalhe(${usuario.id})">💾 Salvar</button>
                </div>
            </div>
            <div>
                <p style="font-size: 0.8rem; color: #8a99ad;">BTC</p>
                <p style="font-size: 1.4rem; font-weight: 700; color: #f7931a;">${formatarBtc(usuario.btc || 0)}</p>
            </div>
            <div>
                <p style="font-size: 0.8rem; color: #8a99ad;">Status</p>
                <p style="font-size: 1.2rem; font-weight: 700; color: ${estaBloqueado ? '#ef4444' : '#10b981'};">
                    ${estaBloqueado ? '🔒 Bloqueado' : '✅ Ativo'}
                </p>
            </div>
        </div>
        <div style="margin-top: 16px; display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-success" onclick="window.adicionarMumuEspecifico(${usuario.id})">➕ Adicionar</button>
            <button class="btn btn-danger" onclick="window.removerMumuEspecifico(${usuario.id})">➖ Remover</button>
            <button class="btn btn-warning" onclick="window.definirMumuEspecifico(${usuario.id})">🎯 Definir</button>
            <button class="btn btn-bloquear" onclick="window.alternarBloqueio(${usuario.id}, '${usuario.login}', ${estaBloqueado})">
                ${estaBloqueado ? '🔓 Desbloquear' : '🔒 Bloquear'}
            </button>
            <button class="btn-delete" onclick="window.deletarUsuario(${usuario.id}, '${usuario.login}')">🗑️ Deletar Conta</button>
        </div>
    `;

    card.style.display = 'block';
}

function renderizarListaUsuarios(usuarios) {
    const tbody = document.getElementById('tabelaUsuarios');
    const card = document.getElementById('cardLista');

    if (!usuarios || usuarios.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="padding: 20px; color: #8a99ad;">Nenhum usuário encontrado.</td></tr>`;
        card.style.display = 'block';
        return;
    }

    let html = '';
    usuarios.forEach(u => {
        const estaBloqueado = u.bloqueado === true;
        html += `
            <tr style="${estaBloqueado ? 'opacity: 0.6;' : ''}">
                <td style="color: var(--neon-blue);">#${u.id}</td>
                <td><strong>${u.nome || '—'}</strong></td>
                <td>${u.login}</td>
                <td style="color: var(--neon-green); font-weight: 600;">${formatarMoeda(u.mumu || 0)}</td>
                <td style="color: #22d3ee; font-weight: 600;">${formatarMoeda(u.saldo || 0)}</td>
                <td style="color: #f59e0b; font-weight: 600;">${formatarMoeda(u.saldo_poupanca || 0)}</td>
                <td>
                    <div class="sm-edit-wrapper">
                        <input type="number" id="sm_${u.id}" class="quantidade-input" step="1" value="${u.sm_atual ?? 0}">
                        <button class="sm-save" onclick="window.salvarSmAtual(${u.id})">💾</button>
                    </div>
                </td>
                <td>
                    <span class="status-badge ${estaBloqueado ? 'bloqueado' : 'ativo'}">
                        ${estaBloqueado ? '🔒 Bloqueado' : '✅ Ativo'}
                    </span>
                </td>
                <td>
                    <div class="acao-botoes">
                        <input type="number" id="mumu_${u.id}" class="quantidade-input" placeholder="Mumu" step="0.01" min="0.01" value="10">
                        <button class="add" onclick="window.adicionarMumuUsuario(${u.id})">+</button>
                        <button class="remove" onclick="window.removerMumuUsuario(${u.id})">-</button>
                        <button class="set" onclick="window.definirMumuUsuario(${u.id})">=</button>
                        <button class="${estaBloqueado ? 'unlock' : 'lock'}" onclick="window.alternarBloqueio(${u.id}, '${u.login}', ${estaBloqueado})">
                            ${estaBloqueado ? '🔓' : '🔒'}
                        </button>
                        <button class="delete" onclick="window.deletarUsuario(${u.id}, '${u.login}')">🗑️</button>
                    </div>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
    card.style.display = 'block';
}

function renderizarListaSatoshi(usuarios) {
    const tbody = document.getElementById('tabelaSatoshi');
    const card = document.getElementById('cardSatoshi');

    if (!usuarios || usuarios.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="padding: 20px; color: #8a99ad;">Nenhum Satoshi encontrado.</td></tr>`;
        card.style.display = 'block';
        return;
    }

    let html = '';
    usuarios.forEach(u => {
        const estaBloqueado = u.bloqueado === true;
        const btc = u.btc ?? 0;
        html += `
            <tr style="${estaBloqueado ? 'opacity: 0.6;' : ''}">
                <td style="color: var(--neon-blue);">#${u.id}</td>
                <td><strong>${u.nome || '—'}</strong></td>
                <td>${u.login}</td>
                <td class="btc-texto">${formatarBtc(btc)}</td>
                <td>
                    <div class="acao-botoes">
                        <input type="number" id="btc_${u.id}" class="quantidade-input" placeholder="BTC" step="0.00000001" min="0" value="0.00000001">
                        <button class="add" onclick="window.adicionarBtcUsuario(${u.id})">+</button>
                        <button class="remove" onclick="window.removerBtcUsuario(${u.id})">-</button>
                        <button class="set" onclick="window.definirBtcUsuario(${u.id})">=</button>
                        <button class="delete" onclick="window.deletarUsuario(${u.id}, '${u.login}')">🗑️</button>
                    </div>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
    card.style.display = 'block';
}

async function atualizarEstatisticas(usuarios) {
    if (!usuarios || usuarios.length === 0) {
        const todos = await buscarUsuarios();
        usuarios = todos;
    }

    const total = usuarios.length;
    const totalMumu = usuarios.reduce((acc, u) => acc + (Number(u.mumu) || 0), 0);
    const totalPoupanca = usuarios.reduce((acc, u) => acc + (Number(u.saldo_poupanca) || 0), 0);
    const totalBloqueados = usuarios.filter(u => u.bloqueado === true).length;

    document.getElementById('totalUsuarios').textContent = total;
    document.getElementById('totalCirculacao').innerHTML = `${totalMumu.toFixed(2)} <span class="moeda-simbolo">${MOEDA}</span>`;
    document.getElementById('totalPoupanca').innerHTML = `${totalPoupanca.toFixed(2)} <span class="moeda-simbolo">${MOEDA}</span>`;
    
    const elBloq = document.getElementById('totalBloqueados');
    if (elBloq) elBloq.textContent = totalBloqueados;
}

// ==================== AÇÕES DE MUMU ====================
window.adicionarMumuUsuario = async function(id) {
    const input = document.getElementById(`mumu_${id}`);
    const valor = parseFloat(input.value);
    if (!valor || valor <= 0) {
        mostrarMensagem('⚠️ Digite um valor válido.', 'erro');
        return;
    }

    try {
        const usuario = await buscarUsuarioPorId(id);
        if (!usuario) {
            mostrarMensagem('❌ Usuário não encontrado.', 'erro');
            return;
        }

        const novoMumu = (Number(usuario.mumu) || 0) + valor;
        await atualizarMumu(id, novoMumu);

        mostrarMensagem(`✅ Adicionado ${formatarMoeda(valor)} para ${usuario.login}. Novo Mumu: ${formatarMoeda(novoMumu)}`, 'sucesso');
        await carregarDados();
    } catch (error) {
        console.error('Erro ao adicionar Mumu:', error);
        mostrarMensagem('❌ Erro ao adicionar Mumu: ' + (error.message || ''), 'erro');
    }
};

window.removerMumuUsuario = async function(id) {
    const input = document.getElementById(`mumu_${id}`);
    const valor = parseFloat(input.value);
    if (!valor || valor <= 0) {
        mostrarMensagem('⚠️ Digite um valor válido.', 'erro');
        return;
    }

    try {
        const usuario = await buscarUsuarioPorId(id);
        if (!usuario) {
            mostrarMensagem('❌ Usuário não encontrado.', 'erro');
            return;
        }

        const novoMumu = Math.max(0, (Number(usuario.mumu) || 0) - valor);
        await atualizarMumu(id, novoMumu);

        mostrarMensagem(`✅ Removido ${formatarMoeda(valor)} de ${usuario.login}. Novo Mumu: ${formatarMoeda(novoMumu)}`, 'sucesso');
        await carregarDados();
    } catch (error) {
        console.error('Erro ao remover Mumu:', error);
        mostrarMensagem('❌ Erro ao remover Mumu: ' + (error.message || ''), 'erro');
    }
};

window.definirMumuUsuario = async function(id) {
    const input = document.getElementById(`mumu_${id}`);
    const valor = parseFloat(input.value);
    if (!valor || valor < 0) {
        mostrarMensagem('⚠️ Digite um valor válido (0 ou mais).', 'erro');
        return;
    }

    try {
        const usuario = await buscarUsuarioPorId(id);
        if (!usuario) {
            mostrarMensagem('❌ Usuário não encontrado.', 'erro');
            return;
        }

        await atualizarMumu(id, valor);

        mostrarMensagem(`✅ Mumu de ${usuario.login} definido para ${formatarMoeda(valor)}`, 'sucesso');
        await carregarDados();
    } catch (error) {
        console.error('Erro ao definir Mumu:', error);
        mostrarMensagem('❌ Erro ao definir Mumu: ' + (error.message || ''), 'erro');
    }
};

// ==================== AÇÕES DE BTC ====================
window.adicionarBtcUsuario = async function(id) {
    const input = document.getElementById(`btc_${id}`);
    const valor = parseFloat(input.value);
    if (isNaN(valor) || valor <= 0) {
        mostrarMensagem('⚠️ Digite um valor BTC válido.', 'erro');
        return;
    }

    try {
        const usuario = await buscarUsuarioPorId(id);
        if (!usuario) {
            mostrarMensagem('❌ Usuário não encontrado.', 'erro');
            return;
        }

        const novoBtc = (Number(usuario.btc) || 0) + valor;
        await atualizarBtc(id, novoBtc);

        mostrarMensagem(`✅ Adicionado ${valor.toFixed(8)} BTC para ${usuario.login}. Novo BTC: ${formatarBtc(novoBtc)}`, 'sucesso');
        await carregarDados();
    } catch (error) {
        console.error('Erro ao adicionar BTC:', error);
        mostrarMensagem('❌ Erro ao adicionar BTC: ' + (error.message || ''), 'erro');
    }
};

window.removerBtcUsuario = async function(id) {
    const input = document.getElementById(`btc_${id}`);
    const valor = parseFloat(input.value);
    if (isNaN(valor) || valor <= 0) {
        mostrarMensagem('⚠️ Digite um valor BTC válido.', 'erro');
        return;
    }

    try {
        const usuario = await buscarUsuarioPorId(id);
        if (!usuario) {
            mostrarMensagem('❌ Usuário não encontrado.', 'erro');
            return;
        }

        const novoBtc = Math.max(0, (Number(usuario.btc) || 0) - valor);
        await atualizarBtc(id, novoBtc);

        mostrarMensagem(`✅ Removido ${valor.toFixed(8)} BTC de ${usuario.login}. Novo BTC: ${formatarBtc(novoBtc)}`, 'sucesso');
        await carregarDados();
    } catch (error) {
        console.error('Erro ao remover BTC:', error);
        mostrarMensagem('❌ Erro ao remover BTC: ' + (error.message || ''), 'erro');
    }
};

window.definirBtcUsuario = async function(id) {
    const input = document.getElementById(`btc_${id}`);
    const valor = parseFloat(input.value);
    if (isNaN(valor) || valor < 0) {
        mostrarMensagem('⚠️ Digite um valor BTC válido (0 ou mais).', 'erro');
        return;
    }

    try {
        const usuario = await buscarUsuarioPorId(id);
        if (!usuario) {
            mostrarMensagem('❌ Usuário não encontrado.', 'erro');
            return;
        }

        await atualizarBtc(id, valor);

        mostrarMensagem(`✅ BTC de ${usuario.login} definido para ${formatarBtc(valor)}`, 'sucesso');
        await carregarDados();
    } catch (error) {
        console.error('Erro ao definir BTC:', error);
        mostrarMensagem('❌ Erro ao definir BTC: ' + (error.message || ''), 'erro');
    }
};

// ==================== SM ATUAL ====================
window.salvarSmAtual = async function(id) {
    const input = document.getElementById(`sm_${id}`);
    const valor = parseInt(input.value);
    if (isNaN(valor)) {
        mostrarMensagem('⚠️ Digite um valor válido para SM Atual.', 'erro');
        return;
    }

    try {
        const usuario = await buscarUsuarioPorId(id);
        if (!usuario) {
            mostrarMensagem('❌ Usuário não encontrado.', 'erro');
            return;
        }

        await atualizarSmAtual(id, valor);

        mostrarMensagem(`✅ SM Atual de ${usuario.login} atualizado para ${valor}`, 'sucesso');
        await carregarDados();
    } catch (error) {
        mostrarMensagem('❌ Erro ao atualizar SM Atual.', 'erro');
    }
};

window.salvarSmAtualDetalhe = async function(id) {
    const input = document.getElementById(`smAtualDetalhe_${id}`);
    const valor = parseInt(input.value);
    if (isNaN(valor)) {
        mostrarMensagem('⚠️ Digite um valor válido para SM Atual.', 'erro');
        return;
    }

    try {
        const usuario = await buscarUsuarioPorId(id);
        if (!usuario) {
            mostrarMensagem('❌ Usuário não encontrado.', 'erro');
            return;
        }

        await atualizarSmAtual(id, valor);

        mostrarMensagem(`✅ SM Atual de ${usuario.login} atualizado para ${valor}`, 'sucesso');
        await carregarDados();
    } catch (error) {
        mostrarMensagem('❌ Erro ao atualizar SM Atual.', 'erro');
    }
};

// ==================== BLOQUEIO ====================
window.alternarBloqueio = async function(id, login, estaBloqueado) {
    const acao = estaBloqueado ? 'DESBLOQUEAR' : 'BLOQUEAR';
    
    if (!confirm(`Tem certeza que deseja ${acao} o usuário "${login}" (ID: ${id})?`)) {
        return;
    }

    try {
        await atualizarBloqueio(id, !estaBloqueado);
        mostrarMensagem(`✅ Usuário "${login}" ${estaBloqueado ? 'desbloqueado' : 'bloqueado'} com sucesso!`, 'sucesso');
        await carregarDados();
    } catch (error) {
        mostrarMensagem(`❌ Erro ao ${acao.toLowerCase()} usuário.`, 'erro');
    }
};

window.deletarUsuario = deletarUsuario;

// ==================== AÇÕES ESPECÍFICAS (MUMU) ====================
window.adicionarMumuEspecifico = async function(id) {
    const valorInput = document.getElementById('valorAcao');
    const valor = parseFloat(valorInput.value);
    if (!valor || valor <= 0) {
        mostrarMensagem('⚠️ Digite um valor válido no campo "Valor (Mumu)".', 'erro');
        return;
    }

    try {
        const usuario = await buscarUsuarioPorId(id);
        if (!usuario) {
            mostrarMensagem('❌ Usuário não encontrado.', 'erro');
            return;
        }

        const novoMumu = (Number(usuario.mumu) || 0) + valor;
        await atualizarMumu(id, novoMumu);

        mostrarMensagem(`✅ Adicionado ${formatarMoeda(valor)} para ${usuario.login}. Novo Mumu: ${formatarMoeda(novoMumu)}`, 'sucesso');
        await carregarDados();
    } catch (error) {
        mostrarMensagem('❌ Erro ao adicionar Mumu.', 'erro');
    }
};

window.removerMumuEspecifico = async function(id) {
    const valorInput = document.getElementById('valorAcao');
    const valor = parseFloat(valorInput.value);
    if (!valor || valor <= 0) {
        mostrarMensagem('⚠️ Digite um valor válido no campo "Valor (Mumu)".', 'erro');
        return;
    }

    try {
        const usuario = await buscarUsuarioPorId(id);
        if (!usuario) {
            mostrarMensagem('❌ Usuário não encontrado.', 'erro');
            return;
        }

        const novoMumu = Math.max(0, (Number(usuario.mumu) || 0) - valor);
        await atualizarMumu(id, novoMumu);

        mostrarMensagem(`✅ Removido ${formatarMoeda(valor)} de ${usuario.login}. Novo Mumu: ${formatarMoeda(novoMumu)}`, 'sucesso');
        await carregarDados();
    } catch (error) {
        mostrarMensagem('❌ Erro ao remover Mumu.', 'erro');
    }
};

window.definirMumuEspecifico = async function(id) {
    const valorInput = document.getElementById('valorAcao');
    const valor = parseFloat(valorInput.value);
    if (!valor || valor < 0) {
        mostrarMensagem('⚠️ Digite um valor válido (0 ou mais) no campo "Valor (Mumu)".', 'erro');
        return;
    }

    try {
        const usuario = await buscarUsuarioPorId(id);
        if (!usuario) {
            mostrarMensagem('❌ Usuário não encontrado.', 'erro');
            return;
        }

        await atualizarMumu(id, valor);

        mostrarMensagem(`✅ Mumu de ${usuario.login} definido para ${formatarMoeda(valor)}`, 'sucesso');
        await carregarDados();
    } catch (error) {
        mostrarMensagem('❌ Erro ao definir Mumu.', 'erro');
    }
};

// ==================== AÇÕES EM MASSA ====================
async function adicionarSaldoMassa() {
    const idInput = document.getElementById('usuarioId');
    const valorInput = document.getElementById('valorAcao');
    const id = parseInt(idInput.value);
    const valor = parseFloat(valorInput.value);

    if (!id || isNaN(id)) {
        mostrarMensagem('⚠️ Digite o ID do usuário.', 'erro');
        return;
    }
    if (!valor || valor <= 0) {
        mostrarMensagem('⚠️ Digite um valor válido.', 'erro');
        return;
    }

    try {
        const usuario = await buscarUsuarioPorId(id);
        if (!usuario) {
            mostrarMensagem('❌ Usuário não encontrado.', 'erro');
            return;
        }

        const novoMumu = (Number(usuario.mumu) || 0) + valor;
        await atualizarMumu(id, novoMumu);

        mostrarMensagem(`✅ Adicionado ${formatarMoeda(valor)} para ${usuario.login}. Novo Mumu: ${formatarMoeda(novoMumu)}`, 'sucesso');
        await carregarDados();
    } catch (error) {
        mostrarMensagem('❌ Erro ao adicionar Mumu.', 'erro');
    }
}

async function removerSaldoMassa() {
    const idInput = document.getElementById('usuarioId');
    const valorInput = document.getElementById('valorAcao');
    const id = parseInt(idInput.value);
    const valor = parseFloat(valorInput.value);

    if (!id || isNaN(id)) {
        mostrarMensagem('⚠️ Digite o ID do usuário.', 'erro');
        return;
    }
    if (!valor || valor <= 0) {
        mostrarMensagem('⚠️ Digite um valor válido.', 'erro');
        return;
    }

    try {
        const usuario = await buscarUsuarioPorId(id);
        if (!usuario) {
            mostrarMensagem('❌ Usuário não encontrado.', 'erro');
            return;
        }

        const novoMumu = Math.max(0, (Number(usuario.mumu) || 0) - valor);
        await atualizarMumu(id, novoMumu);

        mostrarMensagem(`✅ Removido ${formatarMoeda(valor)} de ${usuario.login}. Novo Mumu: ${formatarMoeda(novoMumu)}`, 'sucesso');
        await carregarDados();
    } catch (error) {
        mostrarMensagem('❌ Erro ao remover Mumu.', 'erro');
    }
}

async function definirSaldoMassa() {
    const idInput = document.getElementById('usuarioId');
    const valorInput = document.getElementById('valorAcao');
    const id = parseInt(idInput.value);
    const valor = parseFloat(valorInput.value);

    if (!id || isNaN(id)) {
        mostrarMensagem('⚠️ Digite o ID do usuário.', 'erro');
        return;
    }
    if (!valor || valor < 0) {
        mostrarMensagem('⚠️ Digite um valor válido (0 ou mais).', 'erro');
        return;
    }

    try {
        const usuario = await buscarUsuarioPorId(id);
        if (!usuario) {
            mostrarMensagem('❌ Usuário não encontrado.', 'erro');
            return;
        }

        await atualizarMumu(id, valor);

        mostrarMensagem(`✅ Mumu de ${usuario.login} definido para ${formatarMoeda(valor)}`, 'sucesso');
        await carregarDados();
    } catch (error) {
        mostrarMensagem('❌ Erro ao definir Mumu.', 'erro');
    }
}

// ==================== CÓDIGOS DE RESGATE ====================
async function carregarCodigos() {
    try {
        const { data, error } = await supabase
            .from(TABELA)
            .select('codigos_resgate')
            .eq('id', 1)
            .single();

        if (error) {
            console.warn('Erro ao carregar códigos:', error);
            codigosCache = [];
            renderizarTabelaCodigos();
            return [];
        }

        codigosCache = Array.isArray(data?.codigos_resgate) ? data.codigos_resgate : [];
        renderizarTabelaCodigos();
        return codigosCache;
    } catch (e) {
        console.error('Erro ao carregar códigos:', e);
        codigosCache = [];
        renderizarTabelaCodigos();
        return [];
    }
}

function renderizarTabelaCodigos() {
    const tbody = document.getElementById('tabelaCodigos');
    if (!tbody) return;

    if (!codigosCache || codigosCache.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="padding: 20px; color: #8a99ad; text-align: center;">Nenhum código criado ainda.</td></tr>`;
        return;
    }

    const ordenados = [...codigosCache].sort(
        (a, b) => new Date(b.criado_em || 0) - new Date(a.criado_em || 0)
    );

    tbody.innerHTML = ordenados.map(c => {
        const usos = c.usos || 0;
        const limite = c.limite || 0;
        const esgotado = limite > 0 && usos >= limite;

        let statusClasse = 'ativo';
        let statusTexto = 'Ativo';
        if (esgotado) { statusClasse = 'esgotado'; statusTexto = 'Esgotado'; }
        else if (c.ativo === false) { statusClasse = 'inativo'; statusTexto = 'Inativo'; }

        return `
            <tr>
                <td><span class="codigo-badge">${c.codigo}</span></td>
                <td style="color: var(--neon-green); font-weight: 600;">${(c.mumu || 0).toFixed(2)}</td>
                <td style="color: var(--neon-blue); font-weight: 600;">R$ ${(c.saldo || 0).toFixed(2)}</td>
                <td>${usos}</td>
                <td>${limite === 0 ? '∞' : limite}</td>
                <td><span class="codigo-status ${statusClasse}">${statusTexto}</span></td>
                <td>
                    <div class="acao-botoes">
                        <button class="toggle" onclick="window.alternarCodigo('${c.codigo}')">
                            ${c.ativo === false ? '✅ Ativar' : '⏸️ Pausar'}
                        </button>
                        <button class="delete" onclick="window.deletarCodigo('${c.codigo}')">🗑️</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

async function salvarCodigosNoBanco() {
    try {
        const { error } = await supabase
            .from(TABELA)
            .update({ codigos_resgate: codigosCache })
            .eq('id', 1);

        if (error) throw error;
        return true;
    } catch (e) {
        console.error('Erro ao salvar códigos:', e);
        mostrarMensagem('❌ Erro ao salvar códigos no banco.', 'erro');
        return false;
    }
}

async function criarCodigo() {
    const codigoInput = document.getElementById('codigoInput');
    const mumuInput = document.getElementById('codigoMumu');
    const saldoInput = document.getElementById('codigoSaldo');
    const limiteInput = document.getElementById('codigoLimite');

    const codigo = (codigoInput.value || '').trim().toUpperCase().replace(/\s+/g, '');
    const mumu = parseFloat(mumuInput.value) || 0;
    const saldo = parseFloat(saldoInput.value) || 0;
    const limite = parseInt(limiteInput.value) || 0;

    if (!codigo || codigo.length < 3) {
        mostrarMensagem('⚠️ O código deve ter pelo menos 3 caracteres.', 'erro');
        return;
    }
    if (!/^[A-Z0-9_-]+$/.test(codigo)) {
        mostrarMensagem('⚠️ Use apenas letras, números, _ ou -.', 'erro');
        return;
    }
    if (mumu <= 0 && saldo <= 0) {
        mostrarMensagem('⚠️ Defina pelo menos uma recompensa (Mumu ou Saldo R$).', 'erro');
        return;
    }

    if (codigosCache.some(c => (c.codigo || '').toUpperCase() === codigo)) {
        mostrarMensagem('⚠️ Já existe um código com esse nome.', 'erro');
        return;
    }

    const novoCodigo = {
        codigo: codigo,
        mumu: mumu,
        saldo: saldo,
        limite: limite,
        usos: 0,
        ativo: true,
        criado_em: new Date().toISOString()
    };

    codigosCache.push(novoCodigo);

    const ok = await salvarCodigosNoBanco();
    if (ok) {
        mostrarMensagem(`✅ Código "${codigo}" criado com sucesso!`, 'sucesso');
        codigoInput.value = '';
        mumuInput.value = 0;
        saldoInput.value = 0;
        limiteInput.value = 0;
        renderizarTabelaCodigos();
    } else {
        codigosCache = codigosCache.filter(c => c.codigo !== codigo);
    }
}

window.alternarCodigo = async function(codigo) {
    const idx = codigosCache.findIndex(c => c.codigo === codigo);
    if (idx === -1) return;

    codigosCache[idx].ativo = codigosCache[idx].ativo === false ? true : false;

    const ok = await salvarCodigosNoBanco();
    if (ok) {
        mostrarMensagem(`✅ Código "${codigo}" ${codigosCache[idx].ativo ? 'ativado' : 'pausado'}.`, 'sucesso');
        renderizarTabelaCodigos();
    }
};

window.deletarCodigo = async function(codigo) {
    if (!confirm(`Tem certeza que deseja deletar o código "${codigo}"?`)) return;

    const backup = [...codigosCache];
    codigosCache = codigosCache.filter(c => c.codigo !== codigo);

    const ok = await salvarCodigosNoBanco();
    if (ok) {
        mostrarMensagem(`🗑️ Código "${codigo}" deletado.`, 'sucesso');
        renderizarTabelaCodigos();
    } else {
        codigosCache = backup;
    }
};

// ==================== CARREGAR DADOS ====================
async function carregarDados() {
    const filtro = document.getElementById('buscaUsuario').value.trim();
    let usuarios = [];

    if (filtro) {
        usuarios = await buscarUsuarios(filtro);
        renderizarListaUsuarios(usuarios);
        renderizarListaSatoshi(usuarios);
        if (usuarios.length === 1) {
            renderizarUsuarioDetalhes(usuarios[0]);
        } else {
            document.getElementById('cardResultados').style.display = 'none';
        }
    } else {
        usuarios = await buscarUsuarios();
        renderizarListaUsuarios(usuarios);
        renderizarListaSatoshi(usuarios);
        document.getElementById('cardResultados').style.display = 'none';
    }

    await atualizarEstatisticas(usuarios);
}

// ==================== EVENT LISTENERS ====================
document.getElementById('btnBuscar').addEventListener('click', carregarDados);
document.getElementById('btnListarTodos').addEventListener('click', async () => {
    document.getElementById('buscaUsuario').value = '';
    await carregarDados();
});

document.getElementById('btnAdicionarSaldo').addEventListener('click', adicionarSaldoMassa);
document.getElementById('btnRemoverSaldo').addEventListener('click', removerSaldoMassa);
document.getElementById('btnDefinirSaldo').addEventListener('click', definirSaldoMassa);

document.getElementById('buscaUsuario').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        carregarDados();
    }
});

// ==================== EVENTOS SELIC ====================
document.getElementById('btnAtualizarSelic').addEventListener('click', async () => {
    const valor = parseFloat(document.getElementById('selicInput').value);
    if (isNaN(valor) || valor < 0) {
        mostrarMensagem('⚠️ Digite um valor válido para a SELIC.', 'erro');
        return;
    }
    await atualizarSelic(valor);
});

document.getElementById('btnSelicPadrao').addEventListener('click', async () => {
    await atualizarSelic(10.75);
});

document.getElementById('selicInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('btnAtualizarSelic').click();
    }
});

// ==================== EVENTOS CÓDIGOS DE RESGATE ====================
document.getElementById('btnCriarCodigo').addEventListener('click', criarCodigo);
document.getElementById('btnRecarregarCodigos').addEventListener('click', async () => {
    await carregarCodigos();
    mostrarMensagem('🔄 Lista de códigos recarregada.', 'info');
});
document.getElementById('codigoInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') criarCodigo();
});

// ==================== INICIALIZAÇÃO ====================
async function inicializar() {
    await verificarSupabase();

    const selicSalva = await carregarSelicDoSupabase();
    
    if (selicSalva !== null && selicSalva !== undefined) {
        selicAtual = selicSalva;
        document.getElementById('selicInput').value = selicSalva;
        atualizarDisplaySelic(selicSalva);
        console.log('✅ SELIC carregada do Supabase:', selicSalva);
    } else {
        const valorPadrao = 10.75;
        await salvarSelicNoSupabase(valorPadrao);
        selicAtual = valorPadrao;
        document.getElementById('selicInput').value = valorPadrao;
        atualizarDisplaySelic(valorPadrao);
        console.log('✅ SELIC criada no Supabase com valor padrão:', valorPadrao);
    }

    await carregarCodigos();
    console.log('✅ Códigos de resgate carregados:', codigosCache.length);

    await carregarDados();
}

inicializar();