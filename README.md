# Portal_Bolsa

![Versão](https://img.shields.io/badge/versão-1.3.0-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/status-ativo-success?style=for-the-badge)
![Plataforma](https://img.shields.io/badge/plataforma-Web%20%7C%20Android%20%7C%20iOS-orange?style=for-the-badge)
![Supabase](https://img.shields.io/badge/backend-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

**Versão Atual:** `1.3.0` · **Temporada:** 2026 · **Última atualização:** 26/10/2026

Plataforma **MM Quase Tudo** — Central de jogos, economia virtual e negociações entre jogadores, construída com **HTML/CSS/JS puro** e **Supabase** como backend.

---

## 📌 Versão Atual

| Item | Valor |
|---|---|
| **Versão** | `1.3.0` |
| **Codinome** | Temporada 2026 |
| **Lançamento** | 30/09/2026 |
| **Última atualização** | 26/10/2026 |
| **Status** | 🟢 Ativo |
| **Compatibilidade** | Web · Android 7.0+ · Windows 10+ |

---

## 📋 Visão Geral

O projeto é um portal web (também empacotável como app mobile via **Apache Cordova**) que oferece uma suíte de jogos e sistemas econômicos integrados, com autenticação, persistência de dados em tempo real e mecânicas de progressão.

---

## ✨ Novidades da Versão 1.3.0 (26/10/2026)

### Combate compartilhado

- Motor de dano e defesa integrado em Shagrila, RPG Geral, Lyra Azure, Sandbox, Ninos, Torre e Gax.
- Cálculo de graus, esquiva, crítico, elementos, resistências, armadura, golpe duplo, espinhos, cura e regeneração com limites por atributo.
- Ficha de combate nas telas dos personagens e guia com simulador em [combate.html](combate.html).
- Padrões configuráveis em [shared/combate-config.js](shared/combate-config.js): fator 1 nos graus 1–2, aumentando a cada dois graus; ciclo fogo → ar → terra → água → fogo.
- Consulte [docs/combate.md](docs/combate.md) para fórmulas, integração e limitações. As cópias históricas em `Todos/` e `GeralZip/` mantêm suas fórmulas anteriores.

### Catálogo de Shangri-La Frontier em Shagrila

- 90 itens, incluindo os textos enviados e peças para os novos espaços de equipamento, com categorias, procedência, atributos, elementos e preços em S$.
- Equipar e retirar peças, oito receitas de forja, coleta com Piqueta e novos encontros com recompensas.
- Integração com mochila, mercado e motor compartilhado de combate.
- Consulte [o guia do catálogo](docs/shagrila-frontier.md) para efeitos adaptados, persistência e poderes mantidos como referência narrativa.

### Mercado, mochila, Codex e Pix

- Mercado com filtro por procedência, opção **Todos**, compra e venda em cartões compactos.
- Compra com acréscimo padrão de 50% e venda com desconto padrão de 50% sobre a referência; itens sem referência recebem valores definidos pelo catálogo.
- Mochila reúne inventário e equipamentos de Shagrila e identifica a procedência dos itens.
- Compras do Codex cobram acréscimo padrão de 40% e entram na carteira da Bolsa. Registros antigos são incorporados uma vez, sem nova cobrança.
- Pix: conversão padrão de **1.000 MUMU = R$ 0,01**, mínimo de 1.000 MUMU e taxa administrativa de 10%. Os parâmetros são configuráveis na central de taxas.
- A economia usa `S$` e `M$`; a conversão para reais fica na página Pix.

### Administração e conversas

- [Central de taxas](dados/admin/taxa.html) com 39 parâmetros, validação, histórico e controle de versão para publicação global.
- A central reaproveita a sessão existente. Publicar exige autorização administrativa no banco via Supabase Auth (`app_metadata.role = admin`); o perfil local não concede essa permissão.
- TrocaSegura usa o `config.js` central e verifica conexão e sessão sem ficar presa em “Verificando”.
- Chat iniciado ao informar o nick do comprador, com data/hora do servidor e consulta pelo [painel administrativo](dados/admin/chat.html).
- Histórico do chat cifrado e espelhado em `Geral.meta.chat_trocas`, com cópia em esquema privado. A consulta usa atualização periódica a cada quatro segundos.

### Dashboard e recuperação

- Acompanha atualizações do jogador na tabela `Geral` via Realtime, com consulta de segurança a cada dez segundos e ao retornar à aba.
- O painel observa os valores do banco; o contador não grava recuperação simulada.
- A barra de recuperação fica oculta quando `sm_atual` ultrapassa 10% da stamina máxima.

### Instalação dos recursos no banco

As mudanças no repositório não executam SQL no Supabase. Para ativar os recursos, siga os procedimentos abaixo no projeto correspondente:

| Recurso | Script e procedimento |
|---|---|
| Taxas globais | [instalar-taxas.sql](dados/admin/sql/instalar-taxas.sql) e [procedimentos](dados/admin/sql/README-taxas.md). Execute a versão atual para incluir os dois parâmetros novos sem substituir os valores já salvos. |
| Chat das trocas | [instalar-chat-trocas.sql](dados/admin/sql/instalar-chat-trocas.sql) e [procedimentos](dados/admin/sql/README-chat-trocas.md). Após instalar, entre novamente pelo `login.html` para obter a sessão do chat. |
| Realtime de `Geral` | [ativar-realtime-geral.sql](dados/admin/sql/ativar-realtime-geral.sql), somente se a tabela ainda não estiver na publicação. As políticas de acesso continuam necessárias. |

Quatro parâmetros de taxas dependem de integração nas funções existentes do servidor: `trocas_taxa` em `criar_troca`, `mineracao_mercado` e `mineracao_base` em `vender_poder`, e `mineracao_passiva` em `coletar_passiva`/`minerar_offline`. Permanecem bloqueados até essa integração. Use a [consulta de exportação](dados/admin/sql/exportar-funcoes-taxas.sql) para obter as definições reais antes de alterá-las.

A versão **1.3.0** identifica o código-fonte, o manifesto e a configuração Cordova. As versões dos arquivos disponíveis em `download.html` são independentes; atualizar estes metadados não recompila nem publica APKs.

---

## Histórico: novidades da Versão 1.2.0


### 🎮 Novo Sistema: Player Dashboard
- **`player.html`** — página dedicada ao jogador, com **Level Widget em tempo real**.
- **Stats com barra visual** — HP / Mana / Stamina com preenchimento dinâmico.
- **Stats simples** — Força, Defesa, Magia com bônus do Codex somados automaticamente.
- **16 conquistas dinâmicas** — desbloqueiam conforme nível/saldo/itens/cristais.
- **Level Up animation** — círculo do nível faz pop + toast dourado quando sobe de nível.
- **Pulse animado** — valores de saldo/poupança/proventos piscam ao mudar.
- **Tooltips informativos** — hover nos stats mostra descrição e bônus do Codex.
- **3 status de conexão** — Net / Supabase / Realtime.

### ⚡ Bolsa Unificada (Fonte Única de Verdade)
- **`fazendinha_dados.bolsa`** agora é a **fonte única** para os 4 mercados:
  - 📈 Ações (8 ativos padrão)
  - 🏢 FIIs (4 ativos padrão)
  - 📊 ETFs (3 ativos padrão)
  - 🇧🇷 Tesouro Direto (3 títulos padrão)
- **Auto-seed** — se a bolsa estiver vazia, é populada com 18 ativos ao abrir.
- **Auto-registro no Codex** — ao comprar um ativo, ele é automaticamente registrado.
- **Realtime bidirecional** — `bolsa.html` e `codex.html` sincronizam na hora.
- **Removido** `fazendinha_dados.bolsa_ativos` (chave antiga).

### 📈 Carteira Expandida (`bolsa.html`)
- **4 seções de mercado** completas (Ações, FIIs, ETFs, Tesouro).
- **Rendimento automático**:
  - Ações: proventos a cada **60s**
  - FIIs: a cada **30s**
  - ETFs: a cada **90s**
  - Tesouro: marcação a mercado a cada **120s** (sem proventos)
- **Poupança BAEP** — rende **0,6% a cada 60s**.
- **Variação de preços** — mercado flutua a cada 60s.
- **Extrato** — histórico das últimas 20 operações.
- **SELIC dinâmica** — indicador visual com estratégia (Comprar FIIs / Aguardar / Vender FIIs).

### 🏗️ Refatoração
- **`config-module.js` unificado** — exporta funções da bolsa:
  - `carregarBolsa(login)`, `salvarBolsa(login, bolsa)`
  - `registrarAtivoNoCodex(login, categoria, ativoId)`
  - `listarItensCodex(bolsa)`, `calcularResumoBonus(bolsa)`
  - `atualizarPrecoAtivo(login, categoria, ativoId, novoPreco)`
  - Constantes: `BOLSA_PADRAO`, `RARIDADE_MAP`, `BONUS_BASE`
- **`player.html` importa de `config-module.js`** — sem credenciais duplicadas.
- **`codex.html` e `bolsa.html` unificados** — ambos leem `fazendinha_dados.bolsa`.

### 🐛 Bugfixes
- **Codex não aparece mais vazio** — auto-seed garante 18 ativos na primeira carga.
- **Sincronização Codex ↔ Bolsa** — comprar um ativo registra ele automaticamente.
- **Bônus do Codex** — agora somados aos stats base no `player.html`.

---

## 📋 Histórico de Versões

### v1.1.0 (12/10/2026)

#### 🔐 Segurança
- **`config.js` centralizado** — carrega a chave pública e cria o cliente compartilhado.
- **`config-module.js`** — mantém as exportações do aplicativo para módulos ES.
- **`.gitignore`** — ignora dependências e arquivos locais de build.
- **Senhas com hash SHA-256 no admin** — `adm_cadastro.html`.

#### 🏗️ Arquitetura
- **Configuração centralizada** — `config.js` guarda a URL e a chave pública; `config-module.js` fornece as constantes e funções do aplicativo.
- **`shared/logger.js`** — logger que só loga em DEV.
- **`shared/session.js`** — sessão 24h.
- **`shared/menu.js` + `shared/menu.css`** — menu componentizado.
- **`shared/offline-regen.js` + `.css`** — regeneração offline unificada.

#### 🎨 UX / Interface
- **Símbolos de moeda padronizados**: **`S$`** (saldo), **`M$`** (MUMU), **`US$`** (USDT).
- **`.dashboard-header` centralizado**.
- **Remoção do `dashboard copy.html`**.

#### 🐛 Bugfixes
- `index.html` — anti-loop de redirecionamento.
- `login.html` — sessão só salva após regeneração offline.
- `admin.html` — variável `supabaseDB` não sobrescreve `window.supabase`.
- `codex.html` — removido import duplicado do Supabase.
- `dashboard.html` — event delegation.
- `trocap.html` — fallback numérico.
- `offline-regen.js` — 5 correções críticas.

---

## 🗂️ Estrutura de Arquivos

### 📁 Raiz
| Arquivo | Descrição |
|---|---|
| `index.html` | Página inicial com redirecionamento automático (anti-loop). |
| `config.js` | Configuração central do Supabase usada pelas páginas e scripts. |
| `config-module.js` | Exportações de configuração e funções consumidas pelos módulos ES. |
| `.gitignore` | Ignora `node_modules/`, `platforms/`, etc. |
| `manifest.json` | PWA — nome "MM Quase Tudo". |
| `package.json` | Dependências Cordova. |
| `config.xml` | Config Cordova (Android/iOS). |
| `jsconfig.json` | Config vazio. |
| `README.md` | Este documento. |

### 🔐 Autenticação
| Arquivo | Descrição |
|---|---|
| `login.html` | Login via `login_chat`, com fallback para `login_usuario` quando o chat não está instalado. |
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
| `player.html` | 🆕 **Dashboard do jogador** — level widget, conquistas, stats. |
| `codex.html` | Códice de equipamentos (unificado com bolsa). |
| `diario.html` | Login diário — 30 dias. |
| `jogos/mochila/trocap.html` | TrocaSegura com chat entre vendedor e comprador. |
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
| `admin.html` | Painel ADM principal. |
| `adm_cadastro.html` | Cadastros (hash SHA-256). |
| `adm_suporte.html` | Suporte + Pix. |
| `adm_pix.html` | Gestão de saques Pix (legado). |
| `adm_saques.html` | Saques MUMU/USDT. |
| `admin-bolsa.html` | Admin da Bolsa. |
| `admin-mercado.html` | Admin do Mercado. |
| `bolsa_admin.html` | Bolsa — painel detalhado. |
| `delete.html` | Realtime + Delete de usuários. |
| `sys.html` | Configurações do sistema. |
| `dados/cadeado/cadeado.html` | Tela ADM (campo legado `cadeado`). |

### 📁 `jogos/`
Entre os jogos e módulos disponíveis: `planta`, `bolsa`, `torre`, `minerar`, `faz`, `ninos`, `shagrila`, `ponto`, `papelao`, `loja`, `mercado`, `mochila`, `mumu`, `troca`, `ranking`, `ranking002`, `perfil`.

### 📁 `style/`
| Arquivo | Descrição |
|---|---|
| `bolsa.css` | 🆕 Estilos da Bolsa (4 seções, SELIC, poupança). |
| `player.css` | 🆕 Estilos do Player Dashboard (opcional — atualmente inline). |

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

### 🎯 Player Dashboard (`player.html`) 🆕
- **Level Widget em tempo real** — nível, EXP, barra animada com shine.
- **Stats com barra visual**:
  - ❤️ HP (muda de cor: verde > 60%, laranja > 30%, vermelho < 30%)
  - 💧 Mana
  - ⚡ Stamina
- **Stats simples**: ⚔️ Força · 🛡️ Defesa · 🔮 Magia
- **Bônus do Codex somados automaticamente** aos stats base.
- **16 conquistas dinâmicas** desbloqueáveis:
  - Por nível (Iniciante → Mítico)
  - Por saldo (Rico ≥ 1000, Magnata ≥ 5000)
  - Por itens (Investidor ≥ 5, Colecionador ≥ 15)
  - Por cartas (Comerciante ≥ 3 ativos)
- **Level Up animation** — círculo dourado + toast.
- **Pulse animado** quando valores mudam via realtime.
- **3 indicadores de conexão** — Net / Supabase / Realtime.

### 📈 Bolsa (`bolsa.html`) 🆕
- **4 mercados completos**:
  - 📈 Ações (proventos a cada 60s)
  - 🏢 FIIs (proventos a cada 30s)
  - 📊 ETFs (proventos a cada 90s)
  - 🇧🇷 Tesouro Direto (marcação a cada 120s, sem proventos)
- **Auto-seed** — 18 ativos padrão se a bolsa estiver vazia.
- **Auto-registro no Codex** ao comprar.
- **Poupança BAEP** — rende **0,6% a cada 60s**.
- **Variação de preços** — mercado flutua ±3% a cada 60s.
- **Extrato** — últimas 20 operações.
- **SELIC dinâmica** — indicador com estratégia.

### 📖 Codex (`codex.html`) 🆕
- **3 abas**:
  - 📈 Ativos da Bolsa (lê de `fazendinha_dados.bolsa`)
  - 📋 Itens Registrados (deriva da bolsa)
  - 🏆 Resumo de Bônus (soma de ATK/DEF/HP)
- **4 categorias**: Ações, FIIs, ETFs, Tesouro.
- **Registro no Codex** com bônus por raridade:
  - Raro: `+15 ATK / +10 DEF / +100 HP` (Ações)
  - Épico: `+30 ATK / +20 DEF / +250 HP` (FIIs/ETFs)
  - Lendário: `+50 ATK / +35 DEF / +500 HP` (Tesouro)
- **Integração em tempo real** via Supabase Realtime.

### 💎 Carteira (Saque)
- **`saque.html`** — página dedicada.
- Saque em **MUMU** (S$ 100,00 = M$ 1,00) ou **USDT** (US$ 0,01 = S$ 10.000,00).
- Integração **tempo real**.
- Chave MUMU (nick + servidor) ou carteira Solana.
- Histórico persistido em `historico_saques`.

### 📅 Diário
- Ciclo de 30 dias com recompensas progressivas.
- Resgate diário com countdown de 24h.
- Persistência em `diario_dia`, `diario_dias_resgatados`, `diario_ultimo_resgate`.

### 🛡️ TrocaSegura
- Negociação entre jogadores com status `aguardando_pagamento` → `pagamento_confirmado` → `concluida` / `cancelada`.
- Código secreto de **6 dígitos** (hash SHA-256).
- Limite de **5 tentativas** de liberação.

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

URL e chave pública do projeto são centralizadas em `config.js`.

### Tabelas Principais

| Tabela | Uso |
|---|---|
| `Geral` | Dados dos jogadores (nível, atributos, saldo, BTC, itens, carteira, `fazendinha_dados`, `historico_saques`, etc.). |
| `Atividades` | Histórico de ações dos jogadores. |
| `Trocas` | Negociações do TrocaSegura. |
| `suporte_tickets` | Tickets de suporte. |
| `cargos` | Verificação de conexão. |
| `downloads` | Versões e URLs de download (opcional). |
| `noticias` | Notícias dinâmicas (opcional). |

### Estrutura de `fazendinha_dados.bolsa` 🆕

```json
{
  "bolsa": {
    "acoes": [
      {
        "id": "PETR4",
        "nome": "Petrobras PN",
        "preco": 28.50,
        "dy": 12.5,
        "variacao": 0,
        "rentabilidade": 0,
        "registrado_codex": true,
        "registrado_em": "2025-01-01T00:00:00Z",
        "raridade": "raro",
        "tipo": "Ação",
        "tier": 5,
        "bonus": { "atk": 7, "def": 5, "hp": 50 }
      }
    ],
    "fiis": [],
    "etfs": [],
    "tesouro": [],
    "selic": 10.75,
    "ultima_atualizacao": "2025-01-01T00:00:00Z"
  }
}
```

## Executar localmente

1. Use o `config.js` versionado como configuração compartilhada. A chave anon/publishable é pública por natureza; nunca use uma chave `service_role` no navegador.
2. Proteja o acesso aos dados com políticas RLS no Supabase.
3. Sirva a pasta por HTTP, por exemplo com `python -m http.server 8000`, e abra `http://localhost:8000`. Os módulos não devem ser abertos diretamente por `file://`.
4. Instale no banco os recursos opcionais descritos acima e confira as permissões necessárias.

## Verificação local

Os testes usam Node.js e clientes simulados para validar regras e integrações locais. No PowerShell, execute todos com:

```powershell
Get-ChildItem tests/*.test.cjs | ForEach-Object {
    node --experimental-vm-modules --disable-warning=ExperimentalWarning $_.FullName
    if ($LASTEXITCODE -ne 0) { throw "Falha no teste: $($_.Name)" }
}
```

A suíte cobre combate, ficha do personagem, carteira do Codex, inventário de Shagrila, mercado, taxas, recuperação do dashboard, inicialização do TrocaSegura e chat. Ela não substitui a execução dos scripts SQL, a validação de permissões no Supabase ou a inspeção visual no navegador.
