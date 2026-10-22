// Insere dados de exemplo quando o banco está vazio.
// Útil no servidor gratuito da nuvem, que apaga o arquivo SQLite sempre que reinicia:
// assim o professor sempre encontra dados para testar as chamadas no Insomnia.
// Para desativar, defina a variável de ambiente DADOS_EXEMPLO=false.

function inserirDadosExemplo(db) {
  if (process.env.DADOS_EXEMPLO === 'false') return;

  const { total: totalFornecedores } = db.prepare('SELECT COUNT(*) AS total FROM fornecedores').get();
  const { total: totalProdutos } = db.prepare('SELECT COUNT(*) AS total FROM produtos').get();
  if (totalFornecedores > 0 || totalProdutos > 0) return;

  const inserirFornecedor = db.prepare(
    `INSERT INTO fornecedores (nome, cnpj, endereco, telefone, email, contato) VALUES (?, ?, ?, ?, ?, ?)`
  );
  const inserirProduto = db.prepare(
    `INSERT INTO produtos (nome, codigo_barras, descricao, preco, quantidade, categoria, data_validade)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  const associar = db.prepare('INSERT INTO produto_fornecedor (produto_id, fornecedor_id) VALUES (?, ?)');

  db.exec('BEGIN');
  try {
    inserirFornecedor.run('Distribuidora Alfa Ltda', '11222333000181', 'Rua das Flores, 100 - Centro - Gravataí/RS', '5133334444', 'contato@alfa.com.br', 'Maria Souza');
    inserirFornecedor.run('Beta Comércio de Eletrônicos', '45723174000110', 'Av. Brasil, 2000 - Porto Alegre/RS', '51999998888', 'vendas@beta.com.br', 'João Pereira');

    inserirProduto.run('Notebook 15 polegadas', '7891234567895', 'Notebook com 16 GB de RAM e SSD de 512 GB', 3599.9, 10, 'Eletrônicos', null);
    inserirProduto.run('Arroz Integral 1 kg', '7896543210982', 'Pacote de arroz integral tipo 1', 8.49, 120, 'Alimentos', '2027-06-30');
    inserirProduto.run('Camiseta Básica', null, 'Camiseta 100% algodão, tamanho M', 39.9, 35, 'Vestuário', null);

    associar.run(1, 1); // Notebook <- Alfa
    associar.run(1, 2); // Notebook <- Beta
    associar.run(2, 1); // Arroz    <- Alfa

    db.exec('COMMIT');
  } catch (erro) {
    db.exec('ROLLBACK');
    throw erro;
  }
}

module.exports = inserirDadosExemplo;
