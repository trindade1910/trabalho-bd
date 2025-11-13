document.addEventListener('DOMContentLoaded', () => {
    const listaFilmes = document.getElementById('listaFilmes');
    const tabelaUsuarios = document.querySelector('#tabelaUsuarios tbody');
    const form = document.getElementById('addFilmeForm');
    const logoutBtn = document.getElementById('logoutBtn');
  
    // Sair do painel
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('user');
      window.location.href = 'index.html';
    });
  
    // Adicionar filme
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const filme = {
        titulo: document.getElementById('titulo').value,
        descricao: document.getElementById('descricao').value,
        imagem: document.getElementById('imagem').value
      };
  
      const res = await fetch('/api/filmes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filme)
      });
  
      const data = await res.json();
      alert(data.message);
      carregarFilmes();
    });
  
    // Carregar filmes
    async function carregarFilmes() {
      const res = await fetch('/api/filmes');
      const filmes = await res.json();
  
      listaFilmes.innerHTML = filmes.map(f => `
        <div>
          <img src="${f.imagem || 'https://via.placeholder.com/150'}" alt="">
          <h3>${f.titulo}</h3>
          <p>${f.descricao || ''}</p>
        </div>
      `).join('');
    }
  
    // Carregar usuários
    async function carregarUsuarios() {
      const res = await fetch('/api/usuarios');
      const usuarios = await res.json();
  
      tabelaUsuarios.innerHTML = usuarios.map(u => `
        <tr>
          <td>${u.id_cliente}</td>
          <td>${u.nome}</td>
          <td>${u.email}</td>
          <td>${u.papel}</td>
        </tr>
      `).join('');
    }
  
    carregarFilmes();
    carregarUsuarios();
  });