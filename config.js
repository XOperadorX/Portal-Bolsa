// Configuração central do Supabase. A chave anon/publishable é pública; proteja os dados com RLS.
(function (global) {
    const SUPABASE_URL = 'https://xrcxvizzdumcxbylmkvn.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyY3h2aXp6ZHVtY3hieWxta3ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2NjA0NzIsImV4cCI6MjEwMjIzNjQ3Mn0.ohB4tW0UQ-k1PcwoZxm4u9XSGNLsFphv1_UwTWoklOM';

    if (!global.supabase || typeof global.supabase.createClient !== 'function') {
        throw new Error('A biblioteca Supabase deve ser carregada antes de config.js.');
    }

    const db = global.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    global.SUPABASE_URL = SUPABASE_URL;
    global.SUPABASE_KEY = SUPABASE_KEY;
    global.PORTAL_CONFIG = Object.freeze({ SUPABASE_URL, SUPABASE_KEY, db });
    global.supabaseClient = db;
    global.db = db;
})(globalThis);
