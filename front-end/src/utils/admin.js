// Conversões dos formulários do painel admin

// 64990 -> "649,90" (para mostrar num campo de texto)
export function centavosParaTexto(centavos) {
  if (centavos == null) return "";
  return (centavos / 100).toFixed(2).replace(".", ",");
}

// "649,90", "649.90" ou "R$ 1.299,90" -> centavos. Vazio -> null. Texto inválido -> NaN.
export function textoParaCentavos(texto) {
  const limpo = String(texto).replace(/[R$\s]/g, "");
  if (limpo === "") return null;
  // Com vírgula, os pontos são separadores de milhar (1.299,90)
  const numero = limpo.includes(",") ? Number(limpo.replace(/\./g, "").replace(",", ".")) : Number(limpo);
  return Number.isFinite(numero) && numero >= 0 ? Math.round(numero * 100) : NaN;
}

// Instant da API (ISO) <-> valor de <input type="datetime-local"> no horário do navegador
export function isoParaCampoData(iso) {
  if (!iso) return "";
  const data = new Date(iso);
  const local = new Date(data.getTime() - data.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export function campoDataParaIso(valor) {
  return valor ? new Date(valor).toISOString() : null;
}
