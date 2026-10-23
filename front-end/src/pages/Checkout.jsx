import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, CreditCard, Lock, MapPin, QrCode, ShoppingBag, Truck } from "lucide-react";

import ImagemProduto from "../components/produto/ImagemProduto";
import Botao from "../components/ui/Botao";
import CampoFormulario from "../components/ui/CampoFormulario";
import EstadoVazio from "../components/ui/EstadoVazio";
import Trilha from "../components/ui/Trilha";
import { useAuth } from "../hooks/useAuth";
import { useCarrinho } from "../hooks/useCarrinho";
import { calcularFrete } from "../services/carrinhoService";
import { buscarEndereco } from "../services/cepService";
import { criarPedido, listarPedidos } from "../services/pedidoService";
import { formatarPreco, precoAtual } from "../utils/preco";
import { ESTADOS, formatarCartao, formatarCep, formatarValidade } from "../utils/pedido";

const ENDERECO_VAZIO = { destinatario: "", cep: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "" };
const CARTAO_VAZIO = { numero: "", nome: "", validade: "", cvv: "", parcelas: "1" };

const classeCartao = "rounded-3xl bg-white p-6 shadow-xl shadow-stone-900/5 ring-1 ring-stone-900/5 sm:p-8";

function validar(endereco, metodo, cartao, frete) {
  const erros = {};
  if (!endereco.destinatario.trim()) erros["endereco.destinatario"] = "Informe quem vai receber.";
  if (endereco.cep.replace(/\D/g, "").length !== 8) erros["endereco.cep"] = "Informe um CEP com 8 números.";
  if (!endereco.rua.trim()) erros["endereco.rua"] = "Informe a rua.";
  if (!endereco.numero.trim()) erros["endereco.numero"] = "Informe o número (ou S/N).";
  if (!endereco.bairro.trim()) erros["endereco.bairro"] = "Informe o bairro.";
  if (!endereco.cidade.trim()) erros["endereco.cidade"] = "Informe a cidade.";
  if (!endereco.uf) erros["endereco.uf"] = "Escolha o estado.";
  if (!frete) erros.frete = "Escolha a forma de entrega.";
  if (metodo === "CARTAO") {
    if (cartao.numero.replace(/\D/g, "").length < 13) erros["pagamento.cartao.numero"] = "Informe o número do cartão.";
    if (!cartao.nome.trim()) erros["pagamento.cartao.nome"] = "Informe o nome impresso no cartão.";
    if (!/^\d{2}\/\d{2}$/.test(cartao.validade)) erros["pagamento.cartao.validade"] = "Use o formato MM/AA.";
    if (!/^\d{3,4}$/.test(cartao.cvv)) erros["pagamento.cartao.cvv"] = "3 ou 4 números.";
  }
  return erros;
}

