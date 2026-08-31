// ============================================================
// CONFIGURAÇÃO UNIFICADA - MM Quase Tudo
// ============================================================

export const CONFIG = {
    SUPABASE_URL: 'https://xrcxvizzdumcxbylmkvn.supabase.co',
    SUPABASE_KEY: 'sb_publishable_E-g3G3wW4EySbCsXLXp8KQ_FnmERMcD',
    TABELA: 'Geral',
    
    // Valores padrão
    DEFAULTS: {
        saldo: 0,
        nivel: 1,
        experiencia: 0,
        hp: 100,
        max_hp: 100,
        mp: 50,
        max_mp: 50,
        sm: 100,
        max_sm: 100,
        atk: 15,
        def: 10,
        mag: 8,
        seeds: 0,
        planted: 0,
        harvested: 0,
        buckets: 0,
        stock: 0,
        btc: 0,
        poder_hash: 1.0,
        mumu: 500,
        selic: 10.75,
        carteira: {},
        itens: [],
        plot_data: [],
        fazendinha_dados: {},
        historico: []
    }
};

// ============================================================
// ITENS DO MERCADO
// ============================================================
export const ITENS_MERCADO = [
    { id: 'sementes', nome: 'Sementes', emoji: '🌰', precoBase: 5, precoMaximo: 15, precoMinimo: 2 },
    { id: 'milho', nome: 'Milho', emoji: '🌽', precoBase: 8, precoMaximo: 20, precoMinimo: 3 },
    { id: 'ovos', nome: 'Ovos', emoji: '🥚', precoBase: 3, precoMaximo: 8, precoMinimo: 1 },
    { id: 'galinhas', nome: 'Galinhas', emoji: '🐔', precoBase: 25, precoMaximo: 50, precoMinimo: 15 },
    { id: 'pintinhos', nome: 'Pintinhos', emoji: '🐣', precoBase: 15, precoMaximo: 30, precoMinimo: 10 },
    { id: 'madeira', nome: 'Madeira', emoji: '🪵', precoBase: 10, precoMaximo: 25, precoMinimo: 5 },
    { id: 'pedra', nome: 'Pedra', emoji: '🪨', precoBase: 15, precoMaximo: 35, precoMinimo: 8 },
    { id: 'ouro', nome: 'Ouro', emoji: '💎', precoBase: 50, precoMaximo: 100, precoMinimo: 30 },
    { id: 'pocao', nome: 'Poção', emoji: '🧪', precoBase: 25, precoMaximo: 60, precoMinimo: 15 },
    { id: 'balde', nome: 'Balde', emoji: '🪣', precoBase: 12, precoMaximo: 25, precoMinimo: 6 }
];

// ============================================================
// TÍTULOS POR NÍVEL
// ============================================================
export const TITULOS = [
    { min: 1, titulo: '🌱 Iniciante' },
    { min: 5, titulo: '🌿 Aprendiz' },
    { min: 10, titulo: '⚔️ Guerreiro' },
    { min: 20, titulo: '🛡️ Mestre' },
    { min: 35, titulo: '🏆 Lendário' },
    { min: 50, titulo: '👑 Herói' },
    { min: 75, titulo: '⚡ Deus da Guerra' },
    { min: 100, titulo: '🌟 Imortal' }
];

// ============================================================
// ESTÁGIOS DO MILHO
// ============================================================
export const STAGES = {
    EMPTY: 'empty',
    SEED: 'seed',
    SPROUT: 'sprout',
    SEEDLING: 'seedling',
    GROWING: 'growing',
    MATURE: 'mature',
    HARVESTED: 'harvested'
};

export const STAGE_ORDER = [
    STAGES.EMPTY,
    STAGES.SEED,
    STAGES.SPROUT,
    STAGES.SEEDLING,
    STAGES.GROWING,
    STAGES.MATURE,
    STAGES.HARVESTED
];

export const STAGE_META = {
    [STAGES.EMPTY]: { emoji: '', label: 'vazio' },
    [STAGES.SEED]: { emoji: '🌰', label: 'semente' },
    [STAGES.SPROUT]: { emoji: '🌱', label: 'brotando' },
    [STAGES.SEEDLING]: { emoji: '🌿', label: 'muda' },
    [STAGES.GROWING]: { emoji: '🌾', label: 'crescendo' },
    [STAGES.MATURE]: { emoji: '🌽', label: 'maduro!' },
    [STAGES.HARVESTED]: { emoji: '🟫', label: 'colhido' }
};