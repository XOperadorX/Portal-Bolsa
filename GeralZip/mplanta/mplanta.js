(function() {
    'use strict';

    // ============================================================
    // CONFIGURAÇÃO SUPABASE
    // ============================================================
    const SUPABASE_URL = 'https://xrcxvizzdumcxbylmkvn.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_E-g3G3wW4EySbCsXLXp8KQ_FnmERMcD';
    const TABELA = 'Geral';

    // ============================================================
    // ESTADO GLOBAL
    // ============================================================
    let supabaseOnline = false;
    let usuarioLogado = null;
    let toastTimeout = null;
    let salvando = false;
    let dadosCompletos = null;

    // ============================================================
    // ESTADO DO PERSONAGEM (integrado com personagem.js)
    // ============================================================
    const personagem = {
        nivel: 1,
        experiencia: 0,
        expProximo: 100,
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        sm: 100,
        maxSm: 100,
        atk: 15,
        def: 10,
        mag: 8,
        saldo: 0,
        btc: 0,
        poderHash: 1.0,
        itens: [],
        
        titulos: [
            { min: 1, titulo: '🌱 Iniciante' },
            { min: 5, titulo: '🌿 Aprendiz' },
            { min: 10, titulo: '⚔️ Guerreiro' },
            { min: 20, titulo: '🛡️ Mestre' },
            { min: 35, titulo: '🏆 Lendário' },
            { min: 50, titulo: '👑 Herói' },
            { min: 75, titulo: '⚡ Deus da Guerra' },
            { min: 100, titulo: '🌟 Imortal' },
        ],
        
        getTitulo() {
            let titulo = this.titulos[0].titulo;
            for (const t of this.titulos) {
                if (this.nivel >= t.min) titulo = t.titulo;
            }
            return titulo;
        },
        
        getExpProximo() {
            return Math.floor(100 * Math.pow(1.2, this.nivel - 1));
        },
        
        getHpMax() {
            return this.maxHp + Math.floor(this.nivel * 6);
        },
        
        getMpMax() {
            return this.maxMp + Math.floor(this.nivel * 4);
        },
        
        getSmMax() {
            return this.maxSm + Math.floor(this.nivel * 3);
        },
        
        getAtaque() {
            return this.atk + Math.floor(this.nivel * 1.5);
        },
        
        getDefesa() {
            return this.def + Math.floor(this.nivel * 1.2);
        },
        
        getMagia() {
            return this.mag + Math.floor(this.nivel * 1.0);
        }
    };

    // ============================================================
    // MERCADO - DEFINIÇÃO DOS ITENS
    // ============================================================
    const ITENS_MERCADO = [
        { id: 'sementes', nome: 'Sementes', emoji: '🌰', descricao: 'Plante no milharal', precoBase: 5, precoAtual: 5, variacao: 0, qtdDisponivel: 100, qtdMaxima: 200 },
        { id: 'milho', nome: 'Milho', emoji: '🌽', descricao: 'Colheita do milharal', precoBase: 8, precoAtual: 8, variacao: 0, qtdDisponivel: 80, qtdMaxima: 150 },
        { id: 'ovos', nome: 'Ovos', emoji: '🥚', descricao: 'Produzidos por galinhas', precoBase: 3, precoAtual: 3, variacao: 0, qtdDisponivel: 120, qtdMaxima: 200 },
        { id: 'galinhas', nome: 'Galinhas', emoji: '🐔', descricao: 'Produzem ovos', precoBase: 25, precoAtual: 25, variacao: 0, qtdDisponivel: 30, qtdMaxima: 60 },
        { id: 'madeira', nome: 'Madeira', emoji: '🪵', descricao: 'Recurso básico', precoBase: 10, precoAtual: 10, variacao: 0, qtdDisponivel: 150, qtdMaxima: 300 },
        { id: 'pedra', nome: 'Pedra', emoji: '🪨', descricao: 'Recurso básico', precoBase: 15, precoAtual: 15, variacao: 0, qtdDisponivel: 120, qtdMaxima: 250 },
        { id: 'ouro', nome: 'Ouro', emoji: '💎', descricao: 'Recurso valioso', precoBase: 50, precoAtual: 50, variacao: 0, qtdDisponivel: 40, qtdMaxima: 100 },
        { id: 'pocao', nome: 'Poção', emoji: '🧪', descricao: 'Item mágico', precoBase: 25, precoAtual: 25, variacao: 0, qtdDisponivel: 60, qtdMaxima: 120 },
        { id: 'balde', nome: 'Balde', emoji: '🪣', descricao: 'Útil para carregar líquidos', precoBase: 12, precoAtual: 12, variacao: 0, qtdDisponivel: 80, qtdMaxima: 150 }
    ];

    // ============================================================
    // ESTADO DO JOGADOR - INVENTÁRIO
    // ============================================================
    let inventario = {};

    function initInventario() {
        inventario = {};
        ITENS_MERCADO.forEach(item => {
            inventario[item.id] = 0;
        });
    }
    initInventario();

    let saldo = 0.00;

    // ============================================================
    // DOM REFS
    // ============================================================
    const marketGrid = document.getElementById('marketGrid');
    const inventoryGrid = document.getElementById('inventoryGrid');
    const marketSaldo = document.getElementById('marketSaldo');
    const headerSaldo = document.getElementById('headerSaldo');
    const userBalanceDisplay = document.getElementById('userBalanceDisplay');

    // ============================================================
    // FUNÇÕES AUXILIARES
    // ============================================================
    function formatSaldo(valor) {
        return Number(valor).toFixed(2).replace('.', ',');
    }

    function getSaldoTotal() {
        return saldo || 0;
    }

    function atualizarSaldoGlobal() {
        const total = getSaldoTotal();
        if (headerSaldo) headerSaldo.textContent = formatSaldo(total);
        if (marketSaldo) marketSaldo.textContent = `R$ ${formatSaldo(total)}`;
        if (userBalanceDisplay) userBalanceDisplay.textContent = `💰 R$ ${formatSaldo(total)}`;
    }

    function showToast(text, duration = 2200) {
        const toastEl = document.getElementById('toast');
        if (toastTimeout) {
            clearTimeout(toastTimeout);
            toastEl.classList.remove('show');
        }
        toastEl.textContent = text;
        toastEl.classList.add('show');
        toastTimeout = setTimeout(() => {
            toastEl.classList.remove('show');
            toastTimeout = null;
        }, duration);
    }

    // ============================================================
    // ATUALIZAR UI DO PERSONAGEM
    // ============================================================
    function atualizarUIPersonagem() {
        const expProx = personagem.getExpProximo();
        const pct = (personagem.experiencia / expProx) * 100;

        document.getElementById('lwNivel').textContent = personagem.nivel;
        document.getElementById('lwTitulo').textContent = personagem.getTitulo();
        document.getElementById('lwExpFill').style.width = Math.min(pct, 100) + '%';
        document.getElementById('lwExpAtual').textContent = personagem.experiencia;
        document.getElementById('lwExpProx').textContent = expProx;

        document.getElementById('lwHp').textContent = `${personagem.hp}/${personagem.getHpMax()}`;
        document.getElementById('lwMp').textContent = `${personagem.mp}/${personagem.getMpMax()}`;
        document.getElementById('lwSm').textContent = `${personagem.sm}/${personagem.getSmMax()}`;
        document.getElementById('lwAtk').textContent = personagem.getAtaque();
        document.getElementById('lwDef').textContent = personagem.getDefesa();
        document.getElementById('lwMag').textContent = personagem.getMagia();
    }

    // ============================================================
    // AÇÕES DO PERSONAGEM
    // ============================================================
    function treinar() {
        if (personagem.sm < 10) {
            showToast('⚡ Stamina insuficiente! Descanse.', 2000);
            return false;
        }

        personagem.sm -= 10;

        const ganhoBase = 15 + Math.floor(personagem.nivel * 2);
        const variacao = Math.floor(Math.random() * 15);
        const ganho = ganhoBase + variacao;

        personagem.experiencia += ganho;

        let subiu = false;
        const expProx = personagem.getExpProximo();

        while (personagem.experiencia >= expProx) {
            personagem.experiencia -= expProx;
            personagem.nivel++;
            subiu = true;

            personagem.hp = personagem.getHpMax();
            personagem.mp = personagem.getMpMax();
            personagem.sm = personagem.getSmMax();

            showToast(`🎉 SUBIU PARA NÍVEL ${personagem.nivel}!`, 3000);
        }

        atualizarUIPersonagem();
        atualizarSaldoGlobal();

        if (!subiu) {
            showToast(`💪 Treinou! +${ganho} EXP (${personagem.experiencia}/${personagem.getExpProximo()})`, 2000);
        }

        salvarDadosDoJogador();
        return true;
    }

    function descansar() {
        const hpRestaurado = Math.floor(personagem.getHpMax() * 0.4);
        const mpRestaurado = Math.floor(personagem.getMpMax() * 0.35);
        const smRestaurado = Math.floor(personagem.getSmMax() * 0.5);

        personagem.hp = Math.min(personagem.getHpMax(), personagem.hp + hpRestaurado);
        personagem.mp = Math.min(personagem.getMpMax(), personagem.mp + mpRestaurado);
        personagem.sm = Math.min(personagem.getSmMax(), personagem.sm + smRestaurado);

        atualizarUIPersonagem();
        showToast(`🛌 Descansou! +${hpRestaurado} HP, +${mpRestaurado} MP, +${smRestaurado} SM`, 2000);
        salvarDadosDoJogador();
        return true;
    }

    // ============================================================
    // STATUS UI
    // ============================================================
    function atualizarStatusSupabase(online, texto) {
        const dot = document.getElementById('supabaseDot');
        const status = document.getElementById('supabaseStatus');
        if (dot) {
            dot.className = 'dot ' + (online ? 'online' : 'offline');
        }
        if (status) {
            status.className = 'value ' + (online ? 'online' : 'offline');
            status.textContent = texto;
        }
        supabaseOnline = online;
    }

    // ============================================================
    // VERIFICAÇÃO DE CONEXÃO
    // ============================================================
    async function verificarSupabase() {
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABELA}?select=id&limit=1`, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });
            if (response.ok) {
                supabaseOnline = true;
                atualizarStatusSupabase(true, 'Online');
                return true;
            } else {
                supabaseOnline = false;
                atualizarStatusSupabase(false, `Erro ${response.status}`);
                return false;
            }
        } catch (error) {
            supabaseOnline = false;
            atualizarStatusSupabase(false, 'Falha');
            return false;
        }
    }

    // ============================================================
    // AUTENTICAÇÃO
    // ============================================================
    function carregarUsuario() {
        try {
            const data = localStorage.getItem('usuario_logado');
            if (data) {
                usuarioLogado = JSON.parse(data);
                return true;
            }
        } catch (e) {
            console.error(e);
        }
        return false;
    }

    function salvarUsuarioLocal(usuario) {
        try {
            localStorage.setItem('usuario_logado', JSON.stringify(usuario));
            usuarioLogado = usuario;
        } catch (e) {
            console.error(e);
        }
    }

    function atualizarInterfaceUsuario() {
        const avatarEl = document.getElementById('userAvatar');
        const nomeEl = document.getElementById('userName');

        if (usuarioLogado && usuarioLogado.login) {
            const nome = usuarioLogado.nome || usuarioLogado.login;
            const inicial = nome.charAt(0).toUpperCase();
            if (avatarEl) avatarEl.textContent = inicial;
            if (nomeEl) nomeEl.textContent = nome;
        } else {
            if (avatarEl) avatarEl.textContent = '?';
            if (nomeEl) nomeEl.textContent = 'Visitante';
        }
        atualizarSaldoGlobal();
    }

    // ============================================================
    // LOGIN MODAL
    // ============================================================
    function mostrarLogin() {
        const modal = document.getElementById('loginModal');
        if (modal) modal.classList.add('show');
    }

    function esconderLogin() {
        const modal = document.getElementById('loginModal');
        if (modal) modal.classList.remove('show');
    }

    // ============================================================
    // AUTENTICAÇÃO COM SUPABASE
    // ============================================================
    async function autenticarUsuario(login, senha, criar = false) {
        const url = criar ?
            `${SUPABASE_URL}/rest/v1/${TABELA}` :
            `${SUPABASE_URL}/rest/v1/${TABELA}?login=eq.${encodeURIComponent(login)}`;

        const options = {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        };

        if (criar) {
            options.method = 'POST';
            options.headers['Content-Type'] = 'application/json';
            
            const invInicial = {};
            ITENS_MERCADO.forEach(item => {
                invInicial[item.id] = 0;
            });
            
            options.body = JSON.stringify({
                login: login,
                nome: login,
                senha: senha,
                saldo: 50.00,
                seeds: 0,
                btc: 0,
                poder_hash: 1.0,
                hp: 100,
                max_hp: 100,
                mp: 50,
                max_mp: 50,
                sm: 100,
                max_sm: 100,
                atk: 15,
                def: 10,
                mag: 8,
                nivel: 1,
                experiencia: 0,
                exp_next: 100,
                itens: [],
                carteira: {
                    'Madeira': 0,
                    'Pedra': 0,
                    'Ouro': 0,
                    'Poção': 0,
                    'Balde': 0
                },
                fazendinha_dados: {
                    inventario: invInicial,
                    plantio: { active: false, stage: 0, progress: 0 },
                    incubacao: { active: false, stage: 0, progress: 0 },
                    saldo: 50.00
                }
            });
        }

        try {
            const response = await fetch(url, options);

            if (!response.ok) {
                if (criar) {
                    if (response.status === 409) {
                        document.getElementById('loginError').textContent = '❌ Usuário já existe!';
                        return false;
                    }
                }
                document.getElementById('loginError').textContent = `❌ Erro ${response.status}`;
                return false;
            }

            if (criar) {
                document.getElementById('loginError').textContent = '✅ Conta criada! Faça login.';
                return false;
            }

            const data = await response.json();
            if (!data || data.length === 0) {
                document.getElementById('loginError').textContent = '❌ Usuário não encontrado';
                return false;
            }

            const usuario = data[0];
            if (usuario.senha !== senha) {
                document.getElementById('loginError').textContent = '❌ Senha incorreta';
                return false;
            }

            salvarUsuarioLocal({ login: usuario.login, nome: usuario.nome || usuario.login });
            document.getElementById('loginError').textContent = '';
            esconderLogin();
            atualizarInterfaceUsuario();
            await carregarDadosDoJogador();
            showToast(`👋 Bem-vindo, ${usuario.nome || usuario.login}!`, 2500);
            return true;

        } catch (error) {
            document.getElementById('loginError').textContent = '❌ Erro de conexão';
            console.error('Erro autenticação:', error);
            return false;
        }
    }

    // ============================================================
    // CARREGAR DADOS DO JOGADOR (integrado com personagem)
    // ============================================================
    async function carregarDadosDoJogador() {
        if (!usuarioLogado) return;

        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/${TABELA}?login=eq.${encodeURIComponent(usuarioLogado.login)}`, {
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`
                    }
                }
            );

            if (!response.ok) throw new Error(`Erro ao carregar: ${response.status}`);

            const data = await response.json();
            if (!data || data.length === 0) return;

            dadosCompletos = data[0];
            console.log('📥 Dados carregados:', dadosCompletos);

            // ============================================================
            // CARREGAR SALDO
            // ============================================================
            saldo = Number(dadosCompletos.saldo ?? 50.00);

            // ============================================================
            // CARREGAR DADOS DO PERSONAGEM
            // ============================================================
            personagem.nivel = dadosCompletos.nivel || 1;
            personagem.experiencia = Number(dadosCompletos.experiencia) || 0;
            personagem.expProximo = Number(dadosCompletos.exp_next) || 100;
            personagem.hp = Number(dadosCompletos.hp) || 100;
            personagem.maxHp = Number(dadosCompletos.max_hp) || 100;
            personagem.mp = Number(dadosCompletos.mp) || 50;
            personagem.maxMp = Number(dadosCompletos.max_mp) || 50;
            personagem.sm = Number(dadosCompletos.sm) || 100;
            personagem.maxSm = Number(dadosCompletos.max_sm) || 100;
            personagem.atk = Number(dadosCompletos.atk) || 15;
            personagem.def = Number(dadosCompletos.def) || 10;
            personagem.mag = Number(dadosCompletos.mag) || 8;
            personagem.btc = Number(dadosCompletos.btc) || 0;
            personagem.poderHash = Number(dadosCompletos.poder_hash) || 1.0;
            personagem.itens = dadosCompletos.itens || [];

            // ============================================================
            // CARREGAR INVENTÁRIO
            // ============================================================
            initInventario();

            if (dadosCompletos.fazendinha_dados && dadosCompletos.fazendinha_dados.inventario) {
                const inv = dadosCompletos.fazendinha_dados.inventario;
                ITENS_MERCADO.forEach(item => {
                    if (inv[item.id] !== undefined) {
                        inventario[item.id] = Number(inv[item.id]) || 0;
                    }
                });
                console.log('📦 Inventário carregado de fazendinha_dados.inventario');
            } else {
                if (dadosCompletos.seeds !== undefined) {
                    inventario.sementes = Number(dadosCompletos.seeds) || 0;
                }

                if (dadosCompletos.carteira) {
                    const carteira = dadosCompletos.carteira;
                    const mapCarteira = {
                        'Madeira': 'madeira',
                        'Pedra': 'pedra',
                        'Ouro': 'ouro',
                        'Poção': 'pocao',
                        'Balde': 'balde'
                    };
                    Object.keys(mapCarteira).forEach(key => {
                        if (carteira[key] !== undefined) {
                            inventario[mapCarteira[key]] = Number(carteira[key]) || 0;
                        }
                    });
                }
                console.log('📦 Inventário carregado de seeds + carteira (fallback)');
            }

            // ============================================================
            // ATUALIZAR UI
            // ============================================================
            atualizarUIPersonagem();
            atualizarSaldoGlobal();
            renderizarMercado();
            renderizarInventario();

        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
            showToast('❌ Erro ao carregar dados: ' + error.message, 3000);
        }
    }

    // ============================================================
    // SALVAR DADOS DO JOGADOR (integrado com personagem)
    // ============================================================
    async function salvarDadosDoJogador() {
        if (!usuarioLogado || !supabaseOnline) {
            console.warn('⚠️ Não é possível salvar: usuário não logado ou offline');
            return;
        }
        if (salvando) {
            console.log('⏳ Salvamento em andamento, ignorando...');
            return;
        }
        salvando = true;

        try {
            const responseGet = await fetch(
                `${SUPABASE_URL}/rest/v1/${TABELA}?login=eq.${encodeURIComponent(usuarioLogado.login)}`, {
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`
                    }
                }
            );

            let dadosAtuais = {};
            if (responseGet.ok) {
                const data = await responseGet.json();
                if (data && data.length > 0) {
                    dadosAtuais = data[0];
                }
            }

            // Carteira
            const carteira = {
                'Madeira': inventario.madeira || 0,
                'Pedra': inventario.pedra || 0,
                'Ouro': inventario.ouro || 0,
                'Poção': inventario.pocao || 0,
                'Balde': inventario.balde || 0
            };

            // Inventário completo
            const inventarioCompleto = {};
            ITENS_MERCADO.forEach(item => {
                inventarioCompleto[item.id] = inventario[item.id] || 0;
            });

            const plantioAtual = dadosAtuais.fazendinha_dados?.plantio || { active: false, stage: 0, progress: 0 };
            const incubacaoAtual = dadosAtuais.fazendinha_dados?.incubacao || { active: false, stage: 0, progress: 0 };

            const fazendinhaDados = {
                inventario: inventarioCompleto,
                plantio: plantioAtual,
                incubacao: incubacaoAtual,
                saldo: saldo
            };

            const payload = {
                saldo: Number(saldo).toFixed(2),
                seeds: inventario.sementes || 0,
                carteira: carteira,
                fazendinha_dados: fazendinhaDados,
                // Dados do personagem
                nivel: personagem.nivel,
                experiencia: personagem.experiencia,
                exp_next: personagem.getExpProximo(),
                hp: personagem.hp,
                max_hp: personagem.getHpMax(),
                mp: personagem.mp,
                max_mp: personagem.getMpMax(),
                sm: personagem.sm,
                max_sm: personagem.getSmMax(),
                atk: personagem.atk,
                def: personagem.def,
                mag: personagem.mag,
                btc: personagem.btc,
                poder_hash: personagem.poderHash,
                itens: personagem.itens,
                updated_at: new Date().toISOString()
            };

            console.log('💾 Salvando dados:', payload);

            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/${TABELA}?login=eq.${encodeURIComponent(usuarioLogado.login)}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`
                    },
                    body: JSON.stringify(payload)
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Erro ao salvar:', response.status, errorText);
                throw new Error(`Erro ao salvar: ${response.status}`);
            }

            console.log('✅ Dados salvos com sucesso!');

        } catch (error) {
            console.error('❌ Erro ao salvar:', error);
            showToast('❌ Erro ao salvar: ' + error.message, 3000);
        } finally {
            salvando = false;
        }
    }

    // ============================================================
    // FUNÇÕES DO MERCADO
    // ============================================================
    function gerarPrecos() {
        ITENS_MERCADO.forEach(item => {
            const variacao = (Math.random() - 0.5) * 0.4;
            item.variacao = variacao;
            item.precoAtual = Math.max(0.5, item.precoBase * (1 + variacao));
            item.precoAtual = Math.round(item.precoAtual * 100) / 100;
        });
    }

    function renderizarMercado() {
        let html = '';
        ITENS_MERCADO.forEach(item => {
            const qtd = inventario[item.id] || 0;
            const preco = item.precoAtual.toFixed(2);
            const variacaoClass = item.variacao > 0 ? 'color:var(--neon-green);' : (item.variacao < 0 ?
                'color:#ef4444;' : 'color:var(--text-muted);');
            const variacaoText = item.variacao > 0 ? `+${(item.variacao * 100).toFixed(1)}%` : (item
                .variacao < 0 ? `${(item.variacao * 100).toFixed(1)}%` : '0%');

            html += `
                <div class="market-item">
                    <div class="item-header">
                        <span class="item-icon">${item.emoji}</span>
                        <div>
                            <div class="item-name">${item.nome}</div>
                            <div class="item-sub">${item.descricao}</div>
                        </div>
                    </div>
                    <div class="item-price">
                        R$ ${preco} <span>cada</span>
                        <span style="font-size:0.7rem; ${variacaoClass}">(${variacaoText})</span>
                    </div>
                    <div class="item-stock">
                        Você tem: <strong>${qtd}</strong> | Mercado: ${item.qtdDisponivel} disponíveis
                    </div>
                    <div class="item-actions">
                        <div class="qty-group">
                            <input type="number" class="qty-input" id="qty_${item.id}" value="1" min="1" max="99">
                        </div>
                        <button class="btn btn-buy" id="buy_${item.id}" onclick="window.comprarItem('${item.id}')">
                            <i class="fas fa-shopping-cart"></i> Comprar
                        </button>
                        <button class="btn btn-sell" id="sell_${item.id}" onclick="window.venderItem('${item.id}')" ${qtd <= 0 ? 'disabled' : ''}>
                            <i class="fas fa-coins"></i> Vender
                        </button>
                    </div>
                </div>
            `;
        });
        marketGrid.innerHTML = html;
    }

    function renderizarInventario() {
        let html = '';
        let temItem = false;
        
        ITENS_MERCADO.forEach(item => {
            const qtd = inventario[item.id] || 0;
            if (qtd > 0) {
                temItem = true;
                html += `
                    <span class="inv-item">
                        ${item.emoji} ${item.nome}: <span class="qty">${qtd}</span>
                    </span>
                `;
            }
        });

        if (!temItem) {
            html = '<span style="color:var(--text-muted); font-size:0.8rem;">📭 Nenhum item no estoque</span>';
        }

        inventoryGrid.innerHTML = html;
    }

    // ============================================================
    // COMPRAR E VENDER
    // ============================================================
    window.comprarItem = async function(itemId) {
        if (!usuarioLogado) {
            showToast('👤 Faça login para comprar!', 2000);
            return;
        }

        if (!supabaseOnline) {
            showToast('⚠️ Sem conexão com o banco de dados!', 2000);
            return;
        }

        const item = ITENS_MERCADO.find(i => i.id === itemId);
        if (!item) return;

        const qtyInput = document.getElementById(`qty_${itemId}`);
        const qty = parseInt(qtyInput.value) || 1;
        if (qty <= 0) {
            showToast('⚠️ Quantidade inválida', 1500);
            return;
        }

        const custo = item.precoAtual * qty;

        if (saldo < custo) {
            showToast(`😅 Saldo insuficiente! Precisa de R$ ${formatSaldo(custo)}`, 2000);
            return;
        }

        if (item.qtdDisponivel < qty) {
            showToast(`😅 Mercado tem apenas ${item.qtdDisponivel} disponíveis`, 2000);
            return;
        }

        saldo -= custo;
        saldo = Math.round(saldo * 100) / 100;
        item.qtdDisponivel -= qty;
        inventario[itemId] = (inventario[itemId] || 0) + qty;

        // Ganha EXP ao comprar (comércio)
        const expGanha = Math.floor(qty * 2);
        personagem.experiencia += expGanha;
        let subiu = false;
        while (personagem.experiencia >= personagem.getExpProximo()) {
            personagem.experiencia -= personagem.getExpProximo();
            personagem.nivel++;
            subiu = true;
            personagem.hp = personagem.getHpMax();
            personagem.mp = personagem.getMpMax();
            personagem.sm = personagem.getSmMax();
            showToast(`🎉 SUBIU PARA NÍVEL ${personagem.nivel}!`, 3000);
        }

        showToast(`✅ Comprou ${qty} ${item.nome} por R$ ${formatSaldo(custo)} +${expGanha} EXP`, 2000);

        atualizarUIPersonagem();
        atualizarSaldoGlobal();
        renderizarMercado();
        renderizarInventario();
        await salvarDadosDoJogador();
    };

    window.venderItem = async function(itemId) {
        if (!usuarioLogado) {
            showToast('👤 Faça login para vender!', 2000);
            return;
        }

        if (!supabaseOnline) {
            showToast('⚠️ Sem conexão com o banco de dados!', 2000);
            return;
        }

        const item = ITENS_MERCADO.find(i => i.id === itemId);
        if (!item) return;

        const qtyInput = document.getElementById(`qty_${itemId}`);
        const qty = parseInt(qtyInput.value) || 1;
        if (qty <= 0) {
            showToast('⚠️ Quantidade inválida', 1500);
            return;
        }

        const qtdAtual = inventario[itemId] || 0;
        if (qtdAtual < qty) {
            showToast(`😅 Você tem apenas ${qtdAtual} ${item.nome}`, 2000);
            return;
        }

        const precoVenda = item.precoAtual * 0.7;
        const total = precoVenda * qty;

        saldo += total;
        saldo = Math.round(saldo * 100) / 100;
        inventario[itemId] = qtdAtual - qty;
        item.qtdDisponivel += qty;

        // Ganha EXP ao vender (comércio)
        const expGanha = Math.floor(qty * 1.5);
        personagem.experiencia += expGanha;
        let subiu = false;
        while (personagem.experiencia >= personagem.getExpProximo()) {
            personagem.experiencia -= personagem.getExpProximo();
            personagem.nivel++;
            subiu = true;
            personagem.hp = personagem.getHpMax();
            personagem.mp = personagem.getMpMax();
            personagem.sm = personagem.getSmMax();
            showToast(`🎉 SUBIU PARA NÍVEL ${personagem.nivel}!`, 3000);
        }

        showToast(`💰 Vendeu ${qty} ${item.nome} por R$ ${formatSaldo(total)} +${expGanha} EXP`, 2000);

        atualizarUIPersonagem();
        atualizarSaldoGlobal();
        renderizarMercado();
        renderizarInventario();
        await salvarDadosDoJogador();
    };

    // ============================================================
    // EVENTOS
    // ============================================================
    document.addEventListener('DOMContentLoaded', function() {
        // Botões rápidos do personagem
        document.getElementById('btnTreinarQuick')?.addEventListener('click', treinar);
        document.getElementById('btnDescansarQuick')?.addEventListener('click', descansar);

        // Login Modal events
        const loginBtn = document.getElementById('btnLogin');
        const registerBtn = document.getElementById('btnRegister');
        const guestBtn = document.getElementById('btnGuest');
        const loginUser = document.getElementById('loginUser');
        const loginPass = document.getElementById('loginPass');

        if (loginBtn) {
            loginBtn.addEventListener('click', async function() {
                const user = loginUser.value.trim();
                const pass = loginPass.value.trim();
                if (!user || !pass) {
                    document.getElementById('loginError').textContent = '⚠️ Preencha usuário e senha';
                    return;
                }
                loginBtn.disabled = true;
                loginBtn.textContent = '⏳ Entrando...';
                await autenticarUsuario(user, pass, false);
                loginBtn.disabled = false;
                loginBtn.textContent = 'Entrar';
            });
        }

        if (registerBtn) {
            registerBtn.addEventListener('click', async function() {
                const user = loginUser.value.trim();
                const pass = loginPass.value.trim();
                if (!user || !pass) {
                    document.getElementById('loginError').textContent = '⚠️ Preencha usuário e senha';
                    return;
                }
                if (pass.length < 4) {
                    document.getElementById('loginError').textContent =
                        '⚠️ Senha deve ter pelo menos 4 caracteres';
                    return;
                }
                registerBtn.disabled = true;
                registerBtn.textContent = '⏳ Criando...';
                await autenticarUsuario(user, pass, true);
                registerBtn.disabled = false;
                registerBtn.textContent = 'Criar conta';
            });
        }

        if (guestBtn) {
            guestBtn.addEventListener('click', function() {
                esconderLogin();
                showToast('👤 Modo visitante - dados não serão salvos.', 3000);
                initInventario();
                saldo = 50.00;
                // Reset personagem para visitante
                personagem.nivel = 1;
                personagem.experiencia = 0;
                personagem.hp = 100;
                personagem.maxHp = 100;
                personagem.mp = 50;
                personagem.maxMp = 50;
                personagem.sm = 100;
                personagem.maxSm = 100;
                personagem.atk = 15;
                personagem.def = 10;
                personagem.mag = 8;
                atualizarInterfaceUsuario();
                atualizarUIPersonagem();
                gerarPrecos();
                renderizarMercado();
                renderizarInventario();
            });
        }

        // Reconnect button
        document.getElementById('btnReconnectSupabase')?.addEventListener('click', function() {
            verificarSupabase();
            showToast('🔄 Verificando conexão com Supabase...', 1500);
        });

        // Enter key support
        if (loginUser) {
            loginUser.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') loginPass.focus();
            });
        }
        if (loginPass) {
            loginPass.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') loginBtn.click();
            });
        }

        if (!usuarioLogado && loginUser) {
            setTimeout(() => loginUser.focus(), 500);
        }
    });

    // ============================================================
    // INICIALIZAÇÃO
    // ============================================================
    verificarSupabase();
    carregarUsuario();
    gerarPrecos();
    renderizarMercado();
    renderizarInventario();
    atualizarInterfaceUsuario();
    atualizarUIPersonagem();

    if (usuarioLogado) {
        esconderLogin();
        setTimeout(() => {
            if (supabaseOnline) {
                carregarDadosDoJogador();
            } else {
                showToast('⚠️ Sem conexão com o banco. Dados locais carregados.', 3000);
            }
        }, 600);
        showToast(`👋 Olá, ${usuarioLogado.nome || usuarioLogado.login}!`, 2500);
    } else {
        mostrarLogin();
        setTimeout(() => showToast('👤 Faça login para comprar e vender.', 3000), 800);
    }

    // Atualizar preços a cada 60 segundos
    setInterval(() => {
        gerarPrecos();
        renderizarMercado();
    }, 60000);

    // Verificar Supabase a cada 30 segundos
    setInterval(() => verificarSupabase(), 30000);

    // Salvar dados automaticamente a cada 30 segundos
    setInterval(() => {
        if (usuarioLogado && supabaseOnline) {
            salvarDadosDoJogador();
        }
    }, 30000);

    // Salvar antes de fechar a página
    window.addEventListener('beforeunload', function() {
        if (usuarioLogado && supabaseOnline && !salvando) {
            salvarDadosDoJogador();
        }
    });

    console.log('🌾 Mercado de Plantas carregado - integrado com sistema de personagem!');

})();