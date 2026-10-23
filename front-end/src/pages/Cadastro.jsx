import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Lock, Mail, User } from "lucide-react";

import LayoutAutenticacao from "../components/auth/LayoutAutenticacao";
import Botao from "../components/ui/Botao";
import CampoFormulario, { CampoSenha } from "../components/ui/CampoFormulario";
import { useAuth } from "../hooks/useAuth";

const TAMANHO_MINIMO_SENHA = 8;

// As mesmas regras da API (AuthDtos.CadastroRequest), para avisar antes de enviar
function validar(dados) {
  const erros = {};
  if (!dados.nome.trim()) erros.nome = "Informe seu nome.";
  if (!/^\S+@\S+\.\S+$/.test(dados.email.trim())) erros.email = "Informe um e-mail válido.";
  if (dados.senha.length < TAMANHO_MINIMO_SENHA) {
    erros.senha = `A senha deve ter pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.`;
  }
  if (dados.confirmacao !== dados.senha) erros.confirmacao = "As senhas não são iguais.";
  return erros;
}

export default function Cadastro() {
  const { cadastrar } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destino = location.state?.de ?? "/";

  const [dados, setDados] = useState({ nome: "", email: "", senha: "", confirmacao: "" });
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
      await cadastrar({ nome: dados.nome.trim(), email: dados.email.trim(), senha: dados.senha });
      navigate(destino, { replace: true });
    } catch (erro) {
      if (erro.status === 409) {
        // E-mail já cadastrado: a mensagem aparece no próprio campo
        setErros({ email: erro.message });
      } else {
        setErros(erro.campos ?? {});
        setErroGeral(erro.message);
      }
      setEnviando(false);
    }
  }

  return (
    <LayoutAutenticacao variante="cadastro" titulo="Criar conta" subtitulo="Leva menos de um minuto.">
      {erroGeral && (
        <p role="alert" className="mb-6 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800 ring-1 ring-rose-200">
          {erroGeral}
        </p>
      )}

      <form noValidate onSubmit={aoEnviar} className="flex flex-col gap-5">
        <CampoFormulario
          id="cadastro-nome"
          name="nome"
          rotulo="Nome"
          icone={User}
          placeholder="Como podemos te chamar?"
          autoComplete="name"
          value={dados.nome}
          onChange={alterar}
          erro={erros.nome}
        />

        <CampoFormulario
          id="cadastro-email"
          name="email"
          type="email"
          rotulo="E-mail"
          icone={Mail}
          placeholder="seu@email.com"
          autoComplete="email"
          value={dados.email}
          onChange={alterar}
          erro={erros.email}
        />

        <CampoSenha
          id="cadastro-senha"
          name="senha"
          rotulo="Senha"
          icone={Lock}
          autoComplete="new-password"
          value={dados.senha}
          onChange={alterar}
          erro={erros.senha}
          dica={`Use pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.`}
        />

        <CampoSenha
          id="cadastro-confirmacao"
          name="confirmacao"
          rotulo="Confirme a senha"
          icone={Lock}
          autoComplete="new-password"
          value={dados.confirmacao}
          onChange={alterar}
          erro={erros.confirmacao}
        />

        <Botao type="submit" disabled={enviando} className="mt-2 h-12">
          {enviando ? "Criando conta..." : "Criar conta"}
        </Botao>
      </form>

      <p className="mt-8 text-center text-sm text-stone-600">
        Já tem conta?{" "}
        <Link to="/login" state={location.state} className="font-medium text-marca hover:text-destaque">
          Entrar
        </Link>
      </p>
    </LayoutAutenticacao>
  );
}
