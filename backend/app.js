const express = require('express');
const cors = require('cors');
const rotas = require('./src/routes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.get('/', (req, res) => {
  res.json({
    mensagem: 'API do Sistema de Controle de Estoque - Projeto Integrador (Faculdade Gran)',
    rotas: ['/produtos', '/fornecedores', '/produtos/:produtoId/fornecedores', '/fornecedores/:fornecedorId/produtos'],
  });
});

app.use(rotas);

// Rota inexistente
app.use((req, res) => {
  res.status(404).json({ mensagem: 'Rota não encontrada.' });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ mensagem: 'JSON inválido no corpo da requisição.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ mensagem: 'Arquivo muito grande. Envie uma imagem de até 2 MB.' });
  }
  console.error(err);
  res.status(500).json({ mensagem: 'Erro interno no servidor.' });
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}/`);
  });
}

module.exports = app;
