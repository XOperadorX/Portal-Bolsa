import { createClient } from '@supabase/supabase-js';

// ==================== CONFIGURAÇÕES ====================
const SUPABASE_URL = 'https://xrcxvizzdumcxbylmkvn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_E-g3G3wW4EySbCsXLXp8KQ_FnmERMcD';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const TABELA = 'Geral';

// ==================== ELEMENTOS ====================
const formLogin = document.getElementById('formLogin');
const loginInput = document.getElementById('login');
const senhaInput = document.getElementById('senha');
const btnLogin = document.getElementById('btnLogin');
const mensagemErro = document.getElementById('mensagemErro');
const mensagemSucesso = document.getElementById('mensagemSucesso');
const statusSupabase = document.getElementById('statusSupabase');

// ==================== FUNÇÕES ====================
function mostrarErro(mensagem) {
    mensagemErro.textContent = mensagem;
    mensagemErro.className = 'mensagem-erro show';
    mensagemSucesso.className = 'mensagem-sucesso';
}

function mostrarSucesso(mensagem) {
    mensagemSucesso.textContent = mensagem;
    mensagemSucesso.className = 'mensagem-sucesso show';
    mensagemErro.className = 'mensagem-erro';
}

function ocultarMensagens() {
    mensagemErro.className = 'mensagem-erro';
    mensagemSucesso.className = 'mensagem-sucesso';
}

async function verificarSupabase() {
    try {
        const { data, error } = await supabase
            .from(TABELA)
            .select('id')
            .limit(1);
        
        if (error) {
            statusSupabase.textContent = '⚠️ Erro ao conectar ao Supabase';
            statusSupabase.className = 'status-supabase offline';
            return false;
        }
        
        statusSupabase.textContent = '✅ Conectado ao Supabase';
        statusSupabase.className = 'status-supabase online';
        return true;
    } catch (error) {
        statusSupabase.textContent = '❌ Erro ao conectar ao Supabase';
        statusSupabase.className = 'status-supabase offline';
        return false;
    }
}

async function fazerLogin(login, senha) {
    try {
        // Buscar usuário pelo login
        const { data, error } = await supabase
            .from(TABELA)
            .select('id, login, senha, nome, saldo, saldo_poupanca, carteira')
            .eq('login', login)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                mostrarErro('❌ Usuário não encontrado!');
                return false;
            }
            throw error;
        }

        if (!data) {
            mostrarErro('❌ Usuário não encontrado!');
            return false;
        }

        // Verificar senha
        if (data.senha !== senha) {
            mostrarErro('❌ Senha incorreta!');
            return false;
        }

        // Login bem-sucedido - salvar dados do usuário
        localStorage.setItem('usuario_logado', JSON.stringify({
            id: data.id,
            login: data.login,
            nome: data.nome || data.login,
            saldo: data.saldo || 0,
            saldo_poupanca: data.saldo_poupanca || 0,
            carteira: data.carteira || {}
        }));

        mostrarSucesso('✅ Login realizado com sucesso! Redirecionando...');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);

        return true;

    } catch (error) {
        console.error('Erro no login:', error);
        mostrarErro('❌ Erro ao realizar login. Tente novamente.');
        return false;
    }
}

// ==================== EVENT LISTENERS ====================
formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    ocultarMensagens();

    const login = loginInput.value.trim();
    const senha = senhaInput.value.trim();

    if (!login || !senha) {
        mostrarErro('⚠️ Preencha todos os campos!');
        return;
    }

    // Verificar Supabase
    const online = await verificarSupabase();
    if (!online) {
        mostrarErro('❌ Sem conexão com o banco de dados. Tente novamente mais tarde.');
        return;
    }

    btnLogin.disabled = true;
    btnLogin.innerHTML = '<span class="loading"></span> Entrando...';

    await fazerLogin(login, senha);

    btnLogin.disabled = false;
    btnLogin.innerHTML = '🔐 Entrar';
});

// Verificar conexão ao carregar
verificarSupabase();

// Verificar se já está logado
const usuarioLogado = localStorage.getItem('usuario_logado');
if (usuarioLogado) {
    try {
        const user = JSON.parse(usuarioLogado);
        if (user && user.login) {
            window.location.href = 'dashboard.html';
        }
    } catch (e) {
        localStorage.removeItem('usuario_logado');
    }
}

// Enter para submeter
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        formLogin.dispatchEvent(new Event('submit'));
    }
});


// Depois de alterar o saldo ou inventário
await salvarDadosDoJogador();