/* ============================================================
   NAV UNIVERSAL — Injeção automática do menu em qualquer página
   Uso: <script src="./nav.js" data-base="./"></script>
============================================================ */
(function () {
  'use strict';

  // ============================================================
  // CONFIG — ajuste aqui se mover a pasta dos jogos
  // ============================================================
  const scriptTag = document.currentScript
    || document.querySelector('script[src$="nav.js"]');
  const BASE = (scriptTag?.getAttribute('data-base') || './').replace(/\/$/, '') + '/';

  const PAGINAS = {
    // 🏠 Voltar ao dashboard
    dashboard: BASE + 'dashboard.html',

    // 🏦 Banco Imobiliário
    bi:        BASE + 'jogos/bi/bi.html',
    adm_bi:    BASE + 'adm_bi.html',

    // Menu principal
    loja:      BASE + 'jogos/loja/loja.html',
    diario:    null, // abre modal via #btnAbrirDiario
    codex:     BASE + 'codex.html',
    combate:   BASE + 'combate.html',
    player:    BASE + 'player.html',
    mercado:   BASE + 'jogos/mercado/mercado.html',
    mochila:   BASE + 'jogos/mochila/mochila.html',
    mumu:      BASE + 'jogos/mumu/mumu.html',
    troca:     BASE + 'jogos/troca/troca.html',
    ranking:   BASE + 'jogos/ranking/ranking.html',
    perfil:    BASE + 'jogos/perfil/perfil.html',
    carteira:  BASE + 'saque.html',
    admin:     BASE + 'dados/admin/admin.html'
  };

  // ============================================================
  // HTML DO MENU
  // ============================================================
  const HTML_MENU = `
    <nav class="nav-universal" id="nav-universal">
      <div class="nav-buttons">

        <a href="${PAGINAS.dashboard}" class="btn-voltar">🏠 Voltar</a>


        <a href="${PAGINAS.loja}"     class="btn-bolsa btn-loja">🛒 Loja</a>
        <button type="button" class="btn-bolsa btn-diario" id="btnAbrirDiario">📅 DIÁRIO</button>
        <a href="${PAGINAS.combate}" class="btn-bolsa">⚔️ Dano e defesa</a>
        <a href="${PAGINAS.codex}"    class="btn-bolsa btn-codex">📖 CODEX</a>
        <a href="${PAGINAS.player}"   class="btn-bolsa btn-player">👶 Player</a>
        <a href="${PAGINAS.mercado}"  class="btn-bolsa btn-mercado">💰 Mercado</a>
        <a href="${PAGINAS.mochila}"  class="btn-bolsa btn-mochila">🎒 Mochila</a>
        <a href="${PAGINAS.mumu}"     class="btn-bolsa btn-mumu">💰 Troca MUMU</a>
        <a href="${PAGINAS.troca}"    class="btn-bolsa btn-troca">💰 Troca BTC</a>
        <a href="${PAGINAS.ranking}"  class="btn-bolsa btn-rank">🏆 Classificações</a>
        <a href="${PAGINAS.perfil}"   class="btn-bolsa btn-perfil">🏆 Perfil</a>

        <a href="${PAGINAS.carteira}" class="btn-bolsa btn-carteira">💎 Carteira</a>


        <a href="${PAGINAS.admin}" id="btnAdmin" class="btn-bolsa btn-admin"
           style="display:none;">
           👑 Admin
        </a>
      </div>
    </nav>
  `;

  // ============================================================
  // INJETA O MENU (logo após o <body>)
  // ============================================================
  function injetarMenu() {
    if (document.getElementById('nav-universal')) return;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = HTML_MENU.trim();
    const nav = wrapper.firstElementChild;
    // Páginas com navegação compacta mantêm Voltar e o acesso administrativo.
    if (scriptTag?.getAttribute('data-menu') === 'compacto') {
      nav.querySelectorAll('.btn-bolsa:not(.btn-admin)').forEach(botao => botao.remove());
    }

    // Insere como PRIMEIRO elemento do body
    if (document.body.firstChild) {
      document.body.insertBefore(nav, document.body.firstChild);
    } else {
      document.body.appendChild(nav);
    }
  }

  // ============================================================
  // BOTÃO SAIR
  // ============================================================
  function ligarSair() {
    document.addEventListener('click', (e) => {
      if (e.target && e.target.id === 'btnSair') {
        e.preventDefault();
        try {
          const chaves = [
            'usuario_logado', 'usuarioLogado', 'usuario',
            'user', 'login', 'session', 'session_timestamp',
            'email'
          ];
          chaves.forEach(k => localStorage.removeItem(k));
          sessionStorage.clear();
        } catch (_) {}
        window.location.href = BASE + 'index.html';
      }
    });
  }

  // ============================================================
  // BOTÃO ADMIN — só mostra se o usuário for admin
  // ============================================================
  async function verificarAdmin() {
    try {
      const btn = document.getElementById('btnAdmin');
      if (!btn) return;

      const login = localStorage.getItem('usuario_logado')
        || localStorage.getItem('usuarioLogado')
        || localStorage.getItem('user')
        || localStorage.getItem('login');
      if (!login) return;

      // Tenta importar config.js (se existir)
      const cfg = await import(BASE + 'config-module.js').catch(() => null);
      if (!cfg || !cfg.db) return;

      const { data } = await cfg.db
        .from(cfg.TABELA || 'Geral')
        .select('login, tipo, cargo_codigo, email')
        .eq('login', login)
        .maybeSingle();

      if (!data) return;

      const isAdmin =
        data.tipo === 'admin' ||
        data.cargo_codigo === 'admin' ||
        data.email === 'admin@admin.com' ||
        (data.login || '').toLowerCase() === 'admin';

      if (isAdmin) btn.style.display = 'inline-flex';
    } catch (err) {
      console.warn('[NAV] falha ao checar admin:', err);
    }
  }

  // ============================================================
  // BOTÃO DIÁRIO — dispara evento global
  // ============================================================
  function ligarDiario() {
    document.addEventListener('click', (e) => {
      if (e.target && e.target.id === 'btnAbrirDiario') {
        e.preventDefault();

        // Se a página tiver uma função pra abrir, chama
        if (typeof window.abrirDiario === 'function') {
          window.abrirDiario();
        } else {
          // Dispara evento pra qualquer listener
          window.dispatchEvent(new CustomEvent('abrirDiario'));
        }
      }
    });
  }

  // ============================================================
  // CARREGA CSS (se não estiver)
  // ============================================================
  function carregarCSS() {
    if (document.querySelector('link[href$="nav.css"]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = BASE + 'nav.css';
    document.head.appendChild(link);
  }

  // ============================================================
  // INIT
  // ============================================================
  function init() {
    carregarCSS();
    injetarMenu();
    ligarSair();
    ligarDiario();
    // Espera 1s pra dar tempo do config.js carregar
    setTimeout(verificarAdmin, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();