const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Servir frontend (ajuste se a pasta for diferente)
app.use(express.static(path.join(__dirname, '../frontend')));

let MYSQL_ATIVO = true;

// Conexão
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '2313',
  database: 'cinemadb'
});

db.connect(err => {
  if (err) {
    console.log('⚠️ MySQL não conectado. Modo offline ativado.');
    MYSQL_ATIVO = false;
  } else {
    console.log('✅ Conectado ao MySQL!');
  }
});

// dados off
let usuariosOffline = [
  {
    id_cliente: 1,
    nome: 'Admin',
    cpf: '000.000.000-00',
    email: 'admin@cinemovie.com',
    senha: bcrypt.hashSync('123456', 10),
    data_nascimento: '2000-01-01',
    endereco: 'Rua Central, 123',
    papel: 'Admin'
  }
];

let filmesOffline = [
  {
    id_filme: 1,
    nome: 'Avatar 2',
    genero: 'Ficção',
    duracao: '03:12:00',
    ano_lancamento: '2022',
    sinopse: "Jake Sully luta para proteger sua família em Pandora.",
    trailer_url: "https://www.youtube.com/embed/a8Gx8wiNbs8",
    idioma: "Inglês, Português",
    capa: "https://i.imgur.com/lVFcvn2.jpeg"
  }
];

// cad (usuários)
app.post('/api/cadastro', (req, res) => {
  const { nome, cpf, email, senha, data_nascimento, endereco } = req.body;

  if (!nome || !cpf || !email || !senha || !data_nascimento || !endereco)
    return res.status(400).json({ error: 'Preencha todos os campos.' });

  const senhaHash = bcrypt.hashSync(senha, 10);

  if (!MYSQL_ATIVO) {
    if (usuariosOffline.some(u => u.email === email))
      return res.status(400).json({ error: 'Email já cadastrado.' });

    usuariosOffline.push({
      id_cliente: usuariosOffline.length + 1,
      nome,
      cpf,
      email,
      senha: senhaHash,
      data_nascimento,
      endereco,
      papel: 'Cliente'
    });

    return res.json({ message: 'Usuário cadastrado com sucesso! (offline)' });
  }

  const sql = `
    INSERT INTO usuarios (nome, cpf, email, senha, data_nascimento, endereco)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [nome, cpf, email, senhaHash, data_nascimento, endereco], (err) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY')
        return res.status(400).json({ error: 'Email ou CPF já cadastrado.' });

      return res.status(500).json({ error: 'Erro ao cadastrar.' });
    }
    res.json({ message: 'Usuário cadastrado!' });
  });
});

// login
app.post('/api/login', (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha)
    return res.status(400).json({ error: 'Preencha email e senha.' });

  if (!MYSQL_ATIVO) {
    const user = usuariosOffline.find(u => u.email === email);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

    if (!bcrypt.compareSync(senha, user.senha))
      return res.status(401).json({ error: 'Senha incorreta.' });

    const copy = { ...user };
    delete copy.senha;
    return res.json({ message: 'Login offline OK', user: copy });
  }

  db.query('SELECT * FROM usuarios WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro no servidor.' });
    if (results.length === 0)
      return res.status(404).json({ error: 'Usuário não encontrado.' });

    const user = results[0];

    if (!bcrypt.compareSync(senha, user.senha))
      return res.status(401).json({ error: 'Senha incorreta.' });

    delete user.senha;
    res.json({ message: 'Login OK', user });
  });
});

// filmes

// GET TODOS
app.get('/filmes', (req, res) => {
  if (!MYSQL_ATIVO) return res.json(filmesOffline);

  db.query('SELECT * FROM filmes ORDER BY id_filme DESC', (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar filmes.' });
    res.json(results);
  });
});

// GET UM FILME
app.get('/filmes/:id', (req, res) => {
  const id = req.params.id;

  if (!MYSQL_ATIVO) {
    const filme = filmesOffline.find(f => f.id_filme == id);
    return filme
      ? res.json(filme)
      : res.status(404).json({ error: 'Filme não encontrado' });
  }

  db.query('SELECT * FROM filmes WHERE id_filme = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro no servidor' });
    if (results.length === 0)
      return res.status(404).json({ error: 'Filme não encontrado' });

    res.json(results[0]);
  });
});

// POST FILME
app.post('/filmes', (req, res) => {
  // atenção: usamos trailer_url aqui
  const { nome, genero, ano_lancamento, sinopse, trailer_url, idioma, capa } = req.body;

  if (!nome || !genero || !ano_lancamento || !sinopse || !trailer_url || !idioma || !capa)
    return res.status(400).json({ error: 'Preencha todos os campos.' });

  if (!MYSQL_ATIVO) {
    filmesOffline.push({
      id_filme: filmesOffline.length + 1,
      nome,
      genero,
      ano_lancamento,
      sinopse,
      trailer_url,
      idioma,
      capa
    });
    return res.json({ message: 'Filme salvo offline!' });
  }

  const sql = `
    INSERT INTO filmes (nome, genero, ano_lancamento, sinopse, trailer_url, idioma, capa)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [nome, genero, ano_lancamento, sinopse, trailer_url, idioma, capa], err => {
    if (err) {
      console.error('Erro INSERT filmes:', err);
      return res.status(500).json({ error: 'Erro ao adicionar filme.' });
    }
    res.json({ message: 'Filme adicionado!' });
  });
});

