// ============================================================
// shared/menu.js — Menu componentizado
// ============================================================

const LINKS = [
  { id: 'index',     href: './index.html',                       icon: 'fa-house',         label: 'Início' },
  { id: 'noticias',  href: './noticias.html',                    icon: 'fa-newspaper',     label: 'Notícias' },
  { id: 'ranking',   href: './jogos/ranking/ranking002.html',    icon: 'fa-trophy',        label: 'Classificações' },
  { id: 'eventos',   href: './eventos.html',                     icon: 'fa-calendar-days', label: 'Eventos' },
  { id: 'download',  href: './download.html',                    icon: 'fa-download',      label: 'Downloads' },
  { id: 'suporte',   href: './suporte.html',                     icon: 'fa-headset',       label: 'Suporte' },
  { id: 'loja',      href: './jogos/loja/loja.html',             icon: 'fa-cart-shopping', label: 'Loja' },
  { id: 'cadastro',  href: './cadastro.html',                    icon: 'fa-user-plus',     label: 'Cadastro' },
  { id: 'login',     href: './login.html',                       icon: 'fa-sign-in-alt',   label: 'Login' },
];

/**
 * Renderiza o menu dentro de um container
 * @param {string} containerId - ID do elemento onde o menu será injetado
 * @param {string} paginaAtiva - ID da página atual (para destacar)
 */
export function renderMenu(containerId, paginaAtiva = '') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`[menu] Container #${containerId} não encontrado`);
    return;
  }

  const linksHtml = LINKS.map(link => `
    <li>
      <a href="${link.href}" class="${paginaAtiva === link.id ? 'active' : ''}">
        <i class="fas ${link.icon}"></i> ${link.label}
      </a>
    </li>
  `).join('');

  container.innerHTML = `
    <div class="menu-container">
      <nav class="navbar">
        <div class="logo">
          <i class="fas fa-cow"></i>
          MM<span>Quase Tudo</span>
        </div>

        <button class="menu-toggle" id="menuToggle" aria-label="Abrir menu">
          <i class="fas fa-bars"></i>
        </button>

        <ul class="nav-links" id="navLinks">
          ${linksHtml}
        </ul>

        <a href="https://discord.gg/ATtu4z9Ewt" class="btn-discord"
           target="_blank" rel="noopener">
          <i class="fab fa-discord"></i>
          <span>Jogue Agora</span>
        </a>
      </nav>
    </div>
  `;

  // Toggle mobile
  const toggleBtn = document.getElementById('menuToggle');
  const navLinks  = document.getElementById('navLinks');

  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navLinks.classList.toggle('active');
      const icon = toggleBtn.querySelector('i');
      icon.classList.toggle('fa-bars');
      icon.classList.toggle('fa-times');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 860) {
          navLinks.classList.remove('active');
          const icon = toggleBtn.querySelector('i');
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-times');
        }
      });
    });

    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 860 && navLinks.classList.contains('active')) {
        if (!navLinks.contains(e.target) && !toggleBtn.contains(e.target)) {
          navLinks.classList.remove('active');
          const icon = toggleBtn.querySelector('i');
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-times');
        }
      }
    });
  }
}