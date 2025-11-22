document.addEventListener('DOMContentLoaded', () => {
  const listaFilmes = document.getElementById('listaFilmes');
  const tabelaUsuarios = document.querySelector('#tabelaUsuarios tbody');
  const form = document.getElementById('addFilmeForm');
  const logoutBtn = document.getElementById('logoutBtn');

  // preview area (inserido dinamicamente)
  const previewArea = document.createElement('div');
  previewArea.id = 'previewArea';
  previewArea.style.marginTop = '16px';
  previewArea.innerHTML = `
    <h3>Preview:</h3>
    <div style="margin-bottom:10px;">
      <strong>Capa:</strong><br>
      <img id="previewCapa" src="" style="width:200px;border-radius:8px;display:none;" />
    </div>
    <div>
      <strong>Trailer:</strong><br>
      <iframe id="previewTrailer" width="350" height="200" style="display:none;border-radius:8px;" allowfullscreen></iframe>
    </div>
  `;
  const inputTrailerElem = document.getElementById('trailer');
  inputTrailerElem.parentNode.insertBefore(previewArea, inputTrailerElem.nextSibling);

  const inputCapa = document.getElementById('imagem');
  const previewCapa = document.getElementById('previewCapa');
  const inputTrailer = document.getElementById('trailer');
  const previewTrailer = document.getElementById('previewTrailer');

  let editandoId = null;

  // logout
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
  });

  // util: extrai ano (YYYY) de YYYY or YYYY-MM-DD
  function extractYear(valor) {
    if (!valor) return '';
    const s = String(valor);
    if (/^\d{4}$/.test(s)) return s;
    const m = s.match(/^(\d{4})/);
    return m ? m[1] : '';
  }

  // preview capa
  inputCapa.addEventListener('input', () => {
    const url = inputCapa.value.trim();
    if (url) {
      previewCapa.src = url;
      previewCapa.style.display = 'block';
    } else {
      previewCapa.style.display = 'none';
    }
  });

  // preview trailer (YouTube compat)
  inputTrailer.addEventListener('input', () => {
    const url = inputTrailer.value.trim();
    if (!url) {
      previewTrailer.style.display = 'none';
      previewTrailer.src = '';
      return;
    }
    let embed = url;
    try {
      if (url.includes('watch?v=')) {
        const id = url.split('watch?v=')[1].split('&')[0];
        embed = `https://www.youtube.com/embed/${id}`;
      } else if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1].split('?')[0];
        embed = `https://www.youtube.com/embed/${id}`;
      } else if (url.includes('/embed/')) {
        embed = url;
      }
    } catch (e) {
      embed = url;
    }
    previewTrailer.src = embed;
    previewTrailer.style.display = 'block';
  });

  // submit adicionar/editar filme
  form.addEventListener('submit', async e => {
    e.preventDefault();

    const anoInput = document.getElementById('ano_lancamento').value;
    const ano = extractYear(anoInput) || null;

    const filme = {
      nome: document.getElementById('titulo').value.trim(),
      sinopse: document.getElementById('descricao').value.trim(),
      capa: document.getElementById('imagem').value.trim(),
      trailer_url: document.getElementById('trailer').value.trim(),
      genero: document.getElementById('genero').value.trim(),
      idioma: document.getElementById('idioma').value.trim(),
      ano_lancamento: ano
    };

    for (const campo in filme) {
      if (!filme[campo]) {
        alert('Preencha todos os campos!');
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
      if (!res.ok) throw new Error(data.error || data.message || 'Erro');

      alert(data.message || 'Operação realizada!');
      form.reset();
      previewCapa.style.display = 'none';
      previewTrailer.style.display = 'none';
      editandoId = null;
      form.querySelector('button').textContent = 'Adicionar Filme';
      carregarFilmes();
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar dados: ' + (err.message || err));
    }
  });

  // carregar filmes
  async function carregarFilmes() {
    try {
      const res = await fetch('/filmes');
      const filmes = await res.json();

      listaFilmes.innerHTML = filmes
        .map(f => `
          <div class="filme-card">
            <img src="${f.capa}" alt="capa">
            <h3>${f.nome}</h3>
            <p>${f.genero} • ${f.ano_lancamento}</p>

            <div class="botoes">
              <button onclick='window.editarFilme(${JSON.stringify(f)})'>✏️ Editar</button>
              <button onclick="window.excluirFilme(${f.id_filme})">🗑️ Excluir</button>
              <button onclick="window.openTrailer('${f.trailer_url}')">▶️ Assistir Trailer</button>
            </div>
          </div>
        `).join('');
    } catch (err) {
      console.error(err);
    }
  }

  window.openTrailer = (url) => {
    if (!url) return alert('Trailer não disponível');
    const embed = url.includes('embed') ? url : (url.includes('watch?v=') ? `https://www.youtube.com/embed/${url.split('watch?v=')[1].split('&')[0]}` : (url.includes('youtu.be/') ? `https://www.youtube.com/embed/${url.split('youtu.be/')[1].split('?')[0]}` : url));
    window.open(embed, '_blank');
  };

  // excluir filme
  window.excluirFilme = async id => {
    if (!confirm('Excluir este filme?')) return;
    try {
      const res = await fetch(`/filmes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao excluir');
      carregarFilmes();
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir filme.');
    }
  };

  // editar filme
  window.editarFilme = f => {
    document.getElementById('titulo').value = f.nome || '';
    document.getElementById('descricao').value = f.sinopse || '';
    document.getElementById('imagem').value = f.capa || '';
    document.getElementById('trailer').value = f.trailer_url || '';
    document.getElementById('genero').value = f.genero || '';
    document.getElementById('idioma').value = f.idioma || '';

    const ano = extractYear(f.ano_lancamento);
    document.getElementById('ano_lancamento').value = ano ? `${ano}-01-01` : '';

    if (f.capa) { previewCapa.src = f.capa; previewCapa.style.display = 'block'; }
    if (f.trailer_url) { previewTrailer.src = f.trailer_url; previewTrailer.style.display = 'block'; }

    editandoId = f.id_filme;
    form.querySelector('button').textContent = 'Salvar Alterações';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // carregar usuários (rota /usuarios)
  async function carregarUsuarios() {
    try {
      const res = await fetch('/usuarios');
      const usuarios = await res.json();

      tabelaUsuarios.innerHTML = usuarios.map(u => `
        <tr>
          <td>${u.id_cliente}</td>
          <td>${u.nome}</td>
          <td>${u.email}</td>
          <td>${u.papel}</td>
          <td><button onclick="window.excluirUsuario(${u.id_cliente})">🗑️ Excluir</button></td>
        </tr>
      `).join('');
    } catch (err) {
      console.error(err);
    }
  }

  // excluir usuário
  window.excluirUsuario = async id => {
    if (!confirm('Excluir usuário?')) return;
    try {
      const res = await fetch(`/usuarios/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro');
      carregarUsuarios();
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir usuário.');
    }
  };

  // dark mode
  const toggleTheme = document.getElementById('toggleTheme');
  toggleTheme.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    toggleTheme.textContent = document.body.classList.contains('dark-mode') ? '☀️ Modo Claro' : '🌙 Modo Escuro';
  });

  document.getElementById('voltarHome').addEventListener('click', () => {
    window.location.href = 'home.html';
  });

  // iniciar
  carregarFilmes();
  carregarUsuarios();
});
