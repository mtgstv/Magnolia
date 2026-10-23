import { ErroApi } from "./api";

// ViaCEP: serviço gratuito que devolve o endereço de um CEP (https://viacep.com.br).
// Não passa pela nossa API e não envia cookies.
export async function buscarEndereco(cep) {
  const numeros = cep.replace(/\D/g, "");
  let resposta;
  try {
    resposta = await fetch(`https://viacep.com.br/ws/${numeros}/json/`);
  } catch {
    throw new ErroApi("Não foi possível consultar o CEP agora. Preencha o endereço manualmente.", 0);
  }

  const dados = resposta.ok ? await resposta.json() : null;
  if (!dados || dados.erro) {
    throw new ErroApi("CEP não encontrado. Confira os números.", 404);
  }

  return { rua: dados.logradouro, bairro: dados.bairro, cidade: dados.localidade, uf: dados.uf };
}
