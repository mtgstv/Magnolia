import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import LayoutAutenticacao from "../components/auth/LayoutAutenticacao";
import Botao from "../components/ui/Botao";
import CampoFormulario, { CampoSenha } from "../components/ui/CampoFormulario";
import { useAuth } from "../hooks/useAuth";

function validar(dados) {
  const erros = {};
  if (!dados.email.trim()) erros.email = "Informe seu e-mail.";
  if (!dados.senha) erros.senha = "Informe sua senha.";
  return erros;
}

export default function Login() {
  const { entrar } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Quem veio de outra página (ex.: tentou favoritar) volta para ela depois de entrar
  const destino = location.state?.de ?? "/";
  const aviso = location.state?.aviso;

  const [dados, setDados] = useState({ email: "", senha: "" });
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState(null);
  const [enviando, setEnviando] = useState(false);

  function alterar(evento) {
    const { name, value } = evento.target;
    setDados((atual) => ({ ...atual, [name]: value }));
    setErros((atual) => ({ ...atual, [name]: undefined }));
  }

  async function aoEnviar(evento) {
    evento.preventDefault();
    setErroGeral(null);

    const errosLocais = validar(dados);
    setErros(errosLocais);
    if (Object.keys(errosLocais).length > 0) return;

    setEnviando(true);
    try {
      await entrar(dados);
      navigate(destino, { replace: true });
    } catch (erro) {
      setErros(erro.campos ?? {});
      setErroGeral(erro.message);
      setEnviando(false);
    }
  }

  return (
    <LayoutAutenticacao titulo="Entrar" subtitulo="Que bom ter você de volta.">
      {aviso && !erroGeral && (
        <p className="mb-6 rounded-xl bg-marca-clara px-4 py-3 text-sm text-marca ring-1 ring-marca/20">{aviso}</p>
      )}

      {erroGeral && (
        <p role="alert" className="mb-6 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800 ring-1 ring-rose-200">
          {erroGeral}
        </p>
      )}

      <form noValidate onSubmit={aoEnviar} className="flex flex-col gap-5">
        <CampoFormulario
          id="login-email"
          name="email"
          type="email"
          rotulo="E-mail"
          autoComplete="email"
          value={dados.email}
          onChange={alterar}
          erro={erros.email}
        />

        <CampoSenha
          id="login-senha"
          name="senha"
          rotulo="Senha"
          autoComplete="current-password"
          value={dados.senha}
          onChange={alterar}
          erro={erros.senha}
        />

        <Botao type="submit" disabled={enviando} className="mt-2 h-12">
          {enviando ? "Entrando..." : "Entrar"}
        </Botao>
      </form>

      <p className="mt-8 text-center text-sm text-stone-600">
        Ainda não tem conta?{" "}
        <Link to="/cadastro" state={location.state} className="font-medium text-marca hover:text-destaque">
          Criar conta
        </Link>
      </p>
    </LayoutAutenticacao>
  );
}
