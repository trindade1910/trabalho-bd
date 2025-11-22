document.addEventListener('DOMContentLoaded', () => {
  const listaFilmes = document.getElementById('listaFilmes');
  const tabelaUsuarios = document.querySelector('#tabelaUsuarios tbody');
  const form = document.getElementById('addFilmeForm');
  const logoutBtn = document.getElementById('logoutBtn');

  let editandoId = null;

  // logout
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
  });

  // add filme
  form.addEventListener('submit', async e => {
    e.preventDefault();

    const filme = {
      nome: document.getElementById('titulo').value.trim(),
      sinopse: document.getElementById('descricao').value.trim(),
      capa: document.getElementById('imagem').value.trim(),
      trailer_url: document.getElementById('trailer').value.trim(),
      genero: document.getElementById('genero').value.trim(),
      idioma: document.getElementById('idioma').value.trim(),
      ano_lancamento: document.getElementById('ano_lancamento').value
    };

    // validação
    for (const campo in filme) {
      if (!filme[campo]) {
        alert("Preencha todos os campos!");
        return;
      }
    }

    try {
      const url = editandoId ? `/filmes/${editandoId}` : '/filmes';
      const metodo = editandoId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filme)
      });

      const data = await res.json();
      alert(data.message || "Operação realizada!");

      form.reset();
      editandoId = null;
      form.querySelector("button").textContent = "Adicionar Filme";
      carregarFilmes();

    } catch (err) {
      console.error(err);
      alert("Erro ao enviar dados.");
    }
  });

  // commit filme
  async function carregarFilmes() {
    try {
      const res = await fetch('/filmes');
      const filmes = await res.json();

      listaFilmes.innerHTML = filmes
        .map(f => `
          <div class="filme-card">
            <img src="${f.capa}">
            <h3>${f.nome}</h3>
            <p>${f.genero}</p>

            <div class="botoes">
              <button onclick='editarFilme(${JSON.stringify(f)})'>✏️ Editar</button>
              <button onclick="excluirFilme(${f.id_filme})">🗑️ Excluir</button>
            </div>
          </div>
        `)
        .join('');

    } catch (err) {
      console.error(err);
    }
  }

  // delete filme
  window.excluirFilme = async id => {
    if (!confirm("Excluir este filme?")) return;

    try {
      await fetch(`/filmes/${id}`, { method: "DELETE" });
      carregarFilmes();
    } catch (err) {
      console.error(err);
    }
  };

  // editar filme
  window.editarFilme = f => {
    document.getElementById('titulo').value = f.nome;
    document.getElementById('descricao').value = f.sinopse;
    document.getElementById('imagem').value = f.capa;
    document.getElementById('trailer').value = f.trailer_url;
    document.getElementById('genero').value = f.genero;
    document.getElementById('idioma').value = f.idioma;
    document.getElementById('ano_lancamento').value = f.ano_lancamento.split("T")[0];

    editandoId = f.id_filme;

    form.querySelector("button").textContent = "Salvar Alterações";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // commit user
  async function carregarUsuarios() {
    try {
      const res = await fetch('/usuarios');
      const usuarios = await res.json();

      tabelaUsuarios.innerHTML = usuarios
        .map(u => `
          <tr>
            <td>${u.id_cliente}</td>
            <td>${u.nome}</td>
            <td>${u.email}</td>
            <td>${u.papel}</td>
            <td><button onclick="excluirUsuario(${u.id_cliente})">🗑️ Excluir</button></td>
          </tr>
        `)
        .join('');

    } catch (err) {
      console.error(err);
    }
  }

  // delete
  window.excluirUsuario = async id => {
    if (!confirm("Excluir usuário?")) return;
    await fetch(`/usuarios/${id}`, { method: "DELETE" });
    carregarUsuarios();
  };

  // 🌙 DARK MODE
  const toggleTheme = document.getElementById('toggleTheme');
  toggleTheme.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    toggleTheme.textContent = document.body.classList.contains('dark-mode')
      ? '☀️ Modo Claro'
      : '🌙 Modo Escuro';
  });

  document.getElementById("voltarHome").addEventListener("click", () => {
    window.location.href = "home.html";
  });

  // 🚀 start
  carregarFilmes();
  carregarUsuarios();
});
