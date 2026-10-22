// Controlador de Produto: CRUD de produtos.
const db = require('../database');
const { validarProduto, lerId } = require('../validacoes');

function paraProduto(linha) {
  if (!linha) return null;
  return {
    id: linha.id,
    nome: linha.nome,
    codigoBarras: linha.codigo_barras,
    descricao: linha.descricao,
    preco: linha.preco,
    quantidade: linha.quantidade,
    categoria: linha.categoria,
    dataValidade: linha.data_validade,
    imagem: linha.imagem,
    criadoEm: linha.criado_em,
  };
}

function buscar(id) {
  return paraProduto(db.prepare('SELECT * FROM produtos WHERE id = ?').get(id));
}

function codigoEmUso(codigoBarras, ignorarId = 0) {
  if (!codigoBarras) return false;
  return Boolean(
    db.prepare('SELECT id FROM produtos WHERE codigo_barras = ? AND id <> ?').get(codigoBarras, ignorarId)
  );
}

// GET /produtos
function listar(req, res) {
  const linhas = db.prepare('SELECT * FROM produtos ORDER BY nome COLLATE NOCASE').all();
  res.json(linhas.map(paraProduto));
}

// GET /produtos/:id
function buscarPorId(req, res) {
  const produto = buscar(lerId(req.params.id));
  if (!produto) return res.status(404).json({ mensagem: 'Produto não encontrado.' });
  res.json(produto);
}

// POST /produtos
function criar(req, res) {
  const { dados, erros } = validarProduto(req.body);
  if (Object.keys(erros).length) {
    return res.status(400).json({ mensagem: 'Verifique os campos destacados.', erros });
  }

  if (codigoEmUso(dados.codigoBarras)) {
    return res.status(409).json({ mensagem: 'Produto com este código de barras já está cadastrado!' });
  }

  const resultado = db
    .prepare(
      `INSERT INTO produtos
         (nome, codigo_barras, descricao, preco, quantidade, categoria, data_validade, imagem)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      dados.nome,
      dados.codigoBarras,
      dados.descricao,
      dados.preco,
      dados.quantidade,
      dados.categoria,
      dados.dataValidade,
      dados.imagem
    );

  res.status(201).json({
    mensagem: 'Produto cadastrado com sucesso!',
    produto: buscar(Number(resultado.lastInsertRowid)),
  });
}

// PUT /produtos/:id
function atualizar(req, res) {
  const id = lerId(req.params.id);
  if (!buscar(id)) return res.status(404).json({ mensagem: 'Produto não encontrado.' });

  const { dados, erros } = validarProduto(req.body);
  if (Object.keys(erros).length) {
    return res.status(400).json({ mensagem: 'Verifique os campos destacados.', erros });
  }

  if (codigoEmUso(dados.codigoBarras, id)) {
    return res.status(409).json({ mensagem: 'Produto com este código de barras já está cadastrado!' });
  }

  db.prepare(
    `UPDATE produtos
        SET nome = ?, codigo_barras = ?, descricao = ?, preco = ?, quantidade = ?,
            categoria = ?, data_validade = ?, imagem = ?
      WHERE id = ?`
  ).run(
    dados.nome,
    dados.codigoBarras,
    dados.descricao,
    dados.preco,
    dados.quantidade,
    dados.categoria,
    dados.dataValidade,
    dados.imagem,
    id
  );

  res.json({ mensagem: 'Produto atualizado com sucesso!', produto: buscar(id) });
}

// DELETE /produtos/:id
function remover(req, res) {
  const id = lerId(req.params.id);
  if (!buscar(id)) return res.status(404).json({ mensagem: 'Produto não encontrado.' });

  db.prepare('DELETE FROM produtos WHERE id = ?').run(id);
  res.json({ mensagem: 'Produto excluído com sucesso!' });
}

module.exports = { listar, buscarPorId, criar, atualizar, remover, buscar, paraProduto };
