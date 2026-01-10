function Error({ statusCode }) {
  return (
    <div style={{textAlign:'center',marginTop:'20vh'}}>
      <h1>{statusCode ? `Error ${statusCode}` : 'Error desconocido'}</h1>
      <p>Ocurrió un error inesperado.</p>
    </div>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
