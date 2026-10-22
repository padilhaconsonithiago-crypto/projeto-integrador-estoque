import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, lerErro } from '../api';
import Campo from '../components/Campo';
import Mensagem from '../components/Mensagem';
import { formatarData, formatarMoeda, somenteDigitos } from '../utils/formatacao';

const CATEGORIAS = ['Eletrônicos', 'Alimentos', 'Vestuário', 'Higiene e Limpeza', 'Papelaria', 'Outro'];
const TAMANHO_MAXIMO_IMAGEM = 2 * 1024 * 1024; // 2 MB

const FORMULARIO_VAZIO = {
  nome: '',
  codigoBarras: '',
  descricao: '',
  preco: '',
  quantidade: '',
  categoria: '',
  categoriaOutra: '',
  dataValidade: '',
  imagem: '',
};

function validar(form) {
  const erros = {};
  if (!form.nome.trim()) erros.nome = 'Informe o nome do produto.';

  if (form.codigoBarras && !/^\d{8,14}$/.test(form.codigoBarras)) {
    erros.codigoBarras = 'O código de barras deve ter de 8 a 14 números.';
  }

  if (!form.descricao.trim()) erros.descricao = 'Descreva brevemente o produto.';

  if (form.preco !== '' && (Number.isNaN(Number(form.preco)) || Number(form.preco) < 0)) {
    erros.preco = 'Informe um preço válido.';
  }

  if (form.quantidade !== '') {
    const quantidade = Number(form.quantidade);
    if (!Number.isInteger(quantidade) || quantidade < 0) {
      erros.quantidade = 'Informe um número inteiro igual ou maior que zero.';
    }
  }

  if (!form.categoria) erros.categoria = 'Selecione uma categoria.';
  else if (form.categoria === 'Outro' && !form.categoriaOutra.trim()) {
    erros.categoriaOutra = 'Especifique a categoria.';
  }

  return erros;
}

function montarEnvio(form) {
  return {
    nome: form.nome,
    codigoBarras: form.codigoBarras || null,
    descricao: form.descricao,
    preco: form.preco === '' ? null : Number(form.preco),
    quantidade: form.quantidade === '' ? 0 : Number(form.quantidade),
    categoria: form.categoria === 'Outro' ? form.categoriaOutra.trim() : form.categoria,
    dataValidade: form.dataValidade || null,
    imagem: form.imagem || null,
  };
}

