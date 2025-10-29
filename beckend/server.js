const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('../frontend'));

let MYSQL_ATIVO = true;

// 🔌 Conexão MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // troque pela sua senha
  database: 'cinemadb'
});

db.connect(err => {
  if (err) {
    console.log('⚠️ MySQL não conectado, modo offline ativado.');
    MYSQL_ATIVO = false;
  } else {
    console.log('✅ Conectado ao MySQL!');
  }
});

// ======== Dados offline ========
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
let filmesOffline = [];

// ======== Rota de cadastro ========
app.post('/api/cadastro', (req, res) => {
  const { nome, cpf, email, senha, data_nascimento, endereco } = req.body;

  if (!nome || !cpf || !email || !senha || !data_nascimento || !endereco)
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });

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
    if (err) return res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
    res.json({ message: 'Usuário cadastrado com sucesso!' });
  });
});

// ======== Rota de login ========
app.post('/api/login', (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ error: 'Preencha todos os campos.' });

  if (!MYSQL_ATIVO) {
    const user = usuariosOffline.find(u => u.email === email);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    if (!bcrypt.compareSync(senha, user.senha))
      return res.status(401).json({ error: 'Senha incorreta.' });
    return res.json({ message: 'Login bem-sucedido!', user });
  }

  db.query('SELECT * FROM usuarios WHERE email = ?', [email], (err, results) => {
    if (err || results.length === 0)
      return res.status(404).json({ error: 'Usuário não encontrado.' });

    const user = results[0];
    if (!bcrypt.compareSync(senha, user.senha))
      return res.status(401).json({ error: 'Senha incorreta.' });

    res.json({ message: 'Login bem-sucedido!', user });
  });
});

// ======== Rotas de filmes ========
app.get('/api/filmes', (req, res) => {
  if (!MYSQL_ATIVO) return res.json(filmesOffline);

  db.query('SELECT * FROM filmes ORDER BY criado_em DESC', (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar filmes.' });
    res.json(results);
  });
});

app.post('/api/filmes', (req, res) => {
  const { titulo, descricao, imagem } = req.body;
  if (!titulo) return res.status(400).json({ error: 'O título é obrigatório.' });

  if (!MYSQL_ATIVO) {
    filmesOffline.push({ id_filme: filmesOffline.length + 1, titulo, descricao, imagem });
    return res.json({ message: 'Filme adicionado (offline).' });
  }

  const sql = 'INSERT INTO filmes (titulo, descricao, imagem) VALUES (?, ?, ?)';
  db.query(sql, [titulo, descricao, imagem], (err) => {
    if (err) return res.status(500).json({ error: 'Erro ao adicionar filme.' });
    res.json({ message: 'Filme adicionado com sucesso!' });
  });
});

app.listen(PORT, () => console.log(`🚀 Servidor rodando em http://localhost:${PORT}`));