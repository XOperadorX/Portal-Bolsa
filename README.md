# Portal_Bolsa

![Versão](https://img.shields.io/badge/versão-1.1.0-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/status-ativo-success?style=for-the-badge)
![Plataforma](https://img.shields.io/badge/plataforma-Web%20%7C%20Android%20%7C%20iOS-orange?style=for-the-badge)
![Supabase](https://img.shields.io/badge/backend-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

**Versão Atual:** `1.1.0` · **Temporada:** 2026 · **Última atualização:** 12/10/2026

Plataforma **MM Quase Tudo** — Central de jogos, economia virtual e negociações entre jogadores, construída com **HTML/CSS/JS puro** e **Supabase** como backend.

---

## 📌 Versão Atual

| Item | Valor |
|---|---|
| **Versão** | `1.1.0` |
| **Codinome** | Temporada 2026 |
| **Lançamento** | 30/09/2026 |
| **Última atualização** | 12/10/2026 |
| **Status** | 🟢 Ativo |
| **Compatibilidade** | Web · Android 7.0+ · Windows 10+ |

---

## 📋 Visão Geral

O projeto é um portal web (também empacotável como app mobile via **Apache Cordova**) que oferece uma suíte de jogos e sistemas econômicos integrados, com autenticação, persistência de dados em tempo real e mecânicas de progressão.

---

## ✨ Novidades da Versão 1.1.0

### 🔐 Segurança
- **`config.js` corrigido** — agora importa `createClient` corretamente (antes estava quebrado)
- **`config.example.js`** — template público sincronizado
- **`.gitignore`** — proteção contra commit de chaves e dependências
- **Senhas com hash SHA-256 no admin** — `adm_cadastro.html` agora salva com hash (antes salvava em texto puro)

### 🏗️ Arquitetura
- **`config.js` centralizado** — `SIMB`, `TAXA_MUMU`, `TAXA_USDT`, `SUPABASE_URL`, `SUPABASE_KEY`
- **`shared/logger.js`** — logger que só loga em DEV (evita poluição em produção)
- **`shared/session.js`** — módulo único de sessão (já existente, agora oficial)
- **`shared/menu.js` + `shared/menu.css`** — menu componentizado
- **`shared/offline-regen.js` + `.css`** — regeneração offline unificada

### 🎨 UX / Interface
- **Símbolos de moeda padronizados**: **`S$`** (saldo), **`M$`** (MUMU), **`US$`** (USDT)
- **`.dashboard-header` centralizado** — funciona em qualquer resolução
- **Remoção do `dashboard copy.html`** — elimina duplicata antiga

### 🐛 Bugfixes
- **`index.html`** — anti-loop de redirecionamento (não trava mais)
- **`login.html`** — sessão só é salva **após** a regeneração offline
- **`admin.html`** — variável `supabaseDB` não sobrescreve mais `window.supabase`
- **`codex.html`** — removido import duplicado do Supabase
- **`dashboard.html`** — event delegation (não acumula listeners)
- **`trocap.html`** — fallback numérico (não mostra `NaN` mais)
- **`offline-regen.js`** — 5 correções críticas:
  1. Widget usa `#offlineRegenSlot` corretamente
  2. `onSmAumentada` persiste a limpeza do timer
  3. `_aplicarRegenOffline` persiste a limpeza
  4. `destroy()` limpa o toast órfão
  5. Método público `render()` adicionado

---

## 🗂️ Estrutura de Arquivos

### 📁 Raiz
| Arquivo | Descrição |
|---|---|
| `index.html` | Página inicial com redirecionamento automático (anti-loop). |
| `config.js` | ⚠️ **NÃO COMMITAR** — credenciais e constantes globais. |
| `config.example.js` | Template público para novos devs. |
| `.gitignore` | Ignora `config.js`, `node_modules/`, `platforms/`, etc. |
| `manifest.json` | PWA — nome corrigido para "MM Quase Tudo". |
| `package.json` | Dependências Cordova. |
| `config.xml` | Config Cordova (Android/iOS). |
| `jsconfig.json` | Config vazio. |
| `README.md` | Este documento. |

### 🔐 Autenticação
| Arquivo | Descrição |
|---|---|
| `login.html` | Login via RPC `login_usuario` + regen offline (corrigido). |
| `cadastro.html` | Cadastro com fingerprint de dispositivo. |
| `confirmar.html` | Confirmação de e-mail (Supabase Auth). |
| `esqueci-login.html` | Recuperar login por nome. |
| `esqueci-senha.html` | Redefinir senha (hash SHA-256). |

### 🏠 Públicas
| Arquivo | Descrição |
|---|---|
| `noticias.html` | Central de notícias (Supabase dinâmico). |
| `eventos.html` | Listagem de eventos/torneios. |
| `download.html` | Downloads APK/ZIP + status servidor. |
| `suporte.html` | Tickets + FAQ + painel admin. |
| `como-jogar.html` | Guia do jogador (imprimível). |

### 🎮 Área Logada
| Arquivo | Descrição |
|---|---|
| `dashboard.html` | Hub principal (event delegation + S$). |
| `codex.html` | Códice de equipamentos (sem dup CDN). |
| `diario.html` | Login diário — 30 dias. |
| `trocap.html` | TrocaSegura (com fallback NaN). |
| `saque.html` | 💎 **Carteira** — saque MUMU/USDT com realtime. |
| `testetet.html` | Visualizador de tickets. |

### 📁 `shared/`
| Arquivo | Descrição |
|---|---|
| `logger.js` | Logger centralizado (DEV vs PROD). |
| `session.js` | Sessão 24h — `salvarSessao`, `sessaoValida`, `obterUsuario`, `exigirSessao`. |
| `menu.js` | Componente de menu reutilizável. |
| `menu.css` | Estilos do menu. |
| `offline-regen.js` | Classe `OfflineRegen` (5 correções aplicadas). |
| `offline-regen.css` | Estilos do widget de regeneração. |

### 📁 `dados/admin/`
| Arquivo | Descrição |
|---|---|
| `admin.html` | Painel ADM principal (usa `supabaseDB`). |
| `adm_cadastro.html` | Cadastros (hash SHA-256). |
| `adm_suporte.html` | Suporte + Pix. |
| `adm_pix.html` | Gestão de saques Pix (legado). |
| `adm_saques.html` | 🆕 **Saques MUMU/USDT** (usa `config.js`). |
| `admin-bolsa.html` | Admin da Bolsa. |
| `admin-mercado.html` | Admin do Mercado. |
| `bolsa_admin.html` | Bolsa — painel detalhado. |
| `delete.html` | Realtime + Delete de usuários. |
| `sys.html` | Configurações do sistema. |
| `cadeado.html` | Sistema de cadeado (conta). |

### 📁 `jogos/`
18 jogos/minigames, incluindo: `planta`, `bolsa`, `torre`, `minerar`, `faz`, `ninos`, `shagrila`, `ponto`, `papelao`, `loja`, `mercado`, `mochila`, `mumu`, `troca`, `ranking`, `ranking002`, `perfil`.

---

## 🚀 Funcionalidades Principais

### 🔐 Autenticação e Sessão
- Login via RPC `login_usuario` (Supabase).
- Sessão local com expiração de **24 horas** (`localStorage`).
- Regeneração offline de HP/MP/Stamina ao fazer login (RPC `calcular_regen_offline`).
- Cadastro com **fingerprint de dispositivo** (Canvas + WebGL + fontes + hardware).
- **Sessão só é salva APÓS regen** — evita estados inconsistentes.

### 🎮 Central de Jogos
- Grid de jogos com **event delegation** (sem acúmulo de listeners).
- **Custo de entrada**: 50% da stamina atual (mínimo 10 SM).
- Sistema de **níveis** (1–100+), títulos, EXP, atributos.
- Regeneração offline: **2 SM/min**, **1 HP/min**, **1 MP/min** (máx. 24h).
- Log de atividades persistido em `Atividades`.
- **Saldo exibido com símbolo S$**.

### 💎 Carteira (Saque)
- **`saque.html`** — nova página dedicada.
- Saque em **MUMU** (S$ 100,00 = M$ 1,00) ou **USDT** (US$ 0,01 = S$ 10.000,00).
- Integração **tempo real** via Supabase Realtime.
- Chave MUMU (nick + servidor) ou carteira Solana.
- Histórico persistido em `historico_saques`.

### 📖 Codex
- Registro de ativos da bolsa (Ações, FIIs, ETFs, Tesouro).
- Bônus por raridade: Comum, Incomum, Raro, Épico, Lendário.
- Integração em tempo real via **Supabase Realtime**.

### 📅 Diário
- Ciclo de 30 dias com recompensas progressivas.
- Resgate diário com countdown de 24h.
- Persistência em `diario_dia`, `diario_dias_resgatados`, `diario_ultimo_resgate`.

### 🛡️ TrocaSegura
- Negociação entre jogadores com status `aguardando_pagamento` → `pagamento_confirmado` → `concluida` / `cancelada`.
- Código secreto de **6 dígitos** (hash SHA-256).
- Limite de **5 tentativas** de liberação.
- Fallback numérico no modal (não mostra `NaN`).

### 👑 Painel Admin
- **`adm_saques.html`** — aprova/recusa saques MUMU/USDT.
- Realtime — atualiza sozinho.
- Devolve saldo automaticamente ao recusar.
- Estatísticas: pendentes, pagos, recusados, total MUMU/USDT.

### 🎫 Suporte
- Abertura de tickets com categoria e prioridade.
- Histórico por login/email.
- Painel admin com visualização de todos os tickets.

---

## 🛠️ Stack Técnica

| Camada | Tecnologia |
|---|---|
| Frontend | HTML5, CSS3, JavaScript (ES Modules) |
| Backend | [Supabase](https://supabase.com/) (PostgreSQL + Realtime + Auth) |
| Ícones | Font Awesome 6.5.1 |
| Fontes | Inter, Orbitron, Rajdhani |
| Mobile | Apache Cordova (Android + iOS) |
| CDN | jsDelivr, esm.sh |

---

## 🗄️ Banco de Dados (Supabase)

**URL do projeto:** `https://xrcxvizzdumcxbylmkvn.supabase.co`

### Tabelas Principais

| Tabela | Uso |
|---|---|
| `Geral` | Dados dos jogadores (nível, atributos, saldo, BTC, itens, carteira, `pix_pendente`, `historico_saques`, `chave_pix`, `limite_saque`, `offline_regen_start`). |
| `Atividades` | Histórico de ações dos jogadores. |
| `Trocas` | Negociações do TrocaSegura. |
| `suporte_tickets` | Tickets de suporte. |
| `cargos` | Verificação de conexão. |
| `downloads` | Versões e URLs de download (opcional). |
| `noticias` | Notícias dinâmicas (opcional). |

### RPCs Utilizadas
- `criar_usuario(p_login, p_senha, p_fingerprint, p_mac, p_ip)`
- `login_usuario(p_login, p_senha)`
- `calcular_regen_offline(p_login)`
- `criar_troca(...)` · `confirmar_pagamento_troca(...)` · `validar_codigo_troca(...)` · `cancelar_troca(...)`
- `deletar_geral(p_id)`

### ⚠️ Campos sensíveis da tabela `Geral`
| Campo | Uso |
|---|---|
| `offline_regen_start` | Timestamp do início da regeneração offline |
| `pix_pendente` | JSONB com saque pendente |
| `historico_saques` | Array JSONB de saques (mumu + usdt) |
| `chave_pix` | JSONB com dados MUMU (`mumu_nick`, `mumu_servidor`) |
| `meta.solana_wallet` | Endereço Solana (USDT) |

---

## 📱 Build Mobile (Cordova)

```bash
# Instalar dependências
npm install

# Adicionar plataforma
cordova platform add android

# Build
cordova build android