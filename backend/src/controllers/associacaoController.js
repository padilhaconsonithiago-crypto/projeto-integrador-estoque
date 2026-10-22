// Controlador de Associação Produto/Fornecedor (relação muitos-para-muitos).
const db = require('../database');
const { lerId } = require('../validacoes');
const produtoController = require('./produtoController');
const fornecedorController = require('./fornecedorController');

function associacaoExiste(produtoId, fornecedorId) {
  return Boolean(
    db
      .prepare('SELECT 1 FROM produto_fornecedor WHERE produto_id = ? AND fornecedor_id = ?')
      .get(produtoId, fornecedorId)
  );
}

// GET /produtos/:produtoId/fornecedores
// Lista os fornecedores associados a um produto.
function listarFornecedoresDoProduto(req, res) {
  const produtoId = lerId(req.params.produtoId);
  if (!produtoController.buscar(produtoId)) {
    return res.status(404).json({ mensagem: 'Produto não encontrado.' });
  }

  const linhas = db
    .prepare(
      `SELECT f.*
         FROM fornecedores f
         JOIN produto_fornecedor pf ON pf.fornecedor_id = f.id
        WHERE pf.produto_id = ?
        ORDER BY f.nome COLLATE NOCASE`
    )
    .all(produtoId);

  res.json(linhas.map(fornecedorController.paraFornecedor));
}

// GET /fornecedores/:fornecedorId/produtos
// Lista os produtos fornecidos por um fornecedor (consulta inversa).
function listarProdutosDoFornecedor(req, res) {
  const fornecedorId = lerId(req.params.fornecedorId);
  if (!fornecedorController.buscar(fornecedorId)) {
    return res.status(404).json({ mensagem: 'Fornecedor não encontrado.' });
  }

  const linhas = db
    .prepare(
      `SELECT p.*
         FROM produtos p
         JOIN produto_fornecedor pf ON pf.produto_id = p.id
        WHERE pf.fornecedor_id = ?
        ORDER BY p.nome COLLATE NOCASE`
    )
    .all(fornecedorId);

  res.json(linhas.map(produtoController.paraProduto));
}

// POST /produtos/:produtoId/fornecedores   corpo: { "fornecedorId": 1 }
function associar(req, res) {
  const produtoId = lerId(req.params.produtoId);
  if (!produtoController.buscar(produtoId)) {
    return res.status(404).json({ mensagem: 'Produto não encontrado.' });
  }

  const fornecedorId = lerId(req.body?.fornecedorId);
  if (!fornecedorId) {
    return res.status(400).json({
      mensagem: 'Selecione um fornecedor.',
      erros: { fornecedorId: 'Selecione um fornecedor.' },
    });
  }

  const fornecedor = fornecedorController.buscar(fornecedorId);
  if (!fornecedor) {
    return res.status(404).json({ mensagem: 'Fornecedor não encontrado.' });
  }

  if (associacaoExiste(produtoId, fornecedorId)) {
    return res.status(409).json({ mensagem: 'Fornecedor já está associado a este produto!' });
  }

  db.prepare('INSERT INTO produto_fornecedor (produto_id, fornecedor_id) VALUES (?, ?)').run(
    produtoId,
    fornecedorId
  );

  res.status(201).json({ mensagem: 'Fornecedor associado com sucesso ao produto!', fornecedor });
}

// DELETE /produtos/:produtoId/fornecedores/:fornecedorId
function desassociar(req, res) {
  const produtoId = lerId(req.params.produtoId);
  const fornecedorId = lerId(req.params.fornecedorId);

  if (!associacaoExiste(produtoId, fornecedorId)) {
    return res.status(404).json({ mensagem: 'Este fornecedor não está associado a este produto.' });
  }

  db.prepare('DELETE FROM produto_fornecedor WHERE produto_id = ? AND fornecedor_id = ?').run(
    produtoId,
    fornecedorId
  );

  res.json({ mensagem: 'Fornecedor desassociado com sucesso!' });
}

module.exports = {
  listarFornecedoresDoProduto,
  listarProdutosDoFornecedor,
  associar,
  desassociar,
};
