const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const config = fs.readFileSync(path.join(root, 'config.js'), 'utf8');
const url = config.match(/const SUPABASE_URL = '([^']+)';/)?.[1];
const key = config.match(/const SUPABASE_KEY = '([^']+)';/)?.[1];

assert.ok(url, 'config.js precisa definir a URL do Supabase');
assert.ok(key, 'config.js precisa definir a chave pública do Supabase');
assert.equal((config.match(/const SUPABASE_URL =/g) || []).length, 1);
assert.equal((config.match(/const SUPABASE_KEY =/g) || []).length, 1);
assert.ok(!fs.readFileSync(path.join(root, '.gitignore'), 'utf8').match(/^config\.js\s*$/m));

function listarArquivos(diretorio) {
    return fs.readdirSync(diretorio, { withFileTypes: true }).flatMap((entrada) => {
        const arquivo = path.join(diretorio, entrada.name);
        if (entrada.isDirectory()) {
            if (['.git', 'node_modules', 'platforms', 'plugins', 'www'].includes(entrada.name)) return [];
            return listarArquivos(arquivo);
        }
        return [arquivo];
    });
}

for (const arquivo of listarArquivos(root)) {
    if (arquivo === path.join(root, 'config.js')) continue;
    const conteudo = fs.readFileSync(arquivo, 'utf8');
    assert.ok(!conteudo.includes(url), `${path.relative(root, arquivo)} duplica a URL do projeto`);
    assert.ok(!conteudo.includes(key), `${path.relative(root, arquivo)} duplica a chave pública`);

    if (path.extname(arquivo).toLowerCase() !== '.html') continue;
    if (!/PORTAL_CONFIG|SUPABASE_URL|SUPABASE_KEY|SUPABASE_ANON_KEY|createClient\(|supabase-js|supabaseClient|window\.supabase/i.test(conteudo)) continue;

    const configSrc = path.relative(path.dirname(arquivo), path.join(root, 'config.js')).split(path.sep).join('/');
    const sdkSrc = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    const sdkIndex = conteudo.indexOf(`src="${sdkSrc}"`);
    const configIndex = conteudo.indexOf(`src="${configSrc}"`);
    const sdkCount = [...conteudo.matchAll(new RegExp(`src="${sdkSrc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g'))].length;
    const configCount = [...conteudo.matchAll(new RegExp(`src="${configSrc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g'))].length;
    assert.ok(sdkIndex >= 0, `${path.relative(root, arquivo)} não carrega a biblioteca Supabase`);
    assert.ok(configIndex > sdkIndex, `${path.relative(root, arquivo)} não carrega config.js depois da biblioteca`);
    assert.equal(sdkCount, 1, `${path.relative(root, arquivo)} deve carregar a biblioteca Supabase uma única vez`);
    assert.equal(configCount, 1, `${path.relative(root, arquivo)} deve carregar config.js uma única vez`);
}

console.log('OK: URL e chave centralizadas; páginas Supabase carregam config.js na ordem correta.');
