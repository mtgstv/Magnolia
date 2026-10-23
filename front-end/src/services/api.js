const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api/v1";

export async function requisicao(caminho) {
  let resposta;

  try {
    resposta = await fetch(`${API_URL}${caminho}`);
  } catch {
    throw new Error(
      "Não foi possível conectar ao servidor. Tente novamente."
    );
  }

  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => null);

    throw new Error(
      erro?.message ?? `Erro na requisição: ${resposta.status}`
    );
  }

  if (resposta.status === 204) {
    return null;
  }

  return resposta.json();
}