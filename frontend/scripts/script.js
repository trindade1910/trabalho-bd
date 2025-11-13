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

let modoCadastro = false;

// Alternar entre login e cadastro
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

// Submeter formulário
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

    if (result.error) {
      mensagem.textContent = '⚠️ ' + result.error;
      return;
    }

    mensagem.textContent = '✅ ' + result.message;

    // Se for login, salvar usuário e redirecionar
    if (!modoCadastro) {
      const usuario = result.user;

      // Remove a senha do objeto por segurança
      if (usuario.senha) delete usuario.senha;

      localStorage.setItem('user', JSON.stringify(usuario));

      // Redireciona dependendo do papel
      setTimeout(() => {
        if (usuario.papel === 'Admin') window.location.href = 'admin.html';
        else window.location.href = 'home.html';
      }, 1000);
    }

  } catch (err) {
    console.error(err);
    mensagem.textContent = '❌ Erro ao conectar ao servidor.';
  }
});