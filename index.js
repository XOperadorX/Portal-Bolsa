// Verifica se já está logado
const usuarioLogado = localStorage.getItem('usuario_logado');

if (usuarioLogado) {
    try {
        const user = JSON.parse(usuarioLogado);
        if (user && user.login) {
            window.location.href = 'dashboard.html';
        } else {
            window.location.href = 'login.html';
        }
    } catch (e) {
        window.location.href = 'login.html';
    }
} else {
    // Redireciona para o login após 1 segundo
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1000);
}