import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

// Campo com rótulo, dica e mensagem de erro ligados ao input (acessível para leitores de tela)
export default function CampoFormulario({ id, rotulo, erro, dica, acessorio, ...props }) {
  const idMensagem = `${id}-mensagem`;
  const mensagem = erro ?? dica;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-stone-700">
        {rotulo}
      </label>

      <div className="relative">
        <input
          id={id}
          aria-invalid={erro ? true : undefined}
          aria-describedby={mensagem ? idMensagem : undefined}
          className={`h-12 w-full rounded-xl border bg-white px-4 text-stone-900 outline-none transition placeholder:text-stone-400 focus:ring-4 ${
            acessorio ? "pr-12" : ""
          } ${
            erro
              ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
              : "border-stone-300 focus:border-marca focus:ring-marca/15"
          }`}
          {...props}
        />
        {acessorio}
      </div>

      {mensagem && (
        <p id={idMensagem} className={erro ? "text-sm text-oferta" : "text-xs text-stone-500"}>
          {mensagem}
        </p>
      )}
    </div>
  );
}

export function CampoSenha(props) {
  const [visivel, setVisivel] = useState(false);
  const Icone = visivel ? EyeOff : Eye;

  return (
    <CampoFormulario
      {...props}
      type={visivel ? "text" : "password"}
      acessorio={
        <button
          type="button"
          onClick={() => setVisivel((atual) => !atual)}
          aria-label={visivel ? "Esconder senha" : "Mostrar senha"}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-stone-500 hover:text-marca"
        >
          <Icone className="size-5" strokeWidth={1.5} />
        </button>
      }
    />
  );
}
