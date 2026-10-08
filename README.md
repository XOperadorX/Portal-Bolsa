# Portal_Bolsa

![Versão](https://img.shields.io/badge/versão-1.0.0-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/status-ativo-success?style=for-the-badge)
![Plataforma](https://img.shields.io/badge/plataforma-Web%20%7C%20Android%20%7C%20iOS-orange?style=for-the-badge)
![Supabase](https://img.shields.io/badge/backend-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

**Versão Atual:** `1.0.0` · **Temporada:** 2026 · **Última atualização:** 30/09/2026

Plataforma **MM Quase Tudo** — Central de jogos, economia virtual e negociações entre jogadores, construída com **HTML/CSS/JS puro** e **Supabase** como backend.

---

## 📌 Versão Atual

| Item | Valor |
|---|---|
| **Versão** | `1.0.0` |
| **Codinome** | Temporada 2026 |
| **Lançamento** | 30/09/2026 |
| **Status** | 🟢 Ativo |
| **Compatibilidade** | Web · Android 7.0+ · Windows 10+ |

---

## 📋 Visão Geral

O projeto é um portal web (também empacotável como app mobile via **Apache Cordova**) que oferece uma suíte de jogos e sistemas econômicos integrados, com autenticação, persistência de dados em tempo real e mecânicas de progressão.

---

## 🗂️ Estrutura de Arquivos

| Arquivo | Descrição |
|---|---|
| `index.html` | Página inicial com redirecionamento automático baseado em sessão ativa (24h). |
| `index.js` | Lógica de verificação de sessão e redirecionamento. |
| `login.html` | Tela de login com validação via RPC `login_usuario` e aplicação de regeneração offline. |
| `cadastro.html` | Cadastro de novos usuários com fingerprint de dispositivo, MAC e IP (anti-multi-conta). |
| `confirmar.html` | Confirmação de e-mail após cadastro (integração com Supabase Auth). |
| `dashboard.html` | Central de jogos — hub principal com status do jogador, nível, stamina, histórico de atividades, modal do Diário, widgets de BTC e saldo. |
| `codex.html` | Códice de Equipamentos — registro de ativos da bolsa, bônus acumulados e integração em tempo real. |
| `diario.html` | Sistema de login diário com 30 dias de recompensas, ciclo de cristais e countdown. |
| `download.html` | Página de downloads (APK Android / ZIP Windows) com status do servidor e changelog. |
| `eventos.html` | Listagem de eventos, torneios e atualizações com filtros e inscrição. |
| `noticias.html` | Central de notícias com filtros por categoria e carregamento dinâmico via Supabase. |
| `suporte.html` | Central de suporte com abertura de tickets, histórico, FAQ e painel administrativo. |
| `testetet.html` | Visualizador de tickets (somente leitura) da tabela `suporte_tickets`. |
| `troca.html` | **TrocaSegura** — sistema de negociação entre jogadores com código de liberação de 6 dígitos. |
| `menu.html` | Componente de menu padronizado reutilizável. |
| `esqueci-login.html` | Recuperação de login por nome completo. |
| `esqueci-senha.html` | Redefinição de senha via login (hash SHA-256). |
| `config.xml` | Configuração do Apache Cordova (app mobile). |
| `package.json` | Dependências e scripts do Cordova. |
| `jsconfig.json` | Configuração de JS (vazio). |

---

## 🚀 Funcionalidades Principais

### 🔐 Autenticação e Sessão
- Login via RPC `login_usuario` (Supabase).
- Sessão local com expiração de **24 horas** (`localStorage`).
- Regeneração offline de HP/MP/Stamina ao fazer login (RPC `calcular_regen_offline`).
- Cadastro com **fingerprint de dispositivo** (Canvas + WebGL + fontes + hardware) para evitar contas duplicadas.

### 🎮 Central de Jogos
- Grid de jogos com interceptação de clique para consumo de stamina.
- **Custo de entrada**: 50% da stamina atual (mínimo 10 SM para jogar).
- Sistema de **níveis** (1–100+), títulos, EXP, atributos (HP, MP, Stamina, Força, Defesa, Magia).
- Regeneração offline: **2 SM/min**, **1 HP/min**, **1 MP/min** (máx. 24h).
- Log de atividades persistido na tabela `Atividades`.

### 📖 Codex
- Registro de ativos da bolsa (Ações, FIIs, ETFs, Tesouro).
- Bônus por raridade: Comum, Incomum, Raro, Épico, Lendário.
- Integração em tempo real via **Supabase Realtime**.
- Progresso geral de itens registrados.

### 📅 Diário
- Ciclo de 30 dias com recompensas progressivas.
- Resgate diário com countdown de 24h.
- Acúmulo de cristais e itens.
- Persistência no banco (`diario_dia`, `diario_dias_resgatados`, `diario_ultimo_resgate`).

### 🛡️ TrocaSegura
- Negociação entre jogadores com status: `aguardando_pagamento` → `pagamento_confirmado` → `concluida` / `cancelada`.
- Código secreto de **6 dígitos** gerado pelo vendedor (hash SHA-256 armazenado).
- Limite de **5 tentativas** de liberação.
- Suporte a mochila com extração automática de itens.

### 🎫 Suporte
- Abertura de tickets com categoria e prioridade.
- Histórico por login/email.
- Painel admin com visualização de todos os tickets.
- FAQ accordion e status do sistema.

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
| `Geral` | Dados dos jogadores (nível, atributos, saldo, BTC, itens, carteira, fazendinha_dados). |
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

---

## 📱 Build Mobile (Cordova)

```bash
# Instalar dependências
npm install

# Adicionar plataforma
cordova platform add android

# Build
cordova build android

Plugins utilizados:

cordova-plugin-whitelist

cordova-plugin-inappbrowser

cordova-plugin-statusbar

cordova-plugin-device

🔧 Configuração
As credenciais do Supabase estão hardcoded nos arquivos HTML (chave anon pública). Para ambientes de produção, recomenda-se:

Rotacionar a chave anon periodicamente.

Configurar RLS (Row Level Security) adequadamente nas tabelas.

Mover chamadas sensíveis para Edge Functions.

Utilizar variáveis de ambiente no build.

📥 Downloads
Android (APK): gofile.io/d/EAGM9koU

Windows (ZIP): Google Drive

📝 Changelog Resumido
Versão	Data	Destaques
1.0.0	30/09/2026	Balanceamento de XP, correções no ranking, eventos de outubro.
0.9.5	15/09/2026	Sistema de trocas MUMU, novo código de resgate.
0.9.0	01/09/2026	Lançamento da temporada 2026, sistema de fazendinha.
⚠️ Avisos de Segurança
A chave SUPABASE_KEY está exposta no código-fonte (comportamento esperado para anon key, mas exige RLS bem configurado).

Senhas são armazenadas com hash SHA-256 (recomenda-se migrar para bcrypt/argon2 no backend).

Fingerprint e MAC são coletados para anti-fraude — verifique conformidade com LGPD.

👥 Autor
Equipe MM Quase Tudo

📄 Licença
Apache-2.0 (conforme package.json do Cordova).

text

---

## 🔄 Sincronizar a Versão em Todo o Projeto

Ao lançar uma nova versão, atualize **estes 4 lugares** para manter tudo consistente:

| # | Arquivo | O que alterar |
|---|---|---|
| 1 | `package.json` | `"version": "1.0.0"` |
| 2 | `config.xml` | `<widget ... version="1.0.0">` |
| 3 | `README.md` | Badge + tabela de versão |
| 4 | `download.html` | `<span id="versaoTexto">Versão 1.0.0</span>` |

### 💡 Versionamento Semântico (`MAJOR.MINOR.PATCH`)

| Tipo | Quando usar | Exemplo |
|---|---|---|
| **MAJOR** | Mudanças incompatíveis | `1.0.0` → `2.0.0` |
| **MINOR** | Novas funcionalidades | `1.0.0` → `1.1.0` |
| **PATCH** | Correções de bugs | `1.0.0` → `1.0.1` |

🎯 Ordem Recomendada de Execução
DIA 1 (Segurança):
  1. Rodar SQL do RLS
  2. Rotacionar chave anon
  3. Aplicar RPC de troca

DIA 2 (Senhas + Refactor):
  4. Migrar senhas para bcrypt
  5. Criar shared/session.js e aplicar

DIA 3 (Organização):
  6. Criar shared/menu.js
  7. Aplicar menu em todas as páginas

DIA 4 (Polimento):
  8. Favicon + OG tags
  9. .gitignore + package.json
  10. Remover logs