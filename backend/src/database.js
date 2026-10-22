// Conexão com o banco SQLite usando o módulo nativo do Node.js (node:sqlite).
// O arquivo database.sqlite é criado automaticamente na primeira execução.
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const caminho = process.env.DB_PATH || path.join(__dirname, '..', 'database.sqlite');
const db = new DatabaseSync(caminho);

db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS fornecedores (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    nome      TEXT NOT NULL,
    cnpj      TEXT NOT NULL UNIQUE,
    endereco  TEXT NOT NULL,
    telefone  TEXT NOT NULL,
    email     TEXT NOT NULL,
    contato   TEXT NOT NULL,
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS produtos (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    nome          TEXT NOT NULL,
    codigo_barras TEXT UNIQUE,
    descricao     TEXT NOT NULL,
    preco         REAL,
    quantidade    INTEGER NOT NULL DEFAULT 0,
    categoria     TEXT NOT NULL,
    data_validade TEXT,
    imagem        TEXT,
    criado_em     TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  -- Tabela associativa da relação muitos-para-muitos.
  -- A chave primária composta impede associar o mesmo fornecedor duas vezes ao mesmo produto.
  CREATE TABLE IF NOT EXISTS produto_fornecedor (
    produto_id    INTEGER NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    fornecedor_id INTEGER NOT NULL REFERENCES fornecedores(id) ON DELETE CASCADE,
    criado_em     TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (produto_id, fornecedor_id)
  );
`);

require('./dadosExemplo')(db);

module.exports = db;