export default function Produtos() {
  const [form, setForm] = useState(FORMULARIO_VAZIO);
  const [erros, setErros] = useState({});
  const [editandoId, setEditandoId] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const [chaveArquivo, setChaveArquivo] = useState(0); // usada para limpar o campo de arquivo

  async function carregar() {
    try {
      const { data } = await api.get('/produtos');
      setProdutos(data);
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
    setChaveArquivo((chave) => chave + 1);
  }

  function selecionarImagem(evento) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;

    if (!arquivo.type.startsWith('image/')) {
      setErros((atual) => ({ ...atual, imagem: 'Selecione um arquivo de imagem.' }));
      evento.target.value = '';
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO_IMAGEM) {
      setErros((atual) => ({ ...atual, imagem: 'A imagem deve ter no máximo 2 MB.' }));
      evento.target.value = '';
      return;
    }

    const leitor = new FileReader();
    leitor.onload = () => alterar('imagem', leitor.result);
    leitor.readAsDataURL(arquivo);
  }

  function removerImagem() {
    alterar('imagem', '');
    setChaveArquivo((chave) => chave + 1);
  }

  async function enviar(evento) {
    evento.preventDefault();
    setMensagem(null);

    const errosEncontrados = validar(form);
    setErros(errosEncontrados);
    if (Object.keys(errosEncontrados).length > 0) return;

    setSalvando(true);
    try {
      const corpo = montarEnvio(form);
      const { data } = editandoId
        ? await api.put(`/produtos/${editandoId}`, corpo)
        : await api.post('/produtos', corpo);
      setMensagem({ tipo: 'sucesso', texto: data.mensagem });
      limpar();
      carregar();
    } catch (erro) {
      const { status, mensagem: texto, erros: errosApi } = lerErro(erro);
      setErros(status === 409 ? { codigoBarras: texto } : errosApi);
      setMensagem({ tipo: 'erro', texto });
    } finally {
      setSalvando(false);
    }
  }

  function editar(produto) {
    const categoriaPadrao = CATEGORIAS.includes(produto.categoria) && produto.categoria !== 'Outro';
    setForm({
      nome: produto.nome,
      codigoBarras: produto.codigoBarras ?? '',
      descricao: produto.descricao,
      preco: produto.preco ?? '',
      quantidade: produto.quantidade ?? '',
      categoria: categoriaPadrao ? produto.categoria : 'Outro',
      categoriaOutra: categoriaPadrao ? '' : produto.categoria,
      dataValidade: produto.dataValidade ?? '',
      imagem: produto.imagem ?? '',
    });
    setEditandoId(produto.id);
    setErros({});
    setMensagem(null);
    setChaveArquivo((chave) => chave + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function excluir(produto) {
    if (!window.confirm(`Excluir o produto "${produto.nome}"?`)) return;

    try {
      const { data } = await api.delete(`/produtos/${produto.id}`);
      setMensagem({ tipo: 'sucesso', texto: data.mensagem });
      if (editandoId === produto.id) limpar();
      carregar();
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: lerErro(erro).mensagem });
    }
  }

  return (
    <section className="pagina">
      <div className="cartao">
        <div className="cartao-cabecalho">
          <h1>{editandoId ? 'Editar Produto' : 'Cadastro de Produto'}</h1>
          {editandoId && (
            <button type="button" className="botao-secundario" onClick={limpar}>
              Cancelar edição
            </button>
          )}
        </div>

        <Mensagem mensagem={mensagem} aoFechar={() => setMensagem(null)} />

        <form className="grade-form" onSubmit={enviar} noValidate>
          <Campo id="nome" rotulo="Nome do Produto" obrigatorio erro={erros.nome}>
            <input
              id="nome"
              value={form.nome}
              onChange={(e) => alterar('nome', e.target.value)}
              placeholder="Insira o nome do produto"
            />
          </Campo>

          <Campo id="codigoBarras" rotulo="Código de Barras" erro={erros.codigoBarras}>
            <input
              id="codigoBarras"
              inputMode="numeric"
              maxLength={14}
              value={form.codigoBarras}
              onChange={(e) => alterar('codigoBarras', somenteDigitos(e.target.value))}
              placeholder="Insira o código de barras"
            />
          </Campo>

          <Campo id="descricao" rotulo="Descrição" obrigatorio erro={erros.descricao} largo>
            <textarea
              id="descricao"
              rows={3}
              value={form.descricao}
              onChange={(e) => alterar('descricao', e.target.value)}
              placeholder="Descreva brevemente o produto"
            />
          </Campo>

          <Campo id="preco" rotulo="Preço (R$)" erro={erros.preco}>
            <input
              id="preco"
              type="number"
              min="0"
              step="0.01"
              value={form.preco}
              onChange={(e) => alterar('preco', e.target.value)}
              placeholder="0,00"
            />
          </Campo>

          <Campo id="quantidade" rotulo="Quantidade em Estoque" erro={erros.quantidade}>
            <input
              id="quantidade"
              type="number"
              min="0"
              step="1"
              value={form.quantidade}
              onChange={(e) => alterar('quantidade', e.target.value)}
              placeholder="Quantidade disponível"
            />
          </Campo>

          <Campo id="categoria" rotulo="Categoria" obrigatorio erro={erros.categoria}>
            <select id="categoria" value={form.categoria} onChange={(e) => alterar('categoria', e.target.value)}>
              <option value="">Selecione uma categoria</option>
              {CATEGORIAS.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
          </Campo>

          {form.categoria === 'Outro' && (
            <Campo id="categoriaOutra" rotulo="Qual categoria?" obrigatorio erro={erros.categoriaOutra}>
              <input
                id="categoriaOutra"
                value={form.categoriaOutra}
                onChange={(e) => alterar('categoriaOutra', e.target.value)}
                placeholder="Especifique a categoria"
              />
            </Campo>
          )}

          <Campo id="dataValidade" rotulo="Data de Validade" erro={erros.dataValidade} ajuda="Se aplicável">
            <input
              id="dataValidade"
              type="date"
              value={form.dataValidade}
              onChange={(e) => alterar('dataValidade', e.target.value)}
              title="Selecione a data de validade"
            />
          </Campo>

          <Campo id="imagem" rotulo="Imagem do Produto" erro={erros.imagem} ajuda="Se aplicável · até 2 MB">
            <input key={chaveArquivo} id="imagem" type="file" accept="image/*" onChange={selecionarImagem} />
          </Campo>

          {form.imagem && (
            <div className="campo previa">
              <img src={form.imagem} alt="Pré-visualização da imagem do produto" />
              <button type="button" className="botao-link perigo" onClick={removerImagem}>
                Remover imagem
              </button>
            </div>
          )}

          <div className="acoes-form">
            <button type="submit" className="botao-primario" disabled={salvando}>
              {salvando ? 'Salvando...' : editandoId ? 'Salvar alterações' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>

      <div className="cartao">
        <h2>Produtos cadastrados</h2>
        {carregando ? (
          <p className="vazio">Carregando...</p>
        ) : produtos.length === 0 ? (
          <p className="vazio">Nenhum produto cadastrado.</p>
        ) : (
          <div className="tabela-rolagem">
            <table>
              <thead>
                <tr>
                  <th>Imagem</th>
                  <th>Nome</th>
                  <th>Código de barras</th>
                  <th>Categoria</th>
                  <th className="numero">Qtd.</th>
                  <th className="numero">Preço</th>
                  <th>Validade</th>
                  <th className="col-acoes">Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((produto) => (
                  <tr key={produto.id}>
                    <td>
                      {produto.imagem ? (
                        <img className="miniatura" src={produto.imagem} alt="" />
                      ) : (
                        <span className="miniatura sem-imagem" aria-hidden="true" />
                      )}
                    </td>
                    <td>{produto.nome}</td>
                    <td className="nowrap">{produto.codigoBarras || '—'}</td>
                    <td>{produto.categoria}</td>
                    <td className="numero">{produto.quantidade}</td>
                    <td className="numero nowrap">{formatarMoeda(produto.preco)}</td>
                    <td className="nowrap">{formatarData(produto.dataValidade)}</td>
                    <td className="col-acoes">
                      <button type="button" className="botao-link" onClick={() => editar(produto)}>
                        Editar
                      </button>
                      <Link className="botao-link" to={`/produtos/${produto.id}/fornecedores`}>
                        Fornecedores
                      </Link>
                      <button type="button" className="botao-link perigo" onClick={() => excluir(produto)}>
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
