import { createClient } from '@supabase/supabase-js';

// ==================== CONFIGURAÇÕES ====================
const SUPABASE_URL = 'https://xrcxvizzdumcxbylmkvn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_E-g3G3wW4EySbCsXLXp8KQ_FnmERMcD';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const TABELA = 'Geral';

// ==================== ELEMENTOS ====================
const formCadastro      = document.getElementById('formCadastro');
const nomeInput         = document.getElementById('nome');
const loginInput        = document.getElementById('login'); // campo agora é e-mail
const senhaInput        = document.getElementById('senha');
const senhaConfirmInput = document.getElementById('senha_confirm');
const btnCadastrar      = document.getElementById('btnCadastrar');
const mensagemErro      = document.getElementById('mensagemErro');
const mensagemSucesso   = document.getElementById('mensagemSucesso');
const statusSupabase    = document.getElementById('statusSupabase');

const reqLength    = document.getElementById('req-length');
const reqMaiuscula = document.getElementById('req-maiuscula');
const reqMinuscula = document.getElementById('req-minuscula');
const reqNumero    = document.getElementById('req-numero');

// ==================== MENSAGENS ====================
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

// ==================== VALIDAÇÕES ====================
function validarSenha(senha) {
    const temLength = senha.length >= 6;

    reqLength.className = temLength ? 'ok' : 'bad';
    reqLength.textContent = temLength
        ? '✅ Mínimo 6 caracteres'
        : '🔴 Mínimo 6 caracteres';

    reqMaiuscula.className = 'ok';
    reqMaiuscula.textContent = '✅ Pelo menos 1 letra maiúscula (opcional)';
    reqMinuscula.className = 'ok';
    reqMinuscula.textContent = '✅ Pelo menos 1 letra minúscula (opcional)';
    reqNumero.className = 'ok';
    reqNumero.textContent = '✅ Pelo menos 1 número (opcional)';

    return temLength;
}

function validarlogin(login) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(login);
}

// ==================== CONEXÃO ====================
async function verificarSupabase() {
    try {
        const { error } = await supabase.from(TABELA).select('id').limit(1);
        if (error) {
            statusSupabase.textContent = '⚠️ Erro ao conectar ao Supabase';
            statusSupabase.className = 'status-supabase offline';
            return false;
        }
        statusSupabase.textContent = '✅ Conectado ao Supabase';
        statusSupabase.className = 'status-supabase online';
        return true;
    } catch {
        statusSupabase.textContent = '❌ Erro ao conectar ao Supabase';
        statusSupabase.className = 'status-supabase offline';
        return false;
    }
}

// ==================== CADASTRO ====================
async function cadastrarUsuario(nome, login, senha) {
    try {
        // 1) Verifica se e-mail já existe na tabela Geral
        const { data: existente, error: checkError } = await supabase
            .from(TABELA)
            .select('id, login_confirmado')
            .eq('login', login)
            .maybeSingle();

        if (checkError) {
            console.error('Erro ao verificar e-mail:', checkError);
        }

        if (existente) {
            if (existente.login_confirmado) {
                mostrarErro('⚠️ Este e-mail já está cadastrado. Faça login.');
            } else {
                mostrarErro('⚠️ Este e-mail já foi cadastrado. Confirme sua caixa de entrada.');
            }
            return false;
        }

        // 2) Cria usuário no Supabase Auth (envia e-mail de confirmação)
        const { data, error } = await supabase.auth.signUp({
            login: login,
            password: senha,
            options: {
                data: {
                    nome: nome,
                    login: login
                },
                loginRedirectTo: `${window.location.origin}/confirmar.html`
            }
        });

        if (error) {
            console.error('Erro no signUp:', error);

            const msg = (error.message || '').toLowerCase();

            if (msg.includes('already registered') || msg.includes('already been registered')) {
                mostrarErro('⚠️ Este e-mail já está cadastrado. Faça login.');
            } else if (msg.includes('password should be')) {
                mostrarErro('⚠️ Senha muito fraca. Use pelo menos 6 caracteres.');
            } else if (msg.includes('invalid login')) {
                mostrarErro('⚠️ E-mail inválido.');
            } else {
                mostrarErro(`❌ Erro ao cadastrar: ${error.message}`);
            }
            return false;
        }

        // 3) Sucesso
        console.log('Usuário criado:', data?.user?.id);
        mostrarSucesso(
            '✅ Conta criada! Verifique seu e-mail e clique no link de confirmação para ativar a conta.'
        );

        formCadastro.reset();
        reqLength.className = 'bad';
        reqLength.textContent = '🔴 Mínimo 6 caracteres';

        return true;
    } catch (error) {
        console.error('Erro inesperado no cadastro:', error);
        mostrarErro(`❌ Erro inesperado: ${error.message || 'Tente novamente.'}`);
        return false;
    }
}

// ==================== EVENTOS ====================
senhaInput.addEventListener('input', () => validarSenha(senhaInput.value));

formCadastro.addEventListener('submit', async (e) => {
    e.preventDefault();
    ocultarMensagens();

    const nome         = nomeInput.value.trim();
    const login        = loginInput.value.trim().toLowerCase();
    const senha        = senhaInput.value;
    const senhaConfirm = senhaConfirmInput.value;

    if (!nome || !login || !senha || !senhaConfirm) {
        mostrarErro('⚠️ Preencha todos os campos!');
        return;
    }

    if (nome.length < 3) {
        mostrarErro('⚠️ Nome deve ter pelo menos 3 caracteres.');
        return;
    }

    if (!validarlogin(login)) {
        mostrarErro('⚠️ Digite um e-mail válido.');
        return;
    }

    if (!validarSenha(senha)) {
        mostrarErro('⚠️ A senha deve ter pelo menos 6 caracteres.');
        return;
    }

    if (senha !== senhaConfirm) {
        mostrarErro('⚠️ As senhas não coincidem!');
        return;
    }

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

// ==================== INICIALIZAÇÃO ====================
verificarSupabase();

// Se já tem sessão ativa no Supabase Auth, redireciona
supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user?.login_confirmed_at) {
        window.location.href = 'dashboard.html';
    }
});