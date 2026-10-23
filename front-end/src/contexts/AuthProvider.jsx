import { useCallback, useEffect, useMemo, useState } from "react";

import { EVENTO_SESSAO_EXPIRADA } from "../services/api";
import {
  cadastrarUsuario,
  fazerLogout,
  loginUsuario,
  renovarSessao
} from "../services/authService";
import { AuthContext } from "./AuthContext";

export default function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  // true até descobrir se este navegador tem um login salvo
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    let ativo = true;

    renovarSessao().then((usuarioSalvo) => {
      if (ativo) {
        setUsuario(usuarioSalvo);
        setVerificando(false);
      }
    });

    const aoExpirar = () => setUsuario(null);
    window.addEventListener(EVENTO_SESSAO_EXPIRADA, aoExpirar);

    return () => {
      ativo = false;
      window.removeEventListener(EVENTO_SESSAO_EXPIRADA, aoExpirar);
    };
  }, []);

  const entrar = useCallback(async (credenciais) => {
    const usuarioLogado = await loginUsuario(credenciais);
    setUsuario(usuarioLogado);
    return usuarioLogado;
  }, []);

  const cadastrar = useCallback(async (dados) => {
    const novoUsuario = await cadastrarUsuario(dados);
    setUsuario(novoUsuario);
    return novoUsuario;
  }, []);

  // A tela volta na hora para o modo visitante; a API apaga os cookies em seguida.
  // O setUsuario acontece antes do primeiro await, então quem chama pode agrupá-lo
  // com uma navegação (ver MenuConta).
  const sair = useCallback(() => {
    setUsuario(null);
    return fazerLogout().catch(() => null);
  }, []);

  const valor = useMemo(
    () => ({ usuario, verificando, entrar, cadastrar, sair }),
    [usuario, verificando, entrar, cadastrar, sair]
  );

  return <AuthContext value={valor}>{children}</AuthContext>;
}
