import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xrcxvizzdumcxbylmkvn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_E-g3G3wW4EySbCsXLXp8KQ_FnmERMcD';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const TABELA = 'Geral';

const formRecuperar = document.getElementById('formRecuperarLogin');
const nomeInput = document.getElementById('nome');
const btnRecuperar = document.getElementById('btnRecuperar');
const mensagemErro = document.getElementById('mensagemErro');
const mensagemSucesso = document.getElementById('mensagemSucesso');
const statusSupabase = document.getElementById('statusSupabase');
const resultadoLogin = document.getElementById('resultadoLogin');
const loginEncontrado = document.getElementById('loginEncontrado');

function mostrarErro(mensagem) {
    mensagemErro.textContent = mensagem;
    mensagemErro.className = 'mensagem-erro show';
    mensagemSucesso.className = 'mensagem-sucesso';
    resultadoLogin.className = 'resultado-login';
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

async function recuperarLogin(nome) {
    try {
        const { data, error } = await supabase
            .from(TABELA)
            .select('login')
            .ilike('nome', `%${nome}%`)
            .limit(5);

        if (error) {
            mostrarErro('❌ Erro ao buscar usuário. Tente novamente.');
            return false;
        }

        if (!data || data.length === 0) {
            mostrarErro('❌ Nenhum usuário encontrado com este nome.');
            return false;
        }

        if (data.length === 1) {
            loginEncontrado.textContent = data[0].login;
            resultadoLogin.className = 'resultado-login show';
            mostrarSucesso('✅ Login encontrado!');
        } else {
            const logins = data.map(u => u.login).join(', ');
            loginEncontrado.textContent = logins;
            resultadoLogin.className = 'resultado-login show';
            mostrarSucesso(`✅ Encontrados ${data.length} usuários:`);
        }

        return true;

    } catch (error) {
        console.error('Erro:', error);
        mostrarErro('❌ Erro ao recuperar login. Tente novamente.');
        return false;
    }
}

formRecuperar.addEventListener('submit', async (e) => {
    e.preventDefault();
    ocultarMensagens();
    resultadoLogin.className = 'resultado-login';

    const nome = nomeInput.value.trim();

    if (!nome || nome.length < 3) {
        mostrarErro('⚠️ Digite seu nome completo (mínimo 3 caracteres).');
        return;
    }

    const online = await verificarSupabase();
    if (!online) {
        mostrarErro('❌ Sem conexão com o banco de dados.');
        return;
    }

    btnRecuperar.disabled = true;
    btnRecuperar.innerHTML = '<span class="loading"></span> Buscando...';

    await recuperarLogin(nome);

    btnRecuperar.disabled = false;
    btnRecuperar.innerHTML = '🔍 Recuperar Login';
});

verificarSupabase();

// Depois de alterar o saldo ou inventário
await salvarDadosDoJogador();