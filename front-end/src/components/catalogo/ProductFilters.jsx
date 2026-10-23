// Filtros da lateral do catálogo (no celular, aparecem dentro da GavetaFiltros).
// "prefixo" diferencia os nomes dos campos quando há duas cópias na tela.
export default function ProductFilters({
  prefixo,
  filtros,
  atualizar,
  categorias,
  marcas,
  familias,
  contagens
}) {
  function alternar(campo, valor) {
    const atuais = filtros[campo];
    atualizar({
      [campo]: atuais.includes(valor) ? atuais.filter((item) => item !== valor) : [...atuais, valor]
    });
  }

  return (
    <div className="divide-y divide-stone-200">
      <GrupoFiltro titulo="Categoria">
        <Opcao
          tipo="radio"
          nome={`${prefixo}-categoria`}
          rotulo="Todas"
          marcado={filtros.categoria === ""}
          aoMudar={() => atualizar({ categoria: "" })}
        />
        {categorias.map((categoria) => (
          <Opcao
            key={categoria.slug}
            tipo="radio"
            nome={`${prefixo}-categoria`}
            rotulo={categoria.nome}
            total={contagens.categorias.get(categoria.slug) ?? 0}
            marcado={filtros.categoria === categoria.slug}
            aoMudar={() => atualizar({ categoria: categoria.slug })}
          />
        ))}
      </GrupoFiltro>

      <GrupoFiltro titulo="Família olfativa">
        {familias.map((familia) => (
          <Opcao
            key={familia}
            rotulo={familia}
            total={contagens.familias.get(familia) ?? 0}
            marcado={filtros.familias.includes(familia)}
            aoMudar={() => alternar("familias", familia)}
          />
        ))}
      </GrupoFiltro>

      <GrupoFiltro titulo="Marca" rolavel>
        {marcas.map((marca) => (
          <Opcao
            key={marca.slug}
            rotulo={marca.nome}
            total={contagens.marcas.get(marca.slug) ?? 0}
            marcado={filtros.marcas.includes(marca.slug)}
            aoMudar={() => alternar("marcas", marca.slug)}
          />
        ))}
      </GrupoFiltro>

      <GrupoFiltro titulo="Faixa de preço">
        <li className="flex items-center gap-2">
          <CampoPreco
            rotulo="Preço mínimo"
            placeholder="Mínimo"
            valor={filtros.precoMinimo}
            aoMudar={(valor) => atualizar({ precoMinimo: valor })}
          />
          <span className="text-stone-400">–</span>
          <CampoPreco
            rotulo="Preço máximo"
            placeholder="Máximo"
            valor={filtros.precoMaximo}
            aoMudar={(valor) => atualizar({ precoMaximo: valor })}
          />
        </li>
      </GrupoFiltro>

      <GrupoFiltro titulo="Ofertas">
        <Opcao
          rotulo="Somente com desconto"
          marcado={filtros.somentePromocao}
          aoMudar={() => atualizar({ somentePromocao: !filtros.somentePromocao })}
        />
      </GrupoFiltro>
    </div>
  );
}

// O espaçamento fica numa div: padding direto no <fieldset> abre um vão estranho embaixo do <legend>
function GrupoFiltro({ titulo, rolavel = false, children }) {
  return (
    <div className="py-5 first:pt-0">
      <fieldset>
        <legend className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-stone-900">{titulo}</legend>
        <ul className={`flex flex-col gap-2.5 ${rolavel ? "max-h-60 overflow-y-auto pr-2" : ""}`}>{children}</ul>
      </fieldset>
    </div>
  );
}

function Opcao({ tipo = "checkbox", nome, rotulo, total, marcado, aoMudar }) {
  return (
    <li>
      <label className="flex cursor-pointer items-center gap-3 text-sm text-stone-700 transition-colors hover:text-stone-950">
        <input type={tipo} name={nome} checked={marcado} onChange={aoMudar} className="size-4 accent-marca" />
        <span className="flex-1">{rotulo}</span>
        {total != null && <span className="text-xs text-stone-400">{total}</span>}
      </label>
    </li>
  );
}

function CampoPreco({ rotulo, placeholder, valor, aoMudar }) {
  return (
    <label className="relative flex-1">
      <span className="sr-only">{rotulo}</span>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">R$</span>
      <input
        type="number"
        min="0"
        inputMode="numeric"
        placeholder={placeholder}
        value={valor}
        onChange={(evento) => aoMudar(evento.target.value)}
        className="h-10 w-full min-w-0 rounded-lg border border-stone-300 pl-9 pr-2 text-sm outline-none transition focus:border-marca focus:ring-4 focus:ring-marca/15"
      />
    </label>
  );
}
