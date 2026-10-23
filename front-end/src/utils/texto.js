// "Giò" e "gio" passam a ser encontrados da mesma forma
export function normalizarTexto(texto) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function primeiroNome(nomeCompleto) {
  return nomeCompleto.trim().split(/\s+/)[0];
}
