let modoCadastro = false;
const form = document.getElementById('formAuth');
const nome = document.getElementById('nome');
const cpf = document.getElementById('cpf');
const email = document.getElementById('email');
const senha = document.getElementById('senha');
const dataNascimento = document.getElementById('data_nascimento');
const endereco = document.getElementById('endereco');
const btnAuth = document.getElementById('btnAuth');
const mudarModo = document.getElementById('mudarModo');
const mensagem = document.getElementById('mensagem');

const usuario = JSON.parse(localStorage.getItem("usuario"));

if (!usuario) {
  // usuário não logado → redireciona para login
  window.location.href = "index.html";
} else {
  // usuário logado → podemos acessar as propriedades
  document.getElementById("bemVindo").textContent = `🎬 Bem-vindo(a), ${usuario.nome}!`;
}

mudarModo.addEventListener('click', e => {
  e.preventDefault();
  modoCadastro = !modoCadastro;
  nome.style.display = modoCadastro ? 'block' : 'none';
  cpf.style.display = modoCadastro ? 'block' : 'none';
  dataNascimento.style.display = modoCadastro ? 'block' : 'none';
  endereco.style.display = modoCadastro ? 'block' : 'none';
  btnAuth.textContent = modoCadastro ? 'Cadastrar' : 'Entrar';
  mudarModo.textContent = modoCadastro ? 'Já tem conta? Faça login' : 'Cadastre-se';
});

form.addEventListener('submit', async e => {
  e.preventDefault();

  const dados = {
    nome: nome.value.trim(),
    cpf: cpf.value.trim(),
    email: email.value.trim(),
    senha: senha.value.trim(),
    data_nascimento: dataNascimento.value,
    endereco: endereco.value.trim()
  };

  const rota = modoCadastro ? '/api/cadastro' : '/api/login';
  try {
    const res = await fetch(rota, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
    const result = await res.json();
    if (result.error) return mensagem.textContent = '⚠️ ' + result.error;
    mensagem.textContent = '✅ ' + result.message;

    if (!modoCadastro) {
      const usuario = result.user;
      localStorage.setItem('usuario', JSON.stringify(usuario));
      setTimeout(() => {
        if (usuario.papel === 'Admin') window.location.href = 'admin.html';
        else window.location.href = 'home.html';
      }, 1000);
    }
  } catch {
    mensagem.textContent = '❌ Erro ao conectar ao servidor.';
  }
});
