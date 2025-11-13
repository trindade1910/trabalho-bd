const usuario = JSON.parse(localStorage.getItem("usuario"));

if (!usuario) {
  // Usuário não logado → volta ao login
  window.location.href = "index.html";
} else {
  // Exibe o nome do usuário
  document.getElementById("bemVindo").textContent = `🎬 Bem-vindo(a), ${usuario.nome}!`;
}

// Botão de logout
document.getElementById("logout").addEventListener("click", () => {
  localStorage.removeItem("usuario");
  window.location.href = "index.html";
});
