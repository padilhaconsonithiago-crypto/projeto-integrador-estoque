const { Router } = require('express');
const produto = require('./controllers/produtoController');
const fornecedor = require('./controllers/fornecedorController');
const associacao = require('./controllers/associacaoController');

const rotas = Router();

// Produtos (CRUD)
rotas.get('/produtos', produto.listar);
rotas.get('/produtos/:id', produto.buscarPorId);
rotas.post('/produtos', produto.criar);
rotas.put('/produtos/:id', produto.atualizar);
rotas.delete('/produtos/:id', produto.remover);

// Fornecedores (CRUD)
rotas.get('/fornecedores', fornecedor.listar);
rotas.get('/fornecedores/:id', fornecedor.buscarPorId);
rotas.post('/fornecedores', fornecedor.criar);
rotas.put('/fornecedores/:id', fornecedor.atualizar);
rotas.delete('/fornecedores/:id', fornecedor.remover);

// Associação Produto/Fornecedor
rotas.get('/produtos/:produtoId/fornecedores', associacao.listarFornecedoresDoProduto);
rotas.post('/produtos/:produtoId/fornecedores', associacao.associar);
rotas.delete('/produtos/:produtoId/fornecedores/:fornecedorId', associacao.desassociar);
rotas.get('/fornecedores/:fornecedorId/produtos', associacao.listarProdutosDoFornecedor);

module.exports = rotas;
