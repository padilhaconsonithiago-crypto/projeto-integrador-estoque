FACULDADE GRAN (https://faculdade.grancursosonline.com.br/)

Projeto Disciplina Projeto Integrador

# Sistema de Controle de Estoque

Aplicação fullstack para cadastro de **fornecedores**, cadastro de **produtos** e **associação entre produtos e fornecedores** (relação muitos-para-muitos), construída a partir das histórias de usuário do Projeto Integrador.

| Pasta | Conteúdo |
|---|---|
| [`backend/`](backend) | API REST em Node.js + Express com banco SQLite |
| [`frontend/`](frontend) | Aplicação React (Vite) com as páginas de Produto, Fornecedor e Associação |

## Tecnologias

- **Backend:** Node.js, Express, SQLite (módulo nativo `node:sqlite`), CORS
- **Frontend:** React, React Router, Axios, Vite
- **Testes da API:** Insomnia (coleção pronta em `backend/insomnia/colecao-insomnia.json`)
- **Ferramentas:** Visual Studio Code, Git e GitHub

## Pré-requisitos

- [Node.js](https://nodejs.org/en) na versão LTS (22.13 ou superior)
- [Insomnia](https://insomnia.rest/download) ou Postman, para testar a API

## Como executar

Abra dois terminais no Visual Studio Code.

**Terminal 1 – backend** (http://localhost:3000)

```bash
cd backend
npm install
npm start
```

**Terminal 2 – frontend** (http://localhost:5173)

```bash
cd frontend
npm install
npm run dev
```

O banco `backend/database.sqlite` é criado automaticamente na primeira execução.

## Rotas da API

| Método | Rota | Descrição |
|---|---|---|
| GET | `/fornecedores` | Lista os fornecedores |
| GET | `/fornecedores/:id` | Busca um fornecedor |
| POST | `/fornecedores` | Cadastra um fornecedor |
| PUT | `/fornecedores/:id` | Atualiza um fornecedor |
| DELETE | `/fornecedores/:id` | Exclui um fornecedor |
| GET | `/produtos` | Lista os produtos |
| GET | `/produtos/:id` | Busca um produto |
| POST | `/produtos` | Cadastra um produto |
| PUT | `/produtos/:id` | Atualiza um produto |
| DELETE | `/produtos/:id` | Exclui um produto |
| GET | `/produtos/:produtoId/fornecedores` | Lista os fornecedores de um produto |
| POST | `/produtos/:produtoId/fornecedores` | Associa um fornecedor ao produto (corpo: `{ "fornecedorId": 1 }`) |
| DELETE | `/produtos/:produtoId/fornecedores/:fornecedorId` | Desassocia o fornecedor do produto |
| GET | `/fornecedores/:fornecedorId/produtos` | Lista os produtos de um fornecedor |

### Códigos de resposta

| Código | Quando ocorre |
|---|---|
| 200 OK | Consulta, atualização, exclusão ou desassociação realizada |
| 201 Created | Cadastro ou associação realizada |
| 400 Bad Request | Campos obrigatórios em branco ou inválidos (o corpo traz `erros` por campo) |
| 404 Not Found | Registro não encontrado |
| 409 Conflict | CNPJ ou código de barras já cadastrado, ou fornecedor já associado ao produto |

## Regras de negócio (histórias de usuário)

- Não é permitido cadastrar dois fornecedores com o mesmo CNPJ: *"Fornecedor com esse CNPJ já está cadastrado!"*
- Não é permitido cadastrar dois produtos com o mesmo código de barras: *"Produto com este código de barras já está cadastrado!"*
- Campos obrigatórios em branco ou inválidos impedem o cadastro e exibem mensagens ao lado de cada campo.
- O mesmo fornecedor não pode ser associado duas vezes ao mesmo produto: *"Fornecedor já está associado a este produto!"*
- Ao excluir um produto ou fornecedor, suas associações são removidas automaticamente.

## Testando com o Insomnia

1. Inicie o backend (`npm start` dentro de `backend`).
2. No Insomnia, use **Import** e selecione o arquivo `backend/insomnia/colecao-insomnia.json`.
3. Execute as requisições na ordem das pastas: Fornecedores → Produtos → Associação.

## Estrutura

```
backend/
  app.js                         # servidor Express
  src/database.js                # conexão e criação das tabelas SQLite
  src/routes.js                  # rotas da API
  src/validacoes.js              # validação de CNPJ, e-mail, telefone etc.
  src/controllers/
    produtoController.js
    fornecedorController.js
    associacaoController.js
  insomnia/colecao-insomnia.json
frontend/
  src/App.jsx                    # menu e rotas
  src/api.js                     # cliente Axios
  src/pages/Produtos.jsx
  src/pages/Fornecedores.jsx
  src/pages/Associacao.jsx
  src/components/                # Campo e Mensagem
  src/utils/formatacao.js        # máscaras de CNPJ e telefone
```
