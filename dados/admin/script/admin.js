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
let selicAtual = 10.75; // Valor padrão inicial, será sobrescrito pelo Supabase

// ==================== FUNÇÕES ====================
function mostrarMensagem(texto, tipo = 'info') {
    const el = document.getElementById('mensagem');
    el.textContent = texto;
    el.className = `mensagem show mensagem-${tipo}`;
    setTimeout(() => {
        el.className = 'mensagem';
    }, 5000);
}

function formatarMoeda(valor) {
    return `${valor.toFixed(2)} ${MOEDA}`;
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
        // Primeiro, verifica se o registro existe
        const { data: existingData, error: checkError } = await supabase
            .from(TABELA)
            .select('id')
            .eq('id', 1)
            .single();

        if (checkError && checkError.code === 'PGRST116') {
            // Registro não existe, cria
            const { error: insertError } = await supabase
                .from(TABELA)
                .insert({ id: 1, selic: valor, updated_at: new Date().toISOString() });
            if (insertError) {
                console.error('Erro ao criar registro SELIC:', insertError);
                return false;
            }
        } else {
            // Registro existe, atualiza
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
                // Nenhum registro encontrado, retorna null para criar um novo
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

// ==================== SUPABASE ====================
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
            .select('id, nome, login, senha, saldo, saldo_poupanca')
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

async function atualizarSaldoUsuario(id, novoSaldo) {
    try {
        const { data, error } = await supabase
            .from(TABELA)
            .update({ saldo: novoSaldo, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Erro ao atualizar saldo:', error);
        throw error;
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
                <p style="font-size: 0.8rem; color: #8a99ad;">Saldo</p>
                <p style="font-size: 1.4rem; font-weight: 700; color: var(--neon-green);">${formatarMoeda(usuario.saldo || 0)}</p>
            </div>
            <div>
                <p style="font-size: 0.8rem; color: #8a99ad;">Poupança</p>
                <p style="font-size: 1.4rem; font-weight: 700; color: #f59e0b;">${formatarMoeda(usuario.saldo_poupanca || 0)}</p>
            </div>
            <div>
                <p style="font-size: 0.8rem; color: #8a99ad;">Patrimônio Total</p>
                <p style="font-size: 1.4rem; font-weight: 700; color: #fff;">${formatarMoeda((usuario.saldo || 0) + (usuario.saldo_poupanca || 0))}</p>
            </div>
        </div>
        <div style="margin-top: 16px; display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-success" onclick="window.adicionarSaldoEspecifico(${usuario.id})">➕ Adicionar</button>
            <button class="btn btn-danger" onclick="window.removerSaldoEspecifico(${usuario.id})">➖ Remover</button>
            <button class="btn btn-warning" onclick="window.definirSaldoEspecifico(${usuario.id})">🎯 Definir</button>
        </div>
    `;

    card.style.display = 'block';
}

function renderizarListaUsuarios(usuarios) {
    const tbody = document.getElementById('tabelaUsuarios');
    const card = document.getElementById('cardLista');

    if (!usuarios || usuarios.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="padding: 20px; color: #8a99ad;">Nenhum usuário encontrado.</td></tr>`;
        card.style.display = 'block';
        return;
    }

    let html = '';
    usuarios.forEach(u => {
        html += `
            <tr>
                <td style="color: var(--neon-blue);">#${u.id}</td>
                <td><strong>${u.nome || '—'}</strong></td>
                <td>${u.login}</td>
                <td><span class="senha-texto">${u.senha || '—'}</span></td>
                <td style="color: var(--neon-green); font-weight: 600;">${formatarMoeda(u.saldo || 0)}</td>
                <td style="color: #f59e0b; font-weight: 600;">${formatarMoeda(u.saldo_poupanca || 0)}</td>
                <td>
                    <div class="acao-botoes">
                        <input type="number" id="valor_${u.id}" class="quantidade-input" placeholder="Valor" step="0.01" min="0.01" value="10">
                        <button class="add" onclick="window.adicionarSaldoUsuario(${u.id})">+</button>
                        <button class="remove" onclick="window.removerSaldoUsuario(${u.id})">-</button>
                        <button class="set" onclick="window.definirSaldoUsuario(${u.id})">=</button>
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
    const totalSaldo = usuarios.reduce((acc, u) => acc + (u.saldo || 0), 0);
    const totalPoupanca = usuarios.reduce((acc, u) => acc + (u.saldo_poupanca || 0), 0);

    document.getElementById('totalUsuarios').textContent = total;
    document.getElementById('totalCirculacao').innerHTML = `${totalSaldo.toFixed(2)} <span class="moeda-simbolo">${MOEDA}</span>`;
    document.getElementById('totalPoupanca').innerHTML = `${totalPoupanca.toFixed(2)} <span class="moeda-simbolo">${MOEDA}</span>`;
}

// ==================== AÇÕES ====================
window.adicionarSaldoUsuario = async function(id) {
    const input = document.getElementById(`valor_${id}`);
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

        const novoSaldo = (usuario.saldo || 0) + valor;
        await atualizarSaldoUsuario(id, novoSaldo);

        mostrarMensagem(`✅ Adicionado ${formatarMoeda(valor)} para ${usuario.login}. Novo saldo: ${formatarMoeda(novoSaldo)}`, 'sucesso');
        await carregarDados();
    } catch (error) {
        mostrarMensagem('❌ Erro ao adicionar saldo.', 'erro');
    }
};

window.removerSaldoUsuario = async function(id) {
    const input = document.getElementById(`valor_${id}`);
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

        const novoSaldo = Math.max(0, (usuario.saldo || 0) - valor);
        await atualizarSaldoUsuario(id, novoSaldo);

        mostrarMensagem(`✅ Removido ${formatarMoeda(valor)} de ${usuario.login}. Novo saldo: ${formatarMoeda(novoSaldo)}`, 'sucesso');
        await carregarDados();
    } catch (error) {
        mostrarMensagem('❌ Erro ao remover saldo.', 'erro');
    }
};

window.definirSaldoUsuario = async function(id) {
    const input = document.getElementById(`valor_${id}`);
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

        await atualizarSaldoUsuario(id, valor);

        mostrarMensagem(`✅ Saldo de ${usuario.login} definido para ${formatarMoeda(valor)}`, 'sucesso');
        await carregarDados();
    } catch (error) {
        mostrarMensagem('❌ Erro ao definir saldo.', 'erro');
    }
};

window.adicionarSaldoEspecifico = async function(id) {
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

        const novoSaldo = (usuario.saldo || 0) + valor;
        await atualizarSaldoUsuario(id, novoSaldo);

        mostrarMensagem(`✅ Adicionado ${formatarMoeda(valor)} para ${usuario.login}. Novo saldo: ${formatarMoeda(novoSaldo)}`, 'sucesso');
        await carregarDados();
    } catch (error) {
        mostrarMensagem('❌ Erro ao adicionar saldo.', 'erro');
    }
};

window.removerSaldoEspecifico = async function(id) {
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

        const novoSaldo = Math.max(0, (usuario.saldo || 0) - valor);
        await atualizarSaldoUsuario(id, novoSaldo);

        mostrarMensagem(`✅ Removido ${formatarMoeda(valor)} de ${usuario.login}. Novo saldo: ${formatarMoeda(novoSaldo)}`, 'sucesso');
        await carregarDados();
    } catch (error) {
        mostrarMensagem('❌ Erro ao remover saldo.', 'erro');
    }
};

window.definirSaldoEspecifico = async function(id) {
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

        await atualizarSaldoUsuario(id, valor);

        mostrarMensagem(`✅ Saldo de ${usuario.login} definido para ${formatarMoeda(valor)}`, 'sucesso');
        await carregarDados();
    } catch (error) {
        mostrarMensagem('❌ Erro ao definir saldo.', 'erro');
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

        const novoSaldo = (usuario.saldo || 0) + valor;
        await atualizarSaldoUsuario(id, novoSaldo);

        mostrarMensagem(`✅ Adicionado ${formatarMoeda(valor)} para ${usuario.login}. Novo saldo: ${formatarMoeda(novoSaldo)}`, 'sucesso');
        await carregarDados();
    } catch (error) {
        mostrarMensagem('❌ Erro ao adicionar saldo.', 'erro');
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

        const novoSaldo = Math.max(0, (usuario.saldo || 0) - valor);
        await atualizarSaldoUsuario(id, novoSaldo);

        mostrarMensagem(`✅ Removido ${formatarMoeda(valor)} de ${usuario.login}. Novo saldo: ${formatarMoeda(novoSaldo)}`, 'sucesso');
        await carregarDados();
    } catch (error) {
        mostrarMensagem('❌ Erro ao remover saldo.', 'erro');
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

        await atualizarSaldoUsuario(id, valor);

        mostrarMensagem(`✅ Saldo de ${usuario.login} definido para ${formatarMoeda(valor)}`, 'sucesso');
        await carregarDados();
    } catch (error) {
        mostrarMensagem('❌ Erro ao definir saldo.', 'erro');
    }
}

// ==================== CARREGAR DADOS ====================
async function carregarDados() {
    const filtro = document.getElementById('buscaUsuario').value.trim();
    let usuarios = [];

    if (filtro) {
        usuarios = await buscarUsuarios(filtro);
        renderizarListaUsuarios(usuarios);
        if (usuarios.length === 1) {
            renderizarUsuarioDetalhes(usuarios[0]);
        } else {
            document.getElementById('cardResultados').style.display = 'none';
        }
    } else {
        usuarios = await buscarUsuarios();
        renderizarListaUsuarios(usuarios);
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

document.getElementById('btnSair').addEventListener('click', () => {
    if (confirm('Tem certeza que deseja sair?')) {
        localStorage.removeItem('usuario_logado');
        window.location.href = 'login.html';
    }
});

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

// ==================== INICIALIZAÇÃO ====================
async function inicializar() {
    await verificarSupabase();

    // Sempre carrega a SELIC do Supabase
    const selicSalva = await carregarSelicDoSupabase();
    
    if (selicSalva !== null && selicSalva !== undefined) {
        // Usa o valor salvo no Supabase
        selicAtual = selicSalva;
        document.getElementById('selicInput').value = selicSalva;
        atualizarDisplaySelic(selicSalva);
        console.log('✅ SELIC carregada do Supabase:', selicSalva);
    } else {
        // Nenhum registro encontrado, cria com valor padrão
        const valorPadrao = 10.75;
        await salvarSelicNoSupabase(valorPadrao);
        selicAtual = valorPadrao;
        document.getElementById('selicInput').value = valorPadrao;
        atualizarDisplaySelic(valorPadrao);
        console.log('✅ SELIC criada no Supabase com valor padrão:', valorPadrao);
    }

    await carregarDados();
}

// Inicia a aplicação
inicializar();