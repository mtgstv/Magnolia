const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api/v1";

// Disparado quando o login expira de vez; o AuthProvider escuta e desloga a pessoa
export const EVENTO_SESSAO_EXPIRADA = "magnolia:sessao-expirada";

// status 0 = sem conexão com o servidor. campos = erros de cada campo de um formulário.
export class ErroApi extends Error {
  constructor(mensagem, status, campos = null) {
    super(mensagem);
    this.name = "ErroApi";
    this.status = status;
    this.campos = campos;
  }
}

async function enviar(caminho, opcoes) {
  try {
    // credentials: "include" envia os cookies de login (HttpOnly) junto
    return await fetch(`${API_URL}${caminho}`, { credentials: "include", ...opcoes });
  } catch {
    throw new ErroApi("Não foi possível conectar ao servidor. Tente novamente.", 0);
  }
}

async function lerResposta(resposta) {
  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => null);

    throw new ErroApi(
      erro?.message ?? `Erro na requisição: ${resposta.status}`,
      resposta.status,
      erro?.campos ?? null
    );
  }

  if (resposta.status === 204) {
    return null;
  }

  return resposta.json();
}

let renovacaoEmAndamento = null;

// Usa o login salvo neste navegador para pedir um novo token de acesso.
// Devolve o usuário logado, ou null se não houver login salvo (ou se ele venceu).
// Chamadas simultâneas compartilham a mesma requisição.
export function renovarSessao() {
  renovacaoEmAndamento ??= enviar("/auth/refresh", { method: "POST" })
    .then(lerResposta)
    .catch(() => null)
    .finally(() => {
      renovacaoEmAndamento = null;
    });

  return renovacaoEmAndamento;
}

// corpo: objeto enviado como JSON. As outras opções vão direto para o fetch.
export async function requisicao(caminho, { corpo, ...opcoes } = {}) {
  const config = { ...opcoes };

  if (corpo !== undefined) {
    config.headers = { "Content-Type": "application/json", ...opcoes.headers };
    config.body = JSON.stringify(corpo);
  }

  let resposta = await enviar(caminho, config);

  // O token de acesso dura 15 minutos: quando vence, renova o login e tenta de novo uma vez.
  // As rotas de /auth tratam o próprio 401 (ex.: senha errada).
  if (resposta.status === 401 && !caminho.startsWith("/auth/")) {
    if (await renovarSessao()) {
      resposta = await enviar(caminho, config);
    } else {
      window.dispatchEvent(new Event(EVENTO_SESSAO_EXPIRADA));
    }
  }

  return lerResposta(resposta);
}