// PUT FILME
app.put('/filmes/:id', (req, res) => {
  const id = req.params.id;
  const { nome, genero, ano_lancamento, sinopse, trailer_url, idioma, capa } = req.body;

  if (!MYSQL_ATIVO) {
    const filme = filmesOffline.find(f => f.id_filme == id);
    if (!filme) return res.status(404).json({ error: 'Não encontrado' });

    Object.assign(filme, { nome, genero, ano_lancamento, sinopse, trailer_url, idioma, capa });
    return res.json({ message: 'Atualizado offline!' });
  }

  const sql = `
    UPDATE filmes 
    SET nome=?, genero=?, ano_lancamento=?, sinopse=?, trailer_url=?, idioma=?, capa=? 
    WHERE id_filme=?
  `;

  db.query(sql, [nome, genero, ano_lancamento, sinopse, trailer_url, idioma, capa, id], err => {
    if (err) {
      console.error('Erro UPDATE filmes:', err);
      return res.status(500).json({ error: 'Erro ao atualizar filme.' });
    }
    res.json({ message: 'Filme atualizado!' });
  });
});

// DELETE FILME
app.delete('/filmes/:id', (req, res) => {
  const id = req.params.id;

  if (!MYSQL_ATIVO) {
    filmesOffline = filmesOffline.filter(f => f.id_filme != id);
    return res.json({ message: 'Filme removido offline!' });
  }

  db.query('DELETE FROM filmes WHERE id_filme = ?', [id], err => {
    if (err) return res.status(500).json({ error: 'Erro ao excluir filme.' });
    res.json({ message: 'Filme removido!' });
  });
});

// LISTAR USUÁRIOS (rota para front-end '/usuarios')
app.get('/usuarios', (req, res) => {
  if (!MYSQL_ATIVO) return res.json(usuariosOffline);

  db.query('SELECT id_cliente, nome, email, papel FROM usuarios', (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar usuários.' });
    res.json(results);
  });
});

// Alias para compatibilidade (mantém /api/usuarios também)
app.get('/api/usuarios', (req, res) => {
  return app._router.handle(req, res, () => {}); // delega para '/usuarios'
});

// DELETE usuário (para frontend chamar /usuarios/:id)
app.delete('/usuarios/:id', (req, res) => {
  const id = req.params.id;

  if (!MYSQL_ATIVO) {
    usuariosOffline = usuariosOffline.filter(u => u.id_cliente != id);
    return res.json({ message: 'Usuário removido (offline).' });
  }

  db.query('DELETE FROM usuarios WHERE id_cliente = ?', [id], err => {
    if (err) return res.status(500).json({ error: 'Erro ao excluir usuário.' });
    res.json({ message: 'Usuário removido!' });
  });
});

// start
app.listen(PORT, () =>
  console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`)
);
