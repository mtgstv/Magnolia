import Botao from "../components/ui/Botao";

export default function NaoEncontrado({
    titulo = "Página não encontrada",
    mensagem = "O endereço que você acessou não existe ou foi removido."
}) {
    return (
        <main className="conteudo py-24 flex flex-col items-center gap-4 text-center">
            <span className="text-xs uppercase tracking-[0.3em] text-marca-media">
                Erro 404
            </span>
            <h1 className="text-4xl font-bodoni">{titulo}</h1>
            <p className="text-stone-600">{mensagem}</p>
            <Botao to="/catalogo" className="mt-2">
                Ver catálogo
            </Botao>
        </main>
    )
}
