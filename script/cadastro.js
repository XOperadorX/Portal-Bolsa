import { createClient } from '@supabase/supabase-js';

// ==================== CONFIGURAÇÕES ====================
const SUPABASE_URL = 'https://xrcxvizzdumcxbylmkvn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_E-g3G3wW4EySbCsXLXp8KQ_FnmERMcD';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const TABELA = 'Geral';

// ==================== ELEMENTOS ====================
const formCadastro = document.getElementById('formCadastro');
const nomeInput = document.getElementById('nome');
const loginInput = document.getElementById('login');
const senhaInput = document.getElementById('senha');
const senhaConfirmInput = document.getElementById('senha_confirm');
const btnCadastrar = document.getElementById('btnCadastrar');
const mensagemErro = document.getElementById('mensagemErro');
const mensagemSucesso = document.getElementById('mensagemSucesso');
const statusSupabase = document.getElementById('statusSupabase');

const reqLength = document.getElementById('req-length');
const reqMaiuscula = document.getElementById('req-maiuscula');
const reqMinuscula = document.getElementById('req-minuscula');
const reqNumero = document.getElementById('req-numero');

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

function validarSenha(senha) {
    const temLength = senha.length >= 6;
    const temMaiuscula = /[A-Z]/.test(senha);
    const temMinuscula = /[a-z]/.test(senha);
    const temNumero = /[0-9]/.test(senha);

    reqLength.className = temLength ? 'ok' : 'bad';
    reqLength.textContent = temLength ? '✅ Mínimo 6 caracteres' : '🔴 Mínimo 6 caracteres';

    reqMaiuscula.className = temMaiuscula ? 'ok' : 'bad';
    reqMaiuscula.textContent = temMaiuscula ? '✅ Pelo menos 1 letra maiúscula' : '🔴 Pelo menos 1 letra maiúscula';

    reqMinuscula.className = temMinuscula ? 'ok' : 'bad';
    reqMinuscula.textContent = temMinuscula ? '✅ Pelo menos 1 letra minúscula' : '🔴 Pelo menos 1 letra minúscula';

    reqNumero.className = temNumero ? 'ok' : 'bad';
    reqNumero.textContent = temNumero ? '✅ Pelo menos 1 número' : '🔴 Pelo menos 1 número';

    return temLength && temMaiuscula && temMinuscula && temNumero;
}

function validarLogin(login) {
    if (login.length < 3) return false;
    return /^[a-zA-Z0-9@._\-]+$/.test(login);
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
            console.error('Erro ao verificar Supabase:', error);
            return false;
        }
        
        statusSupabase.textContent = '✅ Conectado ao Supabase';
        statusSupabase.className = 'status-supabase online';
        return true;
    } catch (error) {
        statusSupabase.textContent = '❌ Erro ao conectar ao Supabase';
        statusSupabase.className = 'status-supabase offline';
        console.error('Erro ao verificar Supabase:', error);
        return false;
    }
}

async function cadastrarUsuario(nome, login, senha) {
    try {
        // 1. Verificar se login já existe
        const { data: existe, error: checkError } = await supabase
            .from(TABELA)
            .select('id')
            .eq('login', login)
            .maybeSingle();

        if (checkError) {
            console.error('Erro ao verificar login:', checkError);
            mostrarErro('❌ Erro ao verificar disponibilidade do login.');
            return false;
        }

        if (existe) {
            mostrarErro('⚠️ Este login já está em uso. Escolha outro.');
            return false;
        }

        // 2. Criar novo usuário
        const novoUsuario = {
            nome: nome,
            login: login,
            senha: senha,
            saldo: 0,
            saldo_poupanca: 0,
            proventos_pendentes: 0,
            carteira: {},
            preco_medio_compra: {},
            proventos_por_ativo: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        console.log('Tentando criar usuário:', { ...novoUsuario, senha: '***' });

        const { data, error } = await supabase
            .from(TABELA)
            .insert([novoUsuario])
            .select();

        if (error) {
            console.error('Erro detalhado ao cadastrar:', error);
            
            // Mensagem de erro mais específica
            if (error.code === '23505') {
                mostrarErro('⚠️ Este login já está em uso. Escolha outro.');
            } else if (error.code === '42P01') {
                mostrarErro('❌ Tabela "Geral" não encontrada. Execute o SQL de criação no Supabase.');
            } else {
                mostrarErro(`❌ Erro ao cadastrar: ${error.message || 'Tente novamente.'}`);
            }
            return false;
        }

        if (!data || data.length === 0) {
            mostrarErro('❌ Erro ao criar usuário. Nenhum dado retornado.');
            return false;
        }

        console.log('Usuário criado com sucesso:', data[0]);
        mostrarSucesso('✅ Conta criada com sucesso! Redirecionando para o login...');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);

        return true;

    } catch (error) {
        console.error('Erro inesperado no cadastro:', error);
        mostrarErro(`❌ Erro inesperado: ${error.message || 'Tente novamente.'}`);
        return false;
    }
}

// ==================== EVENT LISTENERS ====================
senhaInput.addEventListener('input', () => {
    validarSenha(senhaInput.value);
});

formCadastro.addEventListener('submit', async (e) => {
    e.preventDefault();
    ocultarMensagens();

    const nome = nomeInput.value.trim();
    const login = loginInput.value.trim();
    const senha = senhaInput.value;
    const senhaConfirm = senhaConfirmInput.value;

    // Validações
    if (!nome || !login || !senha || !senhaConfirm) {
        mostrarErro('⚠️ Preencha todos os campos!');
        return;
    }

    if (nome.length < 3) {
        mostrarErro('⚠️ Nome deve ter pelo menos 3 caracteres.');
        return;
    }

    if (!validarLogin(login)) {
        mostrarErro('⚠️ Login deve ter pelo menos 3 caracteres e pode conter letras, números, @, ., - e _');
        return;
    }

    if (!validarSenha(senha)) {
        mostrarErro('⚠️ A senha não atende aos requisitos de segurança.');
        return;
    }

    if (senha !== senhaConfirm) {
        mostrarErro('⚠️ As senhas não coincidem!');
        return;
    }

    // Verificar Supabase
    const online = await verificarSupabase();
    if (!online) {
        mostrarErro('❌ Sem conexão com o banco de dados. Tente novamente mais tarde.');
        return;
    }

    btnCadastrar.disabled = true;
    btnCadastrar.innerHTML = '<span class="loading"></span> Criando conta...';

    await cadastrarUsuario(nome, login, senha);

    btnCadastrar.disabled = false;
    btnCadastrar.innerHTML = '📝 Criar Conta';
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


// Depois de alterar o saldo ou inventário
await salvarDadosDoJogador();