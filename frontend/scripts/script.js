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

// Todos os campos de cadastro
const camposCadastro = document.querySelectorAll('.cadastro');

// Alternar entre login e cadastro
mudarModo.addEventListener('click', e => {
  e.preventDefault();

  modoCadastro = !modoCadastro;

  camposCadastro.forEach(campo => {
    campo.style.display = modoCadastro ? 'block' : 'none';
  });

  btnAuth.textContent = modoCadastro ? 'Cadastrar' : 'Entrar';
  mudarModo.textContent = modoCadastro ? 'Já tem conta? Faça login' : 'Cadastre-se';
  mensagem.textContent = '';
});

// Submeter formulário
form.addEventListener('submit', async e => {
  e.preventDefault();
  mensagem.textContent = '⏳ Processando...';

  // Dados para cadastro
  const dadosCadastro = {
    nome: nome.value.trim(),
    cpf: cpf.value.trim(),
    email: email.value.trim(),
    senha: senha.value.trim(),
    data_nascimento: dataNascimento.value,
    endereco: endereco.value.trim()
  };

  // Dados para login
  const dadosLogin = {
    email: email.value.trim(),
    senha: senha.value.trim()
  };

  const rota = modoCadastro ? '/api/cadastro' : '/api/login';
  const dadosEnviar = modoCadastro ? dadosCadastro : dadosLogin;

  try {
    const res = await fetch(rota, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosEnviar)
    });

    const result = await res.json();

    if (result.error) {
      mensagem.textContent = '⚠️ ' + result.error;
      return;
    }

    mensagem.textContent = '✅ ' + result.message;

    // ---------------- LOGIN ----------------
    if (!modoCadastro) {
      const usuario = result.user;

      if (!usuario) {
        mensagem.textContent = '⚠️ Erro inesperado: servidor não retornou o usuário.';
        return;
      }

      delete usuario.senha;

      localStorage.setItem('user', JSON.stringify(usuario));

      mensagem.textContent = '✅ Login bem-sucedido! Redirecionando...';

      setTimeout(() => {
        if (usuario.papel === "Admin") {
          window.location.href = "admin.html";
        } else {
          window.location.href = "home.html";
        }
      }, 1200);
    }

  } catch (err) {
    console.error(err);
    mensagem.textContent = '❌ Erro ao conectar ao servidor.';
  }
});
