import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import Produtos from './pages/Produtos';
import Fornecedores from './pages/Fornecedores';
import Associacao from './pages/Associacao';

export default function App() {
  return (
    <div className="app">
      <header className="topo">
        <div className="topo-conteudo">
          <span className="marca">Controle de Estoque</span>
          <nav className="menu">
            <NavLink to="/produtos" end>Produtos</NavLink>
            <NavLink to="/fornecedores">Fornecedores</NavLink>
            <NavLink to="/associacao">Associação</NavLink>
          </nav>
        </div>
      </header>

      <main className="conteudo">
        <Routes>
          <Route path="/" element={<Navigate to="/produtos" replace />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/fornecedores" element={<Fornecedores />} />
          <Route path="/associacao" element={<Associacao />} />
          <Route path="/produtos/:produtoId/fornecedores" element={<Associacao />} />
          <Route path="*" element={<p className="vazio">Página não encontrada.</p>} />
        </Routes>
      </main>

      <footer className="rodape">Faculdade Gran · Projeto Integrador</footer>
    </div>
  );
}
