import { useEffect, useState } from 'react';
import { api, lerErro } from '../api';
import Campo from '../components/Campo';
import Mensagem from '../components/Mensagem';
import {
  cnpjValido,
  emailValido,
  formatarCNPJ,
  formatarTelefone,
  somenteDigitos,
} from '../utils/formatacao';

const FORMULARIO_VAZIO = { nome: '', cnpj: '', endereco: '', telefone: '', email: '', contato: '' };

function validar(form) {
  const erros = {};
  if (!form.nome.trim()) erros.nome = 'Informe o nome da empresa.';

  if (!somenteDigitos(form.cnpj)) erros.cnpj = 'Informe o CNPJ.';
  else if (!cnpjValido(form.cnpj)) erros.cnpj = 'CNPJ inválido.';

  if (!form.endereco.trim()) erros.endereco = 'Informe o endereço completo.';

  const telefone = somenteDigitos(form.telefone);
  if (!telefone) erros.telefone = 'Informe o telefone.';
  else if (telefone.length < 10) erros.telefone = 'Telefone inválido. Use DDD + número.';

  if (!form.email.trim()) erros.email = 'Informe o e-mail.';
  else if (!emailValido(form.email)) erros.email = 'E-mail inválido.';

  if (!form.contato.trim()) erros.contato = 'Informe o nome do contato principal.';
  return erros;
}

export default function Fornecedores() {
  const [form, setForm] = useState(FORMULARIO_VAZIO);
  const [erros, setErros] = useState({});
  const [editandoId, setEditandoId] = useState(null);
  const [fornecedores, setFornecedores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  async function carregar() {
    try {
      const { data } = await api.get('/fornecedores');
      setFornecedores(data);
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: lerErro(erro).mensagem });
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function alterar(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setErros((atual) => ({ ...atual, [campo]: undefined }));
  }

  function limpar() {
    setForm(FORMULARIO_VAZIO);
    setErros({});
    setEditandoId(null);
  }

  async function enviar(evento) {
    evento.preventDefault();
    setMensagem(null);

    const errosEncontrados = validar(form);
    setErros(errosEncontrados);
    if (Object.keys(errosEncontrados).length > 0) return;

    setSalvando(true);
    try {
      const { data } = editandoId
        ? await api.put(`/fornecedores/${editandoId}`, form)
        : await api.post('/fornecedores', form);
      setMensagem({ tipo: 'sucesso', texto: data.mensagem });
      limpar();
      carregar();
    } catch (erro) {
      const { status, mensagem: texto, erros: errosApi } = lerErro(erro);
      setErros(status === 409 ? { cnpj: texto } : errosApi);
      setMensagem({ tipo: 'erro', texto });
    } finally {
      setSalvando(false);
    }
  }

  function editar(fornecedor) {
    setForm({
      nome: fornecedor.nome,
      cnpj: formatarCNPJ(fornecedor.cnpj),
      endereco: fornecedor.endereco,
      telefone: formatarTelefone(fornecedor.telefone),
      email: fornecedor.email,
      contato: fornecedor.contato,
    });
    setEditandoId(fornecedor.id);
    setErros({});
    setMensagem(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function excluir(fornecedor) {
    const confirmou = window.confirm(
      `Excluir o fornecedor "${fornecedor.nome}"? As associações com produtos também serão removidas.`
    );
    if (!confirmou) return;

    try {
      const { data } = await api.delete(`/fornecedores/${fornecedor.id}`);
      setMensagem({ tipo: 'sucesso', texto: data.mensagem });
      if (editandoId === fornecedor.id) limpar();
      carregar();
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: lerErro(erro).mensagem });
    }
  }

  return (
    <section className="pagina">
      <div className="cartao">
        <div className="cartao-cabecalho">
          <h1>{editandoId ? 'Editar Fornecedor' : 'Cadastro de Fornecedor'}</h1>
          {editandoId && (
            <button type="button" className="botao-secundario" onClick={limpar}>
              Cancelar edição
            </button>
          )}
        </div>

        <Mensagem mensagem={mensagem} aoFechar={() => setMensagem(null)} />

        <form className="grade-form" onSubmit={enviar} noValidate>
          <Campo id="nome" rotulo="Nome da Empresa" obrigatorio erro={erros.nome}>
            <input
              id="nome"
              value={form.nome}
              onChange={(e) => alterar('nome', e.target.value)}
              placeholder="Insira o nome da empresa"
            />
          </Campo>

          <Campo id="cnpj" rotulo="CNPJ" obrigatorio erro={erros.cnpj}>
            <input
              id="cnpj"
              inputMode="numeric"
              value={form.cnpj}
              onChange={(e) => alterar('cnpj', formatarCNPJ(e.target.value))}
              placeholder="00.000.000/0000-00"
            />
          </Campo>

          <Campo id="endereco" rotulo="Endereço" obrigatorio erro={erros.endereco} largo>
            <textarea
              id="endereco"
              rows={2}
              value={form.endereco}
              onChange={(e) => alterar('endereco', e.target.value)}
              placeholder="Insira o endereço completo da empresa"
            />
          </Campo>

          <Campo id="telefone" rotulo="Telefone" obrigatorio erro={erros.telefone}>
            <input
              id="telefone"
              type="tel"
              inputMode="numeric"
              value={form.telefone}
              onChange={(e) => alterar('telefone', formatarTelefone(e.target.value))}
              placeholder="(00) 0000-0000"
            />
          </Campo>

          <Campo id="email" rotulo="E-mail" obrigatorio erro={erros.email}>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => alterar('email', e.target.value)}
              placeholder="exemplo@fornecedor.com"
            />
          </Campo>

          <Campo id="contato" rotulo="Contato Principal" obrigatorio erro={erros.contato}>
            <input
              id="contato"
              value={form.contato}
              onChange={(e) => alterar('contato', e.target.value)}
              placeholder="Nome do contato principal"
            />
          </Campo>

          <div className="acoes-form">
            <button type="submit" className="botao-primario" disabled={salvando}>
              {salvando ? 'Salvando...' : editandoId ? 'Salvar alterações' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>

      <div className="cartao">
        <h2>Fornecedores cadastrados</h2>
        {carregando ? (
          <p className="vazio">Carregando...</p>
        ) : fornecedores.length === 0 ? (
          <p className="vazio">Nenhum fornecedor cadastrado.</p>
        ) : (
          <div className="tabela-rolagem">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CNPJ</th>
                  <th>Telefone</th>
                  <th>E-mail</th>
                  <th>Contato</th>
                  <th className="col-acoes">Ações</th>
                </tr>
              </thead>
              <tbody>
                {fornecedores.map((fornecedor) => (
                  <tr key={fornecedor.id}>
                    <td>{fornecedor.nome}</td>
                    <td className="nowrap">{formatarCNPJ(fornecedor.cnpj)}</td>
                    <td className="nowrap">{formatarTelefone(fornecedor.telefone)}</td>
                    <td>{fornecedor.email}</td>
                    <td>{fornecedor.contato}</td>
                    <td className="col-acoes">
                      <button type="button" className="botao-link" onClick={() => editar(fornecedor)}>
                        Editar
                      </button>
                      <button type="button" className="botao-link perigo" onClick={() => excluir(fornecedor)}>
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
