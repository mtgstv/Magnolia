const IMAGEM_RESERVA = "/images/sem-imagem.svg";

// <img> que mostra uma imagem padrão quando a foto do produto não existe ou não carrega
export default function ImagemProduto({ src, alt, ...props }) {
  function usarReserva(evento) {
    if (!evento.currentTarget.src.endsWith(IMAGEM_RESERVA)) {
      evento.currentTarget.src = IMAGEM_RESERVA;
    }
  }

  return <img src={src ?? IMAGEM_RESERVA} alt={alt} onError={usarReserva} {...props} />;
}
