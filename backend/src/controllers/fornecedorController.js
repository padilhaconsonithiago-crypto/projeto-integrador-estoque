// Controlador de Fornecedor: CRUD de fornecedores.
const db = require('../database');
const { validarFornecedor, lerId } = require('../validacoes');

function paraFornecedor(linha) {
  if (!linha) return null;
  return {
    id: linha.id,
    nome: linha.nome,
    cnpj: linha.cnpj,
    endereco: linha.endereco,
    telefone: linha.telefone,
    email: linha.email,
    contato: linha.contato,
    criadoEm: linha.criado_em,
  };
}

function buscar(id) {
  return paraFornecedor(db.prepare('SELECT * FROM fornecedores WHERE id = ?').get(id));
}

function cnpjEmUso(cnpj, ignorarId = 0) {
  return Boolean(db.prepare('SELECT id FROM fornecedores WHERE cnpj = ? AND id <> ?').get(cnpj, ignorarId));
}

// GET /fornecedores
function listar(req, res) {
  const linhas = db.prepare('SELECT * FROM fornecedores ORDER BY nome COLLATE NOCASE').all();
  res.json(linhas.map(paraFornecedor));
}

// GET /fornecedores/:id
function buscarPorId(req, res) {
  const fornecedor = buscar(lerId(req.params.id));
  if (!fornecedor) return res.status(404).json({ mensagem: 'Fornecedor não encontrado.' });
  res.json(fornecedor);
}

// POST /fornecedores
function criar(req, res) {
  const { dados, erros } = validarFornecedor(req.body);
  if (Object.keys(erros).length) {
    return res.status(400).json({ mensagem: 'Verifique os campos destacados.', erros });
  }

  if (cnpjEmUso(dados.cnpj)) {
    return res.status(409).json({ mensagem: 'Fornecedor com esse CNPJ já está cadastrado!' });
  }

  const resultado = db
    .prepare(
      `INSERT INTO fornecedores (nome, cnpj, endereco, telefone, email, contato)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(dados.nome, dados.cnpj, dados.endereco, dados.telefone, dados.email, dados.contato);

  res.status(201).json({
    mensagem: 'Fornecedor cadastrado com sucesso!',
    fornecedor: buscar(Number(resultado.lastInsertRowid)),
  });
}

// PUT /fornecedores/:id
function atualizar(req, res) {
  const id = lerId(req.params.id);
  if (!buscar(id)) return res.status(404).json({ mensagem: 'Fornecedor não encontrado.' });

  const { dados, erros } = validarFornecedor(req.body);
  if (Object.keys(erros).length) {
    return res.status(400).json({ mensagem: 'Verifique os campos destacados.', erros });
  }

  if (cnpjEmUso(dados.cnpj, id)) {
    return res.status(409).json({ mensagem: 'Fornecedor com esse CNPJ já está cadastrado!' });
  }

  db.prepare(
    `UPDATE fornecedores
        SET nome = ?, cnpj = ?, endereco = ?, telefone = ?, email = ?, contato = ?
      WHERE id = ?`
  ).run(dados.nome, dados.cnpj, dados.endereco, dados.telefone, dados.email, dados.contato, id);

  res.json({ mensagem: 'Fornecedor atualizado com sucesso!', fornecedor: buscar(id) });
}

// DELETE /fornecedores/:id
function remover(req, res) {
  const id = lerId(req.params.id);
  if (!buscar(id)) return res.status(404).json({ mensagem: 'Fornecedor não encontrado.' });

  db.prepare('DELETE FROM fornecedores WHERE id = ?').run(id);
  res.json({ mensagem: 'Fornecedor excluído com sucesso!' });
}

module.exports = { listar, buscarPorId, criar, atualizar, remover, buscar, paraFornecedor };
