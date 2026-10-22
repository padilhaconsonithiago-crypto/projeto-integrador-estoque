import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, lerErro } from '../api';
import Campo from '../components/Campo';
import Mensagem from '../components/Mensagem';
import { formatarCNPJ } from '../utils/formatacao';

export default function Associacao() {
  const { produtoId } = useParams();
  const navegar = useNavigate();

  const [produtos, setProdutos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [produto, setProduto] = useState(null);
  const [associados, setAssociados] = useState([]);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState('');
  const [erroSelecao, setErroSelecao] = useState('');
  const [mensagem, setMensagem] = useState(null);

  // Consulta inversa: produtos fornecidos por um fornecedor
  const [fornecedorConsulta, setFornecedorConsulta] = useState('');
  const [produtosDoFornecedor, setProdutosDoFornecedor] = useState([]);
  const [versao, setVersao] = useState(0); // muda a cada associação/desassociação

  // Carrega listas de produtos e fornecedores para os menus suspensos
  useEffect(() => {
    Promise.all([api.get('/produtos'), api.get('/fornecedores')])
      .then(([respostaProdutos, respostaFornecedores]) => {
        setProdutos(respostaProdutos.data);
        setFornecedores(respostaFornecedores.data);
      })
      .catch((erro) => setMensagem({ tipo: 'erro', texto: lerErro(erro).mensagem }));
  }, []);

  // Carrega os detalhes do produto escolhido e seus fornecedores associados
  useEffect(() => {
    setProduto(null);
    setAssociados([]);
    setFornecedorSelecionado('');
    setErroSelecao('');
    if (!produtoId) return undefined;

    let ativo = true;
    Promise.all([api.get(`/produtos/${produtoId}`), api.get(`/produtos/${produtoId}/fornecedores`)])
      .then(([respostaProduto, respostaAssociados]) => {
        if (!ativo) return;
        setProduto(respostaProduto.data);
        setAssociados(respostaAssociados.data);
      })
      .catch((erro) => {
        if (ativo) setMensagem({ tipo: 'erro', texto: lerErro(erro).mensagem });
      });

    return () => {
      ativo = false;
    };
  }, [produtoId]);

  // Atualiza a consulta inversa
  useEffect(() => {
    if (!fornecedorConsulta) {
      setProdutosDoFornecedor([]);
      return;
    }
    api
      .get(`/fornecedores/${fornecedorConsulta}/produtos`)
      .then(({ data }) => setProdutosDoFornecedor(data))
      .catch((erro) => setMensagem({ tipo: 'erro', texto: lerErro(erro).mensagem }));
  }, [fornecedorConsulta, versao]);

  async function recarregarAssociados() {
    const { data } = await api.get(`/produtos/${produtoId}/fornecedores`);
    setAssociados(data);
    setVersao((v) => v + 1);
  }

  function escolherProduto(id) {
    setMensagem(null);
    navegar(id ? `/produtos/${id}/fornecedores` : '/associacao');
  }

  async function associar() {
    setMensagem(null);
    if (!fornecedorSelecionado) {
      setErroSelecao('Selecione um fornecedor.');
      return;
    }

    try {
      const { data } = await api.post(`/produtos/${produtoId}/fornecedores`, {
        fornecedorId: Number(fornecedorSelecionado),
      });
      setMensagem({ tipo: 'sucesso', texto: data.mensagem });
      setFornecedorSelecionado('');
      await recarregarAssociados();
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: lerErro(erro).mensagem });
    }
  }

  async function desassociar(fornecedor) {
    setMensagem(null);
    try {
      const { data } = await api.delete(`/produtos/${produtoId}/fornecedores/${fornecedor.id}`);
      setMensagem({ tipo: 'sucesso', texto: data.mensagem });
      await recarregarAssociados();
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: lerErro(erro).mensagem });
    }
  }

  return (
    <section className="pagina">
      <div className="cartao">
        <div className="cartao-cabecalho">
          <h1>Associação de Fornecedor a Produto</h1>
          {produtoId && (
            <Link className="botao-secundario" to="/produtos">
              Voltar
            </Link>
          )}
        </div>

        <Mensagem mensagem={mensagem} aoFechar={() => setMensagem(null)} />

        <div className="grade-form">
          <Campo id="produto" rotulo="Produto" largo>
            <select id="produto" value={produtoId || ''} onChange={(e) => escolherProduto(e.target.value)}>
              <option value="">Selecione um produto</option>
              {produtos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                  {p.codigoBarras ? ` — ${p.codigoBarras}` : ''}
                </option>
              ))}
            </select>
          </Campo>
        </div>

        {produtos.length === 0 && (
          <p className="vazio">
            Nenhum produto cadastrado. <Link to="/produtos">Cadastre um produto</Link> primeiro.
          </p>
        )}

        {produto && (
          <>
            <h2>Detalhes do Produto</h2>
            <div className="detalhes-produto">
              {produto.imagem ? (
                <img className="imagem-detalhe" src={produto.imagem} alt={`Imagem de ${produto.nome}`} />
              ) : (
                <div className="imagem-detalhe sem-imagem">Sem imagem</div>
              )}
              <div className="grade-form">
                <Campo id="detalheNome" rotulo="Nome do Produto">
                  <input id="detalheNome" value={produto.nome} readOnly />
                </Campo>
                <Campo id="detalheCodigo" rotulo="Código de Barras">
                  <input id="detalheCodigo" value={produto.codigoBarras || '—'} readOnly />
                </Campo>
                <Campo id="detalheDescricao" rotulo="Descrição" largo>
                  <textarea id="detalheDescricao" rows={2} value={produto.descricao} readOnly />
                </Campo>
              </div>
            </div>

            <h2>Associação de Fornecedor</h2>
            {fornecedores.length === 0 ? (
              <p className="vazio">
                Nenhum fornecedor cadastrado. <Link to="/fornecedores">Cadastre um fornecedor</Link> primeiro.
              </p>
            ) : (
              <div className="linha-associar">
                <Campo id="fornecedor" rotulo="Fornecedor" erro={erroSelecao}>
                  <select
                    id="fornecedor"
                    value={fornecedorSelecionado}
                    onChange={(e) => {
                      setFornecedorSelecionado(e.target.value);
                      setErroSelecao('');
                    }}
                  >
                    <option value="">Selecione um fornecedor</option>
                    {fornecedores.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.nome} — {formatarCNPJ(f.cnpj)}
                      </option>
                    ))}
                  </select>
                </Campo>
                <button type="button" className="botao-primario" onClick={associar}>
                  Associar Fornecedor
                </button>
              </div>
            )}

            <h2>Fornecedores Associados</h2>
            {associados.length === 0 ? (
              <p className="vazio">Nenhum fornecedor associado a este produto.</p>
            ) : (
              <div className="tabela-rolagem">
                <table>
                  <thead>
                    <tr>
                      <th>Nome do Fornecedor</th>
                      <th>CNPJ</th>
                      <th className="col-acoes">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {associados.map((f) => (
                      <tr key={f.id}>
                        <td>{f.nome}</td>
                        <td className="nowrap">{formatarCNPJ(f.cnpj)}</td>
                        <td className="col-acoes">
                          <button type="button" className="botao-link perigo" onClick={() => desassociar(f)}>
                            Desassociar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      <div className="cartao">
        <h2>Consultar produtos por fornecedor</h2>
        <div className="grade-form">
          <Campo id="fornecedorConsulta" rotulo="Fornecedor" largo>
            <select
              id="fornecedorConsulta"
              value={fornecedorConsulta}
              onChange={(e) => setFornecedorConsulta(e.target.value)}
            >
              <option value="">Selecione um fornecedor</option>
              {fornecedores.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome} — {formatarCNPJ(f.cnpj)}
                </option>
              ))}
            </select>
          </Campo>
        </div>

        {fornecedorConsulta &&
          (produtosDoFornecedor.length === 0 ? (
            <p className="vazio">Este fornecedor ainda não está associado a nenhum produto.</p>
          ) : (
            <div className="tabela-rolagem">
              <table>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Código de barras</th>
                    <th>Categoria</th>
                    <th className="numero">Qtd.</th>
                    <th className="col-acoes">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {produtosDoFornecedor.map((p) => (
                    <tr key={p.id}>
                      <td>{p.nome}</td>
                      <td className="nowrap">{p.codigoBarras || '—'}</td>
                      <td>{p.categoria}</td>
                      <td className="numero">{p.quantidade}</td>
                      <td className="col-acoes">
                        <Link className="botao-link" to={`/produtos/${p.id}/fornecedores`}>
                          Ver associação
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
      </div>
    </section>
  );
}
