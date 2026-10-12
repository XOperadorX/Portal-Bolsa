// config.example.js — commitar este (template)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const SUPABASE_URL = 'https://SEU_PROJETO.supabase.co';
export const SUPABASE_KEY = 'SUA_CHAVE_ANON_AQUI';

export const TABELA            = 'Geral';
export const TABELA_ATIVIDADES = 'Atividades';
export const TABELA_TROCAS     = 'Trocas';
export const TAXA_PERCENTUAL   = 0.05;

export const db = createClient(SUPABASE_URL, SUPABASE_KEY);