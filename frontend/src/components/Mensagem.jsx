// Exibe mensagens de sucesso ou erro retornadas pelo backend.
export default function Mensagem({ mensagem, aoFechar }) {
  if (!mensagem) return null;

  return (
    <div className={`mensagem ${mensagem.tipo}`} role={mensagem.tipo === 'erro' ? 'alert' : 'status'}>
      <span>{mensagem.texto}</span>
      {aoFechar && (
        <button type="button" className="fechar" onClick={aoFechar} aria-label="Fechar mensagem">
          ×
        </button>
      )}
    </div>
  );
}
