const fs = require('node:fs');
const assert = require('node:assert/strict');
const vm = require('node:vm');

const html = fs.readFileSync('cadastro.html', 'utf8');
assert.match(html, /<input type="email" id="email"[^>]*required/);
assert.match(html, /fazerCadastro\(\{ login, email, senha, fingerprint, mac_address, ip_address \}\)/);
assert.match(html, /\.update\(\{ email: dados\.email \}\)/);

const source = html.slice(
    html.indexOf('async function fazerCadastro(dados)'),
    html.indexOf('// ==================== EVENTOS ====================')
);

async function executarCadastro({ erroEmail = null } = {}) {
    const chamadas = [];
    const mensagens = [];
    const session = new Map();
    const supabaseClient = {
        async rpc(nome, args) {
            chamadas.push({ tipo: 'rpc', nome, args });
            return { data: { ok: true, id: 17, login: args.p_login }, error: null };
        },
        from(tabela) {
            return {
                update(dados) {
                    chamadas.push({ tipo: 'update', tabela, dados });
                    return this;
                },
                eq(coluna, valor) {
                    chamadas.push({ tipo: 'eq', coluna, valor });
                    return this;
                },
                select(colunas) {
                    chamadas.push({ tipo: 'select', colunas });
                    return this;
                },
                async maybeSingle() {
                    return erroEmail
                        ? { data: null, error: erroEmail }
                        : { data: { id: 17 }, error: null };
                }
            };
        }
    };
    const context = {
        supabaseClient,
        TABELA: 'Geral',
        salvarSessao: usuario => session.set('usuario', usuario),
        mostrarErro: mensagem => mensagens.push({ tipo: 'erro', mensagem }),
        mostrarSucesso: mensagem => mensagens.push({ tipo: 'sucesso', mensagem }),
        console: { error() {} },
        window: { location: { replace() {} } },
        setTimeout() {}
    };
    vm.createContext(context);
    vm.runInContext(`${source}; globalThis.fazerCadastro = fazerCadastro;`, context);
    const ok = await context.fazerCadastro({
        login: 'jogador',
        email: 'contato@example.com',
        senha: 'senha-segura',
        fingerprint: 'fingerprint',
        mac_address: 'mac',
        ip_address: 'ip'
    });
    return { ok, chamadas, mensagens, session };
}

(async () => {
    const sucesso = await executarCadastro();
    assert.equal(sucesso.ok, true);
    assert.equal(sucesso.chamadas[0].tipo, 'rpc');
    assert.equal(JSON.stringify(sucesso.chamadas[0].args), JSON.stringify({
        p_login: 'jogador',
        p_senha: 'senha-segura',
        p_fingerprint: 'fingerprint',
        p_mac: 'mac',
        p_ip: 'ip'
    }));
    assert.equal(JSON.stringify(sucesso.chamadas[1]), JSON.stringify({
        tipo: 'update',
        tabela: 'Geral',
        dados: { email: 'contato@example.com' }
    }));
    assert.equal(sucesso.chamadas.find(chamada => chamada.tipo === 'eq').valor, 17);
    assert.equal(sucesso.session.get('usuario').email, 'contato@example.com');

    const falhaEmail = await executarCadastro({ erroEmail: { message: 'Acesso negado.' } });
    assert.equal(falhaEmail.ok, false);
    assert.equal(falhaEmail.session.has('usuario'), false);
    assert.match(falhaEmail.mensagens[0].mensagem, /conta foi criada.*salvar o e-mail/i);

    console.log('OK: cadastro salva o e-mail em Geral e informa claramente quando o banco recusa a atualização.');
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
