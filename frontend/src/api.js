import axios from 'axios';

// Endereço do backend. Pode ser alterado criando um arquivo .env com VITE_API_URL=...
export const URL_API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({ baseURL: URL_API });

// Converte um erro do Axios em { status, mensagem, erros } para exibir na tela.
export function lerErro(erro) {
  if (erro.response) {
    return {
      status: erro.response.status,
      mensagem: erro.response.data?.mensagem || 'Não foi possível concluir a operação.',
      erros: erro.response.data?.erros || {},
    };
  }
  return {
    status: 0,
    mensagem: `Não foi possível conectar ao servidor. Verifique se o backend está rodando em ${URL_API}.`,
    erros: {},
  };
}
