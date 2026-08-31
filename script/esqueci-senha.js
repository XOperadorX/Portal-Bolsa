import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xrcxvizzdumcxbylmkvn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_E-g3G3wW4EySbCsXLXp8KQ_FnmERMcD';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const TABELA = 'Geral';

const formRecuperar = document.getElementById('formRecuperar');
const loginInput = document.getElementById('login');
const novaSenhaInput = document.getElementById('nova_senha');
const confirmarSenhaInput = document.getElementById('confirmar_senha');
const btnRecuperar = document.getElementById('btnRecuperar');
const mensagemErro = document.getElementById('mensagemErro');
const mensagemSucesso = document.getElementById('mensagemSucesso');
const statusSupabase = document.getElementById('statusSupabase');

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
            statusSupabase.textContent = '⚠️ Erro ao conectar';
            statusSupabase.className = 'status-supabase offline';
            return false;
        }
        
        statusSupabase.textContent = '✅ Conectado ao Supabase';
        statusSupabase.className = 'status-supabase online';
        return true;
    } catch (error) {
        statusSupabase.textContent = '❌ Erro ao conectar';
        statusSupabase.className = 'status-supabase offline';
        return false;
    }
}

async function redefinirSenha(login, novaSenha) {
    try {
        const { data, error } = await supabase
            .from(TABELA)
            .select('id')
            .eq('login', login)
            .single();

        if (error || !data) {
            mostrarErro('❌ Usuário não encontrado!');
            return false;
        }

        const { error: updateError } = await supabase
            .from(TABELA)
            .update({ senha: novaSenha })
            .eq('id', data.id);

        if (updateError) {
            mostrarErro('❌ Erro ao redefinir senha. Tente novamente.');
            return false;
        }

        mostrarSucesso('✅ Senha redefinida com sucesso! Redirecionando...');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);

        return true;

    } catch (error) {
        console.error('Erro:', error);
        mostrarErro('❌ Erro ao redefinir senha. Tente novamente.');
        return false;
    }
}

formRecuperar.addEventListener('submit', async (e) => {
    e.preventDefault();
    ocultarMensagens();

    const login = loginInput.value.trim();
    const novaSenha = novaSenhaInput.value;
    const confirmarSenha = confirmarSenhaInput.value;

    if (!login) {
        mostrarErro('⚠️ Digite seu login.');
        return;
    }

    if (!novaSenha || novaSenha.length < 6) {
        mostrarErro('⚠️ A nova senha deve ter pelo menos 6 caracteres.');
        return;
    }

    if (novaSenha !== confirmarSenha) {
        mostrarErro('⚠️ As senhas não coincidem!');
        return;
    }

    const online = await verificarSupabase();
    if (!online) {
        mostrarErro('❌ Sem conexão com o banco de dados.');
        return;
    }

    btnRecuperar.disabled = true;
    btnRecuperar.innerHTML = '<span class="loading"></span> Redefinindo...';

    await redefinirSenha(login, novaSenha);

    btnRecuperar.disabled = false;
    btnRecuperar.innerHTML = '🔑 Redefinir Senha';
});

verificarSupabase();

// Depois de alterar o saldo ou inventário
await salvarDadosDoJogador();