import { X } from "lucide-react";

// Um "chip" por filtro aplicado; clicar no X remove só aquele filtro
export default function FiltrosAtivos({ filtros, atualizar, categorias, marcas, aoLimpar }) {
  const chips = [];

  if (filtros.busca) {
    chips.push({ rotulo: `“${filtros.busca}”`, remover: () => atualizar({ busca: "" }) });
  }
  if (filtros.categoria) {
    const categoria = categorias.find((item) => item.slug === filtros.categoria);
    chips.push({ rotulo: categoria?.nome ?? filtros.categoria, remover: () => atualizar({ categoria: "" }) });
  }
  filtros.familias.forEach((familia) => {
    chips.push({
      rotulo: familia,
      remover: () => atualizar({ familias: filtros.familias.filter((item) => item !== familia) })
    });
  });
  filtros.marcas.forEach((slug) => {
    const marca = marcas.find((item) => item.slug === slug);
    chips.push({
      rotulo: marca?.nome ?? slug,
      remover: () => atualizar({ marcas: filtros.marcas.filter((item) => item !== slug) })
    });
  });
  if (filtros.precoMinimo || filtros.precoMaximo) {
    chips.push({
      rotulo: descreverFaixa(filtros.precoMinimo, filtros.precoMaximo),
      remover: () => atualizar({ precoMinimo: "", precoMaximo: "" })
    });
  }
  if (filtros.somentePromocao) {
    chips.push({ rotulo: "Com desconto", remover: () => atualizar({ somentePromocao: false }) });
  }

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.rotulo}
          type="button"
          onClick={chip.remover}
          aria-label={`Remover filtro ${chip.rotulo}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-marca-clara px-3 py-1.5 text-sm text-marca ring-1 ring-marca/20 transition-colors hover:bg-marca-suave"
        >
          {chip.rotulo}
          <X className="size-3.5" />
        </button>
      ))}

      <button
        type="button"
        onClick={aoLimpar}
        className="px-2 text-sm text-stone-500 underline underline-offset-4 hover:text-stone-800"
      >
        Limpar tudo
      </button>
    </div>
  );
}

function descreverFaixa(minimo, maximo) {
  if (minimo && maximo) return `R$ ${minimo} a R$ ${maximo}`;
  if (minimo) return `A partir de R$ ${minimo}`;
  return `Até R$ ${maximo}`;
}
