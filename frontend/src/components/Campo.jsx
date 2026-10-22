// Agrupa rótulo, campo e mensagem de erro exibida ao lado (abaixo) do campo.
export default function Campo({ id, rotulo, obrigatorio = false, erro, ajuda, largo = false, children }) {
  const classes = ['campo'];
  if (erro) classes.push('invalido');
  if (largo) classes.push('largo');

  return (
    <div className={classes.join(' ')}>
      <label htmlFor={id}>
        {rotulo}
        {obrigatorio && <span className="obrigatorio"> *</span>}
      </label>
      {children}
      {erro ? (
        <span className="erro-campo" role="alert">{erro}</span>
      ) : (
        ajuda && <span className="ajuda">{ajuda}</span>
      )}
    </div>
  );
}
