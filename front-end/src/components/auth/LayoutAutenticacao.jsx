import magnolia from "../../assets/magnolia.jpg";

// Moldura das telas de login e cadastro: foto à esquerda (telas grandes) e formulário à direita
export default function LayoutAutenticacao({ titulo, subtitulo, children }) {
  return (
    <main className="bg-stone-50 py-12 md:py-20">
      <div className="conteudo">
        <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl shadow-stone-200/70 lg:grid-cols-2">
          <div className="relative hidden min-h-[600px] lg:block">
            <img src={magnolia} alt="" className="absolute inset-0 size-full object-cover" />
            <div className="absolute inset-0 bg-linear-to-t from-marca-escura/90 via-marca-escura/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-10 text-white">
              <p className="font-bodoni text-3xl leading-snug">“Cada perfume guarda uma memória.”</p>
              <p className="mt-3 text-sm text-white/80">
                Salve seus favoritos e receba sugestões feitas para o seu gosto.
              </p>
            </div>
          </div>

          <div className="px-6 py-10 sm:px-12 sm:py-14">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-marca-media">Magnolia</p>
            <h1 className="mt-2 font-bodoni text-4xl text-stone-900">{titulo}</h1>
            {subtitulo && <p className="mt-2 text-stone-500">{subtitulo}</p>}
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>
    </main>
  );
}
