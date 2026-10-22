// Funções de validação usadas pelos controllers.

function somenteDigitos(valor) {
  return String(valor ?? '').replace(/\D/g, '');
}

function texto(valor) {
  return valor == null ? '' : String(valor).trim();
}

function vazio(valor) {
  return valor == null || String(valor).trim() === '';
}

function cnpjValido(valor) {
  const cnpj = somenteDigitos(valor);
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;

  const calcularDigito = (base) => {
    const pesos = base.length === 12
      ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
      : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const soma = base.split('').reduce((total, digito, i) => total + Number(digito) * pesos[i], 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const base = cnpj.slice(0, 12);
  const digito1 = calcularDigito(base);
  const digito2 = calcularDigito(base + digito1);
  return cnpj === `${base}${digito1}${digito2}`;
}

function emailValido(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
}

function telefoneValido(valor) {
  const digitos = somenteDigitos(valor);
  return digitos.length === 10 || digitos.length === 11;
}

function dataValida(valor) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const data = new Date(`${valor}T00:00:00Z`);
  return !Number.isNaN(data.getTime()) && data.toISOString().startsWith(valor);
}

function validarFornecedor(corpo = {}) {
  const dados = {
    nome: texto(corpo.nome),
    cnpj: somenteDigitos(corpo.cnpj),
    endereco: texto(corpo.endereco),
    telefone: somenteDigitos(corpo.telefone),
    email: texto(corpo.email).toLowerCase(),
    contato: texto(corpo.contato),
  };

  const erros = {};
  if (!dados.nome) erros.nome = 'Informe o nome da empresa.';

  if (!dados.cnpj) erros.cnpj = 'Informe o CNPJ.';
  else if (!cnpjValido(dados.cnpj)) erros.cnpj = 'CNPJ inválido.';

  if (!dados.endereco) erros.endereco = 'Informe o endereço completo.';

  if (!dados.telefone) erros.telefone = 'Informe o telefone.';
  else if (!telefoneValido(dados.telefone)) erros.telefone = 'Telefone inválido. Use DDD + número.';

  if (!dados.email) erros.email = 'Informe o e-mail.';
  else if (!emailValido(dados.email)) erros.email = 'E-mail inválido.';

  if (!dados.contato) erros.contato = 'Informe o nome do contato principal.';

  return { dados, erros };
}

const TAMANHO_MAXIMO_IMAGEM = 2 * 1024 * 1024; // 2 MB

function validarProduto(corpo = {}) {
  const erros = {};

  const dados = {
    nome: texto(corpo.nome),
    codigoBarras: vazio(corpo.codigoBarras) ? null : texto(corpo.codigoBarras),
    descricao: texto(corpo.descricao),
    preco: null,
    quantidade: 0,
    categoria: texto(corpo.categoria),
    dataValidade: vazio(corpo.dataValidade) ? null : texto(corpo.dataValidade),
    imagem: vazio(corpo.imagem) ? null : String(corpo.imagem),
  };

  if (!dados.nome) erros.nome = 'Informe o nome do produto.';

  if (dados.codigoBarras && !/^\d{8,14}$/.test(dados.codigoBarras)) {
    erros.codigoBarras = 'O código de barras deve ter de 8 a 14 números.';
  }

  if (!dados.descricao) erros.descricao = 'Descreva brevemente o produto.';

  if (!vazio(corpo.preco)) {
    const preco = Number(String(corpo.preco).replace(',', '.'));
    if (Number.isNaN(preco) || preco < 0) erros.preco = 'Informe um preço válido.';
    else dados.preco = Math.round(preco * 100) / 100;
  }

  if (!vazio(corpo.quantidade)) {
    const quantidade = Number(corpo.quantidade);
    if (!Number.isInteger(quantidade) || quantidade < 0) {
      erros.quantidade = 'A quantidade deve ser um número inteiro igual ou maior que zero.';
    } else {
      dados.quantidade = quantidade;
    }
  }

  if (!dados.categoria) erros.categoria = 'Selecione uma categoria.';

  if (dados.dataValidade && !dataValida(dados.dataValidade)) {
    erros.dataValidade = 'Data de validade inválida (use o formato AAAA-MM-DD).';
  }

  if (dados.imagem) {
    if (!dados.imagem.startsWith('data:image/')) {
      erros.imagem = 'Envie um arquivo de imagem válido.';
    } else if (dados.imagem.length > Math.ceil(TAMANHO_MAXIMO_IMAGEM * 1.37)) {
      erros.imagem = 'A imagem deve ter no máximo 2 MB.';
    }
  }

  return { dados, erros };
}

function lerId(valor) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

module.exports = {
  somenteDigitos,
  cnpjValido,
  emailValido,
  telefoneValido,
  validarFornecedor,
  validarProduto,
  lerId,
};