// Só para quem está logado (ver RotaPrivada): endereço, entrega e pagamento numa página só
export default function Checkout() {
  const { usuario } = useAuth();
  const { itens, cupom, resumo, carregando, recarregar } = useCarrinho();
  const navigate = useNavigate();

  const [endereco, setEndereco] = useState({ ...ENDERECO_VAZIO, destinatario: usuario.nome });
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [avisoCep, setAvisoCep] = useState(null);
  const [opcoesFrete, setOpcoesFrete] = useState([]);
  const [frete, setFrete] = useState("PADRAO");
  const [metodo, setMetodo] = useState("PIX");
  const [cartao, setCartao] = useState(CARTAO_VAZIO);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const refNumero = useRef(null);

  async function carregarFrete(cep) {
    try {
      setOpcoesFrete(await calcularFrete(cep));
    } catch (erro) {
      setOpcoesFrete([]);
      setAvisoCep(erro.message);
    }
  }

  // Quem já comprou começa com o endereço da última compra
  useEffect(() => {
    let ativo = true;
    listarPedidos()
      .then((pedidos) => {
        const ultimo = pedidos[0]?.endereco;
        if (!ativo || !ultimo) return;
        setEndereco({ ...ultimo, cep: formatarCep(ultimo.cep), complemento: ultimo.complemento ?? "" });
        return calcularFrete(ultimo.cep).then((opcoes) => ativo && setOpcoesFrete(opcoes));
      })
      .catch(() => null);
    return () => {
      ativo = false;
    };
  }, []);

  function alterarEndereco(evento) {
    const { name, value } = evento.target;
    setEndereco((atual) => ({ ...atual, [name]: value }));
    setErros((atual) => ({ ...atual, [`endereco.${name}`]: undefined }));
  }

  // Com os 8 números do CEP, preenche o endereço pelo ViaCEP e calcula o frete
  async function alterarCep(evento) {
    const cep = formatarCep(evento.target.value);
    setEndereco((atual) => ({ ...atual, cep }));
    setErros((atual) => ({ ...atual, "endereco.cep": undefined }));
    setAvisoCep(null);

    const numeros = cep.replace(/\D/g, "");
    if (numeros.length !== 8) {
      setOpcoesFrete([]);
      return;
    }

    setBuscandoCep(true);
    carregarFrete(numeros);
    try {
      const achado = await buscarEndereco(numeros);
      setEndereco((atual) => ({
        ...atual,
        rua: achado.rua || atual.rua,
        bairro: achado.bairro || atual.bairro,
        cidade: achado.cidade,
        uf: achado.uf
      }));
      refNumero.current?.focus();
    } catch (erro) {
      setAvisoCep(erro.message);
    } finally {
      setBuscandoCep(false);
    }
  }

  function alterarCartao(evento) {
    const { name, value } = evento.target;
    const formatos = { numero: formatarCartao, validade: formatarValidade, cvv: (v) => v.replace(/\D/g, "").slice(0, 4) };
    setCartao((atual) => ({ ...atual, [name]: formatos[name] ? formatos[name](value) : value }));
    setErros((atual) => ({ ...atual, [`pagamento.cartao.${name}`]: undefined }));
  }

  async function finalizar(evento) {
    evento.preventDefault();
    setErroGeral(null);

    const errosLocais = validar(endereco, metodo, cartao, opcoesFrete.length > 0 ? frete : null);
    setErros(errosLocais);
    if (Object.keys(errosLocais).length > 0) {
      setErroGeral("Confira os campos destacados.");
      return;
    }

    setEnviando(true);
    try {
      const pedido = await criarPedido({
        endereco: { ...endereco, cep: endereco.cep.replace(/\D/g, "") },
        frete,
        pagamento:
          metodo === "CARTAO"
            ? { metodo, cartao: { ...cartao, numero: cartao.numero.replace(/\D/g, ""), parcelas: Number(cartao.parcelas) } }
            : { metodo }
      });
      recarregar();
      navigate(`/pedidos/${pedido.numero}`, { replace: true, state: { novo: true } });
    } catch (erro) {
      setErros(erro.campos ?? {});
      setErroGeral(erro.message);
      setEnviando(false);
      // Estoque ou preço podem ter mudado: mostra a sacola como está agora na API
      if (erro.status === 409) recarregar();
    }
  }

  if (!carregando && itens.length === 0 && !enviando) {
    return (
      <main className="conteudo py-12">
        <EstadoVazio icone={ShoppingBag} titulo="Sua sacola está vazia" texto="Escolha seus perfumes antes de finalizar a compra.">
          <Botao to="/catalogo">Explorar perfumes</Botao>
        </EstadoVazio>
      </main>
    );
  }

  const freteEscolhido = opcoesFrete.find((opcao) => opcao.tipo === frete);
  const valorFrete = freteEscolhido ? freteEscolhido.valor : null;
  const total = resumo.subtotal - resumo.desconto + (valorFrete ?? 0);
  const cupomSoPix = cupom?.codigo === "PIX5" && metodo !== "PIX";

  return (
    <main className="conteudo pt-8">
      <Trilha itens={[{ rotulo: "Início", para: "/" }, { rotulo: "Sacola", para: "/carrinho" }, { rotulo: "Finalizar compra" }]} />

      <header className="mt-6">
        <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-marca-media">
          <span className="h-px w-8 bg-marca-media/60" aria-hidden="true" />
          Quase lá
        </p>
        <h1 className="mt-3 font-bodoni text-4xl text-stone-900 md:text-5xl">Finalizar compra</h1>
      </header>

      <form noValidate onSubmit={finalizar} className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_400px] xl:gap-12">
        <div className="flex flex-col gap-6">
          {/* 1. Endereço */}
          <section className={classeCartao} aria-labelledby="titulo-endereco">
            <TituloEtapa numero={1} icone={MapPin} id="titulo-endereco">Endereço de entrega</TituloEtapa>

            <div className="mt-6 grid gap-5 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <CampoFormulario id="destinatario" name="destinatario" rotulo="Quem vai receber" autoComplete="name"
                  value={endereco.destinatario} onChange={alterarEndereco} erro={erros["endereco.destinatario"]} />
              </div>
              <div className="sm:col-span-2">
                <CampoFormulario id="cep" name="cep" rotulo="CEP" inputMode="numeric" autoComplete="postal-code"
                  placeholder="00000-000" value={endereco.cep} onChange={alterarCep}
                  erro={erros["endereco.cep"] ?? avisoCep} dica={buscandoCep ? "Buscando endereço..." : undefined} />
              </div>
              <p className="flex items-center text-sm text-stone-500 sm:col-span-4 sm:pt-6">
                <a href="https://buscacepinter.correios.com.br/" target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-marca">
                  Não sei meu CEP
                </a>
              </p>
              <div className="sm:col-span-4">
                <CampoFormulario id="rua" name="rua" rotulo="Rua" autoComplete="address-line1"
                  value={endereco.rua} onChange={alterarEndereco} erro={erros["endereco.rua"]} />
              </div>
              <div className="sm:col-span-2">
                <CampoFormulario id="numero" name="numero" rotulo="Número" ref={refNumero}
                  value={endereco.numero} onChange={alterarEndereco} erro={erros["endereco.numero"]} />
              </div>
              <div className="sm:col-span-3">
                <CampoFormulario id="complemento" name="complemento" rotulo="Complemento (opcional)" autoComplete="address-line2"
                  placeholder="Apto, bloco..." value={endereco.complemento} onChange={alterarEndereco} erro={erros["endereco.complemento"]} />
              </div>
              <div className="sm:col-span-3">
                <CampoFormulario id="bairro" name="bairro" rotulo="Bairro"
                  value={endereco.bairro} onChange={alterarEndereco} erro={erros["endereco.bairro"]} />
              </div>
              <div className="sm:col-span-4">
                <CampoFormulario id="cidade" name="cidade" rotulo="Cidade" autoComplete="address-level2"
                  value={endereco.cidade} onChange={alterarEndereco} erro={erros["endereco.cidade"]} />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label htmlFor="uf" className="text-sm font-medium text-stone-700">Estado</label>
                <select id="uf" name="uf" value={endereco.uf} onChange={alterarEndereco} autoComplete="address-level1"
                  aria-invalid={erros["endereco.uf"] ? true : undefined}
                  className={`h-12 w-full rounded-xl border bg-stone-50/70 px-4 text-stone-900 outline-none transition focus:bg-white focus:ring-4 ${
                    erros["endereco.uf"] ? "border-rose-400 focus:ring-rose-100" : "border-stone-300 focus:border-marca focus:ring-marca/15"
                  }`}>
                  <option value="">UF</option>
                  {ESTADOS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                </select>
                {erros["endereco.uf"] && <p className="text-sm text-oferta">{erros["endereco.uf"]}</p>}
              </div>
            </div>
          </section>

          {/* 2. Entrega */}
          <section className={classeCartao} aria-labelledby="titulo-entrega">
            <TituloEtapa numero={2} icone={Truck} id="titulo-entrega">Forma de entrega</TituloEtapa>
            {opcoesFrete.length === 0 ? (
              <p className={`mt-4 text-sm ${erros.frete ? "text-oferta" : "text-stone-500"}`}>
                Informe o CEP para ver as opções de entrega.
              </p>
            ) : (
              <div className="mt-5 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Forma de entrega">
                {opcoesFrete.map((opcao) => (
                  <Opcao key={opcao.tipo} selecionada={frete === opcao.tipo} aoEscolher={() => setFrete(opcao.tipo)}>
                    <span className="font-medium text-stone-900">{opcao.nome}</span>
                    <span className="text-sm text-stone-500">{opcao.prazo}</span>
                    <span className={`mt-1 text-sm font-semibold ${opcao.gratis ? "text-marca" : "text-stone-900"}`}>
                      {opcao.gratis ? "Grátis" : formatarPreco(opcao.valor)}
                    </span>
                  </Opcao>
                ))}
              </div>
            )}
          </section>

          {/* 3. Pagamento */}
          <section className={classeCartao} aria-labelledby="titulo-pagamento">
            <TituloEtapa numero={3} icone={CreditCard} id="titulo-pagamento">Pagamento</TituloEtapa>

            <div className="mt-5 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Forma de pagamento">
              <Opcao selecionada={metodo === "PIX"} aoEscolher={() => setMetodo("PIX")}>
                <span className="flex items-center gap-2 font-medium text-stone-900"><QrCode className="size-4 text-marca" /> Pix</span>
                <span className="text-sm text-stone-500">Aprovação na hora</span>
              </Opcao>
              <Opcao selecionada={metodo === "CARTAO"} aoEscolher={() => setMetodo("CARTAO")}>
                <span className="flex items-center gap-2 font-medium text-stone-900"><CreditCard className="size-4 text-marca" /> Cartão de crédito</span>
                <span className="text-sm text-stone-500">Em até 3x sem juros</span>
              </Opcao>
            </div>

            {metodo === "PIX" ? (
              <p className="mt-5 rounded-2xl bg-fundo px-4 py-3 text-sm text-stone-600">
                Depois de confirmar, mostramos o código Pix copia e cola para você pagar no app do seu banco.
              </p>
            ) : (
              <div className="mt-6 grid gap-5 sm:grid-cols-6">
                <p className="rounded-2xl bg-areia/70 px-4 py-3 text-sm text-stone-700 sm:col-span-6">
                  <strong>Ambiente de teste:</strong> nenhum valor é cobrado. Use o cartão 4111 1111 1111 1111 (aprovado)
                  ou 4000 0000 0000 0002 (recusado), com qualquer nome, validade futura e CVV.
                </p>
                <div className="sm:col-span-6">
                  <CampoFormulario id="cartao-numero" name="numero" rotulo="Número do cartão" inputMode="numeric" autoComplete="cc-number"
                    placeholder="0000 0000 0000 0000" value={cartao.numero} onChange={alterarCartao} erro={erros["pagamento.cartao.numero"]} />
                </div>
                <div className="sm:col-span-6">
                  <CampoFormulario id="cartao-nome" name="nome" rotulo="Nome impresso no cartão" autoComplete="cc-name"
                    value={cartao.nome} onChange={alterarCartao} erro={erros["pagamento.cartao.nome"]} />
                </div>
                <div className="sm:col-span-2">
                  <CampoFormulario id="cartao-validade" name="validade" rotulo="Validade" inputMode="numeric" autoComplete="cc-exp"
                    placeholder="MM/AA" value={cartao.validade} onChange={alterarCartao} erro={erros["pagamento.cartao.validade"]} />
                </div>
                <div className="sm:col-span-2">
                  <CampoFormulario id="cartao-cvv" name="cvv" rotulo="CVV" inputMode="numeric" autoComplete="cc-csc"
                    placeholder="123" value={cartao.cvv} onChange={alterarCartao} erro={erros["pagamento.cartao.cvv"]} />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label htmlFor="cartao-parcelas" className="text-sm font-medium text-stone-700">Parcelas</label>
                  <select id="cartao-parcelas" name="parcelas" value={cartao.parcelas} onChange={alterarCartao}
                    className="h-12 w-full rounded-xl border border-stone-300 bg-stone-50/70 px-4 text-stone-900 outline-none transition focus:border-marca focus:bg-white focus:ring-4 focus:ring-marca/15">
                    {[1, 2, 3].map((n) => (
                      <option key={n} value={n}>{n}x de {formatarPreco(Math.ceil(total / n))}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Resumo */}
        <aside className={`${classeCartao} lg:sticky lg:top-6`}>
          <h2 className="font-bodoni text-2xl text-stone-900">Seu pedido</h2>

          <ul className="mt-5 flex flex-col gap-4">
            {itens.map((item) => (
              <li key={item.varianteId} className="flex items-center gap-3">
                <ImagemProduto src={item.imagem} alt="" className="h-16 w-14 shrink-0 rounded-xl bg-areia object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bodoni text-base text-stone-900">{item.nome}</p>
                  <p className="text-xs text-stone-500">{item.volumeMl} ml · {item.quantidade}x</p>
                </div>
                <p className="text-sm font-semibold text-stone-800">{formatarPreco(precoAtual(item) * item.quantidade)}</p>
              </li>
            ))}
          </ul>

          <dl className="mt-6 flex flex-col gap-3 border-t border-stone-100 pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-stone-600">Subtotal</dt>
              <dd className="font-medium text-stone-900">{formatarPreco(resumo.subtotal)}</dd>
            </div>
            {resumo.desconto > 0 && (
              <div className="flex justify-between">
                <dt className="text-stone-600">Cupom {cupom?.codigo}</dt>
                <dd className="font-medium text-marca">-{formatarPreco(resumo.desconto)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-stone-600">Entrega</dt>
              <dd className="font-medium text-stone-900">
                {valorFrete == null ? "Informe o CEP" : valorFrete === 0 ? "Grátis" : formatarPreco(valorFrete)}
              </dd>
            </div>
            <div className="mt-2 flex items-baseline justify-between border-t border-stone-100 pt-4">
              <dt className="font-semibold text-stone-900">Total</dt>
              <dd className="font-bodoni text-3xl text-stone-900">{formatarPreco(total)}</dd>
            </div>
          </dl>

          {cupomSoPix && (
            <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200">
              O cupom PIX5 vale só no Pix. Escolha Pix ou{" "}
              <Link to="/carrinho" className="font-semibold underline underline-offset-4">tire o cupom na sacola</Link>.
            </p>
          )}

          {erroGeral && (
            <p role="alert" className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800 ring-1 ring-rose-200">
              {erroGeral}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando || carregando}
            className="mt-6 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-marca py-4 text-sm font-semibold uppercase tracking-widest text-white shadow-lg shadow-marca/20 transition-colors duration-300 hover:bg-marca-escura disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Lock className="size-4" />
            {enviando ? "Confirmando..." : "Confirmar pedido"}
          </button>
          <p className="mt-3 text-center text-xs text-stone-500">Pagamento simulado: nenhum valor real é cobrado.</p>
        </aside>
      </form>
    </main>
  );
}

function TituloEtapa({ numero, icone: Icone, id, children }) {
  return (
    <h2 id={id} className="flex items-center gap-3 font-bodoni text-2xl text-stone-900">
      <span className="flex size-9 items-center justify-center rounded-full bg-marca-clara font-inter text-sm font-semibold text-marca">
        {numero}
      </span>
      {children}
      <Icone className="ml-auto size-5 text-stone-400" strokeWidth={1.5} aria-hidden="true" />
    </h2>
  );
}

// Cartão clicável que funciona como um botão de rádio (entrega e pagamento)
function Opcao({ selecionada, aoEscolher, children }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selecionada}
      onClick={aoEscolher}
      className={`relative flex flex-col items-start gap-0.5 rounded-2xl border px-4 py-3 text-left transition ${
        selecionada ? "border-marca bg-marca-clara ring-1 ring-marca" : "border-stone-300 hover:border-stone-500"
      }`}
    >
      {selecionada && (
        <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-marca text-white">
          <Check className="size-3" strokeWidth={3} />
        </span>
      )}
      {children}
    </button>
  );
}
