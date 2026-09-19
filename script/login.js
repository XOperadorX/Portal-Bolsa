import { createClient } from '@supabase/supabase-js';
import { salvarSessao, sessaoValida } from './session.js';

// ==================== CONFIGURAÇÕES ====================
const SUPABASE_URL = 'https://xrcxvizzdumcxbylmkvn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_E-g3G3wW4EySbCsXLXp8KQ_FnmERMcD';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const TABELA = 'Geral';

// ==================== ELEMENTOS ====================
const formLogin        = document.getElementById('formLogin');
const emailInput       = document.getElementById('login'); // campo agora é e-mail
const senhaInput       = document.getElementById('senha');
const btnLogin         = document.getElementById('btnLogin');
const mensagemErro     = document.getElementById('mensagemErro');
const mensagemSucesso  = document.getElementById('mensagemSucesso');
const statusSupabase   = document.getElementById('statusSupabase');

// ==================== MENSAGENS ====================
function mostrarErro(m) {
    mensagemErro.textContent = m;
    mensagemErro.className = 'mensagem-erro show';
    mensagemSucesso.className = 'mensagem-sucesso';
}

function mostrarSucesso(m) {
    mensagemSucesso.textContent = m;
    mensagemSucesso.className = 'mensagem-sucesso show';
    mensagemErro.className = 'mensagem-erro';
}

function ocultarMensagens() {
    mensagemErro.className = 'mensagem-erro';
    mensagemSucesso.className = 'mensagem-sucesso';
}

// ==================== CONEXÃO ====================
async function verificarSupabase() {
    try {
        const { error } = await supabase.from(TABELA).select('id').limit(1);
        if (error) {
            statusSupabase.textContent = '⚠️ Erro ao conectar';
            statusSupabase.className = 'status-supabase offline';
            return false;
        }
        statusSupabase.textContent = '✅ Conectado ao Supabase';
        statusSupabase.className = 'status-supabase online';
        return true;
    } catch {
        statusSupabase.textContent = '❌ Erro ao conectar';
        statusSupabase.className = 'status-supabase offline';
        return false;
    }
}

// ==================== LOGIN ====================
async function fazerLogin(email, senha) {
    try {
        // 1) Autentica via Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: senha
        });

        if (error) {
            console.error('Erro login:', error);
            const msg = (error.message || '').toLowerCase();

            if (msg.includes('email not confirmed')) {
                mostrarErro('📧 Confirme seu e-mail antes de fazer login. Verifique sua caixa de entrada.');
            } else if (msg.includes('invalid login credentials')) {
                mostrarErro('❌ E-mail ou senha incorretos.');
            } else {
                mostrarErro(`❌ ${error.message}`);
            }
            return false;
        }

        if (!data?.user) {
            mostrarErro('❌ Erro ao autenticar. Tente novamente.');
            return false;
        }

        // 2) Busca dados do jogo na tabela Geral
        const { data: perfil, error: perfilError } = await supabase
            .from(TABELA)
            .select('id, login, nome, saldo, saldo_poupanca, carteira, email_confirmado')
            .eq('auth_id', data.user.id)
            .maybeSingle();

        if (perfilError) {
            console.error('Erro ao buscar perfil:', perfilError);
        }

        if (!perfil) {
            mostrarErro('⚠️ Perfil não encontrado. Contate o suporte.');
            await supabase.auth.signOut();
            return false;
        }

        if (perfil.email_confirmado === false) {
            mostrarErro('📧 Confirme seu e-mail antes de fazer login.');
            await supabase.auth.signOut();
            return false;
        }

        // 3) Salva sessão local (expira em 24h via session.js)
        salvarSessao({
            id: perfil.id,
            auth_id: data.user.id,
            login: perfil.login,
            email: data.user.email,
            nome: perfil.nome || perfil.login,
            saldo: perfil.saldo || 0,
            saldo_poupanca: perfil.saldo_poupanca || 0,
            carteira: perfil.carteira || {}
        });

        mostrarSucesso('✅ Login realizado! Redirecionando...');

        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1200);

        return true;
    } catch (error) {
        console.error('Erro inesperado:', error);
        mostrarErro('❌ Erro ao realizar login. Tente novamente.');
        return false;
    }
}

// ==================== EVENTOS ====================
formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    ocultarMensagens();

    const email = emailInput.value.trim().toLowerCase();
    const senha = senhaInput.value.trim();

    if (!email || !senha) {
        mostrarErro('⚠️ Preencha todos os campos!');
        return;
    }

    const online = await verificarSupabase();
    if (!online) {
        mostrarErro('❌ Sem conexão com o banco de dados. Tente novamente mais tarde.');
        return;
    }

    btnLogin.disabled = true;
    btnLogin.innerHTML = '<span class="loading"></span> Entrando...';

    await fazerLogin(email, senha);

    btnLogin.disabled = false;
    btnLogin.innerHTML = '🔐 Entrar';
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') formLogin.dispatchEvent(new Event('submit'));
});

// ==================== INICIALIZAÇÃO ====================
verificarSupabase();

// Se já está logado (sessão local válida), vai direto ao dashboard
if (sessaoValida()) {
    window.location.href = 'dashboard.html';
}